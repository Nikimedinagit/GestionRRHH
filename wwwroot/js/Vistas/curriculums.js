var curriculumsData = [];

function EscaparHtmlCurriculum(valor) {
  const elemento = document.createElement("div");
  elemento.textContent = valor || "";
  return elemento.innerHTML;
}

function AbrirPanelCurriculum() {
  document.getElementById("formCurriculum").reset();
  document.getElementById("IdCurriculum").value = "";
  document.getElementById("tituloPanelCurriculum").textContent = "Formulario de CV";
  document.getElementById("FechaCurriculum").value = new Date().toISOString().slice(0, 10);
  LimpiarErroresCurriculum();
  document.getElementById("panelCurriculum").classList.add("abierto");
  document.getElementById("fondoOscuro").classList.add("visible");
  setTimeout(() => document.getElementById("NombreCurriculum").focus(), 250);
}

function EditarCurriculum(id) {
  const item = curriculumsData.find((curriculum) => curriculum.id === id);
  if (!item) return;

  document.getElementById("formCurriculum").reset();
  document.getElementById("IdCurriculum").value = item.id;
  document.getElementById("NombreCurriculum").value = item.nombreCompleto || "";
  document.getElementById("EmailCurriculum").value = item.email || "";
  document.getElementById("TelefonoCurriculum").value = item.telefono || "";
  document.getElementById("FechaCurriculum").value = (item.fechaRecepcion || "").slice(0, 10);
  document.getElementById("ObservacionesCurriculum").value = item.observaciones || "";
  document.getElementById("tituloPanelCurriculum").textContent = "Modificar Curriculum";
  LimpiarErroresCurriculum();
  document.getElementById("panelCurriculum").classList.add("abierto");
  document.getElementById("fondoOscuro").classList.add("visible");
}

function CerrarPanelCurriculum() {
  document.getElementById("panelCurriculum")?.classList.remove("abierto");
  document.getElementById("fondoOscuro")?.classList.remove("visible");
}

function LimpiarErroresCurriculum() {
  ["NombreCurriculum", "ArchivoCurriculum"].forEach((id) => {
    document.getElementById(id).classList.remove("is-invalid");
  });
  document.querySelectorAll("#formCurriculum .invalid-feedback").forEach((error) => {
    error.textContent = "";
    error.style.display = "none";
  });
}

function MostrarErrorCurriculum(inputId, errorId, mensaje) {
  document.getElementById(inputId).classList.add("is-invalid");
  const error = document.getElementById(errorId);
  error.textContent = mensaje;
  error.style.display = "block";
}

async function ObtenerCurriculums(mostrarSpinner = true) {
  if (mostrarSpinner) mostrarPantallaCarga();
  try {
    const params = new URLSearchParams();
    const nombre = document.getElementById("CurriculumBuscar")?.value.trim();
    const desde = document.getElementById("CurriculumDesde")?.value;
    const hasta = document.getElementById("CurriculumHasta")?.value;
    if (nombre) params.set("nombre", nombre);
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);

    const response = await authFetch(`Curriculums?${params}`);
    if (!response.ok) throw new Error();
    curriculumsData = await response.json();
    MostrarCurriculums();
  } catch {
    MostrarErrorCatch();
  } finally {
    if (mostrarSpinner) {
      setTimeout(() => ocultarPantallaCarga(), 1200);
    }
  }
}

function MostrarCurriculums() {
  const contenedor = document.getElementById("contenedorCurriculums");
  document.getElementById("totalCurriculums").textContent = curriculumsData.length;
  document.getElementById("totalCurriculumsContacto").textContent =
    curriculumsData.filter((curriculum) => curriculum.email || curriculum.telefono).length;

  const hoy = new Date();
  document.getElementById("totalCurriculumsMes").textContent = curriculumsData.filter((curriculum) => {
    const fecha = new Date(curriculum.fechaRecepcion);
    return fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth();
  }).length;

  if (!curriculumsData.length) {
    contenedor.innerHTML = `<div class="col-12"><div class="alert alert-light border text-center text-muted">No hay CV registrados para los filtros seleccionados.</div></div>`;
    return;
  }

  contenedor.innerHTML = curriculumsData.map((item) => {
    const fecha = new Date(item.fechaRecepcion).toLocaleDateString("es-AR");
    return `
      <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex">
        <div class="card card-documento card-curriculum shadow-sm p-2 rounded position-relative d-flex flex-column w-100">
          <div class="flex-grow-1 d-flex flex-column">
            <div class="d-flex align-items-start mb-2">
              <h5 class="fw-bold mb-0 text-truncate" style="font-size:1rem;">${EscaparHtmlCurriculum(item.nombreCompleto)}</h5>
            </div>
            <p class="mb-1 text-muted d-flex align-items-center" style="font-size:0.9rem;">
              <i class="bi bi-calendar3 me-2" style="font-size:1rem;"></i><span>${fecha}</span>
            </p>
            ${item.email ? `<p class="mb-1 text-muted d-flex align-items-center text-truncate" style="font-size:0.9rem;"><i class="bi bi-envelope me-2" style="font-size:1rem;"></i><span class="text-truncate">${EscaparHtmlCurriculum(item.email)}</span></p>` : ""}
            ${item.telefono ? `<p class="mb-1 text-muted d-flex align-items-center" style="font-size:0.9rem;"><i class="bi bi-telephone me-2" style="font-size:1rem;"></i><span>${EscaparHtmlCurriculum(item.telefono)}</span></p>` : ""}
            <p class="text-muted d-flex align-items-center gap-2 mb-2">
              <button onclick="DescargarCurriculum(${item.id})" class="document-link d-flex align-items-center gap-1"
                data-tippy-content="${EscaparHtmlCurriculum(item.documentoNombre)}"
                style="color:inherit; text-decoration:none; font-size:0.9rem; border:none; background:none; cursor:pointer;">
                <i class="bi bi-file-earmark-text" style="font-size:1rem;"></i><span>Descargar</span>
              </button>
            </p>
            ${item.observaciones ? `<p class="small text-muted border-top pt-2 mt-1 mb-0 text-truncate">${EscaparHtmlCurriculum(item.observaciones)}</p>` : ""}
          </div>
          <div class="d-flex justify-content-end align-items-center mt-2">
            <button style="background:none; border:none;" onclick="EditarCurriculum(${item.id})" data-tippy-content="Editar"><i class="bi bi-pencil-square icono-editar"></i></button>
            <button style="background:none; border:none;" onclick="EliminarCurriculum(${item.id})" data-tippy-content="Eliminar"><i class="bi bi-trash icono-borrar"></i></button>
          </div>
        </div>
      </div>`;
  }).join("");

  tippy("[data-tippy-content]", { animation: "scale", theme: "mi-tema", delay: [100, 0] });
}

