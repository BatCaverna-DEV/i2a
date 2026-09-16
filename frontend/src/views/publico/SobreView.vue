<template>
  <BContainer class="py-5">
    <BRow class="justify-content-center">
      <BCol lg="8">
        <h1 class="h3 fw-bold mb-4">Sobre o Grupo I2A</h1>

        <p>
          O <strong>I2A — Inteligência Artificial e Aplicações</strong> é um grupo de pesquisa do
          Instituto Federal do Maranhão (IFMA), Campus Coelho Neto, dedicado ao estudo e à
          aplicação de técnicas de inteligência artificial e aprendizagem de máquina a problemas
          reais.
        </p>

        <h2 class="h5 fw-semibold mt-4">O que fazemos</h2>
        <ul>
          <li>Pesquisa em aprendizagem de máquina, aprendizagem profunda e ciência de dados;</li>
          <li>Aplicações em saúde, sensoriamento remoto e processamento de linguagem natural;</li>
          <li>Formação de estudantes por meio de projetos de iniciação científica e tecnológica;</li>
          <li>Oferta de cursos e minicursos abertos à comunidade.</li>
        </ul>

        <h2 class="h5 fw-semibold mt-4">Como participar</h2>
        <p>
          Estudantes interessados em iniciação científica podem procurar um dos pesquisadores do
          grupo na página <RouterLink :to="{ name: 'pesquisadores' }">Pesquisadores</RouterLink> ou
          acompanhar as chamadas divulgadas na página de
          <RouterLink :to="{ name: 'cursos' }">Cursos</RouterLink>.
        </p>

        <BAlert :model-value="true" variant="light" class="border mt-4">
          <i class="bi bi-envelope me-2" />Contato: <strong>i2a@ifma.edu.br</strong>
        </BAlert>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup>
import { BContainer, BRow, BCol, BAlert } from 'bootstrap-vue-next';
</script>
