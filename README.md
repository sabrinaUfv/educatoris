# e-ducatoris

Plataforma de recursos educacionais para professores de Física.  
Projeto acadêmico — INF221 Engenharia de Software I, UFV.

---

## ⚡ Setup em 30 segundos

### Linux/macOS
```bash
bash setup.sh
```

### Windows
```cmd
setup.bat
```

**Depois:**
```bash
yarn dev
```

→ **[Ver SETUP.md](SETUP.md) para detalhes do setup automático**

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [Yarn](https://yarnpkg.com/) v4.0+ (recomendado) ou npm

Verifique sua versão:
```bash
node -v   # deve ser >= 18
yarn -v   # ou npm -v
```

Se não tiver yarn:
```bash
npm install -g yarn
```

---

## Estrutura do Projeto

```
educatoris/
├── backend/              Node.js + Express + SQLite
├── frontend/             Next.js 14 + React + Tailwind
├── setup.sh / setup.bat  Scripts de setup automático
├── SETUP.md              Guia de setup
├── YARN_GUIDE.md         Referência de comandos yarn
├── GUIDE.md              Guia completo
└── README.md             Este arquivo
```

**Stack:** Node.js + Express | Next.js 14 | SQLite | Jest | Cypress | Yarn Workspaces

---

## Backend

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e defina um segredo para o JWT:

```env
PORT=3001
JWT_SECRET=coloque_uma_string_longa_e_aleatoria_aqui
```

### 3. Popular o banco de dados

```bash
npm run seed
```

Isso cria o arquivo `educatoris.db` e insere:
- 3 planos de assinatura (Básico, Intermediário, Avançado)
- 1 usuário administrador
- 1 professor de demonstração
- Conteúdos de exemplo para os 3 anos do Ensino Médio

**Credenciais criadas pelo seed:**

| Perfil       | E-mail                    | Senha    |
|--------------|---------------------------|----------|
| Administrador | admin@educatoris.com     | admin123 |
| Professor     | prof@educatoris.com      | prof123  |

### 4. Iniciar o servidor

```bash
npm run dev      # desenvolvimento (reinicia automaticamente)
# ou
npm start        # produção
```

O backend ficará disponível em `http://localhost:3001`.

Teste com: `http://localhost:3001/api/health`  
Resposta esperada: `{ "status": "ok" }`

---

## Frontend

### 1. Instalar dependências

```bash
cd frontend
npm install
```

### 2. Variável de ambiente (opcional)

Por padrão o frontend aponta para `http://localhost:3001/api`.  
Se precisar mudar, crie um arquivo `.env.local` dentro de `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Iniciar

```bash
npm run dev
```

O frontend ficará disponível em `http://localhost:3000`.

---

## Rodando os dois juntos

### Com Yarn (Recomendado)
```bash
yarn install:all   # Instala tudo
yarn seed          # Popula banco de dados
yarn dev           # Backend + Frontend simultaneamente
```

Acesse `http://localhost:3000` no navegador.

### Com npm (Legado)
Abra dois terminais:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run seed
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:3000` no navegador.

→ **[Ver YARN_GUIDE.md](YARN_GUIDE.md) para instruções detalhadas com yarn**

---

## Rotas da API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/login` | Login | — |
| POST | `/api/auth/cadastro` | Cadastro de professor | — |
| POST | `/api/auth/logout` | Logout | ✓ |
| POST | `/api/auth/encerrar-sessoes` | Encerra outras sessões | ✓ |
| GET | `/api/conteudo/ano/:ano` | Lista temas por ano (1, 2 ou 3) | ✓ |
| GET | `/api/conteudo/buscar?q=termo` | Busca temas por palavra-chave | ✓ |
| GET | `/api/conteudo/laboratorios` | Lista labs permitidos pelo plano | ✓ |
| GET | `/api/materiais/tema/:idConteudo` | Lista materiais de um tema | ✓ |
| GET | `/api/materiais/:id/download` | Baixa PDF com marca d'água | ✓ |
| GET | `/api/materiais/laboratorio/:id/acessar` | Acessa laboratório | ✓ |
| GET | `/api/planos` | Lista planos disponíveis | ✓ |
| GET | `/api/planos/meu` | Plano ativo do professor | ✓ |
| POST | `/api/planos/assinar` | Muda plano | ✓ |
| GET | `/api/admin/professores` | Lista professores | Admin |
| PATCH | `/api/admin/professores/:id/status` | Bloqueia/desbloqueia | Admin |
| PUT | `/api/admin/planos/:id` | Atualiza preço do plano | Admin |
| POST | `/api/admin/conteudos` | Adiciona conteúdo | Admin |
| POST | `/api/admin/materiais` | Adiciona material | Admin |
| DELETE | `/api/admin/materiais/:id` | Inativa material (soft delete) | Admin |

---

## Testes Automatizados

### Testes Unitários (Backend - Jest)

```bash
cd backend
npm test              # Roda todos os 22 testes
npm run test:watch    # Watch mode
npm run test:coverage # Relatório de cobertura
```

✅ **22 testes implementados:**
- PlanoRepository (5 testes)
- MaterialRepository (6 testes)
- AuthService (8 testes)
- ControladorAutenticacao (3 testes)

Veja [backend/TESTING.md](backend/TESTING.md) para detalhes.

### Testes de Aceitação (Frontend - Cypress)

```bash
cd frontend
npm run e2e           # Cypress UI (interativo)
npm run e2e:run       # Cypress headless (CI/CD)
```

✅ **5 suítes E2E implementadas:**
1. Autenticação (login, logout)
2. Navegação de conteúdos (busca com acentuação)
3. Gerenciamento de planos (admin)
4. Gerenciamento de materiais (admin)
5. Download de PDF com criptografia

Veja [frontend/E2E_TESTS.md](frontend/E2E_TESTS.md) para detalhes.

---

## Funcionalidades Implementadas

### ✅ PDF com Senha (CPF)
- PDFs gerados são criptografados com AES-256
- Senha = CPF do usuário (sem caracteres especiais)
- Padrão Decorator: `PDFComSenha.js`
- Testes em `PDFComSenha.test.js`

### ✅ Admin sem Limite de Dispositivos
- Admin pode ter > 3 sessões simultâneas
- Professor limitado a 3 dispositivos (descartando sessões antigas)
- Testes em `AuthService.test.js` e `ControladorAutenticacao.test.js`

### ✅ Sessões com TTL (24 horas)
- Sessões expiram após 24 horas
- Validação com timestamp + flag de status
- JWT também com 24h de expiração

### ✅ Busca com Normalização de Acentos
- Busca "acido" encontra "ácido"
- Implementado em `ConteudoService`

---

## Documentação

- **[GUIDE.md](GUIDE.md)** — Guia completo de setup, execução e troubleshooting
- **[backend/TESTING.md](backend/TESTING.md)** — Detalhes dos testes unitários
- **[frontend/E2E_TESTS.md](frontend/E2E_TESTS.md)** — Detalhes dos testes E2E

---

## Padrões de projeto implementados

| Padrão | Arquivo |
|--------|---------|
| Singleton | `src/patterns/singleton/AuthService.js` |
| Factory | `src/patterns/factory/MaterialFactory.js` |
| Proxy | `src/patterns/proxy/MaterialProxy.js` |
| Decorator | `src/patterns/decorator/PDF*.js` |
| Facade | `src/patterns/facade/ConteudoService.js` |

---
