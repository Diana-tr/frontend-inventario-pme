export function renderReportes() {

    return `

    <section class="productos">

        <div class="productos-header">

            <h1>Reportes del Sistema</h1>

        </div>

        <section class="cards">

            <div class="card">

                <h3>Total Productos</h3>

                <span>150</span>

            </div>

            <div class="card">

                <h3>Total Clientes</h3>

                <span>80</span>

            </div>

            <div class="card">

                <h3>Total Proveedores</h3>

                <span>18</span>

            </div>

            <div class="card">

                <h3>Ventas del Mes</h3>

                <span>$12.500.000</span>

            </div>

        </section>

        <table class="tabla-productos">

            <thead>

                <tr>

                    <th>Reporte</th>
                    <th>Descripción</th>
                    <th>Estado</th>

                </tr>

            </thead>

            <tbody>

                <tr>

                    <td>Inventario General</td>
                    <td>Consulta completa del inventario.</td>
                    <td>Disponible</td>
                </tr>

                <tr>

                    <td>Productos con Bajo Stock</td>
                    <td>Productos con existencias mínimas.</td>
                    <td>Disponible</td>
                </tr>

                <tr>

                    <td>Clientes Registrados</td>
                    <td>Listado general de clientes.</td>
                    <td>Disponible</td>
                </tr>

                <tr>

                    <td>Proveedores</td>
                    <td>Listado de proveedores.</td>
                    <td>Disponible</td>
                </tr>

            </tbody>

        </table>

    </section>

    `;

}