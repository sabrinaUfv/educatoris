const AuthService = require('../patterns/singleton/AuthService');
const usuarioRepository = require('../repositories/UsuarioRepository');

const authService = AuthService.getInstance();

exports.login = (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha obrigatórios.' });

  const usuario = usuarioRepository.buscarPorEmail(email);
  if (!usuario || !usuarioRepository.verificarSenha(senha, usuario.senha)) {
    return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
  }

  if (!usuario.status_ativo) {
    return res.status(403).json({ erro: 'Conta bloqueada. Entre em contato com o suporte.' });
  }

  if (!authService.verificarLimiteDispositivos(usuario.id)) {
    return res.status(403).json({
      erro: 'Limite de dispositivos simultâneos atingido.',
      codigo: 'LIMITE_DISPOSITIVOS',
    });
  }

  const token = authService.gerarToken(usuario);
  authService.criarSessao(usuario.id, token);

  res.json({
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo },
  });
};

exports.cadastrar = (req, res) => {
  const { nome, email, senha, cpf } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }

  if (usuarioRepository.buscarPorEmail(email)) {
    return res.status(409).json({ erro: 'E-mail já cadastrado.' });
  }

  const id = usuarioRepository.criar({ nome, email, senha, tipo: 'professor', cpf });
  res.status(201).json({ mensagem: 'Cadastro realizado com sucesso.', id });
};

exports.logout = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) authService.encerrarSessao(token);
  res.json({ mensagem: 'Sessão encerrada.' });
};

exports.encerrarOutrasSessoes = (req, res) => {
  authService.encerrarTodasSessoes(req.usuario.id);
  res.json({ mensagem: 'Todas as sessões foram encerradas.' });
};
