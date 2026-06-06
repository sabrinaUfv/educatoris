import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';

// Adicionei ícones SVG para deixar o painel muito mais intuitivo e visual
const secoes = [
  { 
    href: '/admin/conteudos',   
    titulo: 'Conteúdos',    
    desc: 'Adicionar e inativar temas por ano escolar.',
    icone: (
      <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  { 
    href: '/admin/materiais',   
    titulo: 'Materiais',    
    desc: 'Adicionar PDFs, videoaulas e laboratórios aos temas.',
    icone: (
      <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    href: '/admin/professores', 
    titulo: 'Professores',  
    desc: 'Bloquear ou desbloquear acesso de professores.',
    icone: (
      <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  { 
    href: '/admin/planos',      
    titulo: 'Planos',       
    desc: 'Atualizar os preços mensais dos planos de assinatura.',
    icone: (
      <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
];

export default function AdminDashboard() {
  return (
    <AdminLayout titulo="Painel Administrativo">
      <div className="max-w-5xl mx-auto">
        
        {/* Texto Introdutório */}
        <div className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-full text-indigo-600 hidden sm:block">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Visão Geral do Sistema</h2>
            <p className="text-slate-500 font-medium">
              Gerencie todo o conteúdo, arquivos, usuários e assinaturas da plataforma e-ducatoris.
            </p>
          </div>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {secoes.map(s => (
            <Link 
              key={s.href} 
              href={s.href}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all duration-300 hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
                  {s.icone}
                </div>
                <strong className="block text-2xl font-extrabold text-slate-800 mb-2">
                  {s.titulo}
                </strong>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {s.desc}
                </p>
              </div>
              
              <div className="mt-6 flex items-center text-indigo-600 font-bold text-sm">
                Acessar painel
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
}