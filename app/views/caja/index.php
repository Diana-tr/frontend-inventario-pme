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
            <img class="animation__shake" src="<?php echo $URL; ?>/public/assets/img/logo-pme.png" alt="Logo inventario PME" height="60" width="60">
        </div>

        <!-- Módulos Layout -->
        <?php
        require_once __DIR__ . '/../layouts/navbar.php';
        require_once __DIR__ . '/../layouts/sidebar.php';
        ?>

        <!-- Content Wrapper. Contains page content -->
        <div class="content-wrapper" style="background-color: #F8FAFC !important;">
            <!-- Header de la página -->
            <div class="content-header py-4">
                <div class="container mx-auto" style="max-width: 1050px;">
                    <div class="row mb-2 align-items-center">
                        <div class="col-sm-6">
                            <h2 class="m-0 font-weight-bold" style="color: #0F172A;">Caja Actual - Sucursal Principal</h2>
                            <p class="small mb-0 mt-1" style="color: #64748B;">Gestión y control del turno actual de caja</p>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right bg-transparent mb-0">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard" class="text-primary">Inicio</a></li>
                                <li class="breadcrumb-item active text-muted">Caja</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content pb-5">
                <div class="container mx-auto" style="max-width: 1050px;">
                    <!-- loader principal -->
                    <div id="caja_loader" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                            <span class="sr-only">Cargando...</span>
                        </div>
                        <p class="mt-2 text-muted font-weight-bold">Verificando estado de caja...</p>
                    </div>

                    <!-- Vista cuando la caja está CERRADA -->
                    <div id="caja_cerrada_view" style="display: none;">
                        <!-- Alerta Estilo Ámbar Suave (Corregido) -->
                        <div class="alert text-center border-0 shadow-sm mb-4 py-3" style="background-color: #FEFCE8; color: #854D0E; border-radius: 12px; border-left: 5px solid #EAB308 !important;">
                            <h5 class="font-weight-bold mb-1" style="font-size: 1.1rem;"><i class="icon fas fa-exclamation-triangle mr-2" style="color: #CA8A04;"></i> ¡No hay una sesión de caja abierta!</h5>
                            <p class="mb-0 small" style="color: #A16207;">Debe abrir la caja para poder registrar movimientos y realizar ventas en el sistema.</p>
                        </div>

                        <div class="card border-0 shadow-sm mx-auto" style="max-width: 500px; background-color: #FFFFFF; border-radius: 12px; border-top: 4px solid #10B981 !important;">
                            <div class="card-header bg-white border-0 py-3">
                                <h3 class="card-title font-weight-bold mb-0" style="color: #0F172A;">Apertura de Caja</h3>
                            </div>
                            <div class="card-body p-4">
                                <form id="form_abrir_caja">
                                    <div class="form-group mb-3">
                                        <label for="cash_register_id" class="font-weight-bold small text-uppercase" style="color: #1E293B; letter-spacing: 0.3px;">Caja Registradora</label>
                                        <div class="input-group">
                                            <div class="input-group-prepend">
                                                <span class="input-group-text bg-light border-right-0" style="border-color: #CBD5E1; border-radius: 8px 0 0 8px;"><i class="fas fa-cash-register" style="color: #475569;"></i></span>
                                            </div>
                                            <select class="form-control border-left-0 shadow-none" id="cash_register_id" style="border-radius: 0 8px 8px 0; border: 1px solid #CBD5E1; color: #0F172A;" required>
                                                <option value="">Seleccione una caja...</option>
                                                <!-- Se llena por JS -->
                                            </select>
                                        </div>
                                        <!-- Contenedor de saldo anterior (Carry-over) -->
                                        <div id="carry_over_container" class="mt-2 p-2 rounded d-none" style="background-color: #F1F5F9; border: 1px dashed #94A3B8;">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <small style="color: #334155;"><i class="fas fa-history mr-1 text-primary"></i> Saldo cierre anterior: <strong id="carry_over_amount" class="text-primary">$ 0.00</strong></small>
                                                <button type="button" class="btn btn-xs btn-outline-primary font-weight-bold" id="btn_apply_carry_over">
                                                    <i class="fas fa-arrow-down mr-1"></i> Usar como base
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group mb-3">
                                        <label for="opening_balance" class="font-weight-bold small text-uppercase" style="color: #1E293B; letter-spacing: 0.3px;">Efectivo Inicial (Base)</label>
                                        <div class="input-group">
                                            <div class="input-group-prepend">
                                                <span class="input-group-text bg-light border-right-0" style="border-color: #CBD5E1; border-radius: 8px 0 0 8px; color: #475569; font-weight: bold;">$</span>
                                            </div>
                                            <input type="number" class="form-control border-left-0 shadow-none" id="opening_balance" min="0" step="0.01" value="0" style="border-color: #CBD5E1; border-radius: 0 8px 8px 0; color: #0F172A;" required>
                                        </div>
                                    </div>
                                    <div class="form-group mb-4">
                                        <label for="opening_notes" class="font-weight-bold small text-uppercase" style="color: #1E293B; letter-spacing: 0.3px;">Observaciones (Opcional)</label>
                                        <div class="input-group">
                                            <div class="input-group-prepend">
                                                <span class="input-group-text bg-light border-right-0" style="border-color: #CBD5E1; border-radius: 8px 0 0 8px;"><i class="fas fa-align-left" style="color: #475569;"></i></span>
                                            </div>
                                            <textarea class="form-control border-left-0 shadow-none" id="opening_notes" rows="2" placeholder="Observaciones adicionales..." style="border-radius: 0 8px 8px 0; border: 1px solid #CBD5E1; color: #0F172A;"></textarea>
                                        </div>
                                    </div>
                                    <button type="submit" class="btn btn-success btn-block font-weight-bold py-2 shadow-sm text-white" style="background-color: #059669; border: none; border-radius: 8px;" data-permission="cash.open">
                                        <i class="fas fa-lock-open mr-1"></i> Abrir Caja
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <!-- Vista cuando la caja está ABIERTA -->
                    <div id="caja_abierta_view" style="display: none;">
                        
                        <!-- Tarjetas de Resumen KPI Estilo Dashboard -->
                        <div class="row mb-4">
                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="background-color: #FFFFFF; border-radius: 12px;">
                                    <div class="card-body p-3 d-flex justify-content-between align-items-center">
                                        <div>
                                            <span class="text-uppercase font-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px; color: #475569;">Caja Registradora</span>
                                            <h5 class="font-weight-bold text-dark mt-1 mb-0" id="current_cash_register">---</h5>
                                        </div>
                                        <div class="rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 46px; height: 46px; background-color: #EFF6FF;">
                                            <i class="fas fa-cash-register text-primary"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="background-color: #FFFFFF; border-radius: 12px;">
                                    <div class="card-body p-3 d-flex justify-content-between align-items-center">
                                        <div style="min-width: 0;">
                                            <span class="text-uppercase font-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px; color: #475569;">Usuario Activo</span>
                                            <h6 class="font-weight-bold text-dark mt-1 mb-0" id="current_user" style="font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">---</h6>
                                        </div>
                                        <div class="rounded-circle p-3 d-flex align-items-center justify-content-center flex-shrink-0 ml-2" style="width: 46px; height: 46px; background-color: #F0FDF4;">
                                            <i class="fas fa-user text-success"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="background-color: #FFFFFF; border-radius: 12px;">
                                    <div class="card-body p-3 d-flex justify-content-between align-items-center">
                                        <div>
                                            <span class="text-uppercase font-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px; color: #475569;">Saldo Inicial</span>
                                            <h5 class="font-weight-bold text-dark mt-1 mb-0" id="current_opening_balance">---</h5>
                                        </div>
                                        <div class="rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 46px; height: 46px; background-color: #FFFBEB;">
                                            <i class="fas fa-wallet text-warning"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="background-color: #FFFFFF; border-radius: 12px; border-left: 4px solid #2563EB;">
                                    <div class="card-body p-3 d-flex justify-content-between align-items-center">
                                        <div>
                                            <span class="text-uppercase font-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px; color: #2563EB;">Efectivo Esperado</span>
                                            <h5 class="font-weight-bold text-primary mt-1 mb-0" id="current_expected_balance">---</h5>
                                        </div>
                                        <div class="rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 46px; height: 46px; background-color: #EFF6FF;">
                                            <i class="fas fa-coins text-primary"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Sección inferior: Acciones rápidas y Tabla de Movimientos -->
                        <div class="row align-items-stretch">
                            <!-- Panel de Control del Turno -->
                            <div class="col-lg-4 mb-4">
                                <div class="card border-0 shadow-sm h-100" style="background-color: #FFFFFF; border-radius: 12px;">
                                    <div class="card-header bg-white border-0 py-3">
                                        <h5 class="card-title font-weight-bold text-dark mb-0"><i class="fas fa-sliders-h mr-2 text-primary"></i> Acciones de Turno</h5>
                                    </div>
                                    <div class="card-body d-flex flex-column justify-content-between">
                                        <div>
                                            <div class="p-3 mb-3 rounded-lg" style="background-color: #F8FAFC; border: 1px dashed #CBD5E1;">
                                                <span class="small d-block mb-1 font-weight-bold" style="color: #475569;">DETALLES DE APERTURA</span>
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <span class="small text-muted">Hora:</span>
                                                    <span id="current_start_time" class="font-weight-bold text-dark small">---</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="d-flex flex-column gap-2 mt-2">
                                            <button class="btn btn-info btn-block font-weight-bold py-2 shadow-sm text-white mb-2" id="btn_modal_resumen_turno" style="background-color: #0284C7; border: none; border-radius: 8px;">
                                                <i class="fas fa-chart-pie mr-1"></i> Resumen Financiero del Turno
                                            </button>
                                            <button class="btn btn-warning btn-block font-weight-bold py-2 shadow-sm text-white mb-2" id="btn_modal_movimiento" data-permission="cash.movement" style="background-color: #F59E0B; border: none; border-radius: 8px;">
                                                <i class="fas fa-exchange-alt mr-1"></i> Registrar Movimiento
                                            </button>
                                            <button class="btn btn-danger btn-block font-weight-bold py-2 shadow-sm text-white" id="btn_modal_cerrar" data-permission="cash.close" style="background-color: #DC2626; border: none; border-radius: 8px;">
                                                <i class="fas fa-lock mr-1"></i> Realizar Cierre de Caja
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tabla de Movimientos de la Sesión -->
                            <div class="col-lg-8 mb-4">
                                <div class="card border-0 shadow-sm h-100" style="background-color: #FFFFFF; border-radius: 12px;">
                                    <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                                        <h5 class="card-title font-weight-bold text-dark mb-0"><i class="fas fa-list mr-2 text-secondary"></i> Movimientos de la Sesión</h5>
                                    </div>
                                    <div class="card-body p-0 table-responsive" style="max-height: 380px;">
                                        <table class="table table-hover align-items-center mb-0" id="tabla_movimientos">
                                            <thead style="background-color: #172033; color: #FFFFFF;">
                                                <tr>
                                                    <th class="border-0 font-weight-bold" style="font-size: 0.725rem; text-transform: uppercase;">Hora</th>
                                                    <th class="border-0 font-weight-bold" style="font-size: 0.725rem; text-transform: uppercase;">Tipo</th>
                                                    <th class="border-0 font-weight-bold" style="font-size: 0.725rem; text-transform: uppercase;">Descripción</th>
                                                    <th class="border-0 font-weight-bold" style="font-size: 0.725rem; text-transform: uppercase;">Canal</th>
                                                    <th class="border-0 font-weight-bold" style="font-size: 0.725rem; text-transform: uppercase;">Método</th>
                                                    <th class="border-0 font-weight-bold text-right" style="font-size: 0.725rem; text-transform: uppercase;">Monto</th>
                                                </tr>
                                            </thead>
                                            <tbody class="text-dark" style="font-size: 0.875rem;">
                                                <!-- Llenado por JS -->
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

    <!-- Modal Agregar Movimiento -->
    <div class="modal fade" id="modalMovimientoCaja" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
                <form id="form_movimiento_caja">
                    <div class="modal-header border-0 py-3" style="background-color: #FFFBEB;">
                        <h5 class="modal-title font-weight-bold text-warning"><i class="fas fa-exchange-alt mr-2"></i>Registrar Movimiento</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="form-group">
                            <label class="font-weight-bold small text-uppercase" style="color: #1E293B;">Tipo de Movimiento</label>
                            <select class="form-control" id="mov_type" style="border-radius: 8px; border: 1px solid #CBD5E1;" required>
                                <option value="IN">Ingreso (Entrada)</option>
                                <option value="OUT">Retiro (Salida)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="font-weight-bold small text-uppercase" style="color: #1E293B;">Categoría / Concepto</label>
                            <select class="form-control" id="mov_category" style="border-radius: 8px; border: 1px solid #CBD5E1;">
                                <option value="GASTO_OPERATIVO">Gasto Operativo (Servicios, Insumos, Aseo)</option>
                                <option value="RETIRO_PARCIAL">Retiro Parcial / Traslado de Seguridad</option>
                                <option value="INGRESO_ADICIONAL">Ingreso Adicional / Fondo para Cambio</option>
                                <option value="AJUSTE">Ajuste de Caja</option>
                                <option value="OTRO">Otro Concepto</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="font-weight-bold small text-uppercase text-muted">Canal / Medio</label>
                            <select class="form-control" id="mov_is_cash" style="border-radius: 8px; border: 1px solid #E2E8F0;" required>
                                <option value="true" selected>Efectivo (Afecta Arqueo Físico de Caja)</option>
                                <option value="false">Electrónico / No Efectivo (Transferencia, etc.)</option>
                            </select>
                            <small class="form-text text-muted">Los movimientos electrónicos quedan registrados en la auditoría de la sesión sin alterar el saldo físico de billetes/monedas.</small>
                        </div>
                        <div class="form-group">
                            <label class="font-weight-bold small text-uppercase text-muted">Monto</label>
                            <label class="font-weight-bold small text-uppercase" style="color: #1E293B;">Monto (Efectivo)</label>
                            <div class="input-group">
                                <div class="input-group-prepend"><span class="input-group-text bg-light border-right-0" style="border-color: #CBD5E1; border-radius: 8px 0 0 8px; font-weight: bold;">$</span></div>
                                <input type="number" class="form-control border-left-0" id="mov_amount" min="0.01" step="0.01" style="border-color: #CBD5E1; border-radius: 0 8px 8px 0;" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="font-weight-bold small text-uppercase text-muted">Referencia (Opcional)</label>
                            <input type="text" class="form-control" id="mov_reference" placeholder="Ej: REC-001, GASTO-05, TRANSF-889" style="border-radius: 8px; border: 1px solid #E2E8F0;">
                        </div>
                        <div class="form-group mb-0">
                            <label class="font-weight-bold small text-uppercase" style="color: #1E293B;">Descripción / Concepto</label>
                            <input type="text" class="form-control" id="mov_description" required placeholder="Ej: Pago de insumos, Aporte inicial..." style="border-radius: 8px; border: 1px solid #CBD5E1;">
                        </div>
                    </div>
                    <div class="modal-footer border-0 bg-light py-3" style="border-radius: 0 0 12px 12px;">
                        <button type="button" class="btn btn-secondary font-weight-bold px-4" data-dismiss="modal" style="border-radius: 8px;">Cancelar</button>
                        <button type="submit" class="btn btn-warning font-weight-bold px-4 text-white shadow-sm" style="background-color: #F59E0B; border: none; border-radius: 8px;"><i class="fas fa-save mr-1"></i> Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal Cerrar Caja con Arqueo Ciego y Calculadora de Denominaciones -->
    <div class="modal fade" id="modalCerrarCaja" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
                <form id="form_cerrar_caja">
                    <div class="modal-header border-0 py-3 text-white" style="background-color: #DC2626; border-radius: 12px 12px 0 0;">
                        <div>
                            <h5 class="modal-title font-weight-bold mb-0"><i class="fas fa-lock mr-2"></i>Cierre de Caja y Arqueo Físico</h5>
                            <small class="text-white-50">Conteo de efectivo y cuadre de turno</small>
                        </div>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body p-4">
                        <!-- Selector de Modo de Arqueo -->
                        <div class="d-flex justify-content-between align-items-center p-2 mb-3 rounded" style="background-color: #F8FAFC; border: 1px solid #E2E8F0;">
                            <div>
                                <span class="badge badge-primary mr-1"><i class="fas fa-shield-alt mr-1"></i>Control</span>
                                <small class="font-weight-bold text-dark">Modo de Arqueo:</small>
                            </div>
                            <div class="custom-control custom-switch">
                                <input type="checkbox" class="custom-control-input" id="switch_arqueo_ciego" checked>
                                <label class="custom-control-label small font-weight-bold text-muted" for="switch_arqueo_ciego" id="lbl_arqueo_mode">Arqueo Ciego (Ocultar Esperado)</label>
                            </div>
                        </div>

                        <!-- Contenedor Saldo Esperado (ocultable en arqueo ciego) -->
                        <div id="close_expected_container" class="alert p-3 mb-3 border-0 shadow-sm d-none" style="background-color: #EFF6FF; border-radius: 8px;">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="font-weight-bold small text-uppercase" style="color: #2563EB;">Efectivo Esperado en Sistema:</span>
                                <strong id="close_expected_balance" class="h5 mb-0 text-primary">---</strong>
                            </div>
                        </div>

                        <!-- Calculadora de Denominaciones (Billetes y Monedas) -->
                        <div class="card border mb-3 shadow-none" style="border-color: #E2E8F0; border-radius: 8px;">
                            <div class="card-header bg-light py-2 px-3 d-flex justify-content-between align-items-center cursor-pointer" id="btn_toggle_denominations" style="cursor: pointer;">
                                <span class="font-weight-bold small text-uppercase" style="color: #334155;">
                                    <i class="fas fa-calculator mr-1 text-primary"></i> Desglose por Billetes y Monedas (Calculadora)
                                </span>
                                <span class="badge badge-info" id="badge_denom_total">$ 0.00</span>
                            </div>
                            <div class="card-body p-3" id="denominations_body">
                                <div class="row">
                                    <!-- Billetes -->
                                    <div class="col-md-6 border-right">
                                        <h6 class="font-weight-bold small text-muted text-uppercase mb-2"><i class="fas fa-money-bill-wave text-success mr-1"></i> Billetes</h6>
                                        <div class="table-responsive">
                                            <table class="table table-sm table-borderless mb-0">
                                                <tbody>
                                                    <tr>
                                                        <td class="align-middle py-1 font-weight-bold small" style="width: 35%;">$100.000</td>
                                                        <td class="py-1"><input type="number" min="0" step="1" class="form-control form-control-sm text-center denom-input" data-value="100000" placeholder="0"></td>
                                                        <td class="align-middle py-1 text-right small font-weight-bold text-muted denom-subtotal">$0</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="align-middle py-1 font-weight-bold small">$50.000</td>
                                                        <td class="py-1"><input type="number" min="0" step="1" class="form-control form-control-sm text-center denom-input" data-value="50000" placeholder="0"></td>
                                                        <td class="align-middle py-1 text-right small font-weight-bold text-muted denom-subtotal">$0</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="align-middle py-1 font-weight-bold small">$20.000</td>
                                                        <td class="py-1"><input type="number" min="0" step="1" class="form-control form-control-sm text-center denom-input" data-value="20000" placeholder="0"></td>
                                                        <td class="align-middle py-1 text-right small font-weight-bold text-muted denom-subtotal">$0</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="align-middle py-1 font-weight-bold small">$10.000</td>
                                                        <td class="py-1"><input type="number" min="0" step="1" class="form-control form-control-sm text-center denom-input" data-value="10000" placeholder="0"></td>
                                                        <td class="align-middle py-1 text-right small font-weight-bold text-muted denom-subtotal">$0</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="align-middle py-1 font-weight-bold small">$5.000</td>
                                                        <td class="py-1"><input type="number" min="0" step="1" class="form-control form-control-sm text-center denom-input" data-value="5000" placeholder="0"></td>
                                                        <td class="align-middle py-1 text-right small font-weight-bold text-muted denom-subtotal">$0</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="align-middle py-1 font-weight-bold small">$2.000</td>
                                                        <td class="py-1"><input type="number" min="0" step="1" class="form-control form-control-sm text-center denom-input" data-value="2000" placeholder="0"></td>
                                                        <td class="align-middle py-1 text-right small font-weight-bold text-muted denom-subtotal">$0</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <!-- Monedas -->
                                    <div class="col-md-6">
                                        <h6 class="font-weight-bold small text-muted text-uppercase mb-2"><i class="fas fa-coins text-warning mr-1"></i> Monedas</h6>
                                        <div class="table-responsive">
                                            <table class="table table-sm table-borderless mb-0">
                                                <tbody>
                                                    <tr>
                                                        <td class="align-middle py-1 font-weight-bold small" style="width: 35%;">$1.000</td>
                                                        <td class="py-1"><input type="number" min="0" step="1" class="form-control form-control-sm text-center denom-input" data-value="1000" placeholder="0"></td>
                                                        <td class="align-middle py-1 text-right small font-weight-bold text-muted denom-subtotal">$0</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="align-middle py-1 font-weight-bold small">$500</td>
                                                        <td class="py-1"><input type="number" min="0" step="1" class="form-control form-control-sm text-center denom-input" data-value="500" placeholder="0"></td>
                                                        <td class="align-middle py-1 text-right small font-weight-bold text-muted denom-subtotal">$0</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="align-middle py-1 font-weight-bold small">$200</td>
                                                        <td class="py-1"><input type="number" min="0" step="1" class="form-control form-control-sm text-center denom-input" data-value="200" placeholder="0"></td>
                                                        <td class="align-middle py-1 text-right small font-weight-bold text-muted denom-subtotal">$0</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="align-middle py-1 font-weight-bold small">$100</td>
                                                        <td class="py-1"><input type="number" min="0" step="1" class="form-control form-control-sm text-center denom-input" data-value="100" placeholder="0"></td>
                                                        <td class="align-middle py-1 text-right small font-weight-bold text-muted denom-subtotal">$0</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="align-middle py-1 font-weight-bold small">$50</td>
                                                        <td class="py-1"><input type="number" min="0" step="1" class="form-control form-control-sm text-center denom-input" data-value="50" placeholder="0"></td>
                                                        <td class="align-middle py-1 text-right small font-weight-bold text-muted denom-subtotal">$0</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Total Contado -->
                        <div class="form-group mb-3">
                            <label class="font-weight-bold small text-uppercase" style="color: #1E293B;">Total Efectivo Físico Contado</label>
                            <div class="input-group input-group-lg">
                                <div class="input-group-prepend"><span class="input-group-text bg-light border-right-0 font-weight-bold" style="border-color: #CBD5E1; border-radius: 8px 0 0 8px;">$</span></div>
                                <input type="number" class="form-control border-left-0 font-weight-bold" id="close_counted_balance" min="0" step="0.01" style="border-color: #CBD5E1; border-radius: 0 8px 8px 0; color: #0F172A;" required>
                            </div>
                            <small class="form-text text-muted mt-1">Total acumulado de efectivo que se entrega al cerrar la gaveta.</small>
                        </div>
                        
                        <!-- Diferencia (solo visible en modo supervisado) -->
                        <div id="close_diff_container" class="form-group p-3 mb-3 d-none" style="background-color: #F8FAFC; border-radius: 8px; border: 1px solid #CBD5E1;">
                            <div class="d-flex justify-content-between font-weight-bold align-items-center">
                                <span class="small text-uppercase" style="color: #1E293B;">Diferencia Estimada:</span>
                                <span id="close_difference" class="h5 mb-0 text-dark">$ 0.00</span>
                            </div>
                        </div>
                        
                        <div class="form-group mb-0">
                            <label class="font-weight-bold small text-uppercase" style="color: #1E293B;">Observaciones de Cierre / Arqueo</label>
                            <textarea class="form-control" id="close_notes" rows="2" placeholder="Opcional. Justifique cualquier eventualidad..." style="border-radius: 8px; border: 1px solid #CBD5E1;"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer border-0 bg-light py-3" style="border-radius: 0 0 12px 12px;">
                        <button type="button" class="btn btn-secondary font-weight-bold px-4" data-dismiss="modal" style="border-radius: 8px;">Cancelar</button>
                        <button type="submit" class="btn btn-danger font-weight-bold px-4 shadow-sm" style="background-color: #DC2626; border: none; border-radius: 8px;"><i class="fas fa-check mr-1"></i> Confirmar Cierre de Caja</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal Resumen Financiero del Turno Actual (Auditoría) -->
    <div class="modal fade" id="modalResumenTurno" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
                <div class="modal-header border-0 py-3 text-white" style="background-color: #0284C7; border-radius: 12px 12px 0 0;">
                    <h5 class="modal-title font-weight-bold mb-0"><i class="fas fa-chart-pie mr-2"></i>Auditoría Financiera del Turno Actual</h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body p-4">
                    <div id="resumen_turno_loader" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="small text-muted mt-2 font-weight-bold">Calculando balance consolidado...</p>
                    </div>
                    <div id="resumen_turno_content" style="display: none;">
                        <div class="row mb-3">
                            <div class="col-md-4 col-sm-6 mb-2">
                                <div class="p-3 rounded border text-center" style="background-color: #F8FAFC;">
                                    <small class="text-muted text-uppercase font-weight-bold d-block">Base Inicial</small>
                                    <h5 class="font-weight-bold text-dark mb-0" id="res_opening_balance">$0.00</h5>
                                </div>
                            </div>
                            <div class="col-md-4 col-sm-6 mb-2">
                                <div class="p-3 rounded border text-center" style="background-color: #F0FDF4; border-color: #BBF7D0 !important;">
                                    <small class="text-success text-uppercase font-weight-bold d-block">Ventas Efectivo</small>
                                    <h5 class="font-weight-bold text-success mb-0" id="res_sales_cash">$0.00</h5>
                                </div>
                            </div>
                            <div class="col-md-4 col-sm-6 mb-2">
                                <div class="p-3 rounded border text-center" style="background-color: #EFF6FF; border-color: #BFDBFE !important;">
                                    <small class="text-primary text-uppercase font-weight-bold d-block">Ventas Electrónicas</small>
                                    <h5 class="font-weight-bold text-primary mb-0" id="res_sales_elec">$0.00</h5>
                                </div>
                            </div>
                            <div class="col-md-4 col-sm-6 mb-2">
                                <div class="p-3 rounded border text-center" style="background-color: #FEF2F2; border-color: #FECACA !important;">
                                    <small class="text-danger text-uppercase font-weight-bold d-block">Compras Pagadas (Caja)</small>
                                    <h5 class="font-weight-bold text-danger mb-0" id="res_purchases_cash">$0.00</h5>
                                </div>
                            </div>
                            <div class="col-md-4 col-sm-6 mb-2">
                                <div class="p-3 rounded border text-center" style="background-color: #FFFBEB; border-color: #FDE68A !important;">
                                    <small class="text-warning text-uppercase font-weight-bold d-block">Gastos Manuales</small>
                                    <h5 class="font-weight-bold text-warning mb-0" id="res_expenses_manual">$0.00</h5>
                                </div>
                            </div>
                            <div class="col-md-4 col-sm-6 mb-2">
                                <div class="p-3 rounded border text-center" style="background-color: #FAF5FF; border-color: #E9D5FF !important;">
                                    <small class="text-uppercase font-weight-bold d-block" style="color: #7E22CE;">Efectivo en Gaveta</small>
                                    <h5 class="font-weight-bold mb-0" style="color: #7E22CE;" id="res_expected_cash">$0.00</h5>
                                </div>
                            </div>
                        </div>

                        <div class="alert p-3 mb-0 border-0" style="background-color: #F1F5F9; border-radius: 8px;">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="small font-weight-bold text-dark"><i class="fas fa-info-circle mr-1 text-info"></i>Total Movimientos Registrados:</span>
                                <span class="badge badge-dark px-2 py-1" id="res_total_movs">0 movimientos</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-0 bg-light py-2" style="border-radius: 0 0 12px 12px;">
                    <button type="button" class="btn btn-secondary font-weight-bold px-4" data-dismiss="modal" style="border-radius: 8px;">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Script de inicialización -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import CajaIndexController from "<?php echo $URL; ?>/public/assets/js/controllers/caja/index.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            CajaIndexController.init();
        });
    </script>
</body>
</html>