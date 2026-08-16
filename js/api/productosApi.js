import { apiRequest } from './httpClient.js';

export async function getProductos() {
    return await apiRequest('/productos/');
}

export async function createProducto(productoData) {
    return await apiRequest('/productos/', {
        method: 'POST',
        body: JSON.stringify(productoData),
    });
}

export async function updateProducto(id, productoData) {
    return await apiRequest(`/productos/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(productoData),
    });
}

export async function deleteProducto(id) {
    return await apiRequest(`/productos/${id}/`, {
        method: 'DELETE',
    });
}