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
    $("#gestionUsuarios, #gestionOrganizacional, #gestionGeografica").removeClass("d-none");
    $("#aprobacionDeLicencias, #tiposDeLicencias, #tiposCriterios, #registroDePersonal, #controlDeAsistencia, #asignacionDeHorarios, #justificacionGeneral, #resultadoGestionPersonal").removeClass("d-none");
  }

  else if (rol === "RRHH") {
    $("#gestionUsuarios, #gestionOrganizacional, #gestionGeografica").removeClass("d-none");
    $("#aprobacionDeLicencias, #tiposDeLicencias, #tiposCriterios, #registroDePersonal, #controlDeAsistencia, #asignacionDeHorarios, #justificacionGeneral, #resultadoGestionPersonal").removeClass("d-none");
  }

  else if (rol === "SUPERVISOR") {
    $("#miPanelPersonal").removeClass("d-none");
    $("#justificacionGeneral, #personalACargo, #resultadoGestionPersonal").removeClass("d-none");
  }

  else if (rol === "EMPLEADO") {
    $("#miPanelPersonal").removeClass("d-none");
    $("#justificacionGeneral").removeClass("d-none");
  }
}


////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIONES PARA CARGAR NOTIFICACIONES /////////////////////////////////////////////
async function CargarNotificaciones() {
  try {
    const response = await authFetch("Notificaciones/PorRol",
      { method: "GET" }
    );
    const notificaciones = await response.json();

    const lista = document.getElementById("listaNotificaciones");
    lista.innerHTML = "";

    notificaciones.forEach(n => {
      const item = document.createElement("a");
      item.className = "list-group-item list-group-item-action py-2";

      const badgeStyle = n.leida
        ? "background-color:#e9ecef; color:#6c757d; font-size:0.75rem; padding:2px 6px; border-radius:12px;"
        : "background-color:#d4edda; color:#155724; font-size:0.75rem; padding:2px 6px; border-radius:12px;";

      item.innerHTML = `
        <div class="d-flex">
          <div class="flex-shrink-0">
            <i class="ti ti-bell ${n.leida ? "text-secondary" : "text-primary"}"></i>
          </div>
          <div class="flex-grow-1 ms-2">
            <div class="d-flex justify-content-between">
              <strong class="text-body" style="font-size: 0.85rem;">${n.titulo}</strong>
              <small class="text-muted" style="font-size: 0.7rem;">
                ${new Date(n.fechaCreacion).toLocaleString("es-AR", { hour12: false })}
              </small>
            </div>
            <small class="text-muted" style="font-size: 0.75rem;">${n.mensaje}</small>
            <div class="d-flex justify-content-end">
              <span style="${badgeStyle}">
                ${n.leida ? "Leído" : "No leído"}
              </span>
            </div>
          </div>
        </div>
      `;

      item.addEventListener("click", () => MarcarComoLeida(n.id));
      lista.appendChild(item);
    });


    document.getElementById("badgeNotificaciones").textContent =
      notificaciones.filter(n => !n.leida).length;

  } catch (error) {
    MostrarErrorCatch(error);
  }
}

async function MarcarComoLeida(id) {
  try {
    const response = await authFetch(`Notificaciones/${id}/Leer`, {
      method: "PUT"
    });

    if (response.ok) {
      CargarNotificaciones();
    }
  } catch (error) {
    MostrarErrorCatch(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  CargarNotificaciones();
  setInterval(CargarNotificaciones, 3000); 
});