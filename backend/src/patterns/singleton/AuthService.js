// Padrão Singleton: garante uma única instância do serviço de autenticação e controle de sessões
const jwt = require('jsonwebtoken');
const db = require('../../config/database');

const MAX_DISPOSITIVOS = 3;
const JWT_EXPIRACAO = '24h';

class AuthService {
  static #instancia = null;

  constructor() {}

  static getInstance() {
    if (!AuthService.#instancia) {
      AuthService.#instancia = new AuthService();
    }
    return AuthService.#instancia;
  }

  gerarToken(usuario) {
    return jwt.sign(
      { id: usuario.id, tipo: usuario.tipo, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRACAO }
    );
  }

  validarToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return null;
    }
  }

  verificarLimiteDispositivos(idUsuario) {
    const resultado = db
      .prepare('SELECT COUNT(*) AS total FROM sessoes WHERE id_usuario = ? AND ativo = 1')
      .get(idUsuario);
    return resultado.total < MAX_DISPOSITIVOS;
  }

  criarSessao(idUsuario, token) {
    db.prepare(
      'INSERT INTO sessoes (id_usuario, token, ativo) VALUES (?, ?, 1)'
    ).run(idUsuario, token);
  }

  encerrarSessao(token) {
    db.prepare(
      'UPDATE sessoes SET ativo = 0, finalizado_em = CURRENT_TIMESTAMP WHERE token = ?'
    ).run(token);
  }

  encerrarTodasSessoes(idUsuario) {
    db.prepare(
      'UPDATE sessoes SET ativo = 0, finalizado_em = CURRENT_TIMESTAMP WHERE id_usuario = ? AND ativo = 1'
    ).run(idUsuario);
  }

  sessaoAtiva(token) {
    const sessao = db
      .prepare('SELECT id FROM sessoes WHERE token = ? AND ativo = 1')
      .get(token);
    return !!sessao;
  }
}

module.exports = AuthService;
