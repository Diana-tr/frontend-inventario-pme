/**
 * @fileoverview Utilidades generales y formateadores de ERP P.M.E.
 */

const Utils = (() => {
  /**
   * Sanitiza cadenas de texto para prevenir inyecciones XSS en el DOM.
   * @param {*} unsafe
   * @returns {string}
   */
  const escapeHtml = (unsafe) => {
    if (unsafe === null || unsafe === undefined) return "";
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  /**
   * Formatea un número como moneda estándar (por defecto COP - Colombia).
   * @param {number|string} amount
   * @param {string} [currency="COP"]
   * @param {string} [locale="es-CO"]
   * @returns {string}
   */
  const formatCurrency = (amount, currency = "COP", locale = "es-CO") => {
    const val = typeof amount === "string" ? parseFloat(amount) : Number(amount);
    if (isNaN(val)) return "$ 0.00";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val);
    } catch {
      return "$" + val.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
    }
  };

  /**
   * Formatea una fecha ISO a representación local legible.
   * @param {string|Date} isoString
   * @param {boolean} [includeTime=false]
   * @param {string} [locale="es-CO"]
   * @returns {string}
   */
  const formatDate = (isoString, includeTime = false, locale = "es-CO") => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return String(isoString);
    const options = { dateStyle: "medium" };
    if (includeTime) options.timeStyle = "short";
    try {
      return date.toLocaleString(locale, options);
    } catch {
      return date.toLocaleDateString();
    }
  };

  /**
   * Comprueba si un valor es nulo o indefinido.
   */
  const isNil = (value) => value === null || value === undefined;

  /**
   * Comprueba si un objeto está vacío.
   */
  const isEmptyObject = (object) =>
    object && typeof object === "object" && Object.keys(object).length === 0;

  /**
   * Comprueba si una cadena está vacía o solo contiene espacios.
   */
  const isBlank = (value) =>
    typeof value === "string" ? value.trim() === "" : true;

  /**
   * Retrasa una ejecución mediante Promise.
   * @param {number} milliseconds
   * @returns {Promise<void>}
   */
  const sleep = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

  /**
   * Genera un UUID estándar v4.
   * @returns {string}
   */
  const uuid = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });

  /**
   * Limita la tasa de invocación de una función (Debounce).
   * @param {Function} fn
   * @param {number} delay
   * @returns {Function}
   */
  const debounce = (fn, delay = 300) => {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  /**
   * Throttle para funciones de alta frecuencia.
   * @param {Function} fn
   * @param {number} limit
   * @returns {Function}
   */
  const throttle = (fn, limit = 300) => {
    let inThrottle = false;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  };

  /**
   * Vincula un campo de búsqueda con debouncing a un callback.
   * @param {string} searchInputId
   * @param {Function} onSearch
   * @param {number} [debounceMs=500]
   */
  const attachSearchControl = (searchInputId, onSearch, debounceMs = 500) => {
    const searchInput = document.getElementById(searchInputId);
    if (!searchInput || typeof onSearch !== "function") return;

    let searchTimeout = null;

    const doSearch = () => {
      clearTimeout(searchTimeout);
      onSearch(searchInput.value.trim());
    };

    const scheduleSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(doSearch, debounceMs);
    };

    searchInput.addEventListener("input", scheduleSearch);
    searchInput.addEventListener("search", doSearch);
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        doSearch();
      }
    });

    const searchForm = searchInput.closest("form");
    if (searchForm) {
      searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        doSearch();
      });
    }

    const button = searchInput
      .closest(".input-group")
      ?.querySelector("button[type='button']");
    if (button) {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        doSearch();
      });
    }
  };

  return Object.freeze({
    escapeHtml,
    formatCurrency,
    formatDate,
    isNil,
    isEmptyObject,
    isBlank,
    sleep,
    uuid,
    debounce,
    throttle,
    attachSearchControl,
  });
})();

export const {
  escapeHtml,
  formatCurrency,
  formatDate,
  isNil,
  isEmptyObject,
  isBlank,
  sleep,
  uuid,
  debounce,
  throttle,
  attachSearchControl,
} = Utils;

export default Utils;
