export function renderConfiguracion() {

    return `

    <section class="productos">

        <div class="productos-header">

            <h1>Configuración del Sistema</h1>

        </div>

        <form class="form-producto">

            <div>

                <label>Nombre de la Empresa</label>

                <input
                    type="text"
                    value="Inventario P.M.E."
                >

            </div>

            <div>

                <label>Correo Electrónico</label>

                <input
                    type="email"
                    value="contacto@inventariopme.com"
                >

            </div>

            <div>

                <label>Teléfono</label>

                <input
                    type="text"
                    value="3001234567"
                >

            </div>

            <div>

                <label>Dirección</label>

                <input
                    type="text"
                    value="Medellín - Antioquia"
                >

            </div>

            <button>

                Guardar Configuración

            </button>

        </form>

        <table class="tabla-productos">

            <thead>

                <tr>

                    <th>Parámetro</th>
                    <th>Valor</th>

                </tr>

            </thead>

            <tbody>

                <tr>

                    <td>Versión del Sistema</td>
                    <td>1.0</td>

                </tr>

                <tr>

                    <td>Estado</td>
                    <td>Activo</td>

                </tr>

            </tbody>

        </table>

    </section>

    `;

}