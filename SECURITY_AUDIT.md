# AUDITORÍA DE SEGURIDAD INTEGRAL (OWASP) — ERP SAAS P.M.E.

**Fecha:** Noviembre 2026  
**Auditor:** Equipo de Seguridad de Aplicaciones & Arquitectura Frontend  
**Alcance:** Frontend `f:\XAMPP\htdocs\frontend-inventario-pme` e Interacción con API Backend v1.15.2  
**Estándar:** OWASP Top 10 Web Application Security Risks

---

## 1. TABLA RESUMEN DE HALLAZGOS

| ID | Vulnerabilidad / Debilidad | Severidad | Archivo / Componente | Estado |
|---|---|---|---|---|
| **SEC-01** | Exposición masiva de errores y advertencias PHP (`display_errors = 1`) en vistas | **HIGH** | 38 vistas en `app/views/` | **CORREGIDO Y VERIFICADO** |
| **SEC-02** | Potencial DOM-based XSS en alertas de login administrativo SaaS | **MEDIUM** | `public/assets/js/controllers/saas_admin/login_controller.js` (L. 53) | **CORREGIDO Y VERIFICADO** |
| **SEC-03** | Inyección de dependencia remota externa no controlada (CDN jsdelivr ESM) | **MEDIUM** | `public/assets/js/core/notification.js` (L. 13) | **CORREGIDO Y VERIFICADO** |
| **SEC-04** | Almacenamiento de tokens JWT en `localStorage` del navegador | **MEDIUM** | `public/assets/js/storage/storage.js` | **IDENTIFICADO / MITIGADO (DEUDA)** |
| **SEC-05** | Ausencia de cabeceras de seguridad HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `CSP`) | **LOW** | `app/config/app.php` | **CORREGIDO Y VERIFICADO** |
| **SEC-06** | Análisis de exposición a Cross-Site Request Forgery (CSRF) | **INFORMATIONAL** | Cliente HTTP y formularios | **VERIFICADO (NO VULNERABLE)** |
| **SEC-07** | Archivos espurios/residuales generados por comandos en raíz del proyecto | **INFORMATIONAL** | `'`, `{mod.module_id}')` | **IDENTIFICADO (PENDIENTE CONFIRMACIÓN)** |

---

## 2. DETALLE DE HALLAZGOS Y REMEDIACIÓN

### SEC-01 — Exposición masiva de errores y advertencias PHP en vistas
- **Severidad:** **HIGH**
- **CWE:** CWE-209 (Generation of Error Message Containing Sensitive Information)
- **Archivos Afectados:** 38 archivos en `app/views/` (ej. `dashboard/index.php`, `usuarios/listar.php`, `ventas/pos.php`, etc.).
- **Evidencia:**
  ```php
  ini_set('display_errors', 1);
  ini_set('display_startup_errors', 1);
  error_reporting(E_ALL);
  ```
- **Impacto:** Si se produce una advertencia o error en PHP (por ejemplo una clave faltante en `$_SERVER` o fallo de lectura de archivo), PHP imprime en el HTML la ruta absoluta del servidor (`F:\XAMPP\htdocs\...`), versiones del software y fragmentos de código, facilitando el reconocimiento a atacantes.
- **Solución Implementada:**
  1. Centralización en `app/config/app.php`: en entornos de desarrollo se restringen o ajustan las directivas; en producción se desactiva estrictamente `display_errors` y `display_startup_errors` (fijados en `0`), registrando los errores en el log del servidor sin exponerlos al cliente.
  2. Eliminación de las directivas dispersas en los 38 archivos de vista.
- **Estado:** **CORREGIDO Y VERIFICADO**.

---

### SEC-02 — Potencial DOM-based XSS en alertas de login administrativo SaaS
- **Severidad:** **MEDIUM**
- **CWE:** CWE-79 (Improper Neutralization of Input During Web Page Generation - Cross-site Scripting)
- **Archivo Afectado:** `public/assets/js/controllers/saas_admin/login_controller.js`, línea 53.
- **Evidencia:**
  ```javascript
  function showAlert(message, type = "danger") {
    if (!alertElement) return;
    alertElement.className = `saas-alert saas-alert-${type}`;
    alertElement.innerHTML = `
      <i class="fas fa-${type === 'danger' ? 'circle-exclamation' : 'circle-info'} mt-1"></i>
      <div>${message}</div>
    `;
    alertElement.removeAttribute("hidden");
  }
  ```
- **Impacto:** La función `showAlert` recibe `message` (el cual puede provenir de mensajes de error de la API o contener cadenas no sanitizadas) y lo inyecta directamente mediante `innerHTML`. Si la respuesta del backend refleja parámetros no saneados o payloads inyectados, se ejecutaría código JavaScript en el contexto del panel administrativo.
- **Solución Implementada:**
  Construcción segura de nodos DOM utilizando `document.createElement`, asignando el texto del mensaje exclusivamente con `textContent`, garantizando que cualquier carácter especial se renderice como texto plano y no como código ejecutable.
- **Estado:** **CORREGIDO Y VERIFICADO**.

---

