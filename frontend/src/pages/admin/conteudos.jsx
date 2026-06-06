import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAdminConteudos, adicionarConteudo, inativarConteudo } from '../../lib/api';

const ANOS = [1, 2, 3];
const formVazio = { titulo: '', anoEscolar: 1, tema: '' };

export default function AdminConteudos() {
  const [conteudos, setConteudos] = useState([]);
  const [anoFiltro, setAnoFiltro] = useState(1);
  const [form, setForm] = useState(formVazio);
  const [msg, setMsg] = useState({ texto: '', tipo: '' });

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const dados = await getAdminConteudos().catch(() => []);
    setConteudos(dados);
  }

  function notificar(texto, tipo = 'ok') {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg({ texto: '', tipo: '' }), 3000);
  }

  async function handleAdicionar(e) {
    e.preventDefault();
    try {
      await adicionarConteudo(form);
      notificar('Conteúdo adicionado com sucesso.');
      setForm(formVazio);
      carregar();
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  async function handleInativar(id, titulo) {
    if (!confirm(`Tem certeza que deseja inativar "${titulo}"?`)) return;
    try {
      await inativarConteudo(id);
      notificar('Conteúdo inativado.');
      carregar();
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  const filtrados = conteudos.filter(c => c.ano_escolar === anoFiltro);

  return (
    <AdminLayout titulo="Gerenciar Conteúdos">
      <div className="max-w-5xl mx-auto space-y-8">
        
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

        {/* Header e Filtro de Anos */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800 pl-2 border-l-4 border-indigo-500">
            Temas Cadastrados
          </h2>
          <div className="bg-slate-200/50 p-1 rounded-full inline-flex shadow-inner w-full sm:w-auto">
            {ANOS.map(a => (
              <button
                key={a}
                onClick={() => setAnoFiltro(a)}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  anoFiltro === a 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
              >
                {a}º Ano
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de Conteúdos */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {filtrados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-bold uppercase tracking-wider">Título da Aula</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Tema / Área</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-center w-28">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtrados.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{c.titulo}</td>
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wide">
                          {c.tema}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleInativar(c.id, c.titulo)}
                          className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Inativar Tema"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Ocultar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-slate-500 font-medium">Nenhum conteúdo cadastrado para o {anoFiltro}º ano.</p>
            </div>
          )}
        </div>

        {/* Formulário de Adição */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Novo Conteúdo
          </h3>
          
          <form onSubmit={handleAdicionar} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Título da Aula</label>
              <input
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                required
                placeholder="Ex: Cinemática Escalar"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Ano Escolar</label>
              <select
                value={form.anoEscolar}
                onChange={e => setForm({ ...form, anoEscolar: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                {ANOS.map(a => <option key={a} value={a}>{a}º Ano do Ensino Médio</option>)}
              </select>
            </div>
            
            <div className="md:col-span-4">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Tema / Área</label>
              <input
                value={form.tema}
                onChange={e => setForm({ ...form, tema: e.target.value })}
                required
                placeholder="Ex: Mecânica Clássica"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            
            <div className="md:col-span-12 mt-2">
              <button 
                type="submit" 
                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 hover:bg-emerald-500 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
              >
                Salvar Conteúdo
              </button>
            </div>
          </form>
        </div>

      </div>
    </AdminLayout>
  );
}