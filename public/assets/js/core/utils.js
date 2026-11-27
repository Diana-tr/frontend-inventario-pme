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

  /**
   * Limpia los estados de error de validación visuales en un formulario.
   * Remueve las clases `.is-invalid` y los contenedores `.invalid-feedback`.
   * @param {HTMLFormElement|HTMLElement|string} formOrSelector
   */
  const clearFormErrors = (formOrSelector) => {
    const form = typeof formOrSelector === "string" ? document.querySelector(formOrSelector) : formOrSelector;
    if (!form) return;

    form.querySelectorAll(".is-invalid").forEach((el) => {
      el.classList.remove("is-invalid");
      el.removeAttribute("aria-invalid");
    });

    form.querySelectorAll(".invalid-feedback.dynamic-feedback").forEach((el) => {
      el.remove();
    });

    const nonFieldAlert = form.querySelector(".form-non-field-errors");
    if (nonFieldAlert) {
      nonFieldAlert.remove();
    }
  };

  /**
   * Mapea los errores de validación devueltos por DRF a los campos de un formulario.
   * Maneja tanto errores de campo como `non_field_errors` o `detail`.
   * @param {HTMLFormElement|HTMLElement|string} formOrSelector
   * @param {Object|string} errors - Diccionario de errores retornado por DRF o ApiClient
   * @returns {{ nonFieldErrors: string[], hasErrors: boolean }}
   */
  const setFormErrors = (formOrSelector, errors) => {
    const form = typeof formOrSelector === "string" ? document.querySelector(formOrSelector) : formOrSelector;
    if (!form || !errors) return { nonFieldErrors: [], hasErrors: false };

    clearFormErrors(form);

    const nonFieldErrors = [];

    // Si errors es string
    if (typeof errors === "string") {
      nonFieldErrors.push(errors);
    } else if (typeof errors === "object") {
      for (const [field, messages] of Object.entries(errors)) {
        const msgList = Array.isArray(messages) ? messages : [messages];
        const combinedMsg = msgList.map((m) => (typeof m === "object" ? JSON.stringify(m) : String(m))).join(" ");

        if (field === "non_field_errors" || field === "detail" || field === "error" || field === "__all__") {
          nonFieldErrors.push(combinedMsg);
          continue;
        }

        // Buscar elemento por name o id con selectores seguros
        let input = null;
        try {
          const safeField = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(field) : field.replace(/["\\]/g, "\\$&");
          input =
            form.querySelector(`[name="${safeField}"]`) ||
            form.querySelector(`[name="${safeField}[]"]`) ||
            form.querySelector(`#${safeField}`) ||
            form.querySelector(`#id_${safeField}`);
        } catch {
          input = null;
        }

        if (input) {
          input.classList.add("is-invalid");
          input.setAttribute("aria-invalid", "true");

          let feedbackEl = input.parentElement.querySelector(`.invalid-feedback[data-field="${field}"]`);
          if (!feedbackEl) {
            feedbackEl = document.createElement("div");
            feedbackEl.className = "invalid-feedback dynamic-feedback";
            feedbackEl.setAttribute("data-field", field);
            // Si está dentro de un input-group, insertar después del input-group
            if (input.parentElement.classList.contains("input-group")) {
              input.parentElement.insertAdjacentElement("afterend", feedbackEl);
            } else {
              input.insertAdjacentElement("afterend", feedbackEl);
            }
          }
          feedbackEl.textContent = combinedMsg;

          // Limpieza automática al editar o corregir el campo
          const onUserEdit = () => {
            input.classList.remove("is-invalid");
            input.removeAttribute("aria-invalid");
            if (feedbackEl) {
              feedbackEl.remove();
            }
            input.removeEventListener("input", onUserEdit);
            input.removeEventListener("change", onUserEdit);
          };
          input.addEventListener("input", onUserEdit);
          input.addEventListener("change", onUserEdit);
        } else {
          // Si el campo no existe en el DOM, tratar como non_field_error
          nonFieldErrors.push(`${field}: ${combinedMsg}`);
        }
      }
    }

    if (nonFieldErrors.length > 0) {
      const alert = document.createElement("div");
      alert.className = "alert alert-danger alert-dismissible fade show form-non-field-errors";
      alert.setAttribute("role", "alert");
      alert.setAttribute("aria-live", "assertive");
      
      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "close";
      closeBtn.setAttribute("data-dismiss", "alert");
      closeBtn.setAttribute("aria-label", "Cerrar");
      closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>';
      alert.appendChild(closeBtn);

      const ul = document.createElement("ul");
      ul.className = "mb-0 pl-3";
      nonFieldErrors.forEach((err) => {
        const li = document.createElement("li");
        li.textContent = err;
        ul.appendChild(li);
      });

      alert.appendChild(ul);
      form.prepend(alert);
    }

    return {
      nonFieldErrors,
      hasErrors: true,
    };
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
    clearFormErrors,
    setFormErrors,
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
  clearFormErrors,
  setFormErrors,
} = Utils;

export default Utils;
