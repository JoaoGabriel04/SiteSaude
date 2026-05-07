# API – Sistema de Agendamento Médico

API REST para gerenciamento de usuários (Médicos, Atendentes e Admin), pacientes, disponibilidade médica, exceções e agendamentos.

---

## Stack

- **Node.js** + **TypeScript** (ES Modules)
- **Express**
- **Prisma ORM** + **PostgreSQL**
- **JWT** (autenticação) + **bcryptjs** (hash de senha)
- **Joi** (validação)
- **Multer** + **Cloudinary** (upload de avatar)
- **Docker** (containerização)

---

## Arquitetura

```
Request → Middlewares (authenticate → authorize → validate) → Controller → Service → Repository → Prisma → PostgreSQL
```

- **Middlewares**: autenticação JWT (`authToken`), autorização por papel (`authorize`) e validação de payload (`validate` com Joi).
- **Controller**: recebe a requisição HTTP, delega ao service e formata a resposta.
- **Service**: regras de negócio (ex.: verificação de duplicidade de CPF/CNS/CRM, geração de slots).
- **Repository**: acesso ao banco via Prisma.
- **Prisma**: ORM/mapeamento para PostgreSQL.

---

## Autenticação

JWT (HS256) com `JWT_SECRET`.

- `accessToken`: expira em **15 min**, enviado no header.
- `refreshToken`: expira em **7 dias**, armazenado em cookie **HttpOnly** (`refresh_token`).

### Header

```
Authorization: Bearer <accessToken>
```

### Payload do token

```json
{ "sub": "<userId>", "role": "MEDICO | ATENDENTE | ADMIN" }
```

### Master Admin

Existe um administrador "mestre" cujas credenciais vêm de variáveis de ambiente (`MASTER_ADMIN_EMAIL`, `MASTER_ADMIN_PASSWORD`, `MASTER_ADMIN_ID`). Esse usuário não existe no banco — é validado diretamente pelo `AuthService`.

---

## Autorização (por prefixo de rota)

| Prefixo            | Middlewares aplicados no router pai            |
|--------------------|------------------------------------------------|
| `/api/auth/*`      | Nenhum (público)                               |
| `/api/user/*`      | `authToken` (aplicado em cada rota)            |
| `/api/atendente/*` | `authToken` + `authorize(ATENDENTE, ADMIN)`    |
| `/api/medico/*`    | `authToken` + `authorize(ATENDENTE, ADMIN)` ⚠️ |
| `/api/upload/*`    | Nenhum ⚠️                                       |
| `/api/test`        | Nenhum                                         |

> ⚠️ Veja a seção **Sugestões de melhoria** quanto a `/api/medico/*` e `/api/upload/*`.

---

## Validação

- Schemas Joi em `src/schemas/`.
- Erros de validação retornam `400` com `{ "error": ["mensagem1", "mensagem2", ...] }`.
- Utilitários em `src/utils/validaCpfCns.ts` validam CPF (lib `cpf-cnpj-validator`) e CNS (regex + dígito ponderado).

### Modo desenvolvimento

Quando `NODE_ENV !== "production"`, CPFs e CNSs que **começam com `999`** são aceitos sem validação algorítmica (útil para seeds/testes).

---

## Tratamento de erros

`AppError` padroniza erros de domínio:

```ts
throw new AppError("CPF já cadastrado", 400);
```

- Erros conhecidos → `statusCode` definido.
- Erros inesperados → `500 Erro interno do servidor`.

### Padrão de resposta

| Caso     | Formato                                                   |
|----------|-----------------------------------------------------------|
| Sucesso  | Objeto/array do recurso (sem envelope `data` na maioria)  |
| Erro     | `{ "error": "mensagem" }` ou `{ "error": ["..."] }`       |

> ℹ️ A documentação anterior afirmava que sucesso usava sempre `{ "data": ... }`. **No código isso não acontece** — os controllers retornam o objeto diretamente.

---

# Endpoints

Base URL: `/api`

## 🔓 Auth – `/api/auth`

### `POST /api/auth/registerU`

Registra um novo profissional (`MEDICO` ou `ATENDENTE`).

> ⚠️ **No código atual essa rota é pública** (não há `authToken`/`authorize` no router pai de `/auth`). A documentação anterior dizia exigir `ADMIN`. Ver Sugestões.

