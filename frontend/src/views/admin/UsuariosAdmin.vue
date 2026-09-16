<template>
  <CrudView
    ref="crud"
    titulo="Usuários"
    subtitulo="Contas Google autorizadas a acessar a área administrativa. Cadastrar o e-mail aqui é o que libera o acesso."
    entidade="Usuário"
    :servico="usuarios"
    :campos="campos"
    :formulario-padrao="formularioPadrao"
    :para-formulario="paraFormulario"
  >
    <template #cell(email)="{ item }">
      <span class="text-break">{{ item.email }}</span>
    </template>

    <template #cell(categoria)="{ item }">
      {{ CATEGORIA_USUARIO[item.categoria] ?? '—' }}
    </template>

    <template #cell(status)="{ item }">
      <BBadge :variant="STATUS_USUARIO[item.status]?.variante ?? 'secondary'">
        {{ STATUS_USUARIO[item.status]?.rotulo ?? '—' }}
      </BBadge>
    </template>

    <template #cell(vinculo)="{ item }">
      <span v-if="item.ultimo_acesso" class="i2a-selo">Ativa</span>
      <span v-else class="i2a-meta">Nunca entrou</span>
    </template>

    <template #cell(pesquisador)="{ item }">{{ item.pesquisador?.nome ?? '—' }}</template>

    <template #formulario="{ form }">
      <BRow class="g-3">
        <BCol md="6">
          <BFormGroup
            label="E-mail da conta Google"
            label-for="email"
            description="É este endereço que libera o login. Precisa ser o e-mail exato da conta Google."
          >
            <BFormInput id="email" v-model.trim="form.email" type="email" required />
          </BFormGroup>
        </BCol>
        <BCol md="6">
          <BFormGroup label="Usuário" label-for="username" description="Identificador curto usado na interface.">
            <BFormInput id="username" v-model.trim="form.username" required />
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
  { key: 'email', label: 'E-mail (Google)', sortable: true },
  { key: 'username', label: 'Usuário' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'status', label: 'Situação' },
  { key: 'vinculo', label: 'Conta' },
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
  email: '',
  categoria: 3,
  status: 1,
  pesquisador_id: null
});

const paraFormulario = (item) => ({
  username: item.username,
  email: item.email,
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
