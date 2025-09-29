//INICIO PANEL FORMUALRIO//
//Función para abrir el formulario lateral
function abrirPanelJustificacion() {
  document.getElementById("panelJustificacion").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputMotivo = document.getElementById("MotivoJustificacion");
    if (inputMotivo) inputMotivo.focus();
  }, 400);
}

//Funcion para cerrar el formulario lateral
function cerrarPanelJustificacion() {
  document.getElementById("panelJustificacion").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalJustificacion();
}

//Obtener las justificaciones de tardanza o de inasistencia
async function ObtenerJustificaciones() {
  const res = await authFetch("Justificaciones", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      MostrarJustificaciones(data);
      LimpiarModalJustificacion();
      cerrarPanelJustificacion();
    })
    .catch((error) => {
      //MostrarErrorCatch();
    });
}


function MostrarJustificaciones(data) {
  if (window.innerWidth <= 880) {
    MostrarJustificacionesMobile(data);
  } else {
    MostrarJustificacionesDesktop(data);
  }
}

//Funcion para mostrar las justificaciones
function MostrarJustificacionesDesktop(data) {
  const contenedor = $("#contenedorJustificaciones");
  contenedor.empty();

  if (data.length === 0) {
    contenedor.append(
      "<div class='text-center text-muted py-3'>No hay justificaciones para mostrar.</div>"
    );
    return;
  }

  const tipoJustificacion = {
    1: "PENDIENTE",
    2: "APROBADA",
    3: "RECHAZADA",
  };

  const justificacionColor = {
    PENDIENTE: "badge-pendiente",
    APROBADA: "badge-aprobada",
    RECHAZADA: "badge-rechazada",
  };

  if (Array.isArray(data)) {
    data.forEach((element) => {

    // Enlace de descarga usando el endpoint de la API
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

      const justificacionNombre = tipoJustificacion[element.tipoJustificacion];
      const claseJustificacion =
        justificacionColor[justificacionNombre] || "bg-light text-dark";
      const fecha = element.fecha.split("T")[0].split("-").reverse().join("/") || "Sin fecha";

      const item = $(`
        <div class="curso-item border rounded py-2 px-3 mb-2 d-flex align-items-center justify-content-between">

          <div class="d-flex justify-content-between align-items-center w-100" style="gap: 20px;">
            
            <!-- Nombre del empleado -->
            <div class="d-flex align-items-center" style="gap: 10px; flex: 1;">
              <button class="btn-editar me-1" style="background: none; border: none;" onclick="MostrarModalEditar(${
                element.id})" data-tippy-content="Editar">
                <i class="bi bi-pencil-square icono-editar"></i>
              </button>
              <div class="fw-bold text-truncate" style="max-width: 200px;" title="${
                element.empleado.nombreCompleto || "Sin nombre"
              }">
                ${element.empleado.nombreCompleto || "Sin nombre"}
              </div>
            </div>

            <!-- Fecha en el centro -->
            <div class="text-muted text-center" style="opacity: 0.6; min-width: 120px; flex: 1;">
             Día del incidente: ${fecha}
            </div>

            <!-- Estado y flecha -->
            <div class="d-flex align-items-center justify-content-end" style="gap: 20px; flex: 1;">
              <div class="badge ${claseJustificacion}" title="${justificacionNombre}">
                ${justificacionNombre}
              </div>
              <div>
                <button class="btn-accionLicencia" style="background:none; border:none;" onclick="AbrirModalAccionJustificacion(${element.id})" 
                    data-tippy-content="Aprobar o rechazar"> <i class="bi bi-sliders icono-accion-licencia"></i>
                </button>
              </div>
              <button class="btn-ver-descripcion" style="background: none; border: none;" data-tippy-content="Detalle">
                <i class="bi bi-chevron-down"></i>
              </button>
            </div>

          </div>
        </div>
      `);

      const descripcionDetalle = $(`
        <div class="panelJustificacion px-3 pb-2" style="display: none;">
          <div class="mb-3">
            <h3 class="titulo-sub-seccion">Detalle del evento</h3>
          </div>
          <hr style="margin-bottom: 1rem;" />
          <div class="d-flex gap-3 mb-3">
            <!-- Motivo -->
            <div class="p-3 rounded" style="flex: 2; background-color: #f8fbfd;" id="motivoDiv">
              <small class="fw-bold d-block mb-1" id="tituloJustificacion">MOTIVO</small>
              <hr style="margin: 0.2rem;" />
              <div>${element.motivo || "Sin motivo"}</div>
            </div>
            <div class="p-3 rounded" style="flex: 1; background-color: #f8fbfd;" id="documentoDiv">
              <small class="fw-bold d-block mb-1" id="tituloJustificacion">DOCUMENTO ADJUNTO</small>
              <div>${documentoHtml || "No se adjuntó ningún documento"}</div>
            </div>
          </div>
          </div>
        </div>
      `);

      // Mostrar descripción
      item.find(".btn-ver-descripcion").on("click", function () {
        descripcionDetalle.slideToggle(200, function () {
          descripcionDetalle.toggleClass(
            "mostrar",
            descripcionDetalle.is(":visible")
          );
        });

        const icono = $(this).find("i");
        icono.toggleClass("bi-chevron-down bi-chevron-up");
      });

      contenedor.append(item);
      contenedor.append(descripcionDetalle);
    });
  }

  // Tooltip
  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}


