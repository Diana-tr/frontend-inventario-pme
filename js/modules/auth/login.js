export function renderLogin() {
    return `
        <section class="login">

            <div class="login-left">

                <h2>Software de Inventarios P.M.E.</h2>

                <p>
                    Plataforma para la gestión y control de inventarios,
                    desarrollada para pequeñas y medianas empresas.
                </p>

            </div>

            <div class="login-right">

                <div class="login-container">

                    <h1>Bienvenido</h1>

                    <span>Inicie sesión para continuar</span>

                    <form id="loginForm">

                        <div class="form-group">

                            <label for="username">Usuario</label>

                            <input
                                type="text"
                                id="username"
                                placeholder="Ingrese su usuario"
                                required>

                        </div>

                        <div class="form-group">

                            <label for="password">Contraseña</label>

                            <input
                                type="password"
                                id="password"
                                placeholder="Ingrese su contraseña"
                                required>

                        </div>

                        <button type="submit">
                            Iniciar sesión
                        </button>

                    </form>

                </div>

            </div>

        </section>
    `;
}
