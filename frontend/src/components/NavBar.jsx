import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
    <nav style={{ display: 'flex', gap: '1rem', padding: '0.5rem 1rem', borderBottom: '1px solid #ccc', alignItems: 'center' }}>
      <a href="/" style={{ fontWeight: 'bold' }}>E-ducatoris</a>
      <a href="/perfil">Perfil</a>
      {usuario?.tipo === 'administrador' && <a href="/admin">Admin</a>}
      <span style={{ marginLeft: 'auto', fontSize: '0.9em', color: '#555' }}>{usuario?.nome}</span>
      <button onClick={handleLogout}>Sair</button>
    </nav>
  );
}