function MostrarJustificacionesMobile(data) {
  const contenedor = document.getElementById("contenedorJustificaciones");
  contenedor.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    contenedor.innerHTML =
      "<div class='text-center text-muted py-3'>No hay justificaciones para mostrar.</div>";
    return;
  }

  const tipoJustificacion = {
    1: "PENDIENTE",
    2: "APROBADA",
    3: "RECHAZADA",
  };

  const justificacionColor = {
    PENDIENTE: "badge-pendiente",
    APROBADA: "badge-aprobada",
    RECHAZADA: "badge-rechazada",
  };

  data.forEach((element) => {
    const justificacionNombre = tipoJustificacion[element.tipoJustificacion] || "SIN ESTADO";
    const claseJustificacion = justificacionColor[justificacionNombre] || "bg-light text-dark";
    const fecha = element.fecha ? element.fecha.split("T")[0].split("-").reverse().join("/") : "Sin fecha";

    // Documento adjunto
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

    // Crear tarjeta Mobile
    const card = document.createElement("div");
    card.className =
      "col-12 col-md-6 p-2 col-lg-4 col-xl-3 d-flex flex-column";
    card.innerHTML = `
      <div class="card shadow-sm p-2 rounded-3 d-flex flex-column w-100" style="min-height: 180px;">
        <div class="flex-grow-1 d-flex flex-column">
          <h5 class="text-start fw-bold mb-2" style="font-size: 1.2rem;">
            ${element.empleado?.nombreCompleto || "Sin nombre"}
          </h5>
          <small class="text-muted mb-1" style="font-size: 0.90rem;">
            <i class="bx bx-calendar me-1"></i>Día del incidente: ${fecha}
          </small>
          <span class="badge ${claseJustificacion} my-2" style="width: fit-content; font-size: 0.80rem;">
            ${justificacionNombre}
          </span>
        </div>

        <div class="d-flex justify-content-between mt-2 align-items-center">
          <div>
            <button class="btn-editar me-1" style="background: none; border: none;" onclick="MostrarModalEditar(${element.id})" data-tippy-content="Editar">
              <i class="bi bi-pencil-square icono-editar"></i>
            </button>
            <button class="btn-accionLicencia" style="background:none; border:none;" onclick="AbrirModalAccionLicencia(${element.id})" 
              data-tippy-content="Aprobar o rechazar"> <i class="bi bi-sliders icono-accion-licencia"></i>
            </button>
          </div>
          <div>
            <button class="btn-ver-descripcion" style="background: none; border: none;" data-tippy-content="Detalle">
              <i class="bi bi-chevron-down"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    // Crear descripción (colapsable)
    const descripcionDetalle = $(`
      <div class="panelDescripcionCurso px-3 pb-2" style="display: none;">
        <div class="mb-3">
          <h3 class="titulo-sub-seccion">Detalle del evento</h3>
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

    // Botón de chevron para mostrar/ocultar descripción
    $(card)
      .find(".btn-ver-descripcion")
      .on("click", function () {
        descripcionDetalle.slideToggle(200);
        const icono = $(this).find("i");
        icono.toggleClass("bi-chevron-down bi-chevron-up");
      });

    // Agregar card y descripción al contenedor
    contenedor.appendChild(card);
    contenedor.appendChild(descripcionDetalle[0]);
  });

  // Inicializar tooltips
  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

