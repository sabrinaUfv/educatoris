const planoRepository = require('../PlanoRepository');
const db = require('../../config/database');

jest.mock('../../config/database');

describe('PlanoRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('listarAtivos deve retornar planos com ativo=1', () => {
    const mockPlanos = [
      { id: 1, titulo: 'Plano 1', ativo: 1 },
      { id: 2, titulo: 'Plano 2', ativo: 1 },
    ];
    db.prepare.mockReturnValue({
      all: jest.fn().mockReturnValue(mockPlanos),
    });

    const resultado = planoRepository.listarAtivos();

    expect(resultado).toEqual(mockPlanos);
    expect(db.prepare).toHaveBeenCalled();
  });

  test('buscarPorId deve retornar um plano pelo ID', () => {
    const mockPlano = { id: 1, titulo: 'Plano 1', preco: 29.9 };
    db.prepare.mockReturnValue({
      get: jest.fn().mockReturnValue(mockPlano),
    });

    const resultado = planoRepository.buscarPorId(1);

    expect(resultado).toEqual(mockPlano);
  });

  test('buscarPorTitulo deve consultar plano por título (case-insensitive)', () => {
    const mockPlano = { id: 1, titulo: 'Básico' };
    const mockGet = jest.fn().mockReturnValue(mockPlano);
    db.prepare.mockReturnValue({ get: mockGet });

    const resultado = planoRepository.buscarPorTitulo('básico');

    expect(resultado).toEqual(mockPlano);
    expect(mockGet).toHaveBeenCalledWith('básico');
  });

  test('criar deve inserir novo plano', () => {
    db.prepare.mockReturnValue({
      run: jest.fn().mockReturnValue({ lastInsertRowid: 5 }),
    });

    const id = planoRepository.criar({
      titulo: 'Novo Plano',
      preco: 19.9,
      nivel: 1,
      acesso_video: true,
    });

    expect(id).toBe(5);
    expect(db.prepare).toHaveBeenCalled();
  });

  test('atualizar deve modificar plano existente', () => {
    const mockRun = jest.fn();
    db.prepare.mockReturnValue({ run: mockRun });

    planoRepository.atualizar(1, {
      titulo: 'Atualizado',
      preco: 39.9,
      nivel: 2,
    });

    expect(mockRun).toHaveBeenCalled();
  });

  test('deletar deve marcar plano como inativo', () => {
    const mockRun = jest.fn();
    db.prepare.mockReturnValue({ run: mockRun });

    planoRepository.deletar(1);

    expect(mockRun).toHaveBeenCalledWith(1);
  });
});
