var misHorasExtrasData = [];

async function ObtenerMisHorasExtras(mostrarSpinner = true) {
  if (mostrarSpinner) mostrarPantallaCarga();
  try {
    const params = new URLSearchParams();
    if ($("#MisHorasDesde").val()) params.set("desde", $("#MisHorasDesde").val());
    if ($("#MisHorasHasta").val()) params.set("hasta", $("#MisHorasHasta").val());
    const response = await authFetch(`HorasExtras/MisHorasExtras?${params}`);
    if (!response.ok) throw new Error();
    misHorasExtrasData = await response.json();
    MostrarMisHorasExtras();
  } catch (error) { MostrarErrorCatch(); }
  finally { if (mostrarSpinner) setTimeout(() => ocultarPantallaCarga(), 1200); }
}

function MostrarMisHorasExtras() {
  const minutos = misHorasExtrasData.reduce((total, h) => total + h.minutos, 0);
  $("#misHorasTotal").text(`${Math.floor(minutos / 60)}:${String(minutos % 60).padStart(2, "0")}`);
  $("#misHorasPendientes").text(misHorasExtrasData.filter((h) => h.estado === "PENDIENTE").length);
  $("#misHorasAprobadas").text(misHorasExtrasData.filter((h) => h.estado === "APROBADA").length);
  const contenedor = $("#contenedorMisHorasExtras").empty();
  if (!misHorasExtrasData.length) return contenedor.append("<div class='col-12 text-center text-muted py-3'>No hay horas extras para mostrar.</div>");
  const bordes = { PENDIENTE: "#ffc107", APROBADA: "#198754", RECHAZADA: "#dc3545", ANULADA: "#6c757d" };
  misHorasExtrasData.forEach((item) => contenedor.append(`
    <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex">
      <div class="card shadow-sm p-2 rounded d-flex flex-column w-100" style="border-bottom:4px solid ${bordes[item.estado]};min-height:180px;">
        <div class="d-flex justify-content-between mb-2"><h5 class="fw-bold mb-0" style="font-size:1rem;">${new Date(item.fecha).toLocaleDateString("es-AR")}</h5><span class="badge bg-light text-dark">${item.estado}</span></div>
        <p class="mb-1 text-muted"><i class="bi bi-clock me-2"></i>${item.horaInicio.slice(0,5)} - ${item.horaFin.slice(0,5)}</p>
        <p class="mb-1 fw-bold"><i class="bi bi-hourglass-split me-2"></i>${item.horasString} hs</p>
        <p class="mb-1 text-muted text-truncate">${EscaparHtmlMisHoraExtra(item.motivo)}</p>
        <span class="badge bg-primary-subtle text-primary align-self-start">${item.origen}</span>
      </div>
    </div>`));
}

function EscaparHtmlMisHoraExtra(valor) {
  return $("<div>").text(valor || "").html();
}

$("#MisHorasDesde, #MisHorasHasta").on("change", () => ObtenerMisHorasExtras(false));
ObtenerMisHorasExtras();
