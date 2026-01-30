````md
# 🏥 SiteSaude

Sistema para gerenciamento de usuários e atendimentos em uma aplicação de saúde.
Atualmente o projeto conta apenas com a implementação do backend.

---

## ▶️ Como Executar

### 1️⃣ Clone o repositório
```bash
git clone https://github.com/RicardoAlSi/SiteSaude.git
cd SiteSaude/backend
````

### 2️⃣ Instale as dependências

```bash
npm install
```

### 3️⃣ Configure as variáveis de ambiente

Crie um arquivo `.env` na pasta backend e adicione:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/saude_db
```

### 4️⃣ Execute as migrations e gere o Prisma Client

```bash
npx prisma migrate dev
```

Ou, se quiser nomear a migration:

```bash
npx prisma migrate dev --name nome_da_migration
```
npx prisma generate
```

### 5️⃣ Inicie o servidor

```bash
npm run dev
```

---

## 🛠 Tecnologias Utilizadas

* Node.js
* TypeScript
* Express
* Prisma ORM
* PostgreSQL
* Joi
* bcrypt

---

## 👤 Funções do Sistema

* **ADMIN**
* **MEDICO**
* **ATENDENTE**
* **PACIENTE**

---

## ✔ Funcionalidades Atuais

* Cadastro de usuários
* Login de usuários
* Validação de dados com Joi
* Banco de dados inicial estruturado com Prisma

---

## 🗺 Próximos Passos

* Autenticação com JWT
* Controle de acesso por roles
* CRUD de pacientes
* CRUD de agenda e atendimentos

---

## 🚧 Status do Projeto

**Versão 0.1** — Em desenvolvimento 🚀