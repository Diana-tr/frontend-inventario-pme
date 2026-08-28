import ApiClient from "../core/apiClient.js";

const UsuarioService = (() => {
  const USERS_ENDPOINT = "/api/v1/users/";

  async function listarUsuarios() {
    try {
      return await ApiClient.get(USERS_ENDPOINT);
    } catch (error) {
      console.error("[USUARIO SERVICE] Error al listar usuarios:", error);

      throw error;
    }
  }

  async function crearUsuario(userData) {
    try {
      return await ApiClient.post(USERS_ENDPOINT, userData);
    } catch (error) {
      console.error("[USUARIO SERVICE] Error al crear usuario:", error);

      throw error;
    }
  }

  return Object.freeze({
    listarUsuarios,
    crearUsuario,
  });
})();

export default UsuarioService;
