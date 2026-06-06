import { useState } from 'react';
import { useRouter } from 'next/router';
import { cadastrar } from '../lib/api';

export default function Cadastro() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    try {
      await cadastrar(form);
      setSucesso(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (e) {
      setErro(e.message);
    }
  }

  if (sucesso) return <p style={{ margin: '4rem auto', maxWidth: 400 }}>Cadastro realizado! Redirecionando...</p>;

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '1rem' }}>
      <h1>Criar conta</h1>
      <form onSubmit={handleSubmit}>
        {[
          { campo: 'nome', tipo: 'text', label: 'Nome' },
          { campo: 'email', tipo: 'email', label: 'E-mail' },
          { campo: 'senha', tipo: 'password', label: 'Senha' },
        ].map(({ campo, tipo, label }) => (
          <div key={campo}>
            <label>{label}</label>
            <input
              type={tipo}
              value={form[campo]}
              onChange={e => setForm({ ...form, [campo]: e.target.value })}
              required
              style={{ display: 'block', width: '100%', marginBottom: '0.75rem' }}
            />
          </div>
        ))}
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        <button type="submit">Cadastrar</button>
      </form>
      <p><a href="/login">Já tenho conta</a></p>
    </div>
  );
}
