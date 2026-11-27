# REGISTRO DE LIMPIEZA Y OPTIMIZACIÓN — VENDOR ADMINLTE 3.2.0
**Inventario P.M.E. ERP**  
*Fecha de ejecución: 2026-11-27*  
*Rama de trabajo: `fix/subscription-expiry-v1.15.3`*

---

## 1. Métricas de Rendimiento y Ahorro

| Indicador | Antes de la Limpieza | Después de la Limpieza | Diferencia / Ahorro | % Reducción |
| :--- | :---: | :---: | :---: | :---: |
| **Total de Archivos** | **2.435 archivos** | **556 archivos** | **-1.879 archivos** | **-77,17%** |
| **Peso Total en Disco** | **117,97 MB** | **33,05 MB** | **-84,93 MB** | **-71,99%** |
| **Backup de Seguridad** | *No existía* | `AdminLTE-3.2.0.bak.zip` (27,56 MB) | *2.435 archivos respaldados* | — |

---

## 2. Categorías Eliminadas de Forma Segura

Se eliminaron **1.879 archivos** que no tienen ninguna referencia activa en las vistas, controladores o estilos del ERP:

1. **Documentación y Demos de AdminLTE (34,62 MB):**
   - `docs/`: 167 archivos (32,19 MB) de documentación HTML/MD de la plantilla.
   - `pages/`: 64 archivos (2,43 MB) con vistas de ejemplo y plantillas estáticas de AdminLTE.
2. **Entornos de Compilación y Configuración de Desarrollo (1,41 MB):**
   - `build/`: 114 archivos (0,33 MB) con scripts npm, gruntfile y fuentes scss de desarrollo.
   - `.github/`: 9 archivos de workflows y templates de issues de AdminLTE.
   - Archivos raíz: `package-lock.json` (1,08 MB), `package.json`, `bower.json`, `composer.json`, `Gruntfile.js`, `Dockerfile`, `docker-compose.yml`, `index.html`, `index2.html`, `index3.html`, `iframe.html`, `starter.html`, `.eslintrc.json`, `.stylelintrc`, etc.
3. **Plugins NO Utilizados en el ERP (39 plugins completos, ~21,67 MB):**
   - `bootstrap-colorpicker`, `bootstrap-slider`, `bootstrap-switch`, `bootstrap4-duallistbox`
   - `bs-custom-file-input`, `bs-stepper`, `codemirror`
   - Extensiones de datatables no usadas: `datatables-autofill`, `datatables-colreorder`, `datatables-fixedcolumns`, `datatables-fixedheader`, `datatables-keytable`, `datatables-rowgroup`, `datatables-rowreorder`, `datatables-scroller`, `datatables-searchbuilder`, `datatables-searchpanes`, `datatables-select`
   - `dropzone`, `ekko-lightbox`, `fastclick`, `filterizr`
   - `flag-icon-css` (15+ MB de banderas SVG no requeridas en el ERP)
   - `flot`, `fullcalendar`, `inputmask`, `ion-rangeslider`
   - `jquery-knob`, `jquery-mapael`, `jquery-mousewheel`, `jquery-ui`, `jquery-validation`, `jsgrid`
   - `pace-progress`, `popper`, `raphael`, `sparklines`, `toastr`, `uplot`
4. **Archivos de Depuración y Fuentes dentro de Plugins en Uso (~27,2 MB):**
   - Todos los archivos `.map` (source maps) de `dist/` y `plugins/`.
   - Todas las carpetas `src/`, `test/`, `tests/`, `examples/`, `demo/`, `docs/` dentro de plugins usados.
   - Archivos fuente `.scss`, `.less`, `.ts` y metadatos (`package.json`, `README.md`, `LICENSE.md`) de los plugins.

---

## 3. Archivos y Dependencias Conservadas por Seguridad ([DEPENDENCIA INDIRECTA])

Siguiendo el principio **Fail-Safe > Ahorro de espacio**, se conservaron intactos todos los recursos binarios y de ejecución:

- **`plugins/moment/`**: Conservado como dependencia indirecta para selectores de rango de fecha y tempusdominus.
- **`plugins/fontawesome-free/webfonts/`**: Todos los formatos tipográficos (`.woff2`, `.ttf`, `.woff`, `.eot`) para iconos FontAwesome.
- **`plugins/select2/js/i18n/`**: Paquetes de idioma (especialmente `es.js` para formularios en español).
- **`plugins/pdfmake/vfs_fonts.js`**: Fuentes requeridas para la exportación de reportes PDF en DataTables.
- **`plugins/summernote/font/`**: Glifos de la barra de herramientas del editor enriquecido.
- **`plugins/datatables-bs4/` e imágenes**: Iconos de ordenamiento de columnas de tablas (`sort_asc.png`, `sort_both.png`, etc.).
- **`dist/css/adminlte.min.css` y `dist/js/adminlte.js`**: Estilos y runtime central de la aplicación.

---

## 4. Instrucciones de Rollback Inmediato

Si en alguna prueba manual se detectara la ausencia de un archivo o plugin imprevisto, la restauración es inmediata:

### Opción A: Mediante PowerShell (Windows)
```powershell
Expand-Archive -Path "f:\XAMPP\htdocs\frontend-inventario-pme\public\assets\vendor\AdminLTE-3.2.0.bak.zip" -DestinationPath "f:\XAMPP\htdocs\frontend-inventario-pme\public\assets\vendor\" -Force
```

### Opción B: Mediante Git / Terminal Bash
```bash
unzip -o public/assets/vendor/AdminLTE-3.2.0.bak.zip -d public/assets/vendor/
```

---

## 5. Estado de Versionamiento

- El archivo de respaldo `public/assets/vendor/AdminLTE-3.2.0.bak.zip` fue añadido al `.gitignore` para no inflar el repositorio Git.
- Todos los archivos optimizados se mantienen en la rama de trabajo `fix/subscription-expiry-v1.15.3`.
