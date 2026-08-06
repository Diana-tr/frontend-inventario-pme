import { renderTablaProductos } from "../../components/ProductosTable.js";
import {
    agregarProducto,
    obtenerProductos
} from "../../utils/productosData.js";

export function renderProductos() {

    return `

    <section class="productos">

        <div class="productos-header">

            <h1>Gestión de Productos</h1>

        </div>

        <form id="formProducto" class="form-producto">

            <div>

                <label>Código</label>

                <input
                    type="text"
                    id="codigo"
                    required
                >

            </div>

            <div>

                <label>Nombre</label>

                <input
                    type="text"
                    id="nombre"
                    required
                >

            </div>

            <div>

                <label>Categoría</label>

                <input
                    type="text"
                    id="categoria"
                    required
                >

            </div>

            <div>

                <label>Stock</label>

                <input
                    type="number"
                    id="stock"
                    required
                >

            </div>

            <div>

                <label>Precio</label>

                <input
                    type="number"
                    id="precio"
                    required
                >

            </div>

            <button type="submit">

                Guardar Producto

            </button>

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

                ${renderTablaProductos(obtenerProductos())}

            </tbody>

        </table>

    </section>

    `;

}

export function iniciarModuloProductos() {

    const formulario = document.getElementById("formProducto");

    if (!formulario) return;

    formulario.addEventListener("submit", function (event) {

        event.preventDefault();

        const producto = {

            codigo: document.getElementById("codigo").value.trim(),

            nombre: document.getElementById("nombre").value.trim(),

            categoria: document.getElementById("categoria").value.trim(),

            stock: document.getElementById("stock").value,

            precio: document.getElementById("precio").value

        };

        agregarProducto(producto);

        actualizarTabla();

        formulario.reset();

    });

}

function actualizarTabla() {

    const tabla = document.getElementById("tablaProductos");

    tabla.innerHTML = renderTablaProductos(obtenerProductos());

}