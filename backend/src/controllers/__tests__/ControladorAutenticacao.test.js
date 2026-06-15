jest.mock('../../repositories/UsuarioRepository');
jest.mock('../../patterns/singleton/AuthService');

const ControladorAutenticacao = require('../ControladorAutenticacao');
const usuarioRepository = require('../../repositories/UsuarioRepository');

describe('ControladorAutenticacao', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('cadastrar', () => {
    test('deve retornar erro 400 se nome, email ou senha faltarem', () => {
      req.body = { nome: 'User' };

      ControladorAutenticacao.cadastrar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deve retornar erro 409 se email já existe', () => {
      req.body = {
        nome: 'User',
        email: 'existing@example.com',
        senha: 'password',
      };
      usuarioRepository.buscarPorEmail.mockReturnValue({ id: 1 });

      ControladorAutenticacao.cadastrar(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });
});
