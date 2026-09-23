<template>
  <CrudView
    titulo="Cursos"
    subtitulo="Cursos e minicursos ofertados pelo grupo, com janela de inscrições"
    entidade="Curso"
    :servico="cursos"
    :campos="campos"
    :formulario-padrao="formularioPadrao"
    :para-formulario="paraFormulario"
  >
    <template #cell(titulo)="{ item }">
      <span class="d-inline-block text-truncate i2a-celula-titulo">{{ item.titulo }}</span>
    </template>

    <template #cell(inicio)="{ item }">{{ formatarData(item.inicio) }}</template>

    <template #cell(inscricoes)="{ item }">
      <BBadge :variant="inscricoesAbertas(item) ? 'success' : 'secondary'">
        {{ inscricoesAbertas(item) ? 'Abertas' : 'Fechadas' }}
      </BBadge>
    </template>

    <template #cell(responsavel)="{ item }">{{ item.responsavel?.nome ?? '—' }}</template>

    <template #formulario="{ form }">
      <BRow class="g-3">
        <BCol cols="12">
          <BFormGroup label="Título" label-for="titulo">
            <BFormInput id="titulo" v-model="form.titulo" required maxlength="255" />
            <p class="i2a-meta mb-0 mt-1 text-end">{{ (form.titulo ?? '').length }}/255</p>
          </BFormGroup>
        </BCol>
        <BCol cols="12">
          <BFormGroup
            label="Resumo / ementa"
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
          <BFormGroup label="Início do curso" label-for="inicio">
            <BFormInput id="inicio" v-model="form.inicio" type="datetime-local" />
          </BFormGroup>
        </BCol>
        <BCol md="4">
          <BFormGroup label="Inscrições de" label-for="ini">
            <BFormInput id="ini" v-model="form.inscricoes_inicio" type="datetime-local" />
          </BFormGroup>
        </BCol>
        <BCol md="4">
          <BFormGroup label="Inscrições até" label-for="fim">
            <BFormInput id="fim" v-model="form.inscricoes_fim" type="datetime-local" />
          </BFormGroup>
        </BCol>
        <BCol cols="12">
          <BFormGroup label="Responsável" label-for="responsavel">
            <BFormSelect id="responsavel" v-model="form.pesquisador_id" :options="opcoesPesquisadores" />
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
import { cursos, pesquisadores } from '@/services/adminService';
import { formatarData, inscricoesAbertas, paraInputDateTime } from '@/utils/formatadores';

const campos = [
  { key: 'titulo', label: 'Título', sortable: true },
  { key: 'inicio', label: 'Início' },
  { key: 'inscricoes', label: 'Inscrições' },
  { key: 'responsavel', label: 'Responsável' }
];

const opcoesPesquisadores = ref([]);

const formularioPadrao = () => ({
  titulo: '',
  resumo: '',
  inicio: '',
  inscricoes_inicio: '',
  inscricoes_fim: '',
  pesquisador_id: null
});

const paraFormulario = (item) => ({
  titulo: item.titulo,
  resumo: item.resumo ?? '',
  inicio: paraInputDateTime(item.inicio),
  inscricoes_inicio: paraInputDateTime(item.inscricoes_inicio),
  inscricoes_fim: paraInputDateTime(item.inscricoes_fim),
  pesquisador_id: item.pesquisador_id
});

onMounted(async () => {
  const { data } = await pesquisadores.listar({ limit: 100 });
  opcoesPesquisadores.value = data.map((p) => ({ value: p.id, text: p.nome }));
});
</script>
