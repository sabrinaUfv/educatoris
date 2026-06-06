// Padrão Proxy (de Proteção): intercepta o acesso ao material e verifica o plano de assinatura antes de liberar
class MaterialProxy {
  #material;
  #professor;
  #plano;

  constructor(material, professor, plano) {
    this.#material = material;
    this.#professor = professor;
    this.#plano = plano;
  }

  verificarAcesso() {
    if (!this.#professor.status_ativo) {
      throw new Error('Conta bloqueada. Entre em contato com o suporte.');
    }
    if (!this.#plano || !this.#plano.ativo) {
      throw new Error('Assinatura inativa. Renove seu plano para continuar.');
    }

    const { tipo, remoto } = this.#material;

    if (tipo === 'laboratorio' && remoto && !this.#plano.acesso_lab_rem) {
      throw new Error('Laboratório Remoto requer o Plano Avançado (Plano 3).');
    }
    if (tipo === 'laboratorio' && !remoto && !this.#plano.acesso_lab_virt) {
      throw new Error('Laboratório Virtual requer o Plano Intermediário (Plano 2).');
    }

    return true;
  }

  obterDados() {
    this.verificarAcesso();
    return this.#material;
  }
}

module.exports = MaterialProxy;
