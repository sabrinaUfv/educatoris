const conteudoService = require('../patterns/facade/ConteudoService');

exports.listarPorAno = (req, res) => {
  const ano = parseInt(req.params.ano);
  if (![1, 2, 3].includes(ano)) return res.status(400).json({ erro: 'Ano inválido. Use 1, 2 ou 3.' });

  res.json(conteudoService.listarTemasPorAno(ano));
};

exports.buscar = (req, res) => {
  const { q } = req.query;
  if (!q?.trim()) return res.status(400).json({ erro: 'Parâmetro de busca obrigatório.' });

  res.json(conteudoService.buscarTemas(q.trim()));
};

exports.laboratoriosPermitidos = (req, res) => {
  res.json(conteudoService.obterLaboratoriosPermitidos(req.usuario));
};
