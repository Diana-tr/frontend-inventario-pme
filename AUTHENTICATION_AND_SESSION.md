# AUDITORÍA Y ARQUITECTURA DE AUTENTICACIÓN Y GESTIÓN DE SESIONES — ERP SAAS P.M.E.

**Versión:** 1.0.0  
**Fecha:** Noviembre 2026  
**Auditor:** Equipo de Seguridad de Aplicaciones y Arquitectura Frontend  
**Módulos Clave:** `apiClient.js`, `auth_service.js`, `auth_guard.js`, `session_manager.js`, `storage.js`, `security.js`, `login_controller.js`, `logout_controller.js`, `navbar_controller.js`

---

## 1. RESUMEN EJECUTIVO

El subsistema de autenticación y sesiones de **Inventario P.M.E.** ha sido auditado integralmente, abarcando tanto el portal ERP como el portal de administración SaaS Multi-Tenant.

### Estado Inicial vs Estado Reforzado
- **Mecanismo JWT**: Se validó el cumplimiento estricto con Django REST Framework SimpleJWT. El access token se transmite en cabeceras `Authorization: Bearer <token>`, mientras que el refresh token se utiliza exclusivamente en el payload JSON de `/api/v1/auth/refresh/` y `/api/v1/auth/logout/`.
- **Condición de Carrera en Refresh (Single-Flight Promise)**: `ApiClient.js` implementa `ensureTokenRefresh()` mediante una promesa única compartida (`refreshPromise`), garantizando que ráfagas simultáneas de peticiones con 401 reutilicen la misma solicitud de renovación sin saturar al backend ni provocar revocaciones de token por rotación concurrente.
- **Prevención de Bucles Infinitos**: El método `request()` de `ApiClient` exige `retry = true` de entrada y lo apaga (`retry = false`) al reintentar, impidiendo reintentos indefinidos si el refresh token expira o falla.
- **Resolución del Fallo de Impersonación / Soporte Técnico**: Se diagnosticó y corrigió la causa raíz por la cual entrar a una empresa como soporte técnico expulsaba al usuario al login. `SecurityManager` no reconocía el estado de impersonación, provocando que `AuthGuard` bloqueara las vistas por falta de permisos en el usuario suplantado. Además, `SessionManager` y `LogoutController` carecían de conciencia contextual para restaurar las credenciales originales del Superadmin.

---

## 2. ARQUITECTURA DEL CICLO DE VIDA DE AUTENTICACIÓN

```
                     +---------------------------------------+
                     |           USUARIO ENTRA AL            |
                     |       LOGIN (ERP o SaaS Admin)        |
                     +---------------------------------------+
                                         |
                                         v
                         Credenciales (email, password)
                                         |
                                         v
                     +---------------------------------------+
                     | POST /api/v1/auth/login/              |
                     | Backend DRF responde:                 |
                     | { access_token, refresh_token, user } |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     | AuthService.login()                   |
                     | 1. Limpieza preventiva total previa    |
                     | 2. Persistencia en Storage            |
                     | 3. Carga de contexto de seguridad     |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     | Redirección contextual a:             |
                     | - ERP: /dashboard                     |
                     | - SaaS: /saas-admin/dashboard         |
                     +---------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| DURANTE LA SESIÓN ACTIVA                                                          |
| 1. SessionManager: Monitoreo de inactividad 30 minutos (reset con mouse/teclas).   |
| 2. Cross-Tab Sync: window.onstorage escucha logout o cambio de empresa.           |
| 3. ApiClient:                                                                     |
|    - Inyecta Authorization: Bearer <access_token>                                 |
|    - Inyecta X-Company-ID: <active_company_id> (excepto en SaaS Admin)            |
|    - Si recibe HTTP 401:                                                          |
|         a) Invoca ensureTokenRefresh() (promesa compartida)                       |
|         b) Si renueva -> Reintenta la petición original con retry = false         |
|         c) Si falla refresh -> Si está en soporte, restaura admin; sino limpia    |
|            Storage y redirige al login correspondiente                            |
|    - Si recibe HTTP 403: Despacha evento security_forbidden (refresca permisos)   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| CIERRE DE SESIÓN (Logout / Expiración / Timeout)                                 |
| 1. LogoutController / SessionManager invoca AuthService.logout()                  |
| 2. Envía POST /api/v1/auth/logout/ con { refresh: refreshToken }                  |
| 3. Backend ejecuta token.blacklist() (RFC 7009)                                   |
| 4. Frontend ejecuta Storage.clear() (localStorage y sessionStorage)               |
| 5. Redirección limpia al login contextual correspondiente                         |
+-----------------------------------------------------------------------------------+
```

---

## 3. AUDITORÍA DETALLADA POR FLUJO

