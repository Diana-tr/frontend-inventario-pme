# ARQUITECTURA DEL FRONTEND — ERP SAAS P.M.E.

**Versión del Documento:** 1.0.0  
**Fecha de Auditoría:** Noviembre 2026  
**Backend Objetivo:** Backend P.M.E. v1.15.2 (Django REST Framework 6.0 / SimpleJWT / PostgreSQL / Multi-Tenant)  
**Alcance:** Exclusivo Frontend (`f:\XAMPP\htdocs\frontend-inventario-pme`)

---

## 1. RESUMEN EJECUTIVO Y MODELO ARQUITECTÓNICO

El frontend de **Inventario P.M.E.** es una aplicación web empresarial híbrida compuesta por:
1. Una capa de servidor ligero en **PHP 8.x** que actúa como Front Controller y orquestador de plantillas/vistas HTML semánticas bajo AdminLTE 3.2.0 y Bootstrap 4.6.
2. Una Single/Multi-Page Application cliente basada en **JavaScript Vanilla ES6+ modular** con arquitectura desacoplada por capas:
   - **Vistas (PHP)**: Renderizado del DOM base, esqueletos, modales y layouts.
   - **Controladores (JS)**: Gestión de eventos de usuario, manipulación del DOM, validaciones visuales y enlace con servicios.
   - **Servicios (JS)**: Capa de abstracción de negocio de cliente que encapsula endpoints de la API REST.
   - **Cliente HTTP Centralizado (`ApiClient.js`)**: Transporte HTTP seguro con fetch, inyección automática de cabeceras (`Authorization: Bearer <token>`, `X-Company-ID: <tenant_id>`), control de refresco JWT de vuelo único (single-flight promise), timeout por AbortController y normalización de errores.
   - **Seguridad y Estado (`AuthGuard.js`, `SecurityManager.js`, `SessionManager.js`, `Storage.js`)**: Control de acceso granular, temporizador de inactividad, sincronización multi-pestaña y persistencia en almacenamiento seguro del cliente.

```
+-----------------------------------------------------------------------------------+
|                                  NAVEGADOR WEB                                    |
+-----------------------------------------------------------------------------------+
|  PHP Front Controller (index.php) -> Layouts & Views (AdminLTE 3.2 + Bootstrap 4) |
|                                                                                   |
|  [Vistas HTML / Modales]                                                          |
|         |                                                                         |
|         v (Eventos DOM & Lifecycle)                                               |
|  [Controladores JS por Módulo] (usuarios, ventas, compras, caja, saas-admin...)   |
|         |                                                                         |
|         v (Llamadas funcionales asíncronas)                                       |
|  [Servicios JS] (usuario_service, venta_service, auth_service...)                 |
|         |                                                                         |
|         v (get, post, put, patch, delete)                                         |
|  [ApiClient.js Centralizado]                                                      |
|    - Inyección JWT (Bearer <access_token>)                                        |
|    - Inyección Tenant (X-Company-ID: <active_company_id>)                         |
|    - Renovación de token atómica (/api/v1/auth/refresh/)                          |
|    - Timeout con AbortController (30s)                                            |
|    - Normalización de respuestas y errores HTTP                                   |
+-----------------------------------------------------------------------------------+
                                          |
                         HTTP / HTTPS (JSON REST API)
                                          v
+-----------------------------------------------------------------------------------+
|                        BACKEND P.M.E. v1.15.2 (DRF)                               |
|  Endpoints: /api/v1/auth/*, /api/v1/users/*, /api/v1/customers/*, etc.            |
|  Envoltorio Estándar: ApiResponse { success, code, message, data, errors }        |
|  Manejador de Excepciones: CustomExceptionHandler (DRF + Django + Negocio)        |
+-----------------------------------------------------------------------------------+
```

---

## 2. COMPONENTES Y CAPAS DEL SISTEMA

### 2.1 Capa de Entrada y Enrutamiento (PHP)
- **`index.php` (Front Controller)**:
  - Resuelve la URI de la petición mediante `$_SERVER['REQUEST_URI']`.
  - Normaliza `$base_path` para soportar despliegues locales (`/frontend-inventario-pme`) y entornos de producción en raíz de dominio.
  - Enruta mediante un `switch-case` a los módulos en `app/views/{modulo}/{accion}.php`.
  - Incluye fallback 404 estricto y protección de recursos estáticos bajo `/public/`.
- **`saas-admin/index.php` & `saas-admin/login.php`**:
  - Puntos de entrada secundarios de compatibilidad que reescriben `REQUEST_URI` y delegan en `index.php`.
- **`app/config/app.php`**:
  - Detección de host (`localhost`, `127.0.0.1` vs producción) y definición de la constante `$URL`.

### 2.2 Capa de Núcleo (Core JS)
1. **`ApiClient.js`**:
   - Patrón IIFE con `Object.freeze`.
   - Single-flight promise (`ensureTokenRefresh`) para evitar condiciones de carrera cuando múltiples peticiones 401 ocurren simultáneamente.
   - Detección contextual: excluye cabeceras de autorización en endpoints públicos (`/auth/login/`, `/auth/refresh/`) y omite `X-Company-ID` en el contexto administrativo SaaS (`/saas-admin/`).
   - Manejo centralizado de 403 Forbidden emitiendo un evento global `security_forbidden` para refrescar contexto sin desloguear al usuario.
