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
                                <i class="fas fa-layer-group mr-2 text-primary"></i>Planes y Suscripciones SaaS
                            </h1>
                            <p class="text-muted small mb-0 mt-1">
                                Gestión comercial integral: catálogo de planes, asignación, cambios de plan, renovaciones y monitoreo de cuotas en tiempo real.
                            </p>
                        </div>
                        <div class="col-sm-6 d-flex justify-content-sm-end align-items-center mt-3 mt-sm-0 flex-wrap">
                            <button type="button" class="btn btn-outline-secondary btn-sm shadow-sm font-weight-bold mr-2 mb-1" id="btn_refrescar" style="border-radius: 8px;">
                                <i class="fas fa-sync-alt mr-1"></i> Refrescar
                            </button>
                            <button type="button" class="btn btn-outline-primary btn-sm shadow-sm font-weight-bold mr-2 mb-1" id="btn_asignar_suscripcion" style="border-radius: 8px;">
                                <i class="fas fa-user-plus mr-1"></i> Asignar Suscripción
                            </button>
                            <button type="button" class="btn btn-primary btn-sm shadow-sm font-weight-bold mb-1" id="btn_nuevo_plan" style="border-radius: 8px;">
                                <i class="fas fa-plus mr-1"></i> Nuevo Plan Comercial
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content pb-5">
                <div class="container-fluid" style="max-width: 1400px;">

                    <!-- KPIs Comerciales -->
                    <div class="row mb-4">
                        <div class="col-xl-3 col-md-6 mb-3">
                            <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #2563EB !important;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="text-muted small text-uppercase font-weight-bold">Planes Registrados</span>
                                        <div class="p-2 rounded-circle bg-light text-primary"><i class="fas fa-cubes"></i></div>
                                    </div>
                                    <h3 class="font-weight-bold text-dark mb-1" id="kpi_total_planes">0</h3>
                                    <small class="text-success font-weight-bold" id="kpi_planes_activos">0 activos</small>
                                </div>
                            </div>
                        </div>

                        <div class="col-xl-3 col-md-6 mb-3">
                            <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #10B981 !important;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="text-muted small text-uppercase font-weight-bold">Suscripciones Activas</span>
                                        <div class="p-2 rounded-circle bg-light text-success"><i class="fas fa-check-circle"></i></div>
                                    </div>
                                    <h3 class="font-weight-bold text-dark mb-1" id="kpi_subs_activas">0</h3>
                                    <small class="text-muted" id="kpi_subs_trials">0 en prueba</small>
                                </div>
                            </div>
                        </div>

                        <div class="col-xl-3 col-md-6 mb-3">
                            <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #EF4444 !important;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="text-muted small text-uppercase font-weight-bold">Pagos Pendientes</span>
                                        <div class="p-2 rounded-circle bg-light text-danger"><i class="fas fa-exclamation-triangle"></i></div>
                                    </div>
                                    <h3 class="font-weight-bold text-dark mb-1" id="kpi_past_due">0</h3>
                                    <small class="text-muted">En período de gracia</small>
                                </div>
                            </div>
                        </div>

                        <div class="col-xl-3 col-md-6 mb-3">
                            <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #F59E0B !important;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="text-muted small text-uppercase font-weight-bold">Próximas a Vencer</span>
                                        <div class="p-2 rounded-circle bg-light text-warning"><i class="fas fa-clock"></i></div>
                                    </div>
                                    <h3 class="font-weight-bold text-dark mb-1" id="kpi_expiring_soon">0</h3>
                                    <small class="text-muted">En los próximos 7 días</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Pestañas de Navegación -->
                    <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active font-weight-bold px-4 py-2" id="pills-planes-tab" data-toggle="pill" href="#tab-planes" role="tab" style="border-radius: 8px;">
                                <i class="fas fa-cubes mr-2"></i>Catálogo de Planes
                            </a>
                        </li>
                        <li class="nav-item ml-2">
                            <a class="nav-link font-weight-bold px-4 py-2" id="pills-suscripciones-tab" data-toggle="pill" href="#tab-suscripciones" role="tab" style="border-radius: 8px;">
                                <i class="fas fa-file-contract mr-2"></i>Suscripciones de Empresas
                            </a>
                        </li>
                    </ul>

                    <!-- Contenido de Pestañas -->
                    <div class="tab-content" id="pills-tabContent">

                        <!-- PESTAÑA 1: CATÁLOGO DE PLANES -->
                        <div class="tab-pane fade show active" id="tab-planes" role="tabpanel">
                            <div class="card border-0 shadow-sm" style="border-radius: 12px;">
                                <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                                    <h5 class="card-title font-weight-bold text-dark mb-0">
                                        <i class="fas fa-list mr-2 text-primary"></i>Planes Comerciales Disponibles
                                    </h5>
                                </div>
                                <div class="card-body p-3">
                                    <div class="table-responsive">
                                        <table id="tbl_saas_planes" class="table table-hover align-middle mb-0" style="width: 100%;">
                                            <thead class="bg-light text-muted small text-uppercase font-weight-bold">
                                                <tr>
                                                    <th class="text-center" style="width: 50px;">#</th>
                                                    <th>Código & Nombre</th>
                                                    <th>Tarifa / Ciclo</th>
                                                    <th>Límites de Recursos</th>
                                                    <th>Módulos Incluidos</th>
                                                    <th class="text-center">Estado</th>
                                                    <th class="text-right pr-4">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="tbody_planes">
                                                <!-- Cargado por JS -->
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PESTAÑA 2: SUSCRIPCIONES DE EMPRESAS -->
                        <div class="tab-pane fade" id="tab-suscripciones" role="tabpanel">
                            <div class="card border-0 shadow-sm" style="border-radius: 12px;">
                                <div class="card-header bg-white py-3 border-0">
                                    <div class="row align-items-center">
                                        <div class="col-md-4 mb-2 mb-md-0">
                                            <h5 class="card-title font-weight-bold text-dark mb-0">
                                                <i class="fas fa-building mr-2 text-primary"></i>Suscripciones Globales
                                            </h5>
                                        </div>
                                        <div class="col-md-8 d-flex justify-content-md-end align-items-center flex-wrap">
                                            <div class="form-inline">
                                                <label class="mr-2 small text-muted font-weight-bold">Estado:</label>
                                                <select id="filtro_sub_status" class="custom-select custom-select-sm mr-2 mb-1" style="border-radius: 6px; width: 140px;">
                                                    <option value="">Todos</option>
                                                    <option value="ACTIVE">Activas</option>
                                                    <option value="TRIAL">En Prueba</option>
                                                    <option value="PAST_DUE">Pago Pendiente</option>
                                                    <option value="CANCELLED">Canceladas</option>
                                                    <option value="EXPIRED">Expiradas</option>
                                                </select>

                                                <label class="mr-2 small text-muted font-weight-bold">Plan:</label>
                                                <select id="filtro_sub_plan" class="custom-select custom-select-sm mr-2 mb-1" style="border-radius: 6px; width: 140px;">
                                                    <option value="">Todos los planes</option>
                                                </select>

                                                <input type="text" id="filtro_sub_search" class="form-control form-control-sm mb-1" placeholder="Buscar empresa o NIT..." style="border-radius: 6px; width: 180px;">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-body p-3">
                                    <div class="table-responsive">
                                        <table id="tbl_saas_suscripciones" class="table table-hover align-middle mb-0" style="width: 100%;">
                                            <thead class="bg-light text-muted small text-uppercase font-weight-bold">
                                                <tr>
                                                    <th class="text-center" style="width: 50px;">#</th>
                                                    <th>Empresa</th>
                                                    <th>Plan Actual</th>
                                                    <th class="text-center">Estado</th>
                                                    <th>Vigencia</th>
                                                    <th class="text-center">Días Restantes</th>
                                                    <th class="text-right pr-4">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="tbody_suscripciones">
                                                <!-- Cargado por JS -->
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </section>
        </div>

        <?php
        require_once __DIR__ . '/../layouts/control-sidebar.php';
        require_once __DIR__ . '/../layouts/footer.php';
        ?>
    </div>

    <!-- ─────────────────────────────────────────────
         MODAL 1: Crear / Editar Plan Comercial
         ───────────────────────────────────────────── -->
    <div class="modal fade" id="modalPlan" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
                <div class="modal-header bg-primary text-white border-0" style="border-radius: 12px 12px 0 0;">
                    <h5 class="modal-title font-weight-bold" id="modalPlanTitle">
                        <i class="fas fa-layer-group mr-2"></i>Plan Comercial
                    </h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Cerrar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <form id="form_plan">
                    <input type="hidden" id="plan_id">
                    <div class="modal-body p-4">
                        <div class="row">
                            <div class="col-md-4 form-group">
                                <label class="font-weight-bold text-dark">Código Único <span class="text-danger">*</span></label>
                                <input type="text" class="form-control text-uppercase" id="plan_code" placeholder="Ej: PRO, ENTERPRISE" required maxlength="50" style="border-radius: 8px;">
                                <small class="form-text text-muted">Identificador permanente del plan.</small>
                            </div>
                            <div class="col-md-8 form-group">
                                <label class="font-weight-bold text-dark">Nombre Comercial <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="plan_name" placeholder="Ej: Plan Profesional para Medianas Empresas" required maxlength="100" style="border-radius: 8px;">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="font-weight-bold text-dark">Descripción</label>
                            <textarea class="form-control" id="plan_description" rows="2" placeholder="Describe los beneficios y alcance comercial del plan..." style="border-radius: 8px;"></textarea>
                        </div>

                        <div class="row">
                            <div class="col-md-6 form-group">
                                <label class="font-weight-bold text-dark">Precio (Tarifa) <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text">$</span>
                                    </div>
                                    <input type="number" step="0.01" min="0" class="form-control" id="plan_price" required placeholder="0.00" style="border-radius: 0 8px 8px 0;">
                                </div>
                            </div>
                            <div class="col-md-6 form-group">
                                <label class="font-weight-bold text-dark">Ciclo de Facturación <span class="text-danger">*</span></label>
                                <select class="custom-select" id="plan_billing_cycle" required style="border-radius: 8px;">
                                    <option value="MONTHLY">Mensual</option>
                                    <option value="ANNUAL">Anual</option>
                                </select>
                            </div>
                        </div>

                        <h6 class="font-weight-bold text-dark mt-3 mb-2">
                            <i class="fas fa-sliders-h mr-1 text-primary"></i>Límites de Recursos y Capacidad
                        </h6>
                        <div class="row">
                            <div class="col-md-4 form-group">
                                <label class="font-weight-bold text-dark small">Máximo de Usuarios</label>
                                <input type="number" min="1" class="form-control" id="plan_max_users" value="1" required style="border-radius: 8px;">
                                <small class="text-muted">Usuarios activos simultáneos</small>
                            </div>
                            <div class="col-md-4 form-group">
                                <label class="font-weight-bold text-dark small">Máximo de Productos</label>
                                <input type="number" min="1" class="form-control" id="plan_max_products" value="100" required style="border-radius: 8px;">
                                <small class="text-muted">Límite en catálogo</small>
                            </div>
                            <div class="col-md-4 form-group">
                                <label class="font-weight-bold text-dark small">Facturas / Mes</label>
                                <input type="number" min="1" class="form-control" id="plan_max_invoices" value="100" required style="border-radius: 8px;">
                                <small class="text-muted">Comprobantes emitidos al mes</small>
                            </div>
                        </div>

                        <!-- Módulos Habilitados (Catálogo Dinámico del Backend) -->
                        <div class="d-flex justify-content-between align-items-center mt-3 mb-2">
                            <h6 class="font-weight-bold text-dark mb-0">
                                <i class="fas fa-cubes mr-1 text-primary"></i>Módulos y Funcionalidades del Plan
                            </h6>
                            <div class="d-flex align-items-center">
                                <button type="button" class="btn btn-xs btn-outline-primary mr-1" id="btn_select_all_modules" style="border-radius: 4px; font-size: 0.75rem;">
                                    <i class="fas fa-check-double mr-1"></i>Todos
                                </button>
                                <button type="button" class="btn btn-xs btn-outline-secondary mr-2" id="btn_deselect_all_modules" style="border-radius: 4px; font-size: 0.75rem;">
                                    <i class="fas fa-times mr-1"></i>Ninguno
                                </button>
                                <span class="badge badge-primary px-2 py-1 font-weight-bold" id="badge_modules_count">0 módulos</span>
                            </div>
                        </div>
                        <small class="text-muted d-block mb-2">Seleccione los módulos comerciales a los que tendrán acceso las empresas suscritas a este plan:</small>

                        <div id="container_dynamic_modules" class="p-2 border rounded bg-white shadow-sm mb-3" style="max-height: 380px; overflow-y: auto; border-radius: 8px;">
                            <div id="modules_loading_placeholder" class="text-center py-4 text-muted">
                                <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                                <div class="small font-weight-bold">Cargando catálogo dinámico desde el servidor...</div>
                            </div>
                            <div id="modules_catalog_content" style="display: none;">
                                <!-- Se inyecta dinámicamente por planes_controller.js -->
                            </div>
                        </div>

                        <div class="custom-control custom-switch">
                            <input type="checkbox" class="custom-control-input" id="plan_is_active" checked>
                            <label class="custom-control-label font-weight-bold" for="plan_is_active">Plan Activo y Disponible Comercialment</label>
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0" style="border-radius: 0 0 12px 12px;">
                        <button type="button" class="btn btn-secondary font-weight-bold" data-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary font-weight-bold shadow-sm">
                            <i class="fas fa-save mr-1"></i> Guardar Plan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- ─────────────────────────────────────────────
         MODAL 2: Asignar Suscripción a Empresa
         ───────────────────────────────────────────── -->
    <div class="modal fade" id="modalAssignSubscription" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
                <div class="modal-header bg-primary text-white border-0" style="border-radius: 12px 12px 0 0;">
                    <h5 class="modal-title font-weight-bold">
                        <i class="fas fa-file-signature mr-2"></i>Asignar Suscripción a Empresa
                    </h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Cerrar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <form id="form_assign_subscription">
                    <div class="modal-body p-4">
                        <div class="form-group">
                            <label class="font-weight-bold text-dark">Empresa Cliente <span class="text-danger">*</span></label>
                            <select class="custom-select" id="assign_company_id" required style="border-radius: 8px;">
                                <option value="">Cargando empresas...</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="font-weight-bold text-dark">Plan Comercial <span class="text-danger">*</span></label>
                            <select class="custom-select" id="assign_plan_id" required style="border-radius: 8px;">
                                <option value="">-- Seleccionar Plan --</option>
                            </select>
                        </div>

                        <div class="row">
                            <div class="col-md-6 form-group">
                                <label class="font-weight-bold text-dark">Duración (Días) <span class="text-danger">*</span></label>
                                <input type="number" min="1" class="form-control" id="assign_duration_days" value="30" required style="border-radius: 8px;">
                                <small class="text-muted">Ej: 30 para mensual, 365 para anual</small>
                            </div>
                            <div class="col-md-6 form-group">
                                <label class="font-weight-bold text-dark">Estado Inicial <span class="text-danger">*</span></label>
                                <select class="custom-select" id="assign_status" required style="border-radius: 8px;">
                                    <option value="ACTIVE">Activa (Pagada)</option>
                                    <option value="TRIAL">En Prueba (Trial)</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group mb-0">
                            <label class="font-weight-bold text-dark">Notas / Observaciones</label>
                            <textarea class="form-control" id="assign_notes" rows="2" placeholder="Comentarios comerciales o de soporte..." style="border-radius: 8px;"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0" style="border-radius: 0 0 12px 12px;">
                        <button type="button" class="btn btn-secondary font-weight-bold" data-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary font-weight-bold shadow-sm">
                            <i class="fas fa-check-circle mr-1"></i> Asignar Suscripción
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- ─────────────────────────────────────────────
         MODAL 3: Cambiar Plan de Suscripción
         ───────────────────────────────────────────── -->
    <div class="modal fade" id="modalChangePlan" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
                <div class="modal-header bg-primary text-white border-0" style="border-radius: 12px 12px 0 0;">
                    <h5 class="modal-title font-weight-bold">
                        <i class="fas fa-exchange-alt mr-2"></i>Cambiar Plan de Suscripción
                    </h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Cerrar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <form id="form_change_plan">
                    <input type="hidden" id="change_sub_id">
                    <div class="modal-body p-4">
                        <div class="alert alert-info border-0 shadow-sm" style="border-radius: 8px;">
                            <div class="d-flex">
                                <div class="mr-2"><i class="fas fa-info-circle fa-lg"></i></div>
                                <div>
                                    <strong>Aviso Comercial:</strong> El cambio de plan entra en vigencia de inmediato ajustando límites y módulos. <strong>NO modifica ni posterga la fecha de vencimiento actual</strong>.
                                </div>
                            </div>
                        </div>

                        <div class="p-3 bg-light rounded mb-3 border">
                            <div class="small text-muted text-uppercase font-weight-bold">Empresa:</div>
                            <div class="font-weight-bold text-dark mb-2" id="change_company_name">---</div>

                            <div class="row">
                                <div class="col-6">
                                    <div class="small text-muted">Plan Actual:</div>
                                    <div class="font-weight-bold text-primary" id="change_current_plan">---</div>
                                </div>
                                <div class="col-6">
                                    <div class="small text-muted">Vence el:</div>
                                    <div class="font-weight-bold text-dark" id="change_current_expiry">---</div>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="font-weight-bold text-dark">Nuevo Plan Comercial <span class="text-danger">*</span></label>
                            <select class="custom-select" id="change_new_plan_id" required style="border-radius: 8px;">
                                <option value="">-- Seleccionar Nuevo Plan --</option>
                            </select>
                        </div>

                        <div class="form-group mb-0">
                            <label class="font-weight-bold text-dark">Motivo del Cambio <span class="text-danger">*</span></label>
                            <textarea class="form-control" id="change_reason" rows="2" placeholder="Indica la justificación comercial o técnica del cambio..." required style="border-radius: 8px;"></textarea>
                            <small class="text-muted">Requerido para el registro de auditoría de seguridad.</small>
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0" style="border-radius: 0 0 12px 12px;">
                        <button type="button" class="btn btn-secondary font-weight-bold" data-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary font-weight-bold shadow-sm">
                            <i class="fas fa-check-circle mr-1"></i> Confirmar Cambio de Plan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- ─────────────────────────────────────────────
         MODAL 4: Renovar Suscripción
         ───────────────────────────────────────────── -->
    <div class="modal fade" id="modalRenewSubscription" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
                <div class="modal-header bg-success text-white border-0" style="border-radius: 12px 12px 0 0;">
                    <h5 class="modal-title font-weight-bold">
                        <i class="fas fa-calendar-plus mr-2"></i>Renovar Suscripción
                    </h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Cerrar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <form id="form_renew_subscription">
                    <input type="hidden" id="renew_sub_id">
                    <div class="modal-body p-4">
                        <div class="p-3 bg-light rounded mb-3 border">
                            <div class="small text-muted text-uppercase font-weight-bold">Empresa:</div>
                            <div class="font-weight-bold text-dark mb-1" id="renew_company_name">---</div>

                            <div class="row mt-2">
                                <div class="col-6">
                                    <div class="small text-muted">Plan:</div>
                                    <div class="font-weight-bold text-primary" id="renew_plan_name">---</div>
                                </div>
                                <div class="col-6">
                                    <div class="small text-muted">Vencimiento Actual:</div>
                                    <div class="font-weight-bold text-dark" id="renew_current_expiry">---</div>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="font-weight-bold text-dark">Días de Extensión <span class="text-danger">*</span></label>
                            <input type="number" min="1" class="form-control" id="renew_duration_days" value="30" required style="border-radius: 8px;">
                            <small class="text-muted">Cantidad de días a sumar a la vigencia actual.</small>
                        </div>

                        <div class="alert alert-success border-0 shadow-sm mb-3" style="border-radius: 8px;">
                            <div class="small text-uppercase font-weight-bold">Nueva fecha estimada de vencimiento:</div>
                            <div class="h5 font-weight-bold mb-0 mt-1" id="renew_new_expiry_preview">---</div>
                        </div>

                        <div class="form-group mb-0">
                            <label class="font-weight-bold text-dark">Motivo / Referencia de Pago</label>
                            <textarea class="form-control" id="renew_reason" rows="2" placeholder="Ej: Renovación anual aprobada según comprobante de pago #12345..." style="border-radius: 8px;"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0" style="border-radius: 0 0 12px 12px;">
                        <button type="button" class="btn btn-secondary font-weight-bold" data-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-success font-weight-bold shadow-sm">
                            <i class="fas fa-check mr-1"></i> Aplicar Renovación
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- ─────────────────────────────────────────────
         MODAL 5: Monitoreo de Cuotas y Consumo
         ───────────────────────────────────────────── -->
    <div class="modal fade" id="modalCompanyQuotas" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
                <div class="modal-header bg-dark text-white border-0" style="border-radius: 12px 12px 0 0;">
                    <h5 class="modal-title font-weight-bold">
                        <i class="fas fa-tachometer-alt mr-2 text-warning"></i>Monitoreo de Consumo y Cuotas
                    </h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Cerrar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body p-4">

                    <!-- Loader -->
                    <div id="quotas_loader" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-2 text-muted font-weight-bold">Consultando consumo de recursos en tiempo real...</p>
                    </div>

                    <!-- Contenido -->
                    <div id="quotas_content" style="display: none;">
                        <div class="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom flex-wrap">
                            <div>
                                <span class="text-muted small text-uppercase font-weight-bold">Empresa</span>
                                <h4 class="font-weight-bold text-dark mb-0" id="quotas_company_name">---</h4>
                            </div>
                            <div class="text-right">
                                <span class="text-muted small text-uppercase font-weight-bold">Plan Asignado</span>
                                <div>
                                    <span class="badge badge-primary px-3 py-2 font-weight-bold" style="font-size: 0.9rem;" id="quotas_plan_name">---</span>
                                    <span class="badge badge-light border ml-1 font-weight-bold" id="quotas_plan_code">---</span>
                                </div>
                            </div>
                        </div>

                        <!-- Barras de Consumo -->
                        <div class="mb-4">
                            <!-- 1. Usuarios -->
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="font-weight-bold text-dark"><i class="fas fa-users text-primary mr-1"></i> Usuarios Activos:</span>
                                    <span class="font-weight-bold text-muted" id="text_users">0 / 0</span>
                                </div>
                                <div class="progress" style="height: 18px; border-radius: 9px;">
                                    <div id="bar_users" class="progress-bar progress-bar-striped font-weight-bold" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                                </div>
                            </div>

                            <!-- 2. Productos -->
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="font-weight-bold text-dark"><i class="fas fa-box text-success mr-1"></i> Productos en Catálogo:</span>
                                    <span class="font-weight-bold text-muted" id="text_products">0 / 0</span>
                                </div>
                                <div class="progress" style="height: 18px; border-radius: 9px;">
                                    <div id="bar_products" class="progress-bar progress-bar-striped font-weight-bold" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                                </div>
                            </div>

                            <!-- 3. Facturas del mes -->
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="font-weight-bold text-dark"><i class="fas fa-file-invoice text-info mr-1"></i> Facturas Emitidas este Mes:</span>
                                    <span class="font-weight-bold text-muted" id="text_invoices">0 / 0</span>
                                </div>
                                <div class="progress" style="height: 18px; border-radius: 9px;">
                                    <div id="bar_invoices" class="progress-bar progress-bar-striped font-weight-bold" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                                </div>
                            </div>
                        </div>

                        <!-- Módulos Contratados -->
                        <div>
                            <span class="text-muted small text-uppercase font-weight-bold d-block mb-2">Módulos Autorizados para esta Empresa:</span>
                            <div id="quotas_modules_container" class="d-flex flex-wrap">
                                <!-- Chips inyectados por JS -->
                            </div>
                        </div>
                    </div>

                </div>
                <div class="modal-footer bg-light border-0" style="border-radius: 0 0 12px 12px;">
                    <button type="button" class="btn btn-secondary font-weight-bold" data-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap & Controladores -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import SaaSPlanesController from "<?php echo $URL; ?>/public/assets/js/controllers/saas_admin/planes_controller.js";

        document.addEventListener("DOMContentLoaded", async () => {
            const ok = await App.bootstrap();
            if (!ok) return;
            SaaSPlanesController.init();
        });
    </script>
</body>

</html>
