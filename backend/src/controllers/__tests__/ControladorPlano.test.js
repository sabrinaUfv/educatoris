jest.mock('../../repositories/PlanoRepository');

const ctrl = require('../ControladorPlano');
const planoRepository = require('../../repositories/PlanoRepository');

function mockRes() {
  return {
    code: 200,
    body: null,
    status(c) { this.code = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

beforeEach(() => jest.clearAllMocks());

describe('ControladorPlano', () => {
  test('listar retorna planos ativos', () => {
    planoRepository.listarAtivos.mockReturnValue([{ id: 1 }]);
    const res = mockRes();
    ctrl.listar({}, res);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  test('meuPlano retorna mensagem quando não há assinatura', () => {
    planoRepository.buscarPorProfessor.mockReturnValue(undefined);
    const res = mockRes();
    ctrl.meuPlano({ usuario: { id: 1 } }, res);
    expect(res.body).toHaveProperty('mensagem');
  });

  test('assinar 400 sem idPlano', () => {
    const res = mockRes();
    ctrl.assinar({ usuario: { id: 1 }, body: {} }, res);
    expect(res.code).toBe(400);
  });

  test('assinar 404 quando plano não existe', () => {
    planoRepository.buscarPorId.mockReturnValue(undefined);
    const res = mockRes();
    ctrl.assinar({ usuario: { id: 1 }, body: { idPlano: 99 } }, res);
    expect(res.code).toBe(404);
  });

  test('assinar 400 quando já está no plano', () => {
    planoRepository.buscarPorId.mockReturnValue({ id: 2 });
    planoRepository.buscarPorProfessor.mockReturnValue({ id: 2 });
    const res = mockRes();
    ctrl.assinar({ usuario: { id: 1 }, body: { idPlano: 2 } }, res);
    expect(res.code).toBe(400);
  });

  test('assinar com sucesso cria assinatura', () => {
    planoRepository.buscarPorId.mockReturnValue({ id: 2 });
    planoRepository.buscarPorProfessor.mockReturnValue({ id: 1 });
    planoRepository.assinar.mockReturnValue(50);
    const res = mockRes();
    ctrl.assinar({ usuario: { id: 1 }, body: { idPlano: 2 } }, res);
    expect(res.body.idAssinatura).toBe(50);
    expect(planoRepository.assinar).toHaveBeenCalled();
  });
});
