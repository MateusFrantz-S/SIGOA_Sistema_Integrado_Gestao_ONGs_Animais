# Sistema de Gestão — ONG de Resgate de Animais

Este projeto reúne a estrutura de banco de dados e um protótipo visual
(estilo Drácula) para o sistema descrito nos módulos: controle clínico,
cadastro de animais, adoções, pessoas (adotantes/fornecedores) e produtos.

> **Versão 2:** adotante e fornecedor viraram um cadastro único de
> "pessoa" (com um ou mais cargos), FIV/FeLV agora fazem parte de um
> catálogo genérico de doenças/deficiências, e o campo de estoque de
> produtos foi removido por enquanto. Veja o que mudou em
> `banco-de-dados/DOCUMENTACAO-BANCO.md`.

## Estrutura de pastas

```
ong-resgate-animais/
├── README.md                          → este arquivo (visão geral + recomendações)
├── GUIA-DEPLOY.md                     → como colocar no GitHub, configurar o banco e publicar
├── banco-de-dados/
│   ├── schema.sql                     → estrutura completa das tabelas (comentada)
│   └── DOCUMENTACAO-BANCO.md          → explicação de cada tabela, relação e o que mudou na v2
├── diagrama/
│   ├── diagrama-banco.html             → diagrama ER atualizado (estilo simplificado, gerado por biblioteca)
│   └── diagrama-banco-classico.html    → diagrama ER "pé-de-galinha" — ⚠ ainda na estrutura antiga, peça para atualizar se for usá-lo
└── demo-visual/
    └── index.html                     → protótipo interativo estilo Drácula, responsivo (celular e computador)
```

## Banco de dados gratuito recomendado

| Opção | Armazenamento grátis | Observações |
|---|---|---|
| **Supabase** (PostgreSQL) — recomendado | 500 MB de banco + 1 GB de storage para fotos | Já vem com autenticação de usuários e upload de arquivos (fotos dos animais) prontos. Projeto grátis "pausa" depois de 7 dias sem uso — basta reativar com 1 clique no painel, os dados não são perdidos. |
| **Neon** (PostgreSQL) | ~0,5 GB | Boa alternativa ao Supabase, também serverless. |
| **MongoDB Atlas** (M0) | 512 MB | Só vale a pena se preferir um banco não-relacional; para este sistema (bem relacional, com kanban e várias ligações entre tabelas) o PostgreSQL encaixa melhor. |

## Hospedagem gratuita "sempre no ar"

A recomendação é **Supabase (banco) + Vercel ou Netlify (site/painel)** —
nenhum dos dois hiberna por inatividade normal, então o sistema fica
sempre acessível sem precisar de alguém monitorando. Os detalhes de como
configurar cada peça estão em `GUIA-DEPLOY.md`.

## Linguagem/stack recomendada (fácil manutenção)

**JavaScript/TypeScript com Next.js** rodando por cima do Supabase — mais
fácil de achar ajuda em português, e se conecta nativamente com Vercel e
Supabase com poucas linhas de código.

## Demo visual

Abra `demo-visual/index.html` no navegador — funciona tanto no
computador quanto no celular. Módulos disponíveis:

- Painel geral
- Cadastro de animal (com doenças/deficiências genéricas, catálogo extensível)
- Kanban de controle clínico (com filtros por espécie, doença e deficiência)
- Kanban de adoções (com vínculo de pessoa feito à parte, não no cadastro)
- Pessoas (cadastro único, com cargos em "pílulas" marcáveis)
- Produtos (sem controle de estoque por enquanto)

Use esse protótipo só para validar layout e fluxo — é HTML/CSS/JS puro,
sem conexão real com banco de dados ainda. Para transformar isso na
aplicação de verdade, veja `GUIA-DEPLOY.md`.
