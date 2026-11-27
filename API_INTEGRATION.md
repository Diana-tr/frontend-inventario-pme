# Integración con Django REST Framework (DRF) — Frontend ERP SaaS P.M.E.

## 1. Arquitectura de Integración y Principio de Fuente de Verdad

En el ERP SaaS P.M.E., el backend (DRF v1.15.2) constituye la **única fuente de verdad** para:
- Autenticación y ciclo de vida de tokens JWT.
- Autorización granular (permisos, módulos contratados y roles).
- Validaciones de negocio e integridad relacional.
- Aislamiento multi-tenant a través de empresas activas.

El frontend actúa como cliente desacoplado, comunicándose exclusivamente vía JSON sobre HTTPS/HTTP mediante un cliente centralizado (`ApiClient`).

```
[ Vista / UI ] ──> [ Controller ] ──> [ Service ] ──> [ ApiClient ] ──(HTTP JSON + Bearer + X-Company-ID)──> [ DRF Backend ]
```

---

## 2. Envoltorio Estándar de Respuesta (Envelope Pattern)

Todas las respuestas consumidas por el cliente HTTP se normalizan siguiendo el estándar del backend (`ApiResponse.success` y `custom_exception_handler`):

```json
{
  "ok": true,
  "status": 200,
  "success": true,
  "code": "SUCCESS",
  "message": "Operación completada exitosamente.",
  "data": { ... },
  "errors": null,
  "pagination": {
    "count": 120,
    "next": "http://api.pme.local/api/v1/products/?page=2",
    "previous": null,
    "page_size": 25
  }
}
```

### Respuesta de Error

```json
{
  "ok": false,
  "status": 400,
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Los datos enviados contienen errores de validación.",
  "data": null,
  "errors": {
    "sku": ["Ya existe un producto con este SKU en la empresa activa."],
    "price": ["El precio debe ser un número positivo."],
    "non_field_errors": ["La combinación de almacén y lote no es válida."]
  }
}
```

---

## 3. Catálogo de Errores HTTP y Códigos de Negocio Normalizados

El módulo `public/assets/js/core/apiClient.js` integra `HTTP_ERROR_CATALOG`, garantizando que ante caídas del backend, respuestas de proxies (Nginx/Apache) o microservicios que no devuelvan JSON estructurado, la aplicación siempre reciba una respuesta homogénea:

| HTTP Status | Código de Negocio | Mensaje Predeterminado | Comportamiento Frontend |
| :--- | :--- | :--- | :--- |
| **0 / Network** | `NETWORK_ERROR` | Error de conexión con el servidor. Verifique su red. | Notificación de error de red / modo offline. |
| **400** | `VALIDATION_ERROR` | Los datos enviados contienen errores de validación. | Mapeo visual a campos mediante `Utils.setFormErrors`. |
| **401** | `AUTHENTICATION_REQUIRED` | Su sesión ha expirado o no está autenticado. | Activación de cola atómica `ensureTokenRefresh()`. Si falla, redirección contextual a login. |
| **403** | `PERMISSION_DENIED` | No cuenta con los permisos necesarios para realizar esta acción. | Emisión de evento `security_forbidden`; bloqueo de acción sin desloguear. |
| **404** | `RESOURCE_NOT_FOUND` | El recurso solicitado no fue encontrado en el servidor. | Alerta "Registro no encontrado"; retorno seguro al listado. |
| **405** | `METHOD_NOT_ALLOWED` | El método HTTP no está permitido para este recurso. | Error de desarrollo / contrato de endpoint. |
| **408 / Timeout** | `GATEWAY_TIMEOUT` | Tiempo de espera agotado al conectar con el servidor. | Aborto automático (30s) y desbloqueo de botones de envío. |
| **409** | `CONFLICT` | Conflicto con el estado actual del recurso. | Alerta SweetAlert informando duplicidad de registros. |
| **413** | `PAYLOAD_TOO_LARGE` | El tamaño del archivo o contenido excede el límite permitido. | Validación previa de archivos adjuntos (logos, facturas). |
| **415** | `UNSUPPORTED_MEDIA_TYPE` | El formato de datos enviado no es compatible. | Verificación de encabezados `Content-Type`. |
| **422** | `UNPROCESSABLE_ENTITY` | La solicitud contiene parámetros que no pudieron ser procesados. | Notificación de regla de negocio no satisfecha. |
| **429** | `RATE_LIMIT_EXCEEDED` | Ha excedido el límite de solicitudes. Por favor espere. | Notificación de rate-limiting (Throttling en DRF). |
| **500** | `INTERNAL_SERVER_ERROR` | Ocurrió un error interno en el servidor. Intente más tarde. | Notificación de soporte; captura de correlación si existe. |
| **502** | `BAD_GATEWAY` | El servicio intermedio no está disponible temporalmente. | Alerta de mantenimiento de infraestructura. |
| **503** | `SERVICE_UNAVAILABLE` | El servicio se encuentra temporalmente fuera de línea. | Notificación de indisponibilidad temporal. |
| **504** | `GATEWAY_TIMEOUT` | El servidor demoró demasiado en responder. | Timeout en proxy inverso o base de datos bloqueada. |

---

## 4. Mapeo Exhaustivo de Endpoints por Servicio Frontend

El frontend organiza sus comunicaciones a través de 21 servicios especializados ubicados en `public/assets/js/services/`:

