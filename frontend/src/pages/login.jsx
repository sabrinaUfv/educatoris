import { useState } from 'react';
import { useRouter } from 'next/router';
import { login } from '../lib/api';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const dados = await login(form.email, form.senha);
      localStorage.setItem('token', dados.token);
      localStorage.setItem('usuario', JSON.stringify(dados.usuario));
      router.push('/');
    } catch (e) {
      if (e.message === 'Limite de dispositivos simultâneos atingido.') {
        setErro(e.message + ' Acesse seu perfil para encerrar outras sessões.');
      } else {
        setErro(e.message);
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        
        {/* Cabeçalho do Card */}
        <div className="bg-indigo-900 p-8 text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">e-ducatoris</h1>
          <p className="text-indigo-200 mt-2 font-medium">Acesso do Professor</p>
        </div>
        
        {/* Corpo do Formulário */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">E-mail Institucional</label>
              <input
                type="email"
                placeholder="prof@educatoris.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.senha}
                onChange={e => setForm({ ...form, senha: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Mensagem de Erro */}
            {erro && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium text-center shadow-sm">
                <svg className="w-6 h-6 mx-auto mb-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {erro}
              </div>
            )}
            
            {/* Botão Principal com estado de Loading */}
            <button 
              type="submit" 
              disabled={carregando}
              className={`w-full mt-2 py-3.5 font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2
                ${carregando 
                  ? 'bg-indigo-400 text-white cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-500 hover:-translate-y-0.5 active:scale-95'
                }`}
            >
              {carregando ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : 'Entrar'}
            </button>
          </form>
          
          {/* Rodapé / Link de criação de conta */}
          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-slate-500 text-sm font-medium">
              Primeiro acesso?{' '}
              <button 
                onClick={() => router.push('/cadastro')} 
                className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors cursor-pointer ml-1"
              >
                Crie sua conta
              </button>
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}