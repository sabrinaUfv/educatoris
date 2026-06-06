// Padrão Factory: centraliza a criação dos subtipos de Material, isolando o código cliente do 'new' concreto
const { Arquivo, VideoAula, Laboratorio } = require('../../models/Material');

class MaterialFactory {
  static criar(tipo, dados) {
    switch (tipo) {
      case 'arquivo':
        return new Arquivo(dados);
      case 'videoaula':
        return new VideoAula(dados);
      case 'laboratorio':
        return new Laboratorio(dados);
      default:
        throw new Error(`Tipo de material desconhecido: "${tipo}"`);
    }
  }
}

module.exports = MaterialFactory;
