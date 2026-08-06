import { renderLogin } from "./modules/auth/login.js";
import { login } from "./modules/auth/auth.js";

import { renderDashboard } from "./modules/dashboard/dashboard.js";

import {
    renderProductos,
    iniciarModuloProductos
} from "./modules/productos/productos.js";

import { renderCategorias } from "./modules/categorias/categorias.js";
import { renderProveedores } from "./modules/proveedores/proveedores.js";
import { renderClientes } from "./modules/clientes/clientes.js";
import { renderReportes } from "./modules/reportes/reportes.js";
import { renderConfiguracion } from "./modules/configuracion/configuracion.js";

const app = document.getElementById("app");

mostrarLogin();

function mostrarLogin() {

    app.innerHTML = renderLogin();

    const form = document.getElementById("loginForm");

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (login(username, password)) {

            mostrarDashboard();

        }

    });

}

function mostrarDashboard() {

    app.innerHTML = renderDashboard();

    iniciarEventosDashboard();

}

function iniciarEventosDashboard() {

    document.getElementById("menuInicio")
        ?.addEventListener("click", mostrarInicio);

    document.getElementById("menuProductos")
        ?.addEventListener("click", mostrarProductos);

    document.getElementById("menuCategorias")
        ?.addEventListener("click", mostrarCategorias);

    document.getElementById("menuProveedores")
        ?.addEventListener("click", mostrarProveedores);

    document.getElementById("menuClientes")
        ?.addEventListener("click", mostrarClientes);

    document.getElementById("menuReportes")
        ?.addEventListener("click", mostrarReportes);

    document.getElementById("menuConfiguracion")
        ?.addEventListener("click", mostrarConfiguracion);

}

function mostrarInicio() {

    const contenido = document.getElementById("contenidoPrincipal");

    contenido.innerHTML = `

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

    `;

}

function mostrarProductos() {

    const contenido = document.getElementById("contenidoPrincipal");

    contenido.innerHTML = renderProductos();

    iniciarModuloProductos();

}

function mostrarCategorias() {

    const contenido = document.getElementById("contenidoPrincipal");

    contenido.innerHTML = renderCategorias();

}

function mostrarProveedores() {

    const contenido = document.getElementById("contenidoPrincipal");

    contenido.innerHTML = renderProveedores();

}

function mostrarClientes() {

    const contenido = document.getElementById("contenidoPrincipal");

    contenido.innerHTML = renderClientes();

}

function mostrarReportes() {

    const contenido = document.getElementById("contenidoPrincipal");

    contenido.innerHTML = renderReportes();

}

function mostrarConfiguracion() {

    const contenido = document.getElementById("contenidoPrincipal");

    contenido.innerHTML = renderConfiguracion();

}