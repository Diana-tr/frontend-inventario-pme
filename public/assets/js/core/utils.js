/**
 * @fileoverview Utilidades generales.
 */

const Utils = (() => {
  /**
   * Comprueba si un valor es nulo o indefinido.
   */
  const isNil = (value) => value === null || value === undefined;

  /**
   * Comprueba si un objeto está vacío.
   */
  const isEmptyObject = (object) => object && Object.keys(object).length === 0;

  /**
   * Comprueba si una cadena está vacía.
   */
  const isBlank = (value) =>
    typeof value === "string" ? value.trim() === "" : true;

  /**
   * Retrasa una ejecución.
   */
  const sleep = (milliseconds) =>
    new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });

  /**
   * Genera un UUID.
   */
  const uuid = () => crypto.randomUUID();

  const attachSearchControl = (searchInputId, onSearch, debounce = 500) => {
    const searchInput = document.getElementById(searchInputId);
    if (!searchInput || typeof onSearch !== "function") return;

    let searchTimeout = null;

    const doSearch = () => {
      clearTimeout(searchTimeout);
      onSearch(searchInput.value.trim());
    };

    const scheduleSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(doSearch, debounce);
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
      button.type = "button";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        doSearch();
      });
    }
  };

  return {
    isNil,

    isEmptyObject,

    isBlank,

    sleep,

    uuid,
    attachSearchControl,
  };
})();

export default Utils;
