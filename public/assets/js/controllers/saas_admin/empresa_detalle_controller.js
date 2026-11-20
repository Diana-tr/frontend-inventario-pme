import SaaSAdminService from "../../services/saas_admin_service.js";
import NotificationService from "../../core/notification.js";
import Storage from "../../storage/storage.js";
import Config from "../../config/config.js";

/**
 * ============================================================
 * Inventario PME
 * Empresa Detalle Controller (SaaS Admin)
 * ============================================================
 */
const EmpresaDetalleController = (() => {
  let empresaId = null;
  let empresaData = null;

  function escapeHtml(text) {
    if (!text && text !== 0) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(isoString) {
    if (!isoString) return "---";
    return new Date(isoString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(parseFloat(amount) || 0);
  }

  function getStatusBadge(status) {
    const badges = {
      ACTIVE: '<span class="badge badge-success px-3 py-2" style="border-radius:20px; font-size: 0.8rem;">Activa</span>',
      SUSPENDED: '<span class="badge badge-warning px-3 py-2" style="border-radius:20px; font-size: 0.8rem;">Suspendida</span>',
      PENDING_VERIFICATION: '<span class="badge badge-info px-3 py-2" style="border-radius:20px; font-size: 0.8rem;">Pendiente</span>',
      CANCELLED: '<span class="badge badge-danger px-3 py-2" style="border-radius:20px; font-size: 0.8rem;">Cancelada</span>',
    };
    return badges[status] || `<span class="badge badge-secondary px-3 py-2">${escapeHtml(status)}</span>`;
  }

  function getSubStatusBadge(status) {
    const map = {
      ACTIVE: "badge-success",
      TRIAL: "badge-warning",
      EXPIRED: "badge-danger",
      PAST_DUE: "badge-danger",
      CANCELLED: "badge-secondary",
    };
    return map[status] || "badge-secondary";
  }

  async function cargarDetalle() {
    $("#detalle_loader").show();
    $("#detalle_content").hide();
    $("#detalle_error").hide();

    const urlParams = new URLSearchParams(window.location.search);
    empresaId = urlParams.get("id");

    if (!empresaId) {
      $("#detalle_loader").hide();
      $("#detalle_error").show();
      return;
    }

    try {
      const response = await SaaSAdminService.obtenerEmpresaPorId(empresaId);

      if (response && response.success && response.data) {
        empresaData = response.data;
        renderDetalle(empresaData);
        $("#detalle_loader").hide();
        $("#detalle_content").fadeIn();
      } else {
        $("#detalle_loader").hide();
        $("#detalle_error").show();
      }
    } catch (error) {
      console.error("[EMPRESA DETALLE] Error al cargar empresa:", error);
      $("#detalle_loader").hide();
      $("#detalle_error").show();
    }
  }

  function renderDetalle(data) {
    const company = data.company || {};
    const owner = data.owner;
    const currentSub = data.current_subscription;

    // 1. Información de la Empresa
    document.getElementById("empresa_business_name").textContent = company.business_name || "---";
    document.getElementById("empresa_trade_name").textContent = company.trade_name || company.business_name || "---";
    document.getElementById("empresa_tax_id").textContent = company.tax_id || "---";
    document.getElementById("empresa_email").textContent = company.email || "---";
    document.getElementById("empresa_phone").textContent = company.phone || "---";
    document.getElementById("empresa_created_at").textContent = formatDate(company.created_at);
    document.getElementById("empresa_members_count").textContent = data.active_members_count || 0;
    document.getElementById("empresa_id_display").textContent = `#${company.id_company || empresaId}`;
    document.getElementById("empresa_status_badge").innerHTML = getStatusBadge(company.status);

    // 2. Propietario
    if (owner) {
      const displayName = owner.full_name || owner.username || "---";
      document.getElementById("owner_name").textContent = displayName;
      document.getElementById("owner_email").textContent = owner.email || "---";

      const initials = displayName
        .split(" ")
        .filter((w) => Boolean(w))
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
      document.getElementById("owner_initials").textContent = initials || "PR";
    }

    // 3. Suscripción Actual
    const subContainer = document.getElementById("subscription_info");
    const subBadge = document.getElementById("subscription_status_badge");

    if (currentSub && currentSub.plan) {
      const plan = currentSub.plan;
      const days = currentSub.days_remaining ?? 0;
      const daysColor = days <= 5 ? "text-danger" : days <= 15 ? "text-warning" : "text-success";

      subBadge.innerHTML = `<span class="badge ${getSubStatusBadge(currentSub.status)} px-3 py-2" style="border-radius:20px; font-size: 0.8rem;">${escapeHtml(currentSub.status_display || currentSub.status)}</span>`;

      subContainer.innerHTML = `
        <div class="row">
          <div class="col-md-3 col-6 mb-3">
            <dt class="text-muted small text-uppercase">Plan Contratado</dt>
            <dd class="font-weight-bold text-dark h5 mb-0">${escapeHtml(plan.name || "---")}</dd>
            <small class="text-muted">Ciclo: ${escapeHtml(plan.billing_cycle || "---")}</small>
          </div>
          <div class="col-md-2 col-6 mb-3">
            <dt class="text-muted small text-uppercase">Precio</dt>
            <dd class="font-weight-bold text-success h5 mb-0">${formatCurrency(plan.price)}</dd>
          </div>
          <div class="col-md-2 col-6 mb-3">
            <dt class="text-muted small text-uppercase">Fecha Inicio</dt>
            <dd class="text-dark font-weight-bold mb-0">${formatDate(currentSub.start_date)}</dd>
          </div>
          <div class="col-md-2 col-6 mb-3">
            <dt class="text-muted small text-uppercase">Fecha Vencimiento</dt>
            <dd class="text-dark font-weight-bold mb-0">${formatDate(currentSub.end_date)}</dd>
          </div>
          <div class="col-md-3 col-6 mb-3">
            <dt class="text-muted small text-uppercase">Días Restantes</dt>
            <dd class="font-weight-bold ${daysColor} h5 mb-0">${days} días</dd>
            <small class="text-muted">Renovación auto: ${currentSub.auto_renew ? "Sí" : "No"}</small>
          </div>
        </div>
      `;
    } else {
      subBadge.innerHTML = '<span class="badge badge-secondary px-3 py-2" style="border-radius:20px;">Sin Plan Activo</span>';
      subContainer.innerHTML = '<p class="text-muted mb-0">Esta empresa no tiene una suscripción activa actualmente.</p>';
    }

    // 4. Configurar botón de suspender/reactivar
    const isSuspended = company.status === "SUSPENDED";
    const btnToggle = document.getElementById("btn_toggle_status");
    const iconToggle = document.getElementById("icon_toggle_status");
    const textToggle = document.getElementById("btn_toggle_text");

    if (isSuspended) {
      btnToggle.className = "btn btn-outline-success btn-block shadow-sm font-weight-bold text-left";
      iconToggle.className = "fas fa-check-circle mr-2";
      textToggle.textContent = "Reactivar Empresa";
    } else {
      btnToggle.className = "btn btn-outline-warning btn-block shadow-sm font-weight-bold text-left";
      iconToggle.className = "fas fa-pause-circle mr-2";
      textToggle.textContent = "Suspender Empresa";
    }

    // 5. Historial de Suscripciones
    renderSubscriptionsTable(data.all_subscriptions || []);

    // 6. Historial de Pagos
    renderPaymentsTable(data.recent_payments || []);
  }

  function renderSubscriptionsTable(subs) {
    const tbody = document.getElementById("tbody_subscriptions");
    tbody.innerHTML = "";

    if (!subs || subs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">Sin registros de suscripciones.</td></tr>';
      return;
    }

    subs.forEach((s) => {
      const tr = document.createElement("tr");
      const planName = s.plan?.name || "Sin Plan";
      tr.innerHTML = `
        <td class="font-weight-bold text-dark">${escapeHtml(planName)}</td>
        <td><span class="badge ${getSubStatusBadge(s.status)} px-2 py-1">${escapeHtml(s.status_display || s.status)}</span></td>
        <td class="small text-muted">${formatDate(s.start_date)}</td>
        <td class="small text-muted">${formatDate(s.end_date)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderPaymentsTable(payments) {
    const tbody = document.getElementById("tbody_payments");
    tbody.innerHTML = "";

    if (!payments || payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">Sin pagos registrados.</td></tr>';
      return;
    }

    payments.forEach((p) => {
      const tr = document.createElement("tr");
      const badgeCls = p.status === "COMPLETED" ? "badge-success" : p.status === "FAILED" ? "badge-danger" : "badge-secondary";

      tr.innerHTML = `
        <td class="small font-weight-bold">${escapeHtml(p.plan_name || "N/A")}</td>
        <td class="font-weight-bold text-success">${formatCurrency(p.amount)}</td>
        <td class="small text-muted">${escapeHtml(p.payment_method || "---")}</td>
        <td><span class="badge ${badgeCls} px-2 py-1">${escapeHtml(p.status_display || p.status)}</span></td>
        <td class="small text-muted">${formatDate(p.payment_date)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function setupEvents() {
    // 1. Suspender / Reactivar Empresa
    document.getElementById("btn_toggle_status")?.addEventListener("click", async () => {
      if (!empresaData) return;
      const company = empresaData.company || {};
      const isSuspended = company.status === "SUSPENDED";
      const action = isSuspended ? "reactivate" : "suspend";

      const confirmMsg = isSuspended
        ? `¿Deseas reactivar la empresa "${company.business_name}"? Sus usuarios recuperarán acceso al sistema.`
        : `¿Estás seguro de suspender la empresa "${company.business_name}"? Se bloqueará inmediatamente el acceso a sus usuarios.`;

      const result = await NotificationService.warning(
        confirmMsg,
        isSuspended ? "Reactivar Empresa" : "Suspender Empresa"
      );
      if (!result.isConfirmed) return;

      try {
        NotificationService.loading("Procesando acción...");
        const response = await SaaSAdminService.ejecutarAccionEmpresa(empresaId, {
          action,
          reason: `Acción ejecutada desde vista detalle por personal administrativo.`,
        });
        NotificationService.close();

        if (response && response.success) {
          NotificationService.toastSuccess(
            `Empresa ${isSuspended ? "reactivada" : "suspendida"} con éxito.`
          );
          cargarDetalle();
        } else {
          NotificationService.error(NotificationService.getApiErrorMessage(response));
        }
      } catch (error) {
        console.error("[DETALLE EMPRESA] Error en toggle:", error);
        NotificationService.close();
        NotificationService.toastError("Error al ejecutar la acción.");
      }
    });

    // 2. Extender Trial (Modal)
    document.getElementById("btn_extend_trial")?.addEventListener("click", () => {
      $("#extend_detail_days").val(7);
      $("#extend_detail_reason").val("");
      $("#modalExtendTrialDetail").modal("show");
    });

    document.getElementById("form_extend_trial_detail")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const days = parseInt(document.getElementById("extend_detail_days").value, 10);
      const reason = document.getElementById("extend_detail_reason").value.trim();

      if (!days || days <= 0) {
        NotificationService.toastError("Los días deben ser mayores a cero.");
        return;
      }

      try {
        NotificationService.loading("Extendiendo período de prueba...");
        const response = await SaaSAdminService.ejecutarAccionEmpresa(empresaId, {
          action: "extend-trial",
          extra_days: days,
          reason: reason || "Extensión manual desde detalle administrativo.",
        });
        NotificationService.close();

        if (response && response.success) {
          $("#modalExtendTrialDetail").modal("hide");
          NotificationService.toastSuccess(`Prueba extendida en ${days} días exitosamente.`);
          cargarDetalle();
        } else {
          NotificationService.error(NotificationService.getApiErrorMessage(response));
        }
      } catch (error) {
        console.error("[DETALLE EMPRESA] Error extend trial:", error);
        NotificationService.close();
        NotificationService.toastError("Error al extender el período de prueba.");
      }
    });

    // 3. Soporte Técnico / Impersonación
    document.getElementById("btn_impersonate")?.addEventListener("click", async () => {
      if (!empresaData) return;
      const company = empresaData.company || {};
      const companyName = company.business_name || "la empresa";

      const result = await NotificationService.warning(
        `¿Deseas iniciar una sesión de soporte técnico en "${companyName}"? Esta operación quedará auditada formalmente.`,
        "Iniciar Soporte Técnico"
      );
      if (!result.isConfirmed) return;

      try {
        NotificationService.loading("Generando credenciales temporales...");
        const response = await SaaSAdminService.impersonarEmpresa(empresaId, {
          reason: "Soporte técnico solicitado desde ficha de empresa",
        });
        NotificationService.close();

        if (response && response.success && response.data) {
          const resData = response.data;
          const supportToken = resData.access_token;
          const targetCompId = resData.target_company?.id_company || empresaId;
          const targetCompName = resData.target_company?.business_name || companyName;
          const targetUser = resData.target_user;

          if (!supportToken) {
            NotificationService.error("El servidor no devolvió un token de acceso válido.");
            return;
          }

          // 1. Guardar copia de seguridad de la sesión de administración
          Storage.saveImpersonationBackup({
            admin_access_token: Storage.getAccessToken(),
            admin_refresh_token: Storage.getRefreshToken(),
            admin_user: Storage.getUser(),
            admin_permissions: Storage.getPermissions(),
            admin_roles: Storage.getRoles(),
            company_id: targetCompId,
            company_name: targetCompName,
            target_user: targetUser,
          });

          // 2. Limpiar caché previo de contexto
          sessionStorage.removeItem("inventariopme_security_context");

          // 3. Guardar token de soporte y empresa activa
          Storage.saveTokens(supportToken, "");
          Storage.saveActiveCompanyId(targetCompId);

          // 4. Actualizar usuario al usuario soporte impersonado
          if (targetUser) {
            Storage.saveUser({
              id_user: targetUser.id_user,
              username: targetUser.username,
              email: targetUser.email,
              first_name: targetUser.full_name?.split(" ")[0] || targetUser.username,
              last_name: targetUser.full_name?.split(" ").slice(1).join(" ") || "",
              is_superuser: false,
              is_staff: false,
            });
          }

          NotificationService.toastSuccess(`Ingresando a ${targetCompName} como soporte...`);

          setTimeout(() => {
            window.location.href = `${Config.BASE_PATH}/dashboard`;
          }, 800);
        } else {
          NotificationService.error(NotificationService.getApiErrorMessage(response));
        }
      } catch (error) {
        console.error("[DETALLE EMPRESA] Error impersonando:", error);
        NotificationService.close();
        NotificationService.toastError("Error al iniciar sesión de soporte técnico.");
      }
    });
  }

  function init() {
    cargarDetalle();
    setupEvents();
  }

  return Object.freeze({
    init,
  });
})();

export default EmpresaDetalleController;
