function EsRolGestionAsignaciones() {
  const rol = getRol()?.toUpperCase();
  return rol === "ADMINISTRADOR" || rol === "RRHH" || rol === "SUPERVISOR";
}

async function AbrirPanelAsignacionResponsabilidadTarea() {
  if (!EsRolGestionAsignaciones()) return;

  const empleadoIdActual = parseInt(document.getElementById("IdAsignacion").value) || null;
  await ObtenerEmpleadosDisponiblesAsignacion(empleadoIdActual);

  document.getElementById("panelAsignacionResponsabilidadTarea").classList.add("abierto");
  document.getElementById("fondoOscuro").classList.add("visible");

  setTimeout(() => {
    const selectEmpleado = document.getElementById("EmpleadoIdAsignacion");
    if (selectEmpleado) selectEmpleado.focus();
  }, 400);
}

function CerrarPanelAsignacionResponsabilidadTarea() {
  document.getElementById("panelAsignacionResponsabilidadTarea").classList.remove("abierto");
  document.getElementById("fondoOscuro").classList.remove("visible");
  LimpiarModalAsignacion();
}

$(document).ready(function () {
  $("#TituloAsignacionBuscar, #EmpleadoAsignacionBuscar, #EstadoActivoAsignacionBuscar").on("input change", function () {
    ObtenerAsignaciones(false);
  });
});

async function ObtenerEmpleadosAsignaciones() {
  try {
    const response = await authFetch("Empleados/Activos", {
      method: "GET",
    });

    const empleados = await response.json();
    MostrarEmpleadosAsignaciones(empleados);
  } catch (error) {
    MostrarErrorCatch();
  }
}

function MostrarEmpleadosAsignaciones(empleados) {
  const $filtro = $("#EmpleadoAsignacionBuscar");

  $filtro.empty().append(`<option value="">[Todos]</option>`);

  empleados.forEach((empleado) => {
    $filtro.append(`<option value="${empleado.id}">${TextoEmpleadoConPuesto(empleado)}</option>`);
  });
}

async function ObtenerEmpleadosDisponiblesAsignacion(empleadoIdActual = null) {
  try {
    const query = empleadoIdActual ? `?empleadoIdActual=${empleadoIdActual}` : "";
    const response = await authFetch(`AsignacionResponsabilidadesTareas/EmpleadosDisponibles${query}`, {
      method: "GET",
    });

    const empleados = await response.json();
    MostrarEmpleadosDisponiblesAsignacion(empleados);
  } catch (error) {
    MostrarErrorCatch();
  }
}

function MostrarEmpleadosDisponiblesAsignacion(empleados) {
  const $form = $("#EmpleadoIdAsignacion");
  $form.empty().append(`<option value="" selected disabled hidden>Seleccione</option>`);

  empleados.forEach((empleado) => {
    $form.append(`<option value="${empleado.id}">${TextoEmpleadoConPuesto(empleado)}</option>`);
  });
}

function TextoEmpleadoConPuesto(empleado) {
  const nombre = empleado.nombreCompleto || "-";
  const puesto = empleado.puestoIdString || empleado.puesto?.descripcion || empleado.puesto || empleado.Puesto || "Sin puesto";
  return `${nombre} (${puesto})`;
}

async function ObtenerAsignaciones(mostrarSpinner = true) {
  if (mostrarSpinner) mostrarPantallaCarga();

  try {
    const filtro = {
      busqueda: document.getElementById("TituloAsignacionBuscar").value.trim() || null,
      empleadoId: ValorEnteroONull("EmpleadoAsignacionBuscar"),
      eliminado: ValorEnteroONull("EstadoActivoAsignacionBuscar"),
    };

    const response = await authFetch("AsignacionResponsabilidadesTareas/Filtrar", {
      method: "POST",
      body: JSON.stringify(filtro),
    });

    const asignaciones = await response.json();
    MostrarAsignaciones(asignaciones);
    LimpiarModalAsignacion();
  } catch (error) {
    MostrarErrorCatch();
  } finally {
    if (mostrarSpinner) setTimeout(() => ocultarPantallaCarga(), 1000);
  }
}

function ValorEnteroONull(id) {
  const valor = document.getElementById(id).value;
  return valor !== "" ? parseInt(valor) : null;
}

