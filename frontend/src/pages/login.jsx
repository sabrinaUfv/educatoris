import { useState } from 'react';
import { useRouter } from 'next/router';
import { login } from '../lib/api';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const dados = await login(form.email, form.senha);
      localStorage.setItem('token', dados.token);
      localStorage.setItem('usuario', JSON.stringify(dados.usuario));
      router.push('/');
    } catch (e) {
      if (e.message === 'Limite de dispositivos simultâneos atingido.') {
        setErro(e.message + ' Acesse seu perfil para encerrar outras sessões.');
      } else {
        setErro(e.message);
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '1rem' }}>
      <h1>e-ducatoris</h1>
      <form onSubmit={handleSubmit}>
        <label>E-mail</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
          style={{ display: 'block', width: '100%', marginBottom: '0.75rem' }}
        />
        <label>Senha</label>
        <input
          type="password"
          value={form.senha}
          onChange={e => setForm({ ...form, senha: e.target.value })}
          required
          style={{ display: 'block', width: '100%', marginBottom: '0.75rem' }}
        />
        {erro && <p style={{ color: 'red', marginBottom: '0.5rem' }}>{erro}</p>}
        <button type="submit" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <a href="/cadastro">Criar conta</a>
      </p>
    </div>
  );
}
