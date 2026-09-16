# O que acrescentar ao site do I2A

Sugestões para as próximas etapas do site do Grupo de Pesquisa I2A, comparando o que já
existe com o que é praxe em sites de grupos e laboratórios de IA.

A referência de estrutura mais próxima do nosso caso é o modelo que Harvard distribui para
laboratórios e grupos de pesquisa — **Home, Research, Publications, People, Resources,
News & Events, About** — e os sites de laboratórios acadêmicos de IA, que quase sempre
acrescentam **seminários** e **oportunidades para estudantes**.

---

## 1. Onde o site está hoje

| Seção do modelo de referência | No I2A | Observação |
|---|---|---|
| Home | ✅ | números do grupo, linhas, publicações recentes |
| About | ✅ | página Sobre |
| Research | ⚠️ parcial | as linhas existem, mas não têm página própria |
| Publications | ✅ | filtros por tipo, ano e busca |
| People | ✅ | Equipe + perfil individual |
| News & Events | ❌ | não existe |
| Resources | ❌ | não existe |
| Opportunities / Join us | ✅ | página Participe |
| Contato | ✅ | formulário ainda não enviado |

O essencial está coberto. O que falta é o que mantém um site de grupo **vivo** depois do
lançamento — e é aí que a maioria dos sites acadêmicos morre: publica-se a estrutura, e o
conteúdo congela.

---

## 2. Prioridade alta

### 2.1 Notícias e eventos

É a peça que mais falta. Sem ela, o site parece abandonado seis meses depois do lançamento,
por mais completo que seja. Defesas de TCC, prêmios, participação em congressos, início de
projeto, chamada de bolsa — tudo isso é notícia curta e de baixo custo de produção.

*Backend:* tabela `noticias` (id, titulo, resumo, corpo, imagem, data_publicacao,
pesquisador_id, status). *Frontend:* listagem paginada + página do post + bloco "Últimas"
na home.

### 2.2 Página por linha de pesquisa

Hoje as linhas são só um rótulo com contagem. Uma página por linha — com descrição de meia
página, os projetos vinculados, os pesquisadores e as publicações — transforma cada linha
numa porta de entrada do site e melhora muito a indexação em buscadores.

*Backend:* a tabela `linhas` já existe, basta acrescentar `resumo` e `slug`, e criar
`GET /publico/linhas/:slug`.

### 2.3 Oportunidades como dado, não como texto fixo

A página Participe já está no ar, mas as vagas estão em `src/mocks/dados.js`. Sem uma tabela
real, alguém vai ter que editar código toda vez que abrir um edital — o que significa que na
prática ninguém vai atualizar.

*Backend:* tabela `oportunidades` (titulo, nivel, linha_id, vagas, prazo, requisitos,
contato, status) e `GET /publico/oportunidades`. O frontend já chama essa rota.

### 2.4 Formulário de contato funcionando

O formulário está montado e validado, mas o `enviar()` só marca um aviso. Falta
`POST /publico/contato` com rate limit e algum anti-spam simples (honeypot resolve num grupo
deste porte).

---

## 3. Prioridade média

### 3.1 Exportação de publicações em BibTeX

Um botão "citar" por publicação, e "baixar todas em .bib" na página de Publicações. É
barato de implementar e é exatamente o que um pesquisador de fora espera encontrar. Também
abre caminho para importar do Lattes em vez de digitar publicação a publicação.

### 3.2 Integração com a Plataforma Lattes

O trabalho mais chato de manter um site de grupo é redigitar produção que já está no Lattes.
Vale avaliar a importação do XML do currículo para popular `producao` e `titulacao`. Como o
grupo é cadastrado no Diretório de Grupos do CNPq, o link para o espelho do grupo também
merece lugar no rodapé.

### 3.3 Seminários e agenda

Laboratórios de IA quase sempre têm uma série de seminários — o Michigan AI Lab, por
exemplo, organiza o site em torno de "AI Seminars and Events". Mesmo uma reunião semanal
interna vira conteúdo público: data, quem apresenta, tema.

