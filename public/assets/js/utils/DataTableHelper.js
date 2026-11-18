/**
 * ============================================================
 * Inventario PME
 * DataTable Helper Utility
 * ============================================================
 *
 * Provee configuración estándar para inicialización de DataTables,
 * integración de permisos con SecurityManager para botones de exportación,
 * diccionario de localización en español offline (cero peticiones externas),
 * y layout profesional responsivo.
 */

import SecurityManager from "../core/security.js";

const DataTableHelper = (() => {
  /**
   * Layout responsivo DOM compatible con Bootstrap 4 / AdminLTE 3.
   * Coloca "Mostrar registros" a la izquierda, y en la derecha
   * agrupa el botón [Exportar ▾] (si tiene permiso) junto al buscador [Buscar: ___].
   */
  const DEFAULT_DOM =
    "<'row mb-2 align-items-center'" +
    "<'col-12 col-md-4 mb-2 mb-md-0'l>" +
    "<'col-12 col-md-8 d-flex justify-content-md-end align-items-center flex-wrap'Bf>" +
    ">" +
    "<'row'<'col-12'tr>>" +
    "<'row mt-2 align-items-center'" +
    "<'col-12 col-md-5'i>" +
    "<'col-12 col-md-7 d-flex justify-content-end'p>" +
    ">";

  /**
   * Configuración de idioma español estándar embebida para DataTables.
   * Elimina la dependencia de CDN externa evitando retrasos de red y fallos offline.
   */
  const LANGUAGE_ES = Object.freeze({
    processing: "Procesando registros...",
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ registros",
    info: "Mostrando de _START_ a _END_ de _TOTAL_ registros",
    infoEmpty: "Mostrando 0 a 0 de 0 registros",
    infoFiltered: "(filtrado de un total de _MAX_ registros)",
    infoPostFix: "",
    loadingRecords: "Cargando datos...",
    zeroRecords: "No se encontraron resultados coincidentes",
    emptyTable: "No hay datos disponibles en la tabla",
    paginate: {
      first: "Primero",
      previous: "Anterior",
      next: "Siguiente",
      last: "Último",
    },
    aria: {
      sortAscending: ": activar para ordenar la columna ascendente",
      sortDescending: ": activar para ordenar la columna descendente",
    },
    buttons: {
      copy: "Copiar",
      colvis: "Visibilidad",
      collection: "Colección",
      colvisRestore: "Restaurar",
      copyTitle: "Copiado al portapapeles",
      copySuccess: {
        1: "1 fila copiada al portapapeles",
        _: "%d filas copiadas al portapapeles",
      },
      csv: "CSV",
      excel: "Excel",
      pdf: "PDF",
      print: "Imprimir",
    },
  });

  /**
   * Genera los botones de exportación protegidos por permisos del backend.
   * Si el usuario NO tiene permiso para exportar el módulo (ej. "users.export"),
   * retorna un arreglo vacío `[]` y DataTables no renderiza nada.
   *
   * Si el usuario TIENE permiso, genera un menú desplegable "Exportar ▾"
   * elegante y profesional con opciones: Copiar, Excel, CSV, PDF, Imprimir.
   *
   * @param {string} moduleName - Identificador del módulo (ej. "users", "roles", "products", etc.)
   * @param {Array<number>} [columns] - Índices de columnas a exportar (ignora columnas como checkbox o acciones)
   * @param {Object} [customOptions] - Opciones adicionales (title, filename, etc.)
   * @returns {Array<Object>} Arreglo de botones para la opción `buttons` de DataTables
   */
  function getExportButtons(moduleName, columns = null, customOptions = {}) {
    // Verificar permiso granular de exportación en backend
    const canExport = SecurityManager.canExport(moduleName);

    if (!canExport) {
      return [];
    }

    const exportOptions = columns ? { columns } : {};
    const title = customOptions.title || undefined;
    const filename = customOptions.filename || undefined;

    // Sub-botones del desplegable
    const subButtons = [];

    // 1. Copiar
    if (customOptions.copy !== false) {
      subButtons.push({
        extend: "copy",
        className: "dropdown-item",
        text: '<i class="fas fa-copy text-secondary mr-2"></i>Copiar al portapapeles',
        exportOptions,
        title,
      });
    }

    // 2. Excel
    if (customOptions.excel !== false) {
      subButtons.push({
        extend: "excel",
        className: "dropdown-item",
        text: '<i class="fas fa-file-excel text-success mr-2"></i>Exportar a Excel (.xlsx)',
        exportOptions,
        title,
        filename,
      });
    }

    // 3. CSV
    if (customOptions.csv !== false) {
      subButtons.push({
        extend: "csv",
        className: "dropdown-item",
        text: '<i class="fas fa-file-csv text-info mr-2"></i>Exportar a CSV (.csv)',
        exportOptions,
        title,
        filename,
      });
    }

    // 4. PDF
    if (customOptions.pdf !== false) {
      subButtons.push({
        extend: "pdf",
        className: "dropdown-item",
        text: '<i class="fas fa-file-pdf text-danger mr-2"></i>Exportar a PDF (.pdf)',
        exportOptions,
        title,
        filename,
        orientation: customOptions.orientation || "portrait",
        pageSize: customOptions.pageSize || "A4",
      });
    }

    // 5. Imprimir
    if (customOptions.print !== false) {
      subButtons.push({
        extend: "print",
        className: "dropdown-item",
        text: '<i class="fas fa-print text-primary mr-2"></i>Imprimir tabla',
        exportOptions,
        title,
      });
    }

    // Retorna el botón desplegable agrupado
    return [
      {
        extend: "collection",
        text: '<i class="fas fa-file-export mr-1"></i>Exportar <i class="fas fa-caret-down ml-1"></i>',
        className: "btn btn-outline-secondary btn-sm dropdown-toggle shadow-sm dt-export-btn",
        autoClose: true,
        buttons: subButtons,
      },
    ];
  }

  return Object.freeze({
    DEFAULT_DOM,
    LANGUAGE_ES,
    getExportButtons,
  });
})();

export default DataTableHelper;
