export default function CardMaterial({ material, onAcao, labelAcao }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: '0.75rem', marginBottom: '0.5rem', borderRadius: 4 }}>
      <strong>{material.titulo}</strong>
      {material.descricao && (
        <p style={{ margin: '0.25rem 0', fontSize: '0.9em', color: '#555' }}>{material.descricao}</p>
      )}
      <button onClick={onAcao} style={{ marginTop: '0.25rem' }}>{labelAcao}</button>
    </div>
  );
}
