//////////////////////////////////////////////////////////////////////////////
// ABRIR PANEL DE JUSTIFICACIONES ////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
function abrirPanelJustificacion() {
  document.getElementById("panelJustificacion").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputMotivo = document.getElementById("MotivoJustificacion");
    if (inputMotivo) inputMotivo.focus();
  }, 400);
}

//////////////////////////////////////////////////////////////////////////////
// CERRAR PANEL DE JUSTIFICACIONES ////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
function cerrarPanelJustificacion() {
  document.getElementById("panelJustificacion").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalJustificacion();
}

//////////////////////////////////////////////////////////////////////////////
// INICIALIZAR LOS ONCLICK AL BUSCAR ////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
  $("#EmpleadoIdBuscar, #FechaBuscar, #EstadoJustificacionBuscar").on(
    "input",
    function () {
      ObtenerJustificaciones(false);
    }
  );
});

//////////////////////////////////////////////////////////////////////////////
// OBTENER LAS LOS DATODS DE LA API DE JUSTIFICACIONES /////////////////////////
//////////////////////////////////////////////////////////////////////////////
async function ObtenerJustificaciones(mostrarSpinner = true) {

  if (mostrarSpinner) mostrarPantallaCarga();

  const fechaEl = document.getElementById("FechaBuscar");
  const estadoEl = document.getElementById("EstadoJustificacionBuscar");
  const empleadoEl = document.getElementById("EmpleadoIdBuscar");

  const fecha = fechaEl ? fechaEl.value : null;
  const estado = estadoEl ? parseInt(estadoEl.value) : null;
  const empleado = empleadoEl ? empleadoEl.value : "";

  const filtro = {
    fechaJustificacion: fecha || null,
    estadoJustificacion: estado || null,
    empleadoTexto: empleado,
  };

  try {
    const res = await authFetch("Justificaciones/Filtrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filtro),
    });

    const data = await res.json();
    MostrarJustificaciones(data);
    LimpiarModalJustificacion();
    ObtenerTotalJustificaciones();

  } catch (error) {
    MostrarErrorCatch();
  }
  finally { if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1200); } };

}

//////////////////////////////////////////////////////////////////////////////
// MOSTRAR LAS JUSTIFICACIONES ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
function MostrarJustificaciones(data) {
  if (window.innerWidth <= 764) {
    MostrarJustificacionesMobile(data);
  } else {
    MostrarJustificacionesDesktop(data);
  }
}

window.addEventListener("resize", function () {
  ObtenerJustificaciones(false);
});


