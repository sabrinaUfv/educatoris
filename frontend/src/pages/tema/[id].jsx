import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../components/NavBar';
import CardMaterial from '../../components/CardMaterial';
import PlayerVideo from '../../components/PlayerVideo';
import { getMateriaisDoTema, downloadPDF, acessarLaboratorio } from '../../lib/api';

export default function TemaPage() {
  const router = useRouter();
  const { id } = router.query;
  
  // O estado 'carregando' deve ficar AQUI DENTRO, junto com os outros
  const [materiais, setMateriais] = useState([]);
  const [videoAtivo, setVideoAtivo] = useState(null);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!id) return;
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    
    setCarregando(true);
    getMateriaisDoTema(id)
      .then(setMateriais)
      .catch(e => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [id]);

  async function handleDownload(material) {
    setErro(''); setMsg('Gerando PDF...');
    try {
      await downloadPDF(material.id, material.titulo);
      setMsg('Download concluído.');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setErro(e.message); setMsg('');
    }
  }

  async function handleLab(material) {
    setErro('');
    try {
      const dados = await acessarLaboratorio(material.id);
      window.open(dados.url, '_blank', 'noopener');
    } catch (e) {
      setErro(e.message);
    }
  }

  const videos = materiais.filter(m => m.tipo === 'videoaula');
  const arquivos = materiais.filter(m => m.tipo === 'arquivo');
  const labs = materiais.filter(m => m.tipo === 'laboratorio');

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Botão Voltar */}
        <button 
          onClick={() => router.back()} 
          className="mb-6 flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para os temas
        </button>

        {/* Feedbacks de Erro e Mensagem */}
        {erro && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium flex items-center gap-3 shadow-sm">
            <svg className="w-6 h-6 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {erro}
          </div>
        )}
        
        {msg && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700 font-medium flex items-center gap-3 shadow-sm">
            {msg.includes('Gerando') ? (
              <svg className="animate-spin h-5 w-5 text-indigo-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {msg}
          </div>
        )}

        {/* Player de Vídeo em Destaque */}
        {videoAtivo && (
          <div className="mb-10 bg-slate-900 p-2 md:p-4 rounded-3xl shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-3 px-2">
              <h3 className="text-white font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Reproduzindo Vídeo
              </h3>
              <button 
                onClick={() => setVideoAtivo(null)} 
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full px-4 py-1.5 text-sm font-bold transition-colors"
              >
                Fechar
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <PlayerVideo url={videoAtivo.url} />
            </div>
          </div>
        )}

        {/* Listagem de Materiais */}
        <div className="space-y-10">
          
          {videos.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 pl-2 border-l-4 border-indigo-500 flex items-center gap-2">
                Videoaulas
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {videos.map(v => (
                  <CardMaterial key={v.id} material={v} labelAcao="Assistir" onAcao={() => setVideoAtivo(v)} />
                ))}
              </div>
            </section>
          )}

          {arquivos.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 pl-2 border-l-4 border-emerald-500 flex items-center gap-2">
                Materiais para Download
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {arquivos.map(a => (
                  <CardMaterial key={a.id} material={a} labelAcao="Baixar PDF" onAcao={() => handleDownload(a)} />
                ))}
              </div>
            </section>
          )}

          {labs.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 pl-2 border-l-4 border-amber-500 flex items-center gap-2">
                Laboratórios
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {labs.map(l => (
                  <CardMaterial
                    key={l.id}
                    material={l}
                    labelAcao={l.remoto ? 'Acessar Lab Remoto' : 'Acessar Lab Virtual'}
                    onAcao={() => handleLab(l)}
                  />
                ))}
              </div>
            </section>
          )}

          {carregando && !erro && (
            <div className="text-center py-16">
              <p className="text-slate-500 font-medium">Carregando materiais...</p>
            </div>
          )}

          {!carregando && materiais.length === 0 && !erro && (
            <div className="text-center py-16">
              <p className="text-slate-500 font-medium">Nenhum material disponível neste tema.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}