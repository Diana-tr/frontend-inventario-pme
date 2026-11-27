# Arquitectura y Seguridad Multi-Tenant en el Frontend — ERP SaaS P.M.E.

## 1. Visión General del Modelo Multi-Tenant

El ERP SaaS P.M.E. opera bajo un modelo Multi-Tenant empresarial donde:
- El backend Django REST Framework aísla los datos por empresa mediante filtrado por `company_id`.
- El frontend gestiona la empresa activa y propaga la identidad del inquilino mediante la cabecera HTTP:
  ```http
  X-Company-ID: <id_empresa>
  ```
- Todas las operaciones de negocio (ventas, compras, inventario, finanzas, productos, clientes, proveedores, roles y usuarios) están estrictamente vinculadas a la empresa activa.

---

## 2. Ciclo de Vida de la Empresa Activa

```mermaid
flowchart TD
    Login[Login Exitoso en /auth/login/] --> CheckCompanies{¿Cuántas empresas tiene el usuario?}
    CheckCompanies -- Múltiples Empresas --> CompanySelection[Redirección a /company-selection]
    CheckCompanies -- Única Empresa --> AutoSelect[Selección Automática de Empresa]
    CompanySelection --> UserSelects[Usuario Elige Empresa]
    UserSelects --> SaveStorage[Storage.setActiveCompanyId(id)]
    AutoSelect --> SaveStorage
    SaveStorage --> LoadContext[GET /api/v1/security/context/]
    LoadContext --> StoreSecurity[Guardar Permisos, Acciones y Módulos Contratados]
    StoreSecurity --> DispatchEvent[window.dispatchEvent(new CustomEvent('company_changed'))]
    DispatchEvent --> Dashboard[Navegación al Dashboard / Modulo Autorizado]
```

### Datos Persistidos por Inquilino en `Storage`
Cuando una empresa es seleccionada, el almacenamiento local aísla:
1. `inventariopme_active_company_id`: ID numérico o UUID de la empresa actual.
2. `inventariopme_active_company`: Metadatos (nombre, NIT, plan, logo).
3. `inventariopme_contracted_modules`: Array de módulos contratados por el tenant (ej. `["inventory", "sales", "finance"]`).
4. `inventariopme_roles`: Roles asignados al usuario *en esa empresa específica*.
5. `inventariopme_permissions`: Permisos directos (`app.action_model`) concedidos en esa empresa.
6. `inventariopme_actions`: Acciones operativas detalladas (`read`, `create`, `update`, `delete`, `export`).

---

## 3. Principio Fail-Closed en Inyección de `X-Company-ID`

Para evitar fugas de información entre inquilinos o peticiones inconsistentes, `ApiClient.js` implementa un mecanismo **Fail-Closed**:

### Lógica de Validación Pre-Vuelo:
1. Si la petición pertenece al panel de administración SaaS (`/saas-admin/`) o endpoints de plataforma (`/auth/login/`, `/auth/refresh/`, `/auth/me/`, `/system/`, `/versions/`), el encabezado `X-Company-ID` se excluye intencionalmente.
2. Para todo endpoint de negocio de inquilino (productos, clientes, ventas, etc.):
   - Si el usuario está autenticado y existe `activeCompanyId`, se inyecta `headers["X-Company-ID"] = activeCompanyId`.
   - **Fail-Closed:** Si el usuario está autenticado pero `activeCompanyId` es nulo/vacío, **la petición HTTP se aborta antes de enviarse a la red**, devolviendo inmediatamente:
     ```json
     {
       "ok": false,
       "status": 400,
       "success": false,
       "code": "COMPANY_REQUIRED",
       "message": "No se ha seleccionado una empresa activa para realizar esta operación.",
       "data": null,
       "errors": { "company": ["Se requiere seleccionar una empresa activa en el encabezado X-Company-ID."] }
     }
     ```

---

## 4. Cambio Dinámico de Empresa (Switching de Inquilinos)

El usuario con acceso a múltiples empresas puede cambiar de contexto en cualquier momento desde la barra de navegación superior (`NavbarController`):

1. **Selección en UI:** El selector de empresas dispara el evento de cambio.
2. **Reinicio de Contexto de Seguridad:**
   - Se actualiza `Storage.setActiveCompanyId(newId)`.
   - Se invoca `AuthService.getSecurityContext()` para obtener los permisos correspondientes a la nueva empresa.
   - Se actualizan permisos, acciones, roles y módulos contratados en `Storage`.
3. **Notificación al Ecosistema Frontend:**
   - Se despacha el evento global:
     ```javascript
     window.dispatchEvent(new CustomEvent("company_changed", { detail: { companyId: newId } }));
     ```
   - Los controladores activos (DataTables, gráficos de dashboard, indicadores de caja) escuchan este evento y recargan sus colecciones de datos automáticamente.

---

## 5. Modo Soporte Técnico e Impersonación Segura

Para resolver incidencias de clientes sin vulnerar contraseñas, el sistema SaaS incluye un flujo de impersonación restringido a Superadministradores:

```
[ SaaS Admin Dashboard ]
       │
       ▼ (Click en "Acceso Soporte")
[ POST /api/v1/saas-admin/tenants/{id}/support-access/ ]
       │
       ▼ (Retorna Support JWT temporal con expiración corta)
[ Storage.backupForImpersonation(supportToken, companyId, companyName) ]
       │  ├── Respalda tokens del Superadministrador en 'inventariopme_superadmin_backup'
       │  ├── Establece token temporal como activo
       │  └── Configura bandera 'inventariopme_is_impersonating' = true
       ▼
[ SecurityManager & AuthGuard Bypass ]
       │  ├── hasPermission(), hasAction() y isModuleContracted() retornan true
       │  └── Se evita el bloqueo por falta de permisos locales en el almacenamiento
       ▼
[ UI Inquilino con Banner Persistente de Soporte ]
       │  └── "Modo Soporte Técnico — Empresa: [Nombre] [Salir de Soporte]"
       ▼
[ Storage.restoreFromImpersonation() ]
       │  ├── Restaura tokens del Superadministrador
       │  ├── Elimina banderas de impersonación
       │  └── Redirige de vuelta a /saas-admin/dashboard
```

### Garantías de Seguridad en Modo Soporte:
- Si el token temporal de soporte expira (401), `ApiClient` detecta `Storage.isImpersonating()` y restaura la sesión del Superadmin automáticamente sin expulsarlo al login general de inquilino.
- Si el usuario hace logout manual mientras está en modo soporte, `logout_controller.js` cancela la impersonación y lo devuelve a su panel administrativo.
- La sesión de soporte no persiste si el navegador se cierra (almacenamiento en sessionStorage para el backup o aislamiento controlado).
