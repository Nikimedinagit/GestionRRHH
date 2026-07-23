var recibosSueldoData = [];

function EscaparHtmlRecibo(valor) {
  const elemento = document.createElement("div");
  elemento.textContent = valor || "";
  return elemento.innerHTML;
}

async function CargarEmpleadosRecibos() {
  try {
    const response = await authFetch("Empleados/Activos", { method: "GET" });
    if (!response.ok) throw new Error();
    const empleados = await response.json();
    const opciones = empleados.map((e) =>
      `<option value="${e.id}">${EscaparHtmlRecibo(e.nombreCompleto)}</option>`).join("");
    document.getElementById("EmpleadoReciboSueldo").insertAdjacentHTML("beforeend", opciones);
  } catch {
    MostrarErrorCatch();
  }
}

function AbrirPanelReciboSueldo() {
  document.getElementById("formReciboSueldo").reset();
  document.getElementById("IdReciboSueldo").value = "";
  document.getElementById("tituloPanelReciboSueldo").textContent = "Formulario de Recibo de Sueldo";
  document.getElementById("PeriodoReciboSueldo").value = new Date().toISOString().slice(0, 7);
  LimpiarErroresRecibo();
  document.getElementById("panelReciboSueldo").classList.add("abierto");
  document.getElementById("fondoOscuro").classList.add("visible");
  setTimeout(() => document.getElementById("EmpleadoReciboSueldo").focus(), 250);
}

function EditarReciboSueldo(id) {
  const item = recibosSueldoData.find((recibo) => recibo.id === id);
  if (!item) return;

  document.getElementById("formReciboSueldo").reset();
  document.getElementById("IdReciboSueldo").value = item.id;
  document.getElementById("EmpleadoReciboSueldo").value = item.empleadoId;
  document.getElementById("PeriodoReciboSueldo").value = (item.periodo || "").slice(0, 7);
  document.getElementById("ObservacionesReciboSueldo").value = item.observaciones || "";
  document.getElementById("tituloPanelReciboSueldo").textContent = "Modificar Recibo de Sueldo";
  LimpiarErroresRecibo();
  document.getElementById("panelReciboSueldo").classList.add("abierto");
  document.getElementById("fondoOscuro").classList.add("visible");
}

function CerrarPanelReciboSueldo() {
  document.getElementById("panelReciboSueldo")?.classList.remove("abierto");
  document.getElementById("fondoOscuro")?.classList.remove("visible");
}

function LimpiarErroresRecibo() {
  ["EmpleadoReciboSueldo", "PeriodoReciboSueldo", "ArchivoReciboSueldo"].forEach((id) =>
    document.getElementById(id).classList.remove("is-invalid"));
  document.querySelectorAll("#formReciboSueldo .invalid-feedback").forEach((error) => {
    error.textContent = "";
    error.style.display = "none";
  });
}

function MostrarErrorRecibo(inputId, errorId, mensaje) {
  document.getElementById(inputId).classList.add("is-invalid");
  const error = document.getElementById(errorId);
  error.textContent = mensaje;
  error.style.display = "block";
}

async function ObtenerRecibosSueldo(mostrarSpinner = true) {
  if (mostrarSpinner) mostrarPantallaCarga();
  try {
    const params = new URLSearchParams();
    const empleado = document.getElementById("EmpleadoReciboBuscar")?.value.trim();
    const periodo = document.getElementById("PeriodoReciboBuscar")?.value;
    if (empleado) params.set("empleado", empleado);
    if (periodo) params.set("periodo", `${periodo}-01`);

    const response = await authFetch(`RecibosSueldo?${params}`);
    if (!response.ok) throw new Error();
    recibosSueldoData = await response.json();
    MostrarRecibosSueldo();
  } catch {
    MostrarErrorCatch();
  } finally {
    if (mostrarSpinner) {
      setTimeout(() => ocultarPantallaCarga(), 1200);
    }
  }
}

