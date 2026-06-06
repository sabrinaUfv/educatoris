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
      setMsg('Plano atualizado!');
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

  return (
    <div>
      <NavBar />
      <main style={{ padding: '1rem', maxWidth: 600, margin: '0 auto' }}>
        {usuario && <h2>Perfil: {usuario.nome}</h2>}
        {usuario && <p>Email: {usuario.email}</p>}
        {meuPlano
          ? <p>Plano ativo: <strong>{meuPlano.titulo}</strong> — vence em {meuPlano.data_vencimento}</p>
          : <p>Sem assinatura ativa.</p>
        }
        {msg && <p style={{ color: msg.includes('erro') || msg.includes('Você') ? 'red' : 'green' }}>{msg}</p>}

        <h3>Planos disponíveis</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {planos.map(p => (
            <li key={p.id} style={{ border: '1px solid #ddd', padding: '0.75rem', marginBottom: '0.5rem' }}>
              <strong>{p.titulo}</strong> — R$ {Number(p.preco).toFixed(2)}/mês
              <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}>{p.descricao}</p>
              <button onClick={() => handleAssinar(p.id)}>Escolher</button>
            </li>
          ))}
        </ul>

        <hr style={{ margin: '1.5rem 0' }} />
        <button onClick={handleEncerrarSessoes} style={{ marginRight: '0.5rem' }}>
          Encerrar outras sessões
        </button>
        <button onClick={handleLogout}>Sair</button>
      </main>
    </div>
  );
}
