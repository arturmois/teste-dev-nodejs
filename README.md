# Chat em Tempo Real - Teste Dev Node.js

Aplicação de chat em tempo real desenvolvida com Next.js (frontend) e Node.js com Express (backend), utilizando Socket.IO para comunicação em tempo real e MongoDB com Prisma como ORM.

## 🏗️ Arquitetura

- **Frontend**: Next.js 15 com React 19, TailwindCSS e shadcn/ui
- **Backend**: Node.js com Express, Socket.IO, Passport.js para autenticação
- **Banco de Dados**: MongoDB com Prisma ORM
- **Autenticação**: Session-based com Passport.js
- **Tempo Real**: Socket.IO para mensagens instantâneas

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- MongoDB (local ou MongoDB Atlas)
- npm ou yarn

## 🚀 Setup Rápido

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd teste-dev-nodejs
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie os arquivos de exemplo e configure suas variáveis:

```bash
# Verificar se os arquivos .env existem
npm run check:env

# Copiar arquivos de exemplo
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

#### Variáveis principais:

**`.env` (raiz):**

```env
# Ambiente
NODE_ENV=development

# Portas
CLIENT_PORT=3000
SERVER_PORT=3001

# URLs
CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:3001

# Banco de dados MongoDB
DATABASE_URL="mongodb://localhost:27017/teste-dev-nodejs"

# Sessão
SESSION_SECRET=your-super-secret-session-key-here-change-in-production
```

**`server/.env`:**

```env
# Ambiente
NODE_ENV=development
PORT=3001

# URLs
CLIENT_URL=http://localhost:3000

# Banco de dados MongoDB
DATABASE_URL="mongodb://localhost:27017/teste-dev-nodejs"

# Sessão
SESSION_SECRET=your-super-secret-session-key-here-change-in-production
```

**`client/.env`:**

```env
# Ambiente
NODE_ENV=development
PORT=3000

# URL do servidor
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

### 4. Setup do Prisma

Execute o setup completo do Prisma:

```bash
# Gerar o cliente Prisma
npm run prisma:generate

# Sincronizar o schema com o banco
npm run prisma:push

# Popular o banco com dados iniciais (opcional)
npm run prisma:seed
```

### 5. Executar a aplicação

**Modo desenvolvimento (ambas as aplicações simultaneamente):**

```bash
npm run dev
```

**Executar aplicações separadamente:**

```bash
# Terminal 1 - Server
npm run dev:server

# Terminal 2 - Client
npm run dev:client
```

### 6. Acessar a aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📦 Scripts Disponíveis

### Scripts da Raiz

```bash
npm run install:all     # Instala dependências de todas as aplicações
npm run dev             # Executa client e server em modo desenvolvimento
npm run dev:client      # Executa apenas o client
npm run dev:server      # Executa apenas o server
npm run build           # Build de produção de ambas aplicações
npm run start           # Executa ambas aplicações em modo produção
npm run setup           # Setup completo (install + prisma)
npm run check:env       # Verifica se os arquivos .env existem
```

### Scripts do Prisma

```bash
npm run prisma:generate # Gera o cliente Prisma
npm run prisma:push     # Sincroniza schema com o banco
npm run prisma:seed     # Popula o banco com dados iniciais
```

## 🐳 Docker (Opcional)

Para executar com Docker:

```bash
docker-compose up --build
```

## 🗄️ Banco de Dados

### MongoDB Local

1. Instale o MongoDB Community Edition
2. Inicie o serviço MongoDB
3. Configure a `DATABASE_URL` para: `mongodb://localhost:27017/teste-dev-nodejs`

### MongoDB Atlas (Cloud)

1. Crie uma conta no [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie um cluster
3. Configure a `DATABASE_URL` com sua connection string
4. Exemplo: `mongodb+srv://username:password@cluster.mongodb.net/teste-dev-nodejs`

### Schema do Banco

O projeto utiliza os seguintes modelos:

- **User**: Usuários do sistema

  - id, name, username, password
  - is_online, last_seen, avatar
  - Relações com mensagens enviadas e recebidas

- **Message**: Mensagens do chat
  - id, content, read
  - sender_id, receiver_id
  - Timestamps de criação e atualização

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
teste-dev-nodejs/
├── client/                 # Frontend Next.js
│   ├── src/
│   │   ├── app/           # App Router
│   │   ├── components/    # Componentes React
│   │   └── lib/          # Utilitários
│   └── package.json
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── controllers/  # Controladores
│   │   ├── middlewares/  # Middlewares
│   │   ├── routes/       # Rotas
│   │   └── utils/        # Utilitários
│   ├── prisma/           # Schema e seeds
│   └── package.json
├── docker-compose.yml     # Configuração Docker
└── package.json          # Scripts da raiz
```

### Tecnologias Utilizadas

**Frontend:**

- Next.js 15 com App Router
- React 19
- TailwindCSS 4
- shadcn/ui components
- Socket.IO Client
- React Hook Form + Zod

**Backend:**

- Express.js
- Socket.IO
- Prisma ORM
- Passport.js
- bcrypt
- express-session

## 🔐 Autenticação

O sistema utiliza autenticação baseada em sessão com Passport.js:

1. Login com username/password
2. Sessão armazenada no servidor
3. Middleware de autenticação protege rotas
4. Socket.IO integrado com sessões

## 📝 API Endpoints

- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário logado
- `GET /api/users` - Listar usuários
- `GET /api/messages/:userId` - Mensagens com usuário específico
- `POST /api/messages` - Enviar mensagem

## 🔄 Socket.IO Events

**Client → Server:**

- `join_room` - Entrar em sala de chat
- `send_message` - Enviar mensagem
- `user_typing` - Usuário digitando

**Server → Client:**

- `new_message` - Nova mensagem recebida
- `user_online` - Usuário ficou online
- `user_offline` - Usuário ficou offline
- `typing` - Alguém está digitando

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro "There is an error with the server environment variables"**

   - Certifique-se de que o arquivo `server/.env` existe e contém todas as variáveis:
   ```bash
   # Copie o arquivo de exemplo
   cp server/.env.example server/.env
   
   # Edite o arquivo com suas configurações
   nano server/.env
   ```
   - Variáveis obrigatórias: `PORT`, `CLIENT_URL`, `DATABASE_URL`, `SESSION_SECRET`

2. **Erro de conexão com MongoDB**

   - Verifique se o MongoDB está executando
   - Confirme a `DATABASE_URL` no arquivo `.env`
   - Para MongoDB local: `mongodb://localhost:27017/teste-dev-nodejs`

3. **Prisma Client não encontrado**

   ```bash
   npm run prisma:generate
   ```

4. **Erro "Cannot find module '../../generated/prisma'"**

   - Execute o comando para gerar o cliente Prisma:
   ```bash
   npm run prisma:generate
   ```

5. **Portas em uso**

   - Altere as portas nos arquivos `.env`
   - Verifique processos usando: `lsof -i :3000` ou `lsof -i :3001`
   - O Next.js automaticamente usará uma porta alternativa se necessário

6. **Socket.IO não conecta**
   - Verifique se o servidor está rodando
   - Confirme as URLs nos arquivos de ambiente

### Logs

Para debugar, verifique os logs:

- Client: Console do navegador
- Server: Terminal onde o servidor está executando

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.
