function TarjetaInformacion({ titulo, campos, color = '#3b82f6' }) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          background: color,
          color: '#fff',
          padding: '12px 16px',
          fontSize: '16px',
          fontWeight: 600
        }}
      >
        {titulo}
      </div>
      <div style={{ padding: '16px' }}>
        {campos.map((campo, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: i < campos.length - 1 ? '1px solid #f3f4f6' : 'none',
              fontSize: '14px'
            }}
          >
            <span style={{ color: '#6b7280' }}>{campo.etiqueta}</span>
            <span style={{ color: '#111827', fontWeight: 500 }}>{campo.valor ?? '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TarjetaInformacion;
