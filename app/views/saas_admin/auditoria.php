<?php

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../layouts/head.php';
?>

<body class="hold-transition sidebar-mini layout-fixed">
    <div class="wrapper">

        <!-- Navbar SaaS Admin Exclusivo -->
        <?php require_once __DIR__ . '/layouts/navbar.php'; ?>

        <!-- Sidebar SaaS -->
        <?php require_once __DIR__ . '/layouts/sidebar.php'; ?>

        <!-- Content Wrapper -->
        <div class="content-wrapper" style="background-color: #F8FAFC;">
            <div class="content-header pt-4">
                <div class="container-fluid">
                    <div class="d-flex justify-content-between align-items-center flex-wrap">
                        <div>
                            <h1 class="m-0 font-weight-bold text-dark">
                                <i class="fas fa-history text-primary mr-2"></i>Auditoría Global
                            </h1>
                            <p class="text-muted mb-0">Trazabilidad completa de operaciones, accesos administrativos y eventos de seguridad del SaaS.</p>
                        </div>
                    </div>
                </div>
            </div>

            <section class="content">
                <div class="container-fluid">

                    <!-- Filtros de Auditoría -->
                    <div class="card shadow-sm border-0 mb-3" style="border-radius: 12px;">
                        <div class="card-body py-3">
                            <div class="row align-items-end">
                                <div class="col-md-3 col-sm-6 mb-2">
                                    <label class="small font-weight-bold text-muted text-uppercase">Método HTTP</label>
                                    <select id="filter_audit_method" class="form-control form-control-sm">
                                        <option value="">Todos los métodos</option>
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="PATCH">PATCH</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                </div>
                                <div class="col-md-2 col-sm-6 mb-2">
                                    <label class="small font-weight-bold text-muted text-uppercase">Código HTTP</label>
                                    <input type="number" id="filter_audit_status" class="form-control form-control-sm" placeholder="Ej: 200, 401, 403">
                                </div>
                                <div class="col-md-4 col-sm-8 mb-2">
                                    <label class="small font-weight-bold text-muted text-uppercase">Evento de Seguridad</label>
                                    <input type="text" id="filter_audit_event" class="form-control form-control-sm" placeholder="Ej: SUPPORT_IMPERSONATION, LOGIN">
                                </div>
                                <div class="col-md-3 col-sm-4 mb-2 d-flex">
                                    <button class="btn btn-primary btn-sm flex-fill mr-1 shadow-sm font-weight-bold" id="btn_filter_audit">
                                        <i class="fas fa-filter mr-1"></i> Filtrar
                                    </button>
                                    <button class="btn btn-outline-secondary btn-sm shadow-sm" id="btn_clear_audit_filters" title="Limpiar Filtros">
                                        <i class="fas fa-undo"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tabla de Auditoría -->
                    <div class="card shadow-sm border-0" style="border-radius: 12px;">
                        <div class="card-body">
                            <table id="tbl_saas_audit" class="table table-bordered table-striped table-hover responsive nowrap w-100">
                                <thead class="bg-dark text-white">
                                    <tr>
                                        <th class="text-center" style="width: 40px;">#</th>
                                        <th>Usuario</th>
                                        <th>Empresa</th>
                                        <th class="text-center" style="width: 70px;">Método</th>
                                        <th>Ruta / Endpoint</th>
                                        <th class="text-center">IP</th>
                                        <th class="text-center" style="width: 60px;">Código</th>
                                        <th>Fecha / Hora</th>
                                        <th class="text-center" style="width: 50px;">Detalle</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </section>
        </div>

        <!-- Modal Ver Detalle de Log -->
        <div class="modal fade" id="modalAuditDetail" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div class="modal-content shadow-lg border-0" style="border-radius: 12px;">
                    <div class="modal-header bg-dark text-white" style="border-radius: 12px 12px 0 0;">
                        <h5 class="modal-title font-weight-bold">
                            <i class="fas fa-info-circle text-info mr-2"></i>Detalle del Registro de Auditoría
                        </h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <dl>
                                    <dt class="text-muted small text-uppercase">Usuario</dt>
                                    <dd id="modal_log_user" class="font-weight-bold text-dark">---</dd>

                                    <dt class="text-muted small text-uppercase">Empresa</dt>
                                    <dd id="modal_log_company" class="text-dark">---</dd>

                                    <dt class="text-muted small text-uppercase">Dirección IP</dt>
                                    <dd id="modal_log_ip" class="text-monospace">---</dd>
                                </dl>
                            </div>
                            <div class="col-md-6">
                                <dl>
                                    <dt class="text-muted small text-uppercase">Método y Estado</dt>
                                    <dd id="modal_log_method_status">---</dd>

                                    <dt class="text-muted small text-uppercase">Ruta Completa</dt>
                                    <dd id="modal_log_path" class="text-monospace small text-break">---</dd>

                                    <dt class="text-muted small text-uppercase">Fecha y Hora</dt>
                                    <dd id="modal_log_date" class="text-muted">---</dd>
                                </dl>
                            </div>
                        </div>

                        <div class="form-group mb-3">
                            <label class="text-muted small text-uppercase font-weight-bold">Agente de Usuario (User-Agent)</label>
                            <div id="modal_log_user_agent" class="p-2 bg-light border rounded small text-monospace text-break">---</div>
                        </div>

                        <div class="form-group mb-0">
                            <label class="text-muted small text-uppercase font-weight-bold">Payload / Datos de la Operación</label>
                            <pre id="modal_log_payload" class="bg-dark text-light p-3 rounded" style="max-height: 250px; overflow-y: auto; font-size: 0.8rem;"></pre>
                        </div>
                    </div>
                    <div class="modal-footer bg-light" style="border-radius: 0 0 12px 12px;">
                        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>

        <?php
        require_once __DIR__ . '/../layouts/control-sidebar.php';
        require_once __DIR__ . '/../layouts/footer.php';
        ?>
    </div>

    <!-- Controlador Auditoría -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import AuditoriaController from "<?php echo $URL; ?>/public/assets/js/controllers/saas_admin/auditoria_controller.js";

        document.addEventListener("DOMContentLoaded", async () => {
            const ok = await App.bootstrap();
            if (ok) {
                AuditoriaController.init();
            }
        });
    </script>
</body>
</html>
