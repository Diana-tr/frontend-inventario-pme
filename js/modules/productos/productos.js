import { renderTablaProductos } from "../../components/ProductosTable.js";
import { getProductos, createProducto, updateProducto, deleteProducto } from "../../api/productosApi.js";

export async function renderProductos() {
    let productos = [];
    try {
        productos = await getProductos();
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }

    return `
    <section class="productos">
        <div class="productos-header">
            <h1>Gestión de Productos</h1>
        </div>
        <form id="formProducto" class="form-producto">
            <input type="hidden" id="productoId">
            <div>
                <label>Código</label>
                <input type="text" id="codigo" required>
            </div>
            <div>
                <label>Nombre</label>
                <input type="text" id="nombre" required>
            </div>
            <div>
                <label>Categoría</label>
                <input type="text" id="categoria" required>
            </div>
            <div>
                <label>Stock</label>
                <input type="number" id="stock" required>
            </div>
            <div>
                <label>Precio</label>
                <input type="number" id="precio" required>
            </div>
            <button type="submit" id="btnGuardar">Guardar Producto</button>
        </form>

        <table class="tabla-productos">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="tablaProductos">
                ${renderTablaProductos(productos)}
            </tbody>
        </table>
    </section>
    `;
}

export function iniciarModuloProductos() {
    const formulario = document.getElementById("formProducto");
    const cuerpoTabla = document.getElementById("tablaProductos");

    if (formulario) {
        formulario.addEventListener("submit", async function (event) {
            event.preventDefault();

            const id = document.getElementById("productoId").value;
            const producto = {
                codigo: document.getElementById("codigo").value.trim(),
                nombre: document.getElementById("nombre").value.trim(),
                categoria: document.getElementById("categoria").value.trim(),
                stock: parseInt(document.getElementById("stock").value, 10),
                precio: parseFloat(document.getElementById("precio").value)
            };

            try {
                if (id) {
                    await updateProducto(id, producto);
                    alert("Producto actualizado con éxito");
                } else {
                    await createProducto(producto);
                    alert("Producto guardado con éxito");
                }
                formulario.reset();
                document.getElementById("productoId").value = "";
                document.getElementById("btnGuardar").textContent = "Guardar Producto";
                await actualizarTabla();
            } catch (error) {
                console.error("Error al procesar el producto:", error);
                alert("Hubo un error en el servidor.");
            }
        });
    }

    if (cuerpoTabla) {
        cuerpoTabla.addEventListener("click", async function (event) {
            const botonEliminar = event.target.closest(".btn-eliminar");
            const botonEditar = event.target.closest(".btn-editar");

            if (botonEliminar) {
                const id = botonEliminar.dataset.id;
                if (confirm("¿Estás segura de que deseas eliminar este producto?")) {
                    try {
                        await deleteProducto(id);
                        await actualizarTabla();
                    } catch (error) {
                        console.error("Error al eliminar:", error);
                    }
                }
            }

            if (botonEditar) {
                const id = botonEditar.dataset.id;
                try {
                    const productos = await getProductos();
                    const prodToEdit = productos.find(p => p.id == id);
                    if (prodToEdit) {
                        document.getElementById("productoId").value = prodToEdit.id;
                        document.getElementById("codigo").value = prodToEdit.codigo;
                        document.getElementById("nombre").value = prodToEdit.nombre;
                        document.getElementById("categoria").value = prodToEdit.categoria;
                        document.getElementById("stock").value = prodToEdit.stock;
                        document.getElementById("precio").value = prodToEdit.precio;
                        document.getElementById("btnGuardar").textContent = "Actualizar Producto";
                    }
                } catch (error) {
                    console.error("Error al cargar para editar:", error);
                }
            }
        });
    }
}

async function actualizarTabla() {
    const tabla = document.getElementById("tablaProductos");
    if (!tabla) return;
    try {
        const productos = await getProductos();
        tabla.innerHTML = renderTablaProductos(productos);
    } catch (error) {
        console.error("Error al actualizar la tabla:", error);
    }
}