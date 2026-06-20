import { useEffect, useState } from 'react';
import { getMinhasReservas, atualizarReserva, cancelarReserva } from '../lib/api';
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

// Converte um ISO (UTC) para o valor aceito por <input type="datetime-local"> (hora local).
function toLocalInput(iso) {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function MinhasReservas() {
  const [reservas, setReservas] = useState([]);
  const [editando, setEditando] = useState(null); // { id, inicio, fim }
  const [toast, setToast] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function notificar(texto, tipo = 'ok') {
    setToast({ texto, tipo });
  }

  async function carregar() {
    const dados = await getMinhasReservas().catch(() => []);
    setReservas(dados);
  }

  useEffect(() => { carregar(); }, []);

  function abrirEdicao(r) {
    setEditando({ id: r.id, inicio: toLocalInput(r.inicio), fim: toLocalInput(r.fim) });
  }

  async function salvarEdicao() {
    if (!editando.inicio || !editando.fim) {
      return notificar('Informe início e término.', 'aviso');
    }
    const dtInicio = new Date(editando.inicio);
    const dtFim = new Date(editando.fim);
    if (dtFim <= dtInicio) return notificar('O término deve ser depois do início.', 'aviso');
    if (dtFim <= new Date()) return notificar('Escolha um horário no futuro.', 'aviso');

    setSalvando(true);
    try {
      await atualizarReserva(editando.id, dtInicio.toISOString(), dtFim.toISOString());
      notificar('Reserva atualizada!', 'ok');
      setEditando(null);
      await carregar();
    } catch (e) {
      notificar(e.message, 'erro');
    } finally {
      setSalvando(false);
    }
  }

  async function deletar(r) {
    if (!confirm(`Cancelar a reserva de "${r.titulo}" (${fmt(r.inicio)})?`)) return;
    try {
      await cancelarReserva(r.id);
      notificar('Reserva cancelada.', 'ok');
      await carregar();
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  if (reservas.length === 0) return null;

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
      <Toast texto={toast?.texto} tipo={toast?.tipo} onFechar={() => setToast(null)} />

      <h2 className="text-lg font-bold text-slate-800 mb-4 pl-2 border-l-4 border-amber-500 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        Minhas reservas de laboratório
      </h2>

      <ul className="space-y-2.5">
        {reservas.map(r => (
          <li key={r.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            {editando?.id === r.id ? (
              <div className="space-y-3">
                <p className="font-bold text-slate-800 text-sm">{r.titulo}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Início</label>
                    <input
                      type="datetime-local"
                      value={editando.inicio}
                      onChange={e => setEditando({ ...editando, inicio: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Fim</label>
                    <input
                      type="datetime-local"
                      value={editando.fim}
                      onChange={e => setEditando({ ...editando, fim: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={salvarEdicao}
                    disabled={salvando}
                    className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {salvando ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={() => setEditando(null)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{r.titulo}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{fmt(r.inicio)} — {fmt(r.fim)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => abrirEdicao(r)}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Alterar
                  </button>
                  <button
                    onClick={() => deletar(r)}
                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
