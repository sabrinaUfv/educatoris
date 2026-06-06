// Decorador concreto: insere marca d'água de rastreio no rodapé de todas as páginas do PDF
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const PDFDecorator = require('./PDFDecorator');

class PDFComMarcaDagua extends PDFDecorator {
  async gerar(contexto) {
    const bytesBase = await this._gerador.gerar(contexto);
    const pdfDoc = await PDFDocument.load(bytesBase);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const texto = `e-ducatoris | ${contexto.email} | ${new Date().toLocaleDateString('pt-BR')}`;

    for (const pagina of pdfDoc.getPages()) {
      const { width } = pagina.getSize();
      pagina.drawText(texto, {
        x: 10,
        y: 10,
        size: 7,
        font,
        color: rgb(0.55, 0.55, 0.55),
        maxWidth: width - 20,
      });
    }

    return Buffer.from(await pdfDoc.save());
  }
}

module.exports = PDFComMarcaDagua;
