const conteudoService = require('../patterns/facade/ConteudoService');
const materialRepository = require('../repositories/MaterialRepository');
const laboratorioRepository = require('../repositories/LaboratorioRepository');

exports.listarPorTema = (req, res) => {
  const materiais = conteudoService.obterMateriaisDoTema(parseInt(req.params.idConteudo));
  res.json(materiais);
};

// Carrega o laboratório validando que existe, é do tipo certo e está bem configurado.
function carregarLaboratorio(id, res) {
  const lab = materialRepository.buscarPorId(parseInt(id));
  if (!lab) {
    res.status(404).json({ erro: 'Laboratório não encontrado.' });
    return null;
  }
  if (lab.tipo !== 'laboratorio') {
    res.status(400).json({ erro: 'Material não é um laboratório.' });
    return null;
  }
  if (!('remoto' in lab)) {
    res.status(500).json({ erro: 'Laboratório mal configurado no banco de dados.' });
    return null;
  }
  return lab;
}

// Verifica se o laboratório remoto está ocupado por OUTRO usuário, seja por uso
// ao vivo (alguém com o lab aberto agora) ou por uma reserva vigente no momento.
function ocupacaoPorOutro(labId, usuarioId) {
  const uso = laboratorioRepository.usoAtivo(labId);
  if (uso && uso.professor_id !== usuarioId) {
    return { tipo: 'uso', professor: uso.professor_nome, fim: uso.expira_em };
  }
  const reserva = laboratorioRepository.reservaNoInstante(labId, new Date().toISOString());
  if (reserva && reserva.professor_id !== usuarioId) {
    return { tipo: 'reserva', professor: reserva.professor_nome, fim: reserva.data_fim };
  }
  return null;
}

exports.acessarLaboratorio = (req, res) => {
  const lab = carregarLaboratorio(req.params.id, res);
  if (!lab) return;

  try {
    // Verifica plano de assinatura (Proxy) antes de qualquer coisa
    const material = conteudoService.verificarAcessoMaterial(lab, req.usuario);

    // Laboratórios remotos são recurso físico limitado: validar ocupação atual.
    if (lab.remoto) {
      const ocupacao = ocupacaoPorOutro(lab.id, req.usuario.id);
      if (ocupacao) {
        return res.status(409).json({
          erro: ocupacao.tipo === 'uso'
            ? `Laboratório em uso por ${ocupacao.professor} no momento. Tente novamente em instantes.`
            : `Laboratório reservado por ${ocupacao.professor} até ${ocupacao.fim}. Reserve outro horário.`,
          ocupadoAte: ocupacao.fim,
        });
      }
    }

    // só professores têm registro em acesso_lab; admins são ignorados aqui
    if (req.usuario.tipo === 'professor') {
      try {
        laboratorioRepository.registrarAcesso(req.usuario.id, lab.id);
      } catch (e) {
        console.error('[acesso_lab] erro ao registrar acesso:', e.message);
      }
    }

    res.json({ url: material.url, titulo: material.titulo });
  } catch (e) {
    res.status(403).json({ erro: e.message });
  }
};

