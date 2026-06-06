// Componente abstrato da cadeia de Decoradores — define a interface que todos os geradores de PDF devem seguir
class PDFGerador {
  async gerar(contexto) {
    throw new Error('Método gerar() deve ser implementado pela subclasse');
  }
}

module.exports = PDFGerador;
