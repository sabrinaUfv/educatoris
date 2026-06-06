import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';
import AbaAnos from '../components/AbaAnos';
import BuscaBar from '../components/BuscaBar';
import { getConteudosPorAno, buscarTemas } from '../lib/api';

export default function Home() {
  const router = useRouter();
  const [anoAtivo, setAnoAtivo] = useState(1);
  const [temas, setTemas] = useState([]);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    carregarAno(anoAtivo);
  }, [anoAtivo]);

  async function carregarAno(ano) {
    const dados = await getConteudosPorAno(ano).catch(() => []);
    setTemas(dados);
    setBuscando(false);
  }

  async function onBuscar(termo) {
    if (!termo.trim()) { carregarAno(anoAtivo); return; }
    setBuscando(true);
    const dados = await buscarTemas(termo).catch(() => []);
    setTemas(dados);
  }

  return (
    <div className="min-h-screen pb-12">
      <NavBar />
      
      {/* Área de destaque (Hero) */}
      <div className="bg-indigo-900 w-full pt-12 pb-24 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
          Recursos de Física
        </h1>
        <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
          Encontre laboratórios, listas e videoaulas para suas turmas.
        </p>
      </div>

      {/* Conteúdo principal sobreposto ao Hero */}
      <main className="max-w-4xl mx-auto px-4 -mt-12 relative z-10">
        
        {/* Bloco de Busca */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8">
          <BuscaBar onBuscar={onBuscar} />
        </div>

        {/* Abas de Navegação */}
        {!buscando && (
          <div className="flex justify-center mb-8">
            <div className="bg-slate-200/50 p-1 rounded-full inline-flex shadow-inner">
              <AbaAnos anoAtivo={anoAtivo} onMudar={setAnoAtivo} />
            </div>
          </div>
        )}

        {/* Lista de Conteúdos */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 mb-4 pl-2 border-l-4 border-indigo-500">
            {buscando ? 'Resultados da busca' : `Conteúdos do ${anoAtivo}º Ano`}
          </h2>

          {temas.map(t => (
            <div 
              key={t.id} 
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md hover:border-indigo-200"
            >
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mb-2 uppercase tracking-wider">
                  {t.tema}
                </span>
                <h3 className="text-xl font-bold text-slate-800 leading-tight">
                  {t.titulo}
                </h3>
              </div>
              
              <button
                onClick={() => router.push(`/tema/${t.id}`)}
                className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/30 hover:bg-indigo-500 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                Acessar Material
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}

          {temas.length === 0 && (
            <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-500 font-medium text-lg">Nenhum tema encontrado.</p>
              <p className="text-slate-400 text-sm mt-1">Tente buscar por outras palavras-chave.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}