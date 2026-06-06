import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAdminConteudos, getMateriaisDoTema, adicionarMaterial, inativarMaterial } from '../../lib/api';

const TIPOS = [
  { value: 'arquivo',    label: 'Arquivo (PDF)'   },
  { value: 'videoaula',  label: 'Videoaula'        },
  { value: 'laboratorio',label: 'Laboratório'      },
];

const formVazio = { titulo: '', descricao: '', url: '', tipo: 'arquivo', extras: {} };

export default function AdminMateriais() {
  const [conteudos, setConteudos] = useState([]);
  const [conteudoSel, setConteudoSel] = useState('');
  const [materiais, setMateriais] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [msg, setMsg] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    getAdminConteudos().then(setConteudos).catch(() => {});
  }, []);

  useEffect(() => {
    if (!conteudoSel) { setMateriais([]); return; }
    getMateriaisDoTema(conteudoSel).then(setMateriais).catch(() => {});
  }, [conteudoSel]);

  function notificar(texto, tipo = 'ok') {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg({ texto: '', tipo: '' }), 3000);
  }

  async function handleAdicionar(e) {
    e.preventDefault();
    if (!conteudoSel) { notificar('Selecione um tema primeiro.', 'erro'); return; }
    try {
      await adicionarMaterial({ ...form, conteudoId: parseInt(conteudoSel) });
      notificar('Material adicionado.');
      setForm(formVazio);
      getMateriaisDoTema(conteudoSel).then(setMateriais);
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  async function handleInativar(id, titulo) {
    if (!confirm(`Inativar "${titulo}"?`)) return;
    try {
      await inativarMaterial(id);
      notificar('Material inativado.');
      getMateriaisDoTema(conteudoSel).then(setMateriais);
    } catch (e) {
      notificar(e.message, 'erro');
    }
  }

  function setExtra(campo, valor) {
    setForm(f => ({ ...f, extras: { ...f.extras, [campo]: valor } }));
  }

  const tipoLabel = { arquivo: 'PDF', videoaula: 'Vídeo', laboratorio: 'Lab' };

  return (
    <AdminLayout titulo="Materiais">
      {msg.texto && (
        <p style={{ color: msg.tipo === 'erro' ? 'red' : 'green', marginBottom: '1rem' }}>{msg.texto}</p>
      )}

      {/* Seletor de tema */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label><strong>Tema selecionado:</strong></label>
        <select
          value={conteudoSel}
          onChange={e => setConteudoSel(e.target.value)}
          style={{ marginLeft: '0.5rem', minWidth: 260 }}
        >
          <option value="">— escolha um tema —</option>
          {[1, 2, 3].map(ano => {
            const grupo = conteudos.filter(c => c.ano_escolar === ano);
            if (!grupo.length) return null;
            return (
              <optgroup key={ano} label={`${ano}º Ano`}>
                {grupo.map(c => (
                  <option key={c.id} value={c.id}>{c.titulo} — {c.tema}</option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      {/* Listagem dos materiais do tema */}
      {conteudoSel && (
        <>
          {materiais.length > 0 ? (
            <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '2rem' }}>
              <thead style={{ background: '#f5f5f5' }}>
                <tr><th>Título</th><th>Tipo</th><th>URL</th><th style={{ width: 80 }}>Ação</th></tr>
              </thead>
              <tbody>
                {materiais.map(m => (
                  <tr key={m.id}>
                    <td>{m.titulo}</td>
                    <td><span style={{ fontSize: '0.8em', background: '#eee', padding: '1px 5px', borderRadius: 3 }}>{tipoLabel[m.tipo] || m.tipo}</span></td>
                    <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <a href={m.url} target="_blank" rel="noreferrer" title={m.url}>{m.url}</a>
                    </td>
                    <td>
                      <button onClick={() => handleInativar(m.id, m.titulo)}>Inativar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#888', marginBottom: '2rem' }}>Nenhum material cadastrado neste tema.</p>
          )}
        </>
      )}

      {/* Formulário de adição */}
      <h3>Adicionar material{conteudoSel ? '' : ' (selecione um tema acima)'}</h3>
      <form onSubmit={handleAdicionar} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: 480 }}>
        <div>
          <label>Tipo</label>
          <select
            value={form.tipo}
            onChange={e => setForm({ ...formVazio, tipo: e.target.value })}
            style={{ display: 'block', width: '100%' }}
          >
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label>Título</label>
          <input
            value={form.titulo}
            onChange={e => setForm({ ...form, titulo: e.target.value })}
            required
            style={{ display: 'block', width: '100%' }}
            placeholder={
              form.tipo === 'arquivo' ? 'Ex: Aula Pronta: Movimento Uniforme' :
              form.tipo === 'videoaula' ? 'Ex: Videoaula: Cinemática' :
              'Ex: Lab Virtual: Queda Livre'
            }
          />
        </div>

        <div>
          <label>Descrição (opcional)</label>
          <input
            value={form.descricao}
            onChange={e => setForm({ ...form, descricao: e.target.value })}
            style={{ display: 'block', width: '100%' }}
          />
        </div>

        <div>
          <label>
            {form.tipo === 'arquivo' ? 'URL do PDF' :
             form.tipo === 'videoaula' ? 'URL do YouTube (não listado)' :
             'URL do Laboratório'}
          </label>
          <input
            type="url"
            value={form.url}
            onChange={e => setForm({ ...form, url: e.target.value })}
            required
            style={{ display: 'block', width: '100%' }}
            placeholder="https://..."
          />
        </div>

        {/* Campos específicos por tipo */}
        {form.tipo === 'arquivo' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="checkbox"
              checked={!!form.extras.editavel}
              onChange={e => setExtra('editavel', e.target.checked)}
            />
            Arquivo editável (versão avançada)
          </label>
        )}

        {form.tipo === 'videoaula' && (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input
                type="checkbox"
                checked={!!form.extras.narrado}
                onChange={e => setExtra('narrado', e.target.checked)}
              />
              Narrado (como dar a aula)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input
                type="checkbox"
                checked={!!form.extras.demonstrativo}
                onChange={e => setExtra('demonstrativo', e.target.checked)}
              />
              Demonstrativo (experimento)
            </label>
          </>
        )}

        {form.tipo === 'laboratorio' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="checkbox"
              checked={!!form.extras.remoto}
              onChange={e => setExtra('remoto', e.target.checked)}
            />
            Laboratório Remoto (requer Plano 3)
          </label>
        )}

        <button type="submit" style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}>
          Adicionar material
        </button>
      </form>
    </AdminLayout>
  );
}