// Inicia o uso ao vivo de um laboratório remoto: marca o lab como "em uso" pelo
// professor e devolve a URL para abrir no iframe.
exports.iniciarUsoLaboratorio = (req, res) => {
  const lab = carregarLaboratorio(req.params.id, res);
  if (!lab) return;

  let material;
  try {
    material = conteudoService.verificarAcessoMaterial(lab, req.usuario);
  } catch (e) {
    return res.status(403).json({ erro: e.message });
  }

  // Labs virtuais não têm ocupação: apenas devolve a URL.
  if (!lab.remoto) {
    return res.json({ url: material.url, titulo: material.titulo });
  }

  if (req.usuario.tipo !== 'professor') {
    return res.status(403).json({ erro: 'Apenas professores podem usar laboratórios remotos.' });
  }

  const ocupacao = ocupacaoPorOutro(lab.id, req.usuario.id);
  if (ocupacao) {
    return res.status(409).json({
      erro: ocupacao.tipo === 'uso'
        ? `Laboratório em uso por ${ocupacao.professor} no momento.`
        : `Laboratório reservado por ${ocupacao.professor} até ${ocupacao.fim}.`,
      ocupadoAte: ocupacao.fim,
    });
  }

  let expiraEm;
  try {
    expiraEm = laboratorioRepository.iniciarUso(lab.id, req.usuario.id);
  } catch (e) {
    if (e.code === 'OCUPADO') {
      return res.status(409).json({ erro: 'Laboratório acabou de ser ocupado por outro professor.' });
    }
    throw e;
  }

  try {
    laboratorioRepository.registrarAcesso(req.usuario.id, lab.id);
  } catch (e) {
    console.error('[acesso_lab] erro ao registrar acesso:', e.message);
  }

  res.json({ url: material.url, titulo: material.titulo, expiraEm });
};

// Heartbeat: renova o uso ao vivo enquanto o laboratório está aberto.
exports.manterUsoLaboratorio = (req, res) => {
  const lab = carregarLaboratorio(req.params.id, res);
  if (!lab) return;

  const expiraEm = laboratorioRepository.manterUso(lab.id, req.usuario.id);
  if (!expiraEm) {
    return res.status(409).json({ erro: 'Sua sessão de uso expirou ou foi assumida por outro professor.' });
  }
  res.json({ expiraEm });
};

// Encerra o uso ao vivo, liberando o laboratório para outros professores.
exports.encerrarUsoLaboratorio = (req, res) => {
  const lab = carregarLaboratorio(req.params.id, res);
  if (!lab) return;

  laboratorioRepository.encerrarUso(lab.id, req.usuario.id);
  res.json({ mensagem: 'Uso encerrado. Laboratório liberado.' });
};

// Consulta se o laboratório está disponível em um instante (default: agora).
exports.disponibilidadeLaboratorio = (req, res) => {
  const lab = carregarLaboratorio(req.params.id, res);
  if (!lab) return;

  // O plano de assinatura (Proxy) define se o usuário pode usar/reservar este lab.
  let permitido = true;
  let motivo = null;
  try {
    conteudoService.verificarAcessoMaterial(lab, req.usuario);
  } catch (e) {
    permitido = false;
    motivo = e.message;
  }

  if (!lab.remoto) {
    return res.json({ remoto: false, disponivel: true, permitido, motivo });
  }

  // Ocupação no momento: uso ao vivo (alguém com o lab aberto) ou reserva vigente.
  const ocupacao = ocupacaoPorOutro(lab.id, req.usuario.id);

  res.json({
    remoto: true,
    permitido,
    motivo,
    disponivel: !ocupacao,
    ocupacao: ocupacao
      ? { tipo: ocupacao.tipo, professor: ocupacao.professor, fim: ocupacao.fim }
      : null,
  });
};

// Lista as reservas futuras/vigentes de um laboratório remoto.
exports.listarReservasLaboratorio = (req, res) => {
  const lab = carregarLaboratorio(req.params.id, res);
  if (!lab) return;

  const agora = new Date().toISOString();
  const reservas = laboratorioRepository.listarReservas(lab.id, agora).map(r => ({
    id: r.id,
    inicio: r.data_inicio,
    fim: r.data_fim,
    professor: r.professor_nome,
    minha: r.professor_id === req.usuario.id,
  }));

  res.json({ remoto: !!lab.remoto, reservas });
};