//////////////////////////////////////////////////////////////////////////////
// MOSTRAR LAS JUSTIFICACIONES DESKTOP ///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
function MostrarJustificacionesDesktop(data) {
  const contenedor = $("#contenedorJustificaciones");
  contenedor.empty();

  if (!Array.isArray(data) || data.length === 0) {
    contenedor.append(
      "<div class='text-center text-muted py-3'>No hay justificaciones para mostrar.</div>"
    );
    return;
  }

  const rol = getRol().trim().toUpperCase();

  const justificacionColor = {
    PENDIENTE: "badge-pendiente",
    APROBADA: "badge-aprobada",
    RECHAZADA: "badge-rechazada",
  };

  data.forEach((element) => {
    const documentoHtml = element.documentoNombre
      ? `<p class="text-muted d-flex align-items-center gap-2 mb-2">
           <button onclick="DescargarDocumento(${element.id})" class="document-link d-flex align-items-center gap-1" data-tippy-content="Descargar" style="color: inherit; text-decoration: none; font-size: 0.9rem; border:none; background:none; cursor:pointer;">
             <i class="bi bi-file-earmark-text" style="font-size: 1rem;"></i>
             <span>Descargar</span>
           </button>
         </p>`
      : "";

    const estadoNombre = element.estadoString || "PENDIENTE";
    const claseJustificacion = justificacionColor[estadoNombre] || "bg-light text-dark";
    const fecha = element.fechaString || "Sin fecha";

    const fechaParts = fecha.split("/");
    const fechaIncidente = new Date(fechaParts[2], fechaParts[1] - 1, fechaParts[0]);
    const hoy = new Date();
    const limite = new Date(fechaIncidente);
    limite.setDate(limite.getDate() + 7);

    let botonEditar = "";
    let botonEliminar = "";
    if (estadoNombre === "PENDIENTE" && hoy <= limite) {
      botonEditar = `<div class="d-flex justify-content-between align-items-center">
                       <div>
                         <button class="btn-editar" style="background: none; border: none;" onclick="MostrarModalEditar(${element.id})" data-tippy-content="Editar">
                           <i class="bi bi-pencil-square icono-editar"></i>
                         </button>
                       </div>
                     </div>`;
      botonEliminar = `<button class='btn-borrar' style='background: none; border: none;' 
                         onclick='EliminarJustificacion(${element.id})' data-tippy-content='Eliminar'>
                         <i class='bi bi-trash3 icono-borrar'></i>
                       </button>`;
    }

    let botonAccion = "";
    if ((rol === "ADMINISTRADOR" || rol === "RRHH") && estadoNombre === "PENDIENTE") {
      botonAccion = `<div class="d-flex justify-content-between align-items-center">
                       <div class="d-flex justify-content-center align-items-center gap-1">
                         <button class="btn-accionLicencia" style="background:none; border:none;" onclick="AbrirModalAccionJustificacion(${element.id})" 
                           data-tippy-content="Aprobar o rechazar"> 
                           <i class="bi bi-sliders icono-accion"></i>
                         </button>
                       </div>
                     </div>`;
    }

    const item = $(`
      <div class="border rounded py-2 px-2 mb-2 d-flex align-items-center justify-content-between bg-white">
        <div class="d-flex justify-content-between align-items-center w-100" >
          <div class="d-flex align-items-center" style="flex: 1.5;">
            ${botonEditar}
            <div class="fw-bold text-truncate" style="max-width: 200px;" title="${element.empleadoString || "Sin nombre"}">
              ${element.empleadoString || "Sin nombre"}
            </div>
          </div>

          <div class="text-muted text-center" style="opacity: 0.6; min-width: 120px;">
            Día del incidente: ${fecha}
          </div>

          <div class="d-flex align-items-center justify-content-end" style="flex: 1;">
            <div class="badge me-2 ${claseJustificacion}" title="${estadoNombre}">
              ${estadoNombre}
            </div>
            ${botonAccion}
            ${botonEliminar}
            <div>
              <button class="btn-ver-descripcion" style="background: none; border: none;" data-tippy-content="Detalle">
                <i class="bi bi-chevron-down"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `);

    const descripcionDetalle = $(`
      <div class="panelJustificacion px-2 mb-2 container" style="display: none; background-color: #ffffff;">
          <h3 class="p-2 mt-1" style="font-size: 1rem; font-weight: 600;">Detalle de la Justificación</h3>
        <div class="d-flex gap-3 mb-2">
          <div class="p-2 border rounded" 
              style="flex: 2; background-color: #ffffff;
                      max-height: 200px; overflow-y: auto;
                      word-wrap: break-word;" >
              <small class="fw-bold d-block mb-1" style="font-size: 0.85rem;" >Motivo</small>
              <hr style="margin: 0.2rem;" />
              <div>${element.motivo || "Sin motivo"}</div>
          </div>
          <div class="p-2 border rounded" style="flex: 1; background-color: #ffffff;">
            <small class="fw-bold d-block mb-1" style="font-size: 0.85rem;">Documento Adjunto</small>
            <div>${documentoHtml || "No se adjuntó ningún documento."}</div>
          </div>
        </div>
      </div>
    `);

    item.find(".btn-ver-descripcion").on("click", function () {
      const icono = $(this).find("i");

      $(".panelJustificacion.mostrar").not(descripcionDetalle).slideUp(200).removeClass("mostrar");
      $(".btn-ver-descripcion i").not(icono)
        .removeClass("bi-chevron-up")
        .addClass("bi-chevron-down");

      descripcionDetalle.slideToggle(200, function () {
        descripcionDetalle.toggleClass("mostrar", descripcionDetalle.is(":visible"));
      });
      icono.toggleClass("bi-chevron-down bi-chevron-up");
    });

    contenedor.append(item);
    contenedor.append(descripcionDetalle);
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

//////////////////////////////////////////////////////////////////////////////
// MOSTRAR LAS JUSTIFICACIONES MOBILE ///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
function MostrarJustificacionesMobile(data) {
  const contenedor = document.getElementById("contenedorJustificaciones");
  contenedor.innerHTML = "";

  const rol = getRol().trim().toUpperCase();

  if (!Array.isArray(data) || data.length === 0) {
    contenedor.innerHTML =
      "<div class='text-center text-muted py-3'>No hay justificaciones para mostrar.</div>";
    return;
  }

  const justificacionColor = {
    PENDIENTE: "badge-pendiente",
    APROBADA: "badge-aprobada",
    RECHAZADA: "badge-rechazada",
  };

  data.forEach((element) => {
    const estadoNombre = element.estadoString || "SIN ESTADO";
    const claseJustificacion = justificacionColor[estadoNombre] || "bg-light text-dark";
    const fecha = element.fechaString || "Sin fecha";


    let botonesHtml = "";
    if (estadoNombre === "PENDIENTE") {
      const fechaParts = fecha.split("/");
      if (fechaParts.length === 3) {
        const fechaIncidente = new Date(fechaParts[2], fechaParts[1] - 1, fechaParts[0]);
        const hoy = new Date();
        const limite = new Date(fechaIncidente);
        limite.setDate(limite.getDate() + 7);
        if (hoy <= limite) {
          botonesHtml += `<div class="d-flex gap-2 mt-2">`;

          if (["ADMINISTRADOR", "RRHH", "SUPERVISOR", "EMPLEADO"].includes(rol)) {
            botonesHtml += `
              <button class="btn-editar" style="background: none; border: none;" onclick="MostrarModalEditar(${element.id})" data-tippy-content="Editar">
                <i class="bi bi-pencil-square icono-editar"></i>
              </button>
              <button class="btn-borrar" style="background: none; border: none;" onclick="EliminarJustificacion(${element.id})" data-tippy-content="Eliminar">
                <i class="bi bi-trash3 icono-borrar"></i>
              </button>
            `;
          }

          if (["ADMINISTRADOR", "RRHH"].includes(rol)) {
            botonesHtml += `
              <button class="btn-accionLicencia" style="background:none; border:none;" onclick="AbrirModalAccionJustificacion(${element.id})" data-tippy-content="Aprobar o rechazar">
                <i class="bi bi-sliders icono-accion"></i>
              </button>
            `;
          }

          botonesHtml += `</div>`;
        }
      }
    }

    const card = document.createElement("div");
    card.className = "col-12 col-md-6 col-lg-4 col-xl-3 mb-3";
    card.innerHTML = `
          <div class="card shadow-sm p-2 rounded d-flex flex-column w-100" style="min-height: 140px; border-left: 3px solid ${element.claseBorde === 'green' ? '#198754' : element.claseBorde === 'yellow' ? '#ffc107' : '#dee2e6'}">
            <div class="flex-grow-1 d-flex flex-column">
              <h5 class="text-start fw-bold mb-2" style="font-size: 1.2rem;">${element.empleadoString || "Sin nombre"}</h5>
              <small class="text-muted mb-1" style="font-size: 0.9rem;"><i class="bx bx-calendar me-1"></i>Día del incidente: ${fecha}</small>
              <span class="badge ${claseJustificacion} my-2" style="width: fit-content;">${estadoNombre}</span>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-2">
              <div>${botonesHtml}</div>
              <div>
                <button class="btn-ver-detalle" onclick="MostrarDetalleJustificacion(${element.id})" data-id="${element.id}" style="background:none; border:none;" data-tippy-content="Detalle">
                  <i class="bi bi-info-circle icono-ver"></i>
                </button>
              </div>
            </div>
          </div>
        `;

    contenedor.appendChild(card);
  });

  document.querySelectorAll(".btn-ver-detalle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const elemento = data.find((x) => x.id == id);

      document.getElementById("detalleMotivo").innerText = elemento.motivo || "Sin motivo";
      document.getElementById("detalleDocumento").innerHTML = elemento.documentoNombre
        ? `<button onclick="DescargarDocumento(${elemento.id})" class="btn btn-sm">
             <i class="bi bi-file-earmark-text me-1"></i>Descargar
           </button>`
        : "No se adjuntó ningún documento";

      const offcanvas = new bootstrap.Offcanvas(document.getElementById("offcanvasDetalleJustificacion"));
      offcanvas.show();
    });
  });

  tippy("[data-tippy-content]", { animation: "scale", theme: "mi-tema", delay: [100, 0] });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// MOSTRAR DETALLE DE JUSTIFICACION //////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarDetalleJustificacion(id) {
  const justificacion = justificacionesData.find((j) => j.id === id);
  if (!justificacion) return;

  document.getElementById("detalleMotivo").textContent =
    justificacion.motivo || "Sin motivo";

  document.getElementById("detalleDocumento").innerHTML =
    justificacion.documentoNombre
      ? `<button onclick="DescargarDocumento(${justificacion.id})" class="btn btn-sm">
           <i class="bi bi-file-earmark-text me-1"></i>Descargar
         </button>`
      : "No se adjuntó ningún documento";

  const offcanvas = new bootstrap.Offcanvas(
    document.getElementById("offcanvasDetalleJustificacion")
  );
  offcanvas.show();
}


