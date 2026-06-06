// Componente concreto base: carrega o PDF de origem (URL ou arquivo local)
const PDFGerador = require('./PDFGerador');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

class PDFBase extends PDFGerador {
  #origem;

  constructor(origem) {
    super();
    this.#origem = origem;
  }

  async gerar(contexto) {
    try {
      if (this.#origem?.startsWith('http://') || this.#origem?.startsWith('https://')) {
        const res = await fetch(this.#origem);
        if (res.ok) return Buffer.from(await res.arrayBuffer());
      } else if (this.#origem) {
        const caminho = path.isAbsolute(this.#origem)
          ? this.#origem
          : path.join(process.cwd(), this.#origem);
        if (fs.existsSync(caminho)) return fs.readFileSync(caminho);
      }
    } catch {}

    return this.#gerarPlaceholder(contexto);
  }

  async #gerarPlaceholder(contexto) {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const regular = await doc.embedFont(StandardFonts.Helvetica);

    page.drawText('e-ducatoris', { x: 50, y: 780, size: 24, font, color: rgb(0.1, 0.1, 0.5) });
    page.drawText(contexto?.titulo || 'Material Didático', { x: 50, y: 740, size: 16, font: regular });
    page.drawText('Conteúdo disponível na plataforma.', { x: 50, y: 700, size: 12, font: regular, color: rgb(0.4, 0.4, 0.4) });

    return Buffer.from(await doc.save());
  }
}

module.exports = PDFBase;
