let asistenciasData = []; 

const btnToggleSemana = document.getElementById('btnToggleSemana');
const textToggleSemana = document.getElementById('textToggleSemana');

let mostrandoSemana = false;

btnToggleSemana.addEventListener('click', () => {
    mostrandoSemana = !mostrandoSemana;

    if (mostrandoSemana) {
        textToggleSemana.textContent = "Ver Hoy";
        ObtenerAsistenciasSemana();
    } else {
        textToggleSemana.textContent = "Ver Semana";
        ObtenerAsistenciasHoy();
    }
});


async function ObtenerAsistenciasHoy() {
  const hoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hoyCap = hoy.charAt(0).toUpperCase() + hoy.slice(1);

  $("#tituloAsistencias").html(`
    <i class="bi bi-calendar3"></i>
    <span class="fw-bold">Asistencias del Día:</span>
    <small class="text-muted">"${hoyCap}"</small>
  `);

  try {
    const response = await authFetch("Asistencias/Hoy");
    const data = await response.json();
    MostrarAsistencias(data);
  } catch (error) {
    MostrarErrorCatch();
  }
}

function MostrarAsistencias(data) {
  const contenedor = $("#asistenciasContainer");
  contenedor.empty();

  if (!data || data.length === 0) {
    contenedor.append(`<div class="col-12 text-center text-muted">No hay asistencias para mostrar.</div>`);
    return;
  }

  const EstadoAsistenciaBadge = {
    COMPLETA: "bg-success text-white fw-bold fs-6",
    INCOMPLETA: "bg-warning text-white fw-bold fs-6",
    AUSENTE: "bg-danger text-white fw-bold fs-6",
    TARDE: "bg-orange text-white fw-bold fs-6",
    "FUERA DE HORARIO": "bg-secondary text-white fw-bold fs-6",
  };

  const EstadoAsistenciaColor = {
    COMPLETA: "#28a745",
    INCOMPLETA: "#ffc107",
    AUSENTE: "#dc3545",
    TARDE: "#fd7e14",
    "FUERA DE HORARIO": "#6c757d",
  };

  asistenciasData = data;

  data.forEach((item) => {
    let estado = item.estadoString.toUpperCase().replace(/\s+/g, "");
    if (estado === "FUERADEHORARIO") estado = "FUERA DE HORARIO";

    const colorBorde = EstadoAsistenciaColor[estado];
    const claseEstado = EstadoAsistenciaBadge[estado];

    const nombre = item.empleadoString || "Sin nombre";

    contenedor.append(`
      <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex">
          <div class="card shadow-sm p-2 rounded-3 text-center w-100" 
               style="min-height: 260px; border-bottom: 4px solid ${colorBorde};">
              <img src="${item.fotoUrl || "img/default.png"}" alt="Foto" class="card-img-top" 
                   style="height: 180px; object-fit: cover; border-radius: 12px 12px 0 0;">
              <div class="card-body py-2 d-flex flex-column justify-content-center">
                  <h5 class="card-title mb-1" 
                      style="font-size: 1rem; font-weight:bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" 
                      title="${nombre}">${nombre}</h5>
                  <span class="badge ${claseEstado} mb-2">${estado}</span>
                  <button class="btn-ver" 
                          style="background: none; border: none; cursor: pointer;" 
                          onclick="MostrarDetalleAsistencia(${item.id})" 
                          data-tippy-content="Ver más">
                      <i class="bi bi-info-circle btn-sm iocno-ver-asistencia"></i>
                  </button>
              </div>
          </div>
      </div>
    `);
  });

  tippy("[data-tippy-content]", { animation: "scale", theme: "mi-tema", delay: [100, 0] });
}

