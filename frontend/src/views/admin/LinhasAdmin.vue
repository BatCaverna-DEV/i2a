<template>
  <CrudView
    titulo="Linhas de pesquisa"
    subtitulo="Eixos temáticos aos quais os pesquisadores estão vinculados"
    entidade="Linha"
    :servico="linhas"
    :campos="campos"
    :formulario-padrao="() => ({ descricao: '' })"
  >
    <template #formulario="{ form }">
      <BFormGroup label="Descrição" label-for="descricao">
        <BFormInput id="descricao" v-model="form.descricao" required maxlength="100" />
      </BFormGroup>
    </template>
  </CrudView>
</template>

<script setup>
import { BFormGroup, BFormInput } from 'bootstrap-vue-next';

import CrudView from '@/components/admin/CrudView.vue';
import { linhas } from '@/services/adminService';

const campos = [{ key: 'descricao', label: 'Descrição', sortable: true }];
</script>
