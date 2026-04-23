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

### GET api/user/

---

### GET api/user/me

---

### GET api/user/search/paciente

---

## POST

### POST api/auth/registerU

---

### POST api/auth/loginU

---

### POST api/auth/refresh

---

### POST api/auth/logout

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
  "nascimento": "YYYY-MM-DD",
  "email": "email@email.com",
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
  "nascimento": "YYYY-MM-DD",
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