# Testes Unitários - e-ducatoris Backend

## Visão Geral

Este projeto usa **Jest** como framework de testes automatizados. Os testes ficam em
diretórios `__tests__` próximos aos arquivos que testam, seguindo a convenção do Jest.

**Status atual: 104 testes em 11 suítes — cobertura ~62% statements** (limite mínimo: 50%).

## Estrutura de Testes

```
src/
├── controllers/__tests__/
│   ├── ControladorAutenticacao.test.js   (2)
│   ├── ControladorMaterial.test.js       (25)
│   ├── ControladorNavegacao.test.js      (5)
│   ├── ControladorPlano.test.js          (6)
│   └── ControladorUsuarios.test.js       (22)
├── patterns/
│   ├── factory/__tests__/MaterialFactory.test.js   (4)
│   └── singleton/__tests__/AuthService.test.js     (10)
└── repositories/__tests__/
    ├── LaboratorioRepository.test.js        (16)
    ├── MaterialRepository.test.js           (5)
    ├── MaterialRepository.deletar.test.js   (3)
    └── PlanoRepository.test.js              (6)
```

## Executando os Testes

```bash
npm test                 # roda todos os testes
npm run test:watch       # modo watch (reexecuta ao salvar)
npm run test:coverage    # gera relatório de cobertura
```

## Estratégia de Teste

Há duas abordagens, escolhidas conforme o que está sendo testado:

1. **Mocks** (`jest.mock`) — para lógica de controlador e repositórios simples, isolando a
   unidade das dependências. Ex.: `ControladorPlano`, `ControladorNavegacao`, `PlanoRepository`.
2. **SQLite em memória real** (`better-sqlite3` com `:memory:` + `schema.sql`) — para código
   pesado em SQL onde o comportamento do banco *é* o que se quer validar: sobreposição de
   reservas, transações, cascade delete e foreign keys. Ex.: `LaboratorioRepository`,
   `ControladorMaterial`, `MaterialRepository.deletar`.

   ```javascript
   jest.mock('../../config/database', () => {
     const Database = require('better-sqlite3');
     const fs = require('fs');
     const path = require('path');
     const db = new Database(':memory:');
     db.pragma('foreign_keys = ON');
     db.exec(fs.readFileSync(path.join(__dirname, '../../db/schema.sql'), 'utf8'));
     return db;
   });
   ```

## Testes Implementados

### Controllers

**ControladorAutenticacao** — cadastro (400 sem campos, 409 e-mail duplicado).

**ControladorMaterial** (integração com banco em memória):
- `acessarLaboratorio`: libera por plano (Proxy), bloqueia plano insuficiente (403), 404 inexistente, 409 lab em uso por outro
- `iniciarUso` / `manterUso` / `encerrarUso`: inicia uso ao vivo, bloqueia segundo professor (409), libera após encerrar, heartbeat
- `disponibilidadeLaboratorio`: disponível+permitido, `permitido=false`+motivo por plano, reflete ocupação ao vivo
- `reservarLaboratorio`: cria (201), valida janela (400), passado (400), conflito (409), plano (403)
- `minhasReservas` / `atualizarReserva` / `deletarReserva`: lista só do dono, edição/cancelamento com checagem de dono (403), 404 inexistente, 400 inválido

**ControladorNavegacao** — `listarPorAno` (400 ano inválido), `buscar` (400 sem termo), `laboratoriosPermitidos`.

**ControladorPlano** — `listar`, `meuPlano`, `assinar` (400/404/400-já-no-plano/sucesso).

**ControladorUsuarios**:
- Planos (anti-duplicação): `criarPlano` 400/409/201, `atualizarPlano` 409-outro/200-próprio/200-novo, `deletarPlano`, `listarPlanosAdmin`
- Conteúdos: `adicionarConteudo` 400/409/201, inativar/deletar/alternarStatus
- Materiais: `adicionarMaterial` 400/201 (extras de arquivo e laboratório), `editarMaterial`, `inativarMaterial`
- Professores: `listarProfessores`, `alterarStatus` (400, bloqueio encerra sessões, desbloqueio não)

### Repositories

**LaboratorioRepository** (banco em memória):
- Reservas: criar/buscar, `buscarConflito` (sobreposição, adjacência, `excetoId`), `reservaNoInstante`, `listarReservasDoProfessor`, atualizar, deletar
- Uso ao vivo: `iniciarUso` (OCUPADO p/ outro, renova p/ dono), `manterUso` (dono/não-dono), `encerrarUso`, `usoAtivo` limpa expirados
- Histórico: `registrarAcesso` + `buscarHistorico`

**MaterialRepository** — `buscarPorConteudo`, `buscarPorId`, `adicionarMaterial`, `inativar`, `adicionarArquivo`.

**MaterialRepository.deletar** (banco em memória) — cascade delete transacional: apaga
materiais/arquivos/videoaulas/laboratorios/acesso_lab sem violar FK; conteúdo sem materiais;
não afeta outros conteúdos.

**PlanoRepository** — `listarAtivos`, `buscarPorId`, `buscarPorTitulo` (case-insensitive),
`criar`, `atualizar`, `deletar`.

### Patterns

**AuthService** — Singleton, `gerarToken`/`validarToken`, `verificarLimiteDispositivos`,
`sessaoAtiva`, `criarSessao`/`encerrarSessao`.

**MaterialFactory** — cria Arquivo/VideoAula/Laboratorio; lança erro para tipo desconhecido.

## Cobertura

Meta mínima (em `jest.config.js`): **50%** em branches, functions, lines e statements.
Cobertura atual: ~62% statements. Áreas com forte cobertura: `LaboratorioRepository` (~97%),
`ControladorUsuarios` (~97%), `ControladorNavegacao`/`ControladorPlano`/`MaterialFactory`/
`Material` (100%).

## Adicionando Novos Testes

1. Crie um diretório `__tests__` no mesmo nível do arquivo
2. Nomeie o arquivo como `NomeDoArquivo.test.js`
3. Use `describe()` + `test()`
4. Escolha a abordagem: **mock** (lógica isolada) ou **banco em memória** (SQL/transações/FK)
5. Cubra happy path, edge cases e erros
6. Ao comparar timestamps gerados em runtime, capture o valor em variável (evita flutuação de ms)

## Recursos Úteis

- [Documentação Jest](https://jestjs.io/)
- [Matchers disponíveis](https://jestjs.io/docs/expect)
- [API de Mocks](https://jestjs.io/docs/mock-functions)