///SUPERVISOR DEBE DE VER LAS JUSTIFICACIONES DE LOS EMPLEADOS A CARGO DE MI SECTOR EN COLOR AMARILLO, 
// CUANDO CREO LAS PROPIAS MIAS COMO SUPERVISOR APARECEN EN VERDE. 
// LOS EMPLEADOS SOLO VISUALIZAN LAS JUSTIFICACIONES EN COLOR GRIS YA SEA CREADO POR UN ADMINISTRADOR O POR EL DE RRHH 
// Y CUANDO CREAN SUS PROPIAS JUTIFICACIONES DEBEN DE VERSE EN VERDE. 
// CUANDO ES ADMINISTRADOR VE TODAS OSEA PUEDE HACER TODO TODO Y APARECEN EN UN GRIS MUY CLARITO. SERIA ASI??? 

//////////////////////////////////////////////////////////////////////////////
// DESCARGAR DOCUMENTO /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
async function DescargarDocumento(id) {
  try {
    const response = await authFetch(`Justificaciones/Documento/${id}`);

    const blob = await response.blob();

    const disposition = response.headers.get("Content-Disposition");
    let filename = "archivo_descargado";

    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?([^;\r\n]+)/i);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1].replace(/['"]/g, ""));
      }
    }

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    MostrarErrorCatch();
  }
}

