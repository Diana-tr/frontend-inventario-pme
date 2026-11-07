/**
 * ============================================================
 * Inventario PME
 * Navbar Controller
 * ============================================================
 */

import AuthService from "../../services/auth_service.js";
import CajaService from "../../services/caja_service.js";
import SystemService from "../../services/system_service.js";
import Storage from "../../storage/storage.js";
import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm";

const NavbarController = (() => {
  let isInitialized = false;
  let notificationsList = [];
  let pollingInterval = null;

  const CATEGORY_META = {
    FEATURE: { label: "Novedad", badge: "badge-success", icon: "fa-plus-circle" },
    IMPROVEMENT: { label: "Mejora", badge: "badge-info", icon: "fa-rocket" },
    BUGFIX: { label: "Corrección", badge: "badge-warning", icon: "fa-bug" },
    SECURITY: { label: "Seguridad", badge: "badge-danger", icon: "fa-shield-alt" },
    TECHNICAL: { label: "Técnico", badge: "badge-secondary", icon: "fa-cogs" },
    BREAKING: { label: "Importante", badge: "badge-dark", icon: "fa-exclamation-triangle" },
  };

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function init() {
    if (isInitialized) return;
    isInitialized = true;

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
    initNotifications();

    // Escuchar eventos globales de apertura/cierre de caja para sincronizar en tiempo real
    window.addEventListener("cash_session_updated", async () => {
      await checkNavbarCajaStatus(true);
    });

    // Escuchar eventos globales de publicación/actualización de versiones
    window.addEventListener("versions_updated", async () => {
      await loadNotifications(true);
    });
  }

  /**
   * ============================================================
   * SISTEMA DE NOTIFICACIONES DE VERSIONES (CAMPANITA NAVBAR)
   * ============================================================
   */
  function initNotifications() {
    const markAllBtn = document.getElementById("navbar-notifications-mark-all");
    if (markAllBtn) {
      markAllBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await handleMarkAllRead();
      });
    }

    // Carga inicial
    loadNotifications();

    // Polling pasivo cada 5 minutos (solo si la ventana está activa)
    if (!pollingInterval) {
      pollingInterval = setInterval(() => {
        if (document.visibilityState === "visible") {
          loadNotifications(true);
        }
      }, 300000);
    }
  }

  async function loadNotifications(silent = false) {
    const badge = document.getElementById("navbar-notifications-badge");
    const header = document.getElementById("navbar-notifications-header");
    const listContainer = document.getElementById("navbar-notifications-list");

    if (!badge || !listContainer) return;

    try {
      const data = await SystemService.obtenerNotificacionesUsuario();
      const unreadCount = data.unread_count || 0;
      notificationsList = data.notifications || [];

      // 1. Actualizar Badge Contador
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? "99+" : unreadCount;
        badge.style.display = "inline-block";
        badge.className = "badge badge-warning navbar-badge font-weight-bold";
      } else {
        badge.textContent = "0";
        badge.style.display = "none";
      }

      // 2. Actualizar Encabezado del dropdown
      if (header) {
        header.innerHTML = unreadCount > 0
          ? `<i class="fas fa-bell mr-1 text-primary"></i> ${unreadCount} novedad${unreadCount === 1 ? "" : "es"} pendiente${unreadCount === 1 ? "" : "s"}`
          : `<i class="fas fa-bell-slash mr-1 text-muted"></i> Al día con las novedades`;
      }

      // 3. Renderizar listado de items
      renderNotificationsList(notificationsList);

    } catch (error) {
      if (!silent) {
        console.warn("[NAVBAR NOTIFICATIONS] Error cargando notificaciones:", error);
      }
    }
  }

  function renderNotificationsList(items) {
    const listContainer = document.getElementById("navbar-notifications-list");
    if (!listContainer) return;

    if (!items || items.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-4 text-muted small px-3">
          <i class="fas fa-check-circle text-success fa-2x mb-2 d-block"></i>
          <span>No hay versiones ni novedades publicadas recientemente.</span>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = items
      .map((item) => {
        const isRead = item.is_read;
        const formattedDate = item.published_at
          ? new Date(item.published_at).toLocaleDateString()
          : "";
        const titleSafe = escapeHtml(item.title || `Versión v${item.version}`);
        const descSafe = escapeHtml(item.description ? item.description.substring(0, 95) + "..." : "Consulte las novedades y mejoras incluidas.");
        const priorityBadge = item.priority === "MANDATORY"
          ? '<span class="badge badge-danger ml-1" style="font-size: 0.65rem;">Seguridad</span>'
          : "";

        return `
          <a href="#" class="dropdown-item px-3 py-2 border-bottom notification-item-link ${isRead ? 'opacity-75 bg-white' : 'bg-light font-weight-bold'}" data-version-id="${item.id}" style="transition: background-color 0.15s ease;">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <div>
                <span class="badge ${isRead ? 'badge-secondary' : 'badge-primary'} px-2 py-1 mr-1">v${escapeHtml(item.version)}</span>
                ${priorityBadge}
              </div>
              <div class="d-flex align-items-center">
                ${!isRead ? '<span class="badge badge-success px-1 py-0 mr-2" style="font-size: 0.65rem; border-radius: 4px;">NUEVA</span>' : ''}
                <small class="text-muted" style="font-size: 0.72rem;">${formattedDate}</small>
              </div>
            </div>
            <div class="text-dark small text-truncate" style="max-width: 280px;">${titleSafe}</div>
            <div class="text-muted" style="font-size: 0.75rem; line-height: 1.2;">${descSafe}</div>
          </a>
        `;
      })
      .join("");

    // Conectar eventos click para abrir detalle y marcar como leída
    listContainer.querySelectorAll(".notification-item-link").forEach((link) => {
      link.addEventListener("click", async (e) => {
        e.preventDefault();
        const versionId = link.dataset.versionId;
        await openNotificationDetail(versionId);
      });
    });
  }

  async function openNotificationDetail(versionId) {
    Swal.fire({
      title: "Cargando novedades...",
      text: "Obteniendo el detalle de la versión...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // 1. Obtener datos de la versión y marcarla como leída en paralelo
      const [resVer, resRead] = await Promise.all([
        SystemService.obtenerVersion(versionId),
        SystemService.marcarVersionLeida(versionId),
      ]);

      const version = resVer.data || resVer;

      // 2. Refrescar campanita en segundo plano
      await loadNotifications(true);

      // 3. Renderizar changelog categorizado
      let changelogHtml = "";
      const grouped = version.changelog_grouped || {};
      const catKeys = Object.keys(grouped);

      if (catKeys.length > 0) {
        catKeys.forEach((catKey) => {
          const catData = grouped[catKey];
          const meta = CATEGORY_META[catKey] || {
            label: catData.category_display || catKey,
            badge: "badge-secondary",
            icon: "fa-tag",
          };

          changelogHtml += `
            <div class="mb-3 text-left">
              <h6 class="font-weight-bold mb-2">
                <span class="badge ${meta.badge} px-2 py-1 mr-1">
                  <i class="fas ${meta.icon} mr-1"></i>${escapeHtml(meta.label)}
                </span>
              </h6>
              <ul class="list-group list-group-flush border-left pl-3" style="font-size: 0.85rem;">
          `;

          (catData.entries || []).forEach((item) => {
            changelogHtml += `
              <li class="py-1 border-0">
                <strong>${escapeHtml(item.title)}</strong>
                ${item.description ? `<br><span class="text-muted">${escapeHtml(item.description)}</span>` : ""}
              </li>
            `;
          });

          changelogHtml += `</ul></div>`;
        });
      } else if (Array.isArray(version.changelog_entries) && version.changelog_entries.length > 0) {
        changelogHtml += `<ul class="list-group list-group-flush text-left" style="font-size: 0.85rem;">`;
        version.changelog_entries.forEach((item) => {
          changelogHtml += `
            <li class="py-1 border-0">
              <strong>${escapeHtml(item.title)}</strong>
              ${item.description ? `<br><span class="text-muted">${escapeHtml(item.description)}</span>` : ""}
            </li>
          `;
        });
        changelogHtml += `</ul>`;
      } else {
        changelogHtml = `
          <p class="text-muted text-left" style="font-size: 0.85rem;">
            ${escapeHtml(version.description || "Esta versión incluye mejoras generales de estabilidad y rendimiento.")}
          </p>
        `;
      }

      const pubDate = version.published_at
        ? new Date(version.published_at).toLocaleDateString()
        : "Fecha no disponible";

      Swal.fire({
        title: `<span style="font-size: 1.25rem;">Novedades de la Versión v${escapeHtml(version.version)}</span>`,
        html: `
          <div class="text-left" style="max-height: 420px; overflow-y: auto; padding-right: 5px;">
            <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <span class="badge badge-primary px-2 py-1">Versión v${escapeHtml(version.version)}</span>
                ${version.name ? `<span class="ml-2 text-muted font-italic font-weight-bold">${escapeHtml(version.name)}</span>` : ""}
              </div>
              <small class="text-muted"><i class="fas fa-calendar-alt mr-1"></i>${pubDate}</small>
            </div>
            ${changelogHtml}
            <div class="alert alert-light border shadow-sm text-left p-2 mb-0 mt-3" style="font-size: 0.75rem; border-left: 4px solid #2563EB !important;">
              <i class="fas fa-check-circle text-primary mr-1"></i> Esta versión ya se encuentra desplegada y disponible para su uso en el ERP SaaS.
            </div>
          </div>
        `,
        width: "650px",
        confirmButtonText: '<i class="fas fa-check mr-1"></i> Entendido',
        confirmButtonColor: "#2563EB",
      });

    } catch (error) {
      console.error("[NAVBAR] Error al abrir detalle de notificación:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No fue posible cargar las novedades de la versión.",
        confirmButtonText: "Cerrar",
      });
    }
  }

  async function handleMarkAllRead() {
    try {
      await SystemService.marcarTodasLeidas();
      await loadNotifications(true);
    } catch (error) {
      console.warn("[NAVBAR] Error marcando todas como leídas:", error);
    }
  }

  async function checkNavbarCajaStatus(forceRefresh = false) {
    const navbarNombre = document.querySelector("#navbar_caja_nombre");
    const badgeEstado = document.querySelector("#navbar_caja_estado_badge");

    if (!navbarNombre || !badgeEstado) return;

    try {
      const result = await CajaService.obtenerSesionActual(forceRefresh);

      if (result && (result.ok || result.success) && result.data) {
        const session = result.data;
        const registerName = session.cash_register_name || (session.cash_register && session.cash_register.name) || "Principal";

        navbarNombre.innerHTML = `Caja: <span class="text-dark font-weight-bold">${registerName}</span>`;
        badgeEstado.textContent = "Abierta";
        badgeEstado.style.backgroundColor = "#DCFCE7";
        badgeEstado.style.color = "#16A34A";
        return;
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