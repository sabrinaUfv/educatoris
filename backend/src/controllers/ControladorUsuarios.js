const usuarioRepository = require('../repositories/UsuarioRepository');
const planoRepository = require('../repositories/PlanoRepository');
const materialRepository = require('../repositories/MaterialRepository');
const AuthService = require('../patterns/singleton/AuthService');

exports.listarProfessores = (_req, res) => {
  res.json(usuarioRepository.listarProfessores());
};

exports.alterarStatus = (req, res) => {
  const { ativo } = req.body;
  const id = parseInt(req.params.id);
  
  if (typeof ativo !== 'boolean') return res.status(400).json({ erro: 'Campo "ativo" (boolean) obrigatório.' });

  usuarioRepository.alterarStatus(id, ativo);

  if (!ativo) {
    const authService = AuthService.getInstance();
    authService.encerrarTodasSessoes(id);
  }

  res.json({ mensagem: `Usuário ${ativo ? 'desbloqueado' : 'bloqueado'} com sucesso.` });
};

exports.atualizarPlano = (req, res) => {
  const { preco } = req.body;
  if (preco === undefined || preco < 0) return res.status(400).json({ erro: 'Preço inválido.' });

  planoRepository.atualizarPreco(parseInt(req.params.id), preco);
  res.json({ mensagem: 'Plano atualizado com sucesso.' });
};

exports.adicionarConteudo = (req, res) => {
  const { titulo, anoEscolar, tema } = req.body;
  if (!titulo || !anoEscolar || !tema) return res.status(400).json({ erro: 'Campos obrigatórios: titulo, anoEscolar, tema.' });

  const todos = materialRepository.listarTodosConteudos();
  const duplicado = todos.some(c => 
    c.titulo.toLowerCase() === titulo.toLowerCase() && 
    c.tema.toLowerCase() === tema.toLowerCase() && 
    c.ano_escolar === parseInt(anoEscolar)
  );

  if (duplicado) {
    return res.status(409).json({ erro: 'Um conteúdo com este mesmo título e tema já existe.' });
  }

  const id = materialRepository.adicionarConteudo({ titulo, anoEscolar, tema });
  res.status(201).json({ mensagem: 'Conteúdo adicionado.', id });
};

exports.adicionarMaterial = (req, res) => {
  const { titulo, descricao, url, tipo, conteudoId, extras } = req.body;
  if (!titulo || !url || !tipo || !conteudoId) {
    return res.status(400).json({ erro: 'Campos obrigatórios: titulo, url, tipo, conteudoId.' });
  }

  const id = materialRepository.adicionarMaterial({ conteudoId, titulo, descricao, url, tipo });

  if (tipo === 'arquivo') materialRepository.adicionarArquivo(id, extras || {});
  else if (tipo === 'videoaula') materialRepository.adicionarVideoAula(id, extras || {});
  else if (tipo === 'laboratorio') materialRepository.adicionarLaboratorio(id, extras || {});

  res.status(201).json({ mensagem: 'Material adicionado.', id });
};

exports.inativarMaterial = (req, res) => {
  materialRepository.inativar(parseInt(req.params.id));
  res.json({ mensagem: 'Material inativado (soft delete).' });
};

exports.listarConteudos = (_req, res) => {
  res.json(materialRepository.listarTodosConteudos());
};

exports.inativarConteudo = (req, res) => {
  materialRepository.inativarConteudo(parseInt(req.params.id));
  res.json({ mensagem: 'Conteúdo inativado.' });
};

exports.deletarConteudo = (req, res) => {
  materialRepository.deletarDefinitivo(parseInt(req.params.id));
  res.json({ mensagem: 'Conteúdo deletado permanentemente.' });
};

exports.alternarStatusConteudo = (req, res) => {
  const { status } = req.body;
  materialRepository.alternarStatusConteudo(parseInt(req.params.id), status);
  res.json({ mensagem: `Conteúdo ${status ? 'visível' : 'ocultado'} com sucesso.` });
};