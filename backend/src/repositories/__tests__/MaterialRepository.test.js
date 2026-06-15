jest.mock('../../config/database');
const db = require('../../config/database');
const materialRepository = require('../MaterialRepository');

describe('MaterialRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('buscarPorConteudo deve retornar materiais do conteúdo', () => {
    const mockMateriais = [
      { id: 1, conteudo_id: 1, titulo: 'Material 1', tipo: 'arquivo' },
    ];
    db.prepare.mockReturnValue({
      all: jest.fn().mockReturnValue(mockMateriais),
      get: jest.fn().mockReturnValue(null),
    });

    const resultado = materialRepository.buscarPorConteudo(1);

    expect(Array.isArray(resultado)).toBe(true);
    expect(db.prepare).toHaveBeenCalled();
  });

  test('buscarPorId deve retornar material pelo ID', () => {
    const mockMaterial = { id: 1, titulo: 'Material 1', tipo: 'arquivo' };
    db.prepare.mockReturnValue({
      get: jest.fn().mockReturnValue(mockMaterial),
    });

    const resultado = materialRepository.buscarPorId(1);

    expect(resultado).toEqual(mockMaterial);
  });

  test('adicionarMaterial deve inserir novo material', () => {
    db.prepare.mockReturnValue({
      run: jest.fn().mockReturnValue({ lastInsertRowid: 10 }),
    });

    const id = materialRepository.adicionarMaterial({
      conteudoId: 1,
      titulo: 'Novo Material',
      url: 'https://example.com/pdf.pdf',
      tipo: 'arquivo',
    });

    expect(id).toBe(10);
  });

  test('inativar deve marcar material como inativo', () => {
    const mockRun = jest.fn();
    db.prepare.mockReturnValue({ run: mockRun });

    materialRepository.inativar(1);

    expect(mockRun).toHaveBeenCalled();
  });

  test('adicionarArquivo deve inserir extra para arquivo', () => {
    const mockRun = jest.fn();
    db.prepare.mockReturnValue({ run: mockRun });

    materialRepository.adicionarArquivo(5, { editavel: true });

    expect(mockRun).toHaveBeenCalled();
  });
});
