<template>
  <CrudView
    titulo="Vagas"
    subtitulo="Vagas abertas nos projetos. Ficam no site, na página Participe, até o fim do prazo."
    entidade="Vaga"
    feminino
    :servico="vagas"
    :campos="campos"
    :formulario-padrao="formularioPadrao"
    :para-formulario="paraFormulario"
    :para-payload="paraPayload"
  >
    <template #cell(titulo)="{ item }">
      <span class="d-inline-block text-truncate i2a-celula-titulo">{{ item.titulo }}</span>
    </template>

    <template #cell(projeto)="{ item }">
      <span class="d-inline-block text-truncate i2a-celula-titulo">
        {{ item.projeto?.titulo ?? '—' }}
      </span>
    </template>

    <template #cell(prazo)="{ item }">
      <span class="text-nowrap">{{ formatarData(item.prazo) }}</span>
      <BBadge :variant="vagaAberta(item) ? 'success' : 'secondary'" class="ms-2">
        {{ vagaAberta(item) ? 'Aberta' : 'Encerrada' }}
      </BBadge>
    </template>

    <template #cell(candidaturas)="{ item }">
      <BButton size="sm" variant="outline-primary" class="text-nowrap" @click="abrirCandidaturas(item)">
        <i class="bi bi-person-lines-fill me-1" />{{ item.total_candidaturas ?? 0 }}
      </BButton>
    </template>

    <template #formulario="{ form }">
      <BRow class="g-3">
        <BCol cols="12">
          <BFormGroup label="Título" label-for="titulo">
            <BFormInput
              id="titulo"
              v-model="form.titulo"
              required
              maxlength="255"
              placeholder="Ex.: Bolsa de Iniciação Científica (PIBIC)"
            />
          </BFormGroup>
        </BCol>
        <BCol cols="12">
          <BFormGroup
            label="Projeto"
            label-for="projeto"
            :description="
              opcoesProjetos.length
                ? 'A vaga é divulgada junto com o projeto e o coordenador.'
                : 'Você ainda não coordena nenhum projeto — cadastre o projeto antes de abrir a vaga.'
            "
          >
            <BFormSelect id="projeto" v-model="form.projetos_id" :options="opcoesProjetos" required>
              <template #first>
                <BFormSelectOption :value="null" disabled>Selecione o projeto…</BFormSelectOption>
              </template>
            </BFormSelect>
          </BFormGroup>
        </BCol>
        <BCol cols="12">
          <BFormGroup
            label="Descrição"
            label-for="descricao"
            description="Atividades, requisitos, carga horária, bolsa. Quebras de linha são preservadas no site."
          >
            <BFormTextarea id="descricao" v-model="form.descricao" rows="8" />
          </BFormGroup>
        </BCol>
        <BCol md="6">
          <BFormGroup
            label="Inscrições até"
            label-for="prazo"
            description="A vaga sai do site depois deste dia."
          >
            <BFormInput id="prazo" v-model="form.prazo" type="date" required />
          </BFormGroup>
        </BCol>
        <BCol md="6">
          <BFormGroup label="Quantidade de vagas" label-for="quantidade">
            <BFormInput
              id="quantidade"
              v-model.number="form.quantidade"
              type="number"
              min="1"
              max="999"
              required
            />
          </BFormGroup>
        </BCol>
      </BRow>
    </template>
  </CrudView>

  <!-- candidaturas recebidas -->
  <BModal
    v-model="modalCandidaturas"
    :title="vagaSelecionada ? `Candidaturas — ${vagaSelecionada.titulo}` : 'Candidaturas'"
    size="lg"
    ok-only
    ok-title="Fechar"
    @hidden="recarregarSeMudou"
  >
    <CarregandoBloco v-if="carregandoCandidaturas" />

    <EstadoVazio
      v-else-if="!listaCandidaturas.length"
      icone="bi-inbox"
      titulo="Nenhuma candidatura ainda"
      descricao="As inscrições feitas no site aparecem aqui."
    />

    <template v-else>
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <span class="i2a-meta">{{ listaCandidaturas.length }} candidatura(s), por ordem de chegada</span>
        <a :href="mailtoTodos" class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-envelope me-1" />Escrever para todos
        </a>
      </div>

      <BTable :items="listaCandidaturas" :fields="camposCandidaturas" responsive small hover class="align-middle mb-0">
        <template #cell(email)="{ item }">
          <a :href="`mailto:${item.email}`">{{ item.email }}</a>
        </template>
        <template #cell(criado_em)="{ item }">
          <span class="text-nowrap">{{ formatarDataHora(item.criado_em) }}</span>
        </template>
        <template #cell(acoes)="{ item }">
          <div class="text-end">
            <BButton size="sm" variant="outline-danger" title="Remover candidatura" @click="removerCandidatura(item)">
              <i class="bi bi-trash" />
            </BButton>
          </div>
        </template>
      </BTable>
    </template>
  </BModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  BRow,
  BCol,
  BFormGroup,
  BFormInput,
  BFormTextarea,
  BFormSelect,
  BFormSelectOption,
  BBadge,
  BButton,
  BModal,
  BTable,
  useToast
} from 'bootstrap-vue-next';

