// Testes de integração do controlador de laboratório usando banco em memória real,
// exercitando o Proxy de plano, ocupação ao vivo, reservas e suas validações.
jest.mock('../../config/database', () => {
  const Database = require('better-sqlite3');
  const fs = require('fs');
  const path = require('path');
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  db.exec(fs.readFileSync(path.join(__dirname, '../../db/schema.sql'), 'utf8'));
  return db;
});

const db = require('../../config/database');
const ctrl = require('../ControladorMaterial');
const labRepo = require('../../repositories/LaboratorioRepository');

const FUT = (h) => new Date(Date.now() + h * 3600e3).toISOString();

// Professores: Ana e Bruno têm plano Avançado (lab remoto); Carlos tem Básico.
const ana = { id: 1, tipo: 'professor', status_ativo: 1 };
const bruno = { id: 2, tipo: 'professor', status_ativo: 1 };
const carlos = { id: 3, tipo: 'professor', status_ativo: 1 };

function mockRes() {
  return {
    code: 200,
    body: null,
    status(c) { this.code = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

beforeEach(() => {
  db.exec(`
    DELETE FROM uso_lab; DELETE FROM acesso_lab; DELETE FROM assinaturas;
    DELETE FROM laboratorios; DELETE FROM materiais; DELETE FROM conteudos;
    DELETE FROM professores; DELETE FROM planos; DELETE FROM usuarios;
  `);
  db.exec(`
    INSERT INTO planos (id, titulo, preco, nivel, acesso_video, acesso_lab_rem, acesso_lab_virt, acesso_cont_edit, acesso_cont_download, ativo) VALUES
      (1, 'Avançado', 79.9, 3, 1, 1, 1, 1, 1, 1),
      (2, 'Básico',   29.9, 1, 1, 0, 0, 0, 1, 1);
    INSERT INTO usuarios (id, nome, email, senha, tipo, status_ativo) VALUES
      (1, 'Ana', 'ana@x', 'h', 'professor', 1),
      (2, 'Bruno', 'bruno@x', 'h', 'professor', 1),
      (3, 'Carlos', 'carlos@x', 'h', 'professor', 1);
    INSERT INTO professores (id) VALUES (1), (2), (3);
    INSERT INTO assinaturas (id_plano, id_usuario, ativo) VALUES (1,1,1), (1,2,1), (2,3,1);
    INSERT INTO conteudos (id, titulo, ano_escolar, tema) VALUES (1, 'Cinematica', 1, 'Mecanica');
    INSERT INTO materiais (id, conteudo_id, titulo, url, tipo) VALUES
      (10, 1, 'Lab Remoto', 'http://lab', 'laboratorio'),
      (11, 1, 'Lab Virtual', 'http://virt', 'laboratorio');
    INSERT INTO laboratorios (id, remoto) VALUES (10, 1), (11, 0);
  `);
});

describe('acessarLaboratorio', () => {
  test('lab remoto liberado para plano Avançado', () => {
    const res = mockRes();
    ctrl.acessarLaboratorio({ params: { id: '10' }, usuario: ana }, res);
    expect(res.code).toBe(200);
    expect(res.body.url).toBe('http://lab');
  });

  test('lab remoto bloqueado para plano Básico (Proxy)', () => {
    const res = mockRes();
    ctrl.acessarLaboratorio({ params: { id: '10' }, usuario: carlos }, res);
    expect(res.code).toBe(403);
  });

  test('lab virtual bloqueado para plano sem lab virtual', () => {
    const res = mockRes();
    ctrl.acessarLaboratorio({ params: { id: '11' }, usuario: carlos }, res);
    expect(res.code).toBe(403);
  });

  test('404 para laboratório inexistente', () => {
    const res = mockRes();
    ctrl.acessarLaboratorio({ params: { id: '999' }, usuario: ana }, res);
    expect(res.code).toBe(404);
  });

  test('lab remoto em uso por outro professor retorna 409', () => {
    labRepo.iniciarUso(10, 2); // Bruno usando
    const res = mockRes();
    ctrl.acessarLaboratorio({ params: { id: '10' }, usuario: ana }, res);
    expect(res.code).toBe(409);
  });
});

describe('iniciarUso / manterUso / encerrarUso', () => {
  test('iniciarUso devolve url e expiraEm', () => {
    const res = mockRes();
    ctrl.iniciarUsoLaboratorio({ params: { id: '10' }, usuario: ana }, res);
    expect(res.code).toBe(200);
    expect(res.body.url).toBe('http://lab');
    expect(res.body.expiraEm).toBeTruthy();
  });

  test('iniciarUso por segundo professor é bloqueado (409)', () => {
    ctrl.iniciarUsoLaboratorio({ params: { id: '10' }, usuario: ana }, mockRes());
    const res = mockRes();
    ctrl.iniciarUsoLaboratorio({ params: { id: '10' }, usuario: bruno }, res);
    expect(res.code).toBe(409);
  });

  test('após encerrar, outro professor consegue iniciar', () => {
    ctrl.iniciarUsoLaboratorio({ params: { id: '10' }, usuario: ana }, mockRes());
    ctrl.encerrarUsoLaboratorio({ params: { id: '10' }, usuario: ana }, mockRes());
    const res = mockRes();
    ctrl.iniciarUsoLaboratorio({ params: { id: '10' }, usuario: bruno }, res);
    expect(res.code).toBe(200);
  });

  test('manterUso sem sessão ativa retorna 409', () => {
    const res = mockRes();
    ctrl.manterUsoLaboratorio({ params: { id: '10' }, usuario: ana }, res);
    expect(res.code).toBe(409);
  });

  test('manterUso renova a sessão do dono', () => {
    ctrl.iniciarUsoLaboratorio({ params: { id: '10' }, usuario: ana }, mockRes());
    const res = mockRes();
    ctrl.manterUsoLaboratorio({ params: { id: '10' }, usuario: ana }, res);
    expect(res.code).toBe(200);
    expect(res.body.expiraEm).toBeTruthy();
  });
});

describe('disponibilidadeLaboratorio', () => {
  test('disponível e permitido para plano Avançado', () => {
    const res = mockRes();
    ctrl.disponibilidadeLaboratorio({ params: { id: '10' }, query: {}, usuario: ana }, res);
    expect(res.body.permitido).toBe(true);
    expect(res.body.disponivel).toBe(true);
  });

  test('não permitido para plano sem acesso remoto', () => {
    const res = mockRes();
    ctrl.disponibilidadeLaboratorio({ params: { id: '10' }, query: {}, usuario: carlos }, res);
    expect(res.body.permitido).toBe(false);
    expect(res.body.motivo).toBeTruthy();
  });

  test('reflete ocupação ao vivo de outro professor', () => {
    labRepo.iniciarUso(10, 2); // Bruno usando
    const res = mockRes();
    ctrl.disponibilidadeLaboratorio({ params: { id: '10' }, query: {}, usuario: ana }, res);
    expect(res.body.disponivel).toBe(false);
    expect(res.body.ocupacao.tipo).toBe('uso');
  });
});

describe('reservarLaboratorio', () => {
  test('cria reserva válida (201)', () => {
    const res = mockRes();
    ctrl.reservarLaboratorio({ params: { id: '10' }, usuario: ana, body: { inicio: FUT(1), fim: FUT(2) } }, res);
    expect(res.code).toBe(201);
    expect(res.body.id).toBeTruthy();
  });

  test('rejeita janela inválida (fim antes do início) com 400', () => {
    const res = mockRes();
    ctrl.reservarLaboratorio({ params: { id: '10' }, usuario: ana, body: { inicio: FUT(2), fim: FUT(1) } }, res);
    expect(res.code).toBe(400);
  });

  test('rejeita horário no passado com 400', () => {
    const res = mockRes();
    ctrl.reservarLaboratorio({ params: { id: '10' }, usuario: ana, body: { inicio: FUT(-2), fim: FUT(-1) } }, res);
    expect(res.code).toBe(400);
  });

  test('rejeita conflito de horário com 409', () => {
    labRepo.criarReserva(1, 10, FUT(1), FUT(3));
    const res = mockRes();
    ctrl.reservarLaboratorio({ params: { id: '10' }, usuario: bruno, body: { inicio: FUT(2), fim: FUT(4) } }, res);
    expect(res.code).toBe(409);
  });

  test('plano sem acesso remoto é bloqueado (403)', () => {
    const res = mockRes();
    ctrl.reservarLaboratorio({ params: { id: '10' }, usuario: carlos, body: { inicio: FUT(1), fim: FUT(2) } }, res);
    expect(res.code).toBe(403);
  });
});

describe('minhasReservas / atualizarReserva / deletarReserva', () => {
  test('minhasReservas retorna só as reservas do professor', () => {
    labRepo.criarReserva(1, 10, FUT(1), FUT(2));
    labRepo.criarReserva(2, 10, FUT(3), FUT(4));
    const res = mockRes();
    ctrl.minhasReservas({ usuario: ana }, res);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].titulo).toBe('Lab Remoto');
  });

  test('atualizarReserva pelo dono (200)', () => {
    const id = labRepo.criarReserva(1, 10, FUT(1), FUT(2));
    const res = mockRes();
    ctrl.atualizarReserva({ params: { reservaId: String(id) }, usuario: ana, body: { inicio: FUT(3), fim: FUT(4) } }, res);
    expect(res.code).toBe(200);
  });

  test('atualizarReserva de outro professor é negada (403)', () => {
    const id = labRepo.criarReserva(1, 10, FUT(1), FUT(2));
    const res = mockRes();
    ctrl.atualizarReserva({ params: { reservaId: String(id) }, usuario: bruno, body: { inicio: FUT(3), fim: FUT(4) } }, res);
    expect(res.code).toBe(403);
  });

  test('atualizarReserva inexistente retorna 404', () => {
    const res = mockRes();
    ctrl.atualizarReserva({ params: { reservaId: '999' }, usuario: ana, body: { inicio: FUT(1), fim: FUT(2) } }, res);
    expect(res.code).toBe(404);
  });

  test('atualizarReserva com janela inválida retorna 400', () => {
    const id = labRepo.criarReserva(1, 10, FUT(1), FUT(2));
    const res = mockRes();
    ctrl.atualizarReserva({ params: { reservaId: String(id) }, usuario: ana, body: { inicio: FUT(4), fim: FUT(3) } }, res);
    expect(res.code).toBe(400);
  });

  test('deletarReserva pelo dono (200) e de outro é negada (403)', () => {
    const id = labRepo.criarReserva(1, 10, FUT(1), FUT(2));

    const resNegado = mockRes();
    ctrl.deletarReserva({ params: { reservaId: String(id) }, usuario: bruno }, resNegado);
    expect(resNegado.code).toBe(403);

    const resOk = mockRes();
    ctrl.deletarReserva({ params: { reservaId: String(id) }, usuario: ana }, resOk);
    expect(resOk.code).toBe(200);
    expect(labRepo.buscarReservaPorId(id)).toBeFalsy();
  });

  test('deletarReserva inexistente retorna 404', () => {
    const res = mockRes();
    ctrl.deletarReserva({ params: { reservaId: '999' }, usuario: ana }, res);
    expect(res.code).toBe(404);
  });
});
