const materialRepository = require('../repositories/MaterialRepository');
const conteudoService = require('../patterns/facade/ConteudoService');

exports.baixarPDF = async (req, res) => {
  const material = materialRepository.buscarPorId(parseInt(req.params.idMaterial));

  if (!material) return res.status(404).json({ erro: 'Material não encontrado.' });
  if (material.tipo !== 'arquivo') return res.status(400).json({ erro: 'Material não é um arquivo PDF.' });

  try {
    const pdfBytes = await conteudoService.gerarPDFComMarca(material, req.usuario);
    const nomeArquivo = `${material.titulo.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
    res.send(pdfBytes);
  } catch (e) {
    res.status(403).json({ erro: e.message });
  }
};
