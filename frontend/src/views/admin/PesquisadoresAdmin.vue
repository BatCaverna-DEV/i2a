<template>
  <CrudView
    titulo="Pesquisadores"
    subtitulo="Membros do grupo, suas linhas de pesquisa e titulações"
    entidade="Pesquisador"
    :servico="pesquisadores"
    :campos="campos"
    :formulario-padrao="formularioPadrao"
    :para-formulario="paraFormulario"
  >
    <template #cell(linha)="{ item }">
      <BBadge v-if="item.linha" variant="secondary">{{ item.linha.descricao }}</BBadge>
      <span v-else class="text-body-secondary">—</span>
    </template>

    <template #cell(titulacoes)="{ item }">
      {{ item.titulacoes?.length ?? 0 }}
    </template>

    <template #formulario="{ form }">
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
          <BFormGroup label="E-mail" label-for="email">
            <BFormInput id="email" v-model="form.email" type="email" required maxlength="100" />
          </BFormGroup>
        </BCol>
        <BCol md="5">
          <BFormGroup label="Linha de pesquisa" label-for="linha">
            <BFormSelect id="linha" v-model="form.linhas_id" :options="opcoesLinhas" />
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
import { pesquisadores, linhas } from '@/services/adminService';

const campos = [
  { key: 'nome', label: 'Nome', sortable: true },
  { key: 'email', label: 'E-mail' },
  { key: 'matricula', label: 'Matrícula' },
  { key: 'linha', label: 'Linha' },
  { key: 'titulacoes', label: 'Titulações' }
];

const opcoesLinhas = ref([{ value: null, text: 'Sem linha definida' }]);

const formularioPadrao = () => ({ nome: '', email: '', matricula: '', linhas_id: null });
const paraFormulario = (item) => ({
  nome: item.nome,
  email: item.email,
  matricula: item.matricula ?? '',
  linhas_id: item.linhas_id ?? null
});

onMounted(async () => {
  const { data } = await linhas.listar({ limit: 100 });
  opcoesLinhas.value = [
    { value: null, text: 'Sem linha definida' },
    ...data.map((l) => ({ value: l.id, text: l.descricao }))
  ];
});
</script>
