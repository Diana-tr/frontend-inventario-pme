import SaaSAuditService from "../../services/saas_audit_service.js";
import NotificationService from "../../core/notification.js";
import DataTableHelper from "../../utils/DataTableHelper.js";
import SecurityManager from "../../core/security.js";

/**
 * ============================================================
 * Inventario PME
 * Auditoría Global Controller (SaaS Admin)
 * ============================================================
 */
const AuditoriaController = (() => {
  const TABLE_ID = "tbl_saas_audit";
  let dataTableInstance = null;
  let currentLogsCache = new Map();

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
    return new Date(isoString).toLocaleString("es-CO");
  }

  function getMethodBadge(method) {
    const map = {
      GET: '<span class="badge badge-info px-2 py-1" style="font-size:0.75rem;">GET</span>',
      POST: '<span class="badge badge-success px-2 py-1" style="font-size:0.75rem;">POST</span>',
      PUT: '<span class="badge badge-warning px-2 py-1" style="font-size:0.75rem;">PUT</span>',
      PATCH: '<span class="badge badge-secondary px-2 py-1" style="font-size:0.75rem;">PATCH</span>',
      DELETE: '<span class="badge badge-danger px-2 py-1" style="font-size:0.75rem;">DELETE</span>',
    };
    return map[method] || `<span class="badge badge-dark px-2 py-1">${escapeHtml(method)}</span>`;
  }

  function getStatusCodeBadge(code) {
    if (!code) return '<span class="badge badge-secondary">---</span>';
    let cls = "badge-secondary";
    if (code >= 200 && code < 300) cls = "badge-success";
    else if (code >= 300 && code < 400) cls = "badge-info";
    else if (code >= 400 && code < 500) cls = "badge-warning";
    else if (code >= 500) cls = "badge-danger";
    return `<span class="badge ${cls} px-2 py-1" style="font-size:0.75rem; border-radius: 10px;">${code}</span>`;
  }

  function truncateText(text, maxLen = 40) {
    if (!text) return "---";
    const str = String(text);
    if (str.length <= maxLen) return escapeHtml(str);
    return `<span title="${escapeHtml(str)}">${escapeHtml(str.substring(0, maxLen))}…</span>`;
  }

  function getFilters() {
    return {
      method: document.getElementById("filter_audit_method")?.value || "",
      status_code: document.getElementById("filter_audit_status")?.value || "",
      security_event: document.getElementById("filter_audit_event")?.value?.trim() || "",
    };
  }

  function initDataTable() {
    if (dataTableInstance) {
      dataTableInstance.destroy();
      dataTableInstance = null;
    }

    currentLogsCache.clear();

    dataTableInstance = $(`#${TABLE_ID}`).DataTable({
      responsive: true,
      lengthChange: true,
      autoWidth: false,
      pageLength: 20,
      processing: true,
      serverSide: true,
      searchDelay: 500,
      dom: DataTableHelper.DEFAULT_DOM,
      buttons: DataTableHelper.getExportButtons("saas_audit", [1, 2, 3, 4, 5, 6, 7]),
      language: DataTableHelper.LANGUAGE_ES,
      columnDefs: [
        { orderable: false, targets: [0, 8] },
        { className: "text-center", targets: [0, 3, 5, 6, 8] },
      ],
      ajax: async function (data, callback) {
        try {
          const page = Math.floor(data.start / data.length) + 1;
          const pageSize = data.length;
          const search = data.search?.value || "";
          const filters = getFilters();

          const response = await SaaSAuditService.listarAuditLogs({
            page,
            page_size: pageSize,
            search,
            method: filters.method,
            status_code: filters.status_code,
            security_event: filters.security_event,
          });

          if (response?.success && response.data) {
            const logs = response.data.results || [];
            const totalRecords = response.data.count || 0;

            currentLogsCache.clear();
            logs.forEach((log) => {
              if (log.id) currentLogsCache.set(String(log.id), log);
            });

            const rows = logs.map((log, index) => {
              const detailBtn = `
                <button type="button" class="btn btn-xs btn-outline-info btn-view-audit" data-id="${log.id}" title="Ver Detalle Completo">
                  <i class="fas fa-eye"></i>
                </button>
              `;

              return [
                data.start + index + 1,
                `<strong class="text-dark">${escapeHtml(log.user_email || "Sistema / Anónimo")}</strong>`,
                `<span class="text-secondary">${escapeHtml(log.company_name || "Plataforma Global")}</span>`,
                getMethodBadge(log.method),
                truncateText(log.path, 45),
                `<span class="text-monospace small text-muted">${escapeHtml(log.ip_address || "---")}</span>`,
                getStatusCodeBadge(log.status_code),
                `<small class="text-muted">${formatDate(log.created_at)}</small>`,
                detailBtn,
              ];
            });

            callback({
              draw: data.draw,
              recordsTotal: totalRecords,
              recordsFiltered: totalRecords,
              data: rows,
            });

            SecurityManager.processDomPermissions();
          } else {
            callback({
              draw: data.draw,
              recordsTotal: 0,
              recordsFiltered: 0,
              data: [],
            });
          }
        } catch (error) {
          console.error("[AUDITORIA] Error server-side:", error);
          callback({
            draw: data.draw,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          });
        }
      },
      drawCallback: function () {
        $(".dataTables_paginate > .pagination").addClass("pagination-sm");
      },
    });
  }

  function setupEvents() {
    // 1. Filtrar al presionar botón
    document.getElementById("btn_filter_audit")?.addEventListener("click", () => {
      if (dataTableInstance) {
        dataTableInstance.ajax.reload(null, true);
      }
    });

    // 2. Limpiar Filtros
    document.getElementById("btn_clear_audit_filters")?.addEventListener("click", () => {
      const elMethod = document.getElementById("filter_audit_method");
      const elStatus = document.getElementById("filter_audit_status");
      const elEvent = document.getElementById("filter_audit_event");

      if (elMethod) elMethod.value = "";
      if (elStatus) elStatus.value = "";
      if (elEvent) elEvent.value = "";

      if (dataTableInstance) {
        dataTableInstance.ajax.reload(null, true);
      }
    });

    // 3. Filtrar al presionar Enter en inputs
    ["filter_audit_status", "filter_audit_event"].forEach((id) => {
      document.getElementById(id)?.addEventListener("keyup", (e) => {
        if (e.key === "Enter" && dataTableInstance) {
          dataTableInstance.ajax.reload(null, true);
        }
      });
    });

    // 4. Ver Detalle en Modal
    $(`#${TABLE_ID}`).on("click", ".btn-view-audit", function () {
      const logId = String($(this).data("id"));
      const log = currentLogsCache.get(logId);

      if (!log) {
        NotificationService.toastError("No se encontró la información del registro.");
        return;
      }

      document.getElementById("modal_log_user").textContent = log.user_email || "Sistema / Anónimo";
      document.getElementById("modal_log_company").textContent = log.company_name || "Plataforma Global (SaaS)";
      document.getElementById("modal_log_ip").textContent = log.ip_address || "---";

      const methodBadge = getMethodBadge(log.method);
      const statusBadge = getStatusCodeBadge(log.status_code);
      document.getElementById("modal_log_method_status").innerHTML = `${methodBadge} ${statusBadge}`;

      document.getElementById("modal_log_path").textContent = log.path || "---";
      document.getElementById("modal_log_date").textContent = formatDate(log.created_at);
      document.getElementById("modal_log_user_agent").textContent = log.user_agent || "No disponible";

      const payloadEl = document.getElementById("modal_log_payload");
      if (log.payload && Object.keys(log.payload).length > 0) {
        try {
          payloadEl.textContent = JSON.stringify(log.payload, null, 2);
        } catch {
          payloadEl.textContent = String(log.payload);
        }
      } else {
        payloadEl.textContent = "// Sin payload o datos adicionales.";
      }

      $("#modalAuditDetail").modal("show");
    });
  }

  function init() {
    initDataTable();
    setupEvents();
    SecurityManager.processDomPermissions();
  }

  return Object.freeze({
    init,
  });
})();

export default AuditoriaController;
