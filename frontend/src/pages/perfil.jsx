import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';
import { getPlanos, getMeuPlano, assinarPlano, logout } from '../lib/api';

export default function Perfil() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [planos, setPlanos] = useState([]);
  const [meuPlano, setMeuPlano] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    const u = JSON.parse(localStorage.getItem('usuario') || '{}');
    setUsuario(u);
    Promise.all([getPlanos(), getMeuPlano()]).then(([p, mp]) => {
      setPlanos(p);
      setMeuPlano(mp?.titulo ? mp : null);
    });
  }, []);

  async function handleAssinar(idPlano) {
    setMsg('');
    try {
      await assinarPlano(idPlano);
      const mp = await getMeuPlano();
      setMeuPlano(mp);
      setMsg('Plano atualizado com sucesso!');
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function handleLogout() {
    await logout().catch(() => {});
    localStorage.clear();
    router.push('/login');
  }

  async function handleEncerrarSessoes() {
    const t = localStorage.getItem('token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/encerrar-sessoes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
    });
    setMsg('Todas as outras sessões foram encerradas.');
  }

  const isError = msg.toLowerCase().includes('erro') || msg.toLowerCase().includes('você');

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Header / Info do Usuário */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {usuario ? usuario.nome : 'Carregando...'}
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              {usuario?.email}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center md:text-right min-w-[200px]">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Status da Assinatura</p>
            {meuPlano ? (
              <>
                <p className="text-xl font-bold text-indigo-600">{meuPlano.titulo}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Vence em: {meuPlano.data_vencimento}</p>
              </>
            ) : (
              <p className="text-slate-600 font-bold">Nenhum plano ativo</p>
            )}
          </div>
        </div>

        {/* Mensagem de Feedback da API */}
        {msg && (
          <div className={`p-4 rounded-xl font-medium text-center mb-8 border shadow-sm ${isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            {msg}
          </div>
        )}

        {/* Planos Disponíveis */}
        <h3 className="text-xl font-bold text-slate-800 mb-4 pl-2 border-l-4 border-indigo-500">
          Faça um Upgrade
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {planos.map(p => {
            const isAtivo = meuPlano?.titulo === p.titulo;
            return (
              <div key={p.id} className={`bg-white p-6 rounded-2xl border transition-all duration-300 flex flex-col ${isAtivo ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' : 'border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md'}`}>
                <div className="flex-1">
                  <h4 className="text-xl font-extrabold text-slate-800 mb-2">{p.titulo}</h4>
                  <p className="text-3xl font-black text-indigo-600 mb-4">
                    R$ {Number(p.preco).toFixed(2)}<span className="text-sm text-slate-400 font-medium">/mês</span>
                  </p>
                  <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">
                    {p.descricao}
                  </p>
                </div>
                <button 
                  onClick={() => handleAssinar(p.id)}
                  disabled={isAtivo}
                  className={`w-full py-3 rounded-xl font-bold transition-all duration-200 ${isAtivo ? 'bg-indigo-50 text-indigo-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 hover:-translate-y-0.5 active:scale-95'}`}
                >
                  {isAtivo ? 'Plano Atual' : 'Assinar'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Ações da Conta / Segurança */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-slate-800">Segurança da Conta</h4>
            <p className="text-sm text-slate-500 font-medium">Gerencie suas sessões e o acesso ao sistema.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button 
              onClick={handleEncerrarSessoes} 
              className="px-5 py-2.5 bg-amber-50 text-amber-700 font-bold border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
            >
              Encerrar outras sessões
            </button>
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-50 text-red-700 font-bold border border-red-200 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Sair
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}