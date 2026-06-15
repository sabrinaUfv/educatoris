# Testes de Aceitação (E2E) - e-ducatoris

## Visão Geral

Testes de aceitação automatizados usando **Cypress**. Simulam comportamento real do usuário navegando pela aplicação.

## Estrutura de Testes

```
cypress/
├── e2e/
│   ├── 01-auth.cy.js              # Login, Logout, Autenticação
│   ├── 02-professor-conteudos.cy.js  # Navegação de conteúdos
│   ├── 03-admin-planos.cy.js      # Gerenciar planos
│   ├── 04-admin-materiais.cy.js   # Gerenciar materiais
│   └── 05-pdf-download.cy.js      # Download de PDFs
├── support/
│   ├── commands.js                 # Custom commands (cy.login)
│   └── e2e.js                      # Configuração geral
└── cypress.config.js               # Configuração do Cypress
```

## Rodando os Testes

### Interface Interativa (Cypress UI)
```bash
npm run e2e
```
Abre o Cypress UI para rodar testes manualmente e debugar

### Modo Headless (CI/CD)
```bash
npm run e2e:run
```
Roda todos os testes em modo headless

### Testes Específicos
```bash
npx cypress run --spec "cypress/e2e/01-auth.cy.js"
```

## Fluxos de Teste Implementados

### 1. Autenticação (`01-auth.cy.js`)
- ✅ Exibição da página de login
- ✅ Erro com credenciais inválidas
- ✅ Login bem-sucedido
- ✅ Logout retorna para login

**Credenciais de teste:**
- Admin: `admin@educatoris.com` / `admin123`
- Professor: `professor@example.com` / `password123`

### 2. Navegação de Conteúdos (`02-professor-conteudos.cy.js`)
- ✅ Listagem de anos escolares (1º, 2º, 3º)
- ✅ Exibição de temas ao selecionar ano
- ✅ Busca com normalização de acentos (busca "acido" encontra "ácido")
- ✅ Listagem de materiais por tema
- ✅ Informações detalhadas do material

### 3. Admin - Planos (`03-admin-planos.cy.js`)
- ✅ Página de gerenciamento de planos
- ✅ Listagem de planos existentes
- ✅ Criar novo plano
- ✅ Editar preço de plano
- ✅ Desativar plano

**Campos testados:**
- Título
- Preço (R$)
- Nível (1, 2, 3)
- Permissões (checkboxes)

### 4. Admin - Materiais (`04-admin-materiais.cy.js`)
- ✅ Página de gerenciamento de materiais
- ✅ Seleção de tema
- ✅ Adicionar novo material
- ✅ Editar material
- ✅ Ocultar/Deletar material

**Campos testados:**
- Título
- URL
- Tipo (Arquivo, Vídeo, Laboratório)
- Descrição

### 5. Download de PDF (`05-pdf-download.cy.js`)
- ✅ Verificação de acesso ao download
- ✅ Bloqueio sem plano adequado
- ✅ Permissão com plano válido
- ✅ Download com criptografia (CPF como senha)

## Custom Commands

### `cy.login(email, password)`
Faz login e cria sessão (armazenada em cache)
```javascript
cy.login('admin@educatoris.com', 'admin123');
```

### `cy.loginAsAdmin()`
Atalho para login de admin
```javascript
cy.loginAsAdmin();
```

### `cy.loginAsProfessor(email, password)`
Atalho para login de professor (com valores padrão)
```javascript
cy.loginAsProfessor();
cy.loginAsProfessor('custom@example.com', 'password');
```

### `cy.selectPlano(anoEscolar)`
Seleciona um plano/tema por ano escolar
```javascript
cy.selectPlano('1º ano');
```

## Seletores Utilizados

### Data Test IDs
- `[data-testid="plano-card"]` - Card de plano
- `[data-testid="material-card"]` - Card de material
- `[data-testid="user-plan"]` - Informação do plano do usuário

### Inputs
- `input[type="email"]` - Campo de email
- `input[type="password"]` - Campo de senha
- `input[type="checkbox"]` - Checkboxes de permissões
- `input[placeholder*="..."]` - Inputs por placeholder

## Configuração de Ambiente

### Pré-requisitos
1. **Backend rodando**: `npm run dev` (porta 3001)
2. **Frontend rodando**: `npm run dev` (porta 3000)
3. **Base de dados seedada**: Com dados de teste

### baseUrl
Configurado em `cypress.config.js`: `http://localhost:3000`

## Melhorias Futuras

- [ ] Testes de acesso a laboratórios
- [ ] Testes de feedback de usuário (reviews/ratings)
- [ ] Testes de busca avançada
- [ ] Testes de gerenciamento de professores (admin)
- [ ] Testes de performance de carregamento
- [ ] Testes de responsividade mobile
- [ ] Cobertura visual (visual regression)

## Troubleshooting

### Testes falhando por timeout
- Aumentar `defaultCommandTimeout` em `cypress.config.js`
- Verificar se o servidor está rodando

### "Cannot find module" errors
- Rodar `npm install` novamente
- Limpar node_modules e `npm ci`

### Sessão expirada
- O Cypress cache sessions por padrão
- Para forçar novo login: `cy.session(..., {cacheAcrossSpecs: false})`

## CI/CD Integration

Para rodar em CI:
```bash
# Instalar dependências
npm install

# Rodar testes headless
npm run e2e:headless
```

Salvar relatório (exemplo com GitHub Actions):
```yaml
- name: Run E2E Tests
  run: npm run e2e:run
  
- name: Upload Report
  uses: actions/upload-artifact@v2
  with:
    name: cypress-videos
    path: cypress/videos/
```