//////////////////////////////////////////////////////////////////////////////
// MOSTRAR MODAL DE EDICION DE LA JUSTIFICACION //////////////////////////////
//////////////////////////////////////////////////////////////////////////////
async function MostrarModalEditar(id) {
  const res = await authFetch(`Justificaciones/${id}`);

  const justificacion = await res.json();

  console.log(justificacion);

  document.getElementById("IdJustificacion").value = justificacion.id;
  document.getElementById("MotivoJustificacion").value = justificacion.motivo;
  document.getElementById("FechaJustificacion").value = justificacion.fecha
    ? new Date(justificacion.fecha).toISOString().split("T")[0]
    : "";
  document.getElementById("EmpleadoId").value = justificacion.empleadoId;

  document.getElementById("FechaJustificacion").disabled = true;
  document.getElementById("EmpleadoId").disabled = true;

  const archivoAdjuntoDiv = document.getElementById("archivoAdjuntoActual");

  if (
    justificacion.documentoAdjunto &&
    justificacion.documentoAdjunto.length > 0
  ) {
    const byteCharacters = atob(justificacion.documentoAdjunto);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: justificacion.documentoMimeType,
    });
    const url = URL.createObjectURL(blob);

    let nombreArchivo = justificacion.documentoNombre;
    if (nombreArchivo) {
      nombreArchivo = nombreArchivo.split("\\").pop().split("/").pop();
      if (nombreArchivo.length > 40) {
        nombreArchivo = nombreArchivo.substring(0, 40) + "...";
      }
    }

    archivoAdjuntoDiv.innerHTML = `
    <a href="${url}" download = "${justificacion.documentoNombre}">
      <i class="bi bi-file-earmark-text"></i> ${nombreArchivo}
    </a>
    `;
  } else {
    archivoAdjuntoDiv.innerHTML = "";
  }

  abrirPanelJustificacion();
}

//////////////////////////////////////////////////////////////////////////////
// FUNCION PARA BUSCAR EL ID DE LA JUSTIFICACION Y LLAMAR A LA FUNCION DE EDICION O CREACION //////
//////////////////////////////////////////////////////////////////////////////
function BuscarJustificacionId() {
  const id = parseInt(document.getElementById("IdJustificacion").value);

  if (!id || id === 0) {
    CrearJustificacion();
  } else {
    EditarJustificacion(id);
  }
}

//////////////////////////////////////////////////////////////////////////////
// LIMPIAR EL FORMULARIO DE LA JUSTIFICACION /////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
function LimpiarModalJustificacion() {
  document.getElementById("FechaJustificacion").disabled = false;
  document.getElementById("EmpleadoId").disabled = false;

  document.getElementById("IdJustificacion").value = "";
  const inputMotivo = document.getElementById("MotivoJustificacion");
  inputMotivo.value = "";
  const fechaJustificacion = document.getElementById("FechaJustificacion");
  fechaJustificacion.value = "";
  const selectEmpleadoId = document.getElementById("EmpleadoId");
  selectEmpleadoId.value = "";
  const inputDocumento = document.getElementById("DocumentoAdjunto");
  inputDocumento.value = "";

  inputMotivo.classList.remove("is-invalid", "is-valid");
  fechaJustificacion.classList.remove("is-invalid", "is-valid");
  selectEmpleadoId.classList.remove("is-invalid", "is-valid");
  inputDocumento.classList.remove("is-invalid", "is-valid");

  const inputErrorMotivo = document.getElementById("errorMotivoJustificacion");
  inputErrorMotivo.textContent = "";

  const errorEmpleadoId = document.getElementById(
    "errorEmpleadoIdJustificacionSinEmpleado"
  );
  errorEmpleadoId.textContent = "";

  inputErrorMotivo.style.display = "none";
  const fechaErrorJustificacion = document.getElementById(
    "errorFechaJustificacion"
  );
  fechaErrorJustificacion.textContent = "";
  fechaErrorJustificacion.style.display = "none";
  const selectErrorEmpleado = document.getElementById(
    "errorEmpleadoIdJustificacion"
  );
  selectErrorEmpleado.textContent = "";
  selectErrorEmpleado.style.display = "none";
}

