const db = require('../config/database');

// Tempo de vida de uma sessão de uso ao vivo sem heartbeat (rede de segurança
// contra travas: se o professor fechar a aba sem encerrar, o lab é liberado).
const USO_TTL_MS = 2 * 60 * 1000;

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

  // --- Reservas de laboratório remoto ---

  // Cria uma reserva [dataInicio, dataFim) para o professor no laboratório.
  criarReserva(professorId, labId, dataInicio, dataFim) {
    return db
      .prepare(
        'INSERT INTO acesso_lab (professor_id, lab_id, data_inicio, data_fim) VALUES (?, ?, ?, ?)'
      )
      .run(professorId, labId, dataInicio, dataFim).lastInsertRowid;
  }

  // Retorna a primeira reserva que conflita com a janela informada (sobreposição
  // de intervalos: inicioA < fimB AND inicioB < fimA). Ignora a própria reserva
  // quando excetoId é passado. Considera apenas reservas futuras/vigentes.
  buscarConflito(labId, dataInicio, dataFim, excetoId = null) {
    return db
      .prepare(
        `SELECT al.*, u.nome AS professor_nome
         FROM acesso_lab al
         JOIN usuarios u ON al.professor_id = u.id
         WHERE al.lab_id = ?
           AND al.data_inicio IS NOT NULL
           AND al.data_fim > ?
           AND al.data_inicio < ?
           AND (? IS NULL OR al.id != ?)
         ORDER BY al.data_inicio
         LIMIT 1`
      )
      .get(labId, dataInicio, dataFim, excetoId, excetoId);
  }

  // Retorna a reserva que ocupa o laboratório no instante informado, se houver.
  reservaNoInstante(labId, instante) {
    return db
      .prepare(
        `SELECT al.*, u.nome AS professor_nome
         FROM acesso_lab al
         JOIN usuarios u ON al.professor_id = u.id
         WHERE al.lab_id = ?
           AND al.data_inicio IS NOT NULL
           AND al.data_inicio <= ?
           AND al.data_fim > ?
         ORDER BY al.data_inicio
         LIMIT 1`
      )
      .get(labId, instante, instante);
  }

  // --- Uso ao vivo de laboratório remoto ---

  // Retorna o uso ativo (não expirado) do laboratório, se houver. Limpa expirados.
  usoAtivo(labId) {
    const agora = new Date().toISOString();
    db.prepare('DELETE FROM uso_lab WHERE expira_em <= ?').run(agora);
    return db
      .prepare(
        `SELECT ul.*, u.nome AS professor_nome
         FROM uso_lab ul
         JOIN usuarios u ON ul.professor_id = u.id
         WHERE ul.lab_id = ? AND ul.expira_em > ?`
      )
      .get(labId, agora);
  }

  // Inicia (ou reassume, se for o próprio dono) o uso ao vivo. Lança erro
  // OCUPADO se outro professor estiver usando. Operação atômica.
  iniciarUso(labId, professorId) {
    return db.transaction(() => {
      const agora = new Date().toISOString();
      db.prepare('DELETE FROM uso_lab WHERE expira_em <= ?').run(agora);

      const atual = db.prepare('SELECT professor_id FROM uso_lab WHERE lab_id = ?').get(labId);
      if (atual && atual.professor_id !== professorId) {
        const e = new Error('OCUPADO');
        e.code = 'OCUPADO';
        throw e;
      }

      const expira = new Date(Date.now() + USO_TTL_MS).toISOString();
      db.prepare(
        `INSERT INTO uso_lab (lab_id, professor_id, expira_em) VALUES (?, ?, ?)
         ON CONFLICT(lab_id) DO UPDATE SET
           professor_id = excluded.professor_id,
           expira_em = excluded.expira_em,
           iniciado_em = CURRENT_TIMESTAMP`
      ).run(labId, professorId, expira);

      return expira;
    })();
  }

  // Renova o uso ao vivo (heartbeat). Retorna a nova expiração ou null se o
  // professor não detém mais o uso (expirou ou foi assumido).
  manterUso(labId, professorId) {
    const expira = new Date(Date.now() + USO_TTL_MS).toISOString();
    const r = db
      .prepare('UPDATE uso_lab SET expira_em = ? WHERE lab_id = ? AND professor_id = ? AND expira_em > ?')
      .run(expira, labId, professorId, new Date().toISOString());
    return r.changes > 0 ? expira : null;
  }

  // Libera o uso ao vivo (apenas o dono pode encerrar).
  encerrarUso(labId, professorId) {
    db.prepare('DELETE FROM uso_lab WHERE lab_id = ? AND professor_id = ?').run(labId, professorId);
  }

  // Lista as reservas vigentes/futuras de um laboratório (para exibir os horários ocupados).
  listarReservas(labId, aPartirDe) {
    return db
      .prepare(
        `SELECT al.id, al.lab_id, al.professor_id, al.data_inicio, al.data_fim,
                u.nome AS professor_nome
         FROM acesso_lab al
         JOIN usuarios u ON al.professor_id = u.id
         WHERE al.lab_id = ?
           AND al.data_inicio IS NOT NULL
           AND al.data_fim > ?
         ORDER BY al.data_inicio`
      )
      .all(labId, aPartirDe);
  }

  // Lista as reservas vigentes/futuras de um professor (todas as suas reservas).
  listarReservasDoProfessor(professorId, aPartirDe) {
    return db
      .prepare(
        `SELECT al.id, al.lab_id, al.data_inicio, al.data_fim,
                m.titulo, m.conteudo_id
         FROM acesso_lab al
         JOIN materiais m ON al.lab_id = m.id
         WHERE al.professor_id = ?
           AND al.data_inicio IS NOT NULL
           AND al.data_fim > ?
         ORDER BY al.data_inicio`
      )
      .all(professorId, aPartirDe);
  }

  buscarReservaPorId(id) {
    return db
      .prepare('SELECT * FROM acesso_lab WHERE id = ? AND data_inicio IS NOT NULL')
      .get(id);
  }

  atualizarReserva(id, dataInicio, dataFim) {
    db.prepare('UPDATE acesso_lab SET data_inicio = ?, data_fim = ? WHERE id = ?')
      .run(dataInicio, dataFim, id);
  }

  deletarReserva(id) {
    db.prepare('DELETE FROM acesso_lab WHERE id = ?').run(id);
  }
}

module.exports = new LaboratorioRepository();
