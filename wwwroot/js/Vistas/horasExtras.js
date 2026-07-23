var horasExtrasData = [];

function EscaparHtmlHoraExtra(valor) {
  const elemento = document.createElement("div");
  elemento.textContent = valor || "";
  return elemento.innerHTML;
}

$("#HoraExtraEmpleadoBuscar, #HoraExtraDesde, #HoraExtraHasta, #HoraExtraEstadoBuscar, #HoraExtraOrigenBuscar")
  .on("input change", () => ObtenerHorasExtras(false));

async function CargarEmpleadosHorasExtras() {
  try {
    const response = await authFetch("Empleados/Activos");
    const empleados = await response.json();
    const select = document.getElementById("EmpleadoHoraExtra");
    empleados.forEach((empleado) => {
      select.insertAdjacentHTML("beforeend",
        `<option value="${empleado.id}">${EscaparHtmlHoraExtra(empleado.nombreCompleto)}</option>`);
    });
  } catch (error) {
    MostrarErrorCatch();
  }
}

async function ObtenerHorasExtras(mostrarSpinner = true) {
  if (mostrarSpinner) mostrarPantallaCarga();
  try {
    const filtro = {
      empleado: document.getElementById("HoraExtraEmpleadoBuscar").value.trim(),
      desde: document.getElementById("HoraExtraDesde").value || null,
      hasta: document.getElementById("HoraExtraHasta").value || null,
      estado: Number(document.getElementById("HoraExtraEstadoBuscar").value) || null,
      origen: Number(document.getElementById("HoraExtraOrigenBuscar").value) || null,
    };
    const response = await authFetch("HorasExtras/Filtrar", { method: "POST", body: JSON.stringify(filtro) });
    if (!response.ok) throw new Error();
    horasExtrasData = await response.json();
    MostrarHorasExtras();
  } catch (error) {
    MostrarErrorCatch();
  } finally {
    if (mostrarSpinner) setTimeout(() => ocultarPantallaCarga(), 1200);
  }
}

function MostrarHorasExtras() {
  const contenedor = document.getElementById("contenedorHorasExtras");
  const minutosTotal = horasExtrasData.reduce((total, item) => total + item.minutos, 0);
  document.getElementById("totalHorasExtras").textContent = FormatearMinutosHoraExtra(minutosTotal);
  document.getElementById("totalHorasPendientes").textContent = horasExtrasData.filter((h) => h.estado === "PENDIENTE").length;
  document.getElementById("totalHorasAprobadas").textContent = horasExtrasData.filter((h) => h.estado === "APROBADA").length;
  document.getElementById("totalEmpleadosHoras").textContent = new Set(horasExtrasData.map((h) => h.empleadoId)).size;

  if (!horasExtrasData.length) {
    contenedor.innerHTML = "<div class='col-12 text-center text-muted py-3'>No hay horas extras para mostrar.</div>";
    return;
  }

  const colores = {
    PENDIENTE: ["#fff3cd", "#856404", "#ffc107"],
    APROBADA: ["#d1e7dd", "#0f5132", "#198754"],
    RECHAZADA: ["#f8d7da", "#842029", "#dc3545"],
    ANULADA: ["#e2e3e5", "#495057", "#6c757d"],
  };

  contenedor.innerHTML = horasExtrasData.map((item) => {
    const color = colores[item.estado] || colores.PENDIENTE;
    const fecha = new Date(item.fecha).toLocaleDateString("es-AR");
    const esPendiente = item.estado === "PENDIENTE";
    const editar = esPendiente && item.origen === "MANUAL"
      ? `<button style="background:none;border:none;" onclick="EditarHoraExtra(${item.id})" data-tippy-content="Editar"><i class="bi bi-pencil-square icono-editar"></i></button>` : "";
    const estados = esPendiente ? `
      <button class="btn-accionLicencia" style="background:none;border:none;" onclick="AbrirModalAccionHoraExtra(${item.id})" data-tippy-content="Aprobar o rechazar">
        <i class="bi bi-sliders icono-accion"></i>
      </button>` :
      `<button style="background:none;border:none;" onclick="CambiarEstadoHoraExtra(${item.id},4)" data-tippy-content="Anular"><i class="bi bi-slash-circle icono-accion"></i></button>`;

    return `
      <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex">
        <div class="card shadow-sm p-2 rounded position-relative d-flex flex-column w-100" style="border-bottom:4px solid ${color[2]};min-height:210px;">
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-start mb-2 gap-2">
              <h5 class="fw-bold mb-0 text-truncate" style="font-size:1rem;">${EscaparHtmlHoraExtra(item.empleadoString)}</h5>
              <span class="badge fw-bold" style="background:${color[0]};color:${color[1]};font-size:.68rem;">${item.estado}</span>
            </div>
            <p class="mb-1 text-muted" style="font-size:.88rem;"><i class="bi bi-calendar3 me-2"></i>${fecha}</p>
            <p class="mb-1 text-muted" style="font-size:.88rem;"><i class="bi bi-clock me-2"></i>${item.horaInicio.slice(0,5)} - ${item.horaFin.slice(0,5)}</p>
            <p class="mb-1 fw-bold" style="font-size:.9rem;"><i class="bi bi-hourglass-split me-2"></i>${item.horasString} hs</p>
            <p class="mb-1 text-muted text-truncate" style="font-size:.82rem;">${EscaparHtmlHoraExtra(item.motivo)}</p>
            <span class="badge ${item.origen === "AUTOMATICO" ? "bg-primary-subtle text-primary" : "bg-secondary-subtle text-secondary"}">${item.origen}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <button style="background:none;border:none;" onclick="EliminarHoraExtra(${item.id})" data-tippy-content="Eliminar"><i class="bi bi-trash icono-borrar"></i></button>
            <div>${editar}${estados}</div>
          </div>
        </div>
      </div>`;
  }).join("");
  tippy("[data-tippy-content]", { animation: "scale", theme: "mi-tema", delay: [100, 0] });
}

