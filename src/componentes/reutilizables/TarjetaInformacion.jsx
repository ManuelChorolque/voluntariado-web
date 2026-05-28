function TarjetaInformacion({ titulo, campos, color = '#3b82f6' }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="px-4 py-3 text-white font-semibold text-base"
        style={{ background: color }}
      >
        {titulo}
      </div>
      <div className="p-4">
        {campos.map((campo, i) => (
          <div
            key={i}
            className={`flex justify-between text-sm py-1.5 ${
              i < campos.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <span className="text-gray-500">{campo.etiqueta}</span>
            <span className="text-gray-900 font-medium">{campo.valor ?? '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TarjetaInformacion;
