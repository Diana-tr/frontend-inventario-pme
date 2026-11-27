# Registro de Cambios (Changelog) — Frontend ERP SaaS P.M.E.

Todas las modificaciones notables realizadas durante la **Auditoría Integral, Hardening de Seguridad y Modernización Arquitectónica** están documentadas en este archivo.

---

## [v1.1.0] — 2026-11-26

### 🛡️ Seguridad y Hardening OWASP (Fases 1 y 2)
- **SEC-01 (CWE-209 / Fuga de Errores):** Eliminado `ini_set('display_errors', 1)` hardcodeado en 38 archivos de vistas PHP. Se centralizó la directiva en `app/config/app.php` vinculada a la detección de entorno (`$isLocal`), asegurando `display_errors = 0` y `log_errors = 1` en producción.
- **SEC-01 (Cabeceras HTTP):** Inyección centralizada de cabeceras de seguridad en `app/config/app.php`:
  - `X-Frame-Options: SAMEORIGIN` (prevención de Clickjacking).
  - `X-Content-Type-Options: nosniff` (prevención de MIME-sniffing).
  - `Referrer-Policy: strict-origin-when-cross-origin`.
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`.
- **SEC-02 (CWE-79 / DOM XSS):** Corregida inyección en `public/assets/js/controllers/saas_admin/login_controller.js` sustituyendo manipulación insegura de HTML por nodos seguros `textContent` en `showAlert()`.
- **SEC-03 (CWE-829 / Dependencias Externas):** Removida la importación de SweetAlert2 vía CDN de jsDelivr en `public/assets/js/core/notification.js`, reemplazándola por el bundle local de AdminLTE 3 (`public/assets/vendor/AdminLTE-3.2.0/plugins/sweetalert2/`).
- **SEC-04 (Impersonación / Modo Soporte Técnico):**
  - Resuelto el bug crítico documentado en `TODO.md` que provocaba bucle de redirección al ingresar a soporte técnico.
  - En `public/assets/js/core/security.js`: Se garantiza que en Modo Soporte se evalúen estrictamente los permisos reales del usuario impersonado (`Storage.getPermissions()`), eliminando cualquier bypass artificial de validaciones en `hasPermission()`, `hasAction()` e `isModuleContracted()`.
  - En `public/assets/js/core/session_manager.js` y `public/assets/js/controllers/auth/logout_controller.js`: Agregada lógica para restaurar la sesión original del Superadministrador ante expiración (401) o cierre de sesión voluntario, evitando expulsar al usuario al login general de inquilino.
  - En `public/assets/js/controllers/auth/navbar_controller.js`: Implementado badge visual persistente "Modo Soporte Técnico" con botón "Salir de Soporte" conectado a `Storage.restoreFromImpersonation()`.

---

### 🌐 Integración de API y Multi-Tenant (Fases 3 y 4)
- **`public/assets/js/core/apiClient.js`:**
  - Integrado catálogo centralizado de errores HTTP (`HTTP_ERROR_CATALOG`) con códigos de negocio normalizados (400 a 504).
  - Implementado principio **Fail-Closed**: Aborta automáticamente solicitudes a endpoints tenant-scoped si el usuario está autenticado pero no existe empresa activa (`X-Company-ID`), devolviendo `{ code: "COMPANY_REQUIRED" }`.
  - Integrado control de timeout de red configurable mediante `AbortController` (30 segundos por defecto con limpieza en `finally`).
  - Normalizado el sobre de respuesta para homologar respuestas de red y errores de servidor al estándar `ApiResponse` de DRF.
  - Agregado evento global `security_forbidden` ante respuestas 403 para sincronizar permisos sin desloguear.
- **`public/assets/js/core/utils.js`:**
  - Creadas y exportadas las funciones utilitarias `clearFormErrors(formElement)` y `setFormErrors(formElement, errors)`.
  - Mapeo automático de errores de validación de campo devueltos por DRF a clases `.is-invalid` y contenedores `.invalid-feedback`.
  - Tratamiento de `non_field_errors` y `detail` en alertas Bootstrap (`.alert.alert-danger`) integradas en la cabecera del formulario.

---

### ⚡ Rendimiento, Arquitectura y Formularios (Fases 5, 6, 7, 8 y 9)
- **Desacoplamiento de Bootstrap en Footer:** Removida la doble invocación redundante de `await App.bootstrap()` y `LogoutController.init()` en `app/views/layouts/footer.php`, delegando el control exclusivamente a las vistas individuales y la barra de navegación.
- **Cache-Busting Centralizado:**
  - Definida la variable `$APP_VERSION = '1.0.0'` en `app/config/app.php`.
  - Reemplazadas llamadas dispersas a `time()`, `2026` y `1.1` por `?v=<?php echo $APP_VERSION; ?>` en 12 archivos de vistas y layouts, habilitando el caché HTTP determinista en navegadores.
- **Gestión de Memoria en Chart.js (`public/assets/js/controllers/dashboard/dashboard.js`):**
  - Encapsuladas 4 instancias de gráficos (`bar`, `line`, `pie`, `payment`) dentro de un objeto privado `chartInstances`, eliminando su exposición en el objeto global `window`.
  - Implementada función `destroyCharts()` y expuesto el método público `destroy()` para liberar memoria y canvas.
- **Throttling y Prevención de Doble Envío:**
  - Agregado control de estado `isSubmittingTrial` y deshabilitación de botón submit en `public/assets/js/controllers/saas_admin/empresa_detalle_controller.js` (`#form_extend_trial_detail`).
