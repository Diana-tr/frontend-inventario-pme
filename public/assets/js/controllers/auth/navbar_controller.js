/**
 * ============================================================
 * Inventario PME
 * Navbar Controller
 * ============================================================
 *
 * Responsabilidades:
 * - Consultar la información del usuario autenticado actual.
 * - Renderizar el nombre, rol e iniciales en el Navbar y Sidebar (AdminLTE).
 * ============================================================
 */

import AuthService from "../../services/auth_service.js";

const NavbarController = (() => {
  /**
   * Inicializa el controlador cargando los datos del usuario.
   * @returns {Promise<void>}
   */
  async function init() {
    let user = null;

    try {
      // 1. Intentar obtener el usuario mediante la API
      const result = await AuthService.getCurrentUser();
      if (result && result.ok && result.data?.user) {
        user = result.data.user;
      }
    } catch (error) {
      console.warn(
        "[NAVBAR] No se pudo obtener el usuario vía API, buscando en almacenamiento local...",
        error,
      );
    }

    // 2. Fallback: Si la API falla, intentar leer desde localStorage (como vimos en tus capturas)
    if (!user) {
      try {
        const localUserStr = localStorage.getItem("inventariopme_user");
        if (localUserStr) {
          user = JSON.parse(localUserStr);
        }
      } catch (e) {
        console.error("[NAVBAR] Error al leer localStorage:", e);
      }
    }

    if (!user) {
      console.warn(
        "[NAVBAR] No se encontró información del usuario en ninguna fuente.",
      );
      return;
    }

    renderUserData(user);
  }

  /**
   * Procesa y pinta los datos del usuario en los elementos del DOM.
   * @param {Object} user
   */
  function renderUserData(user) {
    // 1. Nombre completo o visible
    const displayName =
      user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.first_name || user.name || user.username || "Usuario";

    // 2. Extraer el rol
    let roleText = "Usuario";
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      roleText =
        typeof user.roles[0] === "string"
          ? user.roles[0]
          : user.roles[0].role_name || "Usuario";
    } else if (user.is_superuser || user.is_staff) {
      roleText = "Administrador";
    }

    // 3. Calcular iniciales
    let initials = "U";
    if (user.first_name && user.last_name) {
      initials = (
        user.first_name.charAt(0) + user.last_name.charAt(0)
      ).toUpperCase();
    } else if (user.first_name) {
      initials = user.first_name.substring(0, 2).toUpperCase();
    } else if (user.username) {
      initials = user.username.substring(0, 2).toUpperCase();
    } else if (user.name) {
      initials = user.name.substring(0, 2).toUpperCase();
    }

    // 4. Inyectar en el DOM (Soportando tanto prefijo navbar- como sidebar-)
    const selectorsName = ["navbar-username", "sidebar-username"];
    selectorsName.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = user.first_name || displayName;
    });

    const selectorsFullname = ["navbar-fullname", "sidebar-fullname"];
    selectorsFullname.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = displayName;
    });

    const selectorsRole = ["navbar-role", "sidebar-role"];
    selectorsRole.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = roleText;
    });

    // Avatares pequeños y grandes
    const avatarSmallIds = ["navbar-avatar-small", "sidebar-avatar-small"];
    avatarSmallIds.forEach((id) => {
      const avatarSmall = document.getElementById(id);
      if (avatarSmall) {
        const span = avatarSmall.querySelector("span");
        if (span) span.textContent = initials;
      }
    });

    const avatarLargeIds = ["navbar-avatar-large", "sidebar-avatar-large"];
    avatarLargeIds.forEach((id) => {
      const avatarLarge = document.getElementById(id);
      if (avatarLarge) {
        const span = avatarLarge.querySelector("span");
        if (span) span.textContent = initials;
      }
    });
  }

  return Object.freeze({
    init,
  });
})();

export default NavbarController;
