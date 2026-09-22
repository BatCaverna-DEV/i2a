<template>
  <CrudView
    titulo="Projetos"
    subtitulo="Projetos de pesquisa, extensão, desenvolvimento e ensino do grupo"
    entidade="Projeto"
    :servico="projetos"
    :campos="campos"
    :formulario-padrao="formularioPadrao"
    :para-formulario="paraFormulario"
  >
    <template #cell(titulo)="{ item }">
      <span class="d-inline-block text-truncate" style="max-width: 32rem">{{ item.titulo }}</span>
    </template>

    <template #cell(status)="{ item }">
      <BBadge :variant="STATUS_PROJETO[item.status]?.variante ?? 'secondary'">
        {{ STATUS_PROJETO[item.status]?.rotulo ?? '—' }}
      </BBadge>
    </template>

    <template #cell(tipo)="{ item }">
      {{ TIPO_PROJETO[item.tipo] ?? '—' }}
    </template>

    <template #cell(coordenador)="{ item }">
      {{ item.coordenador?.nome ?? '—' }}
    </template>

    <template #cell(equipe)="{ item }">
      {{ item.equipe?.length ?? 0 }}
    </template>

    <template #formulario="{ form }">
      <BRow class="g-3">
        <BCol cols="12">
          <BFormGroup label="Título" label-for="titulo">
            <BFormInput id="titulo" v-model="form.titulo" required maxlength="255" />
            <p class="i2a-meta mb-0 mt-1 text-end">
              {{ (form.titulo ?? '').length }}/255
            </p>
          </BFormGroup>
        </BCol>
        <BCol cols="12">
          <BFormGroup
            label="Resumo"
            label-for="resumo"
            description="Texto livre. Quebras de linha são preservadas na página pública."
          >
            <BFormTextarea id="resumo" v-model="form.resumo" rows="8" />
            <p class="i2a-meta mb-0 mt-1 text-end">
              {{ (form.resumo ?? '').length }} caracteres
            </p>
          </BFormGroup>
        </BCol>
        <BCol md="4">
          <BFormGroup label="Situação" label-for="status">
            <BFormSelect id="status" v-model.number="form.status" :options="opcoesStatus" />
          </BFormGroup>
        </BCol>
        <BCol md="4">
          <BFormGroup label="Tipo" label-for="tipo">
            <BFormSelect id="tipo" v-model.number="form.tipo" :options="opcoesTipo" />
          </BFormGroup>
        </BCol>
        <BCol md="4">
          <BFormGroup label="Coordenador" label-for="coordenador">
            <BFormSelect id="coordenador" v-model="form.pesquisador_id" :options="opcoesPesquisadores" />
          </BFormGroup>
        </BCol>

        <!-- orientandos (tabela orientacacoes) -->
        <BCol cols="12">
          <hr class="i2a-rule my-2" />
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="form-label mb-0">
              Orientandos
              <span v-if="form.orientandos?.length" class="i2a-meta">
                · {{ form.orientandos.length }} selecionado(s)
              </span>
            </span>
            <BButton
              v-if="!novoOrientando.aberto"
              size="sm"
              variant="outline-primary"
              @click="abrirNovoOrientando"
            >
              <i class="bi bi-person-plus me-1" />Cadastrar orientando
            </BButton>
          </div>

          <p v-if="opcoesOrientandos.length === 0" class="i2a-meta mb-0">
            Nenhum orientando cadastrado ainda. Use “Cadastrar orientando” para criar o primeiro.
          </p>
          <template v-else>
            <BFormInput
              v-if="opcoesOrientandos.length > 8"
              v-model="buscaOrientando"
              size="sm"
              class="mb-2"
              placeholder="Filtrar orientandos…"
            />
            <div class="border rounded p-2" style="max-height: 12rem; overflow-y: auto">
              <BFormCheckboxGroup
                v-model="form.orientandos"
                :options="orientandosFiltrados"
                stacked
              />
              <p v-if="orientandosFiltrados.length === 0" class="i2a-meta mb-0">
                Nenhum orientando com esse nome.
              </p>
            </div>
          </template>

          <!-- cadastro rápido: cria pesquisador + conta do tipo Orientando -->
          <div v-if="novoOrientando.aberto" class="border rounded p-3 mt-2 bg-body-tertiary">
            <p class="fw-semibold mb-2">Novo orientando</p>
            <BAlert :model-value="Boolean(novoOrientando.erro)" variant="danger" class="py-2 small">
              {{ novoOrientando.erro }}
            </BAlert>
            <BRow class="g-2">
              <BCol md="8">
                <BFormGroup label="Nome" label-for="orientando-nome">
                  <BFormInput
                    id="orientando-nome"
                    v-model="novoOrientando.nome"
                    size="sm"
                    maxlength="100"
                  />
                </BFormGroup>
              </BCol>
              <BCol md="4">
                <BFormGroup label="Matrícula" label-for="orientando-matricula">
                  <BFormInput
                    id="orientando-matricula"
                    v-model="novoOrientando.matricula"
                    size="sm"
                    maxlength="20"
                  />
                </BFormGroup>
              </BCol>
              <BCol cols="12">
                <BFormGroup
                  label="E-mail"
                  label-for="orientando-email"
                  description="E-mail da conta Google que o orientando usará para entrar."
                >
                  <BFormInput
                    id="orientando-email"
                    v-model="novoOrientando.email"
                    type="email"
                    size="sm"
                    maxlength="100"
                  />
                </BFormGroup>
              </BCol>
            </BRow>
            <div class="text-end mt-2">
              <BButton
                size="sm"
                variant="link"
                class="me-1"
                :disabled="novoOrientando.salvando"
                @click="novoOrientando.aberto = false"
              >
                Cancelar
              </BButton>
              <BButton
                size="sm"
                variant="primary"
                :disabled="novoOrientando.salvando"
                @click="cadastrarOrientando(form)"
              >
                {{ novoOrientando.salvando ? 'Salvando…' : 'Cadastrar e incluir no projeto' }}
              </BButton>
            </div>
          </div>
        </BCol>
      </BRow>
    </template>
  </CrudView>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import {
  BRow,
  BCol,
  BButton,
  BAlert,
  BFormGroup,
  BFormInput,
  BFormTextarea,
  BFormSelect,
  BFormCheckboxGroup,
  BBadge
} from 'bootstrap-vue-next';

