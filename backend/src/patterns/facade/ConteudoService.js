// Padrão Facade: interface simplificada que orquestra MaterialRepository, PlanoRepository, MaterialProxy, MaterialFactory e o pipeline de PDF
const MaterialFactory = require('../factory/MaterialFactory');
const MaterialProxy = require('../proxy/MaterialProxy');
const PDFBase = require('../decorator/PDFBase');
const PDFComMarcaDagua = require('../decorator/PDFComMarcaDagua');
const PDFComMetadados = require('../decorator/PDFComMetadados');

class ConteudoService {
  #materialRepository;
  #planoRepository;

  constructor(materialRepository, planoRepository) {
    this.#materialRepository = materialRepository;
    this.#planoRepository = planoRepository;
  }

  listarTemasPorAno(anoEscolar) {
    return this.#materialRepository.buscarTemasPorAno(anoEscolar);
  }

  buscarTemas(termo) {
    return this.#materialRepository.filtrarTemas(termo);
  }

  obterMateriaisDoTema(idConteudo) {
    const registros = this.#materialRepository.buscarPorConteudo(idConteudo);
    return registros.map(r => MaterialFactory.criar(r.tipo, r));
  }

  obterLaboratoriosPermitidos(professor) {
    const plano = this.#planoRepository.buscarPorProfessor(professor.id);
    const labs = this.#materialRepository.buscarLaboratorios();

    return labs.filter(lab => {
      try {
        const proxy = new MaterialProxy(lab, professor, plano);
        proxy.verificarAcesso();
        return true;
      } catch {
        return false;
      }
    });
  }

  verificarAcessoMaterial(material, professor) {
    const plano = this.#planoRepository.buscarPorProfessor(professor.id);
    const proxy = new MaterialProxy(material, professor, plano);
    return proxy.obterDados();
  }

  async gerarPDFComMarca(material, professor) {
    const plano = this.#planoRepository.buscarPorProfessor(professor.id);

    if (!plano || !plano.acesso_cont_download) {
      throw new Error('Seu plano não permite download de PDF.');
    }

    const gerador = new PDFComMetadados(
      new PDFComMarcaDagua(
        new PDFBase(material.url)
      )
    );

    return gerador.gerar({
      email: professor.email,
      professorId: professor.id,
      titulo: material.titulo,
    });
  }
}

const materialRepository = require('../../repositories/MaterialRepository');
const planoRepository = require('../../repositories/PlanoRepository');

module.exports = new ConteudoService(materialRepository, planoRepository);
