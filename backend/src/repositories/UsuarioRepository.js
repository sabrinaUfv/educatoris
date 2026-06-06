const db = require('../config/database');
const bcrypt = require('bcryptjs');

class UsuarioRepository {
  buscarPorEmail(email) {
    return db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  }

  buscarPorId(id) {
    return db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
  }

  criar({ nome, email, senha, tipo, cpf }) {
    const hash = bcrypt.hashSync(senha, 10);
    const result = db
      .prepare('INSERT INTO usuarios (nome, email, senha, tipo, cpf, status_ativo) VALUES (?, ?, ?, ?, ?, 1)')
      .run(nome, email, hash, tipo, cpf || null);

    if (tipo === 'professor') {
      db.prepare('INSERT INTO professores (id, lim_disp_ativos) VALUES (?, 3)').run(result.lastInsertRowid);
    } else if (tipo === 'administrador') {
      db.prepare('INSERT INTO administradores (id, admin_acesso) VALUES (?, 1)').run(result.lastInsertRowid);
    }

    return result.lastInsertRowid;
  }

  verificarSenha(senha, hash) {
    return bcrypt.compareSync(senha, hash);
  }

  alterarStatus(id, ativo) {
    db.prepare('UPDATE usuarios SET status_ativo = ? WHERE id = ?').run(ativo ? 1 : 0, id);
  }

  listarProfessores() {
    return db
      .prepare(
        `SELECT u.id, u.nome, u.email, u.status_ativo, u.criado_em,
                p.lim_disp_ativos, p.assinatura_id
         FROM usuarios u
         JOIN professores p ON u.id = p.id
         WHERE u.tipo = 'professor'`
      )
      .all();
  }

  atualizarSenha(id, novaSenha) {
    const hash = bcrypt.hashSync(novaSenha, 10);
    db.prepare('UPDATE usuarios SET senha = ? WHERE id = ?').run(hash, id);
  }

  atualizar(id, { nome, nomeSocial }) {
    db.prepare('UPDATE usuarios SET nome = ?, nome_social = ? WHERE id = ?').run(nome, nomeSocial || null, id);
  }
}

module.exports = new UsuarioRepository();
