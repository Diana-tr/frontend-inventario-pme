<?php
require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../layouts/head.php';
?>

<body class="hold-transition sidebar-mini layout-fixed">
    <div class="wrapper">
        <!-- Navbar SaaS Admin Exclusivo -->
        <?php require_once __DIR__ . '/layouts/navbar.php'; ?>
        <?php require_once __DIR__ . '/layouts/sidebar.php'; ?>

        <div class="content-wrapper" style="background-color: #F8FAFC;">
            <div class="content-header pt-4">
                <div class="container-fluid">
                    <h1 class="m-0 font-weight-bold text-dark"><i class="fas fa-building text-primary mr-2"></i>Gestión de Empresas</h1>
                    <p class="text-muted">Administra los clientes de tu plataforma SaaS.</p>
                </div>
            </div>

            <section class="content">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <div class="card shadow-sm border-0" style="border-radius: 12px;">
                                <div class="card-body">

                                    <table id="tbl_saas_tenants" class="table table-bordered table-striped table-hover responsive nowrap" width="100%">
                                        <thead class="bg-dark text-white">
                                            <tr>
                                                <th class="text-center" style="width: 50px;">N°</th>
                                                <th>Empresa</th>
                                                <th>NIT</th>
                                                <th class="text-center">Estado</th>
                                                <th>Fecha Registro</th>
                                                <th class="text-center" style="width: 150px;">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>

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

    <!-- Modal para Extender Trial -->
    <div class="modal fade" id="modalExtendTrial" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
                <div class="modal-header bg-primary text-white border-0" style="border-radius: 12px 12px 0 0;">
                    <h5 class="modal-title font-weight-bold"><i class="fas fa-calendar-plus mr-2"></i>Extender Prueba (Trial)</h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <form id="form_extend_trial">
                    <input type="hidden" id="extend_trial_company_id">
                    <div class="modal-body p-4">
                        <div class="form-group">
                            <label class="font-weight-bold text-dark">Días a extender</label>
                            <input type="number" class="form-control" id="extend_trial_days" value="7" min="1" required>
                        </div>
                        <div class="form-group mb-0">
                            <label class="font-weight-bold text-dark">Motivo (Opcional)</label>
                            <textarea class="form-control" id="extend_trial_reason" rows="2" placeholder="Ej: Cliente solicitó más tiempo para evaluar el sistema..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0" style="border-radius: 0 0 12px 12px;">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary font-weight-bold"><i class="fas fa-save mr-1"></i> Extender Prueba</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Controlador de Empresas -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import SaaSAdminTenantController from "<?php echo $URL; ?>/public/assets/js/controllers/saas_admin/tenants_controller.js";

        document.addEventListener("DOMContentLoaded", async () => {
            const ok = await App.bootstrap();
            if (!ok) return;
            SaaSAdminTenantController.init();
        });
    </script>
</body>

</html>
