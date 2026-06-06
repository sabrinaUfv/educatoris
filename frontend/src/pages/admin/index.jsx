import AdminLayout from '../../components/AdminLayout';

const secoes = [
  { href: '/admin/conteudos',   titulo: 'Conteúdos',    desc: 'Adicionar e inativar temas por ano escolar.'         },
  { href: '/admin/materiais',   titulo: 'Materiais',    desc: 'Adicionar PDFs, videoaulas e laboratórios aos temas.' },
  { href: '/admin/professores', titulo: 'Professores',  desc: 'Bloquear ou desbloquear acesso de professores.'       },
  { href: '/admin/planos',      titulo: 'Planos',       desc: 'Atualizar preços dos planos de assinatura.'           },
];

export default function AdminDashboard() {
  return (
    <AdminLayout titulo="Painel Administrativo">
      <p style={{ color: '#555', marginBottom: '1.5rem' }}>
        Gerencie o conteúdo e os usuários da plataforma e-ducatoris.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {secoes.map(s => (
          <a
            key={s.href}
            href={s.href}
            style={{
              display: 'block',
              border: '1px solid #ddd',
              borderRadius: 6,
              padding: '1rem',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <strong>{s.titulo}</strong>
            <p style={{ fontSize: '0.85em', color: '#666', marginTop: '0.4rem' }}>{s.desc}</p>
          </a>
        ))}
      </div>
    </AdminLayout>
  );
}
