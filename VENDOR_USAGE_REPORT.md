# REPORTE DE AUDITORÍA DE USO — VENDOR ADMINLTE 3.2.0
**Inventario P.M.E. ERP**  
*Generado: Fase 1 (Auditoría de Uso - Solo Lectura)*

---

## 1. Resumen Ejecutivo de la Auditoría

- **Directorio analizado:** `public/assets/vendor/AdminLTE-3.2.0/`
- **Total de archivos iniciales:** 2.435 archivos
- **Peso total inicial:** 117,97 MB
- **Referencias encontradas en código del ERP:** 92 referencias
- **Archivos únicos importados directamente:** 33 archivos
- **Plugins utilizados:** 20 plugins
- **Plugins NO utilizados (candidatos a eliminación):** 40 plugins

---

## 2. Clasificación de Archivos y Espacio Ocupado

| Categoría | Descripción | Archivos | Peso (MB) | % del Total |
| :--- | :--- | :---: | :---: | :---: |
| **[USAR]** | Referenciado explícitamente en vistas PHP / JS del ERP | 33 | 4.46 MB | 3.8% |
| **[DEPENDENCIA INDIRECTA]** | Dependencias internas de plugins en uso (webfonts, imágenes DataTables, idiomas Select2, etc.) | 383 | 26.38 MB | 22.4% |
| **[ELIMINAR]** | Plugins no usados, documentación (`docs/`), ejemplos (`pages/`), build scripts, sourcemaps (`.map`), metadatos | 2010 | 87.12 MB | 73.8% |
| **TOTAL** | **Distribución completa inicial** | **2.426** | **117,97 MB** | **100%** |

> **Ahorro proyectado seguro:** **87.12 MB** y **2010 archivos**, reduciendo el tamaño del vendor en un **73.8%** sin riesgo operacional.

---

## 3. Matriz de Archivos AdminLTE Importados