- **Normalización de DataTables:**
  - Auditados 21 controladores de listado, confirmando el uso de `DataTableHelper.js` con layout responsivo `DEFAULT_DOM` y diccionario español offline `LANGUAGE_ES` (cero peticiones externas a CDNs).

---

### 📋 Entregables de Documentación de Auditoría
Se generaron formalmente los siguientes 12 documentos de arquitectura y control de calidad en la raíz del repositorio:
1. `FRONTEND_ARCHITECTURE.md`: Diagnóstico arquitectónico integral, principios SOLID y flujos del sistema.
2. `FRONTEND_INVENTORY.md`: Inventario métrico detallado de 166 archivos propios (42.242 líneas de código).
3. `FRONTEND_DEPENDENCIES.md`: Grafo de relaciones completas PHP → JS → Services → ApiClient → Backend.
4. `SECURITY_AUDIT.md`: Auditoría de vulnerabilidades OWASP con clasificación de criticidad y planes de mitigación.
5. `AUTHENTICATION_AND_SESSION.md`: Auditoría del ciclo de vida JWT, refresh token atómico y resolución del soporte técnico.
6. `API_INTEGRATION.md`: Catálogo exhaustivo de endpoints de 21 servicios, envelope estándar y mapeo de errores DRF.
7. `MULTITENANT_FRONTEND.md`: Ciclo de vida de inquilinos, inyección de `X-Company-ID`, fail-closed e impersonación.
8. `PERFORMANCE_AUDIT.md`: Evaluación de Core Web Vitals, ciclo de vida de Chart.js y accesibilidad WCAG 2.1 AA.
9. `DEAD_CODE_REPORT.md`: Clasificación de archivos huérfanos (`'`, `{mod.module_id}')`, `routes/web.php`, `auth.php`, `bootstrap.php`).
10. `FRONTEND_TEST_REPORT.md`: Resultados de la verificación sintáctica automatizada (56/56 PHP y 84/84 JS al 100%).
11. `DEBT_FRONTEND.md`: Registro estructurado de deuda técnica y hoja de ruta de modernización (Vite, AdminLTE 4).
12. `FRONTEND_CHANGELOG.md`: Bitácora histórica completa de los cambios introducidos.
13. `VALIDATION_AUDIT.md`: Informe final de la segunda auditoría con 17 escenarios operativos y evaluación funcional.

---

## [v1.1.1] — 2026-11-27 (Segunda Auditoría — Validación y Estabilización)

### 🔧 Correcciones y Fortalecimiento Funcional
- **ApiClient (`public/assets/js/core/apiClient.js`):**
  - Se agregaron `/security/context/` y `/auth/` a `isGlobalEndpoint`. Esto evita que la regla Fail-Closed bloquee la llamada inicial de arranque tras el login cuando `activeCompanyId` aún no ha sido seleccionado o persistido.
  - Se blindó la restauración de sesión en respuestas 401 en modo soporte: si `Storage.restoreFromImpersonation()` falla, se purga inmediatamente el almacenamiento y se redirige a `/saas-admin/login`.
- **Storage (`public/assets/js/storage/storage.js`):**
  - En `restoreFromImpersonation()`, se verifica que `backup.admin_access_token` exista y sea válido. En caso de fallo o excepción, se ejecuta `clear()` preventivo para garantizar que ningún token temporal quede huérfano en `localStorage`.
- **Formularios y Accesibilidad (`public/assets/js/core/utils.js`):**
  - En `setFormErrors()`, se escapa el nombre del campo con `CSS.escape(field)` protegido en bloque `try ... catch` para prevenir errores ante claves anidadas de DRF.
  - Se añadieron listeners automáticos `{ once: true }` para remover `.is-invalid` y `.invalid-feedback` tan pronto el usuario comience a escribir o modificar el campo erróneo.
  - Se inyectaron atributos `aria-invalid="true"` (con remoción en `clearFormErrors`), `aria-live="assertive"` y botón de descarte en el alert superior de `non_field_errors`.
- **Seguridad en Modo Soporte (`public/assets/js/core/security.js`):**
  - Se eliminó cualquier bypass de verificación de permisos basado en `Storage.isImpersonating()` en `hasPermission()`, `hasAction()` e `isModuleContracted()`. En modo soporte, se evalúan exclusivamente los permisos reales asignados al usuario en `Storage.getPermissions()`.
- **Batería de Pruebas Funcionales:**
  - Ejecución y aprobación de los 17 escenarios operativos requeridos mediante `test_17_scenarios.js` (100% de éxito).
