# 🧶 Guia de Uso com Yarn - e-ducatoris

Organização de processos e instalação usando **Yarn** como gerenciador de pacotes.

---

## 📦 Instalação de Dependências

### Opção 1: Instalar Tudo (Recomendado)
```bash
yarn install:all
```
Instala dependências do root, backend e frontend em sequência.

### Opção 2: Instalar Separadamente
```bash
# Apenas backend
yarn install:backend

# Apenas frontend
yarn install:frontend

# Root + ambos
yarn
cd backend && yarn
cd frontend && yarn
```

---

## 🚀 Rodando a Aplicação

### Opção 1: Backend + Frontend Simultâneos (Recomendado)
```bash
# Do diretório raiz
yarn dev
```
Isso abre dois processos:
- Backend em `http://localhost:3001`
- Frontend em `http://localhost:3000`

Ambos reiniciam automaticamente ao salvar arquivos (nodemon + next dev).

### Opção 2: Backend e Frontend Separados
**Terminal 1 — Backend:**
```bash
yarn dev:backend
# ou
cd backend && yarn dev
```

**Terminal 2 — Frontend:**
```bash
yarn dev:frontend
# ou
cd frontend && yarn dev
```

### Opção 3: Produção
```bash
yarn build      # Build frontend
yarn start      # Inicia backend em produção
```

---

## 🌱 Seed do Banco de Dados

```bash
yarn seed
```
Executa `backend/src/db/seed.js` criando dados de teste:
- 3 planos de assinatura
- 1 admin + 1 professor
- Conteúdos de exemplo

**Credenciais criadas:**
- Admin: `admin@educatoris.com` / `admin123`
- Professor: `professor@example.com` / `password123`

---

## 🧪 Testes Automatizados

### Testes Unitários (Backend)

**Rodar tudo:**
```bash
yarn test
```

**Watch mode (reexecuta ao salvar):**
```bash
yarn test:watch
```

**Com cobertura:**
```bash
yarn test:coverage
```

### Testes E2E (Frontend)

**Interface interativa (Cypress UI):**
```bash
yarn e2e
```
Abre o Cypress Test Runner — escolha os testes manualmente.

**Headless (para CI/CD):**
```bash
yarn e2e:run
```

**Headless com saída resumida:**
```bash
yarn e2e:headless
```

---

## 📋 Fluxo Completo para Novo Desenvolvedor

```bash
# 1. Clonar e entrar no diretório
git clone <repo>
cd educatoris

# 2. Instalar dependências (tudo)
yarn install:all

# 3. Criar seed do banco
yarn seed

# 4. Rodar backend + frontend
yarn dev
# Abre em localhost:3000

# 5. Em outro terminal, rodar testes
yarn test              # Unitários
yarn e2e:run          # E2E (requer yarn dev rodando)
```

---

## 🎯 Comandos por Caso de Uso

### 🔨 Desenvolvimento Normal
```bash
yarn dev                # Backend + Frontend juntos
# Em outro terminal:
yarn test:watch        # Testes em watch
```

### 🧪 Desenvolvendo com Testes
```bash
# Terminal 1
yarn dev

# Terminal 2
yarn test:watch

# Terminal 3
yarn e2e               # Cypress UI para teste E2E interativo
```

### 📦 Antes de fazer Commit
```bash
yarn test              # Todos os testes passam?
yarn test:coverage     # Cobertura >50%?
yarn e2e:run          # E2E funcionam? (requer yarn dev)
```

### 🚀 Para Produção
```bash
yarn build
yarn start
```

---

## 🔑 Referência Rápida de Comandos

| Comando | O quê | Tipo |
|---------|-------|------|
| `yarn install:all` | Instala tudo | Setup |
| `yarn seed` | Popula BD | Setup |
| `yarn dev` | Backend + Frontend | Dev |
| `yarn dev:backend` | Só backend | Dev |
| `yarn dev:frontend` | Só frontend | Dev |
| `yarn test` | Testes unitários | Test |
| `yarn test:watch` | Testes (watch) | Test |
| `yarn test:coverage` | Testes (cobertura) | Test |
| `yarn e2e` | Cypress UI | Test |
| `yarn e2e:run` | Cypress headless | Test |
| `yarn build` | Build Next.js | Build |
| `yarn start` | Produção | Build |

---

## 🔧 Workspaces do Yarn

Este projeto usa **Yarn Workspaces** para gerenciar backend + frontend como um monorepo:

```json
"workspaces": ["backend", "frontend"]
```

**Benefícios:**
- Uma instalação (`yarn`) reutiliza dependências comuns
- Comando raiz coordena tudo
- Melhor para monorepos

**Comando para entender a estrutura:**
```bash
yarn workspaces list
```

---

## ⚠️ Troubleshooting com Yarn

### "Command not found: yarn"
Instale yarn globalmente:
```bash
npm install -g yarn
```

### "Port 3001 already in use"
```bash
# Encontre processo na porta
lsof -i :3001

# Mate o processo (em caso de emergência)
kill -9 <PID>

# Ou configure porta diferente no backend/.env
PORT=3002 yarn dev:backend
```

### "Cannot find module"
```bash
# Limpe cache e reinstale
yarn cache clean
rm -rf node_modules backend/node_modules frontend/node_modules yarn.lock
yarn install:all
```

### Concurrently não encontrado
```bash
# Instale globalmente (se necessário)
yarn global add concurrently

# Ou use npm como fallback
npm run dev  # De outro terminal
```

### Cypress não acha elementos
1. Verificar: `yarn dev` está rodando?
2. Verificar: Frontend em `localhost:3000`?
3. Aumentar timeout em `frontend/cypress.config.js`

---

## 📚 Documentação Complementar

- [GUIDE.md](GUIDE.md) — Guia geral (npm/yarn)
- [backend/TESTING.md](backend/TESTING.md) — Detalhes testes unitários
- [frontend/E2E_TESTS.md](frontend/E2E_TESTS.md) — Detalhes testes E2E
- [README.md](README.md) — Overview do projeto

---

## 💡 Dicas de Produtividade

### Alias no .bashrc / .zshrc
```bash
alias yd='yarn dev'
alias yt='yarn test'
alias ye='yarn e2e:run'
alias yia='yarn install:all'
```

Após adicionar, recarregue seu shell:
```bash
source ~/.bashrc  # ou ~/.zshrc
```

### VSCode Shortcuts
Adicione em `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "yarn dev",
      "type": "shell",
      "command": "yarn dev",
      "problemMatcher": [],
      "presentation": { "echo": true, "reveal": "silent" }
    }
  ]
}
```

Rodे com Ctrl+Shift+B

---

**Última atualização:** 2026-06-15  
**Yarn version:** ^4.0 (compatível com ^1.22)
