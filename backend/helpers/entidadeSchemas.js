/** Schemas Zod das entidades administrativas. */
import { z } from 'zod';

const opcional = (schema) => schema.optional().nullable();

/* -------------------------- linhas -------------------------- */
export const linhaSchema = z.object({
  descricao: z.string().min(3).max(100)
});

/* ----------------------- pesquisador ------------------------ */
// `categoria` define o tipo de usuário criado junto com o pesquisador:
// 1 Administrador · 2 Pesquisador · 3 Orientando
export const pesquisadorSchema = z.object({
  nome: z.string().min(3).max(100),
  email: z.string().email('E-mail inválido.').max(100),
  matricula: opcional(z.string().max(20)),
  linhas_id: opcional(z.string().uuid('Identificador inválido.')),
  // 1 Pesquisador · 2 Aluno; se omitido, segue a categoria (Orientando → Aluno)
  tipo: z.coerce
    .number()
    .int()
    .min(1, 'Tipo de pesquisador inválido.')
    .max(2, 'Tipo de pesquisador inválido.')
    .optional(),
  categoria: z.coerce
    .number()
    .int()
    .min(1, 'Tipo de usuário inválido.')
    .max(3, 'Tipo de usuário inválido.')
    .default(3)
});

export const pesquisadorUpdateSchema = pesquisadorSchema.partial();

/* ------------------------ titulacao ------------------------- */
export const titulacaoSchema = z.object({
  titulo: z.string().min(2).max(100),
  instituicao: z.string().min(2).max(100),
  ano: opcional(z.coerce.number().int().min(1900).max(2100)),
  pesquisador_id: z.string().uuid('Identificador inválido.')
});

export const titulacaoUpdateSchema = titulacaoSchema.partial();

/* -------------------------- cursos -------------------------- */
export const cursoSchema = z.object({
  titulo: z.string().min(3).max(255),
  // resumo/ementa é texto longo: o limite existe só para barrar abuso
  resumo: opcional(z.string().max(20000, 'O resumo passou de 20.000 caracteres.')),
  inicio: opcional(z.coerce.date()),
  inscricoes_inicio: opcional(z.coerce.date()),
  inscricoes_fim: opcional(z.coerce.date()),
  pesquisador_id: z.string().uuid('Identificador inválido.')
});

export const cursoUpdateSchema = cursoSchema.partial();

/* ------------------------- projetos ------------------------- */
export const projetoSchema = z.object({
  titulo: z.string().min(5, 'O título deve ter ao menos 5 caracteres.').max(255),
  // resumo é texto longo: o limite existe só para barrar abuso
  resumo: opcional(z.string().max(20000, 'O resumo passou de 20.000 caracteres.')),
  status: z.coerce.number().int().min(0).max(3).default(0),
  tipo: z.coerce.number().int().min(1).max(4).default(1),
  pesquisador_id: z.string().uuid('Identificador inválido.'),
  // ids dos orientandos da equipe; quando enviado, substitui os orientandos atuais
  orientandos: z.array(z.string().uuid('Identificador inválido.')).max(100).optional()
});

export const projetoUpdateSchema = projetoSchema.partial();

/* ------------------------- producao ------------------------- */
export const producaoSchema = z.object({
  titulo: z.string().min(3).max(255),
  ano: opcional(z.coerce.number().int().min(1900).max(2100)),
  veiculo: opcional(z.string().max(255)),
  resumo: opcional(z.string().max(20000, 'O resumo passou de 20.000 caracteres.')),
  tipo: z.coerce.number().int().default(1),
  doi: opcional(z.string().max(100)),
  issn_isbn: opcional(z.string().max(45)),
  volume: opcional(z.string().max(20)),
  paginas: opcional(z.string().max(20)),
  qualis: opcional(z.string().max(10)),
  url: opcional(z.string().url('URL inválida.').max(255))
});

export const producaoUpdateSchema = producaoSchema.partial();

/* ------------------------- usuarios ------------------------- */
// Não há senha: o que autoriza o acesso é o e-mail da conta Google.
export const usuarioSchema = z.object({
  username: z.string().min(3).max(100),
  email: z.string().email('E-mail inválido.').max(150),
  categoria: z.coerce.number().int().min(1).max(3).default(3),
  status: z.coerce.number().int().min(0).max(2).default(1),
  pesquisador_id: opcional(z.string().uuid('Identificador inválido.'))
});

export const usuarioUpdateSchema = z.object({
  username: z.string().min(3).max(100).optional(),
  email: z.string().email('E-mail inválido.').max(150).optional(),
  categoria: z.coerce.number().int().min(1).max(3).optional(),
  status: z.coerce.number().int().min(0).max(2).optional(),
  pesquisador_id: opcional(z.string().uuid('Identificador inválido.'))
});

/* --------------------- vínculos N:N ------------------------- */
export const vinculoPesquisadorSchema = z.object({
  pesquisador_id: z.string().uuid('Identificador inválido.')
});
