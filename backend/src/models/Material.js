class Material {
  constructor({ id, conteudo_id, titulo, descricao, url, tipo, status }) {
    this.id = id;
    this.conteudoId = conteudo_id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.url = url;
    this.tipo = tipo;
    this.status = Boolean(status);
  }
}

class Arquivo extends Material {
  constructor(dados) {
    super({ ...dados, tipo: 'arquivo' });
    this.editavel = Boolean(dados.editavel);
    this.avanco = Boolean(dados.avanco);
  }
}

class VideoAula extends Material {
  constructor(dados) {
    super({ ...dados, tipo: 'videoaula' });
    this.narrado = Boolean(dados.narrado);
    this.demonstrativo = Boolean(dados.demonstrativo);
    this.aulaEditavelId = dados.aula_editavel_id || null;
  }
}

class Laboratorio extends Material {
  constructor(dados) {
    super({ ...dados, tipo: 'laboratorio' });
    this.remoto = Boolean(dados.remoto);
  }
}

module.exports = { Material, Arquivo, VideoAula, Laboratorio };
