export function renderClientes() {

    return `

    <section class="productos">

        <div class="productos-header">

            <h1>Gestión de Clientes</h1>

        </div>

        <form class="form-producto">

            <div>

                <label>Documento</label>

                <input
                    type="text"
                    placeholder="Ingrese el documento"
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

                <label>Apellido</label>

                <input
                    type="text"
                    placeholder="Ingrese el apellido"
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

                Guardar Cliente

            </button>

        </form>

        <table class="tabla-productos">

            <thead>

                <tr>

                    <th>Documento</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody>

                <tr>

                    <td colspan="6">

                        No existen clientes registrados.

                    </td>

                </tr>

            </tbody>

        </table>

    </section>

    `;

}