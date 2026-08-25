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


<!-- ./wrapper -->

<!-- jQuery -->
<script src="<?php echo $URL; ?>public/assets/vendor/AdminLTE-3.2.0/plugins/jquery/jquery.min.js"></script>
<!-- Bootstrap 4 -->
<script src="<?php echo $URL; ?>public/assets/vendor/AdminLTE-3.2.0/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<!-- AdminLTE App -->
<script src="<?php echo $URL; ?>public/assets/vendor/AdminLTE-3.2.0/dist/js/adminlte.js"></script>

<!-- Script de Logout (Cierre de Sesión) -->
<script type="module">
    import LogoutController from "<?php echo $URL; ?>public/assets/js/controllers7logout.js";
    
    // Inicializamos el controlador de logout cuando cargue la página
    document.addEventListener("DOMContentLoaded", () => {
        LogoutController.init();
    });
</script>
</body>

</html>