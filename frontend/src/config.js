/**
 * Configuração de ambiente do frontend.
 *
 * USANDO_MOCKS é a chave que liga/desliga os dados de exemplo.
 * Enquanto `VITE_USE_MOCKS=true`, todas as telas — públicas e administrativas —
 * funcionam sem o backend no ar, lendo de `src/mocks/`.
 * Para ligar na API real basta trocar para `false` no .env: nenhuma tela muda,
 * porque os services expõem exatamente a mesma assinatura nos dois modos.
 */
function booleano(valor, padrao = false) {
  if (valor === undefined) return padrao;
  return ['1', 'true', 'sim'].includes(String(valor).toLowerCase());
}

export const USANDO_MOCKS = booleano(import.meta.env.VITE_USE_MOCKS, true);

export const APP = {
  nome: import.meta.env.VITE_APP_NOME ?? 'Grupo de Pesquisa I2A',
  sigla: 'I2A',
  descricao:
    import.meta.env.VITE_APP_DESCRICAO ??
    'Inteligência Artificial e Aplicações — IFMA, Campus Coelho Neto',
  email: import.meta.env.VITE_APP_EMAIL ?? 'i2a@ifma.edu.br',
  instituicao: 'Instituto Federal do Maranhão',
  campus: 'Campus Coelho Neto'
};
