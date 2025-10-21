//////////////////////////////////////////////////////////////////////////////////////
/// FUNCIONES PARA OBTEENR DATOS DE LOCAL STORAGE /////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
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


//////////////////////////////////////////////////////////////////////////////////////
/// FUNCION APRA VERIFICAR EL USUARIO ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function verificarUsuario() {
  if (!getToken() || !getEmail()) {
    localStorage.clear();
    window.location.href = "../views/login.html";
  }
}


//////////////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA CAPITALIZAR EL NOMBRE DEL USUARIO /////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function capitalizarNombre(nombre) {
  if (!nombre) return "";
  return nombre
    .toLowerCase()
    .split(" ")
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}


//////////////////////////////////////////////////////////////////////////////////////
/// INICIALIZAR AL CARGAR LA PAGINA //////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
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

  MostrarOpcionesSidebarPorRol();

});



//////////////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA MOSTRAR LAS OPCIONES DEL SIDEBAR POR ROL /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function MostrarOpcionesSidebarPorRol() {
  const rol = getRol()?.toUpperCase();
  if (!rol) return;

  // Mostrar opciones comunes
  $("#miPanelPersonal, #gestionDeDesempeno, #gestionDeLicencias, #gestionDeCursos").removeClass("d-none");

  if (rol === "ADMINISTRADOR" || rol === "RRHH") {
    // Mostrar módulos de gestión completa
    $("#aprobacionDeLicencias, #tiposDeLicencias, #gestionOrganizacional, #gestionGeografica, #gestionUsuarios, #gestionEmpleados, #tiposCriterios").removeClass("d-none");

    // Mostrar solo ciertas opciones del Panel Personal
    $("#miInformacion, #asistenciaHorarios").removeClass("d-none");
    $("#justificacionPersonal").addClass("d-none");

  } else if (rol === "SUPERVISOR" || rol === "EMPLEADO") {
    // Ocultar módulos administrativos
    $("#gestionOrganizacional, #gestionGeografica, #gestionUsuarios, #gestionEmpleados, #tiposCriterios, #aprobacionDeLicencias, #tiposDeLicencias").addClass("d-none");

    // Mostrar todo el Panel Personal completo
    $("#miInformacion, #asistenciaHorarios, #justificacionPersonal").removeClass("d-none");
  }
}
