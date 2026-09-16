/** Traduções dos códigos numéricos do banco e formatação de datas. */

export const STATUS_PROJETO = {
  0: { rotulo: 'Em elaboração', variante: 'secondary' },
  1: { rotulo: 'Em andamento', variante: 'success' },
  2: { rotulo: 'Concluído', variante: 'primary' },
  3: { rotulo: 'Cancelado', variante: 'danger' }
};

export const TIPO_PROJETO = {
  1: 'Pesquisa',
  2: 'Extensão',
  3: 'Desenvolvimento',
  4: 'Ensino'
};

export const TIPO_PRODUCAO = {
  1: 'Artigo em periódico',
  2: 'Artigo em evento',
  3: 'Capítulo de livro',
  4: 'Livro',
  5: 'Dissertação',
  6: 'Tese',
  7: 'Software',
  8: 'Patente',
  99: 'Outro'
};

export const CATEGORIA_USUARIO = {
  1: 'Administrador',
  2: 'Coordenador',
  3: 'Pesquisador'
};

export const STATUS_USUARIO = {
  0: { rotulo: 'Inativo', variante: 'secondary' },
  1: { rotulo: 'Ativo', variante: 'success' },
  2: { rotulo: 'Bloqueado', variante: 'danger' }
};

export function formatarData(valor) {
  if (!valor) return '—';
  return new Date(valor).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatarDataHora(valor) {
  if (!valor) return '—';
  return new Date(valor).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/** Converte uma data ISO em valor aceito por <input type="datetime-local">. */
export function paraInputDateTime(valor) {
  if (!valor) return '';
  const d = new Date(valor);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function inscricoesAbertas(curso) {
  if (!curso?.inscricoes_inicio || !curso?.inscricoes_fim) return false;
  const agora = Date.now();
  return (
    agora >= new Date(curso.inscricoes_inicio).getTime() &&
    agora <= new Date(curso.inscricoes_fim).getTime()
  );
}
