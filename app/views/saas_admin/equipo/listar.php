<?php

require_once __DIR__ . '/../../../config/app.php';
require_once __DIR__ . '/../../layouts/head.php';
?>

<body class="hold-transition sidebar-mini layout-fixed">
    <div class="wrapper">

        <!-- Navbar SaaS Admin Exclusivo -->
        <?php require_once __DIR__ . '/../layouts/navbar.php'; ?>

        <!-- Sidebar SaaS Admin -->
        <?php require_once __DIR__ . '/../layouts/sidebar.php'; ?>

        <!-- Content Wrapper -->
        <div class="content-wrapper" style="background-color: #F8FAFC;">

            <!-- Header -->
            <div class="content-header py-4">
                <div class="container-fluid" style="max-width: 1400px;">
                    <div class="row mb-2 align-items-center">
                        <div class="col-sm-6">
                            <h1 class="m-0 font-weight-bold text-dark">
                                <i class="fas fa-users-cog mr-2 text-primary"></i>Equipo Interno del SaaS
                            </h1>
                            <p class="text-muted small mb-0 mt-1">
                                Administración del personal interno de la plataforma P.M.E., asignación de roles y control de accesos.
                            </p>
                        </div>
                        <div class="col-sm-6 d-flex justify-content-sm-end align-items-center mt-3 mt-sm-0 flex-wrap">
                            <button type="button" class="btn btn-outline-secondary btn-sm shadow-sm font-weight-bold mr-2" id="btn_refrescar_equipo" style="border-radius: 8px;">
                                <i class="fas fa-sync-alt mr-1"></i> Refrescar
                            </button>
                            <button type="button" class="btn btn-primary btn-sm shadow-sm font-weight-bold" id="btn_nuevo_miembro" style="border-radius: 8px;">
                                <i class="fas fa-user-plus mr-1"></i> Registrar Integrante
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content pb-5">
                <div class="container-fluid" style="max-width: 1400px;">

                    <!-- Loader -->
                    <div id="equipo_loader" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
                        <p class="mt-2 text-muted font-weight-bold">Consultando personal del equipo SaaS...</p>
                    </div>

                    <!-- Contenedor -->
                    <div id="equipo_content" style="display: none;">

                        <!-- KPIs -->
                        <div class="row mb-4">
                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #2563EB !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Total Personal</span>
                                            <div class="p-2 rounded-circle bg-light text-primary"><i class="fas fa-users"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-dark mb-1" id="kpi_total_equipo">0</h3>
                                        <small class="text-muted">Usuarios internos de la plataforma</small>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #DC2626 !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Superadministradores</span>
                                            <div class="p-2 rounded-circle bg-light text-danger"><i class="fas fa-crown"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-dark mb-1" id="kpi_superadmins">0</h3>
                                        <small class="text-muted">Control global total</small>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #0891B2 !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Soporte Técnico</span>
                                            <div class="p-2 rounded-circle bg-light text-info"><i class="fas fa-headset"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-dark mb-1" id="kpi_soporte">0</h3>
                                        <small class="text-muted">Atención e incidencias</small>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xl-3 col-md-6 mb-3">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 5px solid #16A34A !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="text-muted small text-uppercase font-weight-bold">Ventas & Finanzas</span>
                                            <div class="p-2 rounded-circle bg-light text-success"><i class="fas fa-chart-pie"></i></div>
                                        </div>
                                        <h3 class="font-weight-bold text-dark mb-1" id="kpi_comercial">0</h3>
                                        <small class="text-muted">Comercial y métricas</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tabla -->
                        <div class="card border-0 shadow-sm" style="border-radius: 12px;">
                            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap">
                                <h5 class="card-title font-weight-bold text-dark mb-0">
                                    <i class="fas fa-id-badge mr-2 text-primary"></i>Directorio de Personal
                                </h5>
                                <div class="card-tools d-flex align-items-center flex-wrap gap-2">
                                    <select id="filtro_perfil_equipo" class="custom-select custom-select-sm mr-2 shadow-sm" style="border-radius: 6px; width: 160px;">
                                        <option value="">Todos los perfiles</option>
                                        <option value="SUPERADMIN">Superadministrador</option>
                                        <option value="SUPPORT">Soporte Técnico</option>
                                        <option value="SALES">Ventas</option>
                                        <option value="FINANCE">Finanzas</option>
                                    </select>
                                    <select id="filtro_estado_equipo" class="custom-select custom-select-sm shadow-sm" style="border-radius: 6px; width: 130px;">
                                        <option value="">Todos los estados</option>
                                        <option value="true">Activos</option>
                                        <option value="false">Inactivos</option>
                                    </select>
                                </div>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover align-middle mb-0" style="width: 100%;">
                                        <thead class="bg-light text-muted small text-uppercase font-weight-bold">
                                            <tr>
                                                <th class="pl-4">Nombre Completo / Usuario</th>
                                                <th>Contacto / Correo</th>
                                                <th>Documento</th>
                                                <th>Perfil Asignado</th>
                                                <th>Estado</th>
                                                <th>Último Ingreso</th>
                                                <th class="text-right pr-4">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tbody_equipo">
                                            <!-- Se inyecta con JS -->
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
             MODAL: REGISTRAR / EDITAR INTEGRANTE
             ============================================================ -->
        <div class="modal fade" id="modal_miembro" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
            <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
                    <div class="modal-header bg-white border-0 pb-0 pt-4 px-4">
                        <h5 class="modal-title font-weight-bold text-dark" id="modal_miembro_title">
                            <i class="fas fa-user-plus text-primary mr-2"></i>Registrar Integrante
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form id="form_miembro_equipo">
                        <input type="hidden" id="miembro_id" value="">
                        <div class="modal-body px-4 py-3">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="font-weight-bold text-muted small">Nombre de Usuario <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="miembro_username" placeholder="ej: soporte.juan" required style="border-radius: 8px;">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="font-weight-bold text-muted small">Correo Electrónico <span class="text-danger">*</span></label>
                                    <input type="email" class="form-control" id="miembro_email" placeholder="ej: juan@saas.com" required style="border-radius: 8px;">
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="font-weight-bold text-muted small">Nombres <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="miembro_first_name" placeholder="Nombres" required style="border-radius: 8px;">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="font-weight-bold text-muted small">Apellidos <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="miembro_last_name" placeholder="Apellidos" required style="border-radius: 8px;">
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="font-weight-bold text-muted small">Número de Documento <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="miembro_document" placeholder="Documento de identidad" required style="border-radius: 8px;">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="font-weight-bold text-muted small">Teléfono</label>
                                    <input type="text" class="form-control" id="miembro_phone" placeholder="Opcional" style="border-radius: 8px;">
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="font-weight-bold text-muted small">Perfil Funcional <span class="text-danger">*</span></label>
                                    <select class="custom-select" id="miembro_profile" style="border-radius: 8px;">
                                        <option value="SUPPORT">Soporte Técnico (Atención e Impersonación)</option>
                                        <option value="SALES">Ventas (Comercial y Extensión de Pruebas)</option>
                                        <option value="FINANCE">Finanzas (Recaudación y Métricas)</option>
                                        <option value="SUPERADMIN">Propietario / Superadministrador (Acceso Total)</option>
                                    </select>
                                    <small class="text-muted">Aplica principio de mínimo privilegio.</small>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="font-weight-bold text-muted small">Contraseña</label>
                                    <input type="password" class="form-control" id="miembro_password" placeholder="••••••••••••" style="border-radius: 8px;">
                                    <small class="text-muted" id="seccion_password_help">Requerida para el inicio de sesión</small>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer bg-light border-0 px-4 py-3" style="border-radius: 0 0 16px 16px;">
                            <button type="button" class="btn btn-secondary btn-sm font-weight-bold" data-dismiss="modal" style="border-radius: 8px;">Cancelar</button>
                            <button type="submit" class="btn btn-primary btn-sm font-weight-bold" style="border-radius: 8px;">
                                <i class="fas fa-save mr-1"></i> Guardar Integrante
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- ============================================================
             MODAL: HISTORIAL DE ACTIVIDAD / AUDITORÍA
             ============================================================ -->
        <div class="modal fade" id="modal_actividad" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
                    <div class="modal-header bg-white border-0 pb-0 pt-4 px-4">
                        <div>
                            <h5 class="modal-title font-weight-bold text-dark">
                                <i class="fas fa-history text-info mr-2"></i>Traza de Actividad Reciente
                            </h5>
                            <p class="text-muted small mb-0 mt-1" id="actividad_miembro_name">Integrante</p>
                            <div class="mt-1" id="actividad_miembro_rol"></div>
                        </div>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body px-4 py-3">
                        <h6 class="font-weight-bold text-dark mb-2">Últimos eventos registrados en AuditLog:</h6>
                        <div id="actividad_logs_container" class="list-group list-group-flush border rounded" style="max-height: 350px; overflow-y: auto;">
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
        require_once __DIR__ . '/../../layouts/control-sidebar.php';
        require_once __DIR__ . '/../../layouts/footer.php';
        ?>

    </div>

    <!-- Script de Inicialización -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import SaasEquipoController from "<?php echo $URL; ?>/public/assets/js/controllers/saas_admin/equipo_controller.js?v=<?php echo $APP_VERSION; ?>";

        document.addEventListener("DOMContentLoaded", async () => {
            const ok = await App.bootstrap();
            if (!ok) return;
            SaasEquipoController.init();
        });
    </script>
</body>

</html>
