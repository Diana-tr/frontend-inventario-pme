export function renderCategorias() {

    return `

    <section class="productos">

        <div class="productos-header">

            <h1>Gestión de Categorías</h1>

        </div>

        <form class="form-producto">

            <div>

                <label>Código</label>

                <input
                    type="text"
                    placeholder="Ingrese el código"
                >

            </div>

            <div>

                <label>Nombre</label>

                <input
                    type="text"
                    placeholder="Ingrese el nombre"
                >

            </div>

            <div>

                <label>Descripción</label>

                <input
                    type="text"
                    placeholder="Ingrese la descripción"
                >

            </div>

            <button>

                Guardar Categoría

            </button>

        </form>

        <table class="tabla-productos">

            <thead>

                <tr>

                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody>

                <tr>

                    <td colspan="4">

                        No existen categorías registradas.

                    </td>

                </tr>

            </tbody>

        </table>

    </section>

    `;

}