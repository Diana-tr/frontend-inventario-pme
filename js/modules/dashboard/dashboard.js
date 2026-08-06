export function renderDashboard() {

    return `

    <section class="dashboard">

        <aside class="sidebar">

            <h2>Inventario P.M.E.</h2>

            <ul>

                <li id="menuInicio">🏠 Inicio</li>

                <li id="menuProductos">📦 Productos</li>

                <li id="menuCategorias">📂 Categorías</li>

                <li id="menuProveedores">🚚 Proveedores</li>

                <li id="menuClientes">👥 Clientes</li>

                <li id="menuReportes">📈 Reportes</li>

                <li id="menuConfiguracion">⚙ Configuración</li>

            </ul>

        </aside>

        <main class="content">

            <header class="topbar">

                <h1>Sistema de Inventario P.M.E.</h1>

                <p>Bienvenido al sistema.</p>

            </header>

            <div id="contenidoPrincipal">

                <section class="cards">

                    <div class="card">

                        <h3>Total Productos</h3>

                        <span>0</span>

                    </div>

                    <div class="card">

                        <h3>Categorías</h3>

                        <span>0</span>

                    </div>

                    <div class="card">

                        <h3>Clientes</h3>

                        <span>0</span>

                    </div>

                    <div class="card">

                        <h3>Proveedores</h3>

                        <span>0</span>

                    </div>

                </section>

            </div>

        </main>

    </section>

    `;

}