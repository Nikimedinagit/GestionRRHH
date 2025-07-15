
//INICIO PANEL FORMUALRIO//
//Función para abrir el formulario lateral
function AbrirPanelLicencia() {
  document.getElementById("panelLicencia").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreLicencia");
    if (inputNombre) inputNombre.focus();
  }, 400);
}

//Funcion para cerrar el formulario lateral
function CerrarPanelLicencia() {
  document.getElementById("panelLicencia").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalLicencia();
}
//FIN PANEL FORMULARIO//


//PANEL FILTROS//
//Funcion para abrir panel de filtros
function AbrilPanelFiltros(idPanel) {
  const panel = document.getElementById(idPanel);
  if (!panel) return;

  if (panel.classList.contains("activo")) {
    panel.classList.remove("activo");
    setTimeout(() => panel.classList.add("d-none"), 300);
    document.removeEventListener("mousedown", DetectarClickFueraDeFiltro);
  } else {
    panel.classList.remove("d-none");
    setTimeout(() => panel.classList.add("activo"), 10);
    // Agrega el listener para cerrar al hacer clic fuera
    setTimeout(() => {
      document.addEventListener("mousedown", DetectarClickFueraDeFiltro);
    }, 20);
  }

  // Funcion sid etecta un clcik fuera del contenedir del filtro lo cierra
  function DetectarClickFueraDeFiltro(event) {
    if (
      !panel.contains(event.target) &&
      event.target.id !== "btnMostrarFiltros"
    ) {
      panel.classList.remove("activo");
      setTimeout(() => panel.classList.add("d-none"), 300);
      document.removeEventListener("mousedown", DetectarClickFueraDeFiltro);
    }
  }
}
//FIN PANEL FILTROS//



//INICIO PANEL GENERAR//
//Funcion para abrir panel de genera
function AbrilPanelGenerar(idPanel) {
  const panel = document.getElementById(idPanel);
  if (!panel) return;

  if (panel.classList.contains("activo")) {
    panel.classList.remove("activo");
    setTimeout(() => panel.classList.add("d-none"), 300);
    document.removeEventListener("mousedown", DetectarClickFueraDeGenerar);
  } else {
    panel.classList.remove("d-none");
    setTimeout(() => panel.classList.add("activo"), 10);
    // Agrega el listener para cerrar al hacer clic fuera
    setTimeout(() => {
      document.addEventListener("mousedown", DetectarClickFueraDeGenerar);
    }, 20);
  }

  // Funcion sid etecta un clcik fuera del contenedir de generar lo cierra
  function DetectarClickFueraDeGenerar(event) {
    if (
      !panel.contains(event.target) &&
      event.target.id !== "btnMostrarGenerar"
    ) {
      panel.classList.remove("activo");
      setTimeout(() => panel.classList.add("d-none"), 300);
      document.removeEventListener("mousedown", DetectarClickFueraDeGenerar);
    }
  }
}
//FIN PANEL GENERAR//


// Mostrar/ocultar fechas
  document.getElementById('filtrarFechaSelect').addEventListener('change', function () {
    const mostrar = this.value === 'si';
    document.getElementById('fechasInputs').classList.toggle('d-none', !mostrar);
    document.getElementById('fechasInputsFin').classList.toggle('d-none', !mostrar);

      // Opcional: limpiar valores al ocultar
      document.getElementById("FechaInicioBuscar").value = "";
      document.getElementById("FechaFinBuscar").value = "";
  });


//INICIO ONCHANGE DE FILTROS//
$(document).ready(function () {
  ObtenerLicencias();

  $("#EstadoIdBuscar, #TipoDeLicenciaIdBuscar").on("change", function () {
    ObtenerLicencias();
  });

  $("#FechaInicioBuscar, #FechaFinBuscar").on("change", function () {
    let fechaInicioRaw = $("#FechaInicioBuscar").val();
    let fechaFinRaw = $("#FechaFinBuscar").val();

    if (fechaInicioRaw && fechaFinRaw) {
      const fechaInicio = new Date(fechaInicioRaw);
      const fechaFin = new Date(fechaFinRaw);

      if (fechaFin < fechaInicio) {
        $("#FechaFinBuscar").val(fechaInicioRaw);
      }
    }

    if ($("#filtrarFechaSelect").val() === "si") {
      ObtenerLicencias();
    }
  });

  $("#filtrarFechaSelect").on("change", function () {
    const filtrarFecha = $(this).val() === "si";
    $("#divFechas").toggle(filtrarFecha);
    ObtenerLicencias();
  });

 
  $("#EmpleadoIdBuscar").on("input", function () {
    ObtenerLicencias();
  });
});


