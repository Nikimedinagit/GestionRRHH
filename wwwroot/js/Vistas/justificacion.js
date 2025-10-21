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
  ObtenerJustificaciones();
  $("#EmpleadoIdBuscar, #FechaBuscar, #EstadoJustificacionBuscar").on(
    "input",
    function () {
      ObtenerJustificaciones();
    }
  );
});

//////////////////////////////////////////////////////////////////////////////
// OBTENER LAS LOS DATODS DE LA API DE JUSTIFICACIONES /////////////////////////
//////////////////////////////////////////////////////////////////////////////
async function ObtenerJustificaciones() {
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
    cerrarPanelJustificacion();
  } catch (error) {
    MostrarErrorCatch();
    console.error(error);
  }
}

//////////////////////////////////////////////////////////////////////////////
// MOSTRAR LAS JUSTIFICACIONES ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
function MostrarJustificaciones(data) {
  if (window.innerWidth <= 880) {
    MostrarJustificacionesMobile(data);
  } else {
    MostrarJustificacionesDesktop(data);
  }
}

//////////////////////////////////////////////////////////////////////////////
// MOSTRAR LAS JUSTIFICACIONES DESKTOP ///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
function MostrarJustificacionesDesktop(data) {
  const contenedor = $("#contenedorJustificaciones");
  contenedor.empty();

  const rol = getRol().trim().toUpperCase();

  if (!Array.isArray(data) || data.length === 0) {
    contenedor.append(
      "<div class='text-center text-muted py-3'>No hay justificaciones para mostrar.</div>"
    );
    return;
  }

  const justificacionColor = {
    PENDIENTE: "badge-pendiente",
    APROBADA: "badge-aprobada",
    RECHAZADA: "badge-rechazada",
  };

  data.forEach((element) => {

    const documentoHtml = element.documentoNombre
      ? `
        <p class="text-muted d-flex align-items-center gap-2 mb-2">
          <button onclick="DescargarDocumento(${element.id})" class="document-link d-flex align-items-center gap-1" data-tippy-content="Descargar" style="color: inherit; text-decoration: none; font-size: 0.9rem; border:none; background:none; cursor:pointer;">
            <i class="bi bi-file-earmark-text" style="font-size: 1rem;"></i>
            <span>Descargar</span>
          </button>
        </p>
      `
      : "";

    const estadoNombre = element.estadoString || "PENDIENTE";
    const claseJustificacion = justificacionColor[estadoNombre] || "bg-light text-dark";
    const fecha = element.fechaString || "Sin fecha";

    let botonAccion = "";
    if ((rol === "ADMINISTRADOR" || rol === "RRHH") && estadoNombre === "PENDIENTE") {
      botonAccion = `
        <div class="d-flex justify-content-between align-items-center mt-2">
          <div class="d-flex gap-1">
            <button class="btn-accionLicencia" style="background:none; border:none;" onclick="AbrirModalAccionJustificacion(${element.id})" 
              data-tippy-content="Aprobar o rechazar"> 
              <i class="bi bi-sliders icono-accion-licencia"></i>
            </button>
          </div>
        </div>
      `;
    }

    let botonEditar = "";
    if (estadoNombre === "PENDIENTE" && (rol === "ADMINISTRADOR" || rol === "RRHH" || element.esPropia)) {
      const fechaParts = fecha.split("/");
      const fechaIncidente = new Date(fechaParts[2], fechaParts[1] - 1, fechaParts[0]);
      const hoy = new Date();
      const limite = new Date(fechaIncidente);
      limite.setDate(limite.getDate() + 7);

      if (hoy <= limite) {
        botonEditar = `
          <div class="d-flex justify-content-between align-items-center mt-2">
            <div>
              <button class="btn-editar me-1" style="background: none; border: none;" onclick="MostrarModalEditar(${element.id})" data-tippy-content="Editar">
                <i class="bi bi-pencil-square icono-editar"></i>
              </button>
            </div>
          </div>
        `;
      }
    }

    const item = $(`
      <div class="curso-item border rounded py-2 px-3 mb-2 d-flex align-items-center justify-content-between"  style = "border-left: 3px solid ${element.claseBorde === "#dee2e6"} !important;">
        <div class="d-flex justify-content-between align-items-center w-100" style="gap: 20px;">
          
          <!-- Nombre del empleado -->
          <div class="d-flex align-items-center" style="gap: 10px; flex: 1;">
            ${botonEditar}
            <div class="fw-bold text-truncate" style="max-width: 200px;" title="${element.empleadoString || "Sin nombre"}">
              ${element.empleadoString || "Sin nombre"}
            </div>
          </div>

          <!-- Fecha en el centro -->
          <div class="text-muted text-center" style="opacity: 0.6; min-width: 120px; flex: 1;">
            Día del incidente: ${fecha}
          </div>

          <!-- Estado y flecha -->
          <div class="d-flex align-items-center justify-content-end" style="gap: 20px; flex: 1;">
            <div class="badge ${claseJustificacion}" title="${estadoNombre}">
              ${estadoNombre}
            </div>
            ${botonAccion}
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
      <div class="panelJustificacion px-3 pb-2" style="display: none;">
        <div class="mb-3">
          <h3 class="titulo-sub-seccion">Detalle del Evento</h3>
        </div>
        <hr style="margin-bottom: 1rem;" />
        <div class="d-flex gap-3 mb-3">
          <!-- Motivo -->
          <div class="p-3 rounded" style="flex: 2; background-color: #f8fbfd;" id="motivoDiv">
            <small class="fw-bold d-block mb-1" id="tituloDocJustificacion">MOTIVO</small>
            <hr style="margin: 0.2rem;" />
            <div>${element.motivo || "Sin motivo"}</div>
          </div>
          <div class="p-3 rounded" style="flex: 1; background-color: #f8fbfd;" id="documentoDiv">
            <small class="fw-bold d-block mb-1" id="tituloDocJustificacion">DOCUMENTO ADJUNTO</small>
            <div>${documentoHtml || "No se adjuntó ningún documento"}</div>
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
    const claseJustificacion =
      justificacionColor[estadoNombre] || "bg-light text-dark";
    const fecha = element.fechaString || "Sin fecha";
    const documentoHtml = element.documentoNombre
      ? `
        <p class="text-muted d-flex align-items-center gap-2 mb-2">
          <button onclick="DescargarDocumento(${element.id})" class="document-link d-flex align-items-center gap-1" data-tippy-content="Descargar" style="color: inherit; text-decoration: none; font-size: 0.9rem; border:none; background:none; cursor:pointer;">
            <i class="bi bi-file-earmark-text" style="font-size: 1rem;"></i>
            <span>Descargar</span>
          </button>
        </p>
      `
      : "No se adjuntó ningún documento";

    let botonesHtml = "";
    if (estadoNombre === "PENDIENTE") {
      const fechaParts = fecha.split("/");
      if (fechaParts.length === 3) {
        const fechaIncidente = new Date(
          fechaParts[2],
          fechaParts[1] - 1,
          fechaParts[0]
        );
        const hoy = new Date();
        const limite = new Date(fechaIncidente);
        limite.setDate(limite.getDate() + 7);

        if (hoy <= limite) {
          botonesHtml += `<div class="d-flex justify-content-start align-items-center gap-2 mt-2">`;
          botonesHtml += `
                <button class="btn-editar" style="background: none; border: none;" onclick="MostrarModalEditar(${element.id})" data-tippy-content="Editar">
                    <i class="bi bi-pencil-square icono-editar"></i>
                </button>
            `;
          if (rol === "ADMINISTRADOR" || rol === "RRHH") {
            botonesHtml += `
                    <button class="btn-accionLicencia" style="background:none; border:none;" onclick="AbrirModalAccionJustificacion(${element.id})" 
                        data-tippy-content="Aprobar o rechazar">
                        <i class="bi bi-sliders icono-accion-licencia"></i>
                    </button>
                `;
          }
          botonesHtml += `</div>`;
        }
      }
    }

    const card = document.createElement("div");
    card.className = "col-12 col-md-6 p-2 col-lg-4 col-xl-3 d-flex flex-column";
    card.innerHTML = `
      <div class="card shadow-sm p-2 rounded-3 d-flex flex-column w-100" style="min-height: 180px;">
        <div class="flex-grow-1 d-flex flex-column">
          <h5 class="text-start fw-bold mb-2" style="font-size: 1.2rem;">
            ${element.empleadoString || "Sin nombre"}
          </h5>
          <small class="text-muted mb-1" style="font-size: 0.90rem;">
            <i class="bx bx-calendar me-1"></i>Día del incidente: ${fecha}
          </small>
          <span class="badge ${claseJustificacion} my-2" style="width: fit-content; font-size: 0.80rem;">
            ${estadoNombre}
          </span>
        </div>

        <div class="d-flex justify-content-between mt-2 align-items-center">
          ${botonesHtml}
          <div>
            <button class="btn-ver-descripcion" style="background: none; border: none;" data-tippy-content="Detalle">
              <i class="bi bi-chevron-down"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    const descripcionDetalle = $(` 
      <div class="panelDescripcionCurso px-3 pb-2" style="display: none;">
        <div class="mb-3">
          <h3 class="titulo-sub-seccion">Detalle del Evento</h3>
        </div>
        <hr style="margin-bottom: 1rem;" />
        <div class="d-flex flex-column gap-3 mb-3">
          <div class="p-3 rounded" style="background-color: #f8fbfd;">
            <small class="fw-bold d-block mb-1">MOTIVO</small>
            <hr style="margin: 0.2rem;" />
            <div>${element.motivo || "Sin motivo"}</div>
          </div>
          <div class="p-3 rounded" style="background-color: #f8fbfd;">
            <small class="fw-bold d-block mb-1">DOCUMENTO ADJUNTO</small>
            <div>${documentoHtml}</div>
          </div>
        </div>
      </div>
    `);

    $(card)
      .find(".btn-ver-descripcion")
      .on("click", function () {
        const icono = $(this).find("i");

        $(".panelDescripcionCurso:visible")
          .not(descripcionDetalle)
          .slideUp(200);
        $(".btn-ver-descripcion i")
          .not(icono)
          .removeClass("bi-chevron-up")
          .addClass("bi-chevron-down");

        descripcionDetalle.slideToggle(200);
        icono.toggleClass("bi-chevron-down bi-chevron-up");
      });

    contenedor.appendChild(card);
    contenedor.appendChild(descripcionDetalle[0]);
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

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
    return;
  }

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

  try {
    const res = await authFetch("Justificaciones", {
      method: "POST",
      body: formData,
    });

    const response = await res.json();

    console.log(response);

    if (response.mensaje) {
      MostrarErrorJustificacionExistente(response.mensaje);
    } else {
      cerrarPanelJustificacion();
      ObtenerJustificaciones();

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
    }
  } catch (error) {
    MostrarErrorCatch();
  }
}

//////////////////////////////////////////////////////////////////////////////
// FUNCION PARA EDITAR UNA JUSTIFICACION ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
async function EditarJustificacion(id) {
  if (!ValidarFormularioJustificacion()) {
    return;
  }

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
  const res = await authFetch(`Justificaciones/${id}`, {
    method: "PUT",
    body: formData,
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        MostrarErrorJustificacionExistente(response.mensaje);
      } else {
        cerrarPanelJustificacion();
        ObtenerJustificaciones();

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
      }
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
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
      ObtenerJustificaciones();
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

      ObtenerJustificaciones();
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}


function MostrarOpcionesJustificacionesPorRol() {
  const rol = getRol()?.toUpperCase();
  if (!rol) return;

  if (rol === "ADMINISTRADOR" || rol === "RRHH") {
    $(
      "#seleccionEmpleadoJustificacion, #EmpleadoIdBuscar, #EstadoJustificacionBuscar, #contenedorEstadisticasJustificaciones, #btnMostrarGenerar"
    ).removeClass("d-none");
  } else if (rol === "EMPLEADO" || rol === "SUPERVISOR") {
    $("#tituloJustificacion").text(
      "Consultá tus justificaciones, verificá su estado y gestioná nuevas solicitudes."
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// INICIALIZAR AL CARRGAR LA VISTA ////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
MostrarOpcionesJustificacionesPorRol();
ObtenerJustificaciones();
