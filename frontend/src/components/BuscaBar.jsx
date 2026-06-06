import { useState } from 'react';

export default function BuscaBar({ onBuscar }) {
  const [termo, setTermo] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onBuscar(termo);
  }

  function limpar() {
    setTermo('');
    onBuscar('');
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
      <input
        value={termo}
        onChange={e => setTermo(e.target.value)}
        placeholder="Buscar tema..."
        style={{ flex: 1 }}
      />
      <button type="submit">Buscar</button>
      {termo && <button type="button" onClick={limpar}>Limpar</button>}
    </form>
  );
}
