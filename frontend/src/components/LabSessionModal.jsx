import { useEffect, useRef, useState } from 'react';
import { manterUsoLaboratorio, encerrarUsoLaboratorio, encerrarUsoBeacon } from '../lib/api';

const HEARTBEAT_MS = 45 * 1000;

// Modal de uso ao vivo: enquanto está aberto, o laboratório remoto fica "em uso".
// Mantém a sessão viva por heartbeat e a encerra ao fechar (ou ao fechar a aba).
export default function LabSessionModal({ material, url, onEncerrar, onExpirar }) {
  const [iframeOk, setIframeOk] = useState(true);
  const encerrado = useRef(false);

  // Libera o laboratório de forma idempotente (só uma vez).
  async function liberar() {
    if (encerrado.current) return;
    encerrado.current = true;
    try {
      await encerrarUsoLaboratorio(material.id);
    } catch {
      /* ignora: o TTL do servidor libera de qualquer forma */
    }
  }

  async function handleEncerrar() {
    await liberar();
    onEncerrar();
  }

  useEffect(() => {
    // Heartbeat: renova a posse do laboratório periodicamente.
    const timer = setInterval(async () => {
      try {
        await manterUsoLaboratorio(material.id);
      } catch {
        // Sessão expirou ou foi assumida por outro professor.
        encerrado.current = true;
        clearInterval(timer);
        if (onExpirar) onExpirar();
      }
    }, HEARTBEAT_MS);

    // Rede de segurança: encerra ao fechar a aba/navegar.
    const aoSair = () => encerrarUsoBeacon(material.id);
    window.addEventListener('beforeunload', aoSair);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', aoSair);
      // Encerra ao desmontar (fechar modal / sair da página).
      liberar();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-200">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0"></span>
            <div className="min-w-0">
              <p className="font-bold text-slate-800 truncate">{material.titulo}</p>
              <p className="text-xs text-emerald-600 font-bold">Em uso por você</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleEncerrar}
              className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors"
            >
              Encerrar uso
            </button>
          </div>
        </div>

        {/* Corpo: labs remotos não permitem incorporação em iframe (X-Frame-Options),
            então abrimos direto em nova aba; labs virtuais rodam embutidos. */}
        <div className="flex-1 bg-slate-100 min-h-[60vh] relative flex items-center justify-center">
          {material.remoto ? (
            <div className="text-center max-w-md px-6 py-10">
              <p className="font-bold text-slate-800 mb-1">Laboratório remoto</p>
              <p className="text-sm text-slate-500 mb-6">
                Este experimento roda no equipamento real do provedor e abre em uma nova aba.
                A reserva continua ativa enquanto esta janela estiver aberta.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors"
              >
                Abrir laboratório em nova aba
              </a>
            </div>
          ) : (
            <>
              {iframeOk ? (
                <iframe
                  src={url}
                  title={material.titulo}
                  className="w-full h-full min-h-[60vh] border-0"
                  onError={() => setIframeOk(false)}
                  allow="fullscreen"
                />
              ) : null}

              {/* Fallback caso o laboratório bloqueie incorporação em iframe */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 border border-slate-200 rounded-xl px-4 py-2 shadow-sm text-center">
                <p className="text-xs text-slate-500">
                  O laboratório não carregou aqui?{' '}
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold underline">
                    Abrir em nova aba
                  </a>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="p-3 border-t border-slate-200 bg-amber-50">
          <p className="text-xs text-amber-700 text-center font-medium">
            Enquanto esta janela estiver aberta, o laboratório fica reservado para você.
            Clique em <strong>Encerrar uso</strong> ao terminar para liberá-lo.
          </p>
        </div>
      </div>
    </div>
  );
}
