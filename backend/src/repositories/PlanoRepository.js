const db = require('../config/database');

class PlanoRepository {
  listarAtivos() {
    return db.prepare('SELECT * FROM planos WHERE ativo = 1 ORDER BY nivel').all();
  }

  buscarPorId(id) {
    return db.prepare('SELECT * FROM planos WHERE id = ?').get(id);
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

  atualizarPreco(id, preco) {
    db.prepare('UPDATE planos SET preco = ? WHERE id = ?').run(preco, id);
  }
}

module.exports = new PlanoRepository();
