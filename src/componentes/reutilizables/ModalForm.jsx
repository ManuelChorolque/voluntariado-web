import Boton from './Boton';

const estiloOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const estiloModal = { background: '#fff', borderRadius: '10px', padding: '28px', width: '480px', maxWidth: '90%', maxHeight: '85vh', overflowY: 'auto' };

const estiloInput = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' };
const estiloLabel = { display: 'block', marginBottom: '4px', color: '#374151', fontSize: '13px', fontWeight: 500 };
function ModalForm({ abierto, titulo, onCerrar, onSubmit, children, enviando }) {
  if (!abierto) return null;
  return (
    <div style={estiloOverlay} onClick={onCerrar}>
      <div style={estiloModal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 20px', color: '#111827' }}>{titulo}</h3>
        <form onSubmit={onSubmit}>
          {children}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Boton variante="secundario" onClick={onCerrar} deshabilitado={enviando}>Cancelar</Boton>
            <Boton tipo="submit" deshabilitado={enviando}>{enviando ? 'Guardando...' : 'Guardar'}</Boton>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalForm;
export { estiloInput, estiloLabel };
