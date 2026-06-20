const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../../educatoris.db');
const SCHEMA_PATH = path.join(__dirname, '../db/schema.sql');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

// Migração leve: bancos criados antes das reservas de laboratório não têm as
// colunas data_inicio/data_fim (CREATE TABLE IF NOT EXISTS não as adiciona).
const colunasAcessoLab = db.prepare("PRAGMA table_info(acesso_lab)").all().map(c => c.name);
if (!colunasAcessoLab.includes('data_inicio')) {
  db.exec('ALTER TABLE acesso_lab ADD COLUMN data_inicio DATETIME');
}
if (!colunasAcessoLab.includes('data_fim')) {
  db.exec('ALTER TABLE acesso_lab ADD COLUMN data_fim DATETIME');
}

// Garante que sempre existe pelo menos um administrador no sistema
const adminExiste = db
  .prepare("SELECT id FROM usuarios WHERE tipo = 'administrador' AND status_ativo = 1 LIMIT 1")
  .get();

if (!adminExiste) {
  const senha = bcrypt.hashSync('admin123', 10);
  const resultado = db
    .prepare("INSERT INTO usuarios (nome, email, senha, tipo, status_ativo) VALUES ('Administrador', 'admin@educatoris.com', ?, 'administrador', 1)")
    .run(senha);
  db.prepare('INSERT INTO administradores (id, admin_acesso) VALUES (?, 1)').run(resultado.lastInsertRowid);
  console.log('[e-ducatoris] Admin padrão criado: admin@educatoris.com / admin123');
}

module.exports = db;
