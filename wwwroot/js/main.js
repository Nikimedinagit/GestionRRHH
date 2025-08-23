// ==== Funciones para obtener datos del localStorage ====
function getToken() {
  return localStorage.getItem("token");
}

function getNombre() {
  return localStorage.getItem("usuarioNombre");
}

function getEmail() {
  return localStorage.getItem("usuarioGmail");
}

function getRol() {
  return localStorage.getItem("rol");
}

// ==== Función para verificar sesión válida ====
function verificarUsuario() {
  if (!getToken() || !getEmail()) {
    localStorage.clear();
    window.location.href = "../views/login.html";
  }
}

// ==== Capitalizar nombre ====
function capitalizarNombre(nombre) {
  if (!nombre) return "";
  return nombre
    .toLowerCase()
    .split(" ")
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

// ==== DOM cargado ====
document.addEventListener("DOMContentLoaded", () => {
  verificarUsuario();

  const usuarioNombre = getNombre();
  const usuarioGmail = getEmail();
  const rol = getRol();

  const nombreFormateado = capitalizarNombre(usuarioNombre);

  if (nombreFormateado) {
    document.getElementById("usuarioNombre").textContent = nombreFormateado;
  }
  if (usuarioGmail) {
    document.getElementById("usuarioGmail").textContent = usuarioGmail;
  }
  if (rol) {
    document.getElementById("usuarioRol").textContent = rol;
  }

  // MostrarOpcionesPorRol(); // Si querés activarlo
});

// ==== Función para mostrar menú según el rol ====
// function MostrarOpcionesPorRol() {
//   const rol = getRol();

//   if (!rol) return;

//   if (rol === "ADMINISTRADOR") {
//     $("#menuCategorias").removeClass("d-none");
//     $("#menuTickets").removeClass("d-none");
//     $("#menuClientes").removeClass("d-none");
//     $("#menuPuestosLaborales").removeClass("d-none");
//     $("#menuDesarrolladores").removeClass("d-none");
//   }

  // Podés agregar más roles si necesitás:
  // if (rol === "RRHH") { ... }
  // if (rol === "EMPLEADO") { ... }
