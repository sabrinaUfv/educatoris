const db = require('../config/database');

class PlanoRepository {
  listarAtivos() {
    return db.prepare('SELECT * FROM planos WHERE ativo = 1 ORDER BY nivel').all();
  }

  buscarPorId(id) {
    return db.prepare('SELECT * FROM planos WHERE id = ?').get(id);
  }

  buscarPorTitulo(titulo) {
    return db.prepare('SELECT * FROM planos WHERE LOWER(titulo) = LOWER(?)').get(titulo);
  }

  buscarPorProfessor(professorId) {
    return db
      .prepare(
        `SELECT a.id AS assinatura_id, a.data_vencimento, a.data_assinatura, a.ativo AS assinatura_ativa,
                p.*
         FROM assinaturas a
         JOIN planos p ON a.id_plano = p.id
         WHERE a.id_usuario = ? AND a.ativo = 1
         ORDER BY a.data_assinatura DESC
         LIMIT 1`
      )
      .get(professorId);
  }

  assinar(idUsuario, idPlano, dataVencimento) {
    db.prepare('UPDATE assinaturas SET ativo = 0 WHERE id_usuario = ?').run(idUsuario);

    const result = db
      .prepare('INSERT INTO assinaturas (id_plano, id_usuario, data_vencimento, ativo) VALUES (?, ?, ?, 1)')
      .run(idPlano, idUsuario, dataVencimento);

    db.prepare('UPDATE professores SET assinatura_id = ? WHERE id = ?')
      .run(result.lastInsertRowid, idUsuario);

    return result.lastInsertRowid;
  }

  listarTodos() {
    return db.prepare('SELECT * FROM planos ORDER BY nivel').all();
  }

  criar({ titulo, descricao, preco, nivel, acesso_video, acesso_lab_rem, acesso_lab_virt, acesso_cont_edit, acesso_cont_download }) {
    return db
      .prepare(
        `INSERT INTO planos (titulo, descricao, preco, nivel, acesso_video, acesso_lab_rem, acesso_lab_virt, acesso_cont_edit, acesso_cont_download, ativo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
      )
      .run(titulo, descricao || null, preco, nivel,
        acesso_video ? 1 : 0, acesso_lab_rem ? 1 : 0, acesso_lab_virt ? 1 : 0,
        acesso_cont_edit ? 1 : 0, acesso_cont_download ? 1 : 0
      ).lastInsertRowid;
  }

  atualizar(id, { titulo, descricao, preco, nivel, acesso_video, acesso_lab_rem, acesso_lab_virt, acesso_cont_edit, acesso_cont_download }) {
    db.prepare(
      `UPDATE planos SET titulo = ?, descricao = ?, preco = ?, nivel = ?,
       acesso_video = ?, acesso_lab_rem = ?, acesso_lab_virt = ?,
       acesso_cont_edit = ?, acesso_cont_download = ? WHERE id = ?`
    ).run(titulo, descricao || null, preco, nivel,
      acesso_video ? 1 : 0, acesso_lab_rem ? 1 : 0, acesso_lab_virt ? 1 : 0,
      acesso_cont_edit ? 1 : 0, acesso_cont_download ? 1 : 0, id
    );
  }

  atualizarPreco(id, preco) {
    db.prepare('UPDATE planos SET preco = ? WHERE id = ?').run(preco, id);
  }

  deletar(id) {
    db.prepare('UPDATE planos SET ativo = 0 WHERE id = ?').run(id);
  }
}

module.exports = new PlanoRepository();