function MostrarDetalleAsistencia(idAsistencia) {
    const asistencia = asistenciasData.find(a => a.id === idAsistencia);
    if (!asistencia) return;

    $("#detalleNombre").text(asistencia.empleadoString || "Sin nombre");
    $("#detalleLegajoAsistencia").text(asistencia.nroLegajo || "-");

    $("#detallePrimerEntradaAsistencia").text(asistencia.primerEntradaString || "-");
    $("#detallePrimerSalidaAsistencia").text(asistencia.primerSalidaString || "-");

    const isAlterno = (asistencia.tipoHorario || "").toUpperCase() === "ALTERNO";
    if (isAlterno) {
        $("#detalleSegundaEntradaAsistencia").text(asistencia.segundaEntradaString || "-");
        $("#detalleSegundaSalidaAsistencia").text(asistencia.segundaSalidaString || "-");
        $("#filaSegundaEntrada, #filaSegundaSalida").show();
    } else {
        $("#filaSegundaEntrada, #filaSegundaSalida").hide();
    }

    const tipoColor = { CONTINUO: "bg-continuo", ALTERNO: "bg-alterno" };
    const tipoHorario = (asistencia.tipoHorario || "CONTINUO").toUpperCase();
    const badgeTipoHorario = `
        <div class="text-center mt-1 mb-1">
            <span class="badge ${tipoColor[tipoHorario] || 'bg-secondary'}">${tipoHorario}</span>
        </div>
    `;
    $("#detalleTipoHorarioAsistencia").empty().append(badgeTipoHorario);

    const EstadoAsistenciaBadge = {
        COMPLETA: "bg-success text-white fw-bold fs-6",
        INCOMPLETA: "bg-warning text-white fw-bold fs-6",
        AUSENTE: "bg-danger text-white fw-bold fs-6",
        TARDE: "bg-orange text-white fw-bold fs-6",
        "FUERA DE HORARIO": "bg-secondary text-white fw-bold fs-6",
    };
    let estado = (asistencia.estadoString || "").toUpperCase();
    if (estado === "FUERADEHORARIO") estado = "FUERA DE HORARIO";

    $("#detalleEstadoAsistencia").empty().append(
        $("<span>", {
            class: EstadoAsistenciaBadge[estado] || "bg-secondary text-white fw-bold fs-6",
            text: estado,
            style: "display:inline-block; padding:4px 8px; border-radius:4px;"
        })
    );

    new bootstrap.Offcanvas(document.getElementById('offcanvasDetalleAsistencia')).show();
}













async function ObtenerAsistenciasSemana() {
  const hoy = new Date();
  const primerDia = new Date(hoy);
  primerDia.setDate(hoy.getDate() - hoy.getDay() + 1); // lunes
  const ultimoDia = new Date(primerDia);
  ultimoDia.setDate(primerDia.getDate() + 6); // domingo

  const opciones = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
  const rangoSemana = `${primerDia.toLocaleDateString("es-AR", opciones)} - ${ultimoDia.toLocaleDateString("es-AR", opciones)}`;

  // Capitalizamos la primera letra de cada palabra
  const rangoSemanaCap = rangoSemana.replace(/\b\w/g, l => l.toUpperCase());

  $("#tituloAsistencias").html(`
    <i class="bi bi-calendar3"></i>
    <span class="fw-bold">Asistencias de la Semana:</span>
    <small class="text-muted">"${rangoSemanaCap}"</small>
  `);

  try {
    const response = await authFetch("Asistencias/Semana"); 
    const data = await response.json();
    asistenciasData = data;
    MostrarAsistenciasSemana(data);
  } catch (error) {
    MostrarErrorCatch();
  }
}

