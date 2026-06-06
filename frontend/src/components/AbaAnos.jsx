export default function AbaAnos({ anoAtivo, onMudar }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {[1, 2, 3].map(ano => (
        <button
          key={ano}
          onClick={() => onMudar(ano)}
          style={{
            padding: '0.4rem 0.8rem',
            fontWeight: anoAtivo === ano ? 'bold' : 'normal',
            borderBottom: anoAtivo === ano ? '2px solid black' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          {ano}º Ano
        </button>
      ))}
    </div>
  );
}
