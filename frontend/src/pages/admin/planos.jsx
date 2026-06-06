import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getPlanos, atualizarPrecoPlano } from '../../lib/api';

const PERMISSOES = [
  { campo: 'acesso_video',          label: 'Videoaulas'          },
  { campo: 'acesso_lab_virt',       label: 'Lab Virtual'         },
  { campo: 'acesso_lab_rem',        label: 'Lab Remoto'          },
  { campo: 'acesso_cont_edit',      label: 'Conteúdo Editável'   },
  { campo: 'acesso_cont_download',  label: 'Download de PDF'     },
];

export default function AdminPlanos() {
  const [planos, setPlanos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [novoPreco, setNovoPreco] = useState('');
  const [msg, setMsg] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    getPlanos().then(setPlanos).catch(() => {});
  }, []);

  function notificar(texto, tipo = 'ok') {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg({ texto: '', tipo: '' }), 3000);
  }

  async function handleSalvar(id) {
    const preco = parseFloat(novoPreco);
    if (isNaN(preco) || preco < 0) { notificar('Preço inválido.', 'erro'); return; }
    try {
      await atualizarPrecoPlano(id, preco);
      notificar('Preço atualizado.');
      setEditando(null);
      getPlanos().then(setPlanos);
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  return (
    <AdminLayout titulo="Planos de Assinatura">
      {msg.texto && (
        <p style={{ color: msg.tipo === 'erro' ? 'red' : 'green', marginBottom: '1rem' }}>{msg.texto}</p>
      )}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {planos.map(p => (
          <div
            key={p.id}
            style={{ border: '1px solid #ddd', borderRadius: 6, padding: '1rem', minWidth: 220, flex: '1 1 220px' }}
          >
            <h3 style={{ margin: '0 0 0.25rem' }}>Plano {p.nivel} — {p.titulo}</h3>
            <p style={{ color: '#555', fontSize: '0.9em', marginBottom: '0.75rem' }}>{p.descricao}</p>

            {/* Permissões */}
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1rem', fontSize: '0.85em' }}>
              {PERMISSOES.map(perm => (
                <li key={perm.campo} style={{ color: p[perm.campo] ? 'green' : '#bbb', marginBottom: '0.2rem' }}>
                  {p[perm.campo] ? '✓' : '✗'} {perm.label}
                </li>
              ))}
            </ul>

            {/* Preço */}
            {editando === p.id ? (
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span>R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={novoPreco}
                  onChange={e => setNovoPreco(e.target.value)}
                  style={{ width: 80 }}
                  autoFocus
                />
                <button onClick={() => handleSalvar(p.id)}>Salvar</button>
                <button onClick={() => setEditando(null)}>✕</button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.1em' }}>R$ {Number(p.preco).toFixed(2)}/mês</strong>
                <button
                  onClick={() => { setEditando(p.id); setNovoPreco(String(p.preco)); }}
                  style={{ fontSize: '0.8em' }}
                >
                  Editar preço
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '0.85em', color: '#888' }}>
        As permissões de cada plano são definidas no banco de dados. Para alterar o que cada plano acessa, edite a tabela <code>planos</code> diretamente ou via seed.
      </p>
    </AdminLayout>
  );
}
