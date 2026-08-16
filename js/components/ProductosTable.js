export function renderTablaProductos(productos) {
    let filas = "";
    
    if (!productos || productos.length === 0) {
        return `<tr><td colspan="6" style="text-align: center;">No hay productos registrados</td></tr>`;
    }

    productos.forEach((producto) => {
        filas += `
        <tr>
            <td>${producto.codigo}</td>
            <td>${producto.nombre}</td>
            <td>${producto.categoria}</td>
            <td>${producto.stock}</td>
            <td>$${producto.precio}</td>
            <td>
                <button
                    class="btn-editar"
                    data-id="${producto.id}"
                >
                    Editar
                </button>

                <button
                    class="btn-eliminar"
                    data-id="${producto.id}"
                >
                    Eliminar
                </button>
            </td>
        </tr>
        `;
    });

    return filas;
}