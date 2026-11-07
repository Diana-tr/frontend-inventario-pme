<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../layouts/head.php';
?>

<body class="hold-transition sidebar-mini layout-fixed">
    <div class="wrapper">
        <!-- Preloader -->
        <div class="preloader flex-column justify-content-center align-items-center">
            <img class="animation__shake" src="<?php echo $URL; ?>/public/assets/img/logo-pme.png" alt="Logo" height="60" width="60">
        </div>

        <?php
        require_once __DIR__ . '/../layouts/navbar.php';
        require_once __DIR__ . '/../layouts/sidebar.php';
        ?>

        <div class="content-wrapper" style="background-color: #F8FAFC !important;">
            <!-- Header -->
            <div class="content-header py-4">
                <div class="container-fluid" style="max-width: 1300px;">
                    <div class="row mb-2 align-items-center">
                        <div class="col-sm-6">
                            <h2 class="m-0 font-weight-bold text-dark">
                                <i class="fas fa-code-branch mr-2" style="color: #2563EB;"></i>Actualizaciones del Sistema
                            </h2>
                            <p class="text-muted small mb-0 mt-1">Consulte el historial de versiones y las mejoras del sistema</p>
                        </div>
                        <div class="col-sm-6 d-flex justify-content-sm-end align-items-center mt-3 mt-sm-0 flex-wrap gap-2">
                            <button type="button" class="btn btn-outline-secondary btn-sm shadow-sm font-weight-bold mr-2" id="btn_verificar_actualizaciones" style="border-radius: 8px;">
                                <i class="fas fa-sync-alt mr-1"></i> Verificar Actualizaciones
                            </button>
                            <button type="button" class="btn btn-primary btn-sm shadow-sm font-weight-bold" id="btn_modal_nueva_version" data-permission="system.manage_releases" style="border-radius: 8px;">
                                <i class="fas fa-plus mr-1"></i> Registrar Nueva Versión
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content pb-5">
                <div class="container-fluid" style="max-width: 1300px;">

                    <!-- Loader principal -->
                    <div id="versiones_loader" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
                        <p class="mt-2 text-muted font-weight-bold">Consultando información de versiones...</p>
                    </div>

                    <!-- Contenedor de Contenido -->
                    <div id="versiones_content" style="display: none;">

                        <!-- KPIs de Versión -->
                        <div class="row mb-4">
                            <!-- KPI 1: Versión Instalada -->
                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #2563EB !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Versión Instalada</span>
                                            <div class="p-2 rounded-circle bg-light text-primary"><i class="fas fa-server"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-dark mb-1" id="kpi_installed_version">v1.0.0</h3>
                                        <small class="text-muted" id="kpi_installed_date"><i class="fas fa-calendar-alt mr-1"></i>En ejecución en este servidor</small>
                                    </div>
                                </div>
                            </div>

                            <!-- KPI 2: Última Versión Publicada -->
                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #10B981 !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Última Publicada</span>
                                            <div class="p-2 rounded-circle bg-light text-success"><i class="fas fa-cloud-upload-alt"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-dark mb-1" id="kpi_latest_version">--</h3>
                                        <small class="text-muted" id="kpi_latest_date"><i class="fas fa-calendar-alt mr-1"></i>Fecha no disponible</small>
                                    </div>
                                </div>
                            </div>

                            <!-- KPI 3: Estado de Actualización -->
                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #F59E0B !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Estado del Sistema</span>
                                            <div class="p-2 rounded-circle bg-light text-warning"><i class="fas fa-check-circle"></i></div>
                                        </div>
                                        <h4 class="font-weight-bold text-dark mb-1 mt-1" id="kpi_update_status">Verificando...</h4>
                                        <small class="text-muted" id="kpi_update_subtext"><i class="fas fa-info-circle mr-1"></i>Sincronizado</small>
                                    </div>
                                </div>
                            </div>

                            <!-- KPI 4: Total Versiones Registradas -->
                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #6366F1 !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Versiones Registradas</span>
                                            <div class="p-2 rounded-circle bg-light text-indigo"><i class="fas fa-archive"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-dark mb-1" id="kpi_total_versions">0</h3>
                                        <small class="text-muted" id="kpi_draft_count">0 borradores activos</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Nota informativa sobre despliegue manual -->
                        <div class="alert alert-light border shadow-sm mb-4" style="border-radius: 10px; border-left: 4px solid #2563EB !important;">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-shield-alt text-primary fa-2x mr-3"></i>
                                <div>
                                    <strong class="text-dark">Principio de Seguridad y Control de Despliegues:</strong>
                                    <p class="text-muted small mb-0 mt-1">
                                        Este módulo gestiona la documentación, novedades y detección de versiones.
                                        <strong>No realiza descargas ni actualizaciones automáticas</strong>.
                                        Cualquier instalación de una nueva versión debe ser realizada manualmente por el administrador mediante los procedimientos de despliegue establecidos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Tabla de Versiones -->
                        <div class="card border-0 shadow-sm" style="border-radius: 12px;">
                            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap">
                                <h5 class="card-title font-weight-bold text-dark mb-0">
                                    <i class="fas fa-history mr-2 text-primary"></i>Historial de Versiones del Software
                                </h5>
                                <div class="card-tools d-flex align-items-center">
                                    <select id="filtro_estado_version" class="custom-select custom-select-sm shadow-sm" style="border-radius: 6px; width: 150px;">
                                        <option value="">Todos los estados</option>
                                        <option value="PUBLISHED">Publicadas</option>
                                        <option value="DRAFT">Borradores</option>
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
                                                <th>Novedades</th>
                                                <th>Publicado Por</th>
                                                <th class="text-right pr-4">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tbody_versiones" style="font-size: 0.9rem;">
                                            <!-- Se puebla dinámicamente -->
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
             MODAL 1: REGISTRAR / EDITAR VERSIÓN
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
                                    <small class="text-muted">Desde qué versión se puede actualizar directamente</small>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="font-weight-bold text-muted small">Requisitos Previos</label>
                                    <input type="text" class="form-control" id="version_prerequisites" placeholder="Ej: Copia de seguridad obligatoria" style="border-radius: 8px;">
                                </div>
                            </div>

                            <div class="form-group mb-0">
                                <label class="font-weight-bold text-muted small">Instrucciones de Actualización Manual</label>
                                <textarea class="form-control font-monospace" id="version_upgrade_instructions" rows="3" placeholder="Pasos que debe ejecutar el administrador (ej: git pull, pip install, migrate)..." style="border-radius: 8px; font-family: monospace; font-size: 0.85rem;"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer bg-light border-0 px-4 py-3" style="border-radius: 0 0 16px 16px;">
                            <button type="button" class="btn btn-secondary btn-sm font-weight-bold" data-dismiss="modal" style="border-radius: 8px;">Cancelar</button>
                            <button type="submit" class="btn btn-primary btn-sm font-weight-bold" id="btn_guardar_version" style="border-radius: 8px;">
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
                                <i class="fas fa-list-alt text-primary mr-2"></i>Novedades y Cambios — <span id="changelog_version_badge">v1.0.0</span>
                            </h5>
                            <p class="text-muted small mb-0">Clasifique y detalle los cambios incluidos en este lanzamiento</p>
                        </div>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body px-4 py-3">
                        <!-- Ficha informativa de la versión -->
                        <div id="changelog_version_info" class="p-3 mb-3 bg-white rounded border shadow-sm">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="font-weight-bold text-dark" id="modal_ver_fullname" style="font-size: 1rem;">--</span>
                                <small class="text-muted" id="modal_ver_published_date"><i class="fas fa-calendar-alt mr-1"></i>--</small>
                            </div>
                            <p class="text-muted small mb-2" id="modal_ver_description">--</p>
                            <div id="modal_ver_compat_box" class="p-2 bg-light rounded text-muted small" style="display: none; font-size: 0.8rem;">
                                <div><i class="fas fa-shield-alt text-primary mr-1"></i> <span id="modal_ver_compat_text"></span></div>
                            </div>
                        </div>

                        <!-- Formulario para agregar entrada de novedad -->
                        <div id="seccion_agregar_novedad" class="p-3 bg-light rounded border mb-4">
                            <h6 class="font-weight-bold text-dark mb-3"><i class="fas fa-plus-circle text-success mr-1"></i>Agregar Cambio a la Versión</h6>
                            <form id="form_add_changelog">
                                <div class="row">
                                    <div class="col-md-4 mb-2">
                                        <label class="font-weight-bold text-muted small">Categoría <span class="text-danger">*</span></label>
                                        <select class="custom-select custom-select-sm" id="entry_category" required style="border-radius: 6px;">
                                            <option value="FEATURE">Nueva Funcionalidad</option>
                                            <option value="IMPROVEMENT">Mejora</option>
                                            <option value="BUGFIX">Corrección de Error</option>
                                            <option value="SECURITY">Seguridad</option>
                                            <option value="TECHNICAL">Cambio Técnico</option>
                                            <option value="BREAKING">Cambio Incompatible</option>
                                        </select>
                                    </div>
                                    <div class="col-md-8 mb-2">
                                        <label class="font-weight-bold text-muted small">Título del Cambio <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control form-control-sm" id="entry_title" placeholder="Ej: Nuevo panel de tesorería y conciliación" required style="border-radius: 6px;">
                                    </div>
                                </div>
                                <div class="form-group mb-2">
                                    <label class="font-weight-bold text-muted small">Descripción Detallada (opcional)</label>
                                    <textarea class="form-control form-control-sm" id="entry_description" rows="2" placeholder="Explique qué impacto tiene este cambio o cómo se utiliza..." style="border-radius: 6px;"></textarea>
                                </div>
                                <div class="text-right">
                                    <button type="submit" class="btn btn-success btn-sm font-weight-bold" id="btn_agregar_entrada" style="border-radius: 6px;">
                                        <i class="fas fa-plus mr-1"></i> Agregar Cambio
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Lista de entradas registradas -->
                        <h6 class="font-weight-bold text-dark mb-2"><i class="fas fa-tasks mr-1 text-primary"></i>Cambios Registrados en esta Versión</h6>
                        <div id="lista_entradas_container" style="max-height: 280px; overflow-y: auto;">
                            <!-- Se puebla dinámicamente -->
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0 px-4 py-3" style="border-radius: 0 0 16px 16px;">
                        <button type="button" class="btn btn-secondary btn-sm font-weight-bold" data-dismiss="modal" style="border-radius: 8px;">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ============================================================
             MODAL 3: CONFIRMACIÓN DE PUBLICACIÓN
             ============================================================ -->
        <div class="modal fade" id="modal_publicar" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
                    <div class="modal-header bg-white border-0 pb-0 pt-4 px-4">
                        <h5 class="modal-title font-weight-bold text-dark">
                            <i class="fas fa-rocket text-success mr-2"></i>Publicar Versión <span id="pub_version_label">v1.0.0</span>
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body px-4 py-3">
                        <div class="alert alert-warning mb-3 p-3" style="font-size: 0.85rem; border-radius: 8px;">
                            <i class="fas fa-exclamation-triangle mr-1"></i>
                            <strong>Atención:</strong> Una vez publicada, la versión será visible para todos los usuarios y notificada al sistema. No podrá ser modificada silenciosamente.
                        </div>

                        <div class="p-3 bg-light rounded border mb-3 text-muted" style="font-size: 0.85rem;">
                            <p class="mb-1"><strong>Versión:</strong> <span id="pub_version_val">--</span></p>
                            <p class="mb-1"><strong>Nombre:</strong> <span id="pub_name_val">--</span></p>
                            <p class="mb-1"><strong>Prioridad:</strong> <span id="pub_priority_val">--</span></p>
                            <p class="mb-0"><strong>Total Cambios:</strong> <span id="pub_changes_val">0</span> cambios registrados</p>
                        </div>

                        <!-- Checkbox para forzar en caso de corrección administrativa -->
                        <div class="custom-control custom-checkbox mb-2">
                            <input type="checkbox" class="custom-control-input" id="check_force_publish">
                            <label class="custom-control-label small font-weight-bold text-muted" for="check_force_publish">
                                Publicación administrativa forzada (solo si no es superior a la última publicada)
                            </label>
                        </div>

                        <div id="seccion_force_reason" style="display: none;" class="mt-2">
                            <label class="font-weight-bold text-danger small">Motivo justificado del forzado <span class="text-danger">*</span></label>
                            <textarea class="form-control form-control-sm" id="force_publish_reason" rows="2" placeholder="Explique por qué se fuerza la publicación..." style="border-radius: 6px;"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0 px-4 py-3" style="border-radius: 0 0 16px 16px;">
                        <button type="button" class="btn btn-secondary btn-sm font-weight-bold" data-dismiss="modal" style="border-radius: 8px;">Cancelar</button>
                        <button type="button" class="btn btn-success btn-sm font-weight-bold" id="btn_confirmar_publicar" style="border-radius: 8px;">
                            <i class="fas fa-check mr-1"></i> Confirmar Publicación
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <?php require_once __DIR__ . '/../layouts/footer.php'; ?>
    </div>

    <!-- Script Controlador del Módulo -->
    <script type="module">
        import VersionesController from "<?php echo $URL; ?>/public/assets/js/controllers/configuracion/versiones_controller.js?v=2026";

        document.addEventListener("DOMContentLoaded", () => {
            VersionesController.init();
        });
    </script>
</body>
