# Informe de Código Muerto y Archivos Huérfanos — Frontend ERP SaaS P.M.E.

## 1. Alcance y Metodología de la Auditoría

Conforme a las **Reglas Innegociables (Sección 3.3)** de la auditoría técnica:
> *Está prohibido eliminar archivos automáticamente. Todo archivo huérfano, código obsoleto o artefacto accidental debe ser clasificado detalladamente en este informe para que el equipo de desarrollo tome la decisión controlada de archivado o eliminación.*

Se realizó un escaneo estático exhaustivo de los 166 archivos propios del proyecto, verificando:
- Invocaciones `require`, `include`, `require_once` e `include_once` en PHP.
- Sentencias `import` y `export` en módulos ES6+.
- Reglas de reescritura en `.htaccess`.
- Archivos de 0 bytes o de formato anómalo en el árbol de directorios.

---

## 2. Clasificación de Hallazgos

| Archivo | Tamaño | Categoría | Estado / Razón de Clasificación | Acción Recomendada |
| :--- | :--- | :--- | :--- | :--- |
| `'` (raíz) | 0 bytes | **Artefacto Anómalo** | Creado accidentalmente por error de sintaxis en terminal/bash de desarrollador. | **Eliminar manualmente** de forma segura. |
| `{mod.module_id}')` (raíz) | 0 bytes | **Artefacto Anómalo** | Creado accidentalmente por fallo de interpolación de variables en script shell. | **Eliminar manualmente** de forma segura. |
| `app/helpers/auth.php` | 0 bytes | **Placeholder Vacío** | Archivo vacío sin contenido. Ningún archivo PHP del proyecto lo incluye. Toda la autenticación está en JavaScript (`AuthService`, `AuthGuard`, `Storage`). | **Eliminar o archivar**. |
| `app/views/bootstrap.php` | 0 bytes | **Placeholder Vacío** | Archivo vacío sin contenido. No es invocado por `.htaccess` ni por ningún controlador. | **Eliminar o archivar**. |
| `routes/web.php` | 724 bytes | **Código Inerte (Legacy)** | Declara `$router->add(...)` condicionado a `isset($router)`. La variable `$router` no se inicializa en ningún punto de la arquitectura; el enrutamiento real opera vía Apache `.htaccess` hacia vistas físicas. | **Archivar o deprecar formalmente**. |
| `powershell.cmd` (raíz) | 73 bytes | **Script de Utilidad Local** | Script de conveniencia para abrir terminal PowerShell en el directorio del proyecto. No afecta la ejecución web ni la seguridad en producción. | **Mantener en desarrollo** o excluir en deploy (`.git/info/exclude`). |
| `.gitignore` (raíz) | 0 bytes | **Configuración Vacía** | Archivo de control de versiones vacío. No ignora `vendor/`, `node_modules/`, ni logs locales. | **Poblar con reglas estándar** de PHP/JS/Composer. |
| `README.md` (raíz) | 0 bytes | **Documentación Vacía** | Archivo de bienvenida vacío. Reemplazable por el resumen de la auditoría arquitectónica. | **Poblar con documentación del proyecto**. |
| `TODO.md` (raíz) | 3.520 bytes | **Bitácora de Tareas** | Documento con pendientes del equipo técnico (ej. bug de soporte técnico que ya fue resuelto en esta auditoría). | **Actualizar con el estado actual**. |

---

## 3. Detalle Técnico de los Hallazgos

### 3.1 Artefactos de Terminal en Raíz (`'` y `{mod.module_id}')`)
- **Evidencia:** Archivos creados en la raíz de `f:\XAMPP\htdocs\frontend-inventario-pme\`.
- **Análisis:** En sistemas Windows/Linux, comandos mal escapados como `touch '` o `echo "{mod.module_id}')"` crean archivos con nombres literales. No tienen extensión ni contenido.
- **Riesgo:** Confusión en herramientas de despliegue automatizado (CI/CD o Git) que puedan rechazar caracteres especiales como `'` o `}`.
- **Comando seguro para su retiro (ejecución por el usuario):**
  ```powershell
  Remove-Item -Path "f:\XAMPP\htdocs\frontend-inventario-pme\'" -Force
  Remove-Item -Path "f:\XAMPP\htdocs\frontend-inventario-pme\{mod.module_id}')" -Force
  ```

---

### 3.2 Archivo de Enrutamiento Inerte: `routes/web.php`
- **Código analizado:**
  ```php
  <?php
  if (isset($router)) {
      $router->add('/categorias', 'app/views/categorias/index.php');
      $router->add('/caja', 'app/views/caja/index.php');
      // ...
  }
  ```
- **Diagnóstico:** El proyecto no utiliza un enrutador PHP centralizado ni un Front Controller tipo `index.php?route=...`. En su lugar:
  - Apache `.htaccess` reescribe URLs limpias directamente a archivos PHP:
    `RewriteRule ^categorias/?$ app/views/categorias/listar.php [L,QSA]`
  - El frontend JavaScript (`App.js`) maneja la seguridad de rutas en el cliente mediante `AuthGuard` y `ROUTE_PERMISSIONS`.
- **Conclusión:** `routes/web.php` no produce ningún efecto en tiempo de ejecución. Puede ser removido sin ninguna afectación al sistema.

---

### 3.3 Archivos Vacíos de 0 Bytes
- `app/helpers/auth.php`: En la arquitectura inicial se proyectó colocar helpers PHP de autenticación. Al delegarse la autenticación a JWT en el frontend mediante `ApiClient` y `Storage`, el helper PHP quedó en desuso.
- `app/views/bootstrap.php`: En versiones previas se exploró una vista genérica de arranque. Actualmente, cada vista implementa su propio layout completo (`header.php`, `navbar.php`, `sidebar.php`, `footer.php`).

---

## 4. Plan de Acción Recomendado para el Equipo

1. **Inmediato:**
   - Eliminar manualmente los dos archivos huérfanos de la raíz (`'` y `{mod.module_id}')`).
2. **Medio Plazo:**
   - Poblar `.gitignore` con exclusiones para archivos temporales, logs, carpetas de IDE (`.vscode/`, `.idea/`) y `.env`.
   - Mover `routes/web.php` a una carpeta `legacy/` o eliminarlo si se mantiene la estrategia de enrutamiento por `.htaccess`.