*Sugestão:* reaproveitar a tabela `cursos` com um campo `modalidade` (curso, minicurso,
seminário, oficina) em vez de criar uma tabela nova.

### 3.4 Software, dados e código

Uma página listando repositórios, datasets e modelos publicados pelo grupo. A produção de
tipo "Software" já existe no modelo de dados (`TIPO_PRODUCAO.SOFTWARE`), mas não tem
destaque. Para um grupo de IA, código aberto é cartão de visitas.

### 3.5 Inscrição on-line nos cursos

Hoje o site divulga a janela de inscrições mas não recebe inscrição. Uma tabela
`inscricoes` (curso_id, nome, email, cpf, instituição, status) com listagem no painel
resolveria, e daria ao grupo uma lista de contatos para divulgar as próximas ofertas.

### 3.6 Versão em inglês

Se a meta é visibilidade internacional — e num grupo que publica em *Knowledge-Based
Systems* essa meta faz sentido —, ao menos Home, Sobre, Equipe e Publicações em inglês.
O `vue-i18n` resolve sem reescrever as telas.

---

## 4. Prioridade baixa, mas de bom efeito

- **Fotos dos pesquisadores.** Sites de laboratório com foto de equipe passam muito mais
  credibilidade do que iniciais em círculos cinza. Exige upload de imagem no painel.
- **Parceiros e financiadores.** Logos de CNPq, FAPEMA, IFMA e parceiros externos. É o que
  agências esperam ver, e ajuda em prestação de contas.
- **Métricas de impacto.** Citações, orientações concluídas, alunos formados. Bem simples de
  calcular a partir do que já está no banco.
- **Busca global.** Um campo único que procura em pesquisadores, projetos e publicações.
- **Feed RSS** das notícias, para quem acompanha vários grupos.
- **Página de infraestrutura.** Servidores, GPUs, laboratório físico. O modelo de Harvard
  chama isso de *Resources*, e é o que responde à pergunta "vocês têm condição de tocar este
  projeto?".
- **Modo escuro.** O Bootstrap 5.3 já traz `data-bs-theme="dark"`; daria pouco trabalho.

---

## 5. Cuidados antes de ir ao ar

- **SEO e compartilhamento.** Falta `<meta>` Open Graph por página; hoje todo link
  compartilhado no WhatsApp mostra o mesmo título. Com SPA isso exige um `useHead`
  (`@unhead/vue`) ou pré-renderização.
- **LGPD.** E-mails dos pesquisadores ficam expostos na página da Equipe. Vale confirmar com
  cada um, ou trocar por formulário de contato individual.
- **Acessibilidade.** O contraste e a estrutura de cabeçalhos estão razoáveis, mas vale
  passar um axe ou Lighthouse antes do lançamento.
- **Quem alimenta.** A pergunta mais importante e a que menos se faz. Um site de grupo só
  sobrevive se alguém for responsável por publicar — vale combinar uma rotina, por exemplo
  cada bolsista escreve uma notícia por semestre.

---

## 6. Ordem sugerida

1. Ligar o site na API real (`VITE_USE_MOCKS=false`) e conferir tela por tela.
2. Notícias — backend e frontend.
3. Oportunidades como tabela + formulário de contato funcionando.
4. Página por linha de pesquisa.
5. BibTeX e importação do Lattes.
6. Inscrição em cursos.
7. Inglês e SEO.

---

## Fontes

- [Lab and Research Group Site Structure — OpenScholar / Harvard](https://docs.openscholar.harvard.edu/lab-and-research-group-site)
- [Michigan AI Laboratory — University of Michigan](https://ai.engin.umich.edu/)
- [Diretório de Grupos de Pesquisa — Plataforma Lattes / CNPq](https://lattes.cnpq.br/web/dgp/grupo-pesquisa)
- [8 Best Academic Lab Websites — Impact Media Lab](https://www.impactmedialab.com/scicomm/8-best-academic-lab-websites-to-inspire-your-lab-site)
- [Research Lab Websites — The Academic Designer](https://theacademicdesigner.com/2024/research-lab-websites/)
