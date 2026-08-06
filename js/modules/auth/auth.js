export function login(username, password) {

    // Validar que los campos no estén vacíos
    if (username.trim() === "" || password.trim() === "") {

        alert("Debe ingresar el usuario y la contraseña.");

        return false;
    }

    // Usuario de prueba
    if (username === "admin" && password === "123456") {

        alert("Bienvenido al sistema.");

        return true;
    }

    alert("Usuario o contraseña incorrectos.");

    return false;

}