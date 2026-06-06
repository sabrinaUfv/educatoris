const AuthService = require('../patterns/singleton/AuthService');
const usuarioRepository = require('../repositories/UsuarioRepository');

const authService = AuthService.getInstance();

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = authService.validarToken(token);

  if (!payload) return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  if (!authService.sessaoAtiva(token)) return res.status(401).json({ erro: 'Sessão encerrada.' });

  const usuario = usuarioRepository.buscarPorId(payload.id);
  if (!usuario || !usuario.status_ativo) {
    return res.status(403).json({ erro: 'Acesso negado.' });
  }

  req.usuario = usuario;
  next();
};
