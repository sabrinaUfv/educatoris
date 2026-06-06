import { useEffect } from 'react';
import { useRouter } from 'next/router';
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
    <div>
      <NavBar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 41px)' }}>
        <aside style={{
          width: 180,
          borderRight: '1px solid #ddd',
          padding: '1rem 0.75rem',
          flexShrink: 0,
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '0.85em', color: '#555' }}>
            ADMIN
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {links.map(l => (
              <a
                key={l.href}
                href={l.href}
                style={{
                  padding: '0.4rem 0.5rem',
                  fontWeight: router.pathname === l.href ? 'bold' : 'normal',
                  background: router.pathname === l.href ? '#f0f0f0' : 'transparent',
                  borderRadius: 3,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>
        </aside>
        <main style={{ flex: 1, padding: '1.5rem', maxWidth: 900 }}>
          {titulo && <h2 style={{ marginTop: 0 }}>{titulo}</h2>}
          {children}
        </main>
      </div>
    </div>
  );
}
