// Testa o cascade delete de conteúdos com banco real (foreign_keys = ON),
// que o auto-mock do db não consegue exercitar (transação + dependentes).
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
const materialRepository = require('../MaterialRepository');

beforeEach(() => {
  db.exec(`
    DELETE FROM uso_lab; DELETE FROM acesso_lab; DELETE FROM laboratorios;
    DELETE FROM arquivos; DELETE FROM videoaulas; DELETE FROM materiais;
    DELETE FROM conteudos; DELETE FROM professores; DELETE FROM usuarios;
  `);
});

describe('MaterialRepository.deletarDefinitivo (cascade)', () => {
  test('apaga conteúdo com materiais, filhos e acessos sem violar FK', () => {
    db.exec(`
      INSERT INTO usuarios (id, nome, email, senha, tipo) VALUES (1, 'Ana', 'a@x', 'h', 'professor');
      INSERT INTO professores (id) VALUES (1);
      INSERT INTO conteudos (id, titulo, ano_escolar, tema) VALUES (1, 'Termo', 2, 'Calor');
      INSERT INTO materiais (id, conteudo_id, titulo, url, tipo) VALUES
        (10, 1, 'Apostila', '/u.pdf', 'arquivo'),
        (11, 1, 'Lab', 'http://lab', 'laboratorio');
      INSERT INTO arquivos (id, editavel, avanco) VALUES (10, 0, 0);
      INSERT INTO laboratorios (id, remoto) VALUES (11, 1);
      INSERT INTO acesso_lab (professor_id, lab_id, data_inicio, data_fim)
        VALUES (1, 11, '2030-01-01T10:00:00Z', '2030-01-01T12:00:00Z');
    `);

    expect(() => materialRepository.deletarDefinitivo(1)).not.toThrow();

    expect(db.prepare('SELECT COUNT(*) n FROM conteudos').get().n).toBe(0);
    expect(db.prepare('SELECT COUNT(*) n FROM materiais').get().n).toBe(0);
    expect(db.prepare('SELECT COUNT(*) n FROM arquivos').get().n).toBe(0);
    expect(db.prepare('SELECT COUNT(*) n FROM laboratorios').get().n).toBe(0);
    expect(db.prepare('SELECT COUNT(*) n FROM acesso_lab').get().n).toBe(0);
    expect(db.prepare('PRAGMA foreign_key_check').all()).toHaveLength(0);
  });

  test('apaga conteúdo sem materiais', () => {
    db.exec("INSERT INTO conteudos (id, titulo, ano_escolar, tema) VALUES (5, 'Vazio', 1, 'Tema')");
    expect(() => materialRepository.deletarDefinitivo(5)).not.toThrow();
    expect(db.prepare('SELECT COUNT(*) n FROM conteudos').get().n).toBe(0);
  });

  test('não afeta outros conteúdos', () => {
    db.exec(`
      INSERT INTO conteudos (id, titulo, ano_escolar, tema) VALUES (1, 'A', 1, 'T'), (2, 'B', 1, 'T');
      INSERT INTO materiais (id, conteudo_id, titulo, url, tipo) VALUES (10, 1, 'M', '/u', 'arquivo');
      INSERT INTO arquivos (id) VALUES (10);
    `);
    materialRepository.deletarDefinitivo(1);
    expect(db.prepare('SELECT id FROM conteudos').all()).toEqual([{ id: 2 }]);
  });
});
