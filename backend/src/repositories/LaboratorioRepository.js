const db = require('../config/database');

class LaboratorioRepository {
  registrarAcesso(professorId, labId) {
    db.prepare('INSERT INTO acesso_lab (professor_id, lab_id) VALUES (?, ?)').run(professorId, labId);
  }

  buscarHistorico(professorId) {
    return db
      .prepare(
        `SELECT al.*, m.titulo, l.remoto
         FROM acesso_lab al
         JOIN materiais m ON al.lab_id = m.id
         JOIN laboratorios l ON al.lab_id = l.id
         WHERE al.professor_id = ?
         ORDER BY al.data_acesso DESC`
      )
      .all(professorId);
  }
}

module.exports = new LaboratorioRepository();
