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


  if (rol === "ADMINISTRADOR") {
    $("#gestionUsuarios, #gestionOrganizacional, #gestionGeografica, #gestionDesempeño").removeClass("d-none");
    $("#aprobacionDeLicencias, #tiposDeLicencias, #tiposCriterios, #registroDePersonal, #controlDeAsistencia, #asignacionDeHorarios, #justificacionGeneral, #resultadoGestionPersonal, #resultadoGestionLicencia").removeClass("d-none");
  }

  else if (rol === "RRHH") {
    $("#gestionUsuarios, #gestionOrganizacional, #gestionGeografica, #gestionDesempeño").removeClass("d-none");
    $("#aprobacionDeLicencias, #tiposDeLicencias, #tiposCriterios, #registroDePersonal, #controlDeAsistencia, #asignacionDeHorarios, #justificacionGeneral, #resultadoGestionPersonal, #resultadoGestionLicencia").removeClass("d-none");
  }

  else if (rol === "SUPERVISOR") {
    $("#miPanelPersonal, #gestionDesempeño").removeClass("d-none");
    $("#justificacionGeneral, #personalACargo, #resultadoGestionPersonal").removeClass("d-none");
  }

  else if (rol === "EMPLEADO") {
    $("#miPanelPersonal").removeClass("d-none");
    $("#justificacionGeneral").removeClass("d-none");
  }
}


