// Usa um banco SQLite em memória real para exercitar o SQL de reservas e uso ao vivo.
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
const labRepo = require('../LaboratorioRepository');

const FUT = (h) => new Date(Date.now() + h * 3600e3).toISOString();
const PAST = (h) => new Date(Date.now() - h * 3600e3).toISOString();
const AGORA = () => new Date().toISOString();

beforeEach(() => {
  db.exec(`
    DELETE FROM uso_lab;
    DELETE FROM acesso_lab;
    DELETE FROM laboratorios;
    DELETE FROM materiais;
    DELETE FROM conteudos;
    DELETE FROM professores;
    DELETE FROM usuarios;
  `);
  db.exec(`
    INSERT INTO usuarios (id, nome, email, senha, tipo) VALUES
      (1, 'Ana', 'ana@x', 'h', 'professor'),
      (2, 'Bruno', 'bruno@x', 'h', 'professor');
    INSERT INTO professores (id) VALUES (1), (2);
    INSERT INTO conteudos (id, titulo, ano_escolar, tema) VALUES (1, 'Cinematica', 1, 'Mecanica');
    INSERT INTO materiais (id, conteudo_id, titulo, url, tipo) VALUES
      (10, 1, 'Lab Remoto', 'http://lab', 'laboratorio'),
      (11, 1, 'Lab Virtual', 'http://virt', 'laboratorio');
    INSERT INTO laboratorios (id, remoto) VALUES (10, 1), (11, 0);
  `);
});

describe('LaboratorioRepository - reservas', () => {
  test('criarReserva e buscarReservaPorId', () => {
    const inicio = FUT(1);
    const fim = FUT(2);
    const id = labRepo.criarReserva(1, 10, inicio, fim);
    const reserva = labRepo.buscarReservaPorId(id);
    expect(reserva.professor_id).toBe(1);
    expect(reserva.lab_id).toBe(10);
    expect(reserva.data_inicio).toBe(inicio);
  });

  test('buscarConflito detecta sobreposição de horários', () => {
    labRepo.criarReserva(1, 10, FUT(1), FUT(3));
    const conflito = labRepo.buscarConflito(10, FUT(2), FUT(4));
    expect(conflito).toBeTruthy();
    expect(conflito.professor_nome).toBe('Ana');
  });

  test('buscarConflito não acusa horários adjacentes', () => {
    labRepo.criarReserva(1, 10, FUT(1), FUT(3));
    expect(labRepo.buscarConflito(10, FUT(3), FUT(5))).toBeFalsy();
  });

  test('buscarConflito ignora a própria reserva (excetoId)', () => {
    const id = labRepo.criarReserva(1, 10, FUT(1), FUT(3));
    expect(labRepo.buscarConflito(10, FUT(1), FUT(3), id)).toBeFalsy();
  });

  test('reservaNoInstante retorna a reserva que ocupa o instante', () => {
    labRepo.criarReserva(1, 10, PAST(1), FUT(1));
    const r = labRepo.reservaNoInstante(10, AGORA());
    expect(r).toBeTruthy();
    expect(r.professor_nome).toBe('Ana');
  });

  test('reservaNoInstante retorna vazio quando livre', () => {
    labRepo.criarReserva(1, 10, FUT(5), FUT(6));
    expect(labRepo.reservaNoInstante(10, AGORA())).toBeFalsy();
  });

  test('listarReservasDoProfessor traz apenas reservas futuras do professor', () => {
    labRepo.criarReserva(1, 10, FUT(1), FUT(2));
    labRepo.criarReserva(2, 10, FUT(3), FUT(4)); // de outro professor
    const lista = labRepo.listarReservasDoProfessor(1, AGORA());
    expect(lista).toHaveLength(1);
    expect(lista[0].titulo).toBe('Lab Remoto');
  });

  test('atualizarReserva altera o horário', () => {
    const id = labRepo.criarReserva(1, 10, FUT(1), FUT(2));
    const novoInicio = FUT(3);
    labRepo.atualizarReserva(id, novoInicio, FUT(4));
    expect(labRepo.buscarReservaPorId(id).data_inicio).toBe(novoInicio);
  });

  test('deletarReserva remove a reserva', () => {
    const id = labRepo.criarReserva(1, 10, FUT(1), FUT(2));
    labRepo.deletarReserva(id);
    expect(labRepo.buscarReservaPorId(id)).toBeFalsy();
  });
});

describe('LaboratorioRepository - uso ao vivo', () => {
  test('iniciarUso marca o laboratório como ocupado', () => {
    const expira = labRepo.iniciarUso(10, 1);
    expect(typeof expira).toBe('string');
    const uso = labRepo.usoAtivo(10);
    expect(uso.professor_id).toBe(1);
    expect(uso.professor_nome).toBe('Ana');
  });

  test('iniciarUso por outro professor lança OCUPADO', () => {
    labRepo.iniciarUso(10, 1);
    expect(() => labRepo.iniciarUso(10, 2)).toThrow('OCUPADO');
  });

  test('iniciarUso pelo próprio dono apenas renova (não lança)', () => {
    labRepo.iniciarUso(10, 1);
    expect(() => labRepo.iniciarUso(10, 1)).not.toThrow();
  });

  test('manterUso renova para o dono e falha para não-dono', () => {
    labRepo.iniciarUso(10, 1);
    expect(labRepo.manterUso(10, 1)).toBeTruthy();
    expect(labRepo.manterUso(10, 2)).toBeNull();
  });

  test('encerrarUso libera o laboratório', () => {
    labRepo.iniciarUso(10, 1);
    labRepo.encerrarUso(10, 1);
    expect(labRepo.usoAtivo(10)).toBeFalsy();
    // agora outro professor consegue iniciar
    expect(() => labRepo.iniciarUso(10, 2)).not.toThrow();
  });

  test('usoAtivo limpa sessões expiradas', () => {
    db.prepare('INSERT INTO uso_lab (lab_id, professor_id, expira_em) VALUES (?, ?, ?)')
      .run(10, 1, PAST(1));
    expect(labRepo.usoAtivo(10)).toBeFalsy();
    expect(db.prepare('SELECT COUNT(*) n FROM uso_lab').get().n).toBe(0);
  });
});

describe('LaboratorioRepository - histórico', () => {
  test('registrarAcesso grava log e buscarHistorico retorna', () => {
    labRepo.registrarAcesso(1, 10);
    const hist = labRepo.buscarHistorico(1);
    expect(hist).toHaveLength(1);
    expect(hist[0].titulo).toBe('Lab Remoto');
  });
});
