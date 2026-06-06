import { useState } from 'react';
import { useRouter } from 'next/router';
import { cadastrar } from '../lib/api';

export default function Cadastro() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    try {
      await cadastrar(form);
      setSucesso(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (e) {
      setErro(e.message);
    }
  }

  // Tela de Sucesso
  if (sucesso) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center max-w-sm w-full animate-pulse">
          <svg className="w-16 h-16 text-emerald-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Cadastro realizado!</h2>
          <p className="text-slate-500 font-medium">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  // Tela de Formulário
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        
        {/* Cabeçalho do Card */}
        <div className="bg-indigo-900 p-8 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Criar Conta</h1>
          <p className="text-indigo-200 mt-2 font-medium">Junte-se ao e-ducatoris</p>
        </div>
        
        {/* Corpo do Formulário */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { campo: 'nome', tipo: 'text', label: 'Nome Completo', placeholder: 'Ex: Isaac Newton' },
              { campo: 'email', tipo: 'email', label: 'E-mail Institucional', placeholder: 'seu@email.com' },
              { campo: 'senha', tipo: 'password', label: 'Senha', placeholder: '••••••••' },
            ].map(({ campo, tipo, label, placeholder }) => (
              <div key={campo}>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
                <input
                  type={tipo}
                  placeholder={placeholder}
                  value={form[campo]}
                  onChange={e => setForm({ ...form, [campo]: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            ))}
            
            {/* Mensagem de Erro */}
            {erro && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium text-center">
                {erro}
              </div>
            )}
            
            {/* Botão Principal */}
            <button 
              type="submit"
              className="w-full mt-2 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
            >
              Cadastrar
            </button>
          </form>
          
          {/* Rodapé / Link de retorno */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Já possui uma conta?{' '}
              <button 
                onClick={() => router.push('/login')} 
                className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors cursor-pointer ml-1"
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}