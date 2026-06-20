jest.mock('../../repositories/PlanoRepository');
jest.mock('../../repositories/MaterialRepository');
jest.mock('../../repositories/UsuarioRepository');
jest.mock('../../patterns/singleton/AuthService');

const ctrl = require('../ControladorUsuarios');
const planoRepository = require('../../repositories/PlanoRepository');
const materialRepository = require('../../repositories/MaterialRepository');
const usuarioRepository = require('../../repositories/UsuarioRepository');
const AuthService = require('../../patterns/singleton/AuthService');

function mockRes() {
  return {
    code: 200,
    body: null,
    status(c) { this.code = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

let res;
beforeEach(() => {
  jest.clearAllMocks();
  res = mockRes();
  AuthService.getInstance.mockReturnValue({ encerrarTodasSessoes: jest.fn() });
});

describe('planos (anti-duplicação)', () => {
  describe('criarPlano', () => {
    test('400 quando faltam campos obrigatórios', () => {
      ctrl.criarPlano({ body: { titulo: 'X' } }, res);
      expect(res.code).toBe(400);
    });

    test('409 quando já existe plano com o mesmo título', () => {
      planoRepository.buscarPorTitulo.mockReturnValue({ id: 1, titulo: 'Básico' });
      ctrl.criarPlano({ body: { titulo: 'Básico', preco: 10, nivel: 1 } }, res);
      expect(res.code).toBe(409);
      expect(planoRepository.criar).not.toHaveBeenCalled();
    });

    test('201 quando o título é único', () => {
      planoRepository.buscarPorTitulo.mockReturnValue(undefined);
      planoRepository.criar.mockReturnValue(7);
      ctrl.criarPlano({ body: { titulo: 'Novo', preco: 10, nivel: 1 } }, res);
      expect(res.code).toBe(201);
      expect(res.body.id).toBe(7);
    });
  });

  describe('atualizarPlano', () => {
    test('409 quando o título pertence a OUTRO plano', () => {
      planoRepository.buscarPorTitulo.mockReturnValue({ id: 2, titulo: 'Básico' });
      ctrl.atualizarPlano({ params: { id: '1' }, body: { titulo: 'Básico', preco: 10, nivel: 1 } }, res);
      expect(res.code).toBe(409);
      expect(planoRepository.atualizar).not.toHaveBeenCalled();
    });

    test('200 quando o título é do próprio plano sendo editado', () => {
      planoRepository.buscarPorTitulo.mockReturnValue({ id: 1, titulo: 'Básico' });
      ctrl.atualizarPlano({ params: { id: '1' }, body: { titulo: 'Básico', preco: 15, nivel: 1 } }, res);
      expect(res.code).toBe(200);
      expect(planoRepository.atualizar).toHaveBeenCalled();
    });

    test('200 quando o título é novo e único', () => {
      planoRepository.buscarPorTitulo.mockReturnValue(undefined);
      ctrl.atualizarPlano({ params: { id: '1' }, body: { titulo: 'Outro', preco: 15, nivel: 2 } }, res);
      expect(res.code).toBe(200);
      expect(planoRepository.atualizar).toHaveBeenCalled();
    });
  });

  test('deletarPlano desativa o plano', () => {
    ctrl.deletarPlano({ params: { id: '3' } }, res);
    expect(planoRepository.deletar).toHaveBeenCalledWith(3);
  });

  test('listarPlanosAdmin retorna todos os planos', () => {
    planoRepository.listarTodos.mockReturnValue([{ id: 1 }]);
    ctrl.listarPlanosAdmin({}, res);
    expect(res.body).toEqual([{ id: 1 }]);
  });
});

describe('conteúdos (anti-duplicação)', () => {
  test('400 quando faltam campos', () => {
    ctrl.adicionarConteudo({ body: { titulo: 'X' } }, res);
    expect(res.code).toBe(400);
  });

  test('409 quando título+tema+ano já existem', () => {
    materialRepository.listarTodosConteudos.mockReturnValue([
      { titulo: 'Cinemática', tema: 'Mecânica', ano_escolar: 1 },
    ]);
    ctrl.adicionarConteudo({ body: { titulo: 'cinemática', tema: 'mecânica', anoEscolar: 1 } }, res);
    expect(res.code).toBe(409);
    expect(materialRepository.adicionarConteudo).not.toHaveBeenCalled();
  });

  test('201 quando o conteúdo é único', () => {
    materialRepository.listarTodosConteudos.mockReturnValue([]);
    materialRepository.adicionarConteudo.mockReturnValue(9);
    ctrl.adicionarConteudo({ body: { titulo: 'Novo', tema: 'Óptica', anoEscolar: 3 } }, res);
    expect(res.code).toBe(201);
    expect(res.body.id).toBe(9);
  });

  test('inativarConteudo / deletarConteudo / alternarStatus', () => {
    ctrl.inativarConteudo({ params: { id: '1' } }, mockRes());
    expect(materialRepository.inativarConteudo).toHaveBeenCalledWith(1);

    ctrl.deletarConteudo({ params: { id: '2' } }, mockRes());
    expect(materialRepository.deletarDefinitivo).toHaveBeenCalledWith(2);

    ctrl.alternarStatusConteudo({ params: { id: '3' }, body: { status: 0 } }, mockRes());
    expect(materialRepository.alternarStatusConteudo).toHaveBeenCalledWith(3, 0);
  });
});

describe('materiais', () => {
  test('400 quando faltam campos obrigatórios', () => {
    ctrl.adicionarMaterial({ body: { titulo: 'X' } }, res);
    expect(res.code).toBe(400);
  });

  test('201 e cria extra de arquivo', () => {
    materialRepository.adicionarMaterial.mockReturnValue(10);
    ctrl.adicionarMaterial({ body: { titulo: 'A', url: 'u', tipo: 'arquivo', conteudoId: 1 } }, res);
    expect(res.code).toBe(201);
    expect(materialRepository.adicionarArquivo).toHaveBeenCalled();
  });

  test('201 e cria extra de laboratório', () => {
    materialRepository.adicionarMaterial.mockReturnValue(11);
    ctrl.adicionarMaterial({ body: { titulo: 'L', url: 'u', tipo: 'laboratorio', conteudoId: 1, extras: { remoto: true } } }, res);
    expect(materialRepository.adicionarLaboratorio).toHaveBeenCalledWith(11, { remoto: true });
  });

  test('editarMaterial 400 sem campos', () => {
    ctrl.editarMaterial({ params: { id: '1' }, body: {} }, res);
    expect(res.code).toBe(400);
  });

  test('editarMaterial atualiza', () => {
    ctrl.editarMaterial({ params: { id: '1' }, body: { titulo: 'T', url: 'u' } }, res);
    expect(materialRepository.atualizarMaterial).toHaveBeenCalled();
  });

  test('inativarMaterial faz soft delete', () => {
    ctrl.inativarMaterial({ params: { id: '5' } }, res);
    expect(materialRepository.inativar).toHaveBeenCalledWith(5);
  });
});

describe('professores', () => {
  test('listarProfessores retorna lista', () => {
    usuarioRepository.listarProfessores.mockReturnValue([{ id: 1 }]);
    ctrl.listarProfessores({}, res);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  test('alterarStatus 400 se ativo não é boolean', () => {
    ctrl.alterarStatus({ params: { id: '1' }, body: { ativo: 'sim' } }, res);
    expect(res.code).toBe(400);
  });

  test('alterarStatus encerra sessões ao bloquear', () => {
    const encerrar = jest.fn();
    AuthService.getInstance.mockReturnValue({ encerrarTodasSessoes: encerrar });
    ctrl.alterarStatus({ params: { id: '2' }, body: { ativo: false } }, res);
    expect(usuarioRepository.alterarStatus).toHaveBeenCalledWith(2, false);
    expect(encerrar).toHaveBeenCalledWith(2);
  });

  test('alterarStatus desbloqueia sem encerrar sessões', () => {
    const encerrar = jest.fn();
    AuthService.getInstance.mockReturnValue({ encerrarTodasSessoes: encerrar });
    ctrl.alterarStatus({ params: { id: '2' }, body: { ativo: true } }, res);
    expect(encerrar).not.toHaveBeenCalled();
  });
});
