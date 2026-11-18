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
                            <h2 class="m-0 font-weight-bold text-dark"><i class="fas fa-coins mr-2" style="color: #2563EB;"></i>Panel de Tesorería y Finanzas</h2>
                            <p class="text-muted small mb-0 mt-1">Control integral de liquidez, cuentas bancarias y flujo de caja empresarial</p>
                        </div>
                        <div class="col-sm-6 d-flex justify-content-sm-end align-items-center mt-3 mt-sm-0 flex-wrap gap-2">
                            <select id="select_filtro_periodo" class="custom-select custom-select-sm w-auto mr-2 shadow-sm font-weight-bold" style="border-radius: 8px;">
                                <option value="month" selected>Este Mes</option>
                                <option value="today">Hoy</option>
                                <option value="quarter">Este Trimestre</option>
                                <option value="year">Este Año</option>
                            </select>
                            <button type="button" class="btn btn-outline-primary btn-sm shadow-sm font-weight-bold mr-2" id="btn_modal_transferencia" style="border-radius: 8px;">
                                <i class="fas fa-exchange-alt mr-1"></i> Transferir
                            </button>
                            <button type="button" class="btn btn-success btn-sm shadow-sm font-weight-bold mr-2" id="btn_modal_movimiento" style="border-radius: 8px;">
                                <i class="fas fa-plus mr-1"></i> Registrar Movimiento
                            </button>
                            <button type="button" class="btn btn-primary btn-sm shadow-sm font-weight-bold" id="btn_modal_nueva_cuenta" style="border-radius: 8px;">
                                <i class="fas fa-university mr-1"></i> Nueva Cuenta
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido -->
            <section class="content pb-5">
                <div class="container-fluid" style="max-width: 1300px;">

                    <!-- Loader principal -->
                    <div id="finance_dashboard_loader" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
                        <p class="mt-2 text-muted font-weight-bold">Consolidando estados financieros...</p>
                    </div>

                    <!-- Contenido del Dashboard -->
                    <div id="finance_dashboard_content" style="display: none;">

                        <!-- KPIs Principales -->
                        <div class="row">
                            <div class="col-xl-3 col-md-6 mb-4">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #2563EB !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Liquidez Total Disponible</span>
                                            <div class="p-2 rounded-circle bg-light text-primary"><i class="fas fa-money-check-alt"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-dark mb-1" id="kpi_total_liquidity">$ 0.00</h3>
                                        <small class="text-muted"><i class="fas fa-vault mr-1"></i>En todas las cuentas activas</small>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xl-3 col-md-6 mb-4">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #10B981 !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Ingresos del Período</span>
                                            <div class="p-2 rounded-circle bg-light text-success"><i class="fas fa-arrow-down"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-success mb-1" id="kpi_total_inflow">$ 0.00</h3>
                                        <small class="text-muted"><i class="fas fa-chart-line mr-1"></i>Cobros y ventas</small>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xl-3 col-md-6 mb-4">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #EF4444 !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Egresos del Período</span>
                                            <div class="p-2 rounded-circle bg-light text-danger"><i class="fas fa-arrow-up"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-danger mb-1" id="kpi_total_outflow">$ 0.00</h3>
                                        <small class="text-muted"><i class="fas fa-shopping-cart mr-1"></i>Compras y gastos operativos</small>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xl-3 col-md-6 mb-4">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #6366F1 !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Flujo de Caja Neto</span>
                                            <div class="p-2 rounded-circle bg-light text-info"><i class="fas fa-balance-scale"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold mb-1" id="kpi_net_cash_flow">$ 0.00</h3>
                                        <small class="text-muted"><i class="fas fa-calculator mr-1"></i>Margen disponible generado</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Fila 2: Cuentas Financieras (Grid de Cuentas) -->
                        <div class="row mb-4">
                            <div class="col-12">
                                <div class="card border-0 shadow-sm" style="border-radius: 12px;">
                                    <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                        <h5 class="card-title font-weight-bold text-dark mb-0"><i class="fas fa-landmark text-primary mr-2"></i> Cuentas Financieras de la Empresa</h5>
                                        <div class="d-flex align-items-center flex-wrap">
                                            <div class="custom-control custom-switch mr-3" title="Mostrar cuentas desactivadas para permitir su reactivación">
                                                <input type="checkbox" class="custom-control-input" id="switch_mostrar_inactivas">
                                                <label class="custom-control-label small font-weight-bold text-muted" for="switch_mostrar_inactivas" style="cursor: pointer;">
                                                    Mostrar cuentas inactivas
                                                </label>
                                            </div>
                                            <a href="<?php echo $URL; ?>/finanzas/movimientos" class="btn btn-sm btn-link text-primary font-weight-bold p-0">Ver todos los movimientos <i class="fas fa-arrow-right ml-1"></i></a>
                                        </div>
                                    </div>
                                    <div class="card-body pt-0">
                                        <div class="row" id="container_cuentas_grid">
                                            <!-- Inyectado dinámicamente vía JS -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Fila 3: Gráficos de Flujo y Comparativa de Operaciones -->
                        <div class="row">
                            <div class="col-lg-8 mb-4">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px;">
                                    <div class="card-header bg-white border-0 py-3">
                                        <h5 class="card-title font-weight-bold text-dark mb-0"><i class="fas fa-chart-bar text-primary mr-2"></i> Ingresos vs Egresos</h5>
                                    </div>
                                    <div class="card-body">
                                        <canvas id="chart_finance_summary" style="min-height: 280px; height: 280px; max-height: 280px;"></canvas>
                                    </div>
                                </div>
                            </div>

                            <div class="col-lg-4 mb-4">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px;">
                                    <div class="card-header bg-white border-0 py-3">
                                        <h5 class="card-title font-weight-bold text-dark mb-0"><i class="fas fa-sync text-info mr-2"></i> Operaciones del ERP</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="p-3 mb-3 rounded" style="background-color: #F1F5F9;">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <span class="text-muted small font-weight-bold">Ventas Totales</span>
                                                <span class="font-weight-bold text-dark" id="stat_sales_total">$ 0.00</span>
                                            </div>
                                            <small class="text-muted" id="stat_sales_count">0 ventas registradas</small>
                                        </div>

                                        <div class="p-3 mb-3 rounded" style="background-color: #F1F5F9;">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <span class="text-muted small font-weight-bold">Compras Totales</span>
                                                <span class="font-weight-bold text-dark" id="stat_purchases_total">$ 0.00</span>
                                            </div>
                                            <small class="text-muted" id="stat_purchases_count">0 compras a proveedores</small>
                                        </div>

                                        <div class="p-3 rounded" style="background-color: #F1F5F9;">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <span class="text-muted small font-weight-bold">Gastos / Egresos Directos</span>
                                                <span class="font-weight-bold text-danger" id="stat_expenses_total">$ 0.00</span>
                                            </div>
                                            <small class="text-muted">Servicios, nómina y otros</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>

        <!-- ============================================================
             MODAL: CREAR / EDITAR CUENTA FINANCIERA
             ============================================================ -->
        <div class="modal fade" id="modalCuentaFinanciera" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content border-0 shadow" style="border-radius: 12px;">
                    <div class="modal-header bg-primary text-white py-3">
                        <h5 class="modal-title font-weight-bold" id="modalCuentaTitulo"><i class="fas fa-university mr-2"></i>Registrar Cuenta Financiera</h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form id="formCuentaFinanciera">
                        <input type="hidden" id="cuenta_id" value="">
                        <div class="modal-body p-4">
                            <div class="form-group">
                                <label class="small font-weight-bold text-muted">Nombre de la Cuenta <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="cuenta_nombre" placeholder="Ej. Bancolombia Corriente Principal" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Tipo de Cuenta <span class="text-danger">*</span></label>
                                    <select class="custom-select" id="cuenta_tipo" required>
                                        <option value="BANK">Cuenta Bancaria</option>
                                        <option value="CASH">Caja de Efectivo</option>
                                        <option value="DIGITAL_WALLET">Billetera Digital (Nequi/Daviplata)</option>
                                        <option value="CREDIT">Tarjeta / Línea de Crédito</option>
                                        <option value="OTHER">Otro Instrumento</option>
                                    </select>
                                </div>
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Entidad / Banco</label>
                                    <input type="text" class="form-control" id="cuenta_banco" placeholder="Ej. Bancolombia">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Número de Cuenta</label>
                                    <input type="text" class="form-control" id="cuenta_numero" placeholder="Ej. 123-456789-00">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Saldo Inicial <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <div class="input-group-prepend"><span class="input-group-text">$</span></div>
                                        <input type="number" step="0.01" class="form-control" id="cuenta_saldo_inicial" value="0.00" required>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group mb-0">
                                <label class="small font-weight-bold text-muted">Descripción u Observaciones</label>
                                <textarea class="form-control" id="cuenta_descripcion" rows="2" placeholder="Propósito u orientación contable de la cuenta..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer bg-light py-2" style="border-radius: 0 0 12px 12px;">
                            <button type="button" class="btn btn-secondary font-weight-bold px-4" data-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary font-weight-bold px-4" id="btn_guardar_cuenta">Guardar Cuenta</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- ============================================================
             MODAL: REGISTRAR MOVIMIENTO FINANCIERO (INGRESO / EGRESO)
             ============================================================ -->
        <div class="modal fade" id="modalMovimientoFinanciero" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content border-0 shadow" style="border-radius: 12px;">
                    <div class="modal-header bg-success text-white py-3">
                        <h5 class="modal-title font-weight-bold"><i class="fas fa-hand-holding-usd mr-2"></i>Registrar Movimiento de Tesorería</h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form id="formMovimientoFinanciero">
                        <div class="modal-body p-4">
                            <div class="row">
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Tipo de Movimiento <span class="text-danger">*</span></label>
                                    <select class="custom-select" id="mov_tipo" required>
                                        <option value="OUTFLOW">Egreso (Salida / Gasto)</option>
                                        <option value="INFLOW">Ingreso (Entrada)</option>
                                    </select>
                                </div>
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Cuenta Afectada <span class="text-danger">*</span></label>
                                    <select class="custom-select" id="mov_cuenta" required>
                                        <!-- Opciones dinámicas -->
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Monto <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <div class="input-group-prepend"><span class="input-group-text">$</span></div>
                                        <input type="number" step="0.01" class="form-control" id="mov_monto" placeholder="0.00" required>
                                    </div>
                                </div>
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Categoría Contable</label>
                                    <select class="custom-select" id="mov_categoria">
                                        <!-- Opciones dinámicas -->
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Método de Pago</label>
                                    <select class="custom-select" id="mov_metodo">
                                        <option value="TRANSFER">Transferencia Bancaria</option>
                                        <option value="CASH">Efectivo</option>
                                        <option value="CARD">Tarjeta Débito/Crédito</option>
                                        <option value="ELECTRONIC">Medio Electrónico</option>
                                        <option value="OTHER">Otro</option>
                                    </select>
                                </div>
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Fecha del Movimiento <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="mov_fecha" value="<?php echo date('Y-m-d'); ?>" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="small font-weight-bold text-muted">Descripción <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="mov_descripcion" placeholder="Ej. Pago de arriendo local comercial" required>
                            </div>
                            <div class="form-group mb-0">
                                <label class="small font-weight-bold text-muted">Referencia o Comprobante</label>
                                <input type="text" class="form-control" id="mov_referencia" placeholder="Ej. Factura #4588 / N° Aprobación">
                            </div>
                        </div>
                        <div class="modal-footer bg-light py-2" style="border-radius: 0 0 12px 12px;">
                            <button type="button" class="btn btn-secondary font-weight-bold px-4" data-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-success font-weight-bold px-4" id="btn_guardar_movimiento">Registrar Movimiento</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- ============================================================
             MODAL: TRANSFERENCIA ENTRE CUENTAS PROPIAS
             ============================================================ -->
        <div class="modal fade" id="modalTransferencia" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content border-0 shadow" style="border-radius: 12px;">
                    <div class="modal-header bg-dark text-white py-3">
                        <h5 class="modal-title font-weight-bold"><i class="fas fa-exchange-alt mr-2 text-primary"></i>Transferencia entre Cuentas</h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form id="formTransferencia">
                        <div class="modal-body p-4">
                            <div class="row">
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Cuenta Origen (Sale dinero) <span class="text-danger">*</span></label>
                                    <select class="custom-select" id="transf_origen" required>
                                        <!-- Cuentas -->
                                    </select>
                                </div>
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Cuenta Destino (Entra dinero) <span class="text-danger">*</span></label>
                                    <select class="custom-select" id="transf_destino" required>
                                        <!-- Cuentas -->
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Monto a Transferir <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <div class="input-group-prepend"><span class="input-group-text">$</span></div>
                                        <input type="number" step="0.01" class="form-control" id="transf_monto" placeholder="0.00" required>
                                    </div>
                                </div>
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Fecha de Traslado <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="transf_fecha" value="<?php echo date('Y-m-d'); ?>" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="small font-weight-bold text-muted">Referencia Bancaria / N° Traslado</label>
                                <input type="text" class="form-control" id="transf_referencia" placeholder="Ej. TRF-2026-001">
                            </div>
                            <div class="form-group mb-0">
                                <label class="small font-weight-bold text-muted">Notas u Observaciones</label>
                                <textarea class="form-control" id="transf_notas" rows="2" placeholder="Motivo del traslado de liquidez..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer bg-light py-2" style="border-radius: 0 0 12px 12px;">
                            <button type="button" class="btn btn-secondary font-weight-bold px-4" data-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary font-weight-bold px-4" id="btn_ejecutar_transferencia">Ejecutar Transferencia</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <?php require_once __DIR__ . '/../layouts/footer.php'; ?>
    </div>

    <!-- Chart.js -->
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/chart.js/Chart.bundle.min.js"></script>
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js?v=<?php echo time(); ?>";
        import FinanceDashboardController from "<?php echo $URL; ?>/public/assets/js/controllers/finanzas/index.js?v=<?php echo time(); ?>";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            FinanceDashboardController.init();
        });
    </script>
</body>

</html>
