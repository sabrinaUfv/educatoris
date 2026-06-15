import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAdminPlanos, criarPlano, atualizarPlano, deletarPlano } from '../../lib/api';

const PERMISSOES = [
  { campo: 'acesso_video',         label: 'Videoaulas'        },
  { campo: 'acesso_lab_virt',      label: 'Lab Virtual'       },
  { campo: 'acesso_lab_rem',       label: 'Lab Remoto'        },
  { campo: 'acesso_cont_edit',     label: 'Conteúdo Editável' },
  { campo: 'acesso_cont_download', label: 'Download de PDF'   },
];

const formVazio = {
  titulo: '', descricao: '', preco: '', nivel: '',
  acesso_video: false, acesso_lab_virt: false, acesso_lab_rem: false,
  acesso_cont_edit: false, acesso_cont_download: false,
};

function PlanoModal({ inicial, onSalvar, onFechar }) {
  const [form, setForm] = useState(inicial);

  function toggle(campo) {
    setForm(f => ({ ...f, [campo]: !f[campo] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSalvar(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            {inicial.id ? 'Editar Plano' : 'Novo Plano'}
          </h2>
          <button onClick={onFechar} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Título</label>
              <input
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                required
                placeholder="Ex: Plano Pro"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Descrição</label>
              <input
                value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Breve descrição do plano..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.preco}
                onChange={e => setForm(f => ({ ...f, preco: e.target.value }))}
                required
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Nível</label>
              <input
                type="number"
                min="1"
                value={form.nivel}
                onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}
                required
                placeholder="1"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-sm font-bold text-slate-700 mb-3">Permissões de Acesso</p>
            <div className="space-y-2.5">
              {PERMISSOES.map(({ campo, label }) => (
                <label key={campo} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={!!form[campo]}
                      onChange={() => toggle(campo)}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                    />
                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors"
            >
              {inicial.id ? 'Salvar alterações' : 'Criar plano'}
            </button>
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPlanos() {
  const [planos, setPlanos] = useState([]);
  const [modal, setModal] = useState(null);
  const [msg, setMsg] = useState({ texto: '', tipo: '' });

  function recarregar() {
    getAdminPlanos().then(setPlanos).catch(() => {});
  }

  useEffect(() => { recarregar(); }, []);

  function notificar(texto, tipo = 'ok') {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg({ texto: '', tipo: '' }), 3000);
  }

  async function handleSalvar(form) {
    const dados = {
      ...form,
      preco: parseFloat(form.preco),
      nivel: parseInt(form.nivel),
    };
    try {
      if (form.id) {
        await atualizarPlano(form.id, dados);
        notificar('Plano atualizado com sucesso.');
      } else {
        await criarPlano(dados);
        notificar('Plano criado com sucesso.');
      }
      setModal(null);
      recarregar();
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  async function handleDeletar(id, titulo) {
    if (!confirm(`Desativar o plano "${titulo}"? Assinantes existentes não serão afetados.`)) return;
    try {
      await deletarPlano(id);
      notificar('Plano desativado.');
      recarregar();
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  function abrirEdicao(p) {
    setModal({
      id: p.id, titulo: p.titulo, descricao: p.descricao || '',
      preco: String(p.preco), nivel: String(p.nivel),
      acesso_video: !!p.acesso_video, acesso_lab_virt: !!p.acesso_lab_virt,
      acesso_lab_rem: !!p.acesso_lab_rem, acesso_cont_edit: !!p.acesso_cont_edit,
      acesso_cont_download: !!p.acesso_cont_download,
    });
  }

  const ativos = planos.filter(p => p.ativo);
  const inativos = planos.filter(p => !p.ativo);

  return (
    <AdminLayout titulo="Planos de Assinatura">
      <div className="max-w-6xl mx-auto space-y-8">

        {msg.texto && (
          <div className={`p-4 rounded-xl font-medium flex items-center gap-3 shadow-sm ${msg.tipo === 'erro' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {msg.tipo === 'erro'
              ? <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              : <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            }
            {msg.texto}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 pl-2 border-l-4 border-indigo-500">
            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-slate-800">Planos Ativos</h2>
          </div>
          <button
            onClick={() => setModal(formVazio)}
            className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 hover:bg-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Novo Plano
          </button>
        </div>

        {/* Grid de Planos Ativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ativos.map(p => (
            <div
              key={p.id}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-indigo-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-700 font-black text-xs px-4 py-1.5 rounded-bl-xl border-b border-l border-indigo-100">
                NÍVEL {p.nivel}
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-extrabold text-slate-800 mb-1">{p.titulo}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{p.descricao}</p>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {PERMISSOES.map(({ campo, label }) => (
                  <li key={campo} className={`flex items-center gap-2.5 text-sm font-medium ${p[campo] ? 'text-slate-700' : 'text-slate-400 line-through decoration-slate-300/50'}`}>
                    {p[campo]
                      ? <div className="bg-emerald-100 p-1 rounded-full text-emerald-600 shrink-0"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                      : <div className="bg-slate-100 p-1 rounded-full text-slate-400 shrink-0"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></div>
                    }
                    {label}
                  </li>
                ))}
              </ul>

              <div className="pt-5 border-t border-slate-100">
                <div className="flex justify-between items-end mb-4">
                  <strong className="text-2xl font-black text-indigo-600">
                    R$ {Number(p.preco).toFixed(2)}<span className="text-base text-slate-400 font-medium">/mês</span>
                  </strong>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => abrirEdicao(p)}
                    className="flex-1 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletar(p.id, p.titulo)}
                    className="flex-1 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    Desativar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {ativos.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              <p className="font-medium">Nenhum plano ativo. Clique em "Novo Plano" para criar.</p>
            </div>
          )}
        </div>

        {/* Planos Inativos */}
        {inativos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-500 pl-2 border-l-4 border-slate-300">Planos Desativados</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-left font-bold uppercase tracking-wider">Título</th>
                  <th className="p-4 text-left font-bold uppercase tracking-wider">Nível</th>
                  <th className="p-4 text-left font-bold uppercase tracking-wider">Preço</th>
                  <th className="p-4 text-center font-bold uppercase tracking-wider w-24">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inativos.map(p => (
                  <tr key={p.id} className="text-slate-400">
                    <td className="p-4 font-medium line-through">{p.titulo}</td>
                    <td className="p-4">{p.nivel}</td>
                    <td className="p-4">R$ {Number(p.preco).toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => abrirEdicao(p)}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        Reativar / Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <PlanoModal
          inicial={modal}
          onSalvar={handleSalvar}
          onFechar={() => setModal(null)}
        />
      )}
    </AdminLayout>
  );
}