async function DescargarDocumento(id) {
  try {
    const response = await authFetch(`Justificaciones/Documento/${id}`);

    const blob = await response.blob();

    // Obtener el nombre del archivo desde el header "Content-Disposition"
    const disposition = response.headers.get("Content-Disposition");
    let filename = "archivo_descargado";

    if (disposition) {
      // Captura solo el primer filename válido antes de cualquier ;
      const match = disposition.match(/filename\*?=(?:UTF-8'')?([^;\r\n]+)/i);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1].replace(/['"]/g, ""));
      }
    }

    // Crear enlace temporal para descargar
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename; // nombre limpio
    link.click();

    // Liberar memoria
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    MostrarErrorCatch();
  }
}

// Funcion para mostrar el modal de edición de la justificación
async function MostrarModalEditar(id) {
  const res = await authFetch(`Justificaciones/${id}`);
  const justificacion = await res.json();

  document.getElementById("IdJustificacion").value = justificacion.id;
  document.getElementById("MotivoJustificacion").value = justificacion.motivo;
  document.getElementById("FechaJustificacion").value = justificacion.fecha;
  document.getElementById("EmpleadoId").value = justificacion.empleadoId;

  const archivoAdjuntoDiv = document.getElementById("archivoAdjuntoActual");

  if (justificacion.documentoAdjunto && justificacion.documentoAdjunto.length > 0) {
    //Convertit base64 a blob
    const byteCharacters = atob(justificacion.documentoAdjunto);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: justificacion.documentoMimeType});
    const url = URL.createObjectURL(blob);

    //Truncar nombre visualmente (solo para mostrar)
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

//Funcion para buscar el id de la evaluacion y llamar a la función de edición o creación
function BuscarJustificacionId() {
  const id = parseInt(document.getElementById("IdJustificacion").value);

  if (!id || id === 0) {
    CrearJustificacion();
  } else {
    EditarJustificacion(id);
  }
}

function LimpiarModalJustificacion() {
    //Limpiar el formulario
    document.getElementById("IdJustificacion").value = "";
    const inputMotivo = document.getElementById("MotivoJustificacion");
    inputMotivo.value = "";
    const fechaJustificacion = document.getElementById("FechaJustificacion");
    fechaJustificacion.value = "";
    const selectEmpleadoId = document.getElementById("EmpleadoId");
    selectEmpleadoId.value = "";
    const inputDocumento = document.getElementById("DocumentoAdjunto");
    inputDocumento.value = "";

    //Limpia las validaciones
    inputMotivo.classList.remove("is-invalid", "is-valid");
    fechaJustificacion.classList.remove("is-invalid", "is-valid");
    selectEmpleadoId.classList.remove("is-invalid", "is-valid");
    inputDocumento.classList.remove("is-invalid", "is-valid");

    //Limpiar los mensajes de error
    const inputErrorMotivo = document.getElementById("errorMotivoJustificacion");
    inputErrorMotivo.textContent = "";
    inputErrorMotivo.style.display = "none";
    const fechaErrorJustificacion = document.getElementById("errorFechaJustificacion");
    fechaErrorJustificacion.textContent = "";
    fechaErrorJustificacion.style.display = "none";
    const selectErrorEmpleado = document.getElementById("errorEmpleadoIdJustificacion");
    selectErrorEmpleado.textContent = "";
    selectErrorEmpleado.style.display = "none"
}

