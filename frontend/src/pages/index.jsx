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
    <div>
      <NavBar />
      <main style={{ padding: '1rem', maxWidth: 800, margin: '0 auto' }}>
        <BuscaBar onBuscar={onBuscar} />
        {!buscando && <AbaAnos anoAtivo={anoAtivo} onMudar={setAnoAtivo} />}
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {temas.map(t => (
            <li key={t.id} style={{ marginBottom: '0.5rem' }}>
              <button
                onClick={() => router.push(`/tema/${t.id}`)}
                style={{ textAlign: 'left', padding: '0.5rem', width: '100%', cursor: 'pointer' }}
              >
                <strong>{t.titulo}</strong> — {t.tema}
              </button>
            </li>
          ))}
          {temas.length === 0 && <p style={{ color: '#666' }}>Nenhum tema encontrado.</p>}
        </ul>
      </main>
    </div>
  );
}