| Servicio | Endpoints Consumidos | Métodos | Autenticación | Tenant Header (`X-Company-ID`) |
| :--- | :--- | :--- | :--- | :--- |
| `auth_service.js` | `/api/v1/auth/login/`<br>`/api/v1/auth/logout/`<br>`/api/v1/auth/me/`<br>`/api/v1/security/context/` | POST<br>POST<br>GET<br>GET | Pública<br>Bearer<br>Bearer<br>Bearer | No<br>No<br>No<br>**Sí (Opcional/Dinámico)** |
| `caja_service.js` | `/api/v1/cash-sessions/`<br>`/api/v1/cash-registers/` | GET, POST, PUT, DELETE | Bearer | **Requerido** |
| `categoria_service.js` | `/api/v1/categories/` | GET, POST, PUT, DELETE | Bearer | **Requerido** |
| `cliente_service.js` | `/api/v1/customers/` | GET, POST, PUT, DELETE | Bearer | **Requerido** |
| `company_info_service.js` | `/api/v1/company-info/` | GET, PUT, PATCH | Bearer | **Requerido** |
| `compra_service.js` | `/api/v1/purchases/`<br>`/api/v1/invoices/` | GET, POST, PUT, DELETE | Bearer | **Requerido** |
| `finanzas_service.js` | `/api/v1/finance/` | GET, POST | Bearer | **Requerido** |
| `inventario_service.js` | `/api/v1/inventory/`<br>`/api/v1/inventory-movements/` | GET, POST, PUT | Bearer | **Requerido** |
| `invoice_template_service.js` | `/api/v1/invoice-templates/` | GET, POST, PUT | Bearer | **Requerido** |
| `notification_feed_service.js` | `/api/v1/notifications/` | GET, PATCH | Bearer | **Requerido** |
| `producto_service.js` | `/api/v1/products/` | GET, POST, PUT, DELETE | Bearer | **Requerido** |
| `proveedor_service.js` | `/api/v1/suppliers/` | GET, POST, PUT, DELETE | Bearer | **Requerido** |
| `role_service.js` | `/api/v1/roles/`<br>`/api/v1/security/permissions/` | GET, POST, PUT, DELETE | Bearer | **Requerido** |
| `saas_admin_service.js` | `/api/v1/saas-admin/tenants/` | GET, POST, PUT, PATCH | Bearer (Superadmin) | **Excluido** |
| `saas_audit_service.js` | `/api/v1/saas-admin/audit/` | GET | Bearer (Superadmin) | **Excluido** |
| `saas_plan_service.js` | `/api/v1/saas-admin/plans/`<br>`/api/v1/saas-admin/subscriptions/`<br>`/api/v1/saas-admin/tenants/` | GET, POST, PUT, PATCH | Bearer (Superadmin) | **Excluido** |
| `saas_team_service.js` | `/api/v1/saas-admin/team/` | GET, POST, PUT, DELETE | Bearer (Superadmin) | **Excluido** |
| `saas_version_service.js` | `/api/v1/versions/` | GET | Bearer / Pública | **Excluido** |
| `system_service.js` | `/api/v1/system/`<br>`/api/v1/versions/` | GET | Bearer / Pública | **Excluido** |
| `usuario_service.js` | `/api/v1/users/` | GET, POST, PUT, DELETE | Bearer | **Requerido** |
| `venta_service.js` | `/api/v1/sales/`<br>`/api/v1/invoices/` | GET, POST, PUT, DELETE | Bearer | **Requerido** |

---

## 5. Control de Tiempos y Abortos (`AbortController`)

Cada solicitud realizada mediante `ApiClient` está protegida contra cuelgues indefinidos de la conexión:
- **Timeout por defecto:** 30.000 ms (30 segundos), configurable globalmente mediante `Config.REQUEST_TIMEOUT`.
- **AbortSignal nativo:** Si el controlador pasa un `signal` explícito (por ejemplo, para cancelar una búsqueda en curso cuando el usuario continúa escribiendo o cambia de pestaña), `ApiClient` respeta dicho signal.
- **Limpieza de timers:** El `timeoutId` se libera estrictamente en el bloque `finally` para evitar fugas de memoria en SPA.
- **Normalización de código:** Si la petición es abortada por timeout, `ApiClient` devuelve `{ status: 408, code: "GATEWAY_TIMEOUT" }`, permitiendo a los controladores diferenciar un fallo de red general de un timeout.

---

## 6. Mapeo Automático de Errores DRF a Formularios

Para eliminar código duplicado en los controladores de interfaz, `Utils` proporciona dos funciones especializadas:

### `Utils.clearFormErrors(formElement)`
- Elimina todas las clases `.is-invalid` de `input`, `select` y `textarea`.
- Destruye elementos dinámicos `.invalid-feedback.dynamic-feedback`.
- Elimina alertas previas de errores globales `.form-non-field-errors`.

### `Utils.setFormErrors(formElement, errors)`
- Acepta la propiedad `response.errors` devuelta por DRF.
- **Errores por campo:** Localiza los campos por atributo `name` o `id`, aplica la clase `.is-invalid` de Bootstrap 4 y adjunta un elemento `.invalid-feedback` con el texto exacto devuelto por los validadores del backend. Maneja de forma inteligente inputs dentro de `.input-group`.
- **Errores no asociados a campos (`non_field_errors`, `detail`):** Genera un alert Bootstrap (`.alert.alert-danger`) visible en la parte superior del formulario con lista de viñetas.
- Devuelve `{ nonFieldErrors: string[], hasErrors: boolean }`.

Ejemplo de uso en un controlador:

```javascript
const response = await ProductoService.create(formData);
if (!response.ok) {
  if (response.status === 400 && response.errors) {
    Utils.setFormErrors(formElement, response.errors);
  } else {
    NotificationService.error(response.message);
  }
  return;
}
NotificationService.success("Producto creado exitosamente");
```