| Archivo AdminLTE importado | Ruta completa | Importado desde (archivo PHP) | Tipo |
| :--- | :--- | :--- | :---: |
| `dist/css/adminlte.min.css` | `public/assets/vendor/AdminLTE-3.2.0/dist/css/adminlte.min.css` | `app/views/layouts/head.php:26, app/views/saas_admin/login.php:25` | **CSS** |
| `dist/js/adminlte.js` | `public/assets/vendor/AdminLTE-3.2.0/dist/js/adminlte.js` | `app/views/layouts/footer.php:48` | **JS** |
| `plugins/bootstrap/js/bootstrap.bundle.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/bootstrap/js/bootstrap.bundle.min.js` | `app/views/layouts/footer.php:20` | **JS** |
| `plugins/chart.js/Chart.bundle.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/chart.js/Chart.bundle.min.js` | `app/views/caja/resumen.php:137, app/views/dashboard/index.php:360 y 2 más...` | **JS** |
| `plugins/datatables-bs4/css/dataTables.bootstrap4.min.css` | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css` | `app/views/layouts/head.php:34` | **CSS** |
| `plugins/datatables-bs4/js/dataTables.bootstrap4.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-bs4/js/dataTables.bootstrap4.min.js` | `app/views/layouts/footer.php:27` | **JS** |
| `plugins/datatables-buttons/css/buttons.bootstrap4.min.css` | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-buttons/css/buttons.bootstrap4.min.css` | `app/views/layouts/head.php:38` | **CSS** |
| `plugins/datatables-buttons/js/buttons.bootstrap4.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-buttons/js/buttons.bootstrap4.min.js` | `app/views/layouts/footer.php:40` | **JS** |
| `plugins/datatables-buttons/js/buttons.colVis.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-buttons/js/buttons.colVis.min.js` | `app/views/layouts/footer.php:45` | **JS** |
| `plugins/datatables-buttons/js/buttons.html5.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-buttons/js/buttons.html5.min.js` | `app/views/layouts/footer.php:43` | **JS** |
| `plugins/datatables-buttons/js/buttons.print.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-buttons/js/buttons.print.min.js` | `app/views/layouts/footer.php:44` | **JS** |
| `plugins/datatables-buttons/js/dataTables.buttons.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-buttons/js/dataTables.buttons.min.js` | `app/views/layouts/footer.php:39` | **JS** |
| `plugins/datatables-responsive/css/responsive.bootstrap4.min.css` | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-responsive/css/responsive.bootstrap4.min.css` | `app/views/layouts/head.php:36` | **CSS** |
| `plugins/datatables-responsive/js/dataTables.responsive.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-responsive/js/dataTables.responsive.min.js` | `app/views/layouts/footer.php:30` | **JS** |
| `plugins/datatables-responsive/js/responsive.bootstrap4.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-responsive/js/responsive.bootstrap4.min.js` | `app/views/layouts/footer.php:31` | **JS** |
| `plugins/datatables/jquery.dataTables.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/datatables/jquery.dataTables.min.js` | `app/views/layouts/footer.php:26` | **JS** |
| `plugins/daterangepicker/daterangepicker.css` | `public/assets/vendor/AdminLTE-3.2.0/plugins/daterangepicker/daterangepicker.css` | `app/views/layouts/head.php:30` | **CSS** |
| `plugins/fontawesome-free/css/all.min.css` | `public/assets/vendor/AdminLTE-3.2.0/plugins/fontawesome-free/css/all.min.css` | `app/views/layouts/head.php:16` | **CSS** |
| `plugins/icheck-bootstrap/icheck-bootstrap.min.css` | `public/assets/vendor/AdminLTE-3.2.0/plugins/icheck-bootstrap/icheck-bootstrap.min.css` | `app/views/layouts/head.php:22` | **CSS** |
| `plugins/jquery/jquery.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/jquery/jquery.min.js` | `app/views/layouts/footer.php:17` | **JS** |
| `plugins/jqvmap/jqvmap.min.css` | `public/assets/vendor/AdminLTE-3.2.0/plugins/jqvmap/jqvmap.min.css` | `app/views/layouts/head.php:24` | **CSS** |
| `plugins/jszip/jszip.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/jszip/jszip.min.js` | `app/views/layouts/footer.php:34` | **JS** |
| `plugins/overlayScrollbars/css/OverlayScrollbars.min.css` | `public/assets/vendor/AdminLTE-3.2.0/plugins/overlayScrollbars/css/OverlayScrollbars.min.css` | `app/views/layouts/head.php:28` | **CSS** |
| `plugins/pdfmake/pdfmake.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/pdfmake/pdfmake.min.js` | `app/views/layouts/footer.php:35` | **JS** |
| `plugins/pdfmake/vfs_fonts.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/pdfmake/vfs_fonts.js` | `app/views/layouts/footer.php:36` | **JS** |
| `plugins/select2-bootstrap4-theme/select2-bootstrap4.min.css` | `public/assets/vendor/AdminLTE-3.2.0/plugins/select2-bootstrap4-theme/select2-bootstrap4.min.css` | `app/views/categorias/crear.php:9, app/views/categorias/listar.php:16 y 16 más...` | **CSS** |
| `plugins/select2/css/select2.min.css` | `public/assets/vendor/AdminLTE-3.2.0/plugins/select2/css/select2.min.css` | `app/views/categorias/crear.php:8, app/views/categorias/listar.php:15 y 16 más...` | **CSS** |
| `plugins/select2/js/i18n/es.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/select2/js/i18n/es.js` | `app/views/compras/crear.php:164, app/views/ventas/crear.php:215, app/views/ventas/pos.php:269` | **JS** |
| `plugins/select2/js/select2.full.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/select2/js/select2.full.min.js` | `app/views/categorias/crear.php:122, app/views/categorias/listar.php:264 y 16 más...` | **JS** |
| `plugins/summernote/summernote-bs4.min.css` | `public/assets/vendor/AdminLTE-3.2.0/plugins/summernote/summernote-bs4.min.css` | `app/views/layouts/head.php:32` | **CSS** |
| `plugins/sweetalert2-theme-bootstrap-4/bootstrap-4.min.css` | `public/assets/vendor/AdminLTE-3.2.0/plugins/sweetalert2-theme-bootstrap-4/bootstrap-4.min.css` | `app/views/layouts/head.php:40, app/views/saas_admin/login.php:28` | **CSS** |
| `plugins/sweetalert2/sweetalert2.all.min.js` | `public/assets/vendor/AdminLTE-3.2.0/plugins/sweetalert2/sweetalert2.all.min.js` | `app/views/layouts/footer.php:23, app/views/saas_admin/login.php:127` | **JS** |
| `plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css` | `public/assets/vendor/AdminLTE-3.2.0/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css` | `app/views/layouts/head.php:20` | **CSS** |

---

## 4. Plugins Efectivamente Utilizados (20)

Los siguientes 20 plugins son requeridos para la operación del ERP (tablas, formularios, dashboard, gráficos, modales, etc.):

- **`bootstrap`**
- **`chart.js`**
- **`datatables`**
- **`datatables-bs4`**
- **`datatables-buttons`**
- **`datatables-responsive`**
- **`daterangepicker`**
- **`fontawesome-free`**
- **`icheck-bootstrap`**
- **`jquery`**
- **`jqvmap`**
- **`jszip`**
- **`overlayScrollbars`**
- **`pdfmake`**
- **`select2`**
- **`select2-bootstrap4-theme`**
- **`summernote`**
- **`sweetalert2`**
- **`sweetalert2-theme-bootstrap-4`**
- **`tempusdominus-bootstrap-4`**

### Dependencias Transitivas Críticas Verificadas:
- **`fontawesome-free`**: Requiere `plugins/fontawesome-free/webfonts/` (archivos `.woff2`, `.ttf`, etc.) para la renderización de todos los iconos del sistema. *(Conservado al 100%)*
- **`datatables` / `datatables-bs4`**: Requieren `plugins/datatables-bs4/css/` e imágenes de ordenamiento (`sort_asc.png`, etc.). *(Conservado al 100%)*
- **`select2`**: Requiere `plugins/select2/js/i18n/es.js` para la localización en español. *(Conservado al 100%)*
- **`pdfmake`**: Requiere `plugins/pdfmake/vfs_fonts.js` para la exportación de reportes PDF de DataTables. *(Conservado al 100%)*
- **`jszip`**: Requerido por `datatables-buttons/js/buttons.html5.min.js` para exportación a Excel. *(Conservado al 100%)*
- **`summernote`**: Requiere su carpeta `font/` con los glifos de la barra de herramientas. *(Conservado al 100%)*

---

## 5. Plugins NO Referenciados (40)

Los siguientes 40 plugins vienen en el paquete por defecto de AdminLTE pero NO son importados en ningún archivo PHP ni JS del ERP:

- `bootstrap-colorpicker`
- `bootstrap-slider`
- `bootstrap-switch`
- `bootstrap4-duallistbox`
- `bs-custom-file-input`
- `bs-stepper`
- `codemirror`
- `datatables-autofill`
- `datatables-colreorder`
- `datatables-fixedcolumns`
- `datatables-fixedheader`
- `datatables-keytable`
- `datatables-rowgroup`
- `datatables-rowreorder`
- `datatables-scroller`
- `datatables-searchbuilder`
- `datatables-searchpanes`
- `datatables-select`
- `dropzone`
- `ekko-lightbox`
- `fastclick`
- `filterizr`
- `flag-icon-css`
- `flot`
- `fullcalendar`
- `inputmask`
- `ion-rangeslider`
- `jquery-knob`
- `jquery-mapael`
- `jquery-mousewheel`
- `jquery-ui`
- `jquery-validation`
- `jsgrid`
- `moment`
- `pace-progress`
- `popper`
- `raphael`
- `sparklines`
- `toastr`
- `uplot`

---

## 6. Carpetas y Archivos Globales a Eliminar

1. `docs/` (32,19 MB, 167 archivos): Documentación estática de AdminLTE en HTML/MD.
2. `pages/` (2,43 MB, 64 archivos): Plantillas y ejemplos de demostración de AdminLTE.
3. `build/` (0,33 MB, 114 archivos): Scripts de compilación de desarrollo (npm, scss).
4. `.github/` (0,01 MB, 9 archivos): Workflows y templates de GitHub de AdminLTE.
5. Archivos de desarrollo en la raíz: `package-lock.json` (1,08 MB), `index.html`, `index2.html`, `index3.html`, `iframe.html`, `starter.html`, `Dockerfile`, `docker-compose.yml`, etc.
6. Plugins no referenciados completos: 40 carpetas (21,67 MB, 1.554 archivos).
7. Archivos `.map` (source maps), `.scss`, `.less`, `package.json`, `README.md` y carpetas `src/`, `test/`, `examples/` dentro de plugins en uso.
