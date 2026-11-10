/**
 * ============================================================
 * Inventario PME
 * Navbar Controller
 * ============================================================
 */

import AuthService from "../../services/auth_service.js";
import CajaService from "../../services/caja_service.js";
import CompanyInfoService from "../../services/company_info_service.js";
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
    await initCompanySwitcher();
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

  /**
   * ============================================================
   * CONMUTADOR MULTIEMPRESA SAAS (COMPANY SWITCHER)
   * ============================================================
   */
  async function initCompanySwitcher() {
    const activeNameEl = document.getElementById("navbar-active-company-name");
    const listEl = document.getElementById("navbar-company-list");
    const countBadge = document.getElementById("navbar-company-count-badge");

    if (!activeNameEl || !listEl) return;

    try {
      let companies = Storage.getUserCompanies();
      let activeCompany = Storage.getActiveCompany();
      let activeCompanyId = Storage.getActiveCompanyId();

      // Consultar API si no hay empresas en memoria o para asegurar sincronización
      if (!companies || companies.length === 0) {
        const response = await CompanyInfoService.obtenerMisEmpresas();
        if (response && response.success && Array.isArray(response.data)) {
          companies = response.data;
          Storage.saveUserCompanies(companies);
        }
      }

      if (!companies || companies.length === 0) {
        activeNameEl.textContent = "Sin Empresa";
        listEl.innerHTML = '<div class="text-center py-3 text-muted small"><i class="fas fa-info-circle mr-1"></i>No pertenece a ninguna empresa.</div>';
        if (countBadge) countBadge.textContent = "0";
        return;
      }

      // Si no hay empresa activa seleccionada en Storage, auto-seleccionar la primera o activa
      if (!activeCompanyId) {
        const defaultCompany = companies.find((c) => c.status === "ACTIVE") || companies[0];
        activeCompanyId = defaultCompany.id_company;
        activeCompany = defaultCompany;
        Storage.saveActiveCompanyId(activeCompanyId);
        Storage.saveActiveCompany(activeCompany);
      } else if (!activeCompany) {
        activeCompany = companies.find((c) => String(c.id_company) === String(activeCompanyId)) || companies[0];
        Storage.saveActiveCompany(activeCompany);
      }

      const displayName = activeCompany ? (activeCompany.trade_name || activeCompany.business_name || `Empresa #${activeCompany.id_company}`) : "Empresa";
      activeNameEl.textContent = displayName;
      if (countBadge) countBadge.textContent = String(companies.length);

      renderCompanyList(companies, activeCompanyId);
    } catch (error) {
      console.warn("[NAVBAR] Error inicializando Company Switcher:", error);
      if (activeNameEl) activeNameEl.textContent = "Empresa";
    }
  }

  function renderCompanyList(companies, activeCompanyId) {
    const listEl = document.getElementById("navbar-company-list");
    if (!listEl) return;

    listEl.innerHTML = "";

    companies.forEach((comp) => {
      const isActive = String(comp.id_company) === String(activeCompanyId);
      const compName = escapeHtml(comp.trade_name || comp.business_name || `Empresa #${comp.id_company}`);
      const taxId = escapeHtml(comp.tax_id || "");
      const roleText = escapeHtml(comp.is_owner ? "Propietario" : (comp.role || "Miembro"));

      const itemBtn = document.createElement("a");
      itemBtn.href = "#";
      itemBtn.className = `dropdown-item d-flex align-items-center justify-content-between py-2 border-bottom ${isActive ? "bg-light font-weight-bold" : ""}`;
      itemBtn.style.cursor = "pointer";

      itemBtn.innerHTML = `
        <div class="d-flex align-items-center" style="max-width: 80%;">
          <div class="mr-2 rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; background: ${isActive ? "#EEF2FF" : "#F1F5F9"}; color: ${isActive ? "#4F46E5" : "#64748B"}; font-weight: 700; font-size: 0.8rem;">
            <i class="fas fa-building"></i>
          </div>
          <div style="overflow: hidden;">
            <div class="text-truncate text-dark small font-weight-bold" title="${compName}">${compName}</div>
            <div class="text-muted" style="font-size: 0.7rem;">${taxId ? `NIT: ${taxId} • ` : ""}${roleText}</div>
          </div>
        </div>
        <div>
          ${isActive ? '<span class="badge badge-success px-2 py-1" style="font-size: 0.65rem;"><i class="fas fa-check mr-1"></i>Activa</span>' : '<span class="badge badge-secondary px-2 py-1 text-muted" style="font-size: 0.65rem; background: #E2E8F0;">Cambiar</span>'}
        </div>
      `;

      itemBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isActive) return;
        await handleCompanySwitch(comp);
      });

      listEl.appendChild(itemBtn);
    });
  }

  async function handleCompanySwitch(targetCompany) {
    const compName = targetCompany.trade_name || targetCompany.business_name || `Empresa #${targetCompany.id_company}`;

    const result = await Swal.fire({
      title: "Cambiar de Empresa",
      text: `¿Desea cambiar el contexto de trabajo a "${compName}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: "Cambiando de empresa...",
      text: `Estableciendo contexto en ${compName}`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // 1. Guardar en almacenamiento local
      Storage.saveActiveCompanyId(targetCompany.id_company);
      Storage.saveActiveCompany(targetCompany);

      // 2. Limpiar cachés de sesión y permisos
      sessionStorage.removeItem("inventariopme_security_context");
      CompanyInfoService.invalidarCache();
      CajaService.invalidarSesionActual();

      // 3. Forzar refresco de contexto de seguridad con el nuevo X-Company-ID
      await AuthService.fetchSecurityContext(true);

      // 4. Notificar a la app
      window.dispatchEvent(
        new CustomEvent("company_changed", { detail: targetCompany })
      );

      // 5. Recargar la ventana para rehidratar completamente la vista actual
      window.location.reload();
    } catch (err) {
      console.error("[NAVBAR] Error al conmutar empresa:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No fue posible cambiar de empresa. Intente nuevamente.",
      });
    }
  }

  return Object.freeze({
    init,
    initCompanySwitcher,
  });
})();

export default NavbarController;