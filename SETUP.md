# ⚙️ Setup Automático - e-ducatoris

Scripts automáticos para instalar e configurar o projeto com um único comando.

---

## 🚀 Quick Start (30 segundos)

### Linux/macOS
```bash
bash setup.sh
```

### Windows
```cmd
setup.bat
```

Isso faz:
1. ✅ Verifica se Yarn está instalado
2. ✅ Instala todas as dependências (backend + frontend)
3. ✅ Popula o banco de dados com dados de teste
4. ✅ Cria arquivo `.env` no backend
5. ✅ Exibe credenciais e próximos passos

---

## 📋 O que cada script faz

### `setup.sh` (Linux/macOS)

```bash
#!/bin/bash
1. Verifica yarn --version
2. yarn install:all          # Backend + Frontend
3. yarn seed                 # Popula BD
4. cp backend/.env.example backend/.env
5. Exibe credenciais de teste
```

### `setup.bat` (Windows)

```batch
@echo off
1. where yarn               # Verifica yarn
2. yarn install:all         # Backend + Frontend
3. yarn seed                # Popula BD
4. copy .env.example .env   # Cria .env
5. echo credenciais
```

---

## ✅ Pré-requisitos

Antes de rodar o setup, certifique-se que tem:

### 1. Node.js 18+
```bash
node --version   # deve ser >= 18
```

Se não tiver: https://nodejs.org/

### 2. Yarn 4.0+
```bash
yarn --version
```

Se não tiver:
```bash
npm install -g yarn
```

### 3. Git (opcional, mas recomendado)
```bash
git --version
```

---

## 🎯 Após o Setup

### 1. Rodar a Aplicação

**Opção A: Backend + Frontend juntos (Recomendado)**
```bash
yarn dev
```
Abre:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

**Opção B: Separados**
```bash
# Terminal 1
yarn dev:backend

# Terminal 2
yarn dev:frontend
```

### 2. Rodar Testes

**Testes unitários:**
```bash
yarn test
```

**Testes E2E (requer yarn dev ativo):**
```bash
yarn e2e:run
```

### 3. Usar Credenciais de Teste

**Admin:**
```
Email:    admin@educatoris.com
Senha:    admin123
```

**Professor:**
```
Email:    professor@example.com
Senha:    password123
```

---

## 🔧 Troubleshooting Setup

### "Yarn not found"
```bash
npm install -g yarn
```

### "Port 3001 already in use"
```bash
# Mude a porta no backend/.env
PORT=3002 yarn dev:backend
```

### "Setup falhou na seed"
```bash
# Tente manualmente
cd backend
node src/db/seed.js
cd ..
```

### "Erro de permissão (Linux/macOS)"
```bash
# Dê permissão de execução
chmod +x setup.sh
```

### ".env not created"
Crie manualmente:
```bash
cd backend
cp .env.example .env
```

Se não existir `.env.example`, crie com:
```bash
cat > backend/.env << 'EOF'
PORT=3001
JWT_SECRET=sua_string_secreta_aqui_coloque_algo_longo
NODE_ENV=development
EOF
```

---

## 📚 Próximas Leituras

Após setup bem-sucedido:

1. **[YARN_GUIDE.md](YARN_GUIDE.md)** — Comandos yarn organizados
2. **[GUIDE.md](GUIDE.md)** — Guia completo de desenvolvimento
3. **[backend/TESTING.md](backend/TESTING.md)** — Testes unitários
4. **[frontend/E2E_TESTS.md](frontend/E2E_TESTS.md)** — Testes E2E
5. **[README.md](README.md)** — Overview do projeto

---

## 🤖 Automatizar Setup em CI/CD

### GitHub Actions
```yaml
- name: Setup e-ducatoris
  run: bash setup.sh
```

### GitLab CI
```yaml
setup:
  script:
    - bash setup.sh
```

### Azure Pipelines
```yaml
- script: bash setup.sh
```

---

## ⚡ Dicas de Desenvolvimento

### Depois do Setup, Para Workflow Rápido

```bash
# Terminal 1 - Rodar tudo
yarn dev

# Terminal 2 - Testes em watch
yarn test:watch

# Terminal 3 - Cypress interativo (com yarn dev ativo)
yarn e2e
```

### Alias úteis (.bashrc / .zshrc)
```bash
alias yd='yarn dev'
alias yt='yarn test'
alias yia='yarn install:all'
alias ys='bash setup.sh'
```

Recarregue:
```bash
source ~/.bashrc  # ou source ~/.zshrc
```

---

## 📞 Suporte

Se o setup falhar:

1. **Verificar Node/Yarn:**
   ```bash
   node --version
   yarn --version
   npm --version
   ```

2. **Limpar caches:**
   ```bash
   yarn cache clean
   rm -rf node_modules backend/node_modules frontend/node_modules
   yarn install:all
   ```

3. **Verificar espaço em disco:**
   ```bash
   df -h  # Linux/macOS
   dir c: # Windows
   ```

4. **Consultar docs específicas:**
   - `YARN_GUIDE.md` — Comandos yarn
   - `GUIDE.md` — Troubleshooting detalhado
   - README.md → seção "Estrutura do projeto"

---

**Última atualização:** 2026-06-15  
**Compatível com:** Node 18+, Yarn 4.0+, npm 9+
