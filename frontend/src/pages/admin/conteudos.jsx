import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAdminConteudos, adicionarConteudo, alternarStatusConteudo, deletarConteudo } from '../../lib/api';

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

  async function handleToggleVisibilidade(id, titulo, isVisivel) {
    const acao = isVisivel ? 'OCULTAR' : 'TORNAR VISÍVEL';
    const consequencia = isVisivel 
      ? 'Os alunos não poderão mais ver esta aula.' 
      : 'Esta aula voltará a aparecer para os alunos.';
      
    if (!confirm(`Deseja ${acao} o tema "${titulo}"? ${consequencia}`)) return;
    
    try {
      await alternarStatusConteudo(id, !isVisivel);
      notificar(`Conteúdo ${isVisivel ? 'ocultado' : 'visível'} com sucesso.`);
      carregar();
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  async function handleDeletar(id, titulo) {
    if (!confirm(`CUIDADO: Tem certeza que deseja DELETAR PERMANENTEMENTE "${titulo}"? Esta ação apagará a aula do banco de dados e não pode ser desfeita.`)) return;
    try {
      await deletarConteudo(id);
      notificar('Conteúdo excluído permanentemente.');
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
                    <th className="p-4 font-bold uppercase tracking-wider text-center">Status</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-center w-56">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtrados.map(c => {
                    const isVisivel = c.status === 1;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className={`p-4 font-bold ${isVisivel ? 'text-slate-800' : 'text-slate-400'}`}>
                          {c.titulo}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${isVisivel ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                            {c.tema}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-lg text-xs font-bold uppercase tracking-wide ${
                            isVisivel ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isVisivel ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {isVisivel ? 'Visível' : 'Oculto'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isVisivel ? (
                              <button 
                                onClick={() => handleToggleVisibilidade(c.id, c.titulo, isVisivel)}
                                className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors inline-flex items-center gap-1 w-24 justify-center"
                                title="Ocultar Tema"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                                Ocultar
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleToggleVisibilidade(c.id, c.titulo, isVisivel)}
                                className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors inline-flex items-center gap-1 w-24 justify-center"
                                title="Tornar Visível"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Mostrar
                              </button>
                            )}

                            <button 
                              onClick={() => handleDeletar(c.id, c.titulo)}
                              className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors inline-flex items-center gap-1"
                              title="Excluir Permanentemente"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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