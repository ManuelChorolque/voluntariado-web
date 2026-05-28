import Boton from './Boton';

function ModalConfirmacion({ abierto, titulo, mensaje, onConfirmar, onCancelar, confirmando }) {
  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onCancelar}
    >
      <div
        className="bg-white rounded-lg p-6 w-[400px] max-w-[90%]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="m-0 mb-2 text-gray-900 text-lg">{titulo}</h3>
        <p className="text-gray-500 text-sm m-0 mb-5">{mensaje}</p>
        <div className="flex gap-2.5 justify-end">
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
