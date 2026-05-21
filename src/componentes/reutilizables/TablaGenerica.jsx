function TablaGenerica({ columnas, datos, alHacerClickEnEliminar, acciones, cargando }) {
  if (cargando) {
    return <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Cargando...</p>;
  }

  if (!datos || datos.length === 0) {
    return <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>No se encontraron registros</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            {columnas.map((col, i) => (
              <th
                key={i}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  color: '#374151',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                {col.etiqueta}
              </th>
            ))}
            {alHacerClickEnEliminar && (
              <th style={{ textAlign: 'center', padding: '10px 12px', width: '80px' }}>Acción</th>
            )}
          </tr>
        </thead>
        <tbody>
          {datos.map((fila, i) => (
            <tr
              key={fila.id ?? i}
              style={{ borderBottom: '1px solid #f3f4f6' }}
            >
              {columnas.map((col, j) => (
                <td key={j} style={{ padding: '10px 12px', color: '#111827' }}>
                  {col.renderizar ? col.renderizar(fila[col.clave], fila) : fila[col.clave]}
                </td>
              ))}
              {(alHacerClickEnEliminar || acciones) && (
                <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    {acciones && acciones(fila)}
                    {alHacerClickEnEliminar && (
                      <button
                        onClick={() => alHacerClickEnEliminar(fila.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaGenerica;
