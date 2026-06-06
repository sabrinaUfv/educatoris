import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAdminProfessores, alterarStatusProfessor } from '../../lib/api';

export default function AdminProfessores() {
  const [professores, setProfessores] = useState([]);
  const [busca, setBusca] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const dados = await getAdminProfessores().catch(() => []);
    setProfessores(dados);
  }

  async function toggleStatus(prof) {
    const novoStatus = !prof.status_ativo;
    const acao = novoStatus ? 'desbloquear' : 'bloquear';
    if (!confirm(`Deseja ${acao} ${prof.nome}?`)) return;
    try {
      await alterarStatusProfessor(prof.id, novoStatus);
      setMsg(`${prof.nome} ${novoStatus ? 'desbloqueado' : 'bloqueado'}.`);
      setTimeout(() => setMsg(''), 3000);
      carregar();
    } catch (e) {
      setMsg(e.message);
    }
  }

  const filtrados = professores.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.email.toLowerCase().includes(busca.toLowerCase())
  );

  const ativos = professores.filter(p => p.status_ativo).length;
  const bloqueados = professores.length - ativos;

  return (
    <AdminLayout titulo="Professores">
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', fontSize: '0.9em', color: '#555' }}>
        <span>Total: <strong>{professores.length}</strong></span>
        <span>Ativos: <strong style={{ color: 'green' }}>{ativos}</strong></span>
        <span>Bloqueados: <strong style={{ color: 'red' }}>{bloqueados}</strong></span>
      </div>

      {msg && <p style={{ color: 'green', marginBottom: '0.75rem' }}>{msg}</p>}

      <input
        value={busca}
        onChange={e => setBusca(e.target.value)}
        placeholder="Filtrar por nome ou e-mail..."
        style={{ width: '100%', maxWidth: 360, marginBottom: '1rem', padding: '0.35rem' }}
      />

      {filtrados.length > 0 ? (
        <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead style={{ background: '#f5f5f5' }}>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Cadastro</th>
              <th>Status</th>
              <th style={{ width: 110 }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(p => (
              <tr key={p.id} style={{ background: p.status_ativo ? 'transparent' : '#fff5f5' }}>
                <td>{p.nome}</td>
                <td>{p.email}</td>
                <td style={{ fontSize: '0.85em', color: '#666' }}>
                  {p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td>
                  <span style={{ color: p.status_ativo ? 'green' : 'red', fontWeight: 'bold' }}>
                    {p.status_ativo ? 'Ativo' : 'Bloqueado'}
                  </span>
                </td>
                <td>
                  <button onClick={() => toggleStatus(p)}>
                    {p.status_ativo ? 'Bloquear' : 'Desbloquear'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: '#888' }}>Nenhum professor encontrado.</p>
      )}
    </AdminLayout>
  );
}
