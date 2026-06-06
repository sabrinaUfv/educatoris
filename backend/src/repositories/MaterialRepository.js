const db = require('../config/database');

class MaterialRepository {
  buscarTemasPorAno(anoEscolar) {
    return db
      .prepare('SELECT * FROM conteudos WHERE ano_escolar = ? AND status = 1')
      .all(anoEscolar);
  }

  filtrarTemas(termo) {
    return db
      .prepare("SELECT * FROM conteudos WHERE (titulo LIKE ? OR tema LIKE ?) AND status = 1")
      .all(`%${termo}%`, `%${termo}%`);
  }

  buscarPorConteudo(idConteudo) {
    const materiais = db
      .prepare('SELECT * FROM materiais WHERE conteudo_id = ? AND status = 1')
      .all(idConteudo);
    return materiais.map(m => this.#enriquecerMaterial(m));
  }

  buscarPorId(id) {
    const material = db
      .prepare('SELECT * FROM materiais WHERE id = ? AND status = 1')
      .get(id);
    if (!material) return null;
    return this.#enriquecerMaterial(material);
  }

  buscarLaboratorios() {
    return db
      .prepare(
        `SELECT m.*, l.remoto
         FROM materiais m
         JOIN laboratorios l ON m.id = l.id
         WHERE m.status = 1`
      )
      .all();
  }

  adicionarConteudo({ titulo, anoEscolar, tema }) {
    return db
      .prepare('INSERT INTO conteudos (titulo, ano_escolar, tema, status) VALUES (?, ?, ?, 1)')
      .run(titulo, anoEscolar, tema).lastInsertRowid;
  }

  adicionarMaterial({ conteudoId, titulo, descricao, url, tipo }) {
    return db
      .prepare('INSERT INTO materiais (conteudo_id, titulo, descricao, url, tipo) VALUES (?, ?, ?, ?, ?)')
      .run(conteudoId, titulo, descricao || null, url, tipo).lastInsertRowid;
  }

  adicionarArquivo(id, { editavel = false, avanco = false } = {}) {
    db.prepare('INSERT INTO arquivos (id, editavel, avanco) VALUES (?, ?, ?)').run(id, editavel ? 1 : 0, avanco ? 1 : 0);
  }

  adicionarVideoAula(id, { narrado = false, demonstrativo = false, aulaEditavelId = null } = {}) {
    db.prepare('INSERT INTO videoaulas (id, narrado, demonstrativo, aula_editavel_id) VALUES (?, ?, ?, ?)')
      .run(id, narrado ? 1 : 0, demonstrativo ? 1 : 0, aulaEditavelId);
  }

  adicionarLaboratorio(id, { remoto = false } = {}) {
    db.prepare('INSERT INTO laboratorios (id, remoto) VALUES (?, ?)').run(id, remoto ? 1 : 0);
  }

  inativar(id) {
    db.prepare(
      'UPDATE materiais SET status = 0, data_modificacao = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(id);
  }

  listarTodosConteudos() {
    return db
      .prepare('SELECT * FROM conteudos WHERE status = 1 ORDER BY ano_escolar, titulo')
      .all();
  }

  inativarConteudo(id) {
    db.prepare('UPDATE conteudos SET status = 0 WHERE id = ?').run(id);
  }

  #enriquecerMaterial(material) {
    if (material.tipo === 'arquivo') {
      const extra = db.prepare('SELECT * FROM arquivos WHERE id = ?').get(material.id);
      return { ...material, ...extra };
    }
    if (material.tipo === 'videoaula') {
      const extra = db.prepare('SELECT * FROM videoaulas WHERE id = ?').get(material.id);
      return { ...material, ...extra };
    }
    if (material.tipo === 'laboratorio') {
      const extra = db.prepare('SELECT * FROM laboratorios WHERE id = ?').get(material.id);
      return { ...material, ...extra };
    }
    return material;
  }
}

module.exports = new MaterialRepository();