async function GuardarCurriculum() {
  LimpiarErroresCurriculum();
  const nombre = document.getElementById("NombreCurriculum").value.trim();
  const archivo = document.getElementById("ArchivoCurriculum").files[0];
  const id = Number(document.getElementById("IdCurriculum").value) || 0;
  let valido = true;

  if (!nombre) {
    MostrarErrorCurriculum("NombreCurriculum", "errorNombreCurriculum", "Campo obligatorio.");
    valido = false;
  }
  if (!archivo && !id) {
    MostrarErrorCurriculum("ArchivoCurriculum", "errorArchivoCurriculum", "Seleccione un archivo.");
    valido = false;
  } else if (archivo && archivo.size > 10 * 1024 * 1024) {
    MostrarErrorCurriculum("ArchivoCurriculum", "errorArchivoCurriculum", "El archivo supera los 10 MB.");
    valido = false;
  }
  if (!valido) return;

  const formData = new FormData();
  formData.append("nombreCompleto", nombre);
  formData.append("email", document.getElementById("EmailCurriculum").value.trim());
  formData.append("telefono", document.getElementById("TelefonoCurriculum").value.trim());
  formData.append("fechaRecepcion", document.getElementById("FechaCurriculum").value);
  formData.append("observaciones", document.getElementById("ObservacionesCurriculum").value.trim());
  if (archivo) formData.append("documento", archivo);

  mostrarOverlayGuardando();
  try {
    const response = await authFetch(id ? `Curriculums/${id}` : "Curriculums", {
      method: id ? "PUT" : "POST",
      body: formData
    });
    const data = await response.json();
    if (!response.ok) {
      if (data.campo === "nombre") {
        MostrarErrorCurriculum("NombreCurriculum", "errorNombreCurriculum", data.mensaje);
      } else {
        MostrarErrorCurriculum("ArchivoCurriculum", "errorArchivoCurriculum", data.mensaje || "Verificá el archivo.");
      }
      ocultarOverlayGuardando();
      return;
    }
    ocultarOverlayGuardando();
    CerrarPanelCurriculum();
    await ObtenerCurriculums(false);
    MostrarToastDocumento(id ? "¡Curriculum Modificado!" : "¡Curriculum Creado!");
  } catch {
    ocultarOverlayGuardando();
    MostrarErrorCatch();
  }
}

async function DescargarCurriculum(id) {
  await DescargarArchivoDocumento(`Curriculums/${id}/documento`);
}

async function EliminarCurriculum(id) {
  const confirmacion = await Swal.fire({
    title: "¿Desea eliminar este CV?",
    html: `
      <div class="text-center">
        <p>Este CV será eliminado de forma definitiva. ¿Desea continuar?</p>
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
  if (!confirmacion.isConfirmed) return;
  const response = await authFetch(`Curriculums/${id}`, { method: "DELETE" });
  if (response.ok) {
    await ObtenerCurriculums(false);
    MostrarToastDocumento("¡Curriculum Eliminado!");
  } else MostrarErrorCatch();
}

function MostrarToastDocumento(titulo) {
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

async function DescargarArchivoDocumento(endpoint) {
  try {
    const response = await authFetch(endpoint);
    if (!response.ok) throw new Error();
    const blob = await response.blob();
    const disposicion = response.headers.get("content-disposition") || "";
    const coincidencia = disposicion.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
    const nombre = coincidencia ? decodeURIComponent(coincidencia[1].replace(/"/g, "")) : "documento";
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  } catch {
    MostrarErrorCatch();
  }
}

["CurriculumBuscar", "CurriculumDesde", "CurriculumHasta"].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => ObtenerCurriculums(false));
});

["NombreCurriculum", "ObservacionesCurriculum"].forEach((id) => {
  document.getElementById(id).addEventListener("input", function () {
    const inicio = this.selectionStart;
    this.value = this.value.toUpperCase();
    this.setSelectionRange?.(inicio, inicio);
  });
});

document.getElementById("EmailCurriculum").addEventListener("input", function () {
  const inicio = this.selectionStart;
  this.value = this.value.toLowerCase();
  this.setSelectionRange?.(inicio, inicio);
});

ObtenerCurriculums();