//////////////////////////////////////////////////////////////////////////////
// FUNCION PARA VALIDAR EL FORMULARIO DE LA JUSTIFICACION ////////////////////
//////////////////////////////////////////////////////////////////////////////
function ValidarFormularioJustificacion() {
  const rol = getRol()?.toUpperCase();

  const inputMotivo = document.getElementById("MotivoJustificacion");
  const inputErrorMotivo = document.getElementById("errorMotivoJustificacion");

  const fechaJustificacion = document.getElementById("FechaJustificacion");
  const fechaErrorJustificacion = document.getElementById(
    "errorFechaJustificacion"
  );

  const selectEmpleado = document.getElementById("EmpleadoId");
  const selectErrorEmpleado = document.getElementById(
    "errorEmpleadoIdJustificacion"
  );

  const motivo = inputMotivo.value.trim();
  const fecha = fechaJustificacion.value;
  const empleado = selectEmpleado.value;

  inputErrorMotivo.style.display = "none";
  inputErrorMotivo.textContent = "";
  inputMotivo.classList.remove("is-invalid", "is-valid");

  fechaErrorJustificacion.style.display = "none";
  fechaErrorJustificacion.textContent = "";
  fechaJustificacion.classList.remove("is-invalid", "is-valid");

  selectErrorEmpleado.style.display = "none";
  selectErrorEmpleado.textContent = "";
  selectEmpleado.classList.remove("is-invalid", "is-valid");

  let esValid = true;

  if (motivo.length === 0) {
    inputMotivo.classList.add("is-invalid");
    inputErrorMotivo.style.display = "block";
    inputErrorMotivo.textContent = "Campo obligatorio.";
    esValid = false;
  } else if (motivo.length < 3) {
    inputMotivo.classList.add("is-invalid");
    inputErrorMotivo.style.display = "block";
    inputErrorMotivo.textContent = "Mínimo 3 caracteres.";
    esValid = false;
  } else {
    inputMotivo.classList.add("is-valid");
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (!fecha) {
    fechaJustificacion.classList.add("is-invalid");
    fechaJustificacion.classList.remove("is-valid");
    fechaErrorJustificacion.style.display = "block";
    fechaErrorJustificacion.textContent = "Campo obligatorio.";
    esValid = false;
  } else {
    const fechaIngresada = new Date(fecha);
    fechaIngresada.setHours(0, 0, 0, 0);

    const plazoMaximo = new Date(fechaIngresada);
    plazoMaximo.setDate(plazoMaximo.getDate() + 7);

    if (hoy.getTime() > plazoMaximo.getTime()) {
      fechaJustificacion.classList.add("is-invalid");
      fechaJustificacion.classList.remove("is-valid");
      fechaErrorJustificacion.style.display = "block";
      fechaErrorJustificacion.textContent =
        "El plazo de 7 días para justificar ya venció.";
      esValid = false;
    } else if (fechaIngresada.getTime() > hoy.getTime()) {
      fechaJustificacion.classList.add("is-invalid");
      fechaJustificacion.classList.remove("is-valid");
      fechaErrorJustificacion.style.display = "block";
      fechaErrorJustificacion.textContent =
        "La fecha del incidente no puede ser futura.";
      esValid = false;
    } else {
      fechaJustificacion.classList.remove("is-invalid");
      fechaJustificacion.classList.add("is-valid");
      fechaErrorJustificacion.style.display = "none";
    }
  }
  if (rol === "ADMINISTRADOR" || rol === "RRHH") {
    if (empleado === "") {
      selectEmpleado.classList.add("is-invalid");
      selectErrorEmpleado.style.display = "block";
      selectErrorEmpleado.textContent = "Campo obligatorio.";
      esValid = false;
    } else {
      selectEmpleado.classList.remove("is-invalid");
      selectEmpleado.classList.add("is-valid");
      selectErrorEmpleado.style.display = "none";
    }
  }

  return esValid;
}

//////////////////////////////////////////////////////////////////////////////
// FUNCION PARA VALIDAR EN VIVO FORMULARIO DE LA JUSTIFICACION ////////////////////
//////////////////////////////////////////////////////////////////////////////
document.getElementById("MotivoJustificacion").addEventListener("input", () => {
  const inputMotivo = document.getElementById("MotivoJustificacion");
  const errorMotivo = document.getElementById("errorMotivoJustificacion");
  const motivo = inputMotivo.value.trim();

  inputMotivo.classList.remove("is-invalid", "is-valid");

  if (motivo.length === 0) {
    inputMotivo.classList.add("is-invalid");
    errorMotivo.style.display = "block";
    errorMotivo.textContent = "Campo obligatorio.";
  } else if (motivo.length < 3) {
    inputMotivo.classList.add("is-invalid");
    errorMotivo.style.display = "block";
    errorMotivo.textContent = "Mínimo 3 caracteres.";
  } else {
    inputMotivo.classList.add("is-valid");
    errorMotivo.style.display = "none";
    errorMotivo.textContent = "";
  }
});

document.getElementById("FechaJustificacion").addEventListener("input", () => {
  const inputFecha = document.getElementById("FechaJustificacion");
  const errorFecha = document.getElementById("errorFechaJustificacion");

  inputFecha.classList.remove("is-invalid", "is-valid");

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (!inputFecha.value) {
    inputFecha.classList.add("is-invalid");
    errorFecha.style.display = "block";
    errorFecha.textContent = "Campo obligatorio.";
  } else {
    const fechaIngresada = new Date(inputFecha.value);
    fechaIngresada.setHours(0, 0, 0, 0);

    const plazoMaximo = new Date(fechaIngresada);
    plazoMaximo.setDate(plazoMaximo.getDate() + 7);

    if (hoy.getTime() > plazoMaximo.getTime()) {
      inputFecha.classList.add("is-invalid");
      errorFecha.style.display = "block";
      errorFecha.textContent = "El plazo de 7 días para justificar ya venció.";
    } else if (fechaIngresada.getTime() > hoy.getTime()) {
      inputFecha.classList.add("is-invalid");
      errorFecha.style.display = "block";
      errorFecha.textContent = "La fecha del incidente no puede ser futura.";
    } else {
      inputFecha.classList.add("is-valid");
      errorFecha.style.display = "none";
    }
  }
});

document.getElementById("EmpleadoId").addEventListener("input", () => {
  const input = document.getElementById("EmpleadoId");
  const error = document.getElementById("errorEmpleadoIdJustificacion");
  if (!input.value) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    error.style.display = "none";
  }
});