function MostrarAsignaciones(asignaciones) {
  const contenedor = $("#contenedorAsignaciones");
  contenedor.empty();
  window.asignacionesResponsabilidadesData = asignaciones;

  if (asignaciones.length === 0) {
    contenedor.append(
      "<div class='col-12 text-center text-muted py-3'>No hay asignaciones para mostrar.</div>"
    );
    return;
  }

  asignaciones.forEach((item) => {
    const filaClass = item.eliminado ? "fila-desactivada" : "";
    const activo = item.eliminado == false;
    const responsabilidadesResumen = RecortarTextoAsignacion(TextoPlanoAsignacion(item.responsabilidades) || "Sin responsabilidades", 55);
    const tareasResumen = RecortarTextoAsignacion(TextoPlanoAsignacion(item.tareas) || "Sin tareas", 55);
    const textoEstado = activo ? "A" : "D";
    const tooltipEstadoBadge = activo ? "Activo" : "Desactivado";
    const claseEstado = activo ? "badge-empleado-activo" : "badge-empleado-desactivado";
    const accionesGestion = EsRolGestionAsignaciones()
      ? `
        <button class="btn-editar" style="${item.eliminado ? "display:none;" : ""} background:none; border:none;"
          onclick="MostrarModalEditarAsignacion(${item.id})" data-tippy-content="Editar">
          <i class="bi bi-pencil-square icono-editar"></i>
        </button>
        <button class="btn-editar" style="background:none; border:none;"
          onclick="EliminarAsignacionId(${item.id}, ${item.eliminado})"
          data-tippy-content="${item.eliminado ? "Activar" : "Desactivar"}">
          <i class="icon-desactivar bi ${item.eliminado ? "bi-toggle-off text-danger" : "bi-toggle-on text-success"}"></i>
        </button>
      `
      : "";

    const card = `
      <div class="col-12 col-xl-6">
        <div class="card shadow-sm p-2 rounded position-relative d-flex flex-column w-100 h-100 ${filaClass}"
          style="border-bottom: 4px solid ${activo ? "#198754" : "#DC3545"}; background-color: ${activo ? "#ffffff" : "#f8d7da3b"};">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
            <div style="min-width: 0;">
              <h5 class="fw-bold mb-1" style="font-size: 0.92rem; word-break: break-word;">${item.empleadoString || "Sin empleado asignado"}</h5>
              <p class="mb-0 text-muted d-flex align-items-center" style="font-size: 0.8rem;">
                <i class="bi bi-briefcase me-2" style="font-size: 0.86rem;"></i>
                <span>${item.puestoString || "Sin puesto"}</span>
              </p>
            </div>
            <div class="d-flex align-items-center gap-1 flex-shrink-0">
              <span class="badge ${claseEstado}" style="font-size: 0.62rem; font-weight: 700; padding: 0.2em 0.45em;" data-tippy-content="${tooltipEstadoBadge}">${textoEstado}</span>
            </div>
          </div>

          <div class="border-top pt-1 mt-1">
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge badge-asignacion-responsabilidad">
                <i class="bi bi-person-check me-1"></i>Responsabilidades
              </span>
            </div>
            <p class="text-muted mb-1 resumen-asignacion-card">${EscaparHtmlAsignacion(responsabilidadesResumen)}</p>

            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge badge-asignacion-tarea">
                <i class="bi bi-list-check me-1"></i>Tareas
              </span>
            </div>
            <p class="text-muted mb-0 resumen-asignacion-card">${EscaparHtmlAsignacion(tareasResumen)}</p>
          </div>

          <div class="d-flex justify-content-between mt-2 align-items-center">
            <button class="btn-ver" style="background:none; border:none; cursor:pointer; padding:0;" onclick="MostrarDetalleAsignacion(${item.id})" data-tippy-content="Ver más">
              <i class="bi bi-info-circle icono-ver"></i>
            </button>
            <div class="d-flex align-items-center gap-1">
              ${accionesGestion}
            </div>
          </div>
        </div>
      </div>
    `;

    contenedor.append(card);
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

function RecortarTextoAsignacion(texto, maximo) {
  if (!texto) return "";
  return texto.length > maximo ? `${texto.substring(0, maximo).trim()}...` : texto;
}

function MostrarDetalleAsignacion(id) {
  const asignacion = window.asignacionesResponsabilidadesData?.find((item) => item.id === id);
  if (!asignacion) return;

  document.getElementById("detalleAsignacionEmpleado").textContent = asignacion.empleadoString || "Sin empleado asignado";
  document.getElementById("detalleAsignacionPuesto").textContent = asignacion.puestoString || "Sin puesto";
  document.getElementById("detalleAsignacionResponsabilidades").innerHTML = SanitizarHtmlAsignacion(asignacion.responsabilidades) || "Sin responsabilidades";
  document.getElementById("detalleAsignacionTareas").innerHTML = SanitizarHtmlAsignacion(asignacion.tareas) || "Sin tareas";

  const offcanvas = new bootstrap.Offcanvas("#offcanvasDetalleAsignacion");
  offcanvas.show();
}

async function MostrarModalEditarAsignacion(id) {
  if (!EsRolGestionAsignaciones()) return;

  try {
    const response = await authFetch(`AsignacionResponsabilidadesTareas/${id}`);
    const asignacion = await response.json();

    document.getElementById("IdAsignacion").value = asignacion.id;
    await ObtenerEmpleadosDisponiblesAsignacion(asignacion.empleadoId);
    document.getElementById("EmpleadoIdAsignacion").value = asignacion.empleadoId || "";
    SetContenidoEditorAsignacion("EditorResponsabilidadesAsignacion", "ResponsabilidadesAsignacion", asignacion.responsabilidades || "");
    SetContenidoEditorAsignacion("EditorTareasAsignacion", "TareasAsignacion", asignacion.tareas || "");

    document.getElementById("panelAsignacionResponsabilidadTarea").classList.add("abierto");
    document.getElementById("fondoOscuro").classList.add("visible");
  } catch (error) {
    MostrarErrorCatch();
  }
}

function BuscarAsignacionId() {
  const id = parseInt(document.getElementById("IdAsignacion").value);

  if (!id || id === 0) {
    CrearAsignacion();
  } else {
    EditarAsignacion(id);
  }
}

function LimpiarModalAsignacion() {
  document.getElementById("IdAsignacion").value = "";
  document.getElementById("formAsignacionResponsabilidadTarea").reset();

  [
    "EmpleadoIdAsignacion",
    "EditorResponsabilidadesAsignacion",
    "EditorTareasAsignacion",
  ].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.classList.remove("is-invalid", "is-valid");
  });

  [
    "errorEmpleadoIdAsignacion",
    "errorResponsabilidadesAsignacion",
    "errorTareasAsignacion",
  ].forEach((id) => {
    const error = document.getElementById(id);
    if (error) {
      error.textContent = "";
      error.style.display = "none";
    }
  });

  SetContenidoEditorAsignacion("EditorResponsabilidadesAsignacion", "ResponsabilidadesAsignacion", "");
  SetContenidoEditorAsignacion("EditorTareasAsignacion", "TareasAsignacion", "");
}

function ValidarFormularioAsignacion() {
  LimpiarErroresAsignacion();

  let esValido = true;
  const empleadoId = document.getElementById("EmpleadoIdAsignacion").value;
  SincronizarEditoresAsignacion();
  const responsabilidades = TextoPlanoAsignacion(document.getElementById("ResponsabilidadesAsignacion").value);
  const tareas = TextoPlanoAsignacion(document.getElementById("TareasAsignacion").value);

  if (!empleadoId) {
    MostrarErrorCampoAsignacion("EmpleadoIdAsignacion", "errorEmpleadoIdAsignacion", "Seleccione un empleado.");
    esValido = false;
  }

  if (responsabilidades.length < 5) {
    MostrarErrorCampoAsignacion(
      "ResponsabilidadesAsignacion",
      "errorResponsabilidadesAsignacion",
      responsabilidades.length === 0 ? "Campo obligatorio." : "Mínimo 5 caracteres."
    );
    esValido = false;
  }

  if (tareas.length < 5) {
    MostrarErrorCampoAsignacion(
      "TareasAsignacion",
      "errorTareasAsignacion",
      tareas.length === 0 ? "Campo obligatorio." : "Mínimo 5 caracteres."
    );
    esValido = false;
  }

  return esValido;
}

function LimpiarErroresAsignacion() {
  [
    ["EmpleadoIdAsignacion", "errorEmpleadoIdAsignacion"],
    ["ResponsabilidadesAsignacion", "errorResponsabilidadesAsignacion"],
    ["TareasAsignacion", "errorTareasAsignacion"],
  ].forEach(([inputId, errorId]) => {
    const input = ObtenerControlVisibleAsignacion(inputId);
    const error = document.getElementById(errorId);
    input.classList.remove("is-invalid", "is-valid");
    error.textContent = "";
    error.style.display = "none";
  });
}

function MostrarErrorCampoAsignacion(inputId, errorId, mensaje) {
  const input = ObtenerControlVisibleAsignacion(inputId);
  const error = document.getElementById(errorId);

  input.classList.add("is-invalid");
  error.textContent = mensaje;
  error.style.display = "block";
}

function ObtenerAsignacionDesdeFormulario() {
  SincronizarEditoresAsignacion();

  return {
    id: parseInt(document.getElementById("IdAsignacion").value) || 0,
    responsabilidades: document.getElementById("ResponsabilidadesAsignacion").value.trim(),
    tareas: document.getElementById("TareasAsignacion").value.trim(),
    empleadoId: parseInt(document.getElementById("EmpleadoIdAsignacion").value),
    eliminado: false,
  };
}

async function CrearAsignacion() {
  if (!ValidarFormularioAsignacion()) return;

  mostrarOverlayGuardando();

  try {
    const response = await authFetch("AsignacionResponsabilidadesTareas", {
      method: "POST",
      body: JSON.stringify(ObtenerAsignacionDesdeFormulario()),
    });

    if (!response.ok) {
      await MostrarErrorRespuestaAsignacion(response);
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      CerrarPanelAsignacionResponsabilidadTarea();
      ObtenerAsignaciones(false);
      MostrarToastAsignacion("¡Asignación Creada!");
    }, 800);
  } catch (error) {
    MostrarErrorCatch();
    ocultarOverlayGuardando();
  }
}

