// Decorador concreto: insere metadados únicos de identificação no PDF para rastreabilidade
const { PDFDocument } = require('pdf-lib');
const PDFDecorator = require('./PDFDecorator');

class PDFComMetadados extends PDFDecorator {
  async gerar(contexto) {
    const bytes = await this._gerador.gerar(contexto);
    const pdfDoc = await PDFDocument.load(bytes);

    pdfDoc.setAuthor('e-ducatoris');
    pdfDoc.setProducer('e-ducatoris Platform');
    pdfDoc.setCreator(`Professor ID: ${contexto.professorId}`);
    pdfDoc.setKeywords([
      `usuario:${contexto.email}`,
      `download:${new Date().toISOString()}`,
      `material:${contexto.titulo || 'desconhecido'}`,
    ]);

    return Buffer.from(await pdfDoc.save());
  }
}

module.exports = PDFComMetadados;
