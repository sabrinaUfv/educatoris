import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAdminConteudos, getMateriaisDoTema, adicionarMaterial, editarMaterial, inativarMaterial } from '../../lib/api';

const TIPOS = [
  { value: 'arquivo',    label: 'Arquivo (PDF)'   },
  { value: 'videoaula',  label: 'Videoaula'        },
  { value: 'laboratorio',label: 'Laboratório'      },
];

const formVazio = { titulo: '', descricao: '', url: '', tipo: 'arquivo', extras: {} };

export default function AdminMateriais() {
  const [conteudos, setConteudos] = useState([]);
  const [conteudoSel, setConteudoSel] = useState('');
  const [materiais, setMateriais] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [msg, setMsg] = useState({ texto: '', tipo: '' });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    getAdminConteudos().then(setConteudos).catch(() => {});
  }, []);

  useEffect(() => {
    if (!conteudoSel) { setMateriais([]); return; }
    getMateriaisDoTema(conteudoSel).then(setMateriais).catch(() => {});
  }, [conteudoSel]);

  function notificar(texto, tipo = 'ok') {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg({ texto: '', tipo: '' }), 3000);
  }

  async function handleAdicionar(e) {
    e.preventDefault();
    if (!conteudoSel) { notificar('Selecione um tema primeiro.', 'erro'); return; }
    try {
      await adicionarMaterial({ ...form, conteudoId: parseInt(conteudoSel) });
      notificar('Material adicionado com sucesso.');
      setForm(formVazio);
      getMateriaisDoTema(conteudoSel).then(setMateriais);
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  async function handleEditar(e) {
    e.preventDefault();
    try {
      await editarMaterial(editando.id, {
        titulo: editando.titulo,
        descricao: editando.descricao,
        url: editando.url,
      });
      notificar('Material atualizado com sucesso.');
      setEditando(null);
      getMateriaisDoTema(conteudoSel).then(setMateriais);
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  async function handleInativar(id, titulo) {
    if (!confirm(`Tem certeza que deseja inativar "${titulo}"?`)) return;
    try {
      await inativarMaterial(id);
      notificar('Material inativado.');
      getMateriaisDoTema(conteudoSel).then(setMateriais);
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  function setExtra(campo, valor) {
    setForm(f => ({ ...f, extras: { ...f.extras, [campo]: valor } }));
  }

  const tipoLabel = { arquivo: 'PDF', videoaula: 'Vídeo', laboratorio: 'Lab' };
  const tipoColor = { 
    arquivo: 'bg-blue-50 text-blue-600 border-blue-200', 
    videoaula: 'bg-rose-50 text-rose-600 border-rose-200', 
    laboratorio: 'bg-amber-50 text-amber-600 border-amber-200' 
  };

  return (
    <AdminLayout titulo="Gerenciar Materiais">
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

        {/* Seletor de Tema Principal */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-sm font-bold text-slate-700 mb-2">Tema / Aula de Destino</label>
          <div className="relative">
            <select
              value={conteudoSel}
              onChange={e => setConteudoSel(e.target.value)}
              className="w-full md:w-2/3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">— Escolha um tema para gerenciar os materiais —</option>
              {[1, 2, 3].map(ano => {
                const grupo = conteudos.filter(c => c.ano_escolar === ano);
                if (!grupo.length) return null;
                return (
                  <optgroup key={ano} label={`${ano}º Ano do Ensino Médio`} className="font-bold text-indigo-900">
                    {grupo.map(c => (
                      <option key={c.id} value={c.id} className="font-medium text-slate-700">
                        {c.titulo} — {c.tema}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 md:right-1/3 flex items-center px-4 text-slate-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Listagem dos materiais do tema */}
        {conteudoSel && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 pl-2 border-l-4 border-indigo-500">Materiais Vinculados</h3>
            </div>
            {materiais.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-bold uppercase tracking-wider">Título</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-center">Tipo</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Link / URL</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-center w-44">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {materiais.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{m.titulo}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-3 py-1 border rounded-lg text-xs font-bold uppercase tracking-wide ${tipoColor[m.tipo] || 'bg-slate-100 text-slate-600'}`}>
                            {tipoLabel[m.tipo] || m.tipo}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="max-w-[200px] sm:max-w-xs md:max-w-md truncate">
                            <a href={m.url} target="_blank" rel="noreferrer" title={m.url} className="text-indigo-500 hover:text-indigo-700 hover:underline font-medium">
                              {m.url}
                            </a>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditando({ id: m.id, titulo: m.titulo, descricao: m.descricao || '', url: m.url })}
                              className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              Editar
                            </button>
                            <button
                              onClick={() => handleInativar(m.id, m.titulo)}
                              className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              Ocultar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-slate-500 font-medium">Nenhum material cadastrado neste tema.</p>
              </div>
            )}
          </div>
        )}

        {/* Formulário de Adição */}
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 transition-opacity duration-300 ${!conteudoSel ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Adicionar Novo Material {conteudoSel ? '' : '(selecione um tema acima)'}
          </h3>
          
          <form onSubmit={handleAdicionar} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Tipo de Material</label>
              <div className="relative">
                <select
                  value={form.tipo}
                  onChange={e => setForm({ ...formVazio, tipo: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Título do Arquivo/Vídeo</label>
              <input
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder={
                  form.tipo === 'arquivo' ? 'Ex: Aula Pronta: Movimento Uniforme' :
                  form.tipo === 'videoaula' ? 'Ex: Videoaula: Cinemática' :
                  'Ex: Lab Virtual: Queda Livre'
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Descrição (opcional)</label>
              <input
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder="Breve resumo sobre o conteúdo deste material..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                {form.tipo === 'arquivo' ? 'URL do PDF (Drive, S3, etc)' :
                 form.tipo === 'videoaula' ? 'URL do YouTube (Preferência para Não Listado)' :
                 'URL do Simulador / Laboratório'}
              </label>
              <input
                type="url"
                value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder="https://..."
              />
            </div>

            {/* Configurações Extras (Checkboxes) */}
            <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
              <h4 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">Configurações Específicas</h4>
              <div className="space-y-3">
                
                {form.tipo === 'arquivo' && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={!!form.extras.editavel}
                        onChange={e => setExtra('editavel', e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                      />
                      <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Arquivo editável (Requer plano superior)</span>
                  </label>
                )}

                {form.tipo === 'videoaula' && (
                  <>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={!!form.extras.narrado}
                          onChange={e => setExtra('narrado', e.target.checked)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                        />
                        <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Vídeo Narrado (Focado em como ministrar a aula)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={!!form.extras.demonstrativo}
                          onChange={e => setExtra('demonstrativo', e.target.checked)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                        />
                        <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Demonstrativo Prático (Experimento físico)</span>
                    </label>
                  </>
                )}

                {form.tipo === 'laboratorio' && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={!!form.extras.remoto}
                        onChange={e => setExtra('remoto', e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                      />
                      <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Laboratório Remoto (Exclusivo para Plano 3)</span>
                  </label>
                )}
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
              <button 
                type="submit" 
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 hover:bg-emerald-500 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
              >
                Cadastrar Material
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Modal de Edição */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Editar Material</h2>
              <button onClick={() => setEditando(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEditar} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Título</label>
                <input
                  value={editando.titulo}
                  onChange={e => setEditando(ed => ({ ...ed, titulo: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Descrição (opcional)</label>
                <input
                  value={editando.descricao}
                  onChange={e => setEditando(ed => ({ ...ed, descricao: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">URL</label>
                <input
                  type="url"
                  value={editando.url}
                  onChange={e => setEditando(ed => ({ ...ed, url: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors"
                >
                  Salvar alterações
                </button>
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}