import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAdminProfessores, alterarStatusProfessor } from '../../lib/api';

export default function AdminProfessores() {
  const [professores, setProfessores] = useState([]);
  const [msg, setMsg] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const dados = await getAdminProfessores().catch(() => []);
    setProfessores(dados);
  }

  function notificar(texto, tipo = 'ok') {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg({ texto: '', tipo: '' }), 3000);
  }

  async function handleToggleStatus(id, nome, isAtivo) {
    const acao = isAtivo ? 'bloquear' : 'liberar';
    if (!confirm(`Deseja realmente ${acao} o acesso de ${nome}?`)) return;

    try {
      // Passamos o status inverso para a API (se está ativo, manda false para bloquear)
      await alterarStatusProfessor(id, !isAtivo);
      notificar(`Acesso de ${nome} foi ${isAtivo ? 'bloqueado' : 'liberado'}.`);
      carregar();
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  return (
    <AdminLayout titulo="Gerenciar Professores">
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

        {/* Header da Tabela */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2 border-l-4 border-indigo-500">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Professores Cadastrados</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Controle quem tem acesso à plataforma.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-sm font-bold text-slate-600">
            Total: <span className="text-indigo-600 text-lg">{professores.length}</span>
          </div>
        </div>

        {/* Tabela de Professores */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {professores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-bold uppercase tracking-wider w-16 text-center">ID</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Identificação</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-center">Status de Acesso</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-center w-36">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {professores.map(p => {
                    // Força a conversão do campo ativo do banco (1 ou 0) para booleano
                    const isAtivo = Boolean(p.ativo); 

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-center text-slate-400 font-medium">#{p.id}</td>
                        <td className="p-4">
                          <strong className="block text-slate-800 font-bold text-base mb-0.5">{p.nome}</strong>
                          <span className="text-slate-500">{p.email}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-lg text-xs font-bold uppercase tracking-wide ${
                            isAtivo 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                              : 'bg-red-50 text-red-600 border-red-200'
                          }`}>
                            {isAtivo ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Ativo
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Bloqueado
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {isAtivo ? (
                            <button 
                              onClick={() => handleToggleStatus(p.id, p.nome, isAtivo)}
                              className="w-full px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
                              title="Bloquear Acesso"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                              Bloquear
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleStatus(p.id, p.nome, isAtivo)}
                              className="w-full px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
                              title="Liberar Acesso"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                              Liberar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-slate-500 font-medium">Nenhum professor encontrado na base de dados.</p>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}