//Funcion para validar el formulario de cursos
function ValidarFormularioJustificacion() {
    const inputMotivo = document.getElementById("MotivoJustificacion");
    const inputErrorMotivo = document.getElementById("errorMotivoJustificacion");

    const fechaJustificacion = document.getElementById("FechaJustificacion");
    const fechaErrorJustificacion = document.getElementById("errorFechaJustificacion");

    const selectEmpleado = document.getElementById("EmpleadoId");
    const selectErrorEmpleado = document.getElementById("errorEmpleadoIdJustificacion");

    const motivo = inputMotivo.value.trim();
    const fecha = fechaJustificacion.value;
    const empleado = selectEmpleado.value;

    //Limpiar errores previos
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

    // Validar motivo
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

    // Validar Fecha 
    if (fecha.length === 0) {
      fechaJustificacion.classList.add("is-invalid");
      fechaErrorJustificacion.style.display = "block";
      fechaErrorJustificacion.textContent = "Seleccione una fecha.";
      esValid = false;
    }else {
      fechaJustificacion.classList.add("is-valid");
    }

    // Validar empleado
    if (selectEmpleado.value === "") {
      selectEmpleado.classList.add("is-invalid");
      selectErrorEmpleado.style.display = "block";
      selectErrorEmpleado.textContent = "Seleccione un empleado.";
      esValid = false;
    } else {
      selectEmpleado.classList.remove("is-invalid");
      selectEmpleado.classList.add("is-valid");
      selectErrorEmpleado.style.display = "none";
    }
    return esValid;
}

document.getElementById("MotivoJustificacion").addEventListener("input", () => {
  const inputMotivo = document.getElementById("MotivoJustificacion");
  const errorMotivo = document.getElementById("errorMotivoJustificacion");
  const motivo = inputMotivo.value.trim();

  // Limpiar cualquier estado previo
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

//Funcion para crear una nueva justificación
async function CrearJustificacion() {
  if(!ValidarFormularioJustificacion()) {
    return;
  }

  const formData = new FormData();
  formData.append("Motivo", document.getElementById("MotivoJustificacion").value);
  formData.append("Fecha", document.getElementById("FechaJustificacion").value);
  formData.append("EmpleadoId", document.getElementById("EmpleadoId").value);

  // Agregar archivo si hay
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

    if (response.mensaje){
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

async function EditarJustificacion(id) {
  // Validar el formulario
  if (!ValidarFormularioJustificacion()) {
    return;
  }

  const formData = new FormData();
  formData.append("Id", parseInt(document.getElementById("IdJustificacion").value));
  formData.append("Motivo", document.getElementById("MotivoJustificacion").value);
  formData.append("Fecha", document.getElementById("FechaJustificacion").value);
  formData.append("EmpleadoId", document.getElementById("EmpleadoId").value);

  // Agregar archivo si hay
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
        // Mostrar alerta de éxito
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



// Función para abrir el modal de acción sobre la licencia
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
      confirmButton: "swal2-btn-activar", // Verde
      denyButton: "swal2-btn-desactivar", // Rojo
      cancelButton: "swal2-btn-cancelar", // Gris
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

async function AprobarLicencia(id) {
  const res = await authFetch(`Licencias/${id}/Aprobar`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      Swal.fire({
        title: "¡Licencia Aprobada!",
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
      ObtenerLicencias();
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}

async function RechazarJustificacion(id) {
  const res = await authFetch(`Licencias/${id}/Rechazar`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      Swal.fire({
        title: "¡Licencia Rechazada!",
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

      ObtenerLicencias();
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}

async function AprobarLicencia(id) {
  const res = await authFetch(`Licencias/${id}/Aprobar`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      Swal.fire({
        title: "¡Licencia Aprobada!",
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
      ObtenerLicencias();
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}

function MostrarErrorCatch() {
  Swal.fire({
    title: "¡Error!",
    html: `
      <div class="text-center">
        <p>No se pudo acceder al servidor. Por favor, inténtalo de nuevo.</p>
      </div>
    `,
    confirmButtonText: "Entendido",
    customClass: {
      popup: "shadow rounded-3 p-3",
      confirmButton: "btn btn-danger",
      title: "fs-5 text-dark mb-2",
      htmlContainer: "text-muted fs-6",
    },
    buttonsStyling: false,
  });
}


ObtenerJustificaciones();
