# e-ducatoris - Guia de Configuração e Execução

## 📋 Sumário Rápido (com Yarn)

```bash
# Instalar tudo
yarn install:all

# Rodar backend + frontend juntos (RECOMENDADO)
yarn dev

# Ou rodar separadamente
# Terminal 1
yarn dev:backend

# Terminal 2
yarn dev:frontend

# Testes
yarn test              # Unitários
yarn test:watch        # Watch mode
yarn test:coverage     # Com cobertura
yarn e2e:run          # E2E headless (requer yarn dev rodando)
```

**→ [Ver YARN_GUIDE.md](YARN_GUIDE.md) para guia completo com yarn**

---

## Equivalente com npm (legado)

```bash
# Backend
cd backend
npm install
npm run dev          # Servidor na porta 3001

# Frontend (outro terminal)
cd frontend
npm install
npm run dev          # Aplicação na porta 3000

# Testes (backend)
cd backend
npm test             # Unitários
npm run test:watch   # Watch mode
npm run test:coverage # Com cobertura

# Testes (frontend)
cd frontend
npm run e2e          # Cypress UI (interativo)
npm run e2e:run      # Cypress headless (CI)
```

---

## 🔧 Instalação e Setup

### Pré-requisitos
- Node.js 18+ 
- npm 9+
- SQLite3 (geralmente incluído no Node)

### Backend

```bash
cd backend

# 1. Instalar dependências
npm install

# 2. Configurar banco de dados (se necessário)
# O banco SQLite é criado automaticamente em backend/educatoris.db

# 3. Rodar migrations/seeds (se houver)
# Verificar arquivo de seed no backend

# 4. Iniciar servidor
npm run dev
# Servidor estará em http://localhost:3001
```

### Frontend

```bash
cd frontend

# 1. Instalar dependências
npm install

# 2. Iniciar aplicação
npm run dev
# Aplicação estará em http://localhost:3000
```

---

## 🧪 Executando Testes

### Testes Unitários (Backend)

**Todos os testes:**
```bash
cd backend
npm test
```

**Output esperado:**
```
PASS  src/repositories/__tests__/PlanoRepository.test.js
PASS  src/repositories/__tests__/MaterialRepository.test.js
PASS  src/controllers/__tests__/ControladorAutenticacao.test.js
PASS  src/patterns/singleton/__tests__/AuthService.test.js
PASS  src/patterns/decorator/__tests__/PDFComSenha.test.js

Test Suites: 5 passed
Tests: 22 passed
```

**Watch mode (reexecuta ao salvar):**
```bash
npm run test:watch
```

**Com cobertura:**
```bash
npm run test:coverage
```

### Testes de Aceitação (Frontend - E2E)

**Pré-requisito:** Backend e Frontend devem estar rodando

**Interface interativa (recomendado para desenvolvimento):**
```bash
cd frontend
npm run e2e
```
Abre Cypress UI - escolha o teste e veja em tempo real.

**Modo headless (para CI/CD):**
```bash
npm run e2e:run
```

**Teste específico:**
```bash
npx cypress run --spec "cypress/e2e/01-auth.cy.js"
```

---

## 📁 Estrutura do Projeto

```
educatoris/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Handlers das requisições
│   │   ├── repositories/       # Acesso ao BD
│   │   ├── patterns/           # Decorator, Facade, Singleton
│   │   ├── middleware/         # Auth, CORS, etc
│   │   └── app.js              # Configuração Express
│   ├── __tests__/              # Testes unitários
│   ├── jest.config.js          # Configuração Jest
│   ├── package.json
│   └── TESTING.md              # Detalhes dos testes unitários
│
├── frontend/
│   ├── src/
│   │   ├── app/                # Páginas Next.js
│   │   ├── components/         # React components
│   │   └── styles/             # Tailwind CSS
│   ├── cypress/
│   │   ├── e2e/                # Testes E2E
│   │   └── support/            # Helpers e commands
│   ├── cypress.config.js       # Configuração Cypress
│   ├── package.json
│   └── E2E_TESTS.md            # Detalhes dos testes E2E
│
└── GUIDE.md                    # Este arquivo
```

---

## 🎯 Funcionalidades Implementadas

### ✅ PDF com Senha (CPF)
- PDFs gerados são criptografados com AES-256
- Senha = CPF do usuário (sem caracteres especiais)
- Implementado com padrão Decorator (`PDFComSenha`)
- Testes unitários em `PDFComSenha.test.js`
- Teste E2E em `05-pdf-download.cy.js`

