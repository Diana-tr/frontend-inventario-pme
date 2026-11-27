# INVENTARIO INTEGRAL DEL FRONTEND — ERP SAAS P.M.E.

**Fecha de Generación:** Noviembre 2026  
**Auditor:** Equipo de Ingeniería Senior / Principal  
**Repositorio:** `f:\XAMPP\htdocs\frontend-inventario-pme`

---

## 1. RESUMEN MÉTRICO GLOBAL

> Las métricas corresponden estrictamente al código propio desarrollado para la aplicación, excluyendo las bibliotecas de terceros ubicadas en `public/assets/vendor/`.

| Métrica | Valor Real |
|---|---|
| **Total de Archivos Propios** | **166 archivos** |
| **Líneas de Código Propias (LOC)** | **42,242 líneas** |
| **Tamaño Total en Disco (Código Propio)** | **2,253,307 bytes (~2.15 MB)** |
| **Archivos de Dependencias Externas (Vendor)** | 2,435 archivos (`public/assets/vendor/AdminLTE-3.2.0/`) |

---

## 2. DESGLOSE POR EXTENSIÓN Y TIPO DE RECURSO

| Extensión | Cantidad | Líneas de Código (LOC) | Tamaño en Disco | Propósito Principal |
|---|---|---|---|---|
| `.js` | 84 | 25,390 | 905,586 bytes | Lógica cliente: Core, Controllers, Services, Storage, Utils |
| `.php` | 56 | 13,893 | 782,003 bytes | Enrutador Front Controller, Vistas y Layouts AdminLTE |
| `.css` | 13 | 2,959 | 80,854 bytes | Estilos personalizados, componentes, login, responsive |
| `.json` | 2 | 101 | 2,660 bytes | Configuración de entorno local / VSCode |
| `.png` | 2 | N/A (Binario) | 377,290 bytes | Logotipos de la aplicación |
| `.svg` | 1 | 40 | 109,623 bytes | Logotipo vectorial |
| `.md` | 2 | 40 | 3,520 bytes | `README.md`, `TODO.md` |
| `.htaccess` | 2 | 32 | 1,359 bytes | Reglas de reescritura Apache y protección de carpetas |
| `.cmd` | 1 | 2 | 73 bytes | Script auxiliar de PowerShell |
| `.gitignore` | 1 | 0 | 0 bytes | Control de versiones git |
| *Sin extensión (`'`)* | 1 | 0 | 0 bytes | Archivo espurio en raíz |
| *Junk (`{mod.module_id}')`)* | 1 | 0 | 0 bytes | Archivo espurio en raíz |

---

## 3. CATÁLOGO ESTRUCTURADO DE ARCHIVOS PROPIOS

### 3.1 Raíz del Proyecto (8 archivos)
- `index.php` (418 líneas): Front Controller principal de la aplicación.
- `.htaccess` (30 líneas): Configuración de Apache RewriteEngine para redirigir peticiones a `index.php`.
- `TODO.md` (40 líneas): Registro de pendientes técnicos y funcionales del equipo.
- `README.md` (0 líneas): Archivo descriptivo vacío.
- `.gitignore` (0 líneas): Archivo gitignore vacío.
- `powershell.cmd` (2 líneas): Acceso directo a terminal.
- `'` (0 líneas): Archivo residual / basura.
- `{mod.module_id}')` (0 líneas): Archivo residual / basura generado por interpolación fallida de bash.

### 3.2 Capa PHP (`app/` y `routes/` — 57 archivos)
- **Configuración y Rutas (3 archivos)**:
  - `app/config/app.php`: Definición de URL base según entorno local/producción.
  - `app/.htaccess`: Bloqueo de acceso directo a directorios internos de la aplicación.
  - `routes/web.php`: Archivo huérfano con estructura de rutas para `$router`.
- **Helpers y Bootstrap (2 archivos)**:
  - `app/helpers/auth.php`: Archivo vacío (0 bytes).
  - `app/views/bootstrap.php`: Archivo vacío (0 bytes).
- **Layouts Compartidos (5 archivos)**:
  - `app/views/layouts/head.php`: Cabecera HTML5, hojas de estilo de AdminLTE y plugins.
  - `app/views/layouts/navbar.php`: Barra de navegación superior con perfil de usuario y alertas.
  - `app/views/layouts/sidebar.php`: Menú lateral izquierdo con navegación modular basada en permisos.
  - `app/views/layouts/footer.php`: Pie de página, scripts base de AdminLTE y bootstrap de sesión.
  - `app/views/layouts/control-sidebar.php`: Barra lateral derecha de configuración visual.
- **Vistas del ERP por Módulo (39 archivos)**:
  - `app/views/auth/login.php`: Pantalla de inicio de sesión principal.
  - `app/views/dashboard/index.php`: Panel de control operativo con métricas y accesos directos.
  - `app/views/usuarios/listar.php`, `app/views/usuarios/crear.php`: Gestión de usuarios del sistema.
  - `app/views/roles/listar.php`, `app/views/roles/crear.php`: Gestión de roles y permisos.
  - `app/views/categorias/listar.php`, `app/views/categorias/crear.php`: Catálogo de categorías.
  - `app/views/clientes/listar.php`, `app/views/clientes/crear.php`: Gestión de clientes.
  - `app/views/proveedores/listar.php`, `app/views/proveedores/crear.php`: Gestión de proveedores.
  - `app/views/productos/listar.php`, `app/views/productos/crear.php`: Catálogo de productos.
  - `app/views/inventario/listar.php`, `app/views/inventario/crear.php`, `app/views/inventario/movimientos.php`: Control de existencias y movimientos.
  - `app/views/compras/listar.php`, `app/views/compras/crear.php`, `app/views/compras/facturas.php`: Registro y consulta de compras a proveedores.
  - `app/views/ventas/listar.php`, `app/views/ventas/crear.php`, `app/views/ventas/pos.php`, `app/views/ventas/facturas.php`: Módulo de ventas y Punto de Venta.
  - `app/views/caja/index.php`, `app/views/caja/crear.php`, `app/views/caja/resumen.php`, `app/views/caja/historial.php`: Gestión de cajas y turnos.
  - `app/views/finanzas/index.php`, `app/views/finanzas/movimientos.php`, `app/views/finanzas/transferencias.php`, `app/views/finanzas/conciliaciones.php`: Tesorería y cuentas.
  - `app/views/configuracion/versiones.php`: Consulta y gestión de versiones del software.