//////////////////////////////////////////////////////////////////////////////
// FUNCION PARA VALIDAR DADOS EXISTENTES ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
function MostrarErrorJustificacionExistente(mensaje) {
  const errorLicencia = document.getElementById("errorEmpleadoIdJustificacion");
  const errorEmpleadoId = document.getElementById(
    "errorEmpleadoIdJustificacionSinEmpleado"
  );

  const rol = getRol()?.toUpperCase();

  if (rol === "ADMINISTRADOR" || rol === "RRHH") {
    if (mensaje) {
      errorLicencia.textContent = mensaje;
      errorLicencia.style.display = "block";
    } else {
      errorLicencia.textContent = "";
      errorLicencia.style.display = "none";
    }
  } else if (rol === "SUPERVISOR" || rol === "EMPLEADO") {
    if (mensaje) {
      errorEmpleadoId.textContent = mensaje;
      errorEmpleadoId.style.display = "block";
    } else {
      errorEmpleadoId.textContent = "";
      errorEmpleadoId.style.display = "none";
    }
  }
}

//////////////////////////////////////////////////////////////////////////////
// FUNCION PARA CREAR UNA NUEVA JUSTIFICACION ///////////////////////////////
//////////////////////////////////////////////////////////////////////////////
async function CrearJustificacion() {
  if (!ValidarFormularioJustificacion()) {
    ocultarOverlayGuardando();
    return;
  }

  mostrarOverlayGuardando();

  try {

    const formData = new FormData();
    formData.append(
      "Motivo",
      document.getElementById("MotivoJustificacion").value
    );
    formData.append("Fecha", document.getElementById("FechaJustificacion").value);
    const rol = getRol()?.toUpperCase();
    if (rol === "ADMINISTRADOR" || rol === "RRHH") {
      formData.append("EmpleadoId", document.getElementById("EmpleadoId").value);
    }
    const archivo = document.getElementById("DocumentoAdjunto").files[0];
    if (archivo) {
      formData.append("DocumentoAdjunto", archivo);
    }

    const response = await authFetch("Justificaciones", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorJustificacionExistente(errorData.mensaje);
      } else {
        MostrarErrorCatch();
      }
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      ObtenerJustificaciones(false);
      cerrarPanelJustificacion();
      Swal.fire({
        title: "¡Justificación Creada!",
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
        background: "#f4fff7",
        color: "#1c3d26",
        icon: "success",
        iconColor: "#28a746d8",
        customClass: {
          popup: "swal2-toast-success",
          title: "swal2-toast-success-title",
          icon: "swal2-toast-success-icon",
        },
      });

    }, 800);

  } catch (error) {
    MostrarErrorCatch();
    ocultarOverlayGuardando();
  }

}

//////////////////////////////////////////////////////////////////////////////
// FUNCION PARA EDITAR UNA JUSTIFICACION ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
async function EditarJustificacion(id) {
  if (!ValidarFormularioJustificacion()) {
    ocultarOverlayGuardando();
    return;
  }

  mostrarOverlayGuardando();

  try {

    const formData = new FormData();
    formData.append(
      "Id",
      parseInt(document.getElementById("IdJustificacion").value)
    );
    formData.append(
      "Motivo",
      document.getElementById("MotivoJustificacion").value
    );
    formData.append("Fecha", document.getElementById("FechaJustificacion").value);
    formData.append("EmpleadoId", document.getElementById("EmpleadoId").value);

    const archivo = document.getElementById("DocumentoAdjunto").files[0];
    if (archivo) {
      formData.append("DocumentoAdjunto", archivo);
    }
    const response = await authFetch(`Justificaciones/${id}`, {
      method: "PUT",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorJustificacionExistente(errorData.mensaje);
      } else {
        MostrarErrorCatch();
      }
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      ObtenerJustificaciones(false);
      cerrarPanelJustificacion();
      Swal.fire({
        title: "¡Justificacion Modificada!",
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
        background: "#f4fff7",
        color: "#1c3d26",
        icon: "success",
        iconColor: "#28a746d8",
        customClass: {
          popup: "swal2-toast-success",
          title: "swal2-toast-success-title",
          icon: "swal2-toast-success-icon",
        },
      });

    }, 800);

  } catch (error) {
    MostrarErrorCatch();
    ocultarOverlayGuardando();
  }
}