import CrudView from '@/components/admin/CrudView.vue';
import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { vagas, projetos } from '@/services/adminService';
import { mensagemDeErro } from '@/services/http';
import {
  formatarData,
  formatarDataHora,
  vagaAberta,
  paraInputDate,
  fimDoDia
} from '@/utils/formatadores';

const toast = useToast();

const campos = [
  { key: 'titulo', label: 'Título' },
  { key: 'projeto', label: 'Projeto' },
  { key: 'prazo', label: 'Prazo' },
  { key: 'quantidade', label: 'Vagas' },
  { key: 'candidaturas', label: 'Candidaturas' }
];

// a API só devolve os projetos que o usuário pode usar (admin: todos; pesquisador: os que coordena)
const opcoesProjetos = ref([]);

const formularioPadrao = () => ({
  titulo: '',
  descricao: '',
  projetos_id: null,
  prazo: '',
  quantidade: 1
});

const paraFormulario = (item) => ({
  titulo: item.titulo,
  descricao: item.descricao ?? '',
  projetos_id: item.projetos_id,
  prazo: paraInputDate(item.prazo),
  quantidade: item.quantidade
});

// o prazo vale até o fim do dia escolhido
const paraPayload = (form) => ({ ...form, prazo: fimDoDia(form.prazo) });

/* ------------------------- candidaturas ------------------------- */
const camposCandidaturas = [
  { key: 'nome', label: 'Nome' },
  { key: 'matricula', label: 'Matrícula' },
  { key: 'email', label: 'E-mail acadêmico' },
  { key: 'criado_em', label: 'Enviada em' },
  { key: 'acoes', label: '' }
];

const modalCandidaturas = ref(false);
const vagaSelecionada = ref(null);
const listaCandidaturas = ref([]);
const carregandoCandidaturas = ref(false);
const houveRemocao = ref(false);

const mailtoTodos = computed(
  () => `mailto:?bcc=${listaCandidaturas.value.map((c) => c.email).join(',')}`
);

async function abrirCandidaturas(vaga) {
  vagaSelecionada.value = vaga;
  listaCandidaturas.value = [];
  houveRemocao.value = false;
  modalCandidaturas.value = true;
  carregandoCandidaturas.value = true;
  try {
    const { data } = await vagas.candidaturas(vaga.id);
    listaCandidaturas.value = data;
  } catch (e) {
    toast.create({ title: 'Erro', body: mensagemDeErro(e), variant: 'danger' });
  } finally {
    carregandoCandidaturas.value = false;
  }
}

async function removerCandidatura(candidatura) {
  if (!window.confirm(`Remover a candidatura de "${candidatura.nome}"?`)) return;
  try {
    await vagas.removerCandidatura(vagaSelecionada.value.id, candidatura.id);
    listaCandidaturas.value = listaCandidaturas.value.filter((c) => c.id !== candidatura.id);
    houveRemocao.value = true;
  } catch (e) {
    toast.create({ title: 'Erro', body: mensagemDeErro(e), variant: 'danger' });
  }
}

// atualiza o contador da tabela quando alguma candidatura foi removida
function recarregarSeMudou() {
  if (houveRemocao.value) vagaSelecionada.value.total_candidaturas = listaCandidaturas.value.length;
}

onMounted(async () => {
  const { data } = await projetos.listar({ limit: 100 });
  opcoesProjetos.value = data.map((p) => ({ value: p.id, text: p.titulo }));
});
</script>
