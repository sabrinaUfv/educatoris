CREATE TABLE IF NOT EXISTS planos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descricao TEXT,
  preco REAL NOT NULL DEFAULT 0,
  nivel INTEGER NOT NULL DEFAULT 1,
  acesso_video INTEGER DEFAULT 1,
  acesso_lab_rem INTEGER DEFAULT 0,
  acesso_lab_virt INTEGER DEFAULT 0,
  acesso_cont_edit INTEGER DEFAULT 0,
  acesso_cont_download INTEGER DEFAULT 1,
  ativo INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  cpf TEXT,
  nome_social TEXT,
  status_ativo INTEGER DEFAULT 1,
  tipo TEXT NOT NULL CHECK(tipo IN ('professor', 'administrador')),
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS professores (
  id INTEGER PRIMARY KEY,
  lim_disp_ativos INTEGER DEFAULT 3,
  assinatura_id INTEGER,
  FOREIGN KEY (id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS administradores (
  id INTEGER PRIMARY KEY,
  admin_acesso INTEGER DEFAULT 1,
  FOREIGN KEY (id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS assinaturas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_plano INTEGER NOT NULL,
  id_usuario INTEGER NOT NULL,
  data_vencimento TEXT,
  data_assinatura TEXT DEFAULT (date('now')),
  ativo INTEGER DEFAULT 1,
  FOREIGN KEY (id_plano) REFERENCES planos(id),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS sessoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  ativo INTEGER DEFAULT 1,
  finalizado_em DATETIME,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS conteudos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  ano_escolar INTEGER CHECK(ano_escolar IN (1, 2, 3)),
  tema TEXT NOT NULL,
  status INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS materiais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conteudo_id INTEGER,
  titulo TEXT NOT NULL,
  descricao TEXT,
  url TEXT,
  tipo TEXT NOT NULL CHECK(tipo IN ('arquivo', 'videoaula', 'laboratorio')),
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_modificacao DATETIME,
  status INTEGER DEFAULT 1,
  FOREIGN KEY (conteudo_id) REFERENCES conteudos(id)
);

CREATE TABLE IF NOT EXISTS arquivos (
  id INTEGER PRIMARY KEY,
  editavel INTEGER DEFAULT 0,
  avanco INTEGER DEFAULT 0,
  FOREIGN KEY (id) REFERENCES materiais(id)
);

CREATE TABLE IF NOT EXISTS videoaulas (
  id INTEGER PRIMARY KEY,
  narrado INTEGER DEFAULT 0,
  demonstrativo INTEGER DEFAULT 0,
  aula_editavel_id INTEGER,
  FOREIGN KEY (id) REFERENCES materiais(id)
);

CREATE TABLE IF NOT EXISTS laboratorios (
  id INTEGER PRIMARY KEY,
  remoto INTEGER DEFAULT 0,
  FOREIGN KEY (id) REFERENCES materiais(id)
);

CREATE TABLE IF NOT EXISTS acesso_lab (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_acesso DATETIME DEFAULT CURRENT_TIMESTAMP,
  professor_id INTEGER NOT NULL,
  lab_id INTEGER NOT NULL,
  FOREIGN KEY (professor_id) REFERENCES professores(id),
  FOREIGN KEY (lab_id) REFERENCES laboratorios(id)
);