**Body**

```json
{
  "nome": "string (3..100)",
  "cpf": "string (11 dígitos, validado)",
  "password": "string (8..30, maiúscula+minúscula+dígito+especial)",
  "nascimento": "YYYY-MM-DD",
  "email": "string (email)",
  "fone": "string (formato (DD)XXXXX-XXXX, normalizado p/ apenas dígitos)",
  "role": "MEDICO | ATENDENTE",
  "avatar": "string (URL, opcional)",

  "crm": "string (obrigatório se role=MEDICO, regex tipo 'SSP/MA 123456')",
  "especialidade": "string (>=4, obrigatório se role=MEDICO)",

  "setor": "string (>=4, obrigatório se role=ATENDENTE)"
}
```

**Resposta `201 Created`**

```json
{
  "message": "Profissional Registrado com Sucesso!",
  "user": {
    "id": "uuid",
    "nome": "string",
    "email": "string",
    "cpf": "string",
    "nascimento": "ISO 8601",
    "fone": "string",
    "avatar": "string | null",
    "role": "MEDICO | ATENDENTE",
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601",
    "medico": { "crm": "string", "especialidade": "string" } | null,
    "atendente": { "setor": "string" } | null
  }
}
```

**Erros**

| Status | Mensagem                       |
|--------|--------------------------------|
| 400    | Erros de validação Joi (array) |
| 400    | `"CRM já registrado"`          |
| 400    | `"Email já registrado"`        |
| 400    | `"CPF já registrado"`          |
| 400    | `"Role inválida"`              |
| 500    | Erro interno do servidor       |

---

### `POST /api/auth/loginU`

Autentica usuário (MEDICO, ATENDENTE ou Master Admin) e devolve `accessToken`. Define `refresh_token` em cookie HttpOnly.

**Body**

```json
{ "email": "string", "password": "string (>=8)" }
```

**Resposta `200 OK`**

```json
{
  "accessToken": "JWT",
  "user": {
    "id": "uuid",
    "nome": "string",
    "cpf": "string | null",
    "nascimento": "ISO 8601 | null",
    "fone": "string | null",
    "email": "string",
    "avatar": "string | null",
    "role": "MEDICO | ATENDENTE | ADMIN",
    "createdAt": "ISO 8601 (ausente para Master Admin)",
    "updatedAt": "ISO 8601 (ausente para Master Admin)",
    "medico": { "crm": "string", "especialidade": "string" } | null,
    "atendente": { "setor": "string" } | null
  }
}
```

**Cookies**: `refresh_token` (HttpOnly, `maxAge=7d`, `sameSite=lax`, `secure` em produção).

**Erros**

| Status | Mensagem                     |
|--------|------------------------------|
| 400    | `"Email ou senha inválidos"` |
| 400    | Erros de validação Joi       |
| 500    | Erro interno                 |

---

### `POST /api/auth/refresh`

Gera novo `accessToken` e **rotaciona** o `refresh_token` a partir do cookie.

**Cookies**: `refresh_token` (obrigatório).
**Body**: nenhum.

**Resposta `200 OK`**

```json
{ "accessToken": "JWT" }
```

**Erros**

| Status | Mensagem                  |
|--------|---------------------------|
| 401    | `"Refresh token ausente"` |
| 400    | `"Invalid refresh token"` |
| 400    | `"Invalid token payload"` |
| 500    | `"JWT secret not found"`  |

---

### `POST /api/auth/logout`

Limpa o cookie `refresh_token`.

**Resposta `200 OK`**

```json
{ "message": "Logout realizado com sucesso" }
```

---

## 👤 Users – `/api/user`

> Todas as rotas exigem `authToken` (qualquer role autenticada). **Não há restrição por papel no código** (a doc anterior afirmava ADMIN/ATENDENTE).

### `GET /api/user/`

Lista todos os usuários cadastrados (sem paginação).

**Resposta `200 OK`** – array de usuários:

```json
[
  {
    "id": "uuid",
    "nome": "string",
    "cpf": "string",
    "nascimento": "ISO 8601",
    "fone": "string",
    "email": "string",
    "avatar": "string | null",
    "role": "MEDICO | ATENDENTE | ADMIN",
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601",
    "medico": { "crm": "string", "especialidade": "string" } | null,
    "atendente": { "setor": "string" } | null
  }
]
```

