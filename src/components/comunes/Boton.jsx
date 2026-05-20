const VARIANTES = {
  primario: { bg: '#3b82f6', hover: '#2563eb' },
  secundario: { bg: '#6b7280', hover: '#4b5563' },
  peligro: { bg: '#ef4444', hover: '#dc2626' }
};

function Boton({ children, onClick, variante = 'primario', deshabilitado = false, tipo = 'button' }) {
  const estilo = VARIANTES[variante];

  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={deshabilitado}
      style={{
        padding: '8px 20px',
        border: 'none',
        borderRadius: '6px',
        background: deshabilitado ? '#d1d5db' : estilo.bg,
        color: '#fff',
        fontSize: '14px',
        cursor: deshabilitado ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s'
      }}
      onMouseEnter={(e) => !deshabilitado && (e.target.style.background = estilo.hover)}
      onMouseLeave={(e) => !deshabilitado && (e.target.style.background = estilo.bg)}
    >
      {children}
    </button>
  );
}

export default Boton;
