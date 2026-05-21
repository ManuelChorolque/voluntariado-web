import Boton from './Boton';

function ModalConfirmacion({ abierto, titulo, mensaje, onConfirmar, onCancelar, confirmando }) {
  if (!abierto) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onCancelar}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '10px',
          padding: '24px',
          width: '400px',
          maxWidth: '90%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 8px', color: '#111827' }}>{titulo}</h3>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 20px' }}>{mensaje}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Boton variante="secundario" onClick={onCancelar} deshabilitado={confirmando}>
            Cancelar
          </Boton>
          <Boton variante="peligro" onClick={onConfirmar} deshabilitado={confirmando}>
            {confirmando ? 'Eliminando...' : 'Eliminar'}
          </Boton>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmacion;