//FIN ONCHANGE DE FILTROS//



async function ComboParaFiltrarTiposDeLicencia() {
  const res = await authFetch("TipoDeLicencias", {
    method: "GET",
  });

  const tiposDeLicencias = await res.json();

  const $combo = $("#TipoDeLicenciaIdBuscar");
  $combo.empty();

  let opciones = `<option value="0">[Todas]</option>`;
  tiposDeLicencias.forEach((item) => {
    opciones += `<option value="${item.id}">${item.nombre}</option>`;
  });
  $combo.html(opciones);

  ObtenerLicencias();
}

//Funcion para obtener los datos 
async function ObtenerLicencias() {

    let estadoLicencia = document.getElementById("EstadoIdBuscar").value;
    let estado = estadoLicencia !== "0" && estadoLicencia !== "" ? parseInt(estadoLicencia) : null;

    let tipoDeLicenciaId = document.getElementById("TipoDeLicenciaIdBuscar").value;
    let tipoDeLicencia = tipoDeLicenciaId !== "0" && tipoDeLicenciaId !== "" ? parseInt(tipoDeLicenciaId) : null;

    const filtrarFecha = $("#filtrarFechaSelect").val() === "si";
    const fechaInicioRaw = $("#FechaInicioBuscar").val();
    const fechaFinRaw = $("#FechaFinBuscar").val();

    const fechaInicio = filtrarFecha && fechaInicioRaw !== "" ? fechaInicioRaw : null;
    const fechaFin = filtrarFecha && fechaFinRaw !== "" ? fechaFinRaw : null;

    const nombreEmpleado = document.getElementById("EmpleadoIdBuscar").value;

    let filtro = {
        estado: estado,
        tipoDeLicenciaId: tipoDeLicencia,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        empleadoTexto: nombreEmpleado
    };

    const res = await authFetch("Licencias/Filtrar", {
        method: "POST",
        body: JSON.stringify(filtro),
    })
    .then(response => response.json())
    .then(data => {
        MostrarLicencias(data);
        LimpiarModalLicencia();
        CerrarPanelLicencia();
    })
    .catch((error) => console.log("No se pudo obtener las licencias", error));
}


// Funcion para mostrar las licencias en forma de cards

