<template>
  <CrudView
    titulo="Pesquisadores"
    subtitulo="Cadastrar um pesquisador cria automaticamente a conta de acesso dele, com o tipo de usuário escolhido."
    entidade="Pesquisador"
    :servico="pesquisadores"
    :campos="campos"
    :formulario-padrao="formularioPadrao"
    :para-formulario="paraFormulario"
  >
    <template #cell(linha)="{ item }">
      <span v-if="item.linha" class="i2a-selo">{{ item.linha.descricao }}</span>
      <span v-else class="i2a-meta">—</span>
    </template>

    <template #cell(acesso)="{ item }">
      <span v-if="conta(item)">
        {{ CATEGORIA_USUARIO[conta(item).categoria] ?? '—' }}
        <span v-if="!conta(item).ultimo_acesso" class="i2a-meta d-block">nunca entrou</span>
      </span>
      <span v-else class="i2a-meta">sem conta</span>
    </template>

    <template #cell(titulacoes)="{ item }">
      {{ item.titulacoes?.length ?? 0 }}
    </template>

    <template #formulario="{ form, editando }">
      <BRow class="g-3">
        <BCol md="8">
          <BFormGroup label="Nome" label-for="nome">
            <BFormInput id="nome" v-model="form.nome" required maxlength="100" />
          </BFormGroup>
        </BCol>
        <BCol md="4">
          <BFormGroup label="Matrícula" label-for="matricula">
            <BFormInput id="matricula" v-model="form.matricula" maxlength="20" />
          </BFormGroup>
        </BCol>

        <BCol md="7">
          <BFormGroup
            label="E-mail"
            label-for="email"
            description="É também o e-mail da conta Google usada para entrar no sistema."
          >
            <BFormInput id="email" v-model="form.email" type="email" required maxlength="100" />
          </BFormGroup>
        </BCol>
        <BCol md="5">
          <BFormGroup label="Linha de pesquisa" label-for="linha">
            <BFormSelect id="linha" v-model="form.linhas_id" :options="opcoesLinhas" />
          </BFormGroup>
        </BCol>

        <BCol cols="12">
          <hr class="i2a-rule my-2" />
          <BFormGroup
            label="Tipo de usuário"
            label-for="categoria"
            :description="DESCRICAO_CATEGORIA[form.categoria] ?? ''"
          >
            <BFormSelect
              id="categoria"
              v-model.number="form.categoria"
              :options="opcoesCategoria"
              :disabled="editando && !auth.ehAdmin"
            />
          </BFormGroup>

          <BAlert
            :model-value="!auth.ehAdmin"
            variant="light"
            class="border py-2 small mt-2 mb-0"
          >
            Seu perfil permite cadastrar apenas orientandos. Para criar um pesquisador ou
            administrador, peça a um administrador do grupo.
          </BAlert>

          <BAlert
            :model-value="Boolean(editando) && auth.ehAdmin"
            variant="light"
            class="border py-2 small mt-2 mb-0"
          >
            Trocar o e-mail desfaz o vínculo com a conta Google atual — o próximo login
            refaz o vínculo com o novo endereço.
          </BAlert>
        </BCol>
      </BRow>
    </template>
  </CrudView>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { BRow, BCol, BFormGroup, BFormInput, BFormSelect, BAlert } from 'bootstrap-vue-next';

import CrudView from '@/components/admin/CrudView.vue';
import { pesquisadores, linhas } from '@/services/adminService';
import { useAuthStore, CATEGORIA } from '@/stores/auth';
import { CATEGORIA_USUARIO, DESCRICAO_CATEGORIA } from '@/utils/formatadores';

const auth = useAuthStore();

const campos = [
  { key: 'nome', label: 'Nome', sortable: true },
  { key: 'email', label: 'E-mail' },
  { key: 'linha', label: 'Linha' },
  { key: 'acesso', label: 'Tipo de usuário' },
  { key: 'titulacoes', label: 'Titulações' }
];

/** A API devolve as contas do pesquisador em `usuarios`. */
const conta = (item) => item.usuarios?.[0] ?? null;

const opcoesLinhas = ref([{ value: null, text: 'Sem linha definida' }]);

// Pesquisador só cadastra orientando; administrador escolhe qualquer tipo.
const opcoesCategoria = computed(() => {
  const todas = Object.entries(CATEGORIA_USUARIO).map(([value, text]) => ({
    value: Number(value),
    text
  }));
  return auth.ehAdmin ? todas : todas.filter((o) => o.value === CATEGORIA.ORIENTANDO);
});

const formularioPadrao = () => ({
  nome: '',
  email: '',
  matricula: '',
  linhas_id: null,
  categoria: auth.ehAdmin ? CATEGORIA.PESQUISADOR : CATEGORIA.ORIENTANDO
});

const paraFormulario = (item) => ({
  nome: item.nome,
  email: item.email,
  matricula: item.matricula ?? '',
  linhas_id: item.linhas_id ?? null,
  categoria: conta(item)?.categoria ?? CATEGORIA.ORIENTANDO
});

onMounted(async () => {
  const { data } = await linhas.listar({ limit: 100 });
  opcoesLinhas.value = [
    { value: null, text: 'Sem linha definida' },
    ...data.map((l) => ({ value: l.id, text: l.descricao }))
  ];
});
</script>
