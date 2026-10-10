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
        <div class="content-wrapper">
            <!-- Header de la página -->
            <div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6">
                            <h1 class="m-0"><i class="fas fa-cash-register mr-2"></i>Caja Actual</h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Inicio</a></li>
                                <li class="breadcrumb-item active">Caja</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content">
                <div class="container-fluid">
                    <!-- loader principal -->
                    <div id="caja_loader" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                            <span class="sr-only">Cargando...</span>
                        </div>
                        <p class="mt-2 text-muted font-weight-bold">Verificando estado de caja...</p>
                    </div>

                    <!-- Vista cuando la caja está CERRADA -->
                    <div id="caja_cerrada_view" style="display: none;">
                        <div class="alert alert-warning text-center shadow-sm">
                            <h5><i class="icon fas fa-exclamation-triangle"></i> ¡No hay una sesión de caja abierta!</h5>
                            Debe abrir la caja para poder registrar movimientos y realizar ventas.
                        </div>
                        <div class="card card-outline card-success shadow-sm" style="max-width: 500px; margin: 0 auto;">
                            <div class="card-header">
                                <h3 class="card-title">Apertura de Caja</h3>
                            </div>
                            <div class="card-body">
                                <form id="form_abrir_caja">
                                    <div class="form-group">
                                        <label for="cash_register_id">Caja Registradora</label>
                                        <select class="form-control" id="cash_register_id" required>
                                            <option value="">Seleccione una caja...</option>
                                            <!-- Se llena por JS -->
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="opening_balance">Efectivo Inicial (Base)</label>
                                        <div class="input-group">
                                            <div class="input-group-prepend">
                                                <span class="input-group-text">$</span>
                                            </div>
                                            <input type="number" class="form-control" id="opening_balance" min="0" step="0.01" value="0" required>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="opening_notes">Observaciones (Opcional)</label>
                                        <textarea class="form-control" id="opening_notes" rows="2"></textarea>
                                    </div>
                                    <button type="submit" class="btn btn-success btn-block" data-permission="cash.open">
                                        <i class="fas fa-lock-open mr-1"></i> Abrir Caja
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <!-- Vista cuando la caja está ABIERTA -->
                    <div id="caja_abierta_view" style="display: none;">
                        <div class="row">
                            <!-- Resumen de sesión -->
                            <div class="col-md-4">
                                <div class="card card-outline card-primary shadow-sm h-100">
                                    <div class="card-header">
                                        <h3 class="card-title"><i class="fas fa-info-circle mr-1"></i> Estado de Sesión</h3>
                                    </div>
                                    <div class="card-body p-0">
                                        <ul class="list-group list-group-flush">
                                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                                <b>Caja Registradora</b> <span id="current_cash_register" class="text-muted">---</span>
                                            </li>
                                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                                <b>Usuario</b> <span id="current_user" class="text-muted">---</span>
                                            </li>
                                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                                <b>Apertura</b> <span id="current_start_time" class="text-muted">---</span>
                                            </li>
                                            <li class="list-group-item d-flex justify-content-between align-items-center bg-light">
                                                <b>Saldo Inicial</b> <strong id="current_opening_balance" class="text-dark">---</strong>
                                            </li>
                                            <li class="list-group-item d-flex justify-content-between align-items-center bg-info text-white">
                                                <b>Efectivo Esperado</b> <strong id="current_expected_balance" style="font-size: 1.1rem;">---</strong>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="card-footer d-flex justify-content-between">
                                        <button class="btn btn-warning btn-sm" id="btn_modal_movimiento" data-permission="cash.movement">
                                            <i class="fas fa-exchange-alt mr-1"></i> Movimiento
                                        </button>
                                        <button class="btn btn-danger btn-sm" id="btn_modal_cerrar" data-permission="cash.close">
                                            <i class="fas fa-lock mr-1"></i> Cerrar Caja
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Movimientos -->
                            <div class="col-md-8">
                                <div class="card shadow-sm h-100">
                                    <div class="card-header border-0">
                                        <h3 class="card-title"><i class="fas fa-list mr-1"></i> Movimientos de la Sesión</h3>
                                    </div>
                                    <div class="card-body p-0 table-responsive" style="max-height: 400px;">
                                        <table class="table table-striped table-valign-middle table-sm" id="tabla_movimientos">
                                            <thead>
                                                <tr>
                                                    <th>Hora</th>
                                                    <th>Tipo</th>
                                                    <th>Descripción</th>
                                                    <th>Método</th>
                                                    <th class="text-right">Monto</th>
                                                </tr>
                                            </thead>
                                            <tbody>
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
            <div class="modal-content">
                <form id="form_movimiento_caja">
                    <div class="modal-header bg-warning">
                        <h5 class="modal-title"><i class="fas fa-exchange-alt mr-2"></i>Registrar Movimiento de Caja</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Tipo de Movimiento</label>
                            <select class="form-control" id="mov_type" required>
                                <option value="IN">Ingreso (Entrada)</option>
                                <option value="OUT">Retiro (Salida)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Monto (Efectivo)</label>
                            <div class="input-group">
                                <div class="input-group-prepend"><span class="input-group-text">$</span></div>
                                <input type="number" class="form-control" id="mov_amount" min="0.01" step="0.01" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Descripción / Concepto</label>
                            <input type="text" class="form-control" id="mov_description" required placeholder="Ej: Pago de insumos, Aporte inicial...">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-warning"><i class="fas fa-save mr-1"></i> Guardar Movimiento</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal Cerrar Caja -->
    <div class="modal fade" id="modalCerrarCaja" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <form id="form_cerrar_caja">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title"><i class="fas fa-lock mr-2"></i>Cierre de Caja</h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info p-2 mb-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Efectivo Esperado en Sistema:</span>
                                <strong id="close_expected_balance" class="h5 mb-0">---</strong>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Efectivo Físico Contado</label>
                            <div class="input-group input-group-lg">
                                <div class="input-group-prepend"><span class="input-group-text">$</span></div>
                                <input type="number" class="form-control" id="close_counted_balance" min="0" step="0.01" required>
                            </div>
                            <small class="form-text text-muted">Ingrese el total de dinero en efectivo que hay en la gaveta.</small>
                        </div>
                        
                        <div class="form-group mb-0">
                            <div class="d-flex justify-content-between font-weight-bold">
                                <span>Diferencia (Vista Previa):</span>
                                <span id="close_difference" class="text-dark">$ 0.00</span>
                            </div>
                        </div>
                        <hr>
                        <div class="form-group">
                            <label>Observaciones de Cierre</label>
                            <textarea class="form-control" id="close_notes" rows="2" placeholder="Opcional. Justifique diferencias si las hay..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-danger"><i class="fas fa-check mr-1"></i> Confirmar Cierre</button>
                    </div>
                </form>
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
