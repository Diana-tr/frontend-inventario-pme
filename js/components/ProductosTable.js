export function renderTablaProductos(productos){

    let filas="";

    productos.forEach((producto,index)=>{

        filas+=`

        <tr>

            <td>${producto.codigo}</td>

            <td>${producto.nombre}</td>

            <td>${producto.categoria}</td>

            <td>${producto.stock}</td>

            <td>$${producto.precio}</td>

            <td>

                <button
                    class="btn-editar"
                    data-index="${index}"
                >
                    Editar
                </button>

                <button
                    class="btn-eliminar"
                    data-index="${index}"
                >
                    Eliminar
                </button>

            </td>

        </tr>

        `;

    });

    return filas;

}