function FormatearMinutosHoraExtra(minutos) {
  return `${Math.floor(minutos / 60)}:${String(minutos % 60).padStart(2, "0")}`;
}

function AbrirPanelHoraExtra() {
  document.getElementById("formHoraExtra").reset();
  document.getElementById("IdHoraExtra").value = "";
  document.getElementById("FechaHoraExtra").value = new Date().toISOString().slice(0, 10);
  document.getElementById("panelTituloHoraExtra").textContent = "Formulario de Hora Extra";
  LimpiarErroresHoraExtra();
  document.getElementById("panelHoraExtra").classList.add("abierto");
  document.getElementById("fondoOscuro").classList.add("visible");
}

function CerrarPanelHoraExtra() {
  document.getElementById("panelHoraExtra").classList.remove("abierto");
  document.getElementById("fondoOscuro").classList.remove("visible");
}

function EditarHoraExtra(id) {
  const item = horasExtrasData.find((hora) => hora.id === id);
  if (!item) return;
  AbrirPanelHoraExtra();
  document.getElementById("IdHoraExtra").value = item.id;
  document.getElementById("EmpleadoHoraExtra").value = item.empleadoId;
  document.getElementById("FechaHoraExtra").value = item.fecha.slice(0, 10);
  document.getElementById("InicioHoraExtra").value = item.horaInicio.slice(0, 5);
  document.getElementById("FinHoraExtra").value = item.horaFin.slice(0, 5);
  document.getElementById("MotivoHoraExtra").value = item.motivo || "";
  document.getElementById("ObservacionesHoraExtra").value = item.observaciones || "";
  document.getElementById("panelTituloHoraExtra").textContent = "Modificar Hora Extra";
}

function LimpiarErroresHoraExtra() {
  document.querySelectorAll("#formHoraExtra .is-invalid").forEach((e) => e.classList.remove("is-invalid"));
  document.querySelectorAll("#formHoraExtra .invalid-feedback").forEach((e) => { e.textContent = ""; e.style.display = "none"; });
}

function ErrorHoraExtra(inputId, errorId, mensaje) {
  document.getElementById(inputId).classList.add("is-invalid");
  const error = document.getElementById(errorId); error.textContent = mensaje; error.style.display = "block";
}

async function GuardarHoraExtra() {
  LimpiarErroresHoraExtra();
  const id = Number(document.getElementById("IdHoraExtra").value) || 0;
  const dto = {
    id,
    empleadoId: Number(document.getElementById("EmpleadoHoraExtra").value),
    fecha: document.getElementById("FechaHoraExtra").value,
    horaInicio: document.getElementById("InicioHoraExtra").value,
    horaFin: document.getElementById("FinHoraExtra").value,
    motivo: document.getElementById("MotivoHoraExtra").value.trim(),
    observaciones: document.getElementById("ObservacionesHoraExtra").value.trim(),
  };
  if (!dto.empleadoId) return ErrorHoraExtra("EmpleadoHoraExtra", "errorEmpleadoHoraExtra", "Seleccione un empleado.");
  if (!dto.fecha) return ErrorHoraExtra("FechaHoraExtra", "errorFechaHoraExtra", "Ingrese la fecha.");
  if (!dto.horaInicio || !dto.horaFin) return ErrorHoraExtra("FinHoraExtra", "errorHorarioHoraExtra", "Complete ambas horas.");
  if (!dto.motivo) return ErrorHoraExtra("MotivoHoraExtra", "errorMotivoHoraExtra", "Ingrese el motivo.");

  mostrarOverlayGuardando();
  try {
    const response = await authFetch(id ? `HorasExtras/${id}` : "HorasExtras", { method: id ? "PUT" : "POST", body: JSON.stringify(dto) });
    const data = await response.json();
    ocultarOverlayGuardando();
    if (!response.ok) return ErrorHoraExtra("EmpleadoHoraExtra", "errorEmpleadoHoraExtra", data.mensaje || "No se pudo guardar.");
    CerrarPanelHoraExtra(); await ObtenerHorasExtras(false); ToastHoraExtra(id ? "¡Hora Extra Modificada!" : "¡Hora Extra Creada!");
  } catch (error) { ocultarOverlayGuardando(); MostrarErrorCatch(); }
}