function MostrarAsistenciasSemana(data) {
    const contenedor = $("#asistenciasContainer");
    contenedor.empty();

    if (!data || data.length === 0) {
        contenedor.append(`<div class="col-12 text-center text-muted">No hay asistencias para mostrar.</div>`);
        return;
    }

    const EstadoAsistenciaBadge = {
        COMPLETA: "bg-success text-white fw-bold fs-6",
        INCOMPLETA: "bg-warning text-white fw-bold fs-6",
        AUSENTE: "bg-danger text-white fw-bold fs-6",
        TARDE: "bg-orange text-white fw-bold fs-6",
        "FUERA DE HORARIO": "bg-secondary text-white fw-bold fs-6",
    };

    const EstadoAsistenciaColor = {
        COMPLETA: "#28a745",
        INCOMPLETA: "#ffc107",
        AUSENTE: "#dc3545",
        TARDE: "#fd7e14",
        "FUERA DE HORARIO": "#6c757d",
    };

    asistenciasData = data;

    data.forEach((item) => {
        let estado = item.estadoString.toUpperCase().replace(/\s+/g, "");
        if (estado === "FUERADEHORARIO") estado = "FUERA DE HORARIO";

        const colorBorde = EstadoAsistenciaColor[estado];
        const claseEstado = EstadoAsistenciaBadge[estado];

        const nombre = item.empleadoString || "Sin nombre";

        contenedor.append(`
            <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex">
                <div class="card shadow-sm p-2 rounded-3 text-center w-100" 
                     style="min-height: 260px; border-bottom: 4px solid ${colorBorde};">
                    <img src="${item.fotoUrl || "img/default.png"}" alt="Foto" class="card-img-top" 
                         style="height: 180px; object-fit: cover; border-radius: 12px 12px 0 0;">
                    <div class="card-body py-2 d-flex flex-column justify-content-center">
                        <h5 class="card-title mb-1" 
                            style="font-size: 1rem; font-weight:bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" 
                            title="${nombre}">${nombre}</h5>
                        <span class="badge ${claseEstado} mb-2">${estado}</span>
                        <button class="btn-ver" 
                                style="background: none; border: none; cursor: pointer;" 
                                onclick="MostrarDetalleSemana('${nombre}')" 
                                data-tippy-content="Ver más">
                            <i class="bi bi-info-circle btn-sm iocno-ver-asistencia"></i>
                        </button>
                    </div>
                </div>
            </div>
        `);
    });

    tippy("[data-tippy-content]", { animation: "scale", theme: "mi-tema", delay: [100, 0] });
}




