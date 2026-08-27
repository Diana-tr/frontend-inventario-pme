import Config from "../config/config.js";
import LoginController from "../controllers/auth/login_controller.js";
import LogoutController from "../controllers/auth/logout_controller.js";
import { usuarioService } from "../services/usuario_service.js"; // Importamos el servicio que ya funciona

const App = (() => {
  async function bootstrap() {
    try {
      console.log("[APP] Aplicación iniciada.");

      const currentPath = window.location.pathname;
      console.log("[APP] Página:", currentPath);

      const basePath = Config.BASE_PATH;
      const loginPath = `${basePath}${Config.LOGIN_PATH}`;

      if (currentPath === `${basePath}/`) {
        window.location.replace(loginPath);
        return;
      }

      if (currentPath === loginPath) {
        LoginController.init();
        return;
      }

      // Inicializamos siempre el controlador de sesión (logout) para la barra de navegación
      LogoutController.init();

      // DETECCIÓN ESPECÍFICA PARA LA VISTA DE LISTAR USUARIOS
      if (currentPath.includes("/usuarios/listar.php")) {
        console.log("[APP] Detectada vista de listado de usuarios. Inicializando...");
        await inicializarListadoUsuarios();
      }

      console.log("[APP] Controladores inicializados.");
    } catch (error) {
      console.error("[APP] Error durante la inicialización:", error);
    }
  }

  // Función interna para poblar la tabla de usuarios de forma segura
  async function inicializarListadoUsuarios() {
    const tbody = document.getElementById("tablaUsuariosBody");
    if (!tbody) {
      console.error("[USUARIOS] No se encontró el elemento con ID 'tablaUsuariosBody' en el DOM.");
      return;
    }

    try {
      const response = await usuarioService.listarUsuarios();
      console.log("[USUARIOS] Respuesta de la API:", response);

      tbody.innerHTML = "";
      let usuarios = [];

      if (Array.isArray(response)) {
        usuarios = response;
      } else if (response) {
        if (Array.isArray(response.data)) {
          usuarios = response.data;
        } else if (Array.isArray(response.results)) {
          usuarios = response.results;
        }
      }

      if (usuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay usuarios registrados.</td></tr>`;
        return;
      }

      usuarios.forEach((user, index) => {
        tbody.innerHTML += `
          <tr>
              <td>${user.id || index + 1}</td>
              <td>${user.name || user.username || "Sin nombre"}</td>
              <td>${user.email || "Sin correo"}</td>
              <td><span class="badge bg-success">Activo</span></td>
              <td class="text-center">
                  <button class="btn btn-sm btn-warning me-1"><i class="fas fa-edit"></i></button>
                  <button class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
              </td>
          </tr>
        `;
      });
    } catch (error) {
      console.error("[USUARIOS] Error al listar usuarios:", error);
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Error al cargar los datos del servidor.</td></tr>`;
    }
  }

  return Object.freeze({
    bootstrap,
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  App.bootstrap();
});

export default App;