function MostrarRecibosSueldo() {
  const contenedor = document.getElementById("contenedorRecibosSueldo");
  document.getElementById("totalRecibosSueldo").textContent = recibosSueldoData.length;
  document.getElementById("totalEmpleadosRecibos").textContent =
    new Set(recibosSueldoData.map((recibo) => recibo.empleadoId)).size;
  document.getElementById("totalPeriodosRecibos").textContent =
    new Set(recibosSueldoData.map((recibo) => (recibo.periodo || "").slice(0, 7))).size;
  if (!recibosSueldoData.length) {
    contenedor.innerHTML = `<div class="col-12"><div class="alert alert-light border text-center text-muted">No hay recibos registrados para los filtros seleccionados.</div></div>`;
    return;
  }

  contenedor.innerHTML = recibosSueldoData.map((item) => {
    const periodoFecha = new Date(item.periodo);
    const periodo = periodoFecha.toLocaleDateString("es-AR", { month: "long", year: "numeric", timeZone: "UTC" });
    const fechaCarga = new Date(item.fechaCarga).toLocaleDateString("es-AR");
    return `
      <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex">
        <div class="card card-documento card-recibo-sueldo shadow-sm p-2 rounded position-relative d-flex flex-column w-100">
          <div class="flex-grow-1 d-flex flex-column">
            <div class="d-flex align-items-start mb-2">
              <h5 class="fw-bold mb-0 text-truncate" style="font-size:1rem;">${EscaparHtmlRecibo(item.empleadoString)}</h5>
            </div>
            <p class="mb-1 text-muted d-flex align-items-center text-capitalize" style="font-size:0.9rem;">
              <i class="bi bi-calendar3 me-2" style="font-size:1rem;"></i><span>${periodo}</span>
            </p>
            <p class="mb-1 text-muted d-flex align-items-center" style="font-size:0.9rem;">
              <i class="bi bi-clock-history me-2" style="font-size:1rem;"></i><span>Cargado: ${fechaCarga}</span>
            </p>
            <p class="text-muted d-flex align-items-center gap-2 mb-2">
              <button onclick="DescargarReciboSueldo(${item.id})" class="document-link d-flex align-items-center gap-1"
                data-tippy-content="${EscaparHtmlRecibo(item.documentoNombre)}"
                style="color:inherit; text-decoration:none; font-size:0.9rem; border:none; background:none; cursor:pointer;">
                <i class="bi bi-file-earmark-text" style="font-size:1rem;"></i><span>Descargar</span>
              </button>
            </p>
            ${item.observaciones ? `<p class="small text-muted border-top pt-2 mt-1 mb-0 text-truncate">${EscaparHtmlRecibo(item.observaciones)}</p>` : ""}
          </div>
          <div class="d-flex justify-content-end align-items-center mt-2">
            <button style="background:none; border:none;" onclick="EditarReciboSueldo(${item.id})" data-tippy-content="Editar"><i class="bi bi-pencil-square icono-editar"></i></button>
            <button style="background:none; border:none;" onclick="EliminarReciboSueldo(${item.id})" data-tippy-content="Eliminar"><i class="bi bi-trash icono-borrar"></i></button>
          </div>
        </div>
      </div>`;
  }).join("");

  tippy("[data-tippy-content]", { animation: "scale", theme: "mi-tema", delay: [100, 0] });
}

