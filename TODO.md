# 📋 Pendientes del Proyecto Front-end (TODO List)

## ⏳ En Proceso / Pendientes

- [x] en las carpeta public\assets\js\controllers\usuario alli cree la estructura con sus archivos correspondientes y lo mismo en public\assets\services tambien esta la estructura realizada.
- []

## ✅ Completado

- [x] Conexión al backend e inicio de sesión con redirección al Dashboard. *(Asignado: Jhan)*
- [x] Crear controlador `public/assets/js/controllers_logout.js` para destruir sesión. *(Asignado: Diana)*
- [x] Maquetar el sidebar con el módulo de usuarios. *(Asignado: Diana)*
- [x] Implementar la vista del formulario para crear usuarios. *(Asignado: Diana)*
- [x] Implementar la tabla para poder ver usuarios creados podemos usar DATATABLE. *(Asignado: Diana)*
- [x] Arreglar el logo que esta en el siderbar para que se vea mucho mejor. *(Asignado: Diana)*´

()estuve auditando y corrigiendo la parte del frontend. Ya quedó lista, estructurada y conectada:

El cliente HTTP y el enrutador (app.js) ya envían correctamente el token de autorización del administrador.

El controlador y la vista de listar usuarios ya están listos para recibir y pintar los datos en la tabla.

Al hacer la prueba, la petición ya llega con éxito al backend, pero la API está respondiendo con un Error 500 (Internal Server Error) en el endpoint /api/v1/users/. ¿Me ayudas a revisar la terminal de Django para ver qué excepción está lanzando en el servidor y dejar listo el backend?