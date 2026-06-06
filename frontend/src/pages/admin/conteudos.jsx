import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAdminConteudos, adicionarConteudo, inativarConteudo } from '../../lib/api';

const ANOS = [1, 2, 3];

const formVazio = { titulo: '', anoEscolar: 1, tema: '' };

export default function AdminConteudos() {
  const [conteudos, setConteudos] = useState([]);
  const [anoFiltro, setAnoFiltro] = useState(1);
  const [form, setForm] = useState(formVazio);
  const [msg, setMsg] = useState({ texto: '', tipo: '' });

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const dados = await getAdminConteudos().catch(() => []);
    setConteudos(dados);
  }

  function notificar(texto, tipo = 'ok') {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg({ texto: '', tipo: '' }), 3000);
  }

  async function handleAdicionar(e) {
    e.preventDefault();
    try {
      await adicionarConteudo(form);
      notificar('Conteúdo adicionado com sucesso.');
      setForm(formVazio);
      carregar();
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  async function handleInativar(id, titulo) {
    if (!confirm(`Inativar "${titulo}"?`)) return;
    try {
      await inativarConteudo(id);
      notificar('Conteúdo inativado.');
      carregar();
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  const filtrados = conteudos.filter(c => c.ano_escolar === anoFiltro);

  return (
    <AdminLayout titulo="Conteúdos (Temas)">
      {msg.texto && (
        <p style={{ color: msg.tipo === 'erro' ? 'red' : 'green', marginBottom: '1rem' }}>{msg.texto}</p>
      )}

      {/* Abas de ano */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {ANOS.map(a => (
          <button
            key={a}
            onClick={() => setAnoFiltro(a)}
            style={{ fontWeight: anoFiltro === a ? 'bold' : 'normal', padding: '0.3rem 0.8rem' }}
          >
            {a}º Ano
          </button>
        ))}
      </div>

      {/* Tabela de conteúdos */}
      {filtrados.length > 0 ? (
        <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '2rem' }}>
          <thead style={{ background: '#f5f5f5' }}>
            <tr><th>Título</th><th>Tema</th><th style={{ width: 80 }}>Ação</th></tr>
          </thead>
          <tbody>
            {filtrados.map(c => (
              <tr key={c.id}>
                <td>{c.titulo}</td>
                <td>{c.tema}</td>
                <td>
                  <button onClick={() => handleInativar(c.id, c.titulo)}>Inativar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: '#888', marginBottom: '2rem' }}>Nenhum conteúdo cadastrado para {anoFiltro}º ano.</p>
      )}

      {/* Formulário de adição */}
      <h3>Adicionar conteúdo</h3>
      <form onSubmit={handleAdicionar} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: 420 }}>
        <div>
          <label>Título</label>
          <input
            value={form.titulo}
            onChange={e => setForm({ ...form, titulo: e.target.value })}
            required
            style={{ display: 'block', width: '100%' }}
            placeholder="Ex: Cinemática Escalar"
          />
        </div>
        <div>
          <label>Ano Escolar</label>
          <select
            value={form.anoEscolar}
            onChange={e => setForm({ ...form, anoEscolar: parseInt(e.target.value) })}
            style={{ display: 'block', width: '100%' }}
          >
            {ANOS.map(a => <option key={a} value={a}>{a}º Ano</option>)}
          </select>
        </div>
        <div>
          <label>Tema / Área</label>
          <input
            value={form.tema}
            onChange={e => setForm({ ...form, tema: e.target.value })}
            required
            style={{ display: 'block', width: '100%' }}
            placeholder="Ex: Mecânica"
          />
        </div>
        <button type="submit" style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}>
          Adicionar
        </button>
      </form>
    </AdminLayout>
  );
}
