<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../layouts/head.php';
?>

<body class="hold-transition sidebar-mini layout-fixed">
    <div class="wrapper">

        <!-- Navbar SaaS Admin Exclusivo -->
        <?php require_once __DIR__ . '/layouts/navbar.php'; ?>

        <!-- Sidebar SaaS Admin -->
        <?php require_once __DIR__ . '/layouts/sidebar.php'; ?>

        <!-- Content Wrapper -->
        <div class="content-wrapper" style="background-color: #F8FAFC;">

            <!-- Header -->
            <div class="content-header py-4">
                <div class="container-fluid" style="max-width: 1400px;">
                    <div class="row mb-2 align-items-center">
                        <div class="col-sm-6">
                            <h1 class="m-0 font-weight-bold text-dark">
                                <i class="fas fa-code-branch mr-2 text-primary"></i>Gestión Global de Versiones
                            </h1>
                            <p class="text-muted small mb-0 mt-1">
                                Administración del ciclo de vida del software, lanzamientos SemVer y changelog de la plataforma P.M.E.
                            </p>
                        </div>
                        <div class="col-sm-6 d-flex justify-content-sm-end align-items-center mt-3 mt-sm-0 flex-wrap">
                            <button type="button" class="btn btn-outline-secondary btn-sm shadow-sm font-weight-bold mr-2" id="btn_refrescar_versiones" style="border-radius: 8px;">
                                <i class="fas fa-sync-alt mr-1"></i> Refrescar
                            </button>
                            <button type="button" class="btn btn-primary btn-sm shadow-sm font-weight-bold" id="btn_modal_nueva_version" style="border-radius: 8px;">
                                <i class="fas fa-plus mr-1"></i> Registrar Nueva Versión
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content pb-5">
                <div class="container-fluid" style="max-width: 1400px;">

                    <!-- Loader -->
                    <div id="versiones_loader" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
                        <p class="mt-2 text-muted font-weight-bold">Cargando catálogo de versiones...</p>
                    </div>

                    <!-- Contenedor -->
                    <div id="versiones_content" style="display: none;">

                        <!-- KPIs -->
                        <div class="row mb-4">
                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #2563EB !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Total Registradas</span>
                                            <div class="p-2 rounded-circle bg-light text-primary"><i class="fas fa-archive"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-dark mb-1" id="kpi_total_versiones">0</h3>
                                        <small class="text-muted">Historial completo</small>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #10B981 !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Publicadas</span>
                                            <div class="p-2 rounded-circle bg-light text-success"><i class="fas fa-check-circle"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-dark mb-1" id="kpi_publicadas">0</h3>
                                        <small class="text-muted">Visibles para los clientes</small>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #F59E0B !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Borradores</span>
                                            <div class="p-2 rounded-circle bg-light text-warning"><i class="fas fa-edit"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-dark mb-1" id="kpi_borradores">0</h3>
                                        <small class="text-muted">En preparación interna</small>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #EF4444 !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Retiradas</span>
                                            <div class="p-2 rounded-circle bg-light text-danger"><i class="fas fa-ban"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-dark mb-1" id="kpi_retiradas">0</h3>
                                        <small class="text-muted">Versiones descontinuadas</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tabla Administrativa -->
                        <div class="card border-0 shadow-sm" style="border-radius: 12px;">
                            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap">
                                <h5 class="card-title font-weight-bold text-dark mb-0">
                                    <i class="fas fa-list mr-2 text-primary"></i>Catálogo de Versiones
                                </h5>
                                <div class="card-tools d-flex align-items-center">
                                    <label for="filtro_estado_version" class="mr-2 mb-0 small text-muted font-weight-bold">Filtrar:</label>
                                    <select id="filtro_estado_version" class="custom-select custom-select-sm shadow-sm" style="border-radius: 6px; width: 170px;">
                                        <option value="">Todos los estados</option>
                                        <option value="DRAFT">Borradores</option>
                                        <option value="PUBLISHED">Publicadas</option>
                                        <option value="WITHDRAWN">Retiradas</option>
                                    </select>
                                </div>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table id="tabla_versiones" class="table table-hover align-middle mb-0" style="width: 100%;">
                                        <thead class="bg-light text-muted small text-uppercase font-weight-bold">
                                            <tr>
                                                <th class="pl-4">Versión</th>
                                                <th>Nombre</th>
                                                <th>Estado</th>
                                                <th>Prioridad</th>
                                                <th>Fecha Publicación</th>
                                                <th>Changelog</th>
                                                <th>Publicado Por</th>
                                                <th class="text-right pr-4">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tbody_versiones">
                                            <!-- Inyectado por JS -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>

        <!-- ============================================================
             MODAL 1: REGISTRAR / EDITAR BORRADOR DE VERSIÓN
             ============================================================ -->
        <div class="modal fade" id="modal_version" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
            <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
                    <div class="modal-header bg-white border-0 pb-0 pt-4 px-4">
                        <h5 class="modal-title font-weight-bold text-dark" id="modal_version_title">
                            <i class="fas fa-plus-circle text-primary mr-2"></i>Registrar Borrador de Versión
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form id="form_version">
                        <input type="hidden" id="version_id" value="">
                        <div class="modal-body px-4 py-3">
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label class="font-weight-bold text-muted small">Número SemVer <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="version_number" placeholder="Ej: 1.2.0" required style="border-radius: 8px;">
                                    <small class="text-muted">Formato: MAJOR.MINOR.PATCH</small>
                                </div>
                                <div class="col-md-5 mb-3">
                                    <label class="font-weight-bold text-muted small">Nombre Descriptivo</label>
                                    <input type="text" class="form-control" id="version_name" placeholder="Ej: Aurora / Release 1.2" style="border-radius: 8px;">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="font-weight-bold text-muted small">Prioridad</label>
                                    <select class="custom-select" id="version_priority" style="border-radius: 8px;">
                                        <option value="RECOMMENDED">Recomendada</option>
                                        <option value="MANDATORY">Obligatoria</option>
                                        <option value="OPTIONAL">Opcional</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group mb-3">
                                <label class="font-weight-bold text-muted small">Descripción General del Lanzamiento</label>
                                <textarea class="form-control" id="version_description" rows="2" placeholder="Resumen de los principales cambios y objetivos de esta versión..." style="border-radius: 8px;"></textarea>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="font-weight-bold text-muted small">Versión Mínima Compatible</label>
                                    <input type="text" class="form-control" id="version_min_compatible" placeholder="Ej: 1.0.0 (opcional)" style="border-radius: 8px;">
                                    <small class="text-muted">Desde qué versión se puede actualizar</small>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="font-weight-bold text-muted small">Requisitos Previos</label>
                                    <input type="text" class="form-control" id="version_prerequisites" placeholder="Ej: Copia de seguridad obligatoria" style="border-radius: 8px;">
                                </div>
                            </div>

                            <div class="form-group mb-0">
                                <label class="font-weight-bold text-muted small">Instrucciones de Despliegue Manual</label>
                                <textarea class="form-control font-monospace" id="version_upgrade_instructions" rows="3" placeholder="Pasos técnicos de despliegue para el equipo (ej: git pull, pip install, migrate)..." style="border-radius: 8px; font-family: monospace; font-size: 0.85rem;"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer bg-light border-0 px-4 py-3" style="border-radius: 0 0 16px 16px;">
                            <button type="button" class="btn btn-secondary btn-sm font-weight-bold" data-dismiss="modal" style="border-radius: 8px;">Cancelar</button>
                            <button type="submit" class="btn btn-primary btn-sm font-weight-bold" style="border-radius: 8px;">
                                <i class="fas fa-save mr-1"></i> Guardar Borrador
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- ============================================================
             MODAL 2: GESTOR DE NOVEDADES Y CHANGELOG
             ============================================================ -->
        <div class="modal fade" id="modal_changelog" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
            <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
                    <div class="modal-header bg-white border-0 pb-0 pt-4 px-4">
                        <div>
                            <h5 class="modal-title font-weight-bold text-dark">
                                <i class="fas fa-list-ul text-info mr-2"></i>Changelog y Novedades
                            </h5>
                            <p class="text-muted small mb-0 mt-1" id="changelog_version_title">v1.0.0</p>
                        </div>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body px-4 py-3">
                        <!-- Formulario para agregar cambio -->
                        <form id="form_add_changelog" class="p-3 bg-light rounded mb-4" style="border: 1px solid #E2E8F0;">
                            <h6 class="font-weight-bold text-dark mb-3"><i class="fas fa-plus-circle mr-1 text-primary"></i>Añadir Nueva Entrada al Changelog</h6>
                            <div class="row">
                                <div class="col-md-4 mb-2">
                                    <label class="small text-muted font-weight-bold">Categoría</label>
                                    <select class="custom-select custom-select-sm" id="changelog_entry_category" style="border-radius: 6px;">
                                        <option value="FEATURE">Novedad (Feature)</option>
                                        <option value="IMPROVEMENT">Mejora (Improvement)</option>
                                        <option value="BUGFIX">Corrección (Bugfix)</option>
                                        <option value="SECURITY">Seguridad (Security)</option>
                                        <option value="TECHNICAL">Técnico (Technical)</option>
                                        <option value="BREAKING">Incompatible (Breaking)</option>
                                    </select>
                                </div>
                                <div class="col-md-5 mb-2">
                                    <label class="small text-muted font-weight-bold">Título / Resumen <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control form-control-sm" id="changelog_entry_title" placeholder="Ej: Nuevo dashboard interactivo" required style="border-radius: 6px;">
                                </div>
                                <div class="col-md-3 mb-2">
                                    <label class="small text-muted font-weight-bold">Módulo Afectado</label>
                                    <input type="text" class="form-control form-control-sm" id="changelog_entry_module" placeholder="Ej: Ventas, Caja..." style="border-radius: 6px;">
                                </div>
                            </div>
                            <div class="form-group mb-2">
                                <label class="small text-muted font-weight-bold">Descripción detallada</label>
                                <textarea class="form-control form-control-sm" id="changelog_entry_description" rows="2" placeholder="Detalle técnico o funcional del cambio..." style="border-radius: 6px;"></textarea>
                            </div>
                            <div class="text-right">
                                <button type="submit" class="btn btn-sm btn-primary font-weight-bold" style="border-radius: 6px;">
                                    <i class="fas fa-plus mr-1"></i> Agregar al Changelog
                                </button>
                            </div>
                        </form>

                        <!-- Lista de entradas existentes -->
                        <h6 class="font-weight-bold text-dark mb-2">Cambios Registrados</h6>
                        <div id="changelog_entries_list" class="list-group list-group-flush border rounded" style="max-height: 300px; overflow-y: auto;">
                            <!-- Inyectado por JS -->
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0 px-4 py-3" style="border-radius: 0 0 16px 16px;">
                        <button type="button" class="btn btn-secondary btn-sm font-weight-bold" data-dismiss="modal" style="border-radius: 8px;">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ============================================================
             MODAL 3: PUBLICAR VERSIÓN
             ============================================================ -->
        <div class="modal fade" id="modal_publicar" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
                    <div class="modal-header bg-white border-0 pb-0 pt-4 px-4">
                        <h5 class="modal-title font-weight-bold text-dark">
                            <i class="fas fa-upload text-success mr-2"></i>Publicar Versión Oficial
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body px-4 py-3">
                        <p class="text-muted">
                            ¿Confirma que desea publicar la versión <strong class="text-dark" id="publicar_version_name"></strong>?
                        </p>
                        <p class="text-muted small">
                            Una vez publicada, esta versión será inmediatamente visible para todas las empresas clientes en su panel de Actualizaciones.
                        </p>

                        <div class="form-check mt-3 mb-2">
                            <input class="form-check-input" type="checkbox" id="check_force_publish">
                            <label class="form-check-label font-weight-bold small text-dark" for="check_force_publish">
                                Forzar publicación (Permite saltear advertencias de SemVer)
                            </label>
                        </div>
                        <div id="seccion_force_reason" style="display: none;" class="mt-2">
                            <label class="small text-muted font-weight-bold">Motivo de excepción <span class="text-danger">*</span></label>
                            <input type="text" class="form-control form-control-sm" id="input_force_reason" placeholder="Justificación técnica requerida...">
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0 px-4 py-3" style="border-radius: 0 0 16px 16px;">
                        <button type="button" class="btn btn-secondary btn-sm font-weight-bold" data-dismiss="modal" style="border-radius: 8px;">Cancelar</button>
                        <button type="button" class="btn btn-success btn-sm font-weight-bold" id="btn_confirmar_publicar" style="border-radius: 8px;">
                            <i class="fas fa-check-circle mr-1"></i> Confirmar Publicación
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ============================================================
             MODAL 4: RETIRAR VERSIÓN
             ============================================================ -->
        <div class="modal fade" id="modal_retirar" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
                    <div class="modal-header bg-white border-0 pb-0 pt-4 px-4">
                        <h5 class="modal-title font-weight-bold text-dark">
                            <i class="fas fa-ban text-danger mr-2"></i>Retirar Versión del Catálogo
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form id="form_retirar_version">
                        <input type="hidden" id="retirar_version_id" value="">
                        <div class="modal-body px-4 py-3">
                            <p class="text-muted">
                                Al retirar la versión <strong class="text-dark" id="retirar_version_name"></strong>, dejará de figurar como actualización sugerida para los clientes.
                            </p>
                            <div class="form-group mb-0">
                                <label class="small text-muted font-weight-bold">Motivo del Retiro <span class="text-danger">*</span></label>
                                <textarea class="form-control" id="retirar_reason" rows="3" placeholder="Explique la causa del retiro (ej: bug crítico en producción detectado)..." required style="border-radius: 8px;"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer bg-light border-0 px-4 py-3" style="border-radius: 0 0 16px 16px;">
                            <button type="button" class="btn btn-secondary btn-sm font-weight-bold" data-dismiss="modal" style="border-radius: 8px;">Cancelar</button>
                            <button type="submit" class="btn btn-danger btn-sm font-weight-bold" style="border-radius: 8px;">
                                <i class="fas fa-ban mr-1"></i> Retirar Versión
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- ============================================================
             MODAL 5: DETALLE DE VERSIÓN (MODO LECTURA)
             ============================================================ -->
        <div class="modal fade" id="modal_detalles" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
                    <div class="modal-header bg-white border-0 pb-0 pt-4 px-4">
                        <div>
                            <span class="badge badge-primary font-monospace px-3 py-1 mb-2" id="detalle_modal_version" style="font-size: 0.9rem;">v1.0.0</span>
                            <h4 class="modal-title font-weight-bold text-dark" id="detalle_modal_title">Título</h4>
                        </div>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body px-4 py-3">
                        <div class="row mb-3">
                            <div class="col-sm-4">
                                <small class="text-muted font-weight-bold d-block">Estado</small>
                                <span id="detalle_modal_status">--</span>
                            </div>
                            <div class="col-sm-4">
                                <small class="text-muted font-weight-bold d-block">Prioridad</small>
                                <span id="detalle_modal_priority">--</span>
                            </div>
                            <div class="col-sm-4">
                                <small class="text-muted font-weight-bold d-block">Fecha de Publicación</small>
                                <span id="detalle_modal_date" class="small text-dark">--</span>
                            </div>
                        </div>

                        <div class="mb-3">
                            <small class="text-muted font-weight-bold d-block">Descripción</small>
                            <p class="text-muted small mb-0" id="detalle_modal_desc">--</p>
                        </div>

                        <h6 class="font-weight-bold text-dark mt-4 mb-2"><i class="fas fa-file-alt mr-2 text-primary"></i>Changelog y Mejoras</h6>
                        <div id="detalle_modal_changelog" class="p-3 bg-light rounded" style="max-height: 250px; overflow-y: auto;">
                            <!-- Inyectado por JS -->
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0 px-4 py-3" style="border-radius: 0 0 16px 16px;">
                        <button type="button" class="btn btn-secondary btn-sm font-weight-bold" data-dismiss="modal" style="border-radius: 8px;">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>

        <?php
        require_once __DIR__ . '/../layouts/control-sidebar.php';
        require_once __DIR__ . '/../layouts/footer.php';
        ?>

    </div>

    <!-- Script de Inicialización -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import SaasVersionesController from "<?php echo $URL; ?>/public/assets/js/controllers/saas_admin/versiones_controller.js?v=<?php echo time(); ?>";

        document.addEventListener("DOMContentLoaded", async () => {
            const ok = await App.bootstrap();
            if (!ok) return;
            SaasVersionesController.init();
        });
    </script>
</body>

</html>