async function GuardarReciboSueldo() {
  LimpiarErroresRecibo();
  const empleadoId = document.getElementById("EmpleadoReciboSueldo").value;
  const periodo = document.getElementById("PeriodoReciboSueldo").value;
  const archivo = document.getElementById("ArchivoReciboSueldo").files[0];
  const id = Number(document.getElementById("IdReciboSueldo").value) || 0;
  let valido = true;
  if (!empleadoId) {
    MostrarErrorRecibo("EmpleadoReciboSueldo", "errorEmpleadoReciboSueldo", "Seleccione un empleado.");
    valido = false;
  }
  if (!periodo) {
    MostrarErrorRecibo("PeriodoReciboSueldo", "errorPeriodoReciboSueldo", "Seleccione el período.");
    valido = false;
  }
  if (!archivo && !id) {
    MostrarErrorRecibo("ArchivoReciboSueldo", "errorArchivoReciboSueldo", "Seleccione el recibo.");
    valido = false;
  } else if (archivo && !["pdf", "jpg", "jpeg", "png"].includes(archivo.name.split(".").pop().toLowerCase())) {
    MostrarErrorRecibo("ArchivoReciboSueldo", "errorArchivoReciboSueldo", "El recibo debe ser PDF, JPG, JPEG o PNG.");
    valido = false;
  } else if (archivo && archivo.size > 10 * 1024 * 1024) {
    MostrarErrorRecibo("ArchivoReciboSueldo", "errorArchivoReciboSueldo", "El archivo supera los 10 MB.");
    valido = false;
  }
  if (!valido) return;

  const formData = new FormData();
  formData.append("empleadoId", empleadoId);
  formData.append("periodo", periodo);
  formData.append("observaciones", document.getElementById("ObservacionesReciboSueldo").value.trim());
  if (archivo) formData.append("documento", archivo);

  mostrarOverlayGuardando();
  try {
    const response = await authFetch(id ? `RecibosSueldo/${id}` : "RecibosSueldo", {
      method: id ? "PUT" : "POST",
      body: formData
    });
    const data = await response.json();
    if (!response.ok) {
      const campos = {
        empleado: ["EmpleadoReciboSueldo", "errorEmpleadoReciboSueldo"],
        periodo: ["PeriodoReciboSueldo", "errorPeriodoReciboSueldo"],
        archivo: ["ArchivoReciboSueldo", "errorArchivoReciboSueldo"],
      };
      const [inputId, errorId] = campos[data.campo] || campos.archivo;
      MostrarErrorRecibo(inputId, errorId, data.mensaje || "Verificá los datos.");
      ocultarOverlayGuardando();
      return;
    }
    ocultarOverlayGuardando();
    CerrarPanelReciboSueldo();
    await ObtenerRecibosSueldo(false);
    MostrarToastRecibo(id ? "¡Recibo Modificado!" : "¡Recibo Creado!");
  } catch {
    ocultarOverlayGuardando();
    MostrarErrorCatch();
  }
}

async function DescargarReciboSueldo(id) {
  await DescargarArchivoRecibo(`RecibosSueldo/${id}/documento`);
}

async function DescargarArchivoRecibo(endpoint) {
  try {
    const response = await authFetch(endpoint);
    if (!response.ok) throw new Error();
    const blob = await response.blob();
    const disposicion = response.headers.get("content-disposition") || "";
    const coincidencia = disposicion.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
    const nombre = coincidencia ? decodeURIComponent(coincidencia[1].replace(/"/g, "")) : "recibo.pdf";
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  } catch {
    MostrarErrorCatch();
  }
}

async function EliminarReciboSueldo(id) {
  const confirmacion = await Swal.fire({
    title: "¿Desea eliminar este recibo de sueldo?",
    html: `
      <div class="text-center">
        <p>Este recibo será eliminado de forma definitiva. ¿Desea continuar?</p>
        <p>Esta acción no se puede deshacer.</p>
      </div>
    `,
    showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
    focusCancel: true,
    customClass: {
      popup: "swal2-border-radius",
      confirmButton: "swal2-btn-eliminar",
      cancelButton: "swal2-btn-cancelar",
      title: "swal2-title-custom",
      content: "swal2-content-custom",
    },
    background: "#fff", color: "#22223b"
  });
  if (!confirmacion.isConfirmed) {
    if (confirmacion.dismiss === Swal.DismissReason.cancel) {
      MostrarToastCancelacionRecibo();
    }
    return;
  }
  const response = await authFetch(`RecibosSueldo/${id}`, { method: "DELETE" });
  if (response.ok) {
    await ObtenerRecibosSueldo(false);
    MostrarToastRecibo("¡Recibo Eliminado!");
  } else MostrarErrorCatch();
}

function MostrarToastCancelacionRecibo() {
  Swal.fire({
    title: "Acción Cancelada",
    text: "Permanecerá activo.",
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

function MostrarToastRecibo(titulo) {
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

document.getElementById("EmpleadoReciboBuscar")
  .addEventListener("input", () => ObtenerRecibosSueldo(false));

document.getElementById("PeriodoReciboBuscar")
  .addEventListener("change", () => ObtenerRecibosSueldo(false));

document.getElementById("ObservacionesReciboSueldo").addEventListener("input", function () {
  const inicio = this.selectionStart;
  this.value = this.value.toUpperCase();
  this.setSelectionRange?.(inicio, inicio);
});

Promise.all([CargarEmpleadosRecibos(), ObtenerRecibosSueldo()]);
