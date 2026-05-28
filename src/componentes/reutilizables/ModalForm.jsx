import Boton from './Boton';

const estiloInput = 'w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm box-border';
const estiloLabel = 'block mb-1 text-gray-700 text-sm font-medium';

function ModalForm({ abierto, titulo, onCerrar, onSubmit, children, enviando }) {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onCerrar}>
      <div
        className="bg-white rounded-lg p-7 w-[480px] max-w-[90%] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="m-0 mb-5 text-gray-900 text-lg">{titulo}</h3>
        <form onSubmit={onSubmit}>
          {children}
          <div className="flex gap-2.5 justify-end mt-5">
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