- **Panel Administrativo SaaS (`app/views/saas_admin/` y `saas-admin/` — 11 archivos)**:
  - `saas-admin/index.php`, `saas-admin/login.php`: Puntos de entrada para el panel SaaS.
  - `app/views/saas_admin/login.php`: Login de superadministradores y staff.
  - `app/views/saas_admin/dashboard.php`: Métricas multi-tenant globales.
  - `app/views/saas_admin/tenants.php`: Gestión de empresas/inquilinos.
  - `app/views/saas_admin/empresa_detalle.php`: Detalle, plan, límites e impersonación de tenant.
  - `app/views/saas_admin/planes.php`: Planes de suscripción y módulos disponibles.
  - `app/views/saas_admin/versiones.php`: Registro de versiones de la plataforma SaaS.
  - `app/views/saas_admin/auditoria.php`: Visor de registros de auditoría global.
  - `app/views/saas_admin/equipo/listar.php`, `app/views/saas_admin/equipo/gestionar.php`: Gestión del equipo interno SaaS.
  - `app/views/saas_admin/layouts/navbar.php`, `app/views/saas_admin/layouts/sidebar.php`: Navegación propia del panel SaaS.

### 3.3 Capa JavaScript (`public/assets/js/` — 84 archivos)
- **Núcleo (`core/` — 10 archivos)**:
  - `apiClient.js` (268 líneas): Cliente HTTP centralizado con token refresh y cabecera de tenant.
  - `app.js` (238 líneas): Ciclo de vida y protección de rutas.
  - `auth_guard.js` (212 líneas): Reglas de autorización Fail-Closed.
  - `session_manager.js` (157 líneas): Temporizador de inactividad y sincronización entre pestañas.
  - `security.js` (241 líneas): Verificación de permisos y procesamiento dinámico del DOM.
  - `notification.js` (112 líneas): Envoltorio de notificaciones y alertas.
  - `config.js` (8 líneas): Re-exportación de configuración.
  - `constants.js` (45 líneas): Constantes del sistema.
  - `routes.js` (35 líneas): Diccionario de rutas.
  - `utils.js` (185 líneas): Funciones utilitarias (fechas, monedas, formato).
- **Almacenamiento y Configuración (2 archivos)**:
  - `storage/storage.js` (283 líneas): Capa de persistencia en localStorage/sessionStorage.
  - `config/config.js` (43 líneas): Parámetros de entorno, URLs base y tiempos límite.
- **Servicios (`services/` — 21 archivos)**:
  - `auth_service.js`, `caja_service.js`, `categoria_service.js`, `cliente_service.js`, `company_info_service.js`, `compra_service.js`, `finanzas_service.js`, `inventario_service.js`, `invoice_template_service.js`, `notification_feed_service.js`, `producto_service.js`, `proveedor_service.js`, `role_service.js`, `saas_admin_service.js`, `saas_audit_service.js`, `saas_plan_service.js`, `saas_team_service.js`, `saas_version_service.js`, `system_service.js`, `usuario_service.js`, `venta_service.js`.
- **Controladores (`controllers/` — 44 archivos)**:
  - Controladores de autenticación y navegación (3 archivos): `login_controller.js`, `logout_controller.js`, `navbar_controller.js`.
  - Controladores del ERP (31 archivos): usuarios, roles, categorías, clientes, proveedores, productos, inventario, compras, ventas, POS, caja, finanzas, versiones, notificaciones, sidebar.
  - Controladores de SaaS Admin (10 archivos): login, dashboard, tenants, empresa detalle, planes, versiones, auditoría, equipo.
- **Componentes y Utilidades (`components/` y `utils/` — 5 archivos)**:
  - `components/permission_selector.js`: Selector interactivo de permisos por matriz/árbol.
  - `utils/DataTableHelper.js`: Configuración y renderizado unificado de DataTables.
  - `utils/DocumentTemplateRenderer.js`: Renderizado de facturas y tickets.
  - `utils/InvoiceActions.js`: Acciones de impresión y exportación de facturas.
  - `utils/invoice_utils.js`: Cálculos de totales, impuestos y descuentos.

### 3.4 Capa CSS (`public/assets/css/` — 13 archivos)
- `main.css`: Hoja de estilos principal unificadora.
- `base/_layout.css`, `base/_reset.css`, `base/_variables.css`: Variables CSS, layout base y reseteo.
- `components/buttons.css`, `components/dashboard.css`, `components/datatables.css`, `components/forms.css`, `components/login.css`, `components/notifications.css`, `components/saas_login.css`, `components/sidebar.css`: Estilos modulares por componente.
- `saas_admin/login.css`: Estilo particular para el acceso SaaS.