function MostrarDetalleSemana(nombreEmpleado) {
    const registros = asistenciasData.filter(a => a.empleadoString === nombreEmpleado);
    if (!registros || registros.length === 0) return;

    // Función para convertir "dd/MM/yyyy" a Date
    function parsearFecha(fechaString) {
        const partes = fechaString.split("/"); 
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1;
        const anio = parseInt(partes[2], 10);
        return new Date(anio, mes, dia);
    }

    // Ordenar registros por fecha
    registros.sort((a, b) => parsearFecha(a.fechaString) - parsearFecha(b.fechaString));

    // Datos del empleado
    $("#detalleNombreSemana").text(nombreEmpleado);
    $("#detalleLegajoSemana").text(registros[0].nroLegajo || "-");

    const contenedorDias = $("#contenedorDiasSemana");
    contenedorDias.empty();

    // --- FECHA FIJA DE REFERENCIA ---
    const fechaReferencia = new Date(2025, 8, 1); // 01/09/2025, mes 0-indexed

    // Calcular lunes y domingo de la semana de referencia
    const diaSemana = fechaReferencia.getDay() || 7; // domingo=7
    const lunes = new Date(fechaReferencia);
    lunes.setDate(fechaReferencia.getDate() - diaSemana + 1);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    // Número de semana del año ISO
    function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    }

    const semanaNumero = getWeekNumber(fechaReferencia);

    // Función para formatear fechas completas dd/MM/yyyy
    function formatDate(d) {
        return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    }

    $("#detalleSemanaNumero").text(`Semana N° ${semanaNumero}`);
    $("#detalleRangoSemana").text(`${formatDate(lunes)} - ${formatDate(domingo)}`);

    const EstadoAsistenciaBadge = {
        COMPLETA: "bg-success text-white fw-bold fs-6",
        INCOMPLETA: "bg-warning text-white fw-bold fs-6",
        AUSENTE: "bg-danger text-white fw-bold fs-6",
        TARDE: "bg-orange text-white fw-bold fs-6",
        "FUERA DE HORARIO": "bg-secondary text-white fw-bold fs-6",
    };

    const EstadoAsistenciaColor = {
        COMPLETA: "#28a745",
        INCOMPLETA: "#ffc107",
        AUSENTE: "#dc3545",
        TARDE: "#fd7e14",
        "FUERA DE HORARIO": "#6c757d",
    };

    const row = $('<div class="row g-3"></div>');

    registros.forEach(r => {
        let estado = (r.estadoString || "").toUpperCase();
        if (estado === "FUERADEHORARIO") estado = "FUERA DE HORARIO";

        const colorBorde = EstadoAsistenciaColor[estado] || "#6c757d";
        const claseBadge = EstadoAsistenciaBadge[estado] || "bg-secondary text-white fw-bold fs-6";

        // Determinar si es horario alterno (2da entrada registrada)
        const isAlterno = r.segundaEntradaString && r.segundaEntradaString !== "-";

        // Mostrar día de la semana y número
        const fechaObj = parsearFecha(r.fechaString);
        const diaNombre = fechaObj.toLocaleDateString("es-ES", { weekday: "long" });
        const diaNumero = fechaObj.getDate();
        const tituloDia = `${diaNombre} ${diaNumero}`;

        const col = $(`  
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="detalle-asistencia-semana-tarjeta h-100" 
                     style="border-left: 4px solid ${colorBorde}; min-height: ${isAlterno ? 160 : 110}px;">
                    <div class="detalle-asistencia-semana-seccion p-2">
                        <p class="detalle-asistencia-semana-titulo-seccion fw-bold mb-3 text-center text-capitalize">
                            ${tituloDia}
                        </p>
                        <div class="detalle-asistencia-semana-fila">
                            <span class="detalle-asistencia-semana-etiqueta">Primer Entrada:</span>
                            <span class="detalle-asistencia-semana-valor">${r.primerEntradaString || "-"}</span>
                        </div>
                        <div class="detalle-asistencia-semana-fila">
                            <span class="detalle-asistencia-semana-etiqueta">Primer Salida:</span>
                            <span class="detalle-asistencia-semana-valor">${r.primerSalidaString || "-"}</span>
                        </div>
                        ${isAlterno ? `
                        <div class="detalle-asistencia-semana-fila">
                            <span class="detalle-asistencia-semana-etiqueta">Segunda Entrada:</span>
                            <span class="detalle-asistencia-semana-valor">${r.segundaEntradaString || "-"}</span>
                        </div>
                        <div class="detalle-asistencia-semana-fila">
                            <span class="detalle-asistencia-semana-etiqueta">Segunda Salida:</span>
                            <span class="detalle-asistencia-semana-valor">${r.segundaSalidaString || "-"}</span>
                        </div>` : ""}
                        <div class="detalle-asistencia-semana-fila text-center mt-3">
                            <span class="badge ${claseBadge}">${estado}</span>
                        </div>
                    </div>
                </div>
            </div>
        `);

        row.append(col);
    });

    contenedorDias.append(row);

    // Estado general de la semana
    const estadosDias = registros.map(r => r.estadoString.toUpperCase());
    let estadoSemana;
    if (estadosDias.every(e => e === "COMPLETA")) estadoSemana = "COMPLETA";
    else if (estadosDias.every(e => e === "TARDE")) estadoSemana = "TARDE";
    else if (estadosDias.every(e => e === "AUSENTE")) estadoSemana = "AUSENTE";
    else if (estadosDias.includes("FUERADEHORARIO")) estadoSemana = "FUERA DE HORARIO";
    else estadoSemana = "INCOMPLETA";

    const claseGeneral = EstadoAsistenciaBadge[estadoSemana] || "bg-secondary text-white fw-bold fs-6";

    $("#detalleEstadoSemana").html(`
        <span class="badge ${claseGeneral}" style="display:inline-block; padding:4px 8px; border-radius:4px;">
            ${estadoSemana}
        </span>
    `);

    // Mostrar offcanvas
    new bootstrap.Offcanvas(document.getElementById('offcanvasDetalleAsistenciaSemana')).show();
}











// ------------------- INICIALIZAR -------------------
ObtenerAsistenciasHoy();