async function EditarAsignacion(id) {
  if (!ValidarFormularioAsignacion()) return;

  mostrarOverlayGuardando();

  try {
    const asignacion = ObtenerAsignacionDesdeFormulario();
    asignacion.id = id;

    const response = await authFetch(`AsignacionResponsabilidadesTareas/${id}`, {
      method: "PUT",
      body: JSON.stringify(asignacion),
    });

    if (!response.ok) {
      await MostrarErrorRespuestaAsignacion(response);
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      CerrarPanelAsignacionResponsabilidadTarea();
      ObtenerAsignaciones(false);
      MostrarToastAsignacion("¡Asignación Modificada!");
    }, 800);
  } catch (error) {
    MostrarErrorCatch();
    ocultarOverlayGuardando();
  }
}

async function MostrarErrorRespuestaAsignacion(response) {
  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (data.mensaje) {
    MostrarErrorCampoAsignacion("ResponsabilidadesAsignacion", "errorResponsabilidadesAsignacion", data.mensaje);
  } else {
    MostrarErrorCatch();
  }
}

function EliminarAsignacionId(id, eliminado) {
  Swal.fire({
    title: eliminado ? "¿Deseás reactivar esta asignación?" : "¿Deseás desactivar esta asignación?",
    html: eliminado
      ? "<p class='swal2-content-center'>Esta acción volverá a habilitar la asignación.</p>"
      : "<p class='swal2-content-center'>La asignación quedará inactiva.</p>",
    showCancelButton: true,
    confirmButtonText: eliminado ? "Sí, activar" : "Sí, desactivar",
    cancelButtonText: "Cancelar",
    focusCancel: true,
    customClass: {
      popup: "swal2-border-radius swal2-custom-popup",
      confirmButton: eliminado ? "swal2-btn-activar" : "swal2-btn-desactivar",
      cancelButton: "swal2-btn-cancelar",
      title: "swal2-title-custom",
      htmlContainer: "swal2-content-custom",
    },
    background: "#ffffff",
    color: "#1a1a1a",
  }).then((result) => {
    if (result.isConfirmed) {
      EliminarSiAsignacion(id);
    }
  });
}

