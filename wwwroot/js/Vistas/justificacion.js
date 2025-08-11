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
      MostrarJustificaciones(data);
      LimpiarModalJustificacion();
      cerrarPanelJustificacion();
    })
    .catch((error) => {
      //MostrarErrorCatch();
    });
}

//Funcion para mostrar las justificaciones
function MostrarJustificaciones(data) {
  const contenedor = $("#contenedorJustificaciones");
  contenedor.empty();

  if (data.length === 0) {
    contenedor.append(
      "<div class='text-center text-muted py-3'>No hay justificaciones para mostrar.</div>"
    );
    return;
  }

  const baseUrlArchivos = "/uploads/documentos/";

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
      let documentoUrl = "";
      if (element.documentoAdjunto) {
        documentoUrl = element.documentoAdjunto.startsWith("http")
          ? element.documentoAdjunto
          : baseUrlArchivos + element.documentoAdjunto;
      }
      const documentoHtml = element.documentoAdjunto
        ? `
        <a href="${documentoUrl}" target="_blank" download class="document-link d-flex align-items-center gap-1" data-tippy-content="Descargar" style="color: inherit; text-decoration: none; font-size: 0.8rem;">
          <i class="bi bi-file-earmark-text"  style="font-size: 1rem;"></i>
          <span>Descargar</span>
        </a>
      `
        : `<span class="text-muted">No se adjuntó ningún documento</span>`;
      const justificacionNombre = tipoJustificacion[element.tipoJustificacion];
      const claseJustificacion =
        justificacionColor[justificacionNombre] || "bg-light text-dark";
      const fecha = element.fecha.split("T")[0];

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

// Funcion para mostrar el modal de edición de la justificación
async function MostrarModalEditar(id) {
  const res = await authFetch(`Justificaciones/${id}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("IdJustificacion").value = data.id;
      document.getElementById("MotivoJustificacion").value = data.motivo;
      document.getElementById("FechaJustificacion").value = data.fecha;
      document.getElementById("EmpleadoId").value = data.empleadoId;
      document.getElementById("DocumentoDescargable").value = data.documentoAdjunto;

      abrirPanelJustificacion();
    });
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
    const inputDocumento = document.getElementById("DocumentoDescargable");
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
  if(!ValidarFormularioJustificacion())
      return;

  const justificacion = {
    motivo: document.getElementById("MotivoJustificacion").value,
    fecha: document.getElementById("FechaJustificacion").value,
    empleadoId: parseInt(document.getElementById("EmpleadoId").value),
    documentoAdjunto:
      document.getElementById("DocumentoDescargable").value || "",
  };
  const res = await authFetch("Justificaciones", {
    method: "POST",
    body: JSON.stringify(justificacion),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        ValidarEvaluacionExistente(response.mensaje);
      } else {
        cerrarPanelJustificacion();
        ObtenerJustificaciones();
        // Mostrar alerta de éxito
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
    })
    .catch((error) => {
      //MostrarErrorCatch();
    });
}

ObtenerJustificaciones();
