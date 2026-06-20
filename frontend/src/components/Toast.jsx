import { useEffect } from 'react';

// Notificação flutuante (canto superior direito) que some sozinha.
// tipo: 'erro' | 'ok' | 'aviso'
export default function Toast({ texto, tipo = 'ok', onFechar, duracao = 4000 }) {
  useEffect(() => {
    if (!texto) return;
    const t = setTimeout(() => onFechar?.(), duracao);
    return () => clearTimeout(t);
  }, [texto, duracao, onFechar]);

  if (!texto) return null;

  const estilos = {
    erro: 'bg-red-50 border-red-200 text-red-700',
    ok: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    aviso: 'bg-amber-50 border-amber-200 text-amber-700',
  }[tipo] || 'bg-slate-50 border-slate-200 text-slate-700';

  return (
    <div className="fixed top-4 right-4 z-[60] animate-in fade-in slide-in-from-top-2 duration-300">
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${estilos}`}>
        <span className="shrink-0 mt-0.5">
          {tipo === 'erro' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          ) : tipo === 'aviso' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          )}
        </span>
        <p className="text-sm font-medium leading-snug">{texto}</p>
        <button onClick={() => onFechar?.()} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
}
