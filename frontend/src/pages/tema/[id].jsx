import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../components/NavBar';
import CardMaterial from '../../components/CardMaterial';
import PlayerVideo from '../../components/PlayerVideo';
import { getMateriaisDoTema, downloadPDF, acessarLaboratorio } from '../../lib/api';

export default function TemaPage() {
  const router = useRouter();
  const { id } = router.query;
  const [materiais, setMateriais] = useState([]);
  const [videoAtivo, setVideoAtivo] = useState(null);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    getMateriaisDoTema(id)
      .then(setMateriais)
      .catch(e => setErro(e.message));
  }, [id]);

  async function handleDownload(material) {
    setErro(''); setMsg('Gerando PDF...');
    try {
      await downloadPDF(material.id, material.titulo);
      setMsg('Download concluído.');
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
    <div>
      <NavBar />
      <main style={{ padding: '1rem', maxWidth: 800, margin: '0 auto' }}>
        <button onClick={() => router.back()} style={{ marginBottom: '1rem' }}>← Voltar</button>

        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        {msg && <p style={{ color: 'green' }}>{msg}</p>}

        {videoAtivo && (
          <div style={{ marginBottom: '1rem' }}>
            <PlayerVideo url={videoAtivo.url} />
            <button onClick={() => setVideoAtivo(null)}>Fechar vídeo</button>
          </div>
        )}

        {videos.length > 0 && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h2>Videoaulas</h2>
            {videos.map(v => (
              <CardMaterial key={v.id} material={v} labelAcao="Assistir" onAcao={() => setVideoAtivo(v)} />
            ))}
          </section>
        )}

        {arquivos.length > 0 && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h2>Materiais para Download</h2>
            {arquivos.map(a => (
              <CardMaterial key={a.id} material={a} labelAcao="Baixar PDF" onAcao={() => handleDownload(a)} />
            ))}
          </section>
        )}

        {labs.length > 0 && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h2>Laboratórios</h2>
            {labs.map(l => (
              <CardMaterial
                key={l.id}
                material={l}
                labelAcao={l.remoto ? 'Acessar Lab Remoto' : 'Acessar Lab Virtual'}
                onAcao={() => handleLab(l)}
              />
            ))}
          </section>
        )}

        {materiais.length === 0 && !erro && <p>Carregando materiais...</p>}
      </main>
    </div>
  );
}
