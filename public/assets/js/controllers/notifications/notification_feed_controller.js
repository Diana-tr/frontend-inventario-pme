/**
 * ============================================================
 * Inventario P.M.E. — Sistema Centralizado de Notificaciones
 * Notification Feed Controller
 * ============================================================
 * Controlador universal para la campanita del navbar y el
 * Centro de Notificaciones (modal/drawer).
 * Compatible con ERP de clientes y Panel SaaS Admin.
 */

import NotificationFeedService from "../../services/notification_feed_service.js";
import SystemService from "../../services/system_service.js";
import SwalFallback from "https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm";
const Swal = typeof window !== "undefined" && window.Swal ? window.Swal : SwalFallback;

const NotificationFeedController = (() => {
  let isInitialized = false;
  let pollIntervalId = null;
  const POLL_INTERVAL_MS = 45000; // 45 segundos

  // Cache en memoria
  let currentUnreadCount = 0;
  let cachedRecentItems = [];
  let modalActiveTab = "all"; // 'all' | 'unread'
  let modalCurrentPage = 1;
  let modalFilterCategory = "";
  let modalFilterPriority = "";
  let modalSearchQuery = "";

  const CATEGORY_ICONS = {
    INVENTORY: "fa-boxes",
    SALES: "fa-shopping-bag",
    PURCHASES: "fa-truck",
    CASH: "fa-cash-register",
    FINANCE: "fa-chart-pie",
    SECURITY: "fa-shield-alt",
    SUBSCRIPTION: "fa-crown",
    SYSTEM: "fa-code-branch",
    CUSTOMERS: "fa-users",
    SUPPLIERS: "fa-building",
  };

  const PRIORITY_BADGES = {
    CRITICAL: { label: "Crítica", cls: "badge-danger", cardCls: "priority-critical" },
    WARNING: { label: "Alerta", cls: "badge-warning", cardCls: "priority-warning" },
    SUCCESS: { label: "Éxito", cls: "badge-success", cardCls: "priority-success" },
    INFO: { label: "Info", cls: "badge-info", cardCls: "priority-info" },
  };

  const VERSION_CATEGORY_META = {
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

  function formatRelativeTime(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return "Hace un momento";
    if (diffSeconds < 3600) return `Hace ${Math.floor(diffSeconds / 60)} min`;
    if (diffSeconds < 86400) return `Hace ${Math.floor(diffSeconds / 3600)} h`;
    if (diffSeconds < 172800) return "Ayer";
    return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
  }

  /**
   * Inicialización del controlador.
   */
  async function init() {
    setupEventListeners();
    await refreshFeed(true);
    startSmartPolling();
    isInitialized = true;
  }

  /**
   * Configura listeners de eventos DOM y globales.
   */
  function setupEventListeners() {
    // 1. Botón 'Marcar todas leídas' en dropdown
    const markAllBtns = document.querySelectorAll(
      "#navbar-notifications-mark-all, .btn-mark-all-read-dynamic"
    );
    markAllBtns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await handleMarkAllRead();
      });
    });

    // 2. Botón para abrir el Centro de Notificaciones Modal
    const openCenterBtns = document.querySelectorAll(
      "#navbar-notifications-open-center, .btn-open-notif-center-dynamic"
    );
    openCenterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openNotificationCenterModal();
      });
    });

    // 3. Tab visibility listener (pausa y reanuda polling inteligente)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        refreshFeed(true);
      }
    });

    // 4. Eventos globales del sistema
    window.addEventListener("refresh_notifications", () => refreshFeed(true));
    window.addEventListener("versions_updated", () => refreshFeed(true));
    window.addEventListener("cash_session_updated", () => refreshFeed(true));
  }

  /**
   * Inicia el ciclo de polling controlado.
   */
  function startSmartPolling() {
    if (pollIntervalId) clearInterval(pollIntervalId);

    pollIntervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshFeed(false);
      }
    }, POLL_INTERVAL_MS);
  }

  /**
   * Refresca el conteo y la lista de notificaciones.
   */
  async function refreshFeed(forceRender = false) {
    try {
      // 1. Conteo de no leídas en backend centralizado
      const unreadData = await NotificationFeedService.getUnreadCount();
      let totalUnread = unreadData.unread_count || 0;

      // 2. Versiones no leídas del subsistema existente
      try {
        const versionData = await SystemService.obtenerNotificacionesUsuario();
        if (versionData && versionData.unread_count) {
          totalUnread += versionData.unread_count;
        }
      } catch {
        // Fallback si no aplica
      }

      const hasChanged = totalUnread !== currentUnreadCount;
      currentUnreadCount = totalUnread;

      updateBadge(totalUnread, hasChanged);

      if (hasChanged || forceRender) {
        await loadDropdownItems();
      }
    } catch (error) {
      console.warn("[NotificationFeedController] Error refrescando notificaciones:", error);
    }
  }

  /**
   * Actualiza el badge visual en la campanita.
   */
  function updateBadge(count, animate = false) {
    const badges = document.querySelectorAll(
      "#navbar-notifications-badge, #saas-navbar-notifications-badge, .navbar-notifications-badge-dynamic"
    );

    badges.forEach((badge) => {
      if (!badge) return;

      if (count > 0) {
        badge.textContent = count > 99 ? "99+" : count;
        badge.style.display = "inline-block";
        badge.classList.remove("d-none");
        if (animate) {
          badge.classList.remove("notification-badge-pulse");
          void badge.offsetWidth;
          badge.classList.add("notification-badge-pulse");
        }
      } else {
        badge.textContent = "0";
        badge.style.display = "none";
        badge.classList.add("d-none");
        badge.classList.remove("notification-badge-pulse");
      }
    });

    const headers = document.querySelectorAll(
      "#navbar-notifications-header, #saas-navbar-notifications-header"
    );
    headers.forEach((header) => {
      if (header) {
        header.innerHTML =
          count > 0
            ? `<i class="fas fa-bell mr-1 text-primary"></i> ${count} notificación${count === 1 ? "" : "es"}`
            : `<i class="fas fa-bell-slash mr-1 text-muted"></i> Sin novedades pendientes`;
      }
    });
  }

  /**
   * Carga los elementos recientes para el menú desplegable.
   */
  async function loadDropdownItems() {
    const listContainers = document.querySelectorAll(
      "#navbar-notifications-list, #saas-navbar-notifications-list, .navbar-notifications-list-dynamic"
    );
    if (!listContainers.length) return;

    try {
      // 1. Notificaciones de negocio
      const notifs = await NotificationFeedService.getRecentNotifications(5);

      // 2. Versiones de software
      let versions = [];
      try {
        const vData = await SystemService.obtenerNotificacionesUsuario();
        if (vData && Array.isArray(vData.notifications)) {
          versions = vData.notifications.filter((v) => !v.is_read).slice(0, 2);
        }
      } catch {
        // Fallback
      }

      // Convertir versiones a items unificados
      const unifiedVersions = versions.map((v) => ({
        id_notification: `version_${v.id}`,
        version_id: v.id,
        is_version: true,
        title: v.title || `Versión v${v.version} disponible`,
        message: v.description || "Consulte las novedades y mejoras incluidas.",
        category: "SYSTEM",
        category_display: "Versión",
        priority: v.priority === "MANDATORY" ? "CRITICAL" : "INFO",
        created_at: v.published_at,
        is_read: false,
        action_url: "",
      }));

      const allItems = [...unifiedVersions, ...notifs].slice(0, 6);
      cachedRecentItems = allItems;
      renderDropdownItems(allItems);
    } catch (error) {
      console.warn("[NotificationFeedController] Error cargando dropdown items:", error);
    }
  }

  /**
   * Renderiza el contenido del dropdown.
   */
  function renderDropdownItems(items) {
    const listContainers = document.querySelectorAll(
      "#navbar-notifications-list, #saas-navbar-notifications-list, .navbar-notifications-list-dynamic"
    );

    listContainers.forEach((container) => {
      if (!items || items.length === 0) {
        container.innerHTML = `
          <div class="text-center py-4 text-muted small px-3">
            <i class="fas fa-check-circle text-success fa-2x mb-2 d-block"></i>
            <span>Estás al día. No hay notificaciones pendientes.</span>
          </div>
        `;
        return;
      }

      container.innerHTML = items
        .map((item) => {
          const isRead = item.is_read;
          const cat = item.category || "SYSTEM";
          const prio = item.priority || "INFO";
          const catIcon = CATEGORY_ICONS[cat] || "fa-bell";
          const prioMeta = PRIORITY_BADGES[prio] || PRIORITY_BADGES.INFO;
          const relTime = formatRelativeTime(item.created_at);

          const titleSafe = escapeHtml(item.title);
          const msgSafe = escapeHtml(item.message);

          return `
            <a href="#" class="notification-item-card ${isRead ? "is-read" : "is-unread"} ${prioMeta.cardCls}" 
               data-id="${item.id_notification}" 
               data-is-version="${item.is_version ? "true" : "false"}"
               data-version-id="${item.version_id || ""}"
               data-url="${escapeHtml(item.action_url || "")}">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="notif-cat-badge notif-cat-${cat}">
                  <i class="fas ${catIcon} mr-1"></i> ${escapeHtml(item.category_display || cat)}
                </span>
                <div class="d-flex align-items-center">
                  <small class="text-muted" style="font-size: 0.72rem;">${relTime}</small>
                  ${!isRead ? '<span class="notification-unread-dot" title="No leída"></span>' : ""}
                </div>
              </div>
              <div class="text-dark font-weight-bold small text-truncate" style="max-width: 320px;">
                ${titleSafe}
              </div>
              <div class="text-muted text-truncate" style="font-size: 0.78rem; max-width: 320px;">
                ${msgSafe}
              </div>
            </a>
          `;
        })
        .join("");

      // Conectar eventos click
      container.querySelectorAll(".notification-item-card").forEach((card) => {
        card.addEventListener("click", async (e) => {
          e.preventDefault();
          const notifId = card.dataset.id;
          const isVersion = card.dataset.isVersion === "true";
          const versionId = card.dataset.versionId;
          const actionUrl = card.dataset.url;

          if (isVersion && versionId) {
            await openVersionDetail(versionId);
          } else {
            await handleNotificationClick(notifId, actionUrl);
          }
        });
      });
    });
  }

  /**
   * Manejador al hacer click en una notificación del dropdown.
   */
  async function handleNotificationClick(notificationId, actionUrl) {
    if (notificationId && !String(notificationId).startsWith("version_")) {
      await NotificationFeedService.markAsRead(notificationId);
      await refreshFeed(true);
    }

    if (actionUrl && actionUrl.trim()) {
      window.location.href = actionUrl;
    }
  }

  /**
   * Abre detalle de versión mediante modal interactivo SweetAlert2.
   */
  async function openVersionDetail(versionId) {
    Swal.fire({
      title: "Cargando novedades...",
      text: "Obteniendo detalles de la versión...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const [resVer, resRead] = await Promise.all([
        SystemService.obtenerVersion(versionId),
        SystemService.marcarVersionLeida(versionId).catch(() => null),
      ]);

      const version = resVer.data || resVer;
      await refreshFeed(true);

      let changelogHtml = "";
      const grouped = version.changelog_grouped || {};
      const catKeys = Object.keys(grouped);

      if (catKeys.length > 0) {
        catKeys.forEach((catKey) => {
          const catData = grouped[catKey];
          const meta = VERSION_CATEGORY_META[catKey] || {
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

          (catData.entries || []).forEach((entry) => {
            changelogHtml += `
              <li class="py-1 border-0">
                <strong>${escapeHtml(entry.title)}</strong>
                ${entry.description ? `<br><span class="text-muted">${escapeHtml(entry.description)}</span>` : ""}
              </li>
            `;
          });

          changelogHtml += `</ul></div>`;
        });
      } else if (Array.isArray(version.changelog_entries) && version.changelog_entries.length > 0) {
        changelogHtml += `<ul class="list-group list-group-flush text-left" style="font-size: 0.85rem;">`;
        version.changelog_entries.forEach((entry) => {
          changelogHtml += `
            <li class="py-1 border-0">
              <strong>${escapeHtml(entry.title)}</strong>
              ${entry.description ? `<br><span class="text-muted">${escapeHtml(entry.description)}</span>` : ""}
            </li>
          `;
        });
        changelogHtml += `</ul>`;
      } else {
        changelogHtml = `
          <p class="text-muted text-left" style="font-size: 0.85rem;">
            ${escapeHtml(version.description || "Esta versión incluye mejoras de estabilidad y optimización general.")}
          </p>
        `;
      }

      const pubDate = version.published_at
        ? new Date(version.published_at).toLocaleDateString()
        : "Fecha reciente";

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
              <i class="fas fa-check-circle text-primary mr-1"></i> Versión disponible para uso general en la plataforma P.M.E.
            </div>
          </div>
        `,
        width: "650px",
        confirmButtonText: '<i class="fas fa-check mr-1"></i> Entendido',
        confirmButtonColor: "#2563EB",
      });
    } catch (err) {
      console.error("[NotificationFeedController] Error abriendo versión:", err);
      Swal.fire("Error", "No se pudo cargar el detalle de la versión.", "error");
    }
  }

  /**
   * Marca todas las notificaciones como leídas (tanto centralizadas como versiones).
   */
  async function handleMarkAllRead() {
    try {
      await Promise.all([
        NotificationFeedService.markAllAsRead(),
        SystemService.marcarTodasComoLeidas().catch(() => 0),
      ]);

      await refreshFeed(true);

      if (Swal && typeof Swal.mixin === "function") {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        Toast.fire({
          icon: "success",
          title: "Notificaciones marcadas como leídas",
        });
      }
    } catch (error) {
      console.error("[NotificationFeedController] Error marcando todas leídas:", error);
    }
  }

  /**
   * Abre y gestiona el Centro de Notificaciones Completo (Modal).
   */
  async function openNotificationCenterModal() {
    let modalEl = document.getElementById("modalNotificationCenter");
    if (!modalEl) {
      createNotificationCenterModalDOM();
      modalEl = document.getElementById("modalNotificationCenter");
    }

    if (typeof $ !== "undefined" && $(modalEl).modal) {
      $(modalEl).modal("show");
    }

    modalCurrentPage = 1;
    await loadModalNotifications();
  }

  /**
   * Carga y renderiza el listado en el modal del Centro de Notificaciones.
   */
  async function loadModalNotifications() {
    const container = document.getElementById("notif-modal-list-container");
    const countBadge = document.getElementById("notif-modal-total-count");
    if (!container) return;

    container.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="fas fa-spinner fa-spin fa-2x mb-2 text-primary"></i>
        <div>Cargando notificaciones...</div>
      </div>
    `;

    const isReadParam = modalActiveTab === "unread" ? false : null;

    const data = await NotificationFeedService.getNotifications({
      page: modalCurrentPage,
      pageSize: 15,
      isRead: isReadParam,
      category: modalFilterCategory || null,
      priority: modalFilterPriority || null,
      search: modalSearchQuery || null,
    });

    if (countBadge) countBadge.textContent = `${data.count} encontradas`;

    if (!data.results || data.results.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5 text-muted">
          <i class="fas fa-inbox fa-3x mb-3 text-secondary"></i>
          <h6 class="font-weight-bold">No hay notificaciones para mostrar</h6>
          <p class="small text-muted">No se encontraron eventos con los filtros seleccionados.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.results
      .map((item) => {
        const isRead = item.is_read;
        const cat = item.category || "SYSTEM";
        const prio = item.priority || "INFO";
        const catIcon = CATEGORY_ICONS[cat] || "fa-bell";
        const prioMeta = PRIORITY_BADGES[prio] || PRIORITY_BADGES.INFO;
        const formattedDate = item.created_at
          ? new Date(item.created_at).toLocaleString("es-CO", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "";

        return `
          <div class="card mb-2 border ${isRead ? "border-light bg-white" : "border-primary bg-light"}" style="border-radius: 10px; transition: all 0.2s ease;">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div class="d-flex align-items-center">
                  <span class="notif-cat-badge notif-cat-${cat} mr-2">
                    <i class="fas ${catIcon} mr-1"></i> ${escapeHtml(item.category_display || cat)}
                  </span>
                  <span class="badge ${prioMeta.cls} mr-2" style="font-size: 0.65rem;">
                    ${prioMeta.label}
                  </span>
                  ${!isRead ? '<span class="badge badge-success px-1 py-0 mr-1" style="font-size: 0.65rem;">NUEVA</span>' : ""}
                </div>
                <small class="text-muted"><i class="far fa-clock mr-1"></i> ${formattedDate}</small>
              </div>
              <h6 class="font-weight-bold mb-1 text-dark">${escapeHtml(item.title)}</h6>
              <p class="text-muted mb-2 small" style="white-space: pre-line;">${escapeHtml(item.message)}</p>
              <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                <div>
                  ${
                    item.action_url
                      ? `<a href="${escapeHtml(item.action_url)}" class="btn btn-xs btn-primary font-weight-bold">
                           <i class="fas fa-external-link-alt mr-1"></i> Ir al Módulo
                         </a>`
                      : ""
                  }
                </div>
                <div>
                  <button type="button" class="btn btn-xs btn-outline-secondary btn-toggle-read" data-id="${item.id_notification}" data-is-read="${isRead}">
                    <i class="fas ${isRead ? "fa-envelope" : "fa-check"} mr-1"></i> ${isRead ? "Marcar no leída" : "Marcar leída"}
                  </button>
                  <button type="button" class="btn btn-xs btn-outline-danger btn-delete-notif ml-1" data-id="${item.id_notification}" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    // Conectar botones dentro del modal
    container.querySelectorAll(".btn-toggle-read").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const currentRead = btn.dataset.isRead === "true";
        if (currentRead) {
          await NotificationFeedService.markAsUnread(id);
        } else {
          await NotificationFeedService.markAsRead(id);
        }
        await refreshFeed(true);
        await loadModalNotifications();
      });
    });

    container.querySelectorAll(".btn-delete-notif").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const ok = await NotificationFeedService.deleteNotification(id);
        if (ok) {
          await refreshFeed(true);
          await loadModalNotifications();
        }
      });
    });
  }

  /**
   * Genera el DOM del modal del Centro de Notificaciones si no existe en la página.
   */
  function createNotificationCenterModalDOM() {
    const modalHtml = `
      <div class="modal fade" id="modalNotificationCenter" tabindex="-1" role="dialog" aria-labelledby="modalNotifTitle" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
            <div class="modal-header bg-light border-bottom d-flex align-items-center justify-content-between px-4 py-3" style="border-radius: 16px 16px 0 0;">
              <div>
                <h5 class="modal-title font-weight-bold text-dark mb-0" id="modalNotifTitle">
                  <i class="fas fa-bell mr-2 text-primary"></i> Centro de Notificaciones
                </h5>
                <small class="text-muted" id="notif-modal-total-count">Consultando novedades...</small>
              </div>
              <div class="d-flex align-items-center">
                <button type="button" class="btn btn-sm btn-outline-primary mr-2 font-weight-bold" id="notif-modal-mark-all-btn">
                  <i class="fas fa-check-double mr-1"></i> Marcar todas leídas
                </button>
                <button type="button" class="close text-dark" data-dismiss="modal" aria-label="Cerrar">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            </div>

            <div class="px-4 pt-3 bg-white border-bottom">
              <!-- Pestañas Todas / No Leídas -->
              <ul class="nav nav-tabs border-0" id="notif-modal-tabs">
                <li class="nav-item">
                  <a class="nav-link active font-weight-bold" href="#" id="tab-notif-all" style="cursor: pointer;">
                    <i class="fas fa-list mr-1"></i> Todas
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link font-weight-bold" href="#" id="tab-notif-unread" style="cursor: pointer;">
                    <i class="fas fa-envelope mr-1"></i> Solo no leídas
                  </a>
                </li>
              </ul>
            </div>

            <!-- Filtros rápidos -->
            <div class="px-4 py-2 bg-light border-bottom d-flex flex-wrap align-items-center justify-content-between" style="gap: 8px;">
              <div class="d-flex align-items-center flex-wrap" style="gap: 8px;">
                <select id="notif-filter-category" class="custom-select custom-select-sm" style="width: 160px; border-radius: 8px;">
                  <option value="">Todas las categorías</option>
                  <option value="INVENTORY">Inventario</option>
                  <option value="SALES">Ventas</option>
                  <option value="PURCHASES">Compras</option>
                  <option value="CASH">Caja</option>
                  <option value="FINANCE">Finanzas</option>
                  <option value="SECURITY">Seguridad</option>
                  <option value="SUBSCRIPTION">Suscripciones</option>
                  <option value="SYSTEM">Sistema</option>
                </select>

                <select id="notif-filter-priority" class="custom-select custom-select-sm" style="width: 140px; border-radius: 8px;">
                  <option value="">Toda prioridad</option>
                  <option value="CRITICAL">Crítica</option>
                  <option value="WARNING">Advertencia</option>
                  <option value="SUCCESS">Éxito</option>
                  <option value="INFO">Informativa</option>
                </select>
              </div>

              <div class="flex-grow-1 ml-md-2" style="max-width: 260px;">
                <div class="input-group input-group-sm">
                  <input type="text" id="notif-filter-search" class="form-control" placeholder="Buscar notificación..." style="border-radius: 8px 0 0 8px;">
                  <div class="input-group-append">
                    <button class="btn btn-outline-secondary" type="button" id="notif-btn-search" style="border-radius: 0 8px 8px 0;">
                      <i class="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lista de Notificaciones -->
            <div class="modal-body p-4" id="notif-modal-list-container" style="min-height: 300px; max-height: 520px; overflow-y: auto;">
              <!-- Cards dinámicas -->
            </div>

            <div class="modal-footer bg-light py-2 px-4 justify-content-between">
              <span class="text-muted small">Inventario P.M.E. — Notificaciones en tiempo real</span>
              <button type="button" class="btn btn-sm btn-secondary font-weight-bold" data-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Conectar eventos de los tabs y filtros del modal
    const tabAll = document.getElementById("tab-notif-all");
    const tabUnread = document.getElementById("tab-notif-unread");
    const selectCat = document.getElementById("notif-filter-category");
    const selectPrio = document.getElementById("notif-filter-priority");
    const inputSearch = document.getElementById("notif-filter-search");
    const btnSearch = document.getElementById("notif-btn-search");
    const modalMarkAll = document.getElementById("notif-modal-mark-all-btn");

    if (tabAll && tabUnread) {
      tabAll.addEventListener("click", (e) => {
        e.preventDefault();
        tabAll.classList.add("active");
        tabUnread.classList.remove("active");
        modalActiveTab = "all";
        loadModalNotifications();
      });

      tabUnread.addEventListener("click", (e) => {
        e.preventDefault();
        tabUnread.classList.add("active");
        tabAll.classList.remove("active");
        modalActiveTab = "unread";
        loadModalNotifications();
      });
    }

    if (selectCat) {
      selectCat.addEventListener("change", () => {
        modalFilterCategory = selectCat.value;
        loadModalNotifications();
      });
    }

    if (selectPrio) {
      selectPrio.addEventListener("change", () => {
        modalFilterPriority = selectPrio.value;
        loadModalNotifications();
      });
    }

    if (btnSearch && inputSearch) {
      const execSearch = () => {
        modalSearchQuery = inputSearch.value.trim();
        loadModalNotifications();
      };
      btnSearch.addEventListener("click", execSearch);
      inputSearch.addEventListener("keyup", (e) => {
        if (e.key === "Enter") execSearch();
      });
    }

    if (modalMarkAll) {
      modalMarkAll.addEventListener("click", async () => {
        await handleMarkAllRead();
        await loadModalNotifications();
      });
    }
  }

  return {
    init,
    refreshFeed,
    openNotificationCenterModal,
    handleMarkAllRead,
    openVersionDetail,
  };
})();

export default NotificationFeedController;
