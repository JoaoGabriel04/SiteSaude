# 🏥 SiteSaude

Sistema para gerenciamento de usuários e atendimentos em uma aplicação de saúde.

O projeto é composto por:

- 📦 Backend (Node.js + Express + Prisma)
- 💻 Frontend
- 🐘 Banco de Dados PostgreSQL
- 🐳 Ambiente totalmente containerizado com Docker

---

# 🚀 Executando o Projeto (Recomendado: WSL/Linux)

> ⚠ Recomendado utilizar Linux ou WSL2 no Windows para evitar problemas de permissão e PATH.

---

## 1️⃣ Clone o repositório

```bash
git clone https://github.com/JoaoGabriel04/SiteSaude.git
cd SiteSaude
```

---

## 2️⃣ Configure as variáveis de ambiente

Crie um arquivo `.env` dentro da pasta `backend`:

```env
DATABASE_URL=postgresql://user:password@db:5432/saude_db
```

> Observação: quando rodando via Docker, o host do banco deve ser o nome do serviço definido no `docker-compose.yml` (ex: `db`).

---

## 3️⃣ Suba os containers

```bash
docker compose up --build
```

Ou para rodar em background:

```bash
docker compose up -d --build
```

Isso irá:

- Criar as imagens
- Subir backend
- Subir frontend
- Subir PostgreSQL
- Conectar tudo automaticamente

---

## 4️⃣ Rodar migrations do Prisma

Com os containers rodando:

```bash
docker compose exec backend npx prisma migrate dev
```

Ou nomeando a migration:

```bash
docker compose exec backend npx prisma migrate dev --name nome_da_migration
```

Gerar Prisma Client:

```bash
docker compose exec backend npx prisma generate
```

---

# 🛠 Tecnologias Utilizadas

- Node.js 24 (LTS)
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Joi
- bcrypt
- Docker
- Docker Compose

---

# 👤 Funções do Sistema

- **ADMIN**
- **MEDICO**
- **ATENDENTE**
- **PACIENTE**

---

# ✔ Funcionalidades Atuais

- Cadastro de usuários
- Login de usuários
- Validação de dados com Joi
- Estrutura inicial do banco com Prisma
- Ambiente totalmente containerizado

---

# 🗺 Próximos Passos

- Autenticação com JWT
- Controle de acesso por Roles (RBAC)
- CRUD de pacientes
- CRUD de agenda
- CRUD de atendimentos
- Testes automatizados
- Deploy em ambiente cloud

---

# 🐳 Estrutura Docker

O projeto utiliza:

- `Dockerfile` para backend e frontend
- `docker-compose.yml` para orquestração
- Volumes para persistência do banco de dados

---

# 🚧 Status do Projeto

**Versão 0.2** — Ambiente Docker estruturado 🚀

---

# 🧠 Observações Importantes

- Sempre utilize `docker compose up --build` após alterar dependências.
- Caso ocorra erro de permissão em `node_modules`, verifique se o container está rodando com o mesmo UID do usuário.
- Recomenda-se manter os projetos dentro do ambiente Linux (`/home/usuario/projetos`) ao utilizar WSL.

---

Desenvolvido para fins acadêmicos e evolução prática em backend com arquitetura containerizada.
