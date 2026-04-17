# Project Management API

REST API para um sistema de gerenciamento de projetos, tarefas, clientes, leads e faturamento.

**Stack:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT

---

## Pré-requisitos

- Node.js 20+
- PostgreSQL instalado e rodando

---

## Configuração

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Copie o arquivo de exemplo e preencha as variáveis:

```bash
cp .env.example .env
```

| Variável          | Descrição                                      | Exemplo                                                             |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------- |
| `PORT`            | Porta do servidor                              | `3000`                                                              |
| `NODE_ENV`        | Ambiente de execução                           | `development`                                                       |
| `DATABASE_URL`    | String de conexão com o PostgreSQL             | `postgresql://pmuser:pm1234@localhost:5432/project_management_db`   |
| `JWT_SECRET`      | Chave secreta para geração dos tokens JWT      | `sua_chave_secreta`                                                 |
| `JWT_EXPIRES_IN`  | Tempo de expiração do token                    | `7d`                                                                |
| `ALLOWED_ORIGINS` | Origem permitida pelo CORS                     | `http://localhost:4200`                                             |

3. Crie o banco de dados no PostgreSQL:

```bash
sudo -u postgres psql -c "CREATE USER pmuser WITH PASSWORD 'pm1234';"
sudo -u postgres psql -c "CREATE DATABASE project_management_db OWNER pmuser;"
```

4. Execute as migrations:

```bash
npx prisma migrate deploy
```

---

## Rodando o servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm run build
npm start
```

O servidor estará disponível em `http://localhost:3000`.

---

## Endpoints

### Autenticação

| Método | Rota             | Descrição           |
| ------ | ---------------- | ------------------- |
| POST   | `/auth/register` | Cadastrar usuário   |
| POST   | `/auth/login`    | Login (retorna JWT) |

### Usuários *(requer autenticação)*

| Método | Rota          | Descrição                      |
| ------ | ------------- | ------------------------------ |
| GET    | `/users`      | Listar usuários *(admin)*      |
| GET    | `/users/:id`  | Buscar usuário                 |
| PATCH  | `/users/:id`  | Atualizar usuário              |
| DELETE | `/users/:id`  | Deletar usuário *(admin)*      |

### Projetos *(requer autenticação)*

| Método | Rota             | Descrição          |
| ------ | ---------------- | ------------------ |
| GET    | `/projects`      | Listar projetos    |
| POST   | `/projects`      | Criar projeto      |
| GET    | `/projects/:id`  | Buscar projeto     |
| PATCH  | `/projects/:id`  | Atualizar projeto  |
| DELETE | `/projects/:id`  | Deletar *(admin)*  |

### Tarefas *(requer autenticação)*

| Método | Rota          | Descrição         |
| ------ | ------------- | ----------------- |
| GET    | `/tasks`      | Listar tarefas    |
| POST   | `/tasks`      | Criar tarefa      |
| GET    | `/tasks/:id`  | Buscar tarefa     |
| PATCH  | `/tasks/:id`  | Atualizar tarefa  |
| DELETE | `/tasks/:id`  | Deletar *(admin)* |

### Leads *(requer autenticação)*

| Método | Rota                 | Descrição               |
| ------ | -------------------- | ----------------------- |
| GET    | `/leads`             | Listar leads            |
| POST   | `/leads`             | Criar lead              |
| GET    | `/leads/:id`         | Buscar lead             |
| PATCH  | `/leads/:id`         | Atualizar lead          |
| DELETE | `/leads/:id`         | Deletar *(admin)*       |
| POST   | `/leads/:id/convert` | Converter lead em cliente |

### Clientes *(requer autenticação)*

| Método | Rota            | Descrição         |
| ------ | --------------- | ----------------- |
| GET    | `/clients`      | Listar clientes   |
| POST   | `/clients`      | Criar cliente     |
| GET    | `/clients/:id`  | Buscar cliente    |
| PATCH  | `/clients/:id`  | Atualizar cliente |
| DELETE | `/clients/:id`  | Deletar *(admin)* |

### Faturas *(requer autenticação)*

| Método | Rota             | Descrição        |
| ------ | ---------------- | ---------------- |
| GET    | `/invoices`      | Listar faturas   |
| POST   | `/invoices`      | Criar fatura     |
| GET    | `/invoices/:id`  | Buscar fatura    |
| PATCH  | `/invoices/:id`  | Atualizar fatura |
| DELETE | `/invoices/:id`  | Deletar *(admin)*|

### Outros

| Método | Rota      | Descrição                    |
| ------ | --------- | ---------------------------- |
| GET    | `/health` | Status do servidor           |
| GET    | `/docs`   | Documentação Swagger (OpenAPI) |

---

## Autenticação

Todas as rotas protegidas exigem o header:

```
Authorization: Bearer <token>
```

O token é retornado no login e expira em 7 dias por padrão.

---

## Comandos úteis

```bash
npx prisma studio        # Interface visual do banco de dados
npx prisma migrate dev   # Criar nova migration em desenvolvimento
npm run build            # Compilar TypeScript
```