async function CalcularHorasExtrasAutomaticas() {
  const hoy = new Date().toISOString().slice(0, 10);
  const resultado = await Swal.fire({
    title: "Calcular Horas Extras",
    html: `<div class="text-start"><label class="form-label-fija">Desde</label><input id="calculoDesde" type="date" class="form-control mb-3" value="${hoy}"><label class="form-label-fija">Hasta</label><input id="calculoHasta" type="date" class="form-control" value="${hoy}"></div>`,
    showCancelButton: true, confirmButtonText: "Calcular", cancelButtonText: "Cancelar",
    customClass: { popup: "swal2-border-radius", confirmButton: "swal2-btn-activar", cancelButton: "swal2-btn-cancelar" },
    preConfirm: () => ({ desde: document.getElementById("calculoDesde").value, hasta: document.getElementById("calculoHasta").value })
  });
  if (!resultado.isConfirmed) return;
  const response = await authFetch("HorasExtras/CalcularAutomatico", { method: "POST", body: JSON.stringify(resultado.value) });
  const data = await response.json();
  if (!response.ok) return MostrarErrorCatch();
  await ObtenerHorasExtras(false);
  ToastHoraExtra("¡Se Generó Horas Extras!");
}

function AbrirModalAccionHoraExtra(id) {
  Swal.fire({
    title: "Acción sobre la hora extra",
    html: `
      <p class="swal2-content-center">¿Deseás aprobar o rechazar esta hora extra?</p>
      <p class="swal2-content-center">Esta acción actualizará el estado de la hora extra en el sistema.</p>
    `,
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Sí, aprobar",
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
  }).then((resultado) => {
    if (resultado.isConfirmed) {
      CambiarEstadoHoraExtra(id, 2);
    } else if (resultado.isDenied) {
      CambiarEstadoHoraExtra(id, 3);
    } else if (resultado.dismiss === Swal.DismissReason.cancel) {
      ToastAccionCanceladaHoraExtra();
    }
  });
}

async function CambiarEstadoHoraExtra(id, estado) {
  const response = await authFetch(`HorasExtras/${id}/Estado/${estado}`, { method: "PUT" });
  if (!response.ok) return MostrarErrorCatch();
  await ObtenerHorasExtras(false);
  if (estado === 3) {
    ToastHoraExtraRechazada();
  } else if (estado === 4) {
    ToastHoraExtra("¡Hora Extra Anulada!");
  } else {
    ToastHoraExtra("¡Hora Extra Aprobada!");
  }
}

function ToastAccionCanceladaHoraExtra() {
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

function ToastHoraExtraRechazada() {
  Swal.fire({
    title: "¡Hora Extra Rechazada!",
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
    background: "#fff5f5",
    color: "#1c3d26",
    icon: "error",
    iconColor: "#dc3545d8",
    customClass: {
      popup: "swal2-toast-rechazada",
      title: "swal2-toast-rechazada-title",
      icon: "swal2-toast-rechazada-icon",
    },
  });
}

async function EliminarHoraExtra(id) {
  const resultado = await Swal.fire({ title: "¿Desea eliminar esta hora extra?", html: "<div class='text-center'><p>Será eliminada de forma definitiva. ¿Desea continuar?</p><p>Esta acción no se puede deshacer.</p></div>", showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar", customClass: { popup: "swal2-border-radius", confirmButton: "swal2-btn-eliminar", cancelButton: "swal2-btn-cancelar" } });
  if (!resultado.isConfirmed) return;
  const response = await authFetch(`HorasExtras/${id}`, { method: "DELETE" });
  if (!response.ok) return MostrarErrorCatch();
  await ObtenerHorasExtras(false); ToastHoraExtra("¡Hora Extra Eliminada!");
}

function ToastHoraExtra(titulo) {
  Swal.fire({ title: titulo, toast: true, position: "bottom-end", showConfirmButton: false, timer: 2200, timerProgressBar: true, background: "#f4fff7", color: "#1c3d26", icon: "success", iconColor: "#28a746d8", customClass: { popup: "swal2-toast-success", title: "swal2-toast-success-title", icon: "swal2-toast-success-icon" } });
}

["MotivoHoraExtra", "ObservacionesHoraExtra"].forEach((id) => document.getElementById(id).addEventListener("input", function () { this.value = this.value.toUpperCase(); }));

Promise.all([CargarEmpleadosHorasExtras(), ObtenerHorasExtras()]);