//////////////////////////////////////////////////////////////////////////////
// FUNCION PARA ABRIR EL MODAL DE ACCION SOBRE LA JUSTIFICACION //////////////
//////////////////////////////////////////////////////////////////////////////
function AbrirModalAccionJustificacion(id) {
  Swal.fire({
    title: "Acción sobre la justificacion",
    html: `
    <p class='swal2-content-center'>¿Deseás aprobar o rechazar esta justificación?</p>
    <p class='swal2-content-center'>Esta acción actualizará el estado de la justificación en el sistema.</p>
  `,
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Si, aprobar",
    denyButtonText: "No, rechazar",
    cancelButtonText: "Cancelar",
    focusCancel: true,
    customClass: {
      popup: "swal2-custom-popup",
      confirmButton: "swal2-btn-activar",
      denyButton: "swal2-btn-desactivar",
      cancelButton: "swal2-btn-cancelar",
      title: "swal2-title-custom",
      htmlContainer: "swal2-content-center",
    },
    background: "#ffffff",
    color: "#1a1a1a",
  }).then((result) => {
    if (result.isConfirmed) {
      AprobarJustificacion(id);
    } else if (result.isDenied) {
      RechazarJustificacion(id);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Acción Cancelada",
        text: "Permanece pendiente.",
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
        background: "#fef8f4",
        color: "#5f4339",
        icon: "info",
        iconColor: "#ff914d",
        customClass: {
          popup: "swal2-toast-status",
          title: "swal2-toast-title",
          content: "swal2-toast-content",
        },
      });
    }
  });
}

