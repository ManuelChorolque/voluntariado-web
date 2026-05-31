function TablaGenerica({ columnas, datos, alHacerClickEnEliminar, acciones, cargando, textoBotonEliminar = 'Eliminar' }) {
  if (cargando) {
    return <p className="text-gray-500 text-center py-10">Cargando...</p>;
  }

  if (!datos || datos.length === 0) {
    return <p className="text-gray-400 text-center py-10">No se encontraron registros</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 border-b-2 border-gray-200">
            {columnas.map((col, i) => (
              <th
                key={i}
                className="text-left px-3 py-2.5 text-gray-700 font-semibold whitespace-nowrap"
              >
                {col.etiqueta}
              </th>
            ))}
            {(alHacerClickEnEliminar || acciones) && (
              <th className="text-center px-3 py-2.5 w-20">Acción</th>
            )}
          </tr>
        </thead>
        <tbody>
          {datos.map((fila, i) => (
            <tr key={fila.id ?? i} className="border-b border-gray-100">
              {columnas.map((col, j) => (
                <td key={j} className="px-3 py-2.5 text-gray-900">
                  {col.renderizar ? col.renderizar(fila[col.clave], fila) : fila[col.clave]}
                </td>
              ))}
              {(alHacerClickEnEliminar || acciones) && (
                <td className="text-center px-3 py-2.5">
                  <div className="flex gap-1.5 justify-center">
                    {acciones && acciones(fila)}
                    {alHacerClickEnEliminar && (
                      <button
                        onClick={() => alHacerClickEnEliminar(fila.id)}
                        className="bg-none border-none text-red-500 cursor-pointer text-sm hover:text-red-600"
                      >
                        {textoBotonEliminar}
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
