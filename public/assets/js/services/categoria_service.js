import ApiClient from "../core/apiClient.js";

const CategoriaService = (() => {
  const CATEGORIES_ENDPOINT = "/api/v1/categories/";

  let cachedCategorias = null;

  // Listar todas las categorias con cache en memoria cliente para evitar peticiones repetidas
  async function listarCategorias(forceRefresh = false) {
    if (cachedCategorias && !forceRefresh) {
      return cachedCategorias;
    }
    try {
      const response = await ApiClient.get(CATEGORIES_ENDPOINT);
      if (response && response.success) {
        cachedCategorias = response;
      }
      return response;
    } catch (error) {
      console.error("[CATEGORIE SERVICE] Error al listar categorias:", error);
      throw error;
    }
  }

  function invalidarCache() {
    cachedCategorias = null;
  }

  /**
   * Lista categorias con parámetros de paginación server-side.
   * @param {Object} params - { page, page_size, search, ordering }
   */
  async function listarCategoriasPaginadas(params = {}) {
    try {
      const query = new URLSearchParams();

      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      if (params.search) query.set("search", params.search);
      if (params.ordering) query.set("ordering", params.ordering);

      const queryString = query.toString();
      const url = queryString
        ? `${CATEGORIES_ENDPOINT}?${queryString}`
        : CATEGORIES_ENDPOINT;

      return await ApiClient.get(url);
    } catch (error) {
      console.error("[CATEGORIE SERVICE] Error al listar categorias paginados:", error);
      throw error;
    }
  }

  // Obtener detalles de una categoria por ID.
  async function obtenerCategoriaPorId(id) {
    try {
      return await ApiClient.get(`${CATEGORIES_ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`[CATEGORIE SERVICE] Error al obtener categoria ${id}:`, error);
      throw error;
    }
  }

  // Crear una categoria.
  async function crearCategoria(categoriaData) {
    try {
      const res = await ApiClient.post(CATEGORIES_ENDPOINT, categoriaData);
      invalidarCache();
      return res;
    } catch (error) {
      console.error("[CATEGORIE SERVICE] Error al crear categoria:", error);
      throw error;
    }
  }

  // Actualizar parcialmente una categoria (PATCH).
  async function actualizarCategoria(id, categorieData) {
    try {
      const res = await ApiClient.patch(`${CATEGORIES_ENDPOINT}${id}/`, categorieData);
      invalidarCache();
      return res;
    } catch (error) {
      console.error(
        `[CATEGORIE SERVICE] Error al actualizar (PATCH) categorie ${id}:`,
        error,
      );
      throw error;
    }
  }

  // Alternar estado activo/inactivo (DELETE lógico)
  async function cambiarEstadoCategoria(id, is_active) {
    try {
      const res = await ApiClient.patch(`${CATEGORIES_ENDPOINT}${id}/`, {
        is_active: is_active,
      });
      invalidarCache();
      return res;
    } catch (error) {
      console.error(
        `[CATEGORIE SERVICE] Error al cambiar estado de la categoria ${id}:`,
        error,
      );
      throw error;
    }
  }

  return Object.freeze({
    listarCategorias,
    listarCategoriasPaginadas,
    obtenerCategoriaPorId,
    crearCategoria,
    actualizarCategoria,
    cambiarEstadoCategoria,
    invalidarCache,
  });
})();

export default CategoriaService;
