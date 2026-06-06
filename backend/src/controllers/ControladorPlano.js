const planoRepository = require('../repositories/PlanoRepository');

exports.listar = (_req, res) => {
  res.json(planoRepository.listarAtivos());
};

exports.meuPlano = (req, res) => {
  const plano = planoRepository.buscarPorProfessor(req.usuario.id);
  res.json(plano || { mensagem: 'Nenhuma assinatura ativa.' });
};

exports.assinar = (req, res) => {
  const { idPlano } = req.body;
  if (!idPlano) return res.status(400).json({ erro: 'ID do plano obrigatório.' });

  const plano = planoRepository.buscarPorId(idPlano);
  if (!plano) return res.status(404).json({ erro: 'Plano não encontrado.' });

  const planoAtual = planoRepository.buscarPorProfessor(req.usuario.id);
  if (planoAtual && planoAtual.id === idPlano) {
    return res.status(400).json({ erro: 'Você já está neste plano.' });
  }

  const dataVencimento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const idAssinatura = planoRepository.assinar(req.usuario.id, idPlano, dataVencimento);
  res.json({ mensagem: 'Plano atualizado com sucesso.', idAssinatura, vencimento: dataVencimento });
};
