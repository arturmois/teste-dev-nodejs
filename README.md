# Aplicação Node.js com Socket.IO e Autenticação

Esta aplicação é um sistema de chat em tempo real construído com Node.js, Socket.IO, Next.js e MongoDB. Utiliza autenticação com Passport.js e suporte a clustering para alta performance.

## Demonstração

Vídeo demonstrativo da aplicação: https://youtu.be/UalP6N4FMcs

## Tecnologias Utilizadas

- **Backend**: Node.js, Express, Socket.IO, Prisma ORM
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Banco de Dados**: MongoDB com Replica Set
- **Autenticação**: Passport.js com estratégia local
- **Clustering**: Socket.IO Cluster Adapter para escalabilidade
- **Containerização**: Docker e Docker Compose

## Pré-requisitos

- Node.js (versão 18 ou superior)
- Docker e Docker Compose
- Git

## Instalação e Execução com Docker Compose (Recomendado)

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd teste-dev-nodejs
```

### 2. Execute com Docker Compose

```bash
docker-compose up -d
```

Este comando irá:

- Criar e configurar um container MongoDB com Replica Set
- Construir e executar o servidor Node.js na porta 3001
- Construir e executar o cliente Next.js na porta 3000
- Configurar a rede interna para comunicação entre os serviços

### 3. Acesse a aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MongoDB**: localhost:27017

### 4. Para parar os serviços

```bash
docker-compose down
```

## Configuração do Banco de Dados (Apenas para Instalação Manual)

**Nota**: Esta seção é apenas necessária se você **NÃO** estiver usando Docker. O Docker Compose já configura automaticamente o MongoDB com Replica Set.

Para ambiente de desenvolvimento local (sem Docker), você precisará de uma URL do MongoDB Atlas:

1. Acesse https://www.mongodb.com/atlas
2. Crie uma conta gratuita
3. Crie um cluster
4. Obtenha a string de conexão
5. Configure a variável de ambiente:

```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/app-database?retryWrites=true&w=majority
```

## Instalação Manual

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd teste-dev-nodejs
```

### 2. Configuração do Servidor (Backend)

```bash
# Navegue para a pasta do servidor
cd server

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Gere o cliente Prisma
npm run prisma:generate

# Execute as migrações do banco
npm run prisma:push

# Popule o banco com dados iniciais (opcional)
npm run prisma:seed

# Execute em modo desenvolvimento
npm run dev

# OU execute em modo cluster para alta performance
npm run dev:cluster
```

### 3. Configuração do Cliente (Frontend)

```bash
# Em um novo terminal, navegue para a pasta do cliente
cd client

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute em modo desenvolvimento
npm run dev
```

### 4. Variáveis de Ambiente Necessárias

#### Servidor (`server/.env`):

```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/app-database?retryWrites=true&w=majority
SESSION_SECRET=seu_secret_muito_seguro_aqui
```

#### Cliente (`client/.env.local`):

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

## Scripts Disponíveis

### Servidor:

- `npm run dev` - Executa o servidor em modo desenvolvimento
- `npm run dev:cluster` - Executa o servidor em modo cluster
- `npm run build` - Constrói a aplicação para produção
- `npm run start` - Executa a aplicação em produção
- `npm run start:cluster` - Executa em produção com cluster
- `npm run prisma:generate` - Gera o cliente Prisma
- `npm run prisma:push` - Aplica mudanças no schema ao banco
- `npm run prisma:seed` - Popula o banco com dados iniciais

### Cliente:

- `npm run dev` - Executa o cliente em modo desenvolvimento
- `npm run build` - Constrói o cliente para produção
- `npm run start` - Executa o cliente em produção
- `npm run lint` - Executa o linter

## Arquitetura da Aplicação

### Backend

- **Express.js**: Framework web para Node.js
- **Socket.IO**: Comunicação em tempo real bidirecional
- **Prisma**: ORM para interação com MongoDB
- **Passport.js**: Middleware de autenticação
- **Clustering**: Utiliza o módulo cluster do Node.js com Socket.IO Cluster Adapter

### Frontend

- **Next.js**: Framework React para produção
- **Socket.IO Client**: Cliente para comunicação em tempo real
- **Tailwind CSS**: Framework CSS utilitário
- **React Hook Form**: Gerenciamento de formulários

### Banco de Dados

- **MongoDB**: Banco de dados NoSQL
- **Replica Set**: Configuração para alta disponibilidade
- **Modelos**:
  - `User`: Usuários do sistema
  - `Message`: Mensagens do chat

## Sistema de Autenticação

A aplicação utiliza Passport.js com estratégia local para autenticação:

- Registro e login de usuários
- Senhas criptografadas com bcrypt
- Sessões gerenciadas pelo Express
- Middleware de autenticação para rotas protegidas

## Clustering e Escalabilidade

O sistema suporta clustering para melhor performance:

- Utiliza o Socket.IO Cluster Adapter
- Distribui a carga entre múltiplos workers
- Sincronização de estado entre instâncias
- Balanceamento automático de conexões

## Referências e Artigos Utilizados

Durante o desenvolvimento desta aplicação, foram consultados os seguintes recursos:

1. **Socket.IO Cluster Adapter**: https://socket.io/docs/v4/cluster-adapter/

   - Implementação de clustering para Socket.IO
   - Sincronização de estado entre workers
   - Configuração de adapters personalizados

2. **Socket.IO com Passport**: https://socket.io/how-to/use-with-passport

   - Integração entre Socket.IO e Passport.js
   - Autenticação de sockets
   - Middleware de sessão compartilhado

3. **Passport Local Strategy**: https://www.passportjs.org/packages/passport-local/
   - Configuração da estratégia de autenticação local
   - Serialização e deserialização de usuários
   - Integração com Express sessions

## Links de Inspiração

Recursos adicionais que podem ser úteis para expandir e melhorar esta aplicação:

### Documentação Socket.IO

- **Socket.IO Server API**: https://socket.io/docs/v4/server-api/

  - Documentação completa da API do servidor
  - Métodos e eventos disponíveis
  - Configurações avançadas

- **Socket.IO Client API**: https://socket.io/docs/v4/client-api/
  - Documentação da API do cliente
  - Configuração de conexões
  - Gerenciamento de eventos

### Autenticação e Segurança

- **Socket.IO com Passport**: https://socket.io/how-to/use-with-passport

  - Guia detalhado de integração
  - Melhores práticas de segurança
  - Exemplos práticos

- **Passport Local Strategy**: https://www.passportjs.org/packages/passport-local/
  - Estratégia de autenticação local
  - Configuração e customização
  - Validação de credenciais

### Deploy e Containerização

- **Next.js com Docker**: https://github.com/vercel/next.js/tree/canary/examples/with-docker

  - Exemplo oficial de containerização
  - Configurações de produção
  - Otimizações de performance

- **Deploy VPS Dockerfile**: https://github.com/arturmois/deploy-vps/blob/main/Dockerfile
  - Configuração para deploy em VPS
  - Exemplo prático de produção
  - Scripts de automação

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.
