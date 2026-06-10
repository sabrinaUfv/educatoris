# e-ducatoris

Plataforma de recursos educacionais para professores de Física.  
Projeto acadêmico — INF221 Engenharia de Software I, UFV.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm (já incluído com o Node.js)

Verifique sua versão:
```bash
node -v   # deve ser >= 18
npm -v
```

---

## Estrutura do projeto

```
educatoris/
├── backend/    Node.js + Express + SQLite
└── frontend/   Next.js 14
```

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

Abra dois terminais:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Acesse `http://localhost:3000` no navegador.

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

## Padrões de projeto implementados

| Padrão | Arquivo |
|--------|---------|
| Singleton | `src/patterns/singleton/AuthService.js` |
| Factory | `src/patterns/factory/MaterialFactory.js` |
| Proxy | `src/patterns/proxy/MaterialProxy.js` |
| Decorator | `src/patterns/decorator/PDF*.js` |
| Facade | `src/patterns/facade/ConteudoService.js` |

---
