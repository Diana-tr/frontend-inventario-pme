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
                                <i class="fas fa-building text-primary mr-2"></i>Detalle de Empresa
                            </h1>
                            <p class="text-muted mb-0">Perfil completo, suscripción y operaciones administrativas de la empresa cliente.</p>
                        </div>
                        <div class="mt-2 mt-md-0">
                            <a href="<?php echo $URL; ?>/saas-admin/tenants" class="btn btn-outline-secondary shadow-sm">
                                <i class="fas fa-arrow-left mr-1"></i> Volver a Empresas
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <section class="content">
                <div class="container-fluid">

                    <!-- Loader -->
                    <div id="detalle_loader" class="text-center py-5">
                        <i class="fas fa-spinner fa-spin fa-3x text-primary"></i>
                        <p class="mt-3 text-muted font-weight-bold">Cargando información de la empresa...</p>
                    </div>

                    <!-- Error State -->
                    <div id="detalle_error" style="display: none;" class="text-center py-5">
                        <i class="fas fa-exclamation-triangle fa-3x text-danger"></i>
                        <h4 class="mt-3 font-weight-bold text-dark">No se pudo cargar la empresa solicitada</h4>
                        <p class="text-muted">Es posible que el ID no sea válido o que no existan datos asociados.</p>
                        <a href="<?php echo $URL; ?>/saas-admin/tenants" class="btn btn-primary mt-2">
                            <i class="fas fa-arrow-left mr-1"></i> Volver al listado
                        </a>
                    </div>

                    <!-- Contenido Real -->
                    <div id="detalle_content" style="display: none;">

                        <!-- Fila 1: Info General + Propietario + Acciones -->
                        <div class="row">
                            <!-- Info Empresa -->
                            <div class="col-lg-8">
                                <div class="card shadow-sm border-0 mb-4" style="border-radius: 12px;">
                                    <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-3 pb-0">
                                        <h3 class="card-title font-weight-bold">
                                            <i class="fas fa-id-card text-primary mr-2"></i>Información Corporativa
                                        </h3>
                                        <span id="empresa_status_badge"></span>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <dl class="mb-0">
                                                    <dt class="text-muted small text-uppercase">Razón Social</dt>
                                                    <dd id="empresa_business_name" class="font-weight-bold text-dark" style="font-size: 1.05rem;">---</dd>

                                                    <dt class="text-muted small text-uppercase">Nombre Comercial</dt>
                                                    <dd id="empresa_trade_name" class="text-secondary">---</dd>

                                                    <dt class="text-muted small text-uppercase">NIT / Identificación Fiscal</dt>
                                                    <dd id="empresa_tax_id" class="font-weight-bold text-dark">---</dd>
                                                </dl>
                                            </div>
                                            <div class="col-md-6">
                                                <dl class="mb-0">
                                                    <dt class="text-muted small text-uppercase">Correo Electrónico</dt>
                                                    <dd id="empresa_email" class="text-dark">---</dd>

                                                    <dt class="text-muted small text-uppercase">Teléfono</dt>
                                                    <dd id="empresa_phone" class="text-dark">---</dd>

                                                    <dt class="text-muted small text-uppercase">Fecha de Registro</dt>
                                                    <dd id="empresa_created_at" class="text-muted">---</dd>
                                                </dl>
                                            </div>
                                        </div>
                                        <div class="row mt-3 pt-3 border-top">
                                            <div class="col-12 d-flex flex-wrap align-items-center">
                                                <span class="badge badge-light border px-3 py-2 mr-2 mb-1" style="font-size: 0.85rem;">
                                                    <i class="fas fa-users text-primary mr-1"></i> Miembros Activos: <strong id="empresa_members_count" class="text-dark">0</strong>
                                                </span>
                                                <span class="badge badge-light border px-3 py-2 mb-1" style="font-size: 0.85rem;">
                                                    <i class="fas fa-fingerprint text-muted mr-1"></i> ID Empresa: <strong id="empresa_id_display" class="text-dark">#</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Propietario + Acciones Rápidas -->
                            <div class="col-lg-4">
                                <!-- Tarjeta Propietario -->
                                <div class="card shadow-sm border-0 mb-3" style="border-radius: 12px;">
                                    <div class="card-header bg-white border-0 pt-3 pb-0">
                                        <h3 class="card-title font-weight-bold">
                                            <i class="fas fa-user-tie text-info mr-2"></i>Propietario / Tenant Admin
                                        </h3>
                                    </div>
                                    <div class="card-body">
                                        <div class="d-flex align-items-center">
                                            <div class="img-circle elevation-2 d-flex align-items-center justify-content-center mr-3" style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-weight: 700; font-size: 1.2rem; flex-shrink: 0;">
                                                <span id="owner_initials">--</span>
                                            </div>
                                            <div class="text-truncate">
                                                <strong id="owner_name" class="d-block text-dark text-truncate">---</strong>
                                                <small id="owner_email" class="d-block text-muted text-truncate">---</small>
                                                <span class="badge badge-info mt-1" style="font-size: 0.7rem;">PROPIETARIO</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Acciones Administrativas -->
                                <div class="card shadow-sm border-0 mb-4" style="border-radius: 12px;">
                                    <div class="card-header bg-white border-0 pt-3 pb-0">
                                        <h3 class="card-title font-weight-bold">
                                            <i class="fas fa-shield-alt text-warning mr-2"></i>Acciones Administrativas
                                        </h3>
                                    </div>
                                    <div class="card-body">
                                        <button class="btn btn-outline-info btn-block mb-2 shadow-sm font-weight-bold text-left" id="btn_impersonate">
                                            <i class="fas fa-user-secret mr-2"></i> Entrar como Soporte Técnico
                                        </button>
                                        <button class="btn btn-outline-primary btn-block mb-2 shadow-sm font-weight-bold text-left" id="btn_extend_trial">
                                            <i class="fas fa-calendar-plus mr-2"></i> Extender Período de Prueba
                                        </button>
                                        <button class="btn btn-outline-warning btn-block shadow-sm font-weight-bold text-left" id="btn_toggle_status">
                                            <i class="fas fa-pause-circle mr-2" id="icon_toggle_status"></i> <span id="btn_toggle_text">Suspender Empresa</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Fila 2: Suscripción Actual -->
                        <div class="row">
                            <div class="col-12">
                                <div class="card shadow-sm border-0 mb-4" style="border-radius: 12px;">
                                    <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-3 pb-0">
                                        <h3 class="card-title font-weight-bold">
                                            <i class="fas fa-credit-card text-success mr-2"></i>Suscripción Actual
                                        </h3>
                                        <span id="subscription_status_badge"></span>
                                    </div>
                                    <div class="card-body" id="subscription_info">
                                        <p class="text-muted mb-0">Cargando estado de suscripción...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Fila 3: Historial de Suscripciones + Historial de Pagos -->
                        <div class="row">
                            <!-- Historial de Suscripciones -->
                            <div class="col-lg-6">
                                <div class="card shadow-sm border-0 mb-4" style="border-radius: 12px;">
                                    <div class="card-header bg-white border-0 pt-3 pb-2">
                                        <h3 class="card-title font-weight-bold">
                                            <i class="fas fa-history text-secondary mr-2"></i>Historial de Suscripciones
                                        </h3>
                                    </div>
                                    <div class="card-body p-0">
                                        <div class="table-responsive">
                                            <table class="table table-hover mb-0 table-sm">
                                                <thead class="bg-light">
                                                    <tr>
                                                        <th>Plan</th>
                                                        <th>Estado</th>
                                                        <th>Inicio</th>
                                                        <th>Fin</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="tbody_subscriptions">
                                                    <tr><td colspan="4" class="text-center text-muted py-3">Sin registros de suscripciones.</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Historial de Pagos -->
                            <div class="col-lg-6">
                                <div class="card shadow-sm border-0 mb-4" style="border-radius: 12px;">
                                    <div class="card-header bg-white border-0 pt-3 pb-2">
                                        <h3 class="card-title font-weight-bold">
                                            <i class="fas fa-receipt text-danger mr-2"></i>Historial de Pagos Recientes
                                        </h3>
                                    </div>
                                    <div class="card-body p-0">
                                        <div class="table-responsive">
                                            <table class="table table-hover mb-0 table-sm">
                                                <thead class="bg-light">
                                                    <tr>
                                                        <th>Plan</th>
                                                        <th>Monto</th>
                                                        <th>Método</th>
                                                        <th>Estado</th>
                                                        <th>Fecha</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="tbody_payments">
                                                    <tr><td colspan="5" class="text-center text-muted py-3">Sin pagos registrados.</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>

        <!-- Modal Extender Prueba -->
        <div class="modal fade" id="modalExtendTrialDetail" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content shadow-lg border-0" style="border-radius: 12px;">
                    <div class="modal-header bg-primary text-white" style="border-radius: 12px 12px 0 0;">
                        <h5 class="modal-title font-weight-bold">
                            <i class="fas fa-calendar-plus mr-2"></i>Extender Período de Prueba
                        </h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form id="form_extend_trial_detail">
                        <div class="modal-body">
                            <p class="text-muted small">
                                Otorga días adicionales de prueba a la empresa. Esta acción quedará registrada en la auditoría.
                            </p>
                            <div class="form-group">
                                <label for="extend_detail_days" class="font-weight-bold">Días Adicionales <span class="text-danger">*</span></label>
                                <input type="number" class="form-control" id="extend_detail_days" min="1" max="90" value="7" required>
                            </div>
                            <div class="form-group mb-0">
                                <label for="extend_detail_reason" class="font-weight-bold">Motivo / Justificación</label>
                                <textarea class="form-control" id="extend_detail_reason" rows="2" placeholder="Ej: Solicitud de soporte, evaluación ampliada..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer bg-light" style="border-radius: 0 0 12px 12px;">
                            <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary btn-sm">Confirmar Extensión</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <?php
        require_once __DIR__ . '/../layouts/control-sidebar.php';
        require_once __DIR__ . '/../layouts/footer.php';
        ?>
    </div>

    <!-- Controlador Vista Detalle Empresa -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import EmpresaDetalleController from "<?php echo $URL; ?>/public/assets/js/controllers/saas_admin/empresa_detalle_controller.js";

        document.addEventListener("DOMContentLoaded", async () => {
            const ok = await App.bootstrap();
            if (ok) {
                EmpresaDetalleController.init();
            }
        });
    </script>
</body>
</html>
