function Buscador({ valor, onChange, placeholder = 'Buscar...' }) {
  return (
    <input
      type="text"
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-3.5 py-2 border border-gray-300 rounded-md text-sm w-full max-w-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    />
  );
}

export default Buscador;
