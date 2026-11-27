<?php

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
                            <p class="text-muted small mb-0 mt-1">Consulte el historial de versiones publicadas y las mejoras implementadas</p>
                        </div>
                        <div class="col-sm-6 d-flex justify-content-sm-end align-items-center mt-3 mt-sm-0 flex-wrap gap-2">
                            <button type="button" class="btn btn-outline-secondary btn-sm shadow-sm font-weight-bold" id="btn_verificar_actualizaciones" style="border-radius: 8px;">
                                <i class="fas fa-sync-alt mr-1"></i> Verificar Actualizaciones
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
                            <div class="col-xl-4 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #2563EB !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Versión en Uso</span>
                                            <div class="p-2 rounded-circle bg-light text-primary"><i class="fas fa-server"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-dark mb-1" id="kpi_installed_version">v1.0.0</h3>
                                        <small class="text-muted" id="kpi_installed_date"><i class="fas fa-calendar-alt mr-1"></i>En ejecución activa</small>
                                    </div>
                                </div>
                            </div>

                            <!-- KPI 2: Última Versión Publicada -->
                            <div class="col-xl-4 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #10B981 !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Última Versión Oficial</span>
                                            <div class="p-2 rounded-circle bg-light text-success"><i class="fas fa-cloud-upload-alt"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-dark mb-1" id="kpi_latest_version">--</h3>
                                        <small class="text-muted" id="kpi_latest_date"><i class="fas fa-calendar-alt mr-1"></i>Fecha de lanzamiento</small>
                                    </div>
                                </div>
                            </div>

                            <!-- KPI 3: Estado de Actualización -->
                            <div class="col-xl-4 col-md-12 mb-3">
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
                        </div>

                        <!-- Nota informativa para clientes -->
                        <div class="alert alert-light border shadow-sm mb-4" style="border-radius: 10px; border-left: 4px solid #2563EB !important;">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-info-circle text-primary fa-2x mr-3"></i>
                                <div>
                                    <strong class="text-dark">Actualizaciones del Software:</strong>
                                    <p class="text-muted small mb-0 mt-1">
                                        Este módulo informativo muestra el historial oficial de lanzamientos y las mejoras desplegadas en la plataforma.
                                        Para soporte o consultas sobre nuevas características, contacte al equipo de administración.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Tabla de Versiones Informativa -->
                        <div class="card border-0 shadow-sm" style="border-radius: 12px;">
                            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap">
                                <h5 class="card-title font-weight-bold text-dark mb-0">
                                    <i class="fas fa-history mr-2 text-primary"></i>Historial de Publicaciones
                                </h5>
                                <div class="card-tools text-muted small">
                                    <span id="txt_total_publicadas">0 versiones disponibles</span>
                                </div>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table id="tabla_versiones" class="table table-hover align-middle mb-0" style="width: 100%;">
                                        <thead class="bg-light text-muted small text-uppercase font-weight-bold">
                                            <tr>
                                                <th class="pl-4">Versión</th>
                                                <th>Nombre del Lanzamiento</th>
                                                <th>Prioridad</th>
                                                <th>Fecha de Publicación</th>
                                                <th>Cambios y Mejoras</th>
                                                <th class="text-right pr-4">Novedades</th>
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
             MODAL: DETALLES DE NOVEDADES Y MEJORAS (SOLO LECTURA)
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
                            <div class="col-sm-6">
                                <small class="text-muted font-weight-bold d-block">Prioridad de Actualización</small>
                                <span id="detalle_modal_priority">--</span>
                            </div>
                            <div class="col-sm-6">
                                <small class="text-muted font-weight-bold d-block">Fecha de Publicación</small>
                                <span id="detalle_modal_date" class="small text-dark">--</span>
                            </div>
                        </div>

                        <div class="mb-3">
                            <small class="text-muted font-weight-bold d-block">Descripción</small>
                            <p class="text-muted small mb-0" id="detalle_modal_desc">--</p>
                        </div>

                        <h6 class="font-weight-bold text-dark mt-4 mb-2"><i class="fas fa-file-alt mr-2 text-primary"></i>Novedades y Correcciones Incluidas</h6>
                        <div id="detalle_modal_changelog" class="p-3 bg-light rounded" style="max-height: 300px; overflow-y: auto;">
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
        import VersionesController from "<?php echo $URL; ?>/public/assets/js/controllers/configuracion/versiones_controller.js?v=<?php echo $APP_VERSION; ?>";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            VersionesController.init();
        });
    </script>
</body>

</html>
