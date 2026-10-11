/**
 * ============================================================
 * Inventario PME
 * Navbar Controller
 * ============================================================
 */

import AuthService from "../../services/auth_service.js";
import Storage from "../../storage/storage.js";

const NavbarController = (() => {
  async function init() {
    let user = Storage.getUser();

    if (!user) {
      try {
        const result = await AuthService.getCurrentUser();
        if (result && result.ok && result.data?.user) {
          user = result.data.user;
          Storage.setUser(user);
        }
      } catch (error) {
        console.warn("[NAVBAR] Error obteniendo usuario por API fallback:", error);
      }
    }

    if (!user) {
      user = { 
        first_name: "Administrador", 
        last_name: "Usuario", 
        roles: [{ role_name: "Administrador" }] 
      };
    }

    renderUserData(user);
    await checkNavbarCajaStatus();
  }

  async function checkNavbarCajaStatus() {
    const navbarNombre = document.querySelector("#navbar_caja_nombre");
    const badgeEstado = document.querySelector("#navbar_caja_estado_badge");

    if (!navbarNombre || !badgeEstado) return;

    try {
      const response = await fetch(`${window.APP_URL || ''}/api/cash/current`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Storage.getToken() || ''}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.success && result.data) {
          const session = result.data;
          const registerName = session.cash_register_name || "Principal";

          navbarNombre.innerHTML = `Caja: <span class="text-dark font-weight-bold">${registerName}</span>`;
          badgeEstado.textContent = "Abierta";
          badgeEstado.style.backgroundColor = "#DCFCE7";
          badgeEstado.style.color = "#16A34A";
          return;
        }
      }

      navbarNombre.innerHTML = `Caja: <span class="text-muted">Sin sesión activa</span>`;
      badgeEstado.textContent = "Cerrada";
      badgeEstado.style.backgroundColor = "#FEE2E2";
      badgeEstado.style.color = "#DC2626";

    } catch (error) {
      navbarNombre.innerHTML = `Caja: <span class="text-muted">Sin sesión activa</span>`;
      badgeEstado.textContent = "Cerrada";
      badgeEstado.style.backgroundColor = "#FEE2E2";
      badgeEstado.style.color = "#DC2626";
    }
  }

  function renderUserData(user) {
    const displayName =
      user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.first_name || user.name || user.username || "Usuario";

    let roleText = "Usuario";
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      roleText =
        typeof user.roles[0] === "string"
          ? user.roles[0]
          : user.roles[0].role_name || "Usuario";
    } else if (user.is_superuser || user.is_staff) {
      roleText = "Administrador";
    }

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