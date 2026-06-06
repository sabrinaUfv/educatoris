import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getPlanos, atualizarPrecoPlano } from '../../lib/api';

const PERMISSOES = [
  { campo: 'acesso_video',          label: 'Videoaulas'          },
  { campo: 'acesso_lab_virt',       label: 'Lab Virtual'         },
  { campo: 'acesso_lab_rem',        label: 'Lab Remoto'          },
  { campo: 'acesso_cont_edit',      label: 'Conteúdo Editável'   },
  { campo: 'acesso_cont_download',  label: 'Download de PDF'     },
];

export default function AdminPlanos() {
  const [planos, setPlanos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [novoPreco, setNovoPreco] = useState('');
  const [msg, setMsg] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    getPlanos().then(setPlanos).catch(() => {});
  }, []);

  function notificar(texto, tipo = 'ok') {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg({ texto: '', tipo: '' }), 3000);
  }

  async function handleSalvar(id) {
    const preco = parseFloat(novoPreco);
    if (isNaN(preco) || preco < 0) { notificar('Preço inválido.', 'erro'); return; }
    try {
      await atualizarPrecoPlano(id, preco);
      notificar('Preço atualizado com sucesso.');
      setEditando(null);
      getPlanos().then(setPlanos);
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  return (
    <AdminLayout titulo="Planos de Assinatura">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Feedback Messages */}
        {msg.texto && (
          <div className={`p-4 rounded-xl font-medium flex items-center gap-3 shadow-sm ${msg.tipo === 'erro' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {msg.tipo === 'erro' ? (
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            ) : (
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            )}
            {msg.texto}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pl-2 border-l-4 border-indigo-500">
          <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-slate-800">
            Tabela de Preços
          </h2>
        </div>

        {/* Grid de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planos.map(p => (
            <div
              key={p.id}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-indigo-300 relative overflow-hidden"
            >
              {/* Badge de Nível */}
              <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-700 font-black text-xs px-4 py-1.5 rounded-bl-xl border-b border-l border-indigo-100">
                NÍVEL {p.nivel}
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{p.titulo}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{p.descricao}</p>
              </div>

              {/* Lista de Permissões */}
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">O que está incluído:</p>
                <ul className="space-y-3 mb-8">
                  {PERMISSOES.map(perm => (
                    <li key={perm.campo} className={`flex items-center gap-3 text-sm font-medium ${p[perm.campo] ? 'text-slate-700' : 'text-slate-400 line-through decoration-slate-300/50'}`}>
                      {p[perm.campo] ? (
                        <div className="bg-emerald-100 p-1 rounded-full text-emerald-600 shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                      ) : (
                        <div className="bg-slate-100 p-1 rounded-full text-slate-400 shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                      )}
                      {perm.label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Área de Preço e Edição */}
              <div className="mt-auto pt-6 border-t border-slate-100">
                {editando === p.id ? (
                  <div className="flex items-center gap-2 animate-in fade-in duration-200">
                    <span className="text-slate-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={novoPreco}
                      onChange={e => setNovoPreco(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-indigo-300 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      autoFocus
                    />
                    <button 
                      onClick={() => handleSalvar(p.id)}
                      className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                      title="Salvar Novo Preço"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button 
                      onClick={() => setEditando(null)}
                      className="p-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                      title="Cancelar"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  ) : (
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-1">Preço Mensal</span>
                      <strong className="text-3xl font-black text-indigo-600">
                        R$ {Number(p.preco).toFixed(2)}<span className="text-lg text-slate-400 font-medium">/mês</span>
                      </strong>
                    </div>
                    <button
                      onClick={() => { setEditando(p.id); setNovoPreco(String(p.preco)); }}
                      className="text-sm font-bold text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg mb-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      Editar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Aviso de Sistema */}
        <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex gap-3 items-start">
          <svg className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-amber-800 text-sm font-medium leading-relaxed">
            As permissões de cada plano (Videoaulas, Laboratórios, etc) são regras de negócio definidas diretamente no banco de dados. Para alterar o que cada plano tem direito de acessar, edite a tabela <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-bold mx-1">planos</code> via banco ou arquivo de seed.
          </p>
        </div>

      </div>
    </AdminLayout>
  );
}