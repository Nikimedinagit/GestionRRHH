var misRecibosSueldoData = [];

function EscaparHtmlMiRecibo(valor) {
  const elemento = document.createElement("div");
  elemento.textContent = valor || "";
  return elemento.innerHTML;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// METODO PARA OBTENER LOS RECIBOS DEL EMPLEADO //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerMisRecibosSueldo(mostrarSpinner = true) {
  if (mostrarSpinner) mostrarPantallaCarga();

  try {
    const params = new URLSearchParams();
    const periodo = document.getElementById("PeriodoMiReciboBuscar").value;
    if (periodo) params.set("periodo", `${periodo}-01`);

    const response = await authFetch(`RecibosSueldo/MisRecibos?${params}`);
    if (!response.ok) throw new Error();

    misRecibosSueldoData = await response.json();
    MostrarMisRecibosSueldo();
  } catch (error) {
    MostrarErrorCatch();
  } finally {
    if (mostrarSpinner) {
      setTimeout(() => ocultarPantallaCarga(), 1200);
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// METODO PARA MOSTRAR LAS CARDS DE RECIBOS //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarMisRecibosSueldo() {
  const contenedor = document.getElementById("contenedorMisRecibos");
  document.getElementById("totalMisRecibos").textContent = misRecibosSueldoData.length;
  document.getElementById("totalPeriodosMisRecibos").textContent =
    new Set(misRecibosSueldoData.map((recibo) => (recibo.periodo || "").slice(0, 7))).size;

  if (misRecibosSueldoData.length === 0) {
    contenedor.innerHTML =
      "<div class='col-12 text-center text-muted py-3'>No hay recibos de sueldo para mostrar.</div>";
    return;
  }

  contenedor.innerHTML = misRecibosSueldoData.map((item) => {
    const periodo = new Date(item.periodo).toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    });
    const fechaCarga = new Date(item.fechaCarga).toLocaleDateString("es-AR");

    return `
      <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex">
        <div class="card card-documento card-recibo-sueldo shadow-sm p-2 rounded position-relative d-flex flex-column w-100">
          <div class="flex-grow-1 d-flex flex-column">
            <div class="d-flex align-items-start mb-2">
              <h5 class="fw-bold mb-0 text-capitalize" style="font-size:1rem;">${periodo}</h5>
            </div>
            <p class="mb-1 text-muted d-flex align-items-center" style="font-size:0.9rem;">
              <i class="bi bi-clock-history me-2" style="font-size:1rem;"></i>
              <span>Cargado: ${fechaCarga}</span>
            </p>
            <p class="text-muted d-flex align-items-center gap-2 mb-2">
              <button onclick="DescargarMiReciboSueldo(${item.id})"
                class="document-link d-flex align-items-center gap-1"
                data-tippy-content="${EscaparHtmlMiRecibo(item.documentoNombre || "Recibo")}"
                style="color:inherit; text-decoration:none; font-size:0.9rem; border:none; background:none; cursor:pointer;">
                <i class="bi bi-file-earmark-text" style="font-size:1rem;"></i>
                <span>Descargar</span>
              </button>
            </p>
            ${item.observaciones
              ? `<p class="small text-muted border-top pt-2 mt-1 mb-0 text-truncate">${EscaparHtmlMiRecibo(item.observaciones)}</p>`
              : ""}
          </div>
        </div>
      </div>
    `;
  }).join("");

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// METODO PARA DESCARGAR UN RECIBO ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function DescargarMiReciboSueldo(id) {
  try {
    const response = await authFetch(`RecibosSueldo/MisRecibos/${id}/documento`);
    if (!response.ok) throw new Error();

    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition");
    let nombreArchivo = "recibo";

    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?([^;\r\n]+)/i);
      if (match && match[1]) {
        nombreArchivo = decodeURIComponent(match[1].replace(/['"]/g, ""));
      }
    }

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    MostrarErrorCatch();
  }
}

document.getElementById("PeriodoMiReciboBuscar")
  .addEventListener("change", () => ObtenerMisRecibosSueldo(false));

ObtenerMisRecibosSueldo();
