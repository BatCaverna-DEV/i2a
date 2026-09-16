<template>
  <section>
    <PageHeader :titulo="titulo" :subtitulo="subtitulo">
      <template #acoes>
        <BButton variant="primary" @click="abrirNovo">
          <i class="bi bi-plus-lg me-1" />Novo
        </BButton>
      </template>
    </PageHeader>

    <BCard>
      <BRow class="mb-3 g-2">
        <BCol md="6">
          <BInputGroup>
            <BInputGroupText><i class="bi bi-search" /></BInputGroupText>
            <BFormInput
              v-model="busca"
              placeholder="Buscar…"
              debounce="400"
              @update:model-value="recarregar(1)"
            />
          </BInputGroup>
        </BCol>
        <BCol md="6" class="text-md-end">
          <slot name="filtros" :recarregar="recarregar" />
        </BCol>
      </BRow>

      <CarregandoBloco v-if="carregando" />

      <EstadoVazio
        v-else-if="itens.length === 0"
        titulo="Nenhum registro"
        :descricao="`Cadastre o primeiro item em ${titulo.toLowerCase()}.`"
      />

      <BTable
        v-else
        :items="itens"
        :fields="camposTabela"
        responsive
        hover
        small
        class="align-middle mb-0"
      >
        <!-- repassa qualquer slot de célula definido pela página filha -->
        <template v-for="nome in slotsDeCelula" #[nome]="dados" :key="nome">
          <slot :name="nome" v-bind="dados" />
        </template>

        <template #cell(acoes)="{ item }">
          <div class="text-end text-nowrap">
            <BButton size="sm" variant="outline-secondary" class="me-1" @click="abrirEdicao(item)">
              <i class="bi bi-pencil" />
            </BButton>
            <BButton size="sm" variant="outline-danger" @click="confirmarRemocao(item)">
              <i class="bi bi-trash" />
            </BButton>
          </div>
        </template>
      </BTable>

      <div v-if="meta.totalPages > 1" class="d-flex justify-content-center mt-3">
        <BPagination
          v-model="pagina"
          :total-rows="meta.total"
          :per-page="meta.limit"
          @update:model-value="recarregar"
        />
      </div>
    </BCard>

    <!-- formulário de criação/edição -->
    <BModal
      v-model="modalAberto"
      :title="editando ? `Editar ${entidade}` : `Novo ${entidade}`"
      size="lg"
      ok-title="Salvar"
      cancel-title="Cancelar"
      :ok-disabled="salvando"
      @ok.prevent="salvar"
    >
      <BAlert :model-value="Boolean(erroForm)" variant="danger" class="py-2">
        {{ erroForm }}
      </BAlert>

      <slot name="formulario" :form="form" :editando="editando" />
    </BModal>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, useSlots } from 'vue';
import {
  BCard,
  BRow,
  BCol,
  BButton,
  BTable,
  BPagination,
  BModal,
  BAlert,
  BFormInput,
  BInputGroup,
  BInputGroupText,
  useToast
} from 'bootstrap-vue-next';

import PageHeader from '@/components/comum/PageHeader.vue';
import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { mensagemDeErro } from '@/services/http';

const props = defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
  entidade: { type: String, required: true },
  /** objeto com listar/criar/atualizar/remover (ver services/adminService.js) */
  servico: { type: Object, required: true },
  /** campos do BTable, sem a coluna de ações */
  campos: { type: Array, required: true },
  /** estado inicial do formulário */
  formularioPadrao: { type: Function, required: true },
  /** filtros extras enviados na listagem */
  filtrosExtras: { type: Object, default: () => ({}) },
  /** transforma o item antes de preencher o formulário de edição */
  paraFormulario: { type: Function, default: (item) => ({ ...item }) }
});

const slots = useSlots();
const toast = useToast();

const itens = ref([]);
const meta = reactive({ total: 0, page: 1, limit: 20, totalPages: 1 });
const pagina = ref(1);
const busca = ref('');
const carregando = ref(false);

const modalAberto = ref(false);
const editando = ref(null);
const salvando = ref(false);
const erroForm = ref('');
const form = reactive(props.formularioPadrao());

const camposTabela = computed(() => [...props.campos, { key: 'acoes', label: '', class: 'text-end' }]);
const slotsDeCelula = computed(() => Object.keys(slots).filter((n) => n.startsWith('cell(')));

async function recarregar(novaPagina = pagina.value) {
  carregando.value = true;
  try {
    const resposta = await props.servico.listar({
      page: novaPagina,
      limit: meta.limit,
      q: busca.value || undefined,
      ...props.filtrosExtras
    });
    itens.value = resposta.data;
    Object.assign(meta, resposta.meta);
    pagina.value = resposta.meta.page;
  } catch (e) {
    toast.create({ title: 'Erro', body: mensagemDeErro(e), variant: 'danger' });
  } finally {
    carregando.value = false;
  }
}

function resetForm(valores) {
  Object.keys(form).forEach((k) => delete form[k]);
  Object.assign(form, valores);
}

function abrirNovo() {
  editando.value = null;
  erroForm.value = '';
  resetForm(props.formularioPadrao());
  modalAberto.value = true;
}

function abrirEdicao(item) {
  editando.value = item;
  erroForm.value = '';
  resetForm({ ...props.formularioPadrao(), ...props.paraFormulario(item) });
  modalAberto.value = true;
}

async function salvar() {
  salvando.value = true;
  erroForm.value = '';
  try {
    if (editando.value) {
      await props.servico.atualizar(editando.value.id, { ...form });
    } else {
      await props.servico.criar({ ...form });
    }
    modalAberto.value = false;
    toast.create({ title: 'Pronto', body: `${props.entidade} salvo com sucesso.`, variant: 'success' });
    await recarregar();
  } catch (e) {
    erroForm.value = mensagemDeErro(e, 'Não foi possível salvar.');
  } finally {
    salvando.value = false;
  }
}

async function confirmarRemocao(item) {
  const ok = window.confirm(`Remover definitivamente "${item.titulo ?? item.nome ?? item.descricao ?? item.id}"?`);
  if (!ok) return;

  try {
    await props.servico.remover(item.id);
    toast.create({ title: 'Removido', body: `${props.entidade} removido.`, variant: 'success' });
    await recarregar();
  } catch (e) {
    toast.create({ title: 'Erro', body: mensagemDeErro(e), variant: 'danger' });
  }
}

onMounted(() => recarregar(1));

defineExpose({ recarregar });
</script>
