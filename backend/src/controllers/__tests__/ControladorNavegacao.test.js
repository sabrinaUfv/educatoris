jest.mock('../../patterns/facade/ConteudoService');

const ctrl = require('../ControladorNavegacao');
const conteudoService = require('../../patterns/facade/ConteudoService');

function mockRes() {
  return {
    code: 200,
    body: null,
    status(c) { this.code = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

beforeEach(() => jest.clearAllMocks());

describe('ControladorNavegacao', () => {
  test('listarPorAno rejeita ano inválido (400)', () => {
    const res = mockRes();
    ctrl.listarPorAno({ params: { ano: '9' } }, res);
    expect(res.code).toBe(400);
  });

  test('listarPorAno retorna temas do ano', () => {
    conteudoService.listarTemasPorAno.mockReturnValue([{ id: 1 }]);
    const res = mockRes();
    ctrl.listarPorAno({ params: { ano: '1' } }, res);
    expect(res.body).toEqual([{ id: 1 }]);
    expect(conteudoService.listarTemasPorAno).toHaveBeenCalledWith(1);
  });

  test('buscar exige termo (400)', () => {
    const res = mockRes();
    ctrl.buscar({ query: { q: '  ' } }, res);
    expect(res.code).toBe(400);
  });

  test('buscar retorna resultados', () => {
    conteudoService.buscarTemas.mockReturnValue([{ id: 2 }]);
    const res = mockRes();
    ctrl.buscar({ query: { q: 'acido' } }, res);
    expect(res.body).toEqual([{ id: 2 }]);
    expect(conteudoService.buscarTemas).toHaveBeenCalledWith('acido');
  });

  test('laboratoriosPermitidos delega ao serviço', () => {
    conteudoService.obterLaboratoriosPermitidos.mockReturnValue([{ id: 3 }]);
    const res = mockRes();
    const usuario = { id: 1 };
    ctrl.laboratoriosPermitidos({ usuario }, res);
    expect(res.body).toEqual([{ id: 3 }]);
    expect(conteudoService.obterLaboratoriosPermitidos).toHaveBeenCalledWith(usuario);
  });
});