async function EliminarSiAsignacion(id) {
  try {
    const response = await authFetch(`AsignacionResponsabilidadesTareas/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      MostrarToastAsignacion("¡" + data.mensaje + "!");
      ObtenerAsignaciones(false);
    } else {
      MostrarErrorCatch();
    }
  } catch (error) {
    MostrarErrorCatch();
  }
}

function MostrarToastAsignacion(titulo) {
  Swal.fire({
    title: titulo,
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

function MostrarOpcionesAsignacionesPorRol() {
  if (EsRolGestionAsignaciones()) return;

  $("#btnNuevaAsignacion").addClass("d-none");
  $("#EmpleadoAsignacionBuscar").closest(".col-12").addClass("d-none");
  $("#tituloAsignaciones").text("Consultá las responsabilidades y tareas que tenés asignadas.");
}

function ObtenerControlVisibleAsignacion(inputId) {
  const mapa = {
    ResponsabilidadesAsignacion: "EditorResponsabilidadesAsignacion",
    TareasAsignacion: "EditorTareasAsignacion",
  };

  return document.getElementById(mapa[inputId] || inputId);
}

function SetContenidoEditorAsignacion(editorId, inputId, html) {
  const contenido = SanitizarHtmlAsignacion(html);
  document.getElementById(editorId).innerHTML = contenido;
  document.getElementById(inputId).value = contenido;
  ActualizarContadorEditorAsignacion(editorId);
}

function SincronizarEditoresAsignacion() {
  SincronizarEditorAsignacion("EditorResponsabilidadesAsignacion", "ResponsabilidadesAsignacion");
  SincronizarEditorAsignacion("EditorTareasAsignacion", "TareasAsignacion");
}

function SincronizarEditorAsignacion(editorId, inputId) {
  const editor = document.getElementById(editorId);
  document.getElementById(inputId).value = SanitizarHtmlAsignacion(editor.innerHTML);
  ActualizarContadorEditorAsignacion(editorId);
}

function ActualizarContadorEditorAsignacion(editorId) {
  const mapa = {
    EditorResponsabilidadesAsignacion: "ContadorResponsabilidadesAsignacion",
    EditorTareasAsignacion: "ContadorTareasAsignacion",
  };
  const contador = document.getElementById(mapa[editorId]);
  const editor = document.getElementById(editorId);
  if (!contador || !editor) return;

  const cantidad = (editor.textContent || "").trim().length;
  contador.textContent = `${cantidad} ${cantidad === 1 ? "carácter" : "caracteres"}`;
}

function LimpiarHtmlEditorAsignacion(editorId, inputId) {
  const editor = document.getElementById(editorId);
  const contenido = SanitizarHtmlAsignacion(editor.innerHTML);
  editor.innerHTML = contenido;
  document.getElementById(inputId).value = contenido;
  ActualizarContadorEditorAsignacion(editorId);
}

function FormatearTextoAsignacion(comando, editorId) {
  const editor = document.getElementById(editorId);
  editor.focus();
  document.execCommand(comando, false, null);
  SincronizarEditoresAsignacion();
}

function SanitizarHtmlAsignacion(html) {
  const contenedor = document.createElement("div");
  contenedor.innerHTML = html || "";

  const etiquetasPermitidas = ["B", "STRONG", "I", "EM", "U", "BR", "UL", "OL", "LI", "DIV", "P"];

  contenedor.querySelectorAll("*").forEach((elemento) => {
    if (!etiquetasPermitidas.includes(elemento.tagName)) {
      elemento.replaceWith(document.createTextNode(elemento.textContent || ""));
      return;
    }

    [...elemento.attributes].forEach((atributo) => elemento.removeAttribute(atributo.name));
  });

  return contenedor.innerHTML.trim();
}

function TextoPlanoAsignacion(html) {
  const contenedor = document.createElement("div");
  contenedor.innerHTML = SanitizarHtmlAsignacion(html);
  return (contenedor.textContent || "").trim();
}

function EscaparHtmlAsignacion(texto) {
  const contenedor = document.createElement("div");
  contenedor.textContent = texto || "";
  return contenedor.innerHTML;
}

[
  ["EmpleadoIdAsignacion", "change"],
  ["EditorResponsabilidadesAsignacion", "input"],
  ["EditorTareasAsignacion", "input"],
].forEach(([id, evento]) => {
  document.getElementById(id).addEventListener(evento, () => {
    const input = document.getElementById(id);
    input.classList.remove("is-invalid");
    SincronizarEditoresAsignacion();
  });
});

[
  ["EditorResponsabilidadesAsignacion", "ResponsabilidadesAsignacion"],
  ["EditorTareasAsignacion", "TareasAsignacion"],
].forEach(([editorId, inputId]) => {
  document.getElementById(editorId).addEventListener("blur", () => {
    LimpiarHtmlEditorAsignacion(editorId, inputId);
  });
});

document.querySelectorAll(".editor-asignacion-toolbar button").forEach((boton) => {
  boton.addEventListener("mousedown", (event) => event.preventDefault());
});

MostrarOpcionesAsignacionesPorRol();
ObtenerEmpleadosAsignaciones();
ObtenerAsignaciones();
