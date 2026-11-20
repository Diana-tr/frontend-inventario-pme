import SaaSPlanService from "../../services/saas_plan_service.js";
import NotificationService from "../../core/notification.js";
import DataTableHelper from "../../utils/DataTableHelper.js";
import Utils, { escapeHtml, formatCurrency, formatDate } from "../../core/utils.js";

/**
 * ============================================================
 * Inventario PME - SaaS Admin
 * Controlador de Planes Comerciales y Suscripciones
 * ============================================================
 */
const SaaSPlanesController = (() => {
  const TABLE_PLANES_ID = "tbl_saas_planes";
  const TABLE_SUBS_ID = "tbl_saas_suscripciones";

  let dataTablePlanes = null;
  let dataTableSubs = null;

  let planesCache = [];
  let subsCache = [];
  let tenantsCache = [];
  let modulesCatalogCache = [];
  let dynamicModuleLabels = {};

  const MODULE_LABELS = Object.freeze({
    inventory: { label: "Inventario", color: "badge-primary", icon: "fas fa-warehouse" },
    sales: { label: "Ventas & POS", color: "badge-success", icon: "fas fa-cash-register" },
    finance: { label: "Finanzas", color: "badge-info", icon: "fas fa-coins" },
    cash: { label: "Cajas", color: "badge-secondary", icon: "fas fa-cash-register" },
    invoices: { label: "Facturación", color: "badge-dark", icon: "fas fa-file-invoice-dollar" },
    purchases: { label: "Compras", color: "badge-warning text-dark", icon: "fas fa-shopping-cart" },
    clients: { label: "Clientes", color: "badge-info", icon: "fas fa-user-tie" },
    customers: { label: "Clientes", color: "badge-info", icon: "fas fa-user-tie" },
    suppliers: { label: "Proveedores", color: "badge-secondary", icon: "fas fa-truck" },
    products: { label: "Productos", color: "badge-primary", icon: "fas fa-box" },
    categories: { label: "Categorías", color: "badge-info", icon: "fas fa-tags" },
    users: { label: "Usuarios", color: "badge-primary", icon: "fas fa-users" },
    roles: { label: "Roles", color: "badge-secondary", icon: "fas fa-user-shield" },
    user_roles: { label: "Asignación Roles", color: "badge-light border", icon: "fas fa-user-tag" },
    reports: { label: "Reportes", color: "badge-info", icon: "fas fa-chart-bar" },
    settings: { label: "Configuración", color: "badge-dark", icon: "fas fa-cog" },
  });

  const STATUS_BADGES = Object.freeze({
    ACTIVE: '<span class="badge badge-success px-2 py-1"><i class="fas fa-check-circle mr-1"></i>Activa</span>',
    TRIAL: '<span class="badge badge-warning px-2 py-1 text-dark"><i class="fas fa-stopwatch mr-1"></i>En Prueba</span>',
    PAST_DUE: '<span class="badge badge-danger px-2 py-1"><i class="fas fa-exclamation-triangle mr-1"></i>Pago Pendiente</span>',
    CANCELLED: '<span class="badge badge-secondary px-2 py-1"><i class="fas fa-times-circle mr-1"></i>Cancelada</span>',
    EXPIRED: '<span class="badge badge-dark px-2 py-1"><i class="fas fa-calendar-times mr-1"></i>Expirada</span>',
  });

  // ─────────────────────────────────────────────
  // Inicialización
  // ─────────────────────────────────────────────

  async function init() {
    setupEventListeners();
    await recargarTodo();
  }

  async function recargarTodo() {
    await Promise.all([
      cargarKPIs(),
      cargarCatalogoModulos(),
      cargarPlanes(),
      cargarSuscripciones(),
      cargarEmpresasParaSelector(),
    ]);
  }

  // ─────────────────────────────────────────────
  // Eventos de la Interfaz
  // ─────────────────────────────────────────────

  function setupEventListeners() {
    // Botón refrescar
    $("#btn_refrescar").on("click", async () => {
      NotificationService.loading("Actualizando...", "Sincronizando información");
      await recargarTodo();
      NotificationService.close();
      NotificationService.toastSuccess("Datos comerciales actualizados correctamente.");
    });

    // Botones para abrir modales principales
    $("#btn_nuevo_plan").on("click", abrirModalCrearPlan);
    $("#btn_asignar_suscripcion").on("click", abrirModalAsignarSuscripcion);

    // Botones de selección masiva de módulos en modal
    $("#btn_select_all_modules").on("click", () => {
      $("input[name='modules']").prop("checked", true);
      $(".group-module-master").prop("checked", true).prop("indeterminate", false);
      actualizarContadorModulosSeleccionados();
    });

    $("#btn_deselect_all_modules").on("click", () => {
      $("input[name='modules']").prop("checked", false);
      $(".group-module-master").prop("checked", false).prop("indeterminate", false);
      actualizarContadorModulosSeleccionados();
    });

    // Formularios
    $("#form_plan").on("submit", handleGuardarPlan);
    $("#form_assign_subscription").on("submit", handleGuardarAsignarSuscripcion);
    $("#form_change_plan").on("submit", handleGuardarCambiarPlan);
    $("#form_renew_subscription").on("submit", handleGuardarRenovacion);

    // Filtros de Suscripciones
    $("#filtro_sub_status, #filtro_sub_plan").on("change", () => {
      aplicarFiltrosSuscripciones();
    });

    $("#filtro_sub_search").on("input", Utils.debounce(() => {
      aplicarFiltrosSuscripciones();
    }, 300));

    // Cálculo dinámico de fecha estimada al renovar
    $("#renew_duration_days").on("input", actualizarPreviewFechaRenovacion);
  }

  // ─────────────────────────────────────────────
  // 1. KPIs Comerciales
  // ─────────────────────────────────────────────

  async function cargarKPIs() {
    try {
      const response = await SaaSPlanService.obtenerKpisComerciales();
      if (response && response.success && response.data) {
        const kpis = response.data;
        $("#kpi_total_planes").text(kpis.total_plans || 0);
        $("#kpi_planes_activos").text(`${kpis.active_plans || 0} activos`);
        $("#kpi_subs_activas").text(kpis.active_subscriptions || 0);
        $("#kpi_subs_trials").text(`${kpis.active_trials || 0} en prueba`);
        $("#kpi_past_due").text(kpis.past_due_subscriptions || 0);
        $("#kpi_expiring_soon").text(kpis.expiring_soon || 0);
      }
    } catch (error) {
      console.error("[PLANES CONTROLLER] Error cargando KPIs:", error);
    }
  }

  // ─────────────────────────────────────────────
  // 1.1. Catálogo Dinámico de Módulos (SaaS Admin)
  // ─────────────────────────────────────────────

  async function cargarCatalogoModulos() {
    try {
      const response = await SaaSPlanService.obtenerCatalogoModulos();
      if (response && response.success && response.data) {
        modulesCatalogCache = Array.isArray(response.data) ? response.data : [];
        actualizarMapaEtiquetasModulos(modulesCatalogCache);
        renderModulosEnFormulario(modulesCatalogCache);
      }
    } catch (error) {
      console.error("[PLANES CONTROLLER] Error cargando catálogo de módulos:", error);
      $("#modules_loading_placeholder").html(`
        <div class="text-danger small font-weight-bold">
          <i class="fas fa-exclamation-triangle mr-1"></i>No se pudo cargar el catálogo dinámico de módulos.
          <button type="button" class="btn btn-xs btn-outline-danger ml-2" id="btn_retry_modules" style="border-radius:4px;">Reintentar</button>
        </div>
      `);
      $("#btn_retry_modules").off("click").on("click", async () => {
        $("#modules_loading_placeholder").html(`
          <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
          <div class="small font-weight-bold">Reintentando carga del catálogo...</div>
        `);
        await cargarCatalogoModulos();
      });
    }
  }

  function actualizarMapaEtiquetasModulos(catalog) {
    dynamicModuleLabels = {};
    const colorPalette = [
      "badge-primary",
      "badge-success",
      "badge-info",
      "badge-warning text-dark",
      "badge-secondary",
      "badge-dark",
    ];
    let colorIdx = 0;

    catalog.forEach((group) => {
      const gColor = colorPalette[colorIdx % colorPalette.length];
      dynamicModuleLabels[group.code] = {
        label: group.label,
        color: gColor,
        icon: group.icon,
      };
      colorIdx++;

      if (Array.isArray(group.submodules)) {
        group.submodules.forEach((sub) => {
          dynamicModuleLabels[sub.code] = {
            label: sub.label,
            color: gColor,
            icon: sub.icon,
          };
        });
      }
    });

    // Alias históricos para retrocompatibilidad visual
    dynamicModuleLabels["clients"] = dynamicModuleLabels["customers"] || { label: "Clientes", color: "badge-info", icon: "fas fa-user-tie" };
    dynamicModuleLabels["stock"] = dynamicModuleLabels["inventory"] || { label: "Inventario", color: "badge-primary", icon: "fas fa-warehouse" };
  }

  function renderModulosEnFormulario(catalog) {
    const placeholder = $("#modules_loading_placeholder");
    const container = $("#modules_catalog_content");
    container.empty();

    if (!catalog || catalog.length === 0) {
      placeholder.html('<div class="text-muted small">No hay módulos disponibles en el catálogo.</div>');
      placeholder.show();
      container.hide();
      return;
    }

    placeholder.hide();
    container.show();

    catalog.forEach((group) => {
      const groupCard = $(`
        <div class="card border shadow-none mb-3" style="border-radius: 8px; overflow: hidden; border-color: #E2E8F0 !important;">
          <div class="card-header bg-light py-2 px-3 d-flex justify-content-between align-items-center">
            <div class="custom-control custom-checkbox d-flex align-items-center">
              <input type="checkbox" class="custom-control-input group-module-master" id="grp_${group.code}" data-group-code="${group.code}">
              <label class="custom-control-label font-weight-bold text-dark mb-0 ml-1" for="grp_${group.code}" style="cursor: pointer;">
                <i class="${escapeHtml(group.icon || 'fas fa-cube')} text-primary mr-1"></i> ${escapeHtml(group.label)}
              </label>
            </div>
            <span class="badge badge-light border text-muted small">${group.submodules?.length || 0} submódulos</span>
          </div>
          <div class="card-body p-3">
            <p class="text-muted small mb-2">${escapeHtml(group.description || "")}</p>
            <div class="row" id="group_submodules_${group.code}">
            </div>
          </div>
        </div>
      `);

      const subRow = groupCard.find(`#group_submodules_${group.code}`);

      if (Array.isArray(group.submodules) && group.submodules.length > 0) {
        group.submodules.forEach((sub) => {
          const subCol = $(`
            <div class="col-md-6 col-lg-4 mb-2">
              <div class="p-2 border rounded h-100 bg-white d-flex align-items-start" style="border-radius: 6px; border-color: #E2E8F0 !important;">
                <div class="custom-control custom-checkbox w-100">
                  <input type="checkbox" class="custom-control-input submodule-checkbox" id="sub_${sub.code}" name="modules" value="${sub.code}" data-group-parent="${group.code}">
                  <label class="custom-control-label font-weight-normal text-dark w-100" for="sub_${sub.code}" style="cursor: pointer;">
                    <div class="d-flex justify-content-between align-items-center">
                      <strong class="small text-truncate" style="max-width: 140px;">
                        <i class="${escapeHtml(sub.icon || 'fas fa-circle')} text-secondary mr-1" style="font-size: 0.75rem;"></i>${escapeHtml(sub.label)}
                      </strong>
                      <span class="badge badge-light border text-muted" style="font-size: 0.65rem;">${sub.permissions_count || 0} perms</span>
                    </div>
                    <small class="text-muted d-block mt-1 text-truncate" style="font-size: 0.7rem;" title="${escapeHtml(sub.description || '')}">
                      ${escapeHtml(sub.description || '')}
                    </small>
                  </label>
                </div>
              </div>
            </div>
          `);
          subRow.append(subCol);
        });
      } else {
        subRow.html('<div class="col-12 text-muted small">Sin submódulos configurados.</div>');
      }

      container.append(groupCard);
    });

    // Enlazar eventos de checkbox maestro por grupo
    $(".group-module-master").off("change").on("change", function () {
      const groupCode = $(this).data("group-code");
      const isChecked = $(this).is(":checked");
      $(`.submodule-checkbox[data-group-parent='${groupCode}']`).prop("checked", isChecked);
      actualizarContadorModulosSeleccionados();
    });

    // Enlazar eventos de checkbox de submódulo
    $(".submodule-checkbox").off("change").on("change", function () {
      const groupCode = $(this).data("group-parent");
      actualizarEstadoMasterGroup(groupCode);
      actualizarContadorModulosSeleccionados();
    });

    actualizarContadorModulosSeleccionados();
  }

  function actualizarEstadoMasterGroup(groupCode) {
    const submodules = $(`.submodule-checkbox[data-group-parent='${groupCode}']`);
    const total = submodules.length;
    const checkedCount = submodules.filter(":checked").length;
    const master = $(`#grp_${groupCode}`);

    if (checkedCount === 0) {
      master.prop("checked", false).prop("indeterminate", false);
    } else if (checkedCount === total) {
      master.prop("checked", true).prop("indeterminate", false);
    } else {
      master.prop("checked", false).prop("indeterminate", true);
    }
  }

  function actualizarContadorModulosSeleccionados() {
    const count = $("input[name='modules']:checked").length;
    $("#badge_modules_count").text(`${count} módulos seleccionados`);
  }

  // ─────────────────────────────────────────────
  // 2. Gestión de Planes Comerciales
  // ─────────────────────────────────────────────

  async function cargarPlanes() {
    try {
      const response = await SaaSPlanService.listarPlanes();
      if (response && response.success && response.data) {
        planesCache = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
        renderTablaPlanes(planesCache);
        actualizarSelectoresDePlanes(planesCache);
      }
    } catch (error) {
      console.error("[PLANES CONTROLLER] Error cargando planes:", error);
      NotificationService.error("No se pudo cargar el catálogo de planes comerciales.");
    }
  }

  function renderTablaPlanes(planes) {
    if (dataTablePlanes) {
      dataTablePlanes.destroy();
      dataTablePlanes = null;
    }

    const tbody = $("#tbody_planes");
    tbody.empty();

    if (!planes || planes.length === 0) {
      tbody.html(`
        <tr>
          <td colspan="7" class="text-center py-4 text-muted">
            <i class="fas fa-layer-group fa-2x mb-2 d-block"></i>
            No hay planes comerciales registrados.
          </td>
        </tr>
      `);
      return;
    }

    planes.forEach((p, idx) => {
      const priceFormatted = formatCurrency(p.price);
      const cycleBadge =
        p.billing_cycle === "ANNUAL"
          ? '<span class="badge badge-info">Anual</span>'
          : '<span class="badge badge-light border">Mensual</span>';

      const statusBadge = p.is_active
        ? '<span class="badge badge-success px-2 py-1"><i class="fas fa-check-circle mr-1"></i>Activo</span>'
        : '<span class="badge badge-secondary px-2 py-1"><i class="fas fa-ban mr-1"></i>Inactivo</span>';

      // Badges de módulos
      const modulesBadges = Array.isArray(p.enabled_modules) && p.enabled_modules.length > 0
        ? p.enabled_modules
            .map((mod) => {
              const info = dynamicModuleLabels[mod] || MODULE_LABELS[mod] || { label: mod, color: "badge-light border", icon: "fas fa-cube" };
              const iconHtml = info.icon ? `<i class="${escapeHtml(info.icon)} mr-1"></i>` : "";
              return `<span class="badge ${info.color} mr-1 mb-1" style="font-size:0.7rem;">${iconHtml}${escapeHtml(info.label)}</span>`;
            })
            .join("")
        : '<span class="text-muted small">Sin restricciones</span>';

      const toggleBtnClass = p.is_active ? "btn-outline-danger" : "btn-outline-success";
      const toggleBtnIcon = p.is_active ? "fa-ban" : "fa-check";
      const toggleBtnTitle = p.is_active ? "Desactivar Plan" : "Activar Plan";

      const tr = $(`
        <tr>
          <td class="text-center font-weight-bold text-muted" style="width: 50px;">${idx + 1}</td>
          <td>
            <strong class="text-primary">${escapeHtml(p.code)}</strong>
            <div class="font-weight-bold text-dark">${escapeHtml(p.name)}</div>
            <small class="text-muted text-truncate d-inline-block" style="max-width: 280px;">${escapeHtml(p.description || "Sin descripción")}</small>
          </td>
          <td>
            <div class="font-weight-bold text-dark">${priceFormatted}</div>
            <div>${cycleBadge}</div>
          </td>
          <td>
            <ul class="list-unstyled mb-0 small">
              <li><i class="fas fa-users text-muted mr-1"></i> Usuarios: <strong>${p.max_users}</strong></li>
              <li><i class="fas fa-box text-muted mr-1"></i> Productos: <strong>${p.max_products}</strong></li>
              <li><i class="fas fa-file-invoice text-muted mr-1"></i> Facturas/mes: <strong>${p.max_invoices_per_month}</strong></li>
            </ul>
          </td>
          <td style="max-width: 220px;">
            <div class="d-flex flex-wrap">${modulesBadges}</div>
          </td>
          <td class="text-center">
            ${statusBadge}
            <div class="small text-muted mt-1">${p.active_subscriptions_count || 0} empresas</div>
          </td>
          <td class="text-right pr-3" style="width: 140px;">
            <div class="btn-group btn-group-sm">
              <button type="button" class="btn btn-outline-primary btn-edit-plan" data-id="${p.id_plan}" title="Editar Plan">
                <i class="fas fa-edit"></i>
              </button>
              <button type="button" class="btn ${toggleBtnClass} btn-toggle-plan" data-id="${p.id_plan}" data-status="${p.is_active}" data-name="${escapeHtml(p.name)}" title="${toggleBtnTitle}">
                <i class="fas ${toggleBtnIcon}"></i>
              </button>
            </div>
          </td>
        </tr>
      `);

      tbody.append(tr);
    });

    // Iniciar DataTable para búsqueda y paginación client-side de planes
    dataTablePlanes = $(`#${TABLE_PLANES_ID}`).DataTable({
      responsive: true,
      autoWidth: false,
      pageLength: 10,
      language: DataTableHelper.LANGUAGE_ES,
      columnDefs: [
        { orderable: false, targets: [4, 6] },
        { className: "text-center", targets: [0, 5] },
      ],
    });

    // Enlazar eventos de botones en tabla
    $(".btn-edit-plan").off("click").on("click", function () {
      const id = $(this).data("id");
      abrirModalEditarPlan(id);
    });

    $(".btn-toggle-plan").off("click").on("click", function () {
      const id = $(this).data("id");
      const currentStatus = $(this).data("status");
      const name = $(this).data("name");
      handleToggleEstadoPlan(id, currentStatus, name);
    });
  }

  function abrirModalCrearPlan() {
    $("#modalPlanTitle").html('<i class="fas fa-plus-circle mr-2"></i>Crear Nuevo Plan Comercial');
    $("#form_plan")[0].reset();
    $("#plan_id").val("");
    $("#plan_code").prop("readonly", false);
    $("#plan_is_active").prop("checked", true);

    // Desmarcar todos los módulos y marcar los más comunes por defecto
    $("input[name='modules']").prop("checked", false);
    const defaults = ["inventory", "products", "categories", "sales", "cash", "invoices", "customers"];
    defaults.forEach((m) => {
      $(`input[name='modules'][value='${m}']`).prop("checked", true);
    });

    // Actualizar estado de los checkboxes maestros de grupo
    if (modulesCatalogCache && modulesCatalogCache.length > 0) {
      modulesCatalogCache.forEach((group) => {
        actualizarEstadoMasterGroup(group.code);
      });
    }
    actualizarContadorModulosSeleccionados();

    $("#modalPlan").modal("show");
  }

  async function abrirModalEditarPlan(planId) {
    const plan = planesCache.find((p) => p.id_plan === planId);
    if (!plan) {
      NotificationService.error("No se encontró la información del plan.");
      return;
    }

    $("#modalPlanTitle").html(`<i class="fas fa-edit mr-2"></i>Editar Plan: <strong>${escapeHtml(plan.name)}</strong>`);
    $("#plan_id").val(plan.id_plan);
    $("#plan_code").val(plan.code).prop("readonly", true); // Código fijo
    $("#plan_name").val(plan.name);
    $("#plan_description").val(plan.description || "");
    $("#plan_price").val(plan.price);
    $("#plan_billing_cycle").val(plan.billing_cycle);
    $("#plan_max_users").val(plan.max_users);
    $("#plan_max_products").val(plan.max_products);
    $("#plan_max_invoices").val(plan.max_invoices_per_month);
    $("#plan_is_active").prop("checked", plan.is_active);

    // Módulos
    $("input[name='modules']").prop("checked", false);
    if (Array.isArray(plan.enabled_modules)) {
      plan.enabled_modules.forEach((mod) => {
        let canonical = mod;
        if (canonical === "clients") canonical = "customers";
        if (canonical === "stock") canonical = "inventory";

        // Marcar submódulo específico
        $(`input[name='modules'][value='${canonical}']`).prop("checked", true);

        // Si es un código de grupo (ej: inventory, operations, security, contacts), marcar todos sus submódulos
        $(`.submodule-checkbox[data-group-parent='${canonical}']`).prop("checked", true);
      });
    }

    // Actualizar estado de los checkboxes maestros de grupo
    if (modulesCatalogCache && modulesCatalogCache.length > 0) {
      modulesCatalogCache.forEach((group) => {
        actualizarEstadoMasterGroup(group.code);
      });
    }
    actualizarContadorModulosSeleccionados();

    $("#modalPlan").modal("show");
  }

  async function handleGuardarPlan(e) {
    e.preventDefault();

    const planId = $("#plan_id").val();
    const isEditing = Boolean(planId);

    const selectedModules = [];
    $("input[name='modules']:checked").each(function () {
      selectedModules.push($(this).val());
    });

    const payload = {
      name: $("#plan_name").val().trim(),
      description: $("#plan_description").val().trim(),
      price: parseFloat($("#plan_price").val()),
      billing_cycle: $("#plan_billing_cycle").val(),
      max_users: parseInt($("#plan_max_users").val(), 10),
      max_products: parseInt($("#plan_max_products").val(), 10),
      max_invoices_per_month: parseInt($("#plan_max_invoices").val(), 10),
      enabled_modules: selectedModules,
      is_active: $("#plan_is_active").is(":checked"),
    };

    if (!isEditing) {
      payload.code = $("#plan_code").val().trim().toUpperCase();
      if (!payload.code) {
        NotificationService.error("Debe ingresar un código para el plan (ej: PRO, ENTERPRISE).");
        return;
      }
    }

    if (isNaN(payload.price) || payload.price < 0) {
      NotificationService.error("El precio debe ser un valor numérico mayor o igual a 0.");
      return;
    }

    const submitBtn = $("#form_plan button[type='submit']");
    submitBtn.prop("disabled", true);

    try {
      NotificationService.loading(
        isEditing ? "Actualizando plan..." : "Creando plan...",
        "Guardando cambios en el servidor"
      );

      let response;
      if (isEditing) {
        response = await SaaSPlanService.actualizarPlan(planId, payload);
      } else {
        response = await SaaSPlanService.crearPlan(payload);
      }

      NotificationService.close();

      if (response && response.success) {
        $("#modalPlan").modal("hide");
        NotificationService.toastSuccess(
          isEditing ? "Plan comercial actualizado correctamente." : "Plan comercial creado exitosamente."
        );
        await cargarPlanes();
        await cargarKPIs();
      } else {
        NotificationService.error(
          response?.message || "Ocurrió un error al guardar el plan comercial."
        );
      }
    } catch (error) {
      NotificationService.close();
      console.error("[PLANES CONTROLLER] Error al guardar plan:", error);
      const msg = error.data?.message || error.message || "Error al procesar la solicitud.";
      NotificationService.error(msg);
    } finally {
      submitBtn.prop("disabled", false);
    }
  }

  async function handleToggleEstadoPlan(planId, currentStatus, planName) {
    const accion = currentStatus ? "desactivar" : "activar";
    const confirm = await NotificationService.confirm(
      `¿Está seguro de que desea ${accion} el plan '${planName}'?`,
      `Confirmar ${accion} de plan`,
      currentStatus ? "Desactivar" : "Activar",
      "Cancelar"
    );

    if (!confirm.isConfirmed) return;

    try {
      NotificationService.loading("Procesando...", "Modificando estado del plan");
      const res = await SaaSPlanService.alternarEstadoPlan(planId);
      NotificationService.close();

      if (res && res.success) {
        NotificationService.toastSuccess(res.message || "Estado del plan actualizado.");
        await cargarPlanes();
        await cargarKPIs();
      } else {
        NotificationService.error(res?.message || "No se pudo actualizar el estado del plan.");
      }
    } catch (error) {
      NotificationService.close();
      console.error("[PLANES CONTROLLER] Error alternando estado:", error);
      NotificationService.error(error.message || "Error al alternar estado del plan.");
    }
  }

  // ─────────────────────────────────────────────
  // 3. Suscripciones de Empresas
  // ─────────────────────────────────────────────

  async function cargarSuscripciones() {
    try {
      const response = await SaaSPlanService.listarSuscripciones({
        page_size: 100, // Traemos lote representativo para administración
      });

      if (response && response.success && response.data) {
        subsCache = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
        renderTablaSuscripciones(subsCache);
      }
    } catch (error) {
      console.error("[PLANES CONTROLLER] Error cargando suscripciones:", error);
      NotificationService.error("No se pudieron cargar las suscripciones de las empresas.");
    }
  }

  function aplicarFiltrosSuscripciones() {
    const statusFilter = $("#filtro_sub_status").val();
    const planFilter = $("#filtro_sub_plan").val();
    const searchTerm = ($("#filtro_sub_search").val() || "").toLowerCase().trim();

    let filtradas = subsCache.filter((sub) => {
      // Estado
      if (statusFilter && sub.status !== statusFilter) return false;
      // Plan
      if (planFilter && sub.plan_code !== planFilter) return false;
      // Búsqueda
      if (searchTerm) {
        const companyName = (sub.company_name || "").toLowerCase();
        const taxId = (sub.tax_id || "").toLowerCase();
        const planName = (sub.plan_name || "").toLowerCase();
        if (
          !companyName.includes(searchTerm) &&
          !taxId.includes(searchTerm) &&
          !planName.includes(searchTerm)
        ) {
          return false;
        }
      }
      return true;
    });

    renderTablaSuscripciones(filtradas);
  }

  function renderTablaSuscripciones(subscriptions) {
    if (dataTableSubs) {
      dataTableSubs.destroy();
      dataTableSubs = null;
    }

    const tbody = $("#tbody_suscripciones");
    tbody.empty();

    if (!subscriptions || subscriptions.length === 0) {
      tbody.html(`
        <tr>
          <td colspan="7" class="text-center py-4 text-muted">
            <i class="fas fa-file-contract fa-2x mb-2 d-block"></i>
            No se encontraron suscripciones con los filtros seleccionados.
          </td>
        </tr>
      `);
      return;
    }

    subscriptions.forEach((sub, idx) => {
      const statusBadge = STATUS_BADGES[sub.status] || `<span class="badge badge-secondary">${escapeHtml(sub.status)}</span>`;

      // Badge de días restantes
      let daysBadge = "";
      if (sub.days_remaining <= 0) {
        daysBadge = '<span class="badge badge-danger">Vencida</span>';
      } else if (sub.days_remaining <= 7) {
        daysBadge = `<span class="badge badge-warning text-dark font-weight-bold">${sub.days_remaining} días</span>`;
      } else {
        daysBadge = `<span class="badge badge-success font-weight-bold">${sub.days_remaining} días</span>`;
      }

      const cycleLabel = sub.billing_cycle === "ANNUAL" ? "Anual" : "Mensual";

      const tr = $(`
        <tr>
          <td class="text-center font-weight-bold text-muted" style="width: 50px;">${idx + 1}</td>
          <td>
            <div class="font-weight-bold text-dark">${escapeHtml(sub.company_name)}</div>
            <small class="text-muted"><i class="fas fa-id-card mr-1"></i>NIT: ${escapeHtml(sub.tax_id || "N/A")}</small>
          </td>
          <td>
            <strong class="text-primary">${escapeHtml(sub.plan_name)}</strong>
            <div><small class="text-muted"><span class="badge badge-light border">${escapeHtml(sub.plan_code)}</span> • ${cycleLabel}</small></div>
          </td>
          <td class="text-center">
            ${statusBadge}
          </td>
          <td>
            <div class="small"><strong>Inicio:</strong> ${formatDate(sub.start_date, false)}</div>
            <div class="small"><strong>Vence:</strong> ${formatDate(sub.end_date, false)}</div>
          </td>
          <td class="text-center">
            ${daysBadge}
          </td>
          <td class="text-right pr-3" style="width: 170px;">
            <div class="btn-group btn-group-sm">
              <button type="button" class="btn btn-outline-info btn-quotas" data-company-id="${sub.company_id}" data-company-name="${escapeHtml(sub.company_name)}" title="Ver Cuotas y Consumo">
                <i class="fas fa-tachometer-alt"></i>
              </button>
              <button type="button" class="btn btn-outline-primary btn-change-plan" data-sub-id="${sub.id_subscription}" title="Cambiar Plan">
                <i class="fas fa-exchange-alt"></i>
              </button>
              <button type="button" class="btn btn-outline-success btn-renew" data-sub-id="${sub.id_subscription}" title="Renovar Suscripción">
                <i class="fas fa-calendar-plus"></i>
              </button>
            </div>
          </td>
        </tr>
      `);

      tbody.append(tr);
    });

    // Iniciar DataTable para suscripciones
    dataTableSubs = $(`#${TABLE_SUBS_ID}`).DataTable({
      responsive: true,
      autoWidth: false,
      pageLength: 10,
      language: DataTableHelper.LANGUAGE_ES,
      columnDefs: [
        { orderable: false, targets: [6] },
        { className: "text-center", targets: [0, 3, 5] },
      ],
    });

    // Eventos de botones
    $(".btn-quotas").off("click").on("click", function () {
      const companyId = $(this).data("company-id");
      const companyName = $(this).data("company-name");
      abrirModalCuotas(companyId, companyName);
    });

    $(".btn-change-plan").off("click").on("click", function () {
      const subId = $(this).data("sub-id");
      abrirModalCambiarPlan(subId);
    });

    $(".btn-renew").off("click").on("click", function () {
      const subId = $(this).data("sub-id");
      abrirModalRenovacion(subId);
    });
  }

  // ─────────────────────────────────────────────
  // 4. Modal: Asignar Suscripción
  // ─────────────────────────────────────────────

  async function cargarEmpresasParaSelector() {
    try {
      const res = await SaaSPlanService.listarEmpresasParaSelector();
      if (res && res.success && res.data) {
        tenantsCache = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        const select = $("#assign_company_id");
        select.empty();
        select.append('<option value="">-- Seleccionar Empresa --</option>');

        tenantsCache.forEach((t) => {
          select.append(
            `<option value="${t.id_company}">${escapeHtml(t.business_name)} (${escapeHtml(t.tax_id || "Sin NIT")})</option>`
          );
        });
      }
    } catch (error) {
      console.error("[PLANES CONTROLLER] Error cargando empresas para selector:", error);
    }
  }

  function actualizarSelectoresDePlanes(planes) {
    const planesActivos = planes.filter((p) => p.is_active);

    // Selector en Modal Asignar
    const assignSelect = $("#assign_plan_id");
    assignSelect.empty();
    assignSelect.append('<option value="">-- Seleccionar Plan Comercial --</option>');

    // Selector en Filtro
    const filterSelect = $("#filtro_sub_plan");
    filterSelect.find("option:not(:first)").remove();

    planes.forEach((p) => {
      filterSelect.append(`<option value="${p.code}">${escapeHtml(p.name)} (${p.code})</option>`);
    });

    planesActivos.forEach((p) => {
      const cycle = p.billing_cycle === "ANNUAL" ? "Anual" : "Mensual";
      assignSelect.append(
        `<option value="${p.id_plan}" data-cycle="${p.billing_cycle}">${escapeHtml(p.name)} — ${formatCurrency(p.price)} / ${cycle}</option>`
      );
    });

    // Ajustar duración por defecto según el plan seleccionado
    assignSelect.off("change").on("change", function () {
      const selected = $(this).find("option:selected");
      const cycle = selected.data("cycle");
      $("#assign_duration_days").val(cycle === "ANNUAL" ? 365 : 30);
    });
  }

  function abrirModalAsignarSuscripcion() {
    $("#form_assign_subscription")[0].reset();
    $("#assign_duration_days").val(30);
    $("#assign_status").val("ACTIVE");
    $("#modalAssignSubscription").modal("show");
  }

  async function handleGuardarAsignarSuscripcion(e) {
    e.preventDefault();

    const companyId = $("#assign_company_id").val();
    const planId = $("#assign_plan_id").val();
    const durationDays = parseInt($("#assign_duration_days").val(), 10);
    const status = $("#assign_status").val();
    const notes = $("#assign_notes").val().trim();

    if (!companyId || !planId) {
      NotificationService.error("Debe seleccionar una empresa y un plan comercial.");
      return;
    }

    if (isNaN(durationDays) || durationDays <= 0) {
      NotificationService.error("La duración en días debe ser un número entero mayor a 0.");
      return;
    }

    const submitBtn = $("#form_assign_subscription button[type='submit']");
    submitBtn.prop("disabled", true);

    try {
      NotificationService.loading("Asignando suscripción...", "Configurando acceso y límites");

      const response = await SaaSPlanService.asignarSuscripcion({
        company_id: parseInt(companyId, 10),
        plan_id: parseInt(planId, 10),
        duration_days: durationDays,
        status: status,
        notes: notes,
      });

      NotificationService.close();

      if (response && response.success) {
        $("#modalAssignSubscription").modal("hide");
        NotificationService.toastSuccess(
          response.message || "Suscripción asignada exitosamente a la empresa."
        );
        await cargarSuscripciones();
        await cargarKPIs();
        await cargarPlanes();
      } else {
        NotificationService.error(
          response?.message || "No se pudo asignar la suscripción."
        );
      }
    } catch (error) {
      NotificationService.close();
      console.error("[PLANES CONTROLLER] Error al asignar suscripción:", error);
      const msg = error.data?.message || error.message || "Error al procesar la asignación.";
      NotificationService.error(msg);
    } finally {
      submitBtn.prop("disabled", false);
    }
  }

  // ─────────────────────────────────────────────
  // 5. Modal: Cambiar Plan
  // ─────────────────────────────────────────────

  function abrirModalCambiarPlan(subId) {
    const sub = subsCache.find((s) => s.id_subscription === subId);
    if (!sub) {
      NotificationService.error("Suscripción no encontrada.");
      return;
    }

    $("#change_sub_id").val(sub.id_subscription);
    $("#change_company_name").text(sub.company_name);
    $("#change_current_plan").text(`${sub.plan_name} (${sub.plan_code})`);
    $("#change_current_expiry").text(formatDate(sub.end_date, false));
    $("#change_reason").val("");

    // Cargar select con planes activos distintos al actual
    const select = $("#change_new_plan_id");
    select.empty();
    select.append('<option value="">-- Seleccionar Nuevo Plan --</option>');

    const planesActivos = planesCache.filter((p) => p.is_active && p.id_plan !== sub.plan_id);
    planesActivos.forEach((p) => {
      const cycle = p.billing_cycle === "ANNUAL" ? "Anual" : "Mensual";
      select.append(
        `<option value="${p.id_plan}">${escapeHtml(p.name)} (${p.code}) — ${formatCurrency(p.price)} / ${cycle}</option>`
      );
    });

    $("#modalChangePlan").modal("show");
  }

  async function handleGuardarCambiarPlan(e) {
    e.preventDefault();

    const subId = $("#change_sub_id").val();
    const newPlanId = $("#change_new_plan_id").val();
    const reason = $("#change_reason").val().trim();

    if (!newPlanId) {
      NotificationService.error("Debe seleccionar el nuevo plan a asignar.");
      return;
    }

    if (!reason || reason.length < 5) {
      NotificationService.error("Debe ingresar un motivo válido de al menos 5 caracteres.");
      return;
    }

    const submitBtn = $("#form_change_plan button[type='submit']");
    submitBtn.prop("disabled", true);

    try {
      NotificationService.loading("Cambiando plan...", "Actualizando catálogo y cuotas");

      const response = await SaaSPlanService.cambiarPlanSuscripcion(subId, {
        new_plan_id: parseInt(newPlanId, 10),
        reason: reason,
      });

      NotificationService.close();

      if (response && response.success) {
        $("#modalChangePlan").modal("hide");
        NotificationService.toastSuccess(
          response.message || "Plan de suscripción cambiado exitosamente."
        );
        await cargarSuscripciones();
        await cargarKPIs();
        await cargarPlanes();
      } else {
        NotificationService.error(response?.message || "No se pudo cambiar el plan.");
      }
    } catch (error) {
      NotificationService.close();
      console.error("[PLANES CONTROLLER] Error al cambiar plan:", error);
      const msg = error.data?.message || error.message || "Error al procesar el cambio de plan.";
      NotificationService.error(msg);
    } finally {
      submitBtn.prop("disabled", false);
    }
  }

  // ─────────────────────────────────────────────
  // 6. Modal: Renovar Suscripción
  // ─────────────────────────────────────────────

  let currentRenewSub = null;

  function abrirModalRenovacion(subId) {
    const sub = subsCache.find((s) => s.id_subscription === subId);
    if (!sub) {
      NotificationService.error("Suscripción no encontrada.");
      return;
    }

    currentRenewSub = sub;

    $("#renew_sub_id").val(sub.id_subscription);
    $("#renew_company_name").text(sub.company_name);
    $("#renew_plan_name").text(`${sub.plan_name} (${sub.plan_code})`);
    $("#renew_current_expiry").text(formatDate(sub.end_date, false));

    const defaultDays = sub.billing_cycle === "ANNUAL" ? 365 : 30;
    $("#renew_duration_days").val(defaultDays);
    $("#renew_reason").val("");

    actualizarPreviewFechaRenovacion();
    $("#modalRenewSubscription").modal("show");
  }

  function actualizarPreviewFechaRenovacion() {
    if (!currentRenewSub || !currentRenewSub.end_date) return;

    const days = parseInt($("#renew_duration_days").val(), 10) || 0;
    const baseDate = new Date(currentRenewSub.end_date);
    const now = new Date();

    // Si ya está vencida, renovar desde hoy; si no, desde su fecha fin
    const effectiveStart = baseDate > now ? baseDate : now;
    const newDate = new Date(effectiveStart.getTime() + days * 24 * 60 * 60 * 1000);

    $("#renew_new_expiry_preview").text(formatDate(newDate.toISOString(), false));
  }

  async function handleGuardarRenovacion(e) {
    e.preventDefault();

    const subId = $("#renew_sub_id").val();
    const durationDays = parseInt($("#renew_duration_days").val(), 10);
    const reason = $("#renew_reason").val().trim();

    if (isNaN(durationDays) || durationDays <= 0) {
      NotificationService.error("Los días a extender deben ser un número positivo.");
      return;
    }

    const submitBtn = $("#form_renew_subscription button[type='submit']");
    submitBtn.prop("disabled", true);

    try {
      NotificationService.loading("Renovando suscripción...", "Extendiendo vigencia comercial");

      const response = await SaaSPlanService.renovarSuscripcion(subId, {
        duration_days: durationDays,
        reason: reason,
      });

      NotificationService.close();

      if (response && response.success) {
        $("#modalRenewSubscription").modal("hide");
        NotificationService.toastSuccess(
          response.message || "Suscripción renovada exitosamente."
        );
        await cargarSuscripciones();
        await cargarKPIs();
      } else {
        NotificationService.error(response?.message || "No se pudo renovar la suscripción.");
      }
    } catch (error) {
      NotificationService.close();
      console.error("[PLANES CONTROLLER] Error al renovar:", error);
      const msg = error.data?.message || error.message || "Error al procesar la renovación.";
      NotificationService.error(msg);
    } finally {
      submitBtn.prop("disabled", false);
    }
  }

  // ─────────────────────────────────────────────
  // 7. Modal: Monitoreo de Cuotas y Consumo
  // ─────────────────────────────────────────────

  async function abrirModalCuotas(companyId, companyName) {
    $("#quotas_company_name").text(companyName);
    $("#quotas_loader").show();
    $("#quotas_content").hide();
    $("#modalCompanyQuotas").modal("show");

    try {
      const response = await SaaSPlanService.obtenerCuotasEmpresa(companyId);

      if (response && response.success && response.data) {
        const metrics = response.data;
        const plan = metrics.plan || {};

        $("#quotas_plan_name").text(plan.name || "Sin Plan");
        $("#quotas_plan_code").text(plan.code || "---");

        const usage = metrics.usage || metrics;

        // Usuarios
        renderQuotaBar(
          "#bar_users",
          "#text_users",
          usage.users?.current || 0,
          usage.users?.max || 0,
          usage.users?.percentage || 0
        );

        // Productos
        renderQuotaBar(
          "#bar_products",
          "#text_products",
          usage.products?.current || 0,
          usage.products?.max || 0,
          usage.products?.percentage || 0
        );

        // Facturas
        renderQuotaBar(
          "#bar_invoices",
          "#text_invoices",
          usage.invoices?.current || 0,
          usage.invoices?.max || 0,
          usage.invoices?.percentage || 0
        );

        // Módulos
        const modContainer = $("#quotas_modules_container");
        modContainer.empty();
        if (Array.isArray(plan.enabled_modules) && plan.enabled_modules.length > 0) {
          plan.enabled_modules.forEach((mod) => {
            const info = dynamicModuleLabels[mod] || MODULE_LABELS[mod] || { label: mod, color: "badge-light border", icon: "fas fa-cube" };
            const iconHtml = info.icon ? `<i class="${escapeHtml(info.icon)} mr-1"></i>` : '<i class="fas fa-check mr-1"></i>';
            modContainer.append(
              `<span class="badge ${info.color} mr-2 mb-2 p-2" style="font-size:0.8rem;">
                ${iconHtml}${escapeHtml(info.label)}
              </span>`
            );
          });
        } else {
          modContainer.html('<span class="text-muted small">Todos los módulos habilitados por defecto.</span>');
        }

        $("#quotas_loader").hide();
        $("#quotas_content").fadeIn();
      } else {
        $("#quotas_loader").hide();
        NotificationService.error("No se pudieron obtener las métricas de consumo de la empresa.");
      }
    } catch (error) {
      $("#quotas_loader").hide();
      console.error("[PLANES CONTROLLER] Error al obtener cuotas:", error);
      NotificationService.error("Error al consultar las cuotas de la empresa.");
    }
  }

  function renderQuotaBar(barSelector, textSelector, current, max, pct) {
    const percentage = Math.min(Math.round(pct), 100);
    const bar = $(barSelector);

    bar.css("width", `${percentage}%`);
    bar.attr("aria-valuenow", percentage);
    bar.text(`${percentage}%`);

    bar.removeClass("bg-success bg-warning bg-danger");
    if (percentage >= 90) {
      bar.addClass("bg-danger");
    } else if (percentage >= 75) {
      bar.addClass("bg-warning");
    } else {
      bar.addClass("bg-success");
    }

    $(textSelector).text(`${current} / ${max}`);
  }

  return Object.freeze({
    init,
  });
})();

export default SaaSPlanesController;
