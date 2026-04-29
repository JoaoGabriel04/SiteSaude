# Estrutura

O backend é responsável por fornecer uma API REST para o gerenciamento de usuários (Atendentes e Doutores), pacientes e os atendimentos

### A aplicação foi desenvolvida utilizando: 

- Node.js com Typescript
- Prisma ORM
- PostgreeSQL
- Docker para containerização

---

# Arquitetura

O backend segue uma arquitetura em camadas, separando responsabilidades para facilitar manutenção e escalabilidade:

Request → Middlewares (authenticate → authorize → validate) → Controller → Service → Repository → Prisma → Banco de Dados

- Middlewares: executados antes dos controllers, são responsáveis por tarefas transversais como autenticação (JWT), autorização baseada em roles e validação de dados utilizando Joi

- Controller: recebe a requisição HTTP, delega a execução para a camada de service e formata a resposta, sem conter regras de negócio

- Service: contém as regras de negócio da aplicação, como validações específicas (ex: CPF ou CNS já cadastrados) e orquestração das operações

- Repository: camada responsável por abstrair o acesso ao banco de dados, utilizando o Prisma para execução de queries

- Prisma ORM: responsável por mapear e realizar operações no banco de dados PostgreSQL

### Observação

>Essa separação permite que regras de negócio fiquem isoladas da camada HTTP, facilitando testes, manutenção e evolução do sistema.

## Autenticação e Autorização

O backend utiliza autenticação baseada em JWT (JSON Web Token).

### Autenticação

A autenticação é realizada através do middleware `authenticate`, que:

- Verifica a presença do token no header Authorization
- Valida o token JWT
- Injeta os dados do usuário em `req.user`

#### Formato do header:

>     Authorization: Bearer SEU_TOKEN_AQUI

#### Payload

O payload contém:
>     sub: id do usuário  
>     role: papel do usuário

### Autorização

A autorização é feita através do middleware `authorize`, que:

- Verifica o papel (role) do usuário
- Permite ou bloqueia o acesso à rota

Exemplo de uso:
```ts
router.post("/", authToken, authorize(Role.ATENDENTE, Role.ADMIN), controller)
```

## Validação de Dados

A validação de dados é realizada utilizando Joi através de middlewares.

- Os schemas são definidos na pasta `/schemas`
- A validação ocorre antes de chegar ao controller
- Dados inválidos retornam erro 400

>Além disso, funções utilitárias, localizadas na pasta `/utils` são utilizadas para validações específicas, como CPF e CNS.

## Tratamento de Erros

O sistema utiliza uma classe personalizada `AppError` para padronizar erros.

- Cada erro possui uma mensagem e um código HTTP
- Erros conhecidos são tratados diretamente
- Erros inesperados retornam status 500

Exemplo:
```ts
throw new AppError("CPF já cadastrado", 400)
```
# Endpoints

> ⚠️ Em ambiente de desenvolvimento, valores de teste podem ser utilizados para alguns campos (ver seção Ambiente de Desenvolvimento)

## GET

### GET /api/atendente/agendamentos
### GET /api/user/search/profissionais
### GET /api/medico/disponibilidade/:docId
### GET /api/medico/slots/:docId
### GET /api/medico/excecao/:docId

### GET api/user/

Descrição: retorna um lista com todos os usuários cadastrados no sistema

Autenticação: necessária (ADMIN)  
Header:
Authorization: Bearer `TOKEN`

#### Resposta de sucesso

`200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "string",
      "cpf": "string",
      "nascimento": "ISO 8601",
      "fone": "string",
      "email": "string",
      "avatar": "string | null",
      "role": "MEDICO | ATENDENTE",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601",
      "medico": {
        "crm": "string",
        "especialidade": "string"
      } | null,
      "atendente": {
        "setor": "string"
      } | null
    }, {...}
  ]
}
```
#### Observações

- O campo `medico` será preenchido apenas quando `role = MEDICO`
- O campo `atendente` será preenchido apenas quando `role = ATENDENTE`
- O outro campo será `null`

#### Exemplo - Médico

```json
{
  "role": "MEDICO",
  "medico": {
    "crm": "SSP/MA 123432",
    "especialidade": "CARDIOLOGISTA"
  },
  "atendente": null
}
```

#### Exemplo - Atendente
```json
{
  "role": "ATENDENTE",
  "medico": null,
  "atendente": {
    "setor": "RECEPÇÃO"
  }
}
```
---

### GET api/user/me

Descrição: retorna o perfil do user condizendo com o ID vindo do token

Autenticação: necessária (ATENDENTE, ADMIN)  
Header:
Authorization: Bearer `TOKEN`

#### Resposta de sucesso

`200 OK`

```json
{
  "data":
    {
      "id": "uuid",
      "nome": "string",
      "cpf": "string",
      "nascimento": "ISO 8601",
      "fone": "string",
      "email": "string",
      "avatar": "string | null",
      "role": "MEDICO | ATENDENTE",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601",
      "medico": {
        "crm": "string",
        "especialidade": "string"
      } | null,
      "atendente": {
        "setor": "string"
      } | null
    }
}
```

---

### GET api/user/search/paciente

Descrição: retorna a lista de pacientes com filtros opcionais

Autenticação: necessária (ATENDENTE, ADMIN)  
Header:
Authorization: Bearer `TOKEN`

#### Query Params (opcional)