//////////////////////////////////////////////////////////////////////////////
// FUNCION PARA APROBAR UNA JUSTIFICACION ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
async function AprobarJustificacion(id) {
  const res = await authFetch(`Justificaciones/${id}/Aprobar`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      Swal.fire({
        title: "¡Justificación Aprobada!",
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
        background: "#f4fff7",
        color: "#1c3d26",
        icon: "success",
        iconColor: "#28a746d8",
        customClass: {
          popup: "swal2-toast-success",
          title: "swal2-toast-success-title",
          icon: "swal2-toast-success-icon",
        },
      });
      ObtenerJustificaciones(false);
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}

//////////////////////////////////////////////////////////////////////////////
// FUNCION PARA RECHAZAR UNA JUSTIFICACION ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
async function RechazarJustificacion(id) {
  const res = await authFetch(`Justificaciones/${id}/Rechazar`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      Swal.fire({
        title: "¡Justificación Rechazada!",
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
        background: "#fff5f5",
        color: "#1c3d26",
        icon: "error",
        iconColor: "#dc3545d8 ",
        customClass: {
          popup: "swal2-toast-rechazada",
          title: "swal2-toast-rechazada-title",
          icon: "swal2-toast-rechazada-icon",
        },
      });

      ObtenerJustificaciones(false);
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}

//////////////////////////////////////////////////////////////////////////////
// FUNCION PARA ELIMINAR JUSTIFICACION /////////////////////////////
//////////////////////////////////////////////////////////////////////////////
function EliminarJustificacion(id) {
  Swal.fire({
    title: "¿Desea eliminar esta Justificación?",
    html: `
      <div class="text-center">
        <p>Esta justificacion será eliminada de forma definitiva. ¿Desea continuar?</p>
        <p>Esta acción no se puede deshacer.</p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    focusCancel: true,
    customClass: {
      popup: "swal2-border-radius",
      confirmButton: "swal2-btn-eliminar",
      cancelButton: "swal2-btn-cancelar",
      title: "swal2-title-custom",
      content: "swal2-content-custom",
    },
    background: "#fff",
    color: "#22223b",
  }).then((result) => {
    if (result.isConfirmed) {
      EliminarSiJustificacion(id);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Acción Cancelada",
        text: "Permanece registrada.",
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
        background: "#fef8f4",
        color: "#5f4339",
        icon: "info",
        iconColor: "#ff914d",
        customClass: {
          popup: "swal2-toast-status",
          title: "swal2-toast-title",
          content: "swal2-toast-content",
        },
      });
    }
  });
}

async function EliminarSiJustificacion(id) {
  try {
    const res = await authFetch(`Justificaciones/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("No se pudo eliminar la justificacion");

    Swal.fire({
      title: "¡Justificacion Eliminada!",
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true,
      background: "#f4fff7",
      color: "#1c3d26",
      icon: "success",
      iconColor: "#28a746d8",
      customClass: {
        popup: "swal2-toast-success",
        title: "swal2-toast-success-title",
        icon: "swal2-toast-success-icon",
      },
    });

    ObtenerJustificaciones(false);

  } catch (error) {
    MostrarErrorCatch();
  }
}


//////////////////////////////////////////////////////////////////////////////
// FUNCION PARA GENERAR PDF   /////////////////////////////
//////////////////////////////////////////////////////////////////////////////
async function GenerarInformePdfJustificaciones() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  const fechaEl = document.getElementById("FechaBuscar");
  const estadoEl = document.getElementById("EstadoJustificacionBuscar");
  const empleadoEl = document.getElementById("EmpleadoIdBuscar");

  const fecha = fechaEl ? fechaEl.value : null;
  const estado = estadoEl ? parseInt(estadoEl.value) : null;
  const empleado = empleadoEl ? empleadoEl.value : "";

  const filtro = {
    fechaJustificacion: fecha || null,
    estadoJustificacion: estado || null,
    empleadoTexto: empleado,
  };

  const res = await authFetch("InformesGeneralesPdf/GenerarInformeJustificaciones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filtro)
  });

  const { justificaciones, resumen } = await res.json();

  if (!justificaciones || !Array.isArray(justificaciones) || justificaciones.length === 0) {
    ErrorGeneralInformePdf();
    return;
  }

  doc.setTextColor(19, 115, 204);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Informe de Justificaciones", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

  let y = 29;
  const fechaHoy = new Date().toLocaleString("es-AR");

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  doc.text("Generado:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(fechaHoy, 33, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text("Total Justificaciones:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.total}`, 51, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Aprobadas:", 56, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.aprobadas}`, 79, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Pendientes:", 83, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.pendientes}`, 107, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Rechazadas:", 111, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.rechazadas}`, 137, y);
  y += 6;

  let filtrosAplicadosArray = [];
  if (filtro.empleadoTexto) filtrosAplicadosArray.push(`[Empleado: ${filtro.empleadoTexto}]`);
  if (filtro.estadoJustificacion !== null) {
    const estadoTexto =
      filtro.estadoJustificacion === 1 ? "Pendiente" :
        filtro.estadoJustificacion === 2 ? "Aprobada" :
          filtro.estadoJustificacion === 3 ? "Rechazada" : "Desconocido";
    filtrosAplicadosArray.push(`[Estado: ${estadoTexto}]`);
  }
  if (filtro.fechaJustificacion) filtrosAplicadosArray.push(`[Fecha: ${filtro.fechaJustificacion}]`);

  const filtrosAplicados = filtrosAplicadosArray.length > 0 ? filtrosAplicadosArray.join("  |  ") : "No se aplicaron";

  doc.setFont("helvetica", "normal");
  doc.text("Filtros Aplicados:", 14, y);

  doc.setFont("helvetica", "bold");
  const filtrosText = doc.splitTextToSize(filtrosAplicados, 260);
  doc.text(filtrosText, 44, y);
  y += filtrosText.length * 6 + 2;

  doc.setDrawColor(180);
  doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
  y += 7;

  if (justificaciones.length === 0) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 0, 0);
    doc.text("No hay resultados para los filtros aplicados.", doc.internal.pageSize.getWidth() / 2, y + 10, { align: "center" });
  } else {
    doc.autoTable({
      startY: y,
      head: [["Empleado", "Fecha", "Estado", "Motivo"]],
      body: justificaciones.map(j => [
        j.empleadoString,
        j.fechaString,
        j.estadoString,
        j.motivo
      ]),
      styles: { font: "helvetica", fontSize: 10 },
      headStyles: { fillColor: [19, 115, 204], textColor: 255, fontStyle: "bold" },
      margin: { left: 14, right: 14 },

      tableWidth: "auto",

      columnStyles: {
        0: { minCellWidth: 40 },
        1: { minCellWidth: 30 },
        2: { minCellWidth: 30 },
        3: { cellWidth: "auto" }
      }
    });

  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10, { align: "left" });
    doc.text("www.WorkSync.com", doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: "right" });
  }

  const esMobile = window.innerWidth < 768;

  if (esMobile) {
    doc.save("Informe_Empleados.pdf");
    return;
  }

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  const html = `<html><head><title>Informe de Justificaciones</title></head>
    <body class="pdf-body">
    <iframe class="pdf-frame" width="100%" height="100%" src="${url}"></iframe>
    </body></html>`;

  const w = window.open();
  w.document.open();
  w.document.write(html);
  w.document.close();

}



//////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR JUTIFICACIONES SEGUN ROL /////////////////////////////
//////////////////////////////////////////////////////////////////////////////
function MostrarOpcionesJustificacionesPorRol() {
  const rol = getRol()?.toUpperCase();
  if (!rol) return;


  if (rol === "ADMINISTRADOR") {

    $(
      "#seleccionEmpleadoJustificacion, #EmpleadoIdBuscar, #EstadoJustificacionBuscar, #contenedorEstadisticasJustificaciones, #btnMostrarGenerar"
    ).removeClass("d-none");

  }

  else if (rol === "RRHH") {
    $(
      "#seleccionEmpleadoJustificacion, #EmpleadoIdBuscar, #EstadoJustificacionBuscar, #contenedorEstadisticasJustificaciones, #btnMostrarGenerar"
    ).removeClass("d-none");

  }

  else if (rol === "EMPLEADO" || rol === "SUPERVISOR") {
    $("#tituloJustificacion").text(
      "Consultá tus justificaciones, verificá su estado y gestioná nuevas solicitudes."
    );
    $("#JustificacionCreadoPorTercero, #JustificacionCreadoPorUsuario, #JustificacionAccion, #conetendorBotonesJustificaciones").addClass("d-none")
  }
}






//////////////////////////////////////////////////////////////////////////////
// INICIALIZAR AL CARRGAR LA VISTA ////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
MostrarOpcionesJustificacionesPorRol();
ObtenerJustificaciones();
