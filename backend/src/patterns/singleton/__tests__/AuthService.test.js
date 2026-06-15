const AuthService = require('../AuthService');
const db = require('../../../config/database');

jest.mock('../../../config/database');
jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');

describe('AuthService', () => {
  let authService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = AuthService.getInstance();
  });

  test('deve ser singleton', () => {
    const instance1 = AuthService.getInstance();
    const instance2 = AuthService.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('gerarToken deve retornar token JWT válido', () => {
    jwt.sign.mockReturnValue('token_mock');

    const token = authService.gerarToken({
      id: 1,
      tipo: 'professor',
      email: 'test@example.com',
    });

    expect(token).toBe('token_mock');
    expect(jwt.sign).toHaveBeenCalled();
  });

  test('validarToken deve retornar payload se token válido', () => {
    const mockPayload = { id: 1, tipo: 'professor' };
    jwt.verify.mockReturnValue(mockPayload);

    const resultado = authService.validarToken('valid_token');

    expect(resultado).toEqual(mockPayload);
  });

  test('validarToken deve retornar null se token inválido', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const resultado = authService.validarToken('invalid_token');

    expect(resultado).toBeNull();
  });

  test('verificarLimiteDispositivos deve retornar true se abaixo do limite', () => {
    db.prepare.mockReturnValue({
      run: jest.fn(),
      get: jest.fn().mockReturnValue({ total: 2 }),
    });

    const resultado = authService.verificarLimiteDispositivos(1);

    expect(resultado).toBe(true);
  });

  test('verificarLimiteDispositivos deve retornar false se atingiu limite', () => {
    db.prepare.mockReturnValue({
      run: jest.fn(),
      get: jest.fn().mockReturnValue({ total: 3 }),
    });

    const resultado = authService.verificarLimiteDispositivos(1);

    expect(resultado).toBe(false);
  });

  test('criarSessao deve inserir nova sessão', () => {
    const mockRun = jest.fn();
    db.prepare.mockReturnValue({ run: mockRun });

    authService.criarSessao(1, 'token_123');

    expect(mockRun).toHaveBeenCalled();
  });

  test('encerrarSessao deve marcar sessão como inativa', () => {
    const mockRun = jest.fn();
    db.prepare.mockReturnValue({ run: mockRun });

    authService.encerrarSessao('token_123');

    expect(mockRun).toHaveBeenCalled();
  });

  test('sessaoAtiva deve validar se sessão está ativa e não expirou', () => {
    db.prepare.mockReturnValue({
      get: jest.fn().mockReturnValue({ id: 1 }),
    });

    const resultado = authService.sessaoAtiva('valid_token');

    expect(resultado).toBe(true);
  });

  test('sessaoAtiva deve retornar false se sessão não existe', () => {
    db.prepare.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });

    const resultado = authService.sessaoAtiva('expired_token');

    expect(resultado).toBe(false);
  });
});
