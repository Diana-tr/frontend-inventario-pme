export let productos = [];

export function agregarProducto(producto) {

    productos.push(producto);

}

export function obtenerProductos() {

    return productos;

}

export function eliminarProducto(index) {

    productos.splice(index, 1);

}

export function actualizarProducto(index, producto) {

    productos[index] = producto;

}