- `nome` (string) → filtra por nome (parcial)
- `cpf` (string) → filtra por CPF
- `cartaoSus` (string) → filtra por CNS
- `telefone` (string) → filtra por telefone
- `page` (number) → número da página (default: 1)
- `limit` (number) → quantidade por página (default: 10)

#### Exemplo de requisição

GET /api/patients?busca=joao&page=1

#### Resposta de sucesso

`200 OK`

```json
[
	{
		"id": "uuid",
		"nome": "string",
		"cpf": "string",
		"nascimento": "ISO 8601",
		"fone": "string",
		"email": "string",
		"cartaoSus": "string",
		"createdAt": "ISO 8601",
		"updatedAt": "ISO 8601"
	}, 
  {...}
]
```
---

## POST

### POST api/medico/disponibilidade
### POST api/medico/excecao

### POST api/auth/registerU
Descrição: registra usuários (MEDICO e ATENDENTE)

Autenticação: necessária `ADMIN`  
Header:
Authorization: Bearer `TOKEN`

#### Body

```json
{
  "nome": "string",
  "cpf": "string",
  "password": "string",
  "nascimento": "AAAA-MM-DD",
  "email": "string",
  "role": "MEDICO" | "ATENDENTE",
  "fone": "string",
  "crm": "string",
  "especialidade": "string",
  "setor": "string"
}
```

#### Resposta de sucesso

`200 OK`

```json
{ 
  "message":"Profissional Registrado com Sucesso"
}
```

#### Observações

- Os campos `crm` e `especialidade` devem ser preenchidos apenas quando o **user** é `MEDICO` em `role`
- O campo `setor` só deve ser preenchido apenas quando o **user** é `ATENDENTE` em `role`
- O campo `password` é armazenado de forma criptografada e não é retornado pela API

#### Erros

* `400` - Email já cadastrado
* `400` - CRM já cadastrado
* `400` - CPF já cadastrado
* `400` - Role Invalida
* `500` - Erro interno do servidor 

---

### POST api/auth/loginU

Descrição: registra usuários (MEDICO, ATENDENTE e ADMIN)

Autenticação: necessária `ADMIN`  
Header:
Authorization: Bearer `TOKEN`

#### Body

```json
{
  "email": "string",
  "password": "string"
}
```

#### Resposta de Sucesso

`200 OK`

- Define um cookie `refresh_token` automaticamente

```json
{
  "accessToken": "JWT",
  "user": {
    "id": "uuid",
    "nome": "string",
    "cpf": "string",
    "nascimento": "ISO 8601",
    "fone": "string",
    "email": "string",
    "avatar": "string | null",
    "role": "MEDICO | ATENDENTE",
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601",
    "medico": {
      "crm": "string",
      "especialidade": "string"
    } | null,
    "atendente": {
      "setor": "string"
    } | null
  }
}
```

#### Observações

- O campo `accessToken` deve ser utilizado no header das requisições:
  
  >Authorization: Bearer `<token>`

- O campo `medico` será preenchido apenas quando `role = MEDICO`

- O campo `atendente` será preenchido apenas quando `role = ATENDENTE`

- Campos sensíveis como `password` não são retornados pela API

#### Erros

- `400` - Email ou senha inválidos
- `500` - Erro interno do servidor

---

### POST /api/auth/refresh

Descrição: gera um novo access token a partir do refresh token

Autenticação: não requer Bearer Token

#### Cookies 

- `refresh_token` (string) → enviado automaticamente pelo navegador

#### Body

```
Não é necessário
```

#### Resposta de Sucesso

`200 OK`

```json
{
  "accessToken": "string (JWT)"
}
```

#### Observações

- O `accessToken` deve ser utilizado no header das requisições:

  >Authorization: Bearer TOKEN

- O `refresh_token` é armazenado em cookie HttpOnly
- O cookie é enviado automaticamente pelo navegador

#### Erros

- `400` - Invalid token payload
- `400` - Invalid refresh token
- `401` - Refresh token ausente
- `500` - Erro interno do servidor
- `500` - JWT secret not found

---

### POST /api/auth/logout

Descrição: encerra a sessão do usuário removendo o refresh token

Autenticação: não necessária

#### Cookies

- `refresh_token` (string) → será removido

#### Body

Não é necessário

#### Resposta de Sucesso

`200 OK`

```json
{
  "message": "Logout realizado com sucesso"
}
```

---

### POST api/atendente/registerP

Descrição: cadastra um novo paciente

Autenticação: necessária (ATENDENTE, ADMIN)  
Header:  

>     Authorization: Bearer SEU_TOKEN

#### Body

```json
{
  "nome": "string",
  "cpf": "string",
  "nascimento": "AAAA-MM-DD",
  "email": "string",
  "cartaoSus": "string",
  "telefone": "string"
}
````

#### Resposta de sucesso

`200 OK`

```json
{
  "id": "uuid",
  "nome": "string",
  "cpf": "string",
  "nascimento": "ISO 8601",
  "telefone": "string",
  "email": "string",
  "cartaoSus": "string",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

#### Erros

* `400` - Dados inválidos
* `409` - CPF ou CNS já cadastrado
* `401` - Não autenticado

---

### POST api/atendente/agendamento

---

# Padrão de Resposta

### Sucesso

```json
"data": {...}
```
### Erro 

```json
"error": "mensagem"
```

## PATCH

### PATCH /api/atendente/paciente/:id


## DELETE

### DELETE /api/atendente/paciente/:id
### DELETE /api/medico/disponibilidade/:id
### DELETE /api/medico/excecao/:id