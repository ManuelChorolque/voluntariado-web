function Buscador({ valor, onChange, placeholder = 'Buscar...' }) {
  return (
    <input
      type="text"
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: '8px 14px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        width: '100%',
        maxWidth: '320px',
        outline: 'none'
      }}
    />
  );
}

export default Buscador;