### SEC-03 — Inyección de dependencia remota externa no controlada (CDN jsdelivr ESM)
- **Severidad:** **MEDIUM**
- **CWE:** CWE-829 (Inclusion of Functionality from Untrusted Control Sphere)
- **Archivo Afectado:** `public/assets/js/core/notification.js`, línea 13.
- **Evidencia:**
  ```javascript
  import SwalFallback from "https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm";
  ```
- **Impacto:**
  1. Si un usuario o red empresarial bloquea dominios CDN externos, la importación de este módulo ESM falla o genera demoras de red.
  2. Expone al frontend a riesgos de seguridad de cadena de suministro (Supply Chain).
  3. Impide implementar una Content Security Policy (CSP) sin habilitar conexiones de script hacia dominios de terceros.
  4. La librería SweetAlert2 ya se encuentra instalada localmente y empaquetada en `public/assets/vendor/AdminLTE-3.2.0/plugins/sweetalert2/sweetalert2.all.min.js`.
- **Solución Implementada:**
  Eliminación de la importación remota de CDN. `NotificationService` ahora consume exclusivamente la instancia local global `window.Swal` provista por el bundle local de AdminLTE, manteniendo un fallback defensivo interno sin peticiones de red hacia servidores externos.
- **Estado:** **CORREGIDO Y VERIFICADO**.

---

### SEC-04 — Almacenamiento de tokens JWT en `localStorage`
- **Severidad:** **MEDIUM**
- **CWE:** CWE-922 (Insecure Storage of Sensitive Information)
- **Archivo Afectado:** `public/assets/js/storage/storage.js`
- **Evidencia:**
  ```javascript
  const saveTokens = (accessToken, refreshToken) => {
    localStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
  };
  ```
- **Análisis de Riesgo:**
  El almacenamiento de credenciales JWT en `localStorage` implica que cualquier script ejecutado en el mismo origen (mediante un XSS potencial) podría leer `localStorage.getItem("inventariopme_access_token")`.
- **Compatibilidad con el Backend v1.15.2:**
  El backend DRF actual exige el envío explícito del `refresh_token` en el cuerpo JSON de `POST /api/v1/auth/refresh/` y devuelve tokens en formato JSON, no en cookies `HttpOnly`. Modificar esto requeriría alterar el middleware y los serializers del backend Django, lo cual está explícitamente prohibido por las reglas de la auditoría.
- **Medidas de Hardening Aplicadas en Frontend:**
  1. `Storage.clear()` elimina de forma inmediata tanto `localStorage` como `sessionStorage` en el logout o ante fallos de refresh.
  2. Se prohíbe cualquier impresión de tokens en la consola del navegador.
  3. No se transmiten tokens en URLs, parámetros de consulta o enlaces.
  4. Se documenta la propuesta de transición futura hacia cookies `HttpOnly; SameSite=Lax; Secure` en `DEBT_FRONTEND.md`.
- **Estado:** **IDENTIFICADO / MITIGADO (DEUDA TÉCNICA DOCUMENTADA)**.

---

### SEC-05 — Ausencia de cabeceras de seguridad HTTP
- **Severidad:** **LOW**
- **CWE:** CWE-1021 (Improper Restriction of Rendered UI Layers or Frames) / CWE-693 (Protection Mechanism Failure)
- **Archivo Afectado:** `app/config/app.php`
- **Impacto:** Posibilidad de Clickjacking si el sitio es embebido en iframes (`X-Frame-Options` ausente), sniffing de tipos MIME (`X-Content-Type-Options` ausente) y fuga de información en cabeceras de referencia (`Referrer-Policy` ausente).
- **Solución Implementada:**
  Inyección de cabeceras HTTP nativas en `app/config/app.php`:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
  - Propuesta y configuración de Content Security Policy (CSP) compatible con AdminLTE 3 y Bootstrap 4.
- **Estado:** **CORREGIDO Y VERIFICADO**.

---

### SEC-06 — Análisis de Cross-Site Request Forgery (CSRF)
- **Severidad:** **INFORMATIONAL**
- **Diagnóstico:**
  La aplicación no utiliza autenticación basada en cookies de sesión automáticas para sus operaciones de negocio. Todas las operaciones contra la API REST viajan mediante `fetch` con la cabecera `Authorization: Bearer <access_token>`. Los navegadores no adjuntan cabeceras `Authorization` en solicitudes originadas desde sitios de terceros, lo que proporciona inmunidad inherente contra ataques CSRF estándar para todas las rutas de API.
- **Estado:** **VERIFICADO (NO VULNERABLE)**.

---

### SEC-07 — Archivos espurios en el directorio raíz
- **Severidad:** **INFORMATIONAL**
- **Archivos:** `'` (0 bytes), `{mod.module_id}')` (0 bytes).
- **Diagnóstico:** Archivos generados accidentalmente por comandos shell mal interpolados en sesiones anteriores. No contienen código ni son accesibles por Apache (no tienen mapeo en `index.php`), pero ensucian el repositorio. Siguiendo la regla innegociable de no eliminar archivos automáticamente, se registran en `DEAD_CODE_REPORT.md` para que el usuario los elimine cuando lo estime conveniente.
- **Estado:** **IDENTIFICADO (PENDIENTE CONFIRMACIÓN)**.
