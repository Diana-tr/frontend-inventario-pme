/**
 * =======================================================
 * Inventario PME
 * Logout Controller
 * =======================================================
 * 
 * Responsabilidades:
 * - Limpiar la sesión utilizando el módulo Storage.
 * - Redirigir al usuario a la vista de login.
 */

import Storage from "./storage/storage.js";

const LogoutController = (() => {
  
  const handleLogout = () => {
    try {
      // 1. Borramos los tokens y datos de sesión usando el método clear del Storage
      Storage.clear();
      
      // 2. Opcional para depuración: imprimimos un mensaje en la consola de que se cerró sesión
      console.log("Sesión cerrada correctamente. Redirigiendo al login...");

      // 3. Redirigimos al usuario a la página principal de inicio de sesión
      // (Ajustamos la ruta relativa dependiendo de dónde esté el archivo actual)
      window.location.href = "../../../index.html"; // O "/index.html" según la estructura de vistas
      
    } catch (error) {
      console.error("Error al intentar cerrar sesión:", error);
    }
  };

  // Función para inicializar el controlador vinculándolo a un botón de logout si existe
  const init = () => {
    // Buscamos el botón de cerrar sesión en la interfaz (por ID o clase común)
    const logoutBtn = document.querySelector("#logout-btn") || document.querySelector(".logout-link");
    
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        handleLogout();
      });
    }
  };

  return {
    init,
    handleLogout
  };
})();

export default LogoutController;