---

### `GET /api/user/me`

Retorna o perfil do usuário autenticado (lido do `sub` do JWT). Para o Master Admin retorna um objeto sintético.

**Resposta `200 OK`**

```json
{
  "id": "uuid",
  "nome": "string",
  "email": "string",
  "cpf": "string | null",
  "nascimento": "ISO 8601 | null",
  "fone": "string | null",
  "avatar": "string | null",
  "role": "MEDICO | ATENDENTE | ADMIN",
  "medico": { "crm": "string", "especialidade": "string" } | null,
  "atendente": { "setor": "string" } | null
}
```

> ℹ️ O retorno **não** está envelopado em `{ "data": ... }`.

**Erros**: `401 Unauthorized`, `404 User not found`, `500`.

---

### `GET /api/user/search/profissionais`

Lista paginada de profissionais (exclui `ADMIN`).

**Query params**

| Param  | Tipo   | Default | Descrição                                                  |
|--------|--------|---------|------------------------------------------------------------|
| busca  | string | —       | Busca por `nome` (case-insensitive) ou `cpf` (11 dígitos)  |
| role   | string | —       | `MEDICO`, `ATENDENTE` ou `TODOS`                           |
| page   | number | 1       | Página (12 itens por página)                               |

**Resposta `200 OK`**: array de usuários (mesma forma de `GET /api/user/`).

---

### `GET /api/user/search/pacientes`

Lista paginada de pacientes com filtros.

> ⚠️ A doc anterior usava `paciente` (singular) — a rota real é **`pacientes`**.

**Query params**

| Param | Tipo   | Default | Descrição                                                                            |
|-------|--------|---------|--------------------------------------------------------------------------------------|
| busca | string | —       | Busca múltipla: dígitos casam com `cpf`/`fone`/`cartaoSus`; `@` casa em `email`; texto casa em `nome` (case-insensitive) |
| sexo  | string | —       | `MASCULINO`, `FEMININO`, `OUTRO` ou `TODOS`                                          |
| page  | number | 1       | Página (12 itens por página)                                                         |

**Resposta `200 OK`**

```json
[
  {
    "id": "uuid",
    "nome": "string",
    "cpf": "string",
    "nascimento": "ISO 8601",
    "fone": "string",
    "email": "string | null",
    "cartaoSus": "string",
    "sexo": "MASCULINO | FEMININO | OUTRO",
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601"
  }
]
```

---

## 🧑‍💼 Atendente – `/api/atendente`

Protegido por `authToken` + `authorize(ATENDENTE, ADMIN)`.

### `POST /api/atendente/registerP`

Cadastra um novo paciente.

**Body** (validado por Joi)

```json
{
  "nome": "string (3..100)",
  "cpf": "string (validado, normalizado p/ 11 dígitos)",
  "cartaoSus": "string (CNS validado)",
  "nascimento": "YYYY-MM-DD",
  "fone": "string (formato (DD)XXXXX-XXXX)",
  "email": "string (email, opcional)"
}
```

> ⚠️ O **schema Joi não aceita** o campo `sexo`, mas o service grava `sexo` (default `OUTRO`). Ver Dúvidas.

**Resposta `200 OK`**

