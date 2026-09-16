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
      </BRow>
    </template>
  </CrudView>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  BRow,
  BCol,
  BFormGroup,
  BFormInput,
  BFormTextarea,
  BFormSelect,
  BBadge
} from 'bootstrap-vue-next';

import CrudView from '@/components/admin/CrudView.vue';
import { projetos, pesquisadores } from '@/services/adminService';
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

const formularioPadrao = () => ({
  titulo: '',
  resumo: '',
  status: 0,
  tipo: 1,
  pesquisador_id: null
});
const paraFormulario = (item) => ({
  titulo: item.titulo,
  resumo: item.resumo ?? '',
  status: item.status,
  tipo: item.tipo,
  pesquisador_id: item.pesquisador_id
});

onMounted(async () => {
  const { data } = await pesquisadores.listar({ limit: 100 });
  opcoesPesquisadores.value = data.map((p) => ({ value: p.id, text: p.nome }));
});
</script>