### ✅ Admin sem Limite de Dispositivos
- Admin pode ter > 3 sessões simultâneas
- Professor limitado a 3 dispositivos
- Validação em `AuthService.verificarLimiteDispositivos()`
- Testes em `AuthService.test.js` e `ControladorAutenticacao.test.js`

### ✅ Sessões com TTL (24 horas)
- Sessões expiram após 24 horas
- Validação em `AuthService.sessaoAtiva()`
- JWT padrão também com 24h de expiração

### ✅ Busca com Normalização de Acentos
- Busca "acido" encontra "ácido"
- Implementado em `ConteudoService`
- Teste E2E em `02-professor-conteudos.cy.js`

---

## 🚀 Comandos Principais

### Desenvolvimento

| Comando | O quê | Onde |
|---------|-------|------|
| `npm run dev` | Inicia servidor/app | backend/ ou frontend/ |
| `npm test` | Roda testes unitários | backend/ |
| `npm run test:watch` | Watch mode (tests) | backend/ |
| `npm run e2e` | Cypress UI | frontend/ |
| `npm run e2e:run` | Cypress headless | frontend/ |
| `npm run build` | Build produção | frontend/ |

### Debugging

**Backend com inspector:**
```bash
cd backend
node --inspect-brk=9229 node_modules/.bin/jest
```

**Frontend - React DevTools:**
Instalar extensão no navegador durante `npm run dev`

**Cypress - Debugger:**
Abrir DevTools enquanto teste roda em `npm run e2e`

---

## 🔐 Credenciais de Teste

### Admin
```
Email: admin@educatoris.com
Senha: admin123
```

### Professor
```
Email: professor@example.com
Senha: password123
```

**Nota:** Credenciais estão em fixtures dos testes E2E. Para produção, nunca commitar credenciais reais.

---

## 📊 Cobertura de Testes

### Backend
- 22 testes unitários implementados
- Cobertura mínima: 50%
- Padrões testados: Decorator, Facade, Singleton

### Frontend
- 20+ testes E2E implementados
- 5 fluxos principais cobertos:
  1. Autenticação
  2. Navegação de conteúdos
  3. Gerenciamento de planos (admin)
  4. Gerenciamento de materiais (admin)
  5. Download de PDF com criptografia

---

## 🛠 Troubleshooting

### "Cannot find module"
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Backend não inicia
```bash
# Verificar porta 3001
lsof -i :3001
# Se ocupada, mudar porta em backend/src/app.js
```

### Cypress não encontra elementos
1. Verificar se backend está rodando
2. Verificar se frontend está em `localhost:3000`
3. Aumentar timeout em `cypress.config.js`: `defaultCommandTimeout: 10000`

### Sessão expirada em testes E2E
```javascript
// Em cypress.config.js, aumentar setupNodeEvents
setupNodeEvents(on, config) {
  on('task', {
    log(message) {
      console.log(message);
      return null;
    }
  });
  return config;
}
```

---

## 📚 Documentação Detalhada

- **[TESTING.md](backend/TESTING.md)** - Testes unitários
- **[E2E_TESTS.md](frontend/E2E_TESTS.md)** - Testes de aceitação

---

## 🎓 Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| **Backend** | Node.js + Express |
| **BD** | SQLite |
| **Frontend** | Next.js + React + Tailwind |
| **Testes Unit** | Jest |
| **Testes E2E** | Cypress |
| **PDF** | pdf-lib + pdf-lib-plus-encrypt (AES-256) |
| **Auth** | JWT (24h TTL) |

---

## 📝 Notas Importantes

⚠️ **Antes de fazer commit:**
1. Rodar `npm test` (backend)
2. Rodar `npm run test:coverage` e verificar cobertura
3. Rodar `npm run e2e:run` (frontend, com backend ativo)
4. Nunca commitar `.env` ou credenciais reais

✅ **Padrões de Design Implementados:**
- **Decorator** - PDF processing pipeline
- **Facade** - ConteudoService encapsula lógica
- **Singleton** - AuthService (instância única)

---

## 🤝 Contribuindo

1. Criar branch feature: `git checkout -b feat/sua-funcionalidade`
2. Escrever testes antes (TDD)
3. Rodar cobertura: `npm run test:coverage`
4. Fazer commit
5. PR para main

---

Última atualização: 2026-06-15
