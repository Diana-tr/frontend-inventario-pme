/**
 * ============================================================
 * Inventario PME
 * Permission Selector Component
 * ============================================================
 *
 * Renderiza y gestiona la interfaz gráfica para seleccionar
 * permisos de roles de forma amigable, agrupada por módulos.
 */

const PermissionSelector = (() => {
  /**
   * Renderiza el selector de permisos en un contenedor.
   *
   * @param {HTMLElement} container Contenedor donde se insertará el HTML
   * @param {Array} catalog Catálogo de permisos desde el backend
   * @param {Object} currentPermissions Permisos actuales del rol (ej: {"users.view": true})
   */
  function render(container, catalog, currentPermissions = {}) {
    container.innerHTML = ""; // Limpiar
    
    // Contenedor principal de módulos
    const modulesContainer = document.createElement("div");
    modulesContainer.className = "modules-list";

    // Un set con todos los permisos conocidos para el warning de "desconocidos"
    const knownPermissions = new Set();

    catalog.forEach((module) => {
      // Registrar permisos conocidos
      module.permissions?.forEach((p) => knownPermissions.add(p.code));
      module.actions?.forEach((a) => knownPermissions.add(a.code));

      // Crear tarjeta de módulo
      const card = document.createElement("div");
      card.className = "card card-outline card-secondary mb-3 module-card";
      card.dataset.moduleId = module.module_id;

      // --- Header del módulo ---
      const header = document.createElement("div");
      header.className = "card-header d-flex justify-content-between align-items-center bg-light p-2";
      
      const titleWrapper = document.createElement("div");
      titleWrapper.innerHTML = `
        <i class="${module.icon || 'fas fa-puzzle-piece'} text-secondary mr-2"></i>
        <span class="font-weight-bold">${module.label}</span>
      `;
      
      const selectAllWrapper = document.createElement("div");
      selectAllWrapper.className = "custom-control custom-checkbox";
      selectAllWrapper.innerHTML = `
        <input type="checkbox" class="custom-control-input module-select-all" id="mod_all_${module.module_id}">
        <label class="custom-control-label small text-muted" for="mod_all_${module.module_id}">Todos</label>
      `;

      header.appendChild(titleWrapper);
      header.appendChild(selectAllWrapper);
      card.appendChild(header);

      // --- Body del módulo ---
      const body = document.createElement("div");
      body.className = "card-body p-3";

      // Contenedor flex para los checkboxes
      const row = document.createElement("div");
      row.className = "row";

      // Helper para agregar checkboxes
      const addCheckbox = (item, type) => {
        const col = document.createElement("div");
        col.className = "col-sm-6 mb-2 permission-item";
        col.dataset.searchText = `${item.description} ${item.code}`.toLowerCase();

        const isChecked = currentPermissions[item.code] === true;

        col.innerHTML = `
          <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input perm-checkbox" 
                   id="perm_${item.code.replace(/\./g, '_')}" 
                   value="${item.code}"
                   data-module="${module.module_id}"
                   ${isChecked ? 'checked' : ''}>
            <label class="custom-control-label font-weight-normal" for="perm_${item.code.replace(/\./g, '_')}">
              ${item.description} 
              <small class="text-muted d-block" style="font-size: 10px;">${item.code} ${type === 'action' ? '(Acción)' : ''}</small>
            </label>
          </div>
        `;
        row.appendChild(col);
      };

      // Agregar Permisos CRUD
      if (module.permissions && module.permissions.length > 0) {
        module.permissions.forEach(p => addCheckbox(p, 'permission'));
      }

      // Agregar Acciones si existen
      if (module.actions && module.actions.length > 0) {
        const divider = document.createElement("div");
        divider.className = "col-12 mt-2 mb-1";
        divider.innerHTML = `<span class="text-muted small text-uppercase font-weight-bold">Acciones Especiales</span><hr class="mt-1 mb-2">`;
        row.appendChild(divider);
        
        module.actions.forEach(a => addCheckbox(a, 'action'));
      }

      body.appendChild(row);
      card.appendChild(body);
      modulesContainer.appendChild(card);
    });

    container.appendChild(modulesContainer);

    // --- Permisos desconocidos (Obsoletos) ---
    const unknownCodes = Object.keys(currentPermissions).filter(
      code => currentPermissions[code] === true && !knownPermissions.has(code)
    );

    if (unknownCodes.length > 0) {
      const alertDiv = document.createElement("div");
      alertDiv.className = "alert alert-warning mt-3 mb-0";
      alertDiv.innerHTML = `
        <h5><i class="icon fas fa-exclamation-triangle"></i> Permisos Desconocidos</h5>
        <p class="mb-1 small">Este rol tiene asignados permisos que ya no existen en el sistema. Puedes mantenerlos (no harán nada) o desmarcarlos para limpiarlos permanentemente.</p>
        <div class="row mt-2" id="unknown_permissions_container">
        </div>
      `;
      container.appendChild(alertDiv);
      
      const unkContainer = alertDiv.querySelector("#unknown_permissions_container");
      unknownCodes.forEach(code => {
        const col = document.createElement("div");
        col.className = "col-sm-6 mb-2";
        col.innerHTML = `
          <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input perm-checkbox unknown-perm-checkbox" 
                   id="perm_unk_${code.replace(/\./g, '_')}" 
                   value="${code}"
                   disabled>
            <label class="custom-control-label font-weight-bold text-dark" for="perm_unk_${code.replace(/\./g, '_')}">
              ${code} <span class="badge badge-danger ml-1">Se eliminará</span>
            </label>
          </div>
        `;
        unkContainer.appendChild(col);
      });
    }

    _attachEvents(container);
  }

  /**
   * Configura la interactividad: 
   * - Seleccionar todos los del módulo
   * - Calcular estado indeterminado
   * - Buscador
   * - Checkbox general "Seleccionar todo"
   */
  function _attachEvents(container) {
    const modules = container.querySelectorAll(".module-card");
    const globalSelectAll = document.getElementById("edit_role_select_all_permissions") || 
                            document.getElementById("create_role_select_all_permissions");
    const searchInput = document.getElementById("edit_role_permissions_search") || 
                        document.getElementById("create_role_permissions_search");

    // Función para actualizar estados de "Seleccionar Todo" (módulo y global)
    const updateStates = () => {
      let totalChecked = 0;
      let totalCheckboxes = 0;

      modules.forEach(card => {
        const checkboxes = Array.from(card.querySelectorAll(".perm-checkbox"));
        const moduleSelectAll = card.querySelector(".module-select-all");
        
        if (checkboxes.length === 0) return;

        const checkedCount = checkboxes.filter(cb => cb.checked).length;
        totalChecked += checkedCount;
        totalCheckboxes += checkboxes.length;

        if (checkedCount === 0) {
          moduleSelectAll.checked = false;
          moduleSelectAll.indeterminate = false;
        } else if (checkedCount === checkboxes.length) {
          moduleSelectAll.checked = true;
          moduleSelectAll.indeterminate = false;
        } else {
          moduleSelectAll.checked = false;
          moduleSelectAll.indeterminate = true;
        }
      });

      if (globalSelectAll) {
        if (totalChecked === 0) {
          globalSelectAll.checked = false;
          globalSelectAll.indeterminate = false;
        } else if (totalChecked === totalCheckboxes) {
          globalSelectAll.checked = true;
          globalSelectAll.indeterminate = false;
        } else {
          globalSelectAll.checked = false;
          globalSelectAll.indeterminate = true;
        }
      }
    };

    // Evento de click en checkboxes individuales
    container.addEventListener("change", (e) => {
      if (e.target.classList.contains("perm-checkbox")) {
        updateStates();
      }
    });

    // Evento de "Seleccionar todos" del módulo
    modules.forEach(card => {
      const moduleSelectAll = card.querySelector(".module-select-all");
      moduleSelectAll.addEventListener("change", (e) => {
        const isChecked = e.target.checked;
        const checkboxes = card.querySelectorAll(".perm-checkbox");
        checkboxes.forEach(cb => cb.checked = isChecked);
        updateStates();
      });
    });

    // Evento de "Seleccionar todos" global
    if (globalSelectAll) {
      // Limpiar listeners anteriores para evitar doble ejecución
      const newGlobalSelectAll = globalSelectAll.cloneNode(true);
      globalSelectAll.parentNode.replaceChild(newGlobalSelectAll, globalSelectAll);
      
      newGlobalSelectAll.addEventListener("change", (e) => {
        const isChecked = e.target.checked;
        const checkboxes = container.querySelectorAll(".perm-checkbox:not(.unknown-perm-checkbox)");
        checkboxes.forEach(cb => cb.checked = isChecked);
        updateStates();
      });
    }

    // Buscador
    if (searchInput) {
      // Limpiar listeners
      const newSearchInput = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newSearchInput, searchInput);

      newSearchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();

        modules.forEach(card => {
          let hasVisibleMatches = false;
          const items = card.querySelectorAll(".permission-item");

          items.forEach(item => {
            if (query === "" || item.dataset.searchText.includes(query)) {
              item.style.display = "";
              hasVisibleMatches = true;
            } else {
              item.style.display = "none";
            }
          });

          // Ocultar la tarjeta completa si no tiene items que coincidan
          card.style.display = hasVisibleMatches ? "" : "none";
        });
      });
    }

    // Inicializar estado la primera vez
    updateStates();
  }

  /**
   * Extrae los permisos seleccionados actualmente en el contenedor
   * y los retorna como un objeto JSON compatible con el backend.
   *
   * @param {HTMLElement} container Contenedor donde se renderizó
   * @returns {Object} Ej: {"users.view": true, "sales.create": true}
   */
  function getSelectedPermissions(container) {
    const checkboxes = container.querySelectorAll(".perm-checkbox:checked");
    const payload = {};

    checkboxes.forEach(cb => {
      payload[cb.value] = true;
    });

    return payload;
  }

  return Object.freeze({
    render,
    getSelectedPermissions,
  });
})();

export default PermissionSelector;
