<template>
  <CrudView
    titulo="Produção científica"
    subtitulo="Artigos, capítulos, livros, softwares e patentes do grupo"
    entidade="Produção"
    :servico="producoes"
    :campos="campos"
    :formulario-padrao="formularioPadrao"
    :para-formulario="paraFormulario"
  >
    <template #cell(titulo)="{ item }">
      <span class="d-inline-block text-truncate" style="max-width: 26rem">{{ item.titulo }}</span>
    </template>

    <template #cell(tipo)="{ item }">{{ TIPO_PRODUCAO[item.tipo] ?? '—' }}</template>

    <template #cell(autores)="{ item }">
      <span v-if="item.autores?.length" class="small">
        {{ item.autores.map((a) => a.nome).join('; ') }}
      </span>
      <span v-else class="text-body-secondary">—</span>
    </template>

    <template #formulario="{ form }">
      <BRow class="g-3">
        <BCol cols="12">
          <BFormGroup label="Título" label-for="titulo">
            <BFormInput id="titulo" v-model="form.titulo" required maxlength="255" />
            <p class="i2a-meta mb-0 mt-1 text-end">{{ (form.titulo ?? '').length }}/255</p>
          </BFormGroup>
        </BCol>
        <BCol md="6">
          <BFormGroup label="Tipo" label-for="tipo">
            <BFormSelect id="tipo" v-model.number="form.tipo" :options="opcoesTipo" />
          </BFormGroup>
        </BCol>
        <BCol md="3">
          <BFormGroup label="Ano" label-for="ano">
            <BFormInput id="ano" v-model.number="form.ano" type="number" min="1900" max="2100" />
          </BFormGroup>
        </BCol>
        <BCol md="3">
          <BFormGroup label="Qualis" label-for="qualis">
            <BFormInput id="qualis" v-model="form.qualis" maxlength="10" placeholder="A1, B2…" />
          </BFormGroup>
        </BCol>
        <BCol md="6">
          <BFormGroup label="Veículo" label-for="veiculo" description="Periódico, evento ou editora.">
            <BFormInput id="veiculo" v-model="form.veiculo" maxlength="255" />
          </BFormGroup>
        </BCol>
        <BCol md="6">
          <BFormGroup label="DOI" label-for="doi">
            <BFormInput id="doi" v-model="form.doi" maxlength="100" placeholder="10.1016/…" />
          </BFormGroup>
        </BCol>
        <BCol md="4">
          <BFormGroup label="ISSN / ISBN" label-for="issn">
            <BFormInput id="issn" v-model="form.issn_isbn" maxlength="45" />
          </BFormGroup>
        </BCol>
        <BCol md="4">
          <BFormGroup label="Volume" label-for="volume">
            <BFormInput id="volume" v-model="form.volume" maxlength="20" />
          </BFormGroup>
        </BCol>
        <BCol md="4">
          <BFormGroup label="Páginas" label-for="paginas">
            <BFormInput id="paginas" v-model="form.paginas" maxlength="20" placeholder="120-134" />
          </BFormGroup>
        </BCol>
        <BCol cols="12">
          <BFormGroup label="URL" label-for="url">
            <BFormInput id="url" v-model="form.url" type="url" maxlength="255" />
          </BFormGroup>
        </BCol>
        <BCol cols="12">
          <BFormGroup
            label="Resumo (abstract)"
            label-for="resumo"
            description="Opcional. Ainda não é exibido no site público — fica guardado para quando houver uma página por publicação."
          >
            <BFormTextarea id="resumo" v-model="form.resumo" rows="6" />
            <p class="i2a-meta mb-0 mt-1 text-end">
              {{ (form.resumo ?? '').length }} caracteres
            </p>
          </BFormGroup>
        </BCol>
      </BRow>
    </template>
  </CrudView>
</template>

<script setup>
import {
  BRow,
  BCol,
  BFormGroup,
  BFormInput,
  BFormTextarea,
  BFormSelect
} from 'bootstrap-vue-next';

import CrudView from '@/components/admin/CrudView.vue';
import { producoes } from '@/services/adminService';
import { TIPO_PRODUCAO } from '@/utils/formatadores';

const campos = [
  { key: 'titulo', label: 'Título', sortable: true },
  { key: 'tipo', label: 'Tipo' },
  { key: 'ano', label: 'Ano', sortable: true },
  { key: 'veiculo', label: 'Veículo' },
  { key: 'autores', label: 'Autores' }
];

const opcoesTipo = Object.entries(TIPO_PRODUCAO).map(([value, text]) => ({
  value: Number(value),
  text
}));

const formularioPadrao = () => ({
  titulo: '',
  tipo: 1,
  ano: new Date().getFullYear(),
  veiculo: '',
  doi: '',
  issn_isbn: '',
  volume: '',
  paginas: '',
  qualis: '',
  url: '',
  resumo: ''
});

const paraFormulario = (item) => ({
  titulo: item.titulo,
  tipo: item.tipo,
  ano: item.ano,
  veiculo: item.veiculo ?? '',
  doi: item.doi ?? '',
  issn_isbn: item.issn_isbn ?? '',
  volume: item.volume ?? '',
  paginas: item.paginas ?? '',
  qualis: item.qualis ?? '',
  url: item.url ?? '',
  resumo: item.resumo ?? ''
});
</script>
