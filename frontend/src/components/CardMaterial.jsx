export default function CardMaterial({ material, onAcao, labelAcao }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md hover:border-indigo-200">
      <div className="flex-1">
        <h4 className="text-lg font-extrabold text-slate-800 leading-tight">
          {material.titulo}
        </h4>
        {material.descricao && (
          <p className="text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
            {material.descricao}
          </p>
        )}
      </div>
      <button 
        onClick={onAcao} 
        className="w-full sm:w-auto px-6 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 hover:text-indigo-800 transition-colors shrink-0"
      >
        {labelAcao}
      </button>
    </div>
  );
}