<?php
require_once __DIR__ . '../../../config/app.php';
?>

<footer class="main-footer">
    <strong>Copyright &copy; 2026 <a href="https://inventariopme.com">Inventario P.M.E</a>.</strong>
    Todos los derechos reservados.
    <span class="text-muted text-sm ml-2">
        | <i class="fas fa-code mx-1"></i>Desarrollado por: <strong>Diana Vanessa Trujillo</strong> | <strong>Jhan Snaider Sanchez</strong>
    </span>
    <div class="float-right d-none d-sm-inline-block">
        <b>Version</b> 1.0.0
    </div>
</footer>

<!-- jQuery -->
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/jquery/jquery.min.js"></script>

<!-- Bootstrap 4 -->
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>

<!-- DataTables Core -->
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/datatables/jquery.dataTables.min.js"></script>
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-bs4/js/dataTables.bootstrap4.min.js"></script>

<!-- DataTables Responsive -->
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-responsive/js/dataTables.responsive.min.js"></script>
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-responsive/js/responsive.bootstrap4.min.js"></script>

<!-- 1. Librerías requeridas para generar Excel y PDF (DEBEN IR ANTES DE LOS BOTONES HTML5) -->
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/jszip/jszip.min.js"></script>
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/pdfmake/pdfmake.min.js"></script>
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/pdfmake/vfs_fonts.js"></script>

<!-- 2. DataTables Buttons Core -->
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-buttons/js/dataTables.buttons.min.js"></script>
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-buttons/js/buttons.bootstrap4.min.js"></script>

<!-- 3. Funcionalidad de Exportación de los Botones -->
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-buttons/js/buttons.html5.min.js"></script>
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-buttons/js/buttons.print.min.js"></script>
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-buttons/js/buttons.colVis.min.js"></script>

<!-- AdminLTE App -->
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/dist/js/adminlte.js"></script>

<!-- Aplicación principal -->
<script type="module">
    import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
    import LogoutController from "<?php echo $URL; ?>/public/assets/js/controllers/auth/logout_controller.js";

    document.addEventListener("DOMContentLoaded", async () => {
        await App.bootstrap();
        LogoutController.init();
    });
</script>

</body>

</html>
