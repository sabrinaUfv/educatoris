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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          value={termo}
          onChange={e => setTermo(e.target.value)}
          placeholder="Buscar tema ou assunto..."
          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
        />
      </div>
      
      <div className="flex gap-2 sm:shrink-0">
        <button 
          type="submit"
          className="flex-1 sm:flex-none px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 hover:bg-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
        >
          Buscar
        </button>
        {termo && (
          <button 
            type="button" 
            onClick={limpar}
            className="px-5 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center"
            title="Limpar busca"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}