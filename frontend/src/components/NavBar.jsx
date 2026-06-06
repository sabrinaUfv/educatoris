import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { logout } from '../lib/api';

export default function NavBar() {
  const router = useRouter();
  const [usuario, setUsuario] = useState({});

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('usuario') || '{}');
    setUsuario(u);
  }, []);

  async function handleLogout() {
    await logout().catch(() => {});
    localStorage.clear();
    router.push('/login');
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold text-indigo-900 tracking-tighter">
          e-ducatoris
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Início</Link>
          <Link href="/perfil" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Perfil</Link>
          {usuario?.tipo === 'administrador' && (
            <Link href="/admin" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Admin</Link>
          )}
          
          <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
            <span className="text-sm font-bold text-slate-800">{usuario?.nome}</span>
            <button 
              onClick={handleLogout}
              className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors uppercase tracking-wider"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}