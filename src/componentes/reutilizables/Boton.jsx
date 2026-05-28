const VARIANTES = {
  primario: 'bg-blue-500 hover:bg-blue-600',
  secundario: 'bg-gray-500 hover:bg-gray-600',
  peligro: 'bg-red-500 hover:bg-red-600'
};

function Boton({ children, onClick, variante = 'primario', deshabilitado = false, tipo = 'button', className = '' }) {
  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={deshabilitado}
      className={`px-5 py-2 border-none rounded-md text-white text-sm cursor-pointer transition-colors duration-200 ${
        deshabilitado ? 'bg-gray-300 cursor-not-allowed' : VARIANTES[variante]
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default Boton;
