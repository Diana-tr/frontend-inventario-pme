# MAPA DE DEPENDENCIAS Y RELACIONES — ERP SAAS P.M.E.

**Fecha de Generación:** Noviembre 2026  
**Auditor:** Equipo de Ingeniería Senior / Principal  
**Repositorio:** `f:\XAMPP\htdocs\frontend-inventario-pme`

---

## 1. FLUJO ARQUITECTÓNICO DE DEPENDENCIAS

```
+-----------------------------------------------------------------------------------+
| 1. VISTA PHP (ej: app/views/usuarios/listar.php)                                   |
|    - Carga layouts/head.php (CSS de AdminLTE 3.2, DataTables, Select2)            |
|    - Carga layouts/navbar.php y layouts/sidebar.php                               |
|    - Renderiza estructura HTML (tablas, formularios, modales)                     |
|    - Carga layouts/footer.php (jQuery, Bootstrap 4, DataTables JS, App.bootstrap) |
|    - Importa ES Module: UsuarioListController                                     |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 2. CONTROLADOR JS (ej: public/assets/js/controllers/usuario/listar.js)             |
|    - Importa: UsuarioService, DataTableHelper, NotificationService, Security      |
|    - Registra listeners en botones de acción (crear, editar, eliminar, exportar)  |
|    - Configura DataTable conectada a la API mediante UsuarioService               |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 3. SERVICIO DE NEGOCIO (ej: public/assets/js/services/usuario_service.js)          |
|    - Importa exclusivamente: ApiClient (core/apiClient.js)                        |
|    - Define endpoints: /api/v1/users/, /api/v1/users/{id}/, etc.                  |
|    - Realiza llamadas: ApiClient.get(), ApiClient.post(), ApiClient.patch()...    |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 4. CLIENTE HTTP CENTRALIZADO (public/assets/js/core/apiClient.js)                 |
|    - Importa: Storage (storage/storage.js), Config (config/config.js)             |
|    - Obtiene Access Token activo y lo adjunta en cabecera Authorization: Bearer   |
|    - Obtiene Tenant activo y lo adjunta en cabecera X-Company-ID                  |
|    - Si recibe HTTP 401: Invoca ensureTokenRefresh() contra /api/v1/auth/refresh/ |
|    - Si la renovación es exitosa, reintenta la petición original de forma atómica |
|    - Si recibe HTTP 403: Despacha evento security_forbidden                       |
|    - Retorna envelope unificado { ok, status, success, code, message, data, errors}|
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 5. BACKEND DRF (Backend P.M.E. v1.15.2 en http://127.0.0.1:8000 o Render HTTPS)   |
+-----------------------------------------------------------------------------------+
```

---

## 2. MATRIZ DE DEPENDENCIAS: VISTAS -> CONTROLADORES -> SERVICIOS -> ENDPOINTS

