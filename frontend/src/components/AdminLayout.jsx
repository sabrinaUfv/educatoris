import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import NavBar from './NavBar';

const links = [
  { href: '/admin',            label: 'Dashboard'    },
  { href: '/admin/conteudos',  label: 'Conteúdos'   },
  { href: '/admin/materiais',  label: 'Materiais'    },
  { href: '/admin/professores',label: 'Professores'  },
  { href: '/admin/planos',     label: 'Planos'       },
];

export default function AdminLayout({ children, titulo }) {
  const router = useRouter();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (u.tipo !== 'administrador') router.push('/');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar />
      
      <div className="flex flex-col md:flex-row flex-1 max-w-7xl mx-auto w-full">
        {/* Barra Lateral (Sidebar) */}
        <aside className="w-full md:w-64 p-4 md:p-6 md:border-r border-slate-200 shrink-0 bg-slate-50 z-10">
          <p className="font-bold text-xs text-slate-400 tracking-widest uppercase mb-4 ml-2">
            Painel Admin
          </p>
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {links.map(l => {
              const ativo = router.pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-4 py-3 md:py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${
                    ativo
                      ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Área de Conteúdo Principal */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {titulo && (
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-8">
              {titulo}
            </h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}