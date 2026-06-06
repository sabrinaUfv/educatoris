const usuarioRepository = require('../repositories/UsuarioRepository');
const planoRepository = require('../repositories/PlanoRepository');
const materialRepository = require('../repositories/MaterialRepository');

exports.listarProfessores = (_req, res) => {
  res.json(usuarioRepository.listarProfessores());
};

exports.alterarStatus = (req, res) => {
  const { ativo } = req.body;
  if (typeof ativo !== 'boolean') return res.status(400).json({ erro: 'Campo "ativo" (boolean) obrigatório.' });

  usuarioRepository.alterarStatus(parseInt(req.params.id), ativo);
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