// Valida e normaliza a janela [inicio, fim). Retorna { erro } ou { isoInicio, isoFim }.
function validarJanela(inicio, fim) {
  if (!inicio || !fim) return { erro: 'Campos obrigatórios: inicio e fim.' };

  const dtInicio = new Date(inicio);
  const dtFim = new Date(fim);
  if (isNaN(dtInicio) || isNaN(dtFim)) return { erro: 'Datas inválidas.' };
  if (dtFim <= dtInicio) return { erro: 'O fim da reserva deve ser depois do início.' };
  if (dtFim <= new Date()) return { erro: 'Não é possível reservar um horário no passado.' };

  return { isoInicio: dtInicio.toISOString(), isoFim: dtFim.toISOString() };
}

// Cria uma reserva de horário para um laboratório remoto.
exports.reservarLaboratorio = (req, res) => {
  const lab = carregarLaboratorio(req.params.id, res);
  if (!lab) return;

  if (req.usuario.tipo !== 'professor') {
    return res.status(403).json({ erro: 'Apenas professores podem reservar laboratórios.' });
  }
  if (!lab.remoto) {
    return res.status(400).json({ erro: 'Apenas laboratórios remotos exigem reserva.' });
  }

  const { isoInicio, isoFim, erro } = validarJanela(req.body.inicio, req.body.fim);
  if (erro) return res.status(400).json({ erro });

  try {
    // Verifica plano de assinatura (Proxy)
    conteudoService.verificarAcessoMaterial(lab, req.usuario);
  } catch (e) {
    return res.status(403).json({ erro: e.message });
  }

  const conflito = laboratorioRepository.buscarConflito(lab.id, isoInicio, isoFim);
  if (conflito) {
    return res.status(409).json({
      erro: `Já existe uma reserva de ${conflito.professor_nome} neste horário.`,
    });
  }

  const id = laboratorioRepository.criarReserva(req.usuario.id, lab.id, isoInicio, isoFim);
  res.status(201).json({ mensagem: 'Reserva confirmada.', id, inicio: isoInicio, fim: isoFim });
};

// Lista todas as reservas vigentes/futuras do professor logado.
exports.minhasReservas = (req, res) => {
  const agora = new Date().toISOString();
  const reservas = laboratorioRepository.listarReservasDoProfessor(req.usuario.id, agora).map(r => ({
    id: r.id,
    labId: r.lab_id,
    conteudoId: r.conteudo_id,
    titulo: r.titulo,
    inicio: r.data_inicio,
    fim: r.data_fim,
  }));
  res.json(reservas);
};

// Altera o horário de uma reserva do próprio professor.
exports.atualizarReserva = (req, res) => {
  const reservaId = parseInt(req.params.reservaId);
  const reserva = laboratorioRepository.buscarReservaPorId(reservaId);
  if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada.' });
  if (reserva.professor_id !== req.usuario.id) {
    return res.status(403).json({ erro: 'Você só pode alterar suas próprias reservas.' });
  }

  const { isoInicio, isoFim, erro } = validarJanela(req.body.inicio, req.body.fim);
  if (erro) return res.status(400).json({ erro });

  // Conflito com outras reservas do mesmo lab, ignorando a própria.
  const conflito = laboratorioRepository.buscarConflito(reserva.lab_id, isoInicio, isoFim, reservaId);
  if (conflito) {
    return res.status(409).json({ erro: `Já existe uma reserva de ${conflito.professor_nome} neste horário.` });
  }

  laboratorioRepository.atualizarReserva(reservaId, isoInicio, isoFim);
  res.json({ mensagem: 'Reserva atualizada.', inicio: isoInicio, fim: isoFim });
};

// Cancela uma reserva do próprio professor.
exports.deletarReserva = (req, res) => {
  const reservaId = parseInt(req.params.reservaId);
  const reserva = laboratorioRepository.buscarReservaPorId(reservaId);
  if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada.' });
  if (reserva.professor_id !== req.usuario.id) {
    return res.status(403).json({ erro: 'Você só pode cancelar suas próprias reservas.' });
  }

  laboratorioRepository.deletarReserva(reservaId);
  res.json({ mensagem: 'Reserva cancelada.' });
};
