<template>
  <CrudView
    titulo="Usuários"
    subtitulo="Contas com acesso à área administrativa (exclusivo de administradores)"
    entidade="Usuário"
    :servico="usuarios"
    :campos="campos"
    :formulario-padrao="formularioPadrao"
    :para-formulario="paraFormulario"
  >
    <template #cell(categoria)="{ item }">
      {{ CATEGORIA_USUARIO[item.categoria] ?? '—' }}
    </template>

    <template #cell(status)="{ item }">
      <BBadge :variant="STATUS_USUARIO[item.status]?.variante ?? 'secondary'">
        {{ STATUS_USUARIO[item.status]?.rotulo ?? '—' }}
      </BBadge>
    </template>

    <template #cell(totp_ativo)="{ item }">
      <BBadge :variant="item.totp_ativo ? 'success' : 'warning'">
        {{ item.totp_ativo ? 'Vinculado' : 'Pendente' }}
      </BBadge>
    </template>

    <template #cell(pesquisador)="{ item }">{{ item.pesquisador?.nome ?? '—' }}</template>

    <template #formulario="{ form, editando }">
      <BRow class="g-3">
        <BCol md="6">
          <BFormGroup label="Usuário" label-for="username">
            <BFormInput id="username" v-model.trim="form.username" :disabled="editando" required />
          </BFormGroup>
        </BCol>
        <BCol md="6">
          <BFormGroup
            label="Senha"
            label-for="senha"
            :description="editando ? 'Deixe em branco para manter a senha atual.' : 'Mínimo de 8 caracteres.'"
          >
            <BFormInput id="senha" v-model="form.senha" type="password" autocomplete="new-password" />
          </BFormGroup>
        </BCol>
        <BCol md="4">
          <BFormGroup label="Categoria" label-for="categoria">
            <BFormSelect id="categoria" v-model.number="form.categoria" :options="opcoesCategoria" />
          </BFormGroup>
        </BCol>
        <BCol md="4">
          <BFormGroup label="Situação" label-for="status">
            <BFormSelect id="status" v-model.number="form.status" :options="opcoesStatus" />
          </BFormGroup>
        </BCol>
        <BCol md="4">
          <BFormGroup label="Pesquisador vinculado" label-for="pesquisador">
            <BFormSelect id="pesquisador" v-model="form.pesquisador_id" :options="opcoesPesquisadores" />
          </BFormGroup>
        </BCol>
      </BRow>
    </template>
  </CrudView>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { BRow, BCol, BFormGroup, BFormInput, BFormSelect, BBadge } from 'bootstrap-vue-next';

import CrudView from '@/components/admin/CrudView.vue';
import { usuarios, pesquisadores } from '@/services/adminService';
import { CATEGORIA_USUARIO, STATUS_USUARIO } from '@/utils/formatadores';

const campos = [
  { key: 'username', label: 'Usuário', sortable: true },
  { key: 'categoria', label: 'Categoria' },
  { key: 'status', label: 'Situação' },
  { key: 'totp_ativo', label: '2FA' },
  { key: 'pesquisador', label: 'Pesquisador' }
];

const opcoesCategoria = Object.entries(CATEGORIA_USUARIO).map(([value, text]) => ({
  value: Number(value),
  text
}));
const opcoesStatus = Object.entries(STATUS_USUARIO).map(([value, v]) => ({
  value: Number(value),
  text: v.rotulo
}));

const opcoesPesquisadores = ref([{ value: null, text: 'Sem vínculo' }]);

const formularioPadrao = () => ({
  username: '',
  senha: '',
  categoria: 3,
  status: 1,
  pesquisador_id: null
});

const paraFormulario = (item) => ({
  username: item.username,
  senha: '',
  categoria: item.categoria,
  status: item.status,
  pesquisador_id: item.pesquisador_id ?? null
});

onMounted(async () => {
  const { data } = await pesquisadores.listar({ limit: 100 });
  opcoesPesquisadores.value = [
    { value: null, text: 'Sem vínculo' },
    ...data.map((p) => ({ value: p.id, text: p.nome }))
  ];
});
</script>