function MostrarLicencias(data) {
  const contenedor = $("#licenciasContainer");
  contenedor.empty();

  if (!data.length) {
    contenedor.append(`
      <div class="col-12 text-center text-muted">No hay licencias para mostrar.</div>
    `);
    return;
  }

  const estadoColor = {
    PENDIENTE: "bg-warning text-dark",
    APROBADA: "bg-success text-white",
    RECHAZADA: "bg-danger text-white",
    EXPIRADA: "bg-dark text-white"
  };

  const bordeSuperiorColorHex = {
    PENDIENTE: "#FFC107",
    APROBADA: "#198754",
    RECHAZADA: "#DC3545",
    EXPIRADA: "#212529"
  };

  const baseUrlArchivos = "/uploads/documentos/";

  data.forEach(item => {
    const estado = (item.estadoString || "PENDIENTE").toUpperCase();
    const claseEstado = estadoColor[estado] || "bg-light text-dark";
    const colorBorde = bordeSuperiorColorHex[estado] || "#ccc";

    const fechaInicio = formatearFecha(item.fechaInicioString);
    const fechaFin = formatearFecha(item.fechaFinString);

    let documentoUrl = "";
    if (item.documentoAdjunto) {
      documentoUrl = item.documentoAdjunto.startsWith("http")
        ? item.documentoAdjunto
        : baseUrlArchivos + item.documentoAdjunto;
    }

    const documentoHtml = item.documentoAdjunto
      ? `
      <p class="text-muted d-flex align-items-center gap-2 mb-2">
        <a href="${documentoUrl}" target="_blank" download class="document-link d-flex align-items-center gap-1" data-tippy-content="Descargar" style="color: inherit; text-decoration: none; font-size: 0.9rem;">
          <i class="bi bi-file-earmark-text" style="font-size: 1rem;"></i>
          <span>Descargar</span>
        </a>
      </p>
      `
      : "";

    // Mostrar todos los botones solo si es PENDIENTE
    const botonesHtml = estado === "PENDIENTE"
      ? `
        <div class="d-flex justify-content-between align-items-center mt-2">
          <div>
            <button class="btn-accionLicencia" style="background:none; border:none;" onclick="AbrirModalAccionLicencia(${item.id})" data-tippy-content="Aprobar o rechazar">
              <i class="bi bi-sliders icono-accion-licencia"></i>
            </button>
          </div>
          <div class="d-flex gap-1">
            <button class="btn-editar" style="background: none; border: none;" onclick="MostrarModalEditar(${item.id})" data-tippy-content="Editar">
              <i class="bi bi-pencil-square icono-editar-licencia btn-sm"></i>
            </button>
            <button class="btn-eliminar" style="background: none; border: none;" onclick="EliminarLicenciaId(${item.id})" data-tippy-content="Eliminar">
              <i class="bi bi-trash3 icono-borrar-licencia btn-sm"></i>
            </button>
          </div>
        </div>
      `
      : "";

    const cardHtml = `
      <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex" id="licencia-${item.id}">
        <div class="card shadow-sm p-2 rounded-3 position-relative d-flex flex-column w-100" style="border-bottom: 4px solid ${colorBorde}; min-height: 260px;">
          <div class="flex-grow-1 d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="fw-bold mb-0" style="font-size: 1rem;">${item.tipoDeLicenciaString || "-"}</h5>
              <span class="badge ${claseEstado}" style="font-size: 0.75rem; padding: 0.25em 0.5em;">${estado}</span>
            </div>
            <p class="mb-1 text-muted d-flex align-items-start" style="font-size: 0.9rem;">
              <i class="bi bi-calendar3 me-2" style="font-size: 1rem;"></i>
              <span>${fechaInicio}<br>${fechaFin}</span>
            </p>
            <p class="mb-1 text-muted d-flex align-items-center" style="font-size: 0.9rem;">
              <i class="bi bi-person me-2" style="font-size: 1rem;"></i>
              <span>${item.empleadoString || "-"}</span>
            </p>
            ${documentoHtml}
          </div>
          ${botonesHtml}
        </div>
      </div>
    `;

    contenedor.append(cardHtml);
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}













// Función para convertir ISO a "9 may 2023"
function formatearFecha(fechaStr) {
  const [dia, mes, anio] = fechaStr.split('/');
  const fecha = new Date(`${anio}-${mes}-${dia}`); // Formato compatible con JS
  return fecha.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}



//Funcion para mostar el modal de edicion de la licencia
async function MostrarModalEditar(id) {
  const res = await authFetch(`Licencias/${id}`);
  const licencia = await res.json();

  document.getElementById("IdLicencia").value = licencia.id;
  document.getElementById("IdTipoLicencia").value = licencia.tipoDeLicenciaId;
  document.getElementById("FechaInicio").value = licencia.fechaInicio.split("T")[0];
  document.getElementById("FechaFin").value = licencia.fechaFin.split("T")[0];
  document.getElementById("EmpleadoId").value = licencia.empleadoId;

  // No asignar valor al input file
  const archivoAdjuntoDiv = document.getElementById("archivoAdjuntoActual");
  if (licencia.documentoAdjunto && licencia.documentoAdjunto.trim() !== "") {
    // Armar la URL si es solo el nombre
    const baseUrlArchivos = "/uploads/documentos/";
    const documentoUrl = licencia.documentoAdjunto.startsWith("http")
      ? licencia.documentoAdjunto
      : baseUrlArchivos + licencia.documentoAdjunto;

    archivoAdjuntoDiv.innerHTML = `
      <a href="${documentoUrl}" target="_blank" download>
        <i class="bi bi-file-earmark-text"></i> Ver/Descargar archivo actual
      </a>
    `;
  } else {
    archivoAdjuntoDiv.innerHTML = "";
  }

  AbrirPanelLicencia();
}

 // Funcion para buscar el id de la licencia y llamar a la función de edición o creación
 function BuscarLicenciaId() {
   const id = parseInt(document.getElementById("IdLicencia").value);

   if (!id || id === 0) {
     CrearLicencia();
   } else {
     EditarLicencia(id);
   }
 }

 // Funcion para limpiar el modal de licencia
function LimpiarModalLicencia() {
  // Limpia el formulario
  document.getElementById("IdLicencia").value = "";
  const inputTipoLicencia = document.getElementById("IdTipoLicencia");
  const inputEmpleado = document.getElementById("EmpleadoId");
  const inputFechaInicio = document.getElementById("FechaInicio");
  const inputFechaFin = document.getElementById("FechaFin");
  const inputDocumentoAdjunto = document.getElementById("DocumentoAdjunto");

  inputTipoLicencia.value = "";
  inputEmpleado.value = "";
  inputFechaInicio.value = "";
  inputFechaFin.value = "";
  if (inputDocumentoAdjunto) inputDocumentoAdjunto.value = "";

  // Limpia los estilos de validación
  inputTipoLicencia.classList.remove("is-invalid", "is-valid");
  inputEmpleado.classList.remove("is-invalid", "is-valid");
  inputFechaInicio.classList.remove("is-invalid", "is-valid");
  inputFechaFin.classList.remove("is-invalid", "is-valid");
  if (inputDocumentoAdjunto) inputDocumentoAdjunto.classList.remove("is-invalid", "is-valid");

  // Limpia el mensaje de error
  const inputErrorTipoLicencia = document.getElementById("errorIdTipoLicencia");
  const inputErrorEmpleado = document.getElementById("errorIdEmpleado");
  const inputErrorFechaInicio = document.getElementById("errorFechaInicio");
  const inputErrorFechaFin = document.getElementById("errorFechaFin");
  const inputErrorDocumentoAdjunto = document.getElementById("errorDocumentoAdjunto");

  if (inputErrorTipoLicencia) {
    inputErrorTipoLicencia.textContent = "";
    inputErrorTipoLicencia.style.display = "none";
  }
  if (inputErrorEmpleado) {
    inputErrorEmpleado.textContent = "";
    inputErrorEmpleado.style.display = "none";
  }
  if (inputErrorFechaInicio) {
    inputErrorFechaInicio.textContent = "";
    inputErrorFechaInicio.style.display = "none";
  }
  if (inputErrorFechaFin) {
    inputErrorFechaFin.textContent = "";
    inputErrorFechaFin.style.display = "none";
  }
  if (inputErrorDocumentoAdjunto) {
    inputErrorDocumentoAdjunto.textContent = "";
    inputErrorDocumentoAdjunto.style.display = "none";
  }
}

 // Función para validar el formulario de licencia
// Función para validar el formulario de licencia
function ValidarFormularioLicencia() {
  const inputTipoLicencia = document.getElementById("IdTipoLicencia");
  const inputErrorTipoLicencia = document.getElementById("errorIdTipoLicencia");
  const inputEmpleado = document.getElementById("EmpleadoId");
  const inputErrorEmpleado = document.getElementById("errorIdEmpleado");
  const inputFechaInicio = document.getElementById("FechaInicio");
  const inputErrorFechaInicio = document.getElementById("errorFechaInicio");
  const inputFechaFin = document.getElementById("FechaFin");
  const inputErrorFechaFin = document.getElementById("errorFechaFin");

  // Limpiar errores previos
  inputErrorTipoLicencia.style.display = "none";
  inputErrorTipoLicencia.textContent = "";
  inputErrorEmpleado.style.display = "none";
  inputErrorEmpleado.textContent = "";
  inputErrorFechaInicio.style.display = "none";
  inputErrorFechaInicio.textContent = "";
  inputErrorFechaFin.style.display = "none";
  inputErrorFechaFin.textContent = "";

  // Limpiar clases de validación anteriores
  inputTipoLicencia.classList.remove("is-valid", "is-invalid");
  inputEmpleado.classList.remove("is-valid", "is-invalid");
  inputFechaInicio.classList.remove("is-valid", "is-invalid");
  inputFechaFin.classList.remove("is-valid", "is-invalid");

  let valido = true;

  // Validar Tipo de Licencia
  if (!inputTipoLicencia.value) {
    inputErrorTipoLicencia.style.display = "block";
    inputErrorTipoLicencia.textContent = "Campo obligatorio.";
    inputTipoLicencia.classList.add("is-invalid");
    valido = false;
  } else {
    inputTipoLicencia.classList.add("is-valid");
  }

  // Validar Empleado
  if (!inputEmpleado.value) {
    inputErrorEmpleado.style.display = "block";
    inputErrorEmpleado.textContent = "Campo obligatorio.";
    inputEmpleado.classList.add("is-invalid");
    valido = false;
  } else {
    inputEmpleado.classList.add("is-valid");
  }

  // Validar Fecha Inicio
  if (!inputFechaInicio.value) {
    inputErrorFechaInicio.style.display = "block";
    inputErrorFechaInicio.textContent = "Campo obligatorio.";
    inputFechaInicio.classList.add("is-invalid");
    valido = false;
  } else {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaInicio = new Date(inputFechaInicio.value);
    if (fechaInicio < hoy) {
      inputErrorFechaInicio.style.display = "block";
      inputErrorFechaInicio.textContent = "La fecha de inicio no puede ser menor a hoy.";
      inputFechaInicio.classList.add("is-invalid");
      valido = false;
    } else {
      inputFechaInicio.classList.add("is-valid");
    }
  }

  // Validar Fecha Fin
  if (!inputFechaFin.value) {
    inputErrorFechaFin.style.display = "block";
    inputErrorFechaFin.textContent = "Campo obligatorio.";
    inputFechaFin.classList.add("is-invalid");
    valido = false;
  } else if (inputFechaInicio.value) {
    const fechaInicio = new Date(inputFechaInicio.value);
    const fechaFin = new Date(inputFechaFin.value);
    if (fechaFin < fechaInicio) {
      inputErrorFechaFin.style.display = "block";
      inputErrorFechaFin.textContent = "La fecha de fin no puede ser anterior a la de inicio.";
      inputFechaFin.classList.add("is-invalid");
      valido = false;
    } else {
      inputFechaFin.classList.add("is-valid");
    }
  }

  return valido;
}


 // Validación en vivo para Tipo de Licencia
document.getElementById("IdTipoLicencia").addEventListener("input", () => {
  const input = document.getElementById("IdTipoLicencia");
  const error = document.getElementById("errorIdTipoLicencia");
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

// Validación en vivo para Empleado
document.getElementById("EmpleadoId").addEventListener("input", () => {
  const input = document.getElementById("EmpleadoId");
  const error = document.getElementById("errorIdEmpleado");
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

// Validación en vivo para Fecha Inicio
document.getElementById("FechaInicio").addEventListener("input", () => {
  const input = document.getElementById("FechaInicio");
  const error = document.getElementById("errorFechaInicio");

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // quitar la hora para comparar correctamente

  if (!input.value) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else {
    const fechaIngresada = new Date(input.value);
    if (fechaIngresada < hoy) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      error.style.display = "block";
      error.textContent = "Fecha inválida (anterior a hoy).";
    } else {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      error.style.display = "none";
    }
  }
});


// Validación en vivo para Fecha Fin (incluye comparación con Fecha Inicio)
document.getElementById("FechaFin").addEventListener("input", () => {
  const inputInicio = document.getElementById("FechaInicio");
  const inputFin = document.getElementById("FechaFin");
  const error = document.getElementById("errorFechaFin");
  if (!inputFin.value) {
    inputFin.classList.add("is-invalid");
    inputFin.classList.remove("is-valid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else if (
    inputInicio.value &&
    new Date(inputFin.value) < new Date(inputInicio.value)
  ) {
    inputFin.classList.add("is-invalid");
    inputFin.classList.remove("is-valid");
    error.style.display = "block";
    error.textContent = "Fecha inválida (anterior a la de inicio).";
  } else {
    inputFin.classList.remove("is-invalid");
    inputFin.classList.add("is-valid");
    error.style.display = "none";
  }
});
 

// Función para validar si la licencia existe o no
function MostrarErrorLicenciaExistente(mensaje) {
  const errorLicencia = document.getElementById("errorIdEmpleado");
    if (mensaje) {
        errorLicencia.textContent = mensaje;
        errorLicencia.style.display = "block";
    } else {
        errorLicencia.textContent = "";
        errorLicencia.style.display = "none";
    }
}


// Función para crear una nueva licencia
async function CrearLicencia() {
    // Validar el formulario
    if (!ValidarFormularioLicencia()) {
        return; 
    }

    let licencia={
        tipoDeLicenciaId: parseInt(document.getElementById("IdTipoLicencia").value),
        fechaInicio: document.getElementById("FechaInicio").value,
        fechaFin: document.getElementById("FechaFin").value,
        documentoAdjunto: document.getElementById("DocumentoAdjunto").value || "",
        empleadoId: document.getElementById("EmpleadoId").value,
    };

    const res = await authFetch("Licencias", {
        method: "POST",
        body: JSON.stringify(licencia),
        })
        .then((response) => response.json())
        .then((response) => {
            if (response.mensaje) {
                MostrarErrorLicenciaExistente(response.mensaje);
            } else {
                CerrarPanelLicencia();
                ObtenerLicencias();
                // Mostrar alerta de éxito
                Swal.fire({
                    toast: true,
                    position: "bottom-end",
                    icon: "success",
                    title: "¡Licencia Creada!",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    background: "#f0f0f0",
                    color: "#000",
                });
            }
        });
    
}


// Función para editar una licencia existente
async function EditarLicencia(id) {
    // Validar el formulario
    if (!ValidarFormularioLicencia()) {
        return; 
    }
let licenciaId = parseInt(document.getElementById("IdLicencia").value);
let licencia = {
        id: licenciaId,
        tipoDeLicenciaId: parseInt(document.getElementById("IdTipoLicencia").value),
        fechaInicio: document.getElementById("FechaInicio").value,
        fechaFin: document.getElementById("FechaFin").value,
        documentoAdjunto: document.getElementById("DocumentoAdjunto").value || "",
        empleadoId: parseInt(document.getElementById("EmpleadoId").value) || 0, 
    };
    const res = await authFetch(`Licencias/${id}`, {
        method: "PUT",
        body: JSON.stringify(licencia),
    })
        .then((response) => response.json())
        .then((response) => {
            if (response.mensaje) {
                MostrarErrorLicenciaExistente(response.mensaje);
            } else {
                CerrarPanelLicencia();
                ObtenerLicencias();
                // Mostrar alerta de éxito
                Swal.fire({
                    toast: true,
                    position: "bottom-end",
                    icon: "success",
                    title: "¡Licencia Modificada!",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    background: "#f0f0f0",
                    color: "#000",
                });
            }
        });
}



function EliminarLicenciaId(id,) {
    Swal.fire({
        title: "¿Eliminar licencia?",
        text: "Esta seguro que desea eliminar esta licencia?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
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
      })
      .then((result) => {
        if(result.isConfirmed) {
            EliminarSiLicencia(id);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: "Acción cancelada",
                text: "La licencia sigue activa.",
                icon: "info",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: "bottom-end",
            })
        }
      })
}

async function EliminarSiLicencia(id) {
    const res = await authFetch(`Licencias/${id}`,
        {
            method: "DELETE"
        })
    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudo eliminar la licencia");
      }
      return response.text();
    })
    .then((data) => {
        ObtenerLicencias();

        Swal.fire({
            toast: true,
            position: "bottom-end",
            icon: "success",
            title: "¡Licencia Eliminada!",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: "#f0f0f0",
            color: "#000",
        })
    })
}

// Función para abrir el modal de acción sobre la licencia
function AbrirModalAccionLicencia(id) {
  Swal.fire({
    title: "¿Acción sobre la licencia?",
    text: "¿Desea aprobar o rechazar esta licencia?",
    icon: "question",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Aprobar",
    denyButtonText: "Rechazar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: "swal2-border-radius",
      confirmButton: "swal2-btn-confirmar", // clase para botón verde (aprobar)
      denyButton: "swal2-btn-denegar",     // clase para botón rojo (rechazar)
      cancelButton: "swal2-btn-cancelar",
      title: "swal2-title-custom",
      content: "swal2-content-custom",
    },
    background: "#fff",
    color: "#22223b",
  }).then((result) => {
    if (result.isConfirmed) {
      AprobarLicencia(id);
    } else if (result.isDenied) {
      RechazarLicencia(id);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Acción cancelada",
        text: "No se ha modificado el estado de la licencia.",
        icon: "info",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "bottom-end",
      });
    }
  });
}

async function RechazarLicencia(id) {
  const res = await authFetch(`Licencias/${id}/Rechazar`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      Swal.fire({
      title: "Licencia rechazada",
      text: "La licencia fue rechazada correctamente.",
      icon: "info",
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: "bottom-end"
    });

    ObtenerLicencias();
    })
    .catch((error) => {
      console.log("Error al rechazar la licencia:", error);
    });
}


async function AprobarLicencia(id) {
  const res = await authFetch(`Licencias/${id}/Aprobar`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      Swal.fire({
      title: "Licencia aprobada",
      text: "La licencia fue aprobada correctamente.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: "bottom-end"
    });
    ObtenerLicencias();
    })
    .catch((error) => {
      console.log("Error al aprobar la licencia:", error);
    });
}



ComboParaFiltrarTiposDeLicencia();