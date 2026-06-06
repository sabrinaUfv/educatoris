export default function AbaAnos({ anoAtivo, onMudar }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map(ano => (
        <button
          key={ano}
          onClick={() => onMudar(ano)}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
            anoAtivo === ano
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
          }`}
        >
          {ano}º Ano
        </button>
      ))}
    </div>
  );
}