```json
{
  "id": "uuid",
  "nome": "string",
  "cpf": "string",
  "nascimento": "ISO 8601",
  "fone": "string",
  "email": "string | null",
  "cartaoSus": "string",
  "sexo": "OUTRO",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

**Erros**: `400` (validação / `"CPF já cadastrado!"` / `"CNS já cadastrado!"` / `"Registro duplicado"`), `401`, `500`.

---

### `PATCH /api/atendente/paciente/:id`

Atualiza dados do paciente.

**Body (parcial)**

```json
{
  "nome": "string?",
  "sexo": "MASCULINO | FEMININO | OUTRO?",
  "nascimento": "ISO 8601?",
  "fone": "string?",
  "email": "string?"
}
```

**Resposta `200 OK`**: paciente atualizado.
**Erros**: `404 Paciente não encontrado`, `500`.

> ⚠️ Não há schema Joi aplicado (sem `validate(...)` na rota). Ver Sugestões.

---

### `DELETE /api/atendente/paciente/:id`

Remove um paciente.

**Resposta**: `204 No Content`.
**Erros**: `404 Paciente não encontrado`.

---

### `POST /api/atendente/agendamento`

Cria um novo agendamento. O `createdById` é injetado a partir do JWT.

**Body**

```json
{
  "horario_atend": "ISO 8601 (obrigatório)",
  "duracaoMin": "number (default 30)",
  "statusUrgencia": "URGENTE | MODERADO | BAIXO (default BAIXO)",
  "status": "AGENDADO | CONFIRMADO | CANCELADO | FINALIZADO (default AGENDADO)",
  "tipo": "CONSULTA | EXAME | PROCEDIMENTO | RETORNO (default CONSULTA)",
  "patientId": "uuid (obrigatório)",
  "docId": "uuid do User do médico (obrigatório)",
  "motivo": "string?",
  "observacoes": "string?",
  "cancelReason": "string?"
}
```

**Resposta `200 OK`**: objeto `Agenda` criado.
**Erros**: `404 Paciente não encontrado`, `404 Médico não encontrado`, `500`.

> ⚠️ Existe o schema `registerService` (`registerAtendimentoSchema.ts`) mas ele **não é aplicado** na rota.

---

### `GET /api/atendente/agendamentos`

Lista paginada de agendamentos com filtros.

**Query params**

| Param          | Tipo   | Default | Descrição                                                  |
|----------------|--------|---------|------------------------------------------------------------|
| busca          | string | —       | Busca por `paciente.nome` ou `paciente.cpf` (11 dígitos)   |
| docId          | string | —       | Filtra por médico                                          |
| status         | string | —       | `AGENDADO`, `CONFIRMADO`, `CANCELADO`, `FINALIZADO`, `TODOS` |
| statusUrgencia | string | —       | `URGENTE`, `MODERADO`, `BAIXO`, `TODOS`                    |
| data           | string | —       | `YYYY-MM-DD` — filtra agendamentos do dia                  |
| page           | number | 1       | Página (12 por página)                                     |

**Resposta `200 OK`**: array de agendamentos com `paciente` e `medico` populados.

---

### `PATCH /api/atendente/profissional/:id`

Atualiza dados de um usuário profissional (médico/atendente). Senha (se enviada) é re-hasheada.

**Body (parcial)**

```json
{
  "nome": "string?",
  "email": "string?",
  "password": "string?",
  "nascimento": "ISO 8601?",
  "fone": "string?",
  "avatar": "string?",
  "especialidade": "string? (atualiza Doctor)",
  "setor": "string? (atualiza Attend)"
}
```

**Resposta `200 OK`**: usuário atualizado (com `medico` e `atendente`).
**Erros**: `404 Usuário não encontrado`.

> ⚠️ Não há schema Joi aplicado.

---

### `DELETE /api/atendente/profissional/:id`

Remove um usuário em transação: apaga agendas relacionadas, disponibilidades, exceções, registros de Doctor/Attend e o User. Tenta remover o avatar do Cloudinary (erro ignorado).

**Resposta**: `204 No Content`.
**Erros**: `404 Usuário não encontrado`, `500`.

---

## 🩺 Médico – `/api/medico`

Protegido por `authToken` + `authorize(ATENDENTE, ADMIN)`.

> ⚠️ Apesar do nome, **MEDICO não tem acesso** a essas rotas. Ver Sugestões.

### `POST /api/medico/disponibilidade`

Cria/atualiza (`upsert` por `docId+diaSemana`) a disponibilidade semanal de um médico.

**Body**

```json
{
  "docId": "uuid (User do médico)",
  "diaSemana": "number (0=domingo .. 6=sábado)",
  "horaInicio": "HH:MM (24h)",
  "horaFim": "HH:MM (24h)",
  "almocoInicio": "HH:MM (opcional)",
  "almocoFim": "HH:MM (opcional)"
}
```

**Resposta `201 Created`**: objeto `Disponibilidade`.

**Erros**

| Status | Mensagem                                          |
|--------|---------------------------------------------------|
| 400    | `"Dia da semana inválido"`                        |
| 400    | `"Formato de hora inválido"`                      |
| 400    | `"Hora de início deve ser menor que hora de fim"` |

---

### `GET /api/medico/disponibilidade/:docId`

Lista as disponibilidades semanais de um médico (ordenado por `diaSemana`).

**Resposta `200 OK`**: array de `Disponibilidade`.

---

### `DELETE /api/medico/disponibilidade/:id`

Remove uma disponibilidade pelo seu `id`.

**Resposta**: `204 No Content`.

---

### `GET /api/medico/slots/:docId`

Calcula slots livres de 30 min para um médico em uma data, considerando disponibilidade semanal, horário de almoço, exceções e agendamentos existentes.

**Query params**

| Param | Tipo   | Obrigatório | Descrição     |
|-------|--------|-------------|---------------|
| data  | string | sim         | `YYYY-MM-DD`  |

**Resposta `200 OK`**

```json
{
  "disponibilidade": {
    "id": "uuid",
    "docId": "uuid",
    "diaSemana": 1,
    "horaInicio": "08:00",
    "horaFim": "17:00",
    "almocoInicio": "12:00",
    "almocoFim": "13:00"
  },
  "slots": ["08:00", "08:30", "09:00", "..."],
  "ocupados": ["10:00", "10:30"]
}
```

**Erros**

| Status | Mensagem                                                |
|--------|---------------------------------------------------------|
| 400    | `"Data é obrigatória"`                                  |
| 404    | `"Médico não atende nesse dia"`                         |
| 404    | `"Médico não disponível nesse dia: <motivo>"` (exceção) |

---

### `POST /api/medico/excecao`

Cadastra exceção (dia em que o médico não atenderá).

**Body**

```json
{
  "docId": "uuid",
  "data": "ISO 8601 (data)",
  "motivo": "string (opcional)"
}
```

**Resposta `201 Created`**: `ExcecaoMedico`.
**Erros**: `400 "Já existe uma exceção cadastrada para esse dia"`.

---

### `GET /api/medico/excecao/:docId`

Lista exceções de um médico (ordenado por `data`).

**Resposta `200 OK`**: array de `ExcecaoMedico`.

---

### `DELETE /api/medico/excecao/:id`

Remove uma exceção pelo seu `id`.

**Resposta**: `204 No Content`.

---

## 📤 Upload – `/api/upload`

### `POST /api/upload/avatar`

Faz upload de imagem para o Cloudinary (transforma para 300×300, gravity `face`).

> ⚠️ **No código atual essa rota é pública** (não há `authToken`). Ver Sugestões.

**Request**: `multipart/form-data` com campo `avatar` (arquivo).

**Resposta `200 OK`**

```json
{ "url": "https://res.cloudinary.com/.../avatar.jpg" }
```

**Erros**

| Status | Mensagem                     |
|--------|------------------------------|
| 400    | `"Nenhuma imagem enviada"`   |
| 500    | `"Erro interno do servidor"` |

---

## 🩹 Util – `/api/test`

`GET /api/test` → `"Hello World!"` (sanity check, sem autenticação).

---

# Modelos (Prisma)

### Enums

- `Role`: `MEDICO | ATENDENTE | ADMIN`
- `Sexo`: `MASCULINO | FEMININO | OUTRO`
- `StatusUrgencia`: `URGENTE | MODERADO | BAIXO`
- `StatusAtendimento`: `AGENDADO | CONFIRMADO | CANCELADO | FINALIZADO`
- `TipoAtendimento`: `CONSULTA | EXAME | PROCEDIMENTO | RETORNO`

### User
`id, nome, cpf (unique, 11), nascimento, fone (11), email (unique), password (hash), avatar?, role, createdAt, updatedAt` + relação `medico?` / `atendente?`.

### Doctor
`userId (PK/FK→User), crm (unique), especialidade` + `disponibilidades`, `excecoes`, `agendas`.

### Attend
`userId (PK/FK→User), setor`.

### Patient
`id, nome, cpf (unique), nascimento, fone, email?, cartaoSus (unique), sexo (default OUTRO), createdAt, updatedAt`.

### Agenda
`id, horario_atend, duracaoMin (30), statusUrgencia (BAIXO), status (AGENDADO), tipo (CONSULTA), motivo?, observacoes?, cancelReason?, patientId, docId, createdById, createdAt, updatedAt`.

### Disponibilidade
`id, docId, diaSemana (0..6), horaInicio "HH:MM", horaFim "HH:MM", almocoInicio?, almocoFim?` — único por `(docId, diaSemana)`.

### ExcecaoMedico
`id, docId, data, motivo?` — único por `(docId, data)`.