### 3.1 Flujo de Login
- **ERP (`auth/login.php` & `login_controller.js`)**:
  - Validaciones locales: formato de correo, campo contraseña obligatorio.
  - Bloqueo de doble envío mediante variable booleana `isSubmitting` y deshabilitación visual del botón `submitButton.disabled = true`.
  - Tratamiento contextual de errores HTTP:
    - 400: Errores de validación devueltos por el backend.
    - 401: Credenciales incorrectas.
    - 429: Rate limit excedido (aviso para esperar antes de reintentar).
    - 500/502/503: Mensajes amigables sin exponer detalles del servidor.
    - 0: Error de red o falta de conectividad.
  - Redirección directa y segura a `/dashboard` sin parámetros URL de redirección no validados (inmune a Open Redirect).
- **SaaS Admin (`saas_admin/login.php` & `saas_admin/login_controller.js`)**:
  - Formulario oscuro corporativo exclusivo para personal interno.
  - Validación de roles administrativos: si las credenciales son válidas pero el usuario no tiene `is_superuser` ni `is_staff`, se revoca el acceso de inmediato y se informa al usuario.

### 3.2 Flujo de Renovación de Token (JWT Refresh)
- **Ruta de la API**: `POST /api/v1/auth/refresh/`.
- **Payload**: `{"refresh": "<refresh_token>"}`.
- **Respuesta esperada**: `ApiResponse.success(data={"access": "...", "refresh": "..."})`.
- **Control de Concurrencia**:
  - `ApiClient` utiliza `let refreshPromise = null;`.
  - Si 5 peticiones simultáneas reciben 401, las 5 esperan la resolución de la misma promesa `ensureTokenRefresh()`.
  - Si la renovación tiene éxito, las 5 peticiones reintentan con el nuevo token sin regenerar 5 tokens distintos en el backend.
- **Gestión de Fallo de Refresh**:
  - Si el refresh token expiró (ej. inactividad prolongada) o fue incluido en la blacklist, el backend retorna 401.
  - El frontend aborta la cola, ejecuta `Storage.clear()`, detiene el monitor de inactividad y redirige al login contextual.

### 3.3 Flujo de Cierre de Sesión (Logout)
- **Ruta de la API**: `POST /api/v1/auth/logout/`.
- **Payload**: `{"refresh": "<refresh_token>"}`.
- **Resiliencia (Fail-Safe Cleanup)**:
  - Si la llamada de red al backend falla (error 500, servidor caído o falta de conexión), el bloque `finally` de `LogoutController` y `SessionManager` garantiza la ejecución de:
    ```javascript
    Storage.clear();
    sessionStorage.clear();
    window.location.replace(targetLogin);
    ```
  - Esto asegura que un fallo del servidor nunca deje tokens huérfanos o sesiones residuales en el navegador del usuario.

### 3.4 Protección de Rutas (Fail-Closed)
- **`AuthGuard.js`**:
  - `requireAuth(context)`: Sin token ni usuario válido, redirige al login correspondiente.
  - `requireGuest()`: Si un usuario con sesión válida intenta cargar `/login`, se le redirige a `/dashboard`.
  - `requireSaaSAdmin()`: Bloquea a cualquier usuario que no sea `is_superuser` o `is_staff`, redirigiéndolo a su panel ERP seguro.
  - `requirePermission()`: Si el usuario carece del permiso del backend requerido por la vista, bloquea el acceso y redirige al inicio.

---

## 4. HALLAZGOS Y HARDENING APLICADO

### HALLAZGO 1: Fallo de Sesión al Ingresar como Soporte Técnico (Impersonación)
- **Problema**: Al presionar "Iniciar Soporte Técnico" desde la ficha de una empresa en SaaS Admin, el sistema generaba el token temporal y redirigía a `/dashboard`, pero allí el usuario era inmediatamente expulsado al login.
- **Causa Raíz**:
  1. `SecurityManager.hasPermission()` y `hasAction()` no contemplaban el estado `Storage.isImpersonating()`. Como el usuario impersonado no tenía roles cargados en el localStorage del Superadmin, la verificación de rutas de `App.js` denegaba el acceso por permisos.
  2. `SessionManager.forceLogout()` y `ApiClient` no sincronizaban la redirección contextual al salir de soporte.
- **Corrección Aplicada**:
  1. Actualización de `SecurityManager`: inclusión de `Storage.isImpersonating()` para conceder acceso de supervisión y soporte técnico en las rutas del ERP sin ser bloqueado.
  2. Creación en `navbar_controller.js` de un indicador visible de "Modo Soporte Técnico Activo" con botón para "Finalizar Soporte" y restaurar la sesión administrativa con un clic.
  3. Soporte en `LogoutController` para detectar impersonación y restaurar las credenciales del Superadmin en lugar de destruirlas.

### HALLAZGO 2: Redirección Errónea por Timeout de Inactividad en SaaS Admin
- **Problema**: `SessionManager.forceLogout()` redirigía estáticamente a `Config.LOGIN_PATH` (`/`), enviando a los administradores del SaaS al formulario de clientes del ERP.
- **Corrección Aplicada**: Redirección contextual dinámica: si la ruta actual pertenece a `saas-admin`, redirige a `/saas-admin/login`; si pertenece al ERP, redirige a `/login`.
