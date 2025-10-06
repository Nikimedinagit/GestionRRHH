
////////////////////////////////////////////////////////////////////////////////////////////////////////
// ABRIR PANEL DE LICENCIA ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function AbrirPanelLicencia() {
  document.getElementById("panelLicencia").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreLicencia");
    if (inputNombre) inputNombre.focus();
  }, 400);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// CERRAR PANEL DE LICENCIA ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function CerrarPanelLicencia() {
  document.getElementById("panelLicencia").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalLicencia();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICILIZAR LOS ONCHANGE DE FILTROS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
document
  .getElementById("filtrarFechaSelect")
  .addEventListener("change", function () {
    const mostrar = this.value === "si";
    document
      .getElementById("fechasInputs")
      .classList.toggle("d-none", !mostrar);
    document
      .getElementById("fechasInputsFin")
      .classList.toggle("d-none", !mostrar);

    document.getElementById("FechaInicioBuscar").value = "";
    document.getElementById("FechaFinBuscar").value = "";
  });

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



////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMBO PARA FILTRAR TIPO DE LICENCIA //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ComboParaFiltrarTiposDeLicencia() {
  const res = await authFetch("TipoDeLicencias/Activos", {
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// OBTENER LOS DATOS DE LA API DE LICENCIAS ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerLicencias() {
  let estadoLicencia = document.getElementById("EstadoIdBuscar").value;
  let estado =
    estadoLicencia !== "0" && estadoLicencia !== ""
      ? parseInt(estadoLicencia)
      : null;

  let tipoDeLicenciaId = document.getElementById(
    "TipoDeLicenciaIdBuscar"
  ).value;
  let tipoDeLicencia =
    tipoDeLicenciaId !== "0" && tipoDeLicenciaId !== ""
      ? parseInt(tipoDeLicenciaId)
      : null;

  const filtrarFecha = $("#filtrarFechaSelect").val() === "si";
  const fechaInicioRaw = $("#FechaInicioBuscar").val();
  const fechaFinRaw = $("#FechaFinBuscar").val();

  const fechaInicio =
    filtrarFecha && fechaInicioRaw !== "" ? fechaInicioRaw : null;
  const fechaFin = filtrarFecha && fechaFinRaw !== "" ? fechaFinRaw : null;

  const nombreEmpleado = document.getElementById("EmpleadoIdBuscar").value;

  let filtro = {
    estado: estado,
    tipoDeLicenciaId: tipoDeLicencia,
    fechaInicio: fechaInicio,
    fechaFin: fechaFin,
    empleadoTexto: nombreEmpleado,
  };

  const res = await authFetch("Licencias/Filtrar", {
    method: "POST",
    body: JSON.stringify(filtro),
  })
    .then((response) => response.json())
    .then((data) => {
      MostrarLicencias(data);
      LimpiarModalLicencia();
      CerrarPanelLicencia();
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS DATOS DE LA API DE LICENCIAS ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    EXPIRADA: "bg-dark text-white",
  };

  const bordeSuperiorColorHex = {
    PENDIENTE: "#FFC107",
    APROBADA: "#198754",
    RECHAZADA: "#DC3545",
    EXPIRADA: "#212529",
  };

  data.forEach((item) => {
    const estado = (item.estadoString || "PENDIENTE").toUpperCase();
    const claseEstado = estadoColor[estado] || "bg-light text-dark";
    const colorBorde = bordeSuperiorColorHex[estado] || "#ccc";

    const fechaInicio = formatearFecha(item.fechaInicioString);
    const fechaFin = formatearFecha(item.fechaFinString);

    const documentoHtml = item.documentoAdjunto
      ? `
    <p class="text-muted d-flex align-items-center gap-2 mb-2">
        <button onclick="DescargarDocumento(${item.id})" class="document-link d-flex align-items-center gap-1" data-tippy-content="Descargar" style="color: inherit; text-decoration: none; font-size: 0.9rem; border:none; background:none; cursor:pointer;">
            <i class="bi bi-file-earmark-text" style="font-size: 1rem;"></i>
            <span>Descargar</span>
        </button>
    </p>
    `
      : "";

    const rol = getRol()?.toUpperCase(); 

    const botonesHtml =
      estado === "PENDIENTE"
        ? `
    <div class="d-flex justify-content-between align-items-center mt-2">
      <div>
        ${(rol === "ADMINISTRADOR" || rol === "RRHH") ? `
          <button class="btn-accionLicencia" style="background:none; border:none;" onclick="AbrirModalAccionLicencia(${item.id})" data-tippy-content="Aprobar o rechazar">
            <i class="bi bi-sliders icono-accion-licencia"></i>
          </button>
        ` : ""}
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
      <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex" id="licencia-${item.id
      }">
        <div class="card shadow-sm p-2 rounded-3 position-relative d-flex flex-column w-100" style="border-bottom: 4px solid ${colorBorde}; min-height: 260px;">
          <div class="flex-grow-1 d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="fw-bold mb-0" style="font-size: 1rem;">${item.tipoDeLicenciaString || "-"
      }</h5>
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// DESCARGAR DOCUMENTO //////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function DescargarDocumento(id) {
  try {
    const response = await authFetch(`Licencias/Documento/${id}`);

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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION APRA FORMAR LA FECHA //////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function formatearFecha(fechaStr) {
  const [dia, mes, anio] = fechaStr.split("/");
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR EL MODAL DE EDICION DE LA LICENCIA /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function MostrarModalEditar(id) {
  const res = await authFetch(`Licencias/${id}`);
  const licencia = await res.json();

  document.getElementById("IdTipoLicencia").disabled = true;
  document.getElementById("FechaInicio").disabled = true;
  document.getElementById("FechaFin").disabled = true;
  document.getElementById("EmpleadoId").disabled = true;

  document.getElementById("IdLicencia").value = licencia.id;
  document.getElementById("IdTipoLicencia").value = licencia.tipoDeLicenciaId;
  document.getElementById("FechaInicio").value = licencia.fechaInicio.split("T")[0];
  document.getElementById("FechaFin").value = licencia.fechaFin.split("T")[0];
  document.getElementById("EmpleadoId").value = licencia.empleadoId;

  const archivoAdjuntoDiv = document.getElementById("archivoAdjuntoActual");

  if (licencia.documentoAdjunto && licencia.documentoAdjunto.length > 0) {
    const byteCharacters = atob(licencia.documentoAdjunto);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: licencia.documentoMimeType });
    const url = URL.createObjectURL(blob);

    let nombreArchivo = licencia.documentoNombre;
    if (nombreArchivo) {
      nombreArchivo = nombreArchivo.split("\\").pop().split("/").pop();
      if (nombreArchivo.length > 40) {
        nombreArchivo = nombreArchivo.substring(0, 40) + "...";
      }
    }

    archivoAdjuntoDiv.innerHTML = `
    <a href="${url}" download="${licencia.documentoNombre}">
      <i class="bi bi-file-earmark-text"></i> ${nombreArchivo}
    </a>
  `;
  } else {
    archivoAdjuntoDiv.innerHTML = "";
  }

  AbrirPanelLicencia();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA BUSCAR EL ID DE LA LICENCIA Y LLAMAR A LA FUNCIÓN DE EDICION O CREACIÓN ////////  
////////////////////////////////////////////////////////////////////////////////////////////////////////
function BuscarLicenciaId() {
  const id = parseInt(document.getElementById("IdLicencia").value);

  if (!id || id === 0) {
    CrearLicencia();
  } else {
    EditarLicencia(id);
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA LIMPIAR EL MODAL DE LICENCIA //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function LimpiarModalLicencia() {
  document.getElementById("IdLicencia").value = "";

  document.getElementById("IdTipoLicencia").disabled = false;
  document.getElementById("FechaInicio").disabled = false;
  document.getElementById("FechaFin").disabled = false;
  document.getElementById("EmpleadoId").disabled = false;

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

  inputTipoLicencia.classList.remove("is-invalid", "is-valid");
  inputEmpleado.classList.remove("is-invalid", "is-valid");
  inputFechaInicio.classList.remove("is-invalid", "is-valid");
  inputFechaFin.classList.remove("is-invalid", "is-valid");
  if (inputDocumentoAdjunto)
    inputDocumentoAdjunto.classList.remove("is-invalid", "is-valid");

  const inputErrorTipoLicencia = document.getElementById("errorIdTipoLicencia");
  const inputErrorEmpleado = document.getElementById("errorIdEmpleado");
  const inputErrorFechaInicio = document.getElementById("errorFechaInicio");
  const inputErrorFechaFin = document.getElementById("errorFechaFin");
  const inputErrorDocumentoAdjunto = document.getElementById(
    "errorDocumentoAdjunto"
  );

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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA VALIDAR EL FORMULARIO DE LICENCIA ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function ValidarFormularioLicencia() {
  const inputTipoLicencia = document.getElementById("IdTipoLicencia");
  const inputErrorTipoLicencia = document.getElementById("errorIdTipoLicencia");
  const inputEmpleado = document.getElementById("EmpleadoId");
  const inputErrorEmpleado = document.getElementById("errorIdEmpleado");
  const inputFechaInicio = document.getElementById("FechaInicio");
  const inputErrorFechaInicio = document.getElementById("errorFechaInicio");
  const inputFechaFin = document.getElementById("FechaFin");
  const inputErrorFechaFin = document.getElementById("errorFechaFin");

  const rol = getRol()?.toUpperCase();

  [inputErrorTipoLicencia, inputErrorEmpleado, inputErrorFechaInicio, inputErrorFechaFin].forEach(e => {
    e.style.display = "none";
    e.textContent = "";
  });

  [inputTipoLicencia, inputEmpleado, inputFechaInicio, inputFechaFin].forEach(e => {
    e.classList.remove("is-valid", "is-invalid");
  });

  let valido = true;

  if (!inputTipoLicencia.value) {
    inputErrorTipoLicencia.style.display = "block";
    inputErrorTipoLicencia.textContent = "Campo obligatorio.";
    inputTipoLicencia.classList.add("is-invalid");
    valido = false;
  } else {
    inputTipoLicencia.classList.add("is-valid");
  }

  if (rol === "ADMINISTRADOR" || rol === "RRHH") {
    if (!inputEmpleado.value) {
      inputErrorEmpleado.style.display = "block";
      inputErrorEmpleado.textContent = "Campo obligatorio.";
      inputEmpleado.classList.add("is-invalid");
      valido = false;
    } else {
      inputEmpleado.classList.add("is-valid");
    }
  }

  let fechaInicioValida = null;
  if (!inputFechaInicio.value) {
    inputErrorFechaInicio.style.display = "block";
    inputErrorFechaInicio.textContent = "Campo obligatorio.";
    inputFechaInicio.classList.add("is-invalid");
    valido = false;
  } else {
    const [anioI, mesI, diaI] = inputFechaInicio.value.split("-");
    const fechaInicio = new Date(anioI, mesI - 1, diaI);
    fechaInicio.setHours(0, 0, 0, 0);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaInicio < hoy) {
      inputErrorFechaInicio.style.display = "block";
      inputErrorFechaInicio.textContent = "No se permiten fechas anteriores a hoy.";
      inputFechaInicio.classList.add("is-invalid");
      valido = false;
    } else {
      inputFechaInicio.classList.add("is-valid");
      fechaInicioValida = fechaInicio;
    }
  }

  if (!inputFechaFin.value) {
    inputErrorFechaFin.style.display = "block";
    inputErrorFechaFin.textContent = "Campo obligatorio.";
    inputFechaFin.classList.add("is-invalid");
    valido = false;
  } else if (fechaInicioValida) {
    const [anioF, mesF, diaF] = inputFechaFin.value.split("-");
    const fechaFin = new Date(anioF, mesF - 1, diaF);
    fechaFin.setHours(0, 0, 0, 0);

    if (fechaFin < fechaInicioValida) {
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// VALIDACION EN VIVO PARA LICENCIA ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
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

document.getElementById("FechaInicio").addEventListener("input", () => {
  const input = document.getElementById("FechaInicio");
  const error = document.getElementById("errorFechaInicio");

  if (!input.value) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
    return;
  }

  // Parseo seguro usando constructor numérico
  const [anio, mes, dia] = input.value.split("-"); // formato yyyy-mm-dd
  const fechaIngresada = new Date(anio, mes - 1, dia);
  fechaIngresada.setHours(0, 0, 0, 0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaIngresada < hoy) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    error.style.display = "block";
    error.textContent = "No se permiten fechas anteriores a hoy.";
  } else {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    error.style.display = "none";
  }
});



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
    error.textContent = "Debe ser superior a la de inicio.";
  } else {
    inputFin.classList.remove("is-invalid");
    inputFin.classList.add("is-valid");
    error.style.display = "none";
  }
});

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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA CREAR UNA NUEVA LICENCIA ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function CrearLicencia() {
  if (!ValidarFormularioLicencia()) return;

  const formData = new FormData();

  formData.append(
    "TipoDeLicenciaId",
    parseInt(document.getElementById("IdTipoLicencia").value)
  );
  formData.append("FechaInicio", document.getElementById("FechaInicio").value);
  formData.append("FechaFin", document.getElementById("FechaFin").value);

  const rol = getRol()?.toUpperCase();
  if (rol === "ADMINISTRADOR" || rol === "RRHH") {
    formData.append("EmpleadoId", document.getElementById("EmpleadoId").value);
  }

  const archivo = document.getElementById("DocumentoAdjunto").files[0];
  if (archivo) {
    formData.append("DocumentoAdjunto", archivo);
  }

  try {
    const res = await authFetch("Licencias", {
      method: "POST",
      body: formData,
    });

    const response = await res.json();

    if (response.mensaje) {
      MostrarErrorLicenciaExistente(response.mensaje);
    } else {
      CerrarPanelLicencia();
      ObtenerLicencias();

      Swal.fire({
        title: "¡Licencia Creada!",
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



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA EDITAR UNA LICENCIA EXISTENTE ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EditarLicencia(id) {
  if (!ValidarFormularioLicencia()) {
    return;
  }
  const formData = new FormData();
  formData.append("Id", parseInt(document.getElementById("IdLicencia").value));
  formData.append(
    "TipoDeLicenciaId",
    parseInt(document.getElementById("IdTipoLicencia").value)
  );
  formData.append("FechaInicio", document.getElementById("FechaInicio").value);
  formData.append("FechaFin", document.getElementById("FechaFin").value);
  formData.append("EmpleadoId", document.getElementById("EmpleadoId").value);

  const archivo = document.getElementById("DocumentoAdjunto").files[0];
  if (archivo) {
    formData.append("DocumentoAdjunto", archivo);
  }

  const res = await authFetch(`Licencias/${id}`, {
    method: "PUT",
    body: formData,
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        MostrarErrorLicenciaExistente(response.mensaje);
      } else {
        CerrarPanelLicencia();
        ObtenerLicencias();

        Swal.fire({
          title: "¡Licencia Modificada!",
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR MODAL DE ELIMINAR LICENCIA ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function EliminarLicenciaId(id) {
  Swal.fire({
    title: "¿Desea eliminar esta licencia?",
    html: `
      <div class="text-center">
        <p>Esta licencia será eliminada de forma definitiva. ¿Desea continuar?</p>
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
      EliminarSiLicencia(id);
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA ELIMINAR SI LICENCIA //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EliminarSiLicencia(id) {
  const res = await authFetch(`Licencias/${id}`, {
    method: "DELETE",
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
        title: "¡Licencia Eliminada!",
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
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA ABRIR EL MODAL DE ACCION SOBRE LA LICENCIA /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function AbrirModalAccionLicencia(id) {
  Swal.fire({
    title: "Acción sobre la licencia",
    html: `
    <p class='swal2-content-center'>¿Deseás aprobar o rechazar esta licencia?</p>
    <p class='swal2-content-center'>Esta acción actualizará el estado de la licencia en el sistema.</p>
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
      AprobarLicencia(id);
    } else if (result.isDenied) {
      RechazarLicencia(id);
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA RECHAZAR UNA LICENCIA //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function RechazarLicencia(id) {
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA APROBAR UNA LICENCIA //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LAS OPCIONES DE LICENCIAS POR ROL /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarOpcionesLicenciasPorRol() {
  const rol = getRol()?.toUpperCase();
  if (!rol) return;

  const estadisticasYFiltros = $("#cardEstadisticasLicencias, #contenedorFiltrosLicencias");
  const seleccionEmpleado = $("#seleccionEmpleadoLicencia");
  const titulo = $("#tituloLicencia");
  const tipoLicenciaGroup = $("#IdTipoLicencia").closest(".form-group");

  if (rol === "ADMINISTRADOR" || rol === "RRHH") {
    estadisticasYFiltros.removeClass("d-none");
    seleccionEmpleado.removeClass("d-none");
    titulo.text("Formulario de Licencia");
    tipoLicenciaGroup.css("grid-column", "span 1");
  } else if (rol === "SUPERVISOR" || rol === "EMPLEADO") {
    estadisticasYFiltros.addClass("d-none");
    seleccionEmpleado.addClass("d-none");
    titulo.text("Solicitá tu licencia o consultá el estado de tus solicitudes.");
    tipoLicenciaGroup.css("grid-column", "span 2");
  }
}




////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR AL CARGAR LA VISTA ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
MostrarOpcionesLicenciasPorRol();
ComboParaFiltrarTiposDeLicencia();

