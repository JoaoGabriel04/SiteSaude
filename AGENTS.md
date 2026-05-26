# AGENTS.md

## Sobre o projeto

Sistema FullStack de um Saas para uma Clínica de Saúde, com controle de agendamentos e profissionais.

Stack:
- Frontend: Next.js + React + Typescript.
- Backend: Node.js + Express + Typescript.
- Banco: PostgreSQL
- ORM: Prisma

---

# Estrutura de Pastas

/
├── backend/
├── frontend/
├── docs/
├── .gitignore
├── docker-compose.yml
├── README.md
└── AGENTS.md

# Regras gerais

- Nunca use o tipo any
- Sempre tipar retornos
- Preferir composição ao invés de herança
- Código deve ser legível e modular

---

# Frontend

## UI

- Use TailwindCSS v4
- Use componentes do shadcn/ui
- Inputs devem seguir o padrão do formulário principal
- Validar inputs com o zod

## Estado

- Use Zustand para estados globais
- Use Axios API para dados da API
- Use SWR para requisições GET da API

# Backend

## Arquitetura

Controllers:
- apenas recebem request/response

Services:
- lógica de negócio

Repositories:
- acesso ao banco

## Segurança

- Validar entradas com Zod
- Nunca confiar no frontend
- Sanitizar uploads

# Banco de dados

- Nunca alterar migrations antigas
- Toda nova tabela deve ter:
  - id
  - createdAt
  - updatedAt

---

# Convenções

## Nomeação

- camelCase → variáveis
- PascalCase → componentes/classes
- kebab-case → arquivos

---

# Variáveis de ambiente

Criar arquivos `.env` em:

- `backend/.env` - variáveis do servidor
- `frontend/.env` - variáveis do Next.js

Consultar `.env.example` em cada diretório para as variáveis obrigatórias.

---

# Scripts

## Backend

\`\`\`bash
npm run dev      # desenvolvimento
npm run build    # produção
npm run lint     # verificar código
npm run typecheck # verificar tipos
\`\`\`

## Frontend

\`\`\`bash
npm run dev      # desenvolvimento
npm run build    # produção
npm run lint     # verificar código
npm run typecheck # verificar tipos
\`\`\`

---

# Portas padr�o

- Frontend: 3000
- Backend: 7000
- PostgreSQL: 5433 (externo) / 5432 (interno)

---

# Docker

- Usar `docker-compose.override.yml` para dados sensíveis (já está no `.gitignore`)
- Nunca commitar dados sensíveis no `docker-compose.yml`

---

# Git

Commits devem seguir Conventional Commits.

Exemplo:
- feat:
- fix:
- refactor:
- docs:

## Build

Antes de qualquer commit, rodar `npm run build` no backend e no frontend para garantir que não há erros de compilação.