2. **`App.js`**:
   - Orquestador del ciclo de vida de la aplicación frontend.
   - Ejecuta `App.bootstrap()` de forma idempotente (reutiliza `bootstrapPromise`).
   - Integra `AuthGuard`, `SecurityManager`, `SidebarController` y `VersionController`.
   - Valida rutas contra el mapa `ROUTE_PERMISSIONS` y contra módulos contratados (`ROUTE_TO_MODULE`).
3. **`AuthGuard.js`**:
   - Estrategia Fail-Closed: impide renderizar contenido no autorizado.
   - Distingue contexto ERP vs contexto SaaS Admin (`isSaaSContext`).
   - Rutas restringidas a superusuarios (`SUPERUSER_ONLY_ROUTES`).
4. **`SecurityManager.js`**:
   - Procesa permisos y acciones granulares sincronizadas desde el backend.
   - Método `processDomPermissions()` escanea el DOM buscando elementos con `data-permission`, `data-action`, `data-module` y `data-role` para mostrar/ocultar elementos según las credenciales del usuario.
5. **`SessionManager.js`**:
   - Control de inactividad de 30 minutos (`SESSION_IDLE_TIMEOUT = 1800000`).
   - Throttling de 5 segundos en detectores de actividad (`mousemove`, `keydown`, `touchstart`, `scroll`).
   - Sincronización multi-pestaña mediante `window.addEventListener("storage", ...)`.
6. **`Storage.js`**:
   - Encapsula `localStorage` con claves prefijadas (`inventariopme_*`).
   - Almacena tokens, usuario, roles, permisos efectivos, acciones granulares, módulos contratados y empresa activa.
   - Soporte para impersonación de soporte técnico (`impersonateCompany`, `restoreFromImpersonation`).
7. **`NotificationService.js`**:
   - Abstracción de SweetAlert2 y Toast de Bootstrap/AdminLTE para alertas modales, confirmaciones de eliminación, toasts de éxito y diálogos de error.

---

## 3. INTEGRACIÓN CON EL BACKEND P.M.E. v1.15.2

### 3.1 Contrato de Respuestas
El backend utiliza la clase `ApiResponse` y el manejador global `custom_exception_handler`, con el siguiente formato inmutable:
- **Respuesta Exitosa**:
  ```json
  {
    "success": true,
    "code": "SUCCESS",
    "message": "Operación realizada correctamente.",
    "data": { ... },
    "errors": null
  }
  ```
- **Respuesta de Error**:
  ```json
  {
    "success": false,
    "code": "VALIDATION_ERROR | AUTHENTICATION_FAILED | PERMISSION_DENIED | NOT_FOUND | ERROR",
    "message": "Mensaje descriptivo del error.",
    "data": null,
    "errors": { "campo": ["descripción"] } | ["error general"] | null
  }
  ```
- **Paginación (`CustomPagination`)**:
  ```json
  {
    "success": true,
    "code": "SUCCESS",
    "message": "Datos obtenidos correctamente.",
    "data": {
      "count": 100,
      "next": "http://api/?page=2",
      "previous": null,
      "page": 1,
      "total_pages": 10,
      "page_size": 10,
      "results": [ ... ]
    },
    "errors": null
  }
  ```

### 3.2 Multi-Tenant y Tenant Header
- El backend identifica la empresa activa mediante la cabecera HTTP:
  `X-Company-ID: <id_company>`
- El frontend la inyecta automáticamente en `ApiClient.js` extrayéndola de `Storage.getActiveCompanyId()`.
- Se suspende de forma estricta en endpoints de SaaS Admin para evitar contaminación cruzada entre tenants.

---

## 4. DEBILIDADES ARQUITECTÓNICAS IDENTIFICADAS

1. **Exposición de Errores PHP en Vistas**:
   - Vistas individuales inician con `ini_set('display_errors', 1); error_reporting(E_ALL);`. En producción esto expone rutas del servidor, variables de entorno y trazas.
2. **Doble Invocación de `App.bootstrap()`**:
   - `footer.php` ejecuta `await App.bootstrap();` y las vistas individuales también ejecutan `await App.bootstrap();`. Aunque `App.js` implementa idempotencia básica, genera redundancia y acoplamiento innecesario.
3. **Inconsistencia de Versionado de Scripts (Cache-Busting)**:
   - Algunas vistas cargan módulos con `?v=<?php echo time(); ?>`, otras con `?v=1.1`, y la mayoría sin query string, lo que impide un aprovechamiento predecible de la caché del navegador.
4. **Instancias de Gráficos en Ámbito Global**:
   - En `dashboard.js`, los gráficos Chart.js se asignan a `window.myBarChartInstance`, etc., en lugar de encapsularse en variables privadas del módulo.
5. **Código Huérfano en `routes/web.php`**:
   - Existe un archivo `routes/web.php` que utiliza una variable inexistente `$router`, sin ser requerido por ninguna parte del sistema.
6. **Archivos PHP Vacíos**:
   - `app/helpers/auth.php` y `app/views/bootstrap.php` tienen 0 bytes y no son consumidos.