import CrudView from '@/components/admin/CrudView.vue';
import { projetos, pesquisadores } from '@/services/adminService';
import { mensagemDeErro } from '@/services/http';
import { CATEGORIA } from '@/stores/auth';
import { STATUS_PROJETO, TIPO_PROJETO } from '@/utils/formatadores';

const campos = [
  { key: 'titulo', label: 'Título', sortable: true },
  { key: 'tipo', label: 'Tipo' },
  { key: 'status', label: 'Situação' },
  { key: 'coordenador', label: 'Coordenador' },
  { key: 'equipe', label: 'Equipe' }
];

const opcoesStatus = Object.entries(STATUS_PROJETO).map(([value, v]) => ({
  value: Number(value),
  text: v.rotulo
}));
const opcoesTipo = Object.entries(TIPO_PROJETO).map(([value, text]) => ({
  value: Number(value),
  text
}));

const opcoesPesquisadores = ref([]);
const opcoesOrientandos = ref([]);
const buscaOrientando = ref('');

const orientandosFiltrados = computed(() => {
  const alvo = buscaOrientando.value.trim().toLowerCase();
  if (!alvo) return opcoesOrientandos.value;
  return opcoesOrientandos.value.filter((o) => o.text.toLowerCase().includes(alvo));
});

const formularioPadrao = () => ({
  titulo: '',
  resumo: '',
  status: 0,
  tipo: 1,
  pesquisador_id: null,
  orientandos: []
});

// A equipe mistura pesquisadores e orientandos; o formulário só cuida dos
// orientandos — os demais membros a API preserva.
const paraFormulario = (item) => {
  const ids = new Set(opcoesOrientandos.value.map((o) => o.value));
  return {
    titulo: item.titulo,
    resumo: item.resumo ?? '',
    status: item.status,
    tipo: item.tipo,
    pesquisador_id: item.pesquisador_id,
    orientandos: (item.equipe ?? []).map((m) => m.id).filter((id) => ids.has(id))
  };
};

/* --------------------- cadastro rápido de orientando --------------------- */
const novoOrientando = reactive({
  aberto: false,
  salvando: false,
  erro: '',
  nome: '',
  email: '',
  matricula: ''
});

function abrirNovoOrientando() {
  Object.assign(novoOrientando, {
    aberto: true,
    salvando: false,
    erro: '',
    nome: '',
    email: '',
    matricula: ''
  });
}

async function cadastrarOrientando(form) {
  if (novoOrientando.nome.trim().length < 3 || !novoOrientando.email.includes('@')) {
    novoOrientando.erro = 'Informe o nome (ao menos 3 letras) e um e-mail válido.';
    return;
  }

  novoOrientando.salvando = true;
  novoOrientando.erro = '';
  try {
    // cria o pesquisador e a conta de acesso do tipo Orientando numa só chamada
    const criado = await pesquisadores.criar({
      nome: novoOrientando.nome.trim(),
      email: novoOrientando.email.trim(),
      matricula: novoOrientando.matricula.trim() || null,
      linhas_id: null,
      categoria: CATEGORIA.ORIENTANDO
    });

    opcoesOrientandos.value = [...opcoesOrientandos.value, { value: criado.id, text: criado.nome }]
      .sort((a, b) => a.text.localeCompare(b.text));
    form.orientandos = [...(form.orientandos ?? []), criado.id];
    novoOrientando.aberto = false;
  } catch (e) {
    novoOrientando.erro = mensagemDeErro(e, 'Não foi possível cadastrar o orientando.');
  } finally {
    novoOrientando.salvando = false;
  }
}

onMounted(async () => {
  const [todos, orientandos] = await Promise.all([
    pesquisadores.listar({ limit: 100 }),
    pesquisadores.listar({ limit: 100, categoria: CATEGORIA.ORIENTANDO })
  ]);
  opcoesPesquisadores.value = todos.data.map((p) => ({ value: p.id, text: p.nome }));
  opcoesOrientandos.value = orientandos.data.map((p) => ({ value: p.id, text: p.nome }));
});
</script>
