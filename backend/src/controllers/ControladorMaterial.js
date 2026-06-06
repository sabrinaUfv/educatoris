const conteudoService = require('../patterns/facade/ConteudoService');
const materialRepository = require('../repositories/MaterialRepository');
const laboratorioRepository = require('../repositories/LaboratorioRepository');

exports.listarPorTema = (req, res) => {
  const materiais = conteudoService.obterMateriaisDoTema(parseInt(req.params.idConteudo));
  res.json(materiais);
};

exports.acessarLaboratorio = (req, res) => {
  const lab = materialRepository.buscarPorId(parseInt(req.params.id));
  if (!lab) return res.status(404).json({ erro: 'Laboratório não encontrado.' });
  if (lab.tipo !== 'laboratorio') return res.status(400).json({ erro: 'Material não é um laboratório.' });

  // 'remoto' só existe se a linha em laboratorios foi inserida corretamente
  if (!('remoto' in lab)) {
    return res.status(500).json({ erro: 'Laboratório mal configurado no banco de dados.' });
  }

  try {
    const material = conteudoService.verificarAcessoMaterial(lab, req.usuario);

    // só professores têm registro em acesso_lab; admins são ignorados aqui
    if (req.usuario.tipo === 'professor') {
      try {
        laboratorioRepository.registrarAcesso(req.usuario.id, lab.id);
      } catch (e) {
        console.error('[acesso_lab] erro ao registrar acesso:', e.message);
      }
    }

    res.json({ url: material.url, titulo: material.titulo });
  } catch (e) {
    res.status(403).json({ erro: e.message });
  }
};
