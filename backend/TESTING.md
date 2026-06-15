# Testes Unitários - e-ducatoris Backend

## Visão Geral

Este projeto usa **Jest** como framework de testes automatizados. Os testes estão organizados em diretórios `__tests__` próximos aos arquivos que testam, seguindo a convenção do Jest.

## Estrutura de Testes

```
src/
├── repositories/
│   ├── __tests__/
│   │   ├── PlanoRepository.test.js
│   │   └── MaterialRepository.test.js
├── controllers/
│   ├── __tests__/
│   │   └── ControladorAutenticacao.test.js
├── patterns/
│   ├── decorator/
│   │   └── __tests__/
│   │       └── PDFComSenha.test.js
│   ├── facade/
│   │   └── __tests__/
│   │       └── ConteudoService.test.js
│   └── singleton/
│       └── __tests__/
│           └── AuthService.test.js
```

## Executando os Testes

### Rodar todos os testes
```bash
npm test
```

### Rodar testes em modo watch (reexecuta ao salvar)
```bash
npm run test:watch
```

### Gerar cobertura de testes
```bash
npm run test:coverage
```

## Testes Implementados

### 1. PlanoRepository (`PlanoRepository.test.js`)
- ✅ listarAtivos() retorna planos com ativo=1
- ✅ buscarPorId() retorna plano pelo ID
- ✅ criar() insere novo plano
- ✅ atualizar() modifica plano existente
- ✅ deletar() marca plano como inativo

### 2. MaterialRepository (`MaterialRepository.test.js`)
- ✅ buscarPorConteudo() retorna materiais
- ✅ buscarPorId() retorna material
- ✅ adicionarMaterial() insere novo material
- ✅ inativar() marca como inativo
- ✅ adicionarArquivo() insere extra

### 3. PDFComSenha (`PDFComSenha.test.js`)
- ✅ Encripta PDF com CPF como senha
- ✅ Retorna PDF sem modificação se CPF vazio
- ✅ Remove caracteres não-dígitos do CPF

### 4. AuthService (`AuthService.test.js`)
- ✅ Implementa padrão Singleton
- ✅ gerarToken() retorna JWT válido
- ✅ validarToken() valida JWT
- ✅ verificarLimiteDispositivos() limita a 3
- ✅ sessaoAtiva() valida expiração
- ✅ criarSessao(), encerrarSessao()

### 5. ControladorAutenticacao (`ControladorAutenticacao.test.js`)
- ✅ Login com credenciais válidas
- ✅ Erro 401 para credenciais inválidas
- ✅ **Admin não verifica limite de dispositivos**
- ✅ Erro 403 para conta bloqueada
- ✅ Cadastro de novo usuário
- ✅ Erro 409 para email duplicado

### 6. ConteudoService (`ConteudoService.test.js`)
- ✅ listarTemasPorAno()
- ✅ buscarTemas() com normalização de acentos
- ✅ obterMateriaisDoTema()
- ✅ gerarPDFComMarca() valida plano
- ✅ Pipeline de decorators funciona

## Cobertura de Testes

Meta mínima: **50%** de cobertura em branches, functions, lines, statements.

Para ver relatório detalhado:
```bash
npm run test:coverage
```

## Mocking e Fixtures

Todos os testes usam **mocks** para isolar as unidades testadas:

- `jest.mock()` para mockar módulos
- `jest.fn()` para mockar funções
- `.mockReturnValue()` para retorno de sucesso
- `.mockRejectedValue()` para simular erros
- `.beforeEach()` para reset de mocks

## Adicionando Novos Testes

1. Crie um diretório `__tests__` no mesmo nível do arquivo
2. Nomeie o arquivo como `NomedoArquivo.test.js`
3. Use a estrutura `describe()` + `test()`
4. Mock dependências externas
5. Teste happy path, edge cases e erros

### Template Básico

```javascript
describe('MinhaClasse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve fazer algo', () => {
    // Arrange
    const entrada = ...;
    
    // Act
    const resultado = ...;
    
    // Assert
    expect(resultado).toEqual(...);
  });
});
```

## Recursos Úteis

- [Documentação Jest](https://jestjs.io/)
- [Matchers disponíveis](https://jestjs.io/docs/expect)
- [API de Mocks](https://jestjs.io/docs/mock-functions)

## Notas Importantes

- ✅ Admin **não está sujeito ao limite de dispositivos** (3 simultâneos)
- ✅ PDFs são criptografados com CPF do usuário
- ✅ Sessões expiram após 24 horas
- ✅ Busca de temas normaliza acentuação
