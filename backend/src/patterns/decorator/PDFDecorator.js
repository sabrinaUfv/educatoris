// Decorador abstrato: encadeia geradores sem alterar a interface
const PDFGerador = require('./PDFGerador');

class PDFDecorator extends PDFGerador {
  constructor(gerador) {
    super();
    this._gerador = gerador;
  }

  async gerar(contexto) {
    return this._gerador.gerar(contexto);
  }
}

module.exports = PDFDecorator;
