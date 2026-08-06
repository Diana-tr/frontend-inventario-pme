export function renderProveedores() {

    return `

    <section class="productos">

        <div class="productos-header">

            <h1>Gestión de Proveedores</h1>

        </div>

        <form class="form-producto">

            <div>

                <label>NIT</label>

                <input
                    type="text"
                    placeholder="Ingrese el NIT"
                >

            </div>

            <div>

                <label>Empresa</label>

                <input
                    type="text"
                    placeholder="Nombre de la empresa"
                >

            </div>

            <div>

                <label>Contacto</label>

                <input
                    type="text"
                    placeholder="Nombre del contacto"
                >

            </div>

            <div>

                <label>Teléfono</label>

                <input
                    type="text"
                    placeholder="Ingrese el teléfono"
                >

            </div>

            <div>

                <label>Correo</label>

                <input
                    type="email"
                    placeholder="Ingrese el correo"
                >

            </div>

            <button>

                Guardar Proveedor

            </button>

        </form>

        <table class="tabla-productos">

            <thead>

                <tr>

                    <th>NIT</th>
                    <th>Empresa</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody>

                <tr>

                    <td colspan="6">

                        No existen proveedores registrados.

                    </td>

                </tr>

            </tbody>

        </table>

    </section>

    `;

}