| Módulo / Vista PHP | Controlador JS Principal | Servicios Consumidos | Endpoints Backend Consumidos |
|---|---|---|---|
| `auth/login.php` | `controllers/auth/login_controller.js` | `auth_service.js` | `POST /api/v1/auth/login/`<br>`GET /api/v1/auth/me/`<br>`GET /api/v1/security/context/` |
| `layouts/footer.php` | `controllers/auth/logout_controller.js` | `auth_service.js` | `POST /api/v1/auth/logout/` |
| `layouts/sidebar.php` | `controllers/sidebar/sidebar_controller.js` | `auth_service.js`, `company_info_service.js` | `GET /api/v1/company-info/`<br>`GET /api/v1/security/context/` |
| `dashboard/index.php` | `controllers/dashboard/dashboard.js` | `caja_service.js`, `venta_service.js`, `compra_service.js`, `inventario_service.js` | `GET /api/v1/cash-sessions/`<br>`GET /api/v1/sales/`<br>`GET /api/v1/purchases/`<br>`GET /api/v1/inventory/` |
| `usuarios/listar.php` | `controllers/usuario/listar.js` | `usuario_service.js`, `role_service.js` | `GET /api/v1/users/`<br>`GET /api/v1/roles/`<br>`PATCH /api/v1/users/{id}/`<br>`DELETE /api/v1/users/{id}/` |
| `usuarios/crear.php` | `controllers/usuario/crear.js` | `usuario_service.js`, `role_service.js` | `POST /api/v1/users/`<br>`GET /api/v1/roles/` |
| `roles/listar.php` | `controllers/role/listar.js` | `role_service.js` | `GET /api/v1/roles/`<br>`PATCH /api/v1/roles/{id}/`<br>`DELETE /api/v1/roles/{id}/` |
| `roles/crear.php` | `controllers/role/crear.js` | `role_service.js` | `POST /api/v1/roles/` |
| `categorias/listar.php` | `controllers/categorias/listar.js` | `categoria_service.js` | `GET /api/v1/categories/`<br>`PATCH /api/v1/categories/{id}/`<br>`DELETE /api/v1/categories/{id}/` |
| `categorias/crear.php` | `controllers/categorias/crear.js` | `categoria_service.js` | `POST /api/v1/categories/` |
| `clientes/listar.php` | `controllers/cliente/listar.js` | `cliente_service.js` | `GET /api/v1/customers/`<br>`PATCH /api/v1/customers/{id}/`<br>`DELETE /api/v1/customers/{id}/` |
| `clientes/crear.php` | `controllers/cliente/crear.js` | `cliente_service.js` | `POST /api/v1/customers/` |
| `proveedores/listar.php` | `controllers/proveedor/listar.js` | `proveedor_service.js` | `GET /api/v1/suppliers/`<br>`PATCH /api/v1/suppliers/{id}/`<br>`DELETE /api/v1/suppliers/{id}/` |
| `proveedores/crear.php` | `controllers/proveedor/crear.js` | `proveedor_service.js` | `POST /api/v1/suppliers/` |
| `productos/listar.php` | `controllers/producto/listar.js` | `producto_service.js`, `categoria_service.js` | `GET /api/v1/products/`<br>`GET /api/v1/categories/`<br>`PATCH /api/v1/products/{id}/` |
| `productos/crear.php` | `controllers/producto/crear.js` | `producto_service.js`, `categoria_service.js` | `POST /api/v1/products/` |
| `inventario/listar.php` | `controllers/inventario/listar.js` | `inventario_service.js` | `GET /api/v1/inventory/` |
| `inventario/crear.php` | `controllers/inventario/crear.js` | `inventario_service.js`, `producto_service.js` | `POST /api/v1/inventory/` |
| `inventario/movimientos.php` | `controllers/inventario/movimientos.js` | `inventario_service.js` | `GET /api/v1/inventory-movements/` |
| `compras/listar.php` | `controllers/compra/listar.js` | `compra_service.js` | `GET /api/v1/purchases/` |
| `compras/crear.php` | `controllers/compra/crear.js` | `compra_service.js`, `proveedor_service.js`, `producto_service.js` | `POST /api/v1/purchases/` |
| `compras/facturas.php` | `controllers/compra/facturas.js` | `compra_service.js` | `GET /api/v1/purchases/{id}/invoice/` |
| `ventas/listar.php` | `controllers/venta/listar.js` | `venta_service.js` | `GET /api/v1/sales/` |
| `ventas/crear.php` | `controllers/venta/crear.js` | `venta_service.js`, `cliente_service.js`, `producto_service.js` | `POST /api/v1/sales/` |
| `ventas/pos.php` | `controllers/venta/pos.js` | `venta_service.js`, `caja_service.js`, `cliente_service.js` | `POST /api/v1/sales/`<br>`GET /api/v1/cash-sessions/active/` |
| `ventas/facturas.php` | `controllers/venta/facturas.js` | `venta_service.js` | `GET /api/v1/sales/{id}/invoice/` |
| `caja/index.php` | `controllers/caja/index.js` | `caja_service.js` | `GET /api/v1/cash-sessions/`<br>`GET /api/v1/cash-registers/` |
| `caja/resumen.php` | `controllers/caja/resumen.js` | `caja_service.js` | `GET /api/v1/cash-sessions/{id}/summary/` |
| `caja/historial.php` | `controllers/caja/historial.js` | `caja_service.js` | `GET /api/v1/cash-sessions/history/` |
| `caja/crear.php` | `controllers/caja/crear.js` | `caja_service.js` | `POST /api/v1/cash-sessions/open/`<br>`POST /api/v1/cash-sessions/close/` |
| `finanzas/index.php` | `controllers/finanzas/index.js` | `finanzas_service.js` | `GET /api/v1/finance/dashboard/` |
| `finanzas/movimientos.php` | `controllers/finanzas/movimientos.js` | `finanzas_service.js` | `GET /api/v1/finance/movements/` |
| `finanzas/transferencias.php` | `controllers/finanzas/transferencias.js` | `finanzas_service.js` | `POST /api/v1/finance/transfers/` |
| `finanzas/conciliaciones.php` | `controllers/finanzas/conciliaciones.js` | `finanzas_service.js` | `GET /api/v1/finance/reconciliations/` |
| `configuracion/versiones.php` | `controllers/configuracion/versiones_controller.js` | `system_service.js` | `GET /api/v1/system/versions/` |
| `saas_admin/login.php` | `controllers/saas_admin/login_controller.js` | `auth_service.js` | `POST /api/v1/auth/login/` |
| `saas_admin/dashboard.php` | `controllers/saas_admin/dashboard_controller.js` | `saas_admin_service.js` | `GET /api/v1/saas-admin/dashboard/` |
| `saas_admin/tenants.php` | `controllers/saas_admin/tenants_controller.js` | `saas_admin_service.js` | `GET /api/v1/saas-admin/tenants/`<br>`POST /api/v1/saas-admin/tenants/` |
| `saas_admin/empresa_detalle.php` | `controllers/saas_admin/empresa_detalle_controller.js` | `saas_admin_service.js` | `GET /api/v1/saas-admin/tenants/{id}/`<br>`POST /api/v1/saas-admin/tenants/{id}/impersonate/` |
| `saas_admin/planes.php` | `controllers/saas_admin/planes_controller.js` | `saas_plan_service.js` | `GET /api/v1/saas-admin/plans/` |
| `saas_admin/versiones.php` | `controllers/saas_admin/versiones_controller.js` | `saas_version_service.js` | `GET /api/v1/saas-admin/versions/` |
| `saas_admin/auditoria.php` | `controllers/saas_admin/auditoria_controller.js` | `saas_audit_service.js` | `GET /api/v1/saas-admin/audit-logs/` |
| `saas_admin/equipo/listar.php` | `controllers/saas_admin/equipo_controller.js` | `saas_team_service.js` | `GET /api/v1/saas-admin/team/` |

---

## 3. MAPA DE DEPENDENCIAS DE NÚCLEO (CORE)

```
[App.js]
  ├──> [Config (config/config.js)]
  ├──> [AuthGuard (core/auth_guard.js)]
  │      ├──> [SessionManager (core/session_manager.js)]
  │      │      ├──> [Storage (storage/storage.js)]
  │      │      ├──> [Config (config/config.js)]
  │      │      └──> [AuthService (services/auth_service.js)]
  │      │             └──> [ApiClient (core/apiClient.js)]
  │      ├──> [Config]
  │      ├──> [SecurityManager (core/security.js)]
  │      └──> [Storage]
  ├──> [SecurityManager]
  │      ├──> [Storage]
  │      └──> [Routes (core/routes.js)]
  ├──> [AuthService]
  ├──> [NotificationService (core/notification.js)]
  ├──> [SidebarController (controllers/sidebar/sidebar_controller.js)]
  ├──> [VersionController (controllers/version/version_controller.js)]
  └──> [Storage]
```

---

## 4. ANÁLISIS DE CICLOS DE DEPENDENCIA

- **Verificación Automatizada**: Ejecutada sobre los 84 módulos JavaScript mediante análisis de grafo dirigido (DFS).
- **Resultado**: **0 Dependencias Circulares detectadas**.
- La arquitectura mantiene una orientación acíclica estricta:
  `Controladores -> Servicios -> ApiClient -> Storage / Config`.

---

## 5. DEPENDENCIAS EXTERNAS DE TERCEROS (VENDOR)

| Biblioteca | Versión Bundle | Ruta en Proyecto | Ámbito de Carga |
|---|---|---|---|
| **AdminLTE** | 3.2.0 | `public/assets/vendor/AdminLTE-3.2.0/dist/` | Global (`head.php`, `footer.php`) |
| **Bootstrap** | 4.6.1 | `public/assets/vendor/AdminLTE-3.2.0/plugins/bootstrap/` | Global (`footer.php`) |
| **jQuery** | 3.6.0 | `public/assets/vendor/AdminLTE-3.2.0/plugins/jquery/` | Global (`footer.php`) |
| **SweetAlert2** | 11.x (Local) | `public/assets/vendor/AdminLTE-3.2.0/plugins/sweetalert2/` | Global (`footer.php`) |
| **DataTables** | 1.11.x | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables/` | Global (`footer.php`) |
| **DataTables Responsive** | 2.2.x | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-responsive/` | Global (`footer.php`) |
| **DataTables Buttons** | 2.2.x | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-buttons/` | Global (`footer.php`) |
| **JSZip & pdfmake** | 3.1.x / 0.1.x | `public/assets/vendor/AdminLTE-3.2.0/plugins/jszip/` y `pdfmake/` | Global (`footer.php`) |
| **Select2** | 4.0.13 | `public/assets/vendor/AdminLTE-3.2.0/plugins/select2/` | Por Vista (`usuarios`, `clientes`, etc.) |
| **Chart.js** | 2.9.x | `public/assets/vendor/AdminLTE-3.2.0/plugins/chart.js/` | Por Vista (`dashboard`, `finanzas`, `caja`) |
| **FontAwesome Free** | 5.15.4 | `public/assets/vendor/AdminLTE-3.2.0/plugins/fontawesome-free/` | Global (`head.php`) |
| **OverlayScrollbars** | 1.13.0 | `public/assets/vendor/AdminLTE-3.2.0/plugins/overlayScrollbars/` | Global (`head.php`) |
