import { useEffect, useState } from 'react';
import { disponibilidadeLaboratorio, listarReservasLaboratorio, reservarLaboratorio } from '../lib/api';
import Toast from './Toast';

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function ReservaLabModal({ material, onIniciarUso, onFechar }) {
  const [disp, setDisp] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [toast, setToast] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [iniciando, setIniciando] = useState(false);

  function notificar(texto, tipo = 'ok') {
    setToast({ texto, tipo });
  }

  async function carregar() {
    try {
      const [d, r] = await Promise.all([
        disponibilidadeLaboratorio(material.id),
        listarReservasLaboratorio(material.id),
      ]);
      setDisp(d);
      setReservas(r.reservas || []);
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  useEffect(() => { carregar(); }, [material.id]);

  async function handleAcessar() {
    setIniciando(true);
    try {
      await onIniciarUso(); // o pai inicia a sessão ao vivo e abre o iframe
    } catch (e) {
      notificar(e.message, 'erro');
      carregar(); // atualiza disponibilidade (pode ter sido ocupado)
    } finally {
      setIniciando(false);
    }
  }

  async function handleReservar(e) {
    e.preventDefault();

    // Validação amigável antes de chamar o servidor
    if (!inicio || !fim) {
      return notificar('Informe o horário de início e de término.', 'aviso');
    }
    const dtInicio = new Date(inicio);
    const dtFim = new Date(fim);
    if (dtFim <= dtInicio) {
      return notificar('O término deve ser depois do início.', 'aviso');
    }
    if (dtFim <= new Date()) {
      return notificar('Escolha um horário no futuro.', 'aviso');
    }

    setSalvando(true);
    try {
      await reservarLaboratorio(material.id, dtInicio.toISOString(), dtFim.toISOString());
      notificar('Reserva confirmada!', 'ok');
      setInicio(''); setFim('');
      await carregar();
    } catch (e) {
      notificar(e.message, 'erro');
    } finally {
      setSalvando(false);
    }
  }

  const disponivelAgora = disp?.disponivel;
  const permitido = disp ? disp.permitido !== false : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <Toast
        texto={toast?.texto}
        tipo={toast?.tipo}
        onFechar={() => setToast(null)}
      />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Laboratório Remoto</h2>
            <p className="text-sm text-slate-500 font-medium">{material.titulo}</p>
          </div>
          <button onClick={onFechar} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Plano não permite o laboratório remoto */}
        {disp && !permitido && (
          <div className="p-4 rounded-xl border bg-red-50 border-red-200">
            <p className="font-bold text-sm text-red-700">Plano insuficiente</p>
            <p className="text-xs text-red-600 mt-1">
              {disp.motivo || 'Seu plano não permite acessar este laboratório remoto.'}
            </p>
          </div>
        )}

        {/* Status de disponibilidade agora */}
        {disp && permitido && (
          <div className={`p-4 rounded-xl border ${disponivelAgora ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <p className={`font-bold text-sm ${disponivelAgora ? 'text-emerald-700' : 'text-amber-700'}`}>
              {disponivelAgora ? 'Disponível agora' : 'Ocupado no momento'}
            </p>
            {!disponivelAgora && disp.ocupacao && (
              <p className="text-xs text-amber-600 mt-1">
                {disp.ocupacao.tipo === 'uso'
                  ? `Em uso por ${disp.ocupacao.professor} neste momento.`
                  : `Reservado por ${disp.ocupacao.professor} até ${fmt(disp.ocupacao.fim)}.`}
              </p>
            )}
            {disponivelAgora && (
              <button
                onClick={handleAcessar}
                disabled={iniciando}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {iniciando ? 'Abrindo...' : 'Acessar agora (inicia uso)'}
              </button>
            )}
          </div>
        )}

        {/* Formulário de reserva */}
        {permitido && (
        <form onSubmit={handleReservar} className="space-y-3">
          <p className="text-sm font-bold text-slate-700">Reservar um horário</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Início</label>
              <input
                type="datetime-local"
                value={inicio}
                onChange={e => setInicio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Fim</label>
              <input
                type="datetime-local"
                value={fim}
                onChange={e => setFim(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={salvando}
            className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {salvando ? 'Reservando...' : 'Confirmar reserva'}
          </button>
        </form>
        )}

        {/* Próximas reservas */}
        <div>
          <p className="text-sm font-bold text-slate-700 mb-2">Horários reservados</p>
          {reservas.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma reserva futura. O laboratório está livre.</p>
          ) : (
            <ul className="space-y-1.5">
              {reservas.map(r => (
                <li key={r.id} className="flex items-center justify-between text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <span className="text-slate-700 font-medium">{fmt(r.inicio)} — {fmt(r.fim)}</span>
                  <span className={`text-xs font-bold ${r.minha ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {r.minha ? 'Você' : r.professor}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
