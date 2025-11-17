
////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIO DE VARIABLES PARA LOS DATOS DE LA API /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
var asistenciasData = [];


/////////////////////////////////////////////////////////////
//INICIO ONCHANGE DE FILTROS ////////////////////////////////
/////////////////////////////////////////////////////////////
$("#EmpleadoIdBuscar, #DniBuscar, #NroLegajoBuscar, #EstadoAsistenciaBuscar, #FechaBuscar")
    .on("input change", () => {
        ObtenerAsistencias();
        ObtenerTotalAsitenciasHoy();
    });


/////////////////////////////////////////////////////////////
// OBTENER DATOS DE LA API /////////////////////////////////////
/////////////////////////////////////////////////////////////
async function ObtenerAsistencias() {
    try {
        let estadoAsistencia = document.getElementById("EstadoAsistenciaBuscar").value;
        if (estadoAsistencia === "0") estadoAsistencia = null;
        else estadoAsistencia = Number(estadoAsistencia);

        let dniEmpleado = document.getElementById("DniBuscar").value;
        let nroLegajo = document.getElementById("NroLegajoBuscar").value;
        let fechaFiltro = document.getElementById("FechaBuscar").value;

        const asistenciasFiltradas = {
            nombreCompleto: document.getElementById("EmpleadoIdBuscar").value,
            DNI: dniEmpleado ? Number(dniEmpleado) : null,
            nroLegajo: nroLegajo,
            fecha: fechaFiltro ? fechaFiltro : null,
            estadoAsistencia: estadoAsistencia
        };

        const response = await authFetch("Asistencias/FiltrarDia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(asistenciasFiltradas)
        });

        const data = await response.json();

        let fechaMostrar;
        if (fechaFiltro) {
            const partes = fechaFiltro.split("-");
            fechaMostrar = new Date(partes[0], partes[1] - 1, partes[2]);
        } else {
            fechaMostrar = new Date();
        }

        const opcionesFecha = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        const fechaFormateada = fechaMostrar.toLocaleDateString("es-AR", opcionesFecha);
        const fechaCap = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

        $("#tituloAsistencias").html(`
            <i class="bi bi-calendar3"></i>
            <span class="fw-bold">Asistencias del Día:</span>
            <small class="text-muted">"${fechaCap}"</small>
        `);

        MostrarAsistencias(data);

    } catch (error) {
        MostrarErrorCatch();
    }
}


/////////////////////////////////////////////////////////////
/// MOSTRAR DATOS DE LA API /////////////////////////////////////
/////////////////////////////////////////////////////////////
function MostrarAsistencias(data) {
    const contenedor = $("#asistenciasContainer");
    contenedor.empty();

    asistenciasData = data;

    if (!data || data.length === 0) {
        contenedor.append(`<div class="col-12 text-center text-muted">No hay asistencias para mostrar.</div>`);
        return;
    }

    const EstadoAsistenciaEstilo = {
        COMPLETA: {
            backgroundColor: "#a3dc9a72",
            color: "#06923E"
        },
        INCOMPLETA: {
            backgroundColor: "#fff3cd",
            color: "#856404"
        },
        AUSENTE: {
            backgroundColor: "#f8d7da",
            color: "#c62828"
        },
        TARDE: {
            backgroundColor: "#ffe5d0",
            color: "#d35400"
        },
        "FUERA DE HORARIO": {
            backgroundColor: "#e2e3e5",
            color: "#495057"
        }
    };

    const badgeBaseClass = "badge fw-bold fs-6 mb-2";

    data.forEach((item) => {
        let estadoRaw = item.estadoString || "";
        let estado = estadoRaw.trim().toUpperCase();

        if (estado.replace(/\s+/g, "") === "FUERADEHORARIO") estado = "FUERA DE HORARIO";

        const estilo = EstadoAsistenciaEstilo[estado] || {
            backgroundColor: "#e2e3e5",
            color: "#495057"
        };

        const nombre = item.empleadoString || "Sin nombre";
        const foto = item.fotoUrl || "img/default.png";

        contenedor.append(`
            <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex">
                <div class="card shadow-sm p-2 rounded-3 text-center w-100" 
                     style="min-height: 260px; border-bottom: 4px solid ${estilo.color};">
                    <img src="${foto}" alt="Foto" class="card-img-top" 
                         style="height: 180px; object-fit: cover; border-radius: 12px 12px 0 0;">
                    <div class="card-body py-2 d-flex flex-column justify-content-center">
                        <h5 class="card-title mb-1" 
                            style="font-size: 1rem; font-weight:bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" 
                            title="${nombre}">${nombre}</h5>
                        <span class="${badgeBaseClass}" style="background-color: ${estilo.backgroundColor}; color: ${estilo.color};">
                            ${estado}
                        </span>
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



/////////////////////////////////////////////////////////////
// MOSTRAR DETALLE DE LOS ASISTENCIAS POR ID ////////////////////
/////////////////////////////////////////////////////////////
function MostrarDetalleAsistencia(id) {
    const asistencia = asistenciasData.find(a => a.id === id);
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

    const EstadoAsistenciaEstilo = {
        COMPLETA: {
            backgroundColor: "#a3dc9a72",
            color: "#06923E"
        },
        INCOMPLETA: {
            backgroundColor: "#fff3cd",
            color: "#856404"
        },
        AUSENTE: {
            backgroundColor: "#f8d7da",
            color: "#c62828"
        },
        TARDE: {
            backgroundColor: "#ffe5d0",
            color: "#d35400"
        },
        "FUERA DE HORARIO": {
            backgroundColor: "#e2e3e5",
            color: "#495057"
        }
    };

    let estado = (asistencia.estadoString || "").toUpperCase().trim();
    if (estado.replace(/\s+/g, "") === "FUERADEHORARIO") estado = "FUERA DE HORARIO";

    const estiloEstado = EstadoAsistenciaEstilo[estado] || {
        backgroundColor: "#e2e3e5",
        color: "#495057"
    };

    $("#detalleEstadoAsistencia").empty().append(
        $("<span>", {
            class: "badge fw-bold fs-6",
            text: estado,
            style: `background-color:${estiloEstado.backgroundColor}; color:${estiloEstado.color}; display:inline-block; padding:4px 8px; border-radius:4px;`
        })
    );

    new bootstrap.Offcanvas(document.getElementById('offcanvasDetalleAsistencia')).show();
}




//////////////////////////////////////////////////////////////
// GENERAR INFORME PDF DE ASISTENCIAS //////////////////////////
//////////////////////////////////////////////////////////////
async function GenerarInformePdfAsistencias() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    let estadoAsistencia = document.getElementById("EstadoAsistenciaBuscar").value;
    if (estadoAsistencia === "0") estadoAsistencia = null;
    else estadoAsistencia = Number(estadoAsistencia);

    let dniEmpleado = document.getElementById("DniBuscar").value;
    let nroLegajo = document.getElementById("NroLegajoBuscar").value;
    let fechaFiltro = document.getElementById("FechaBuscar").value;

    const filtro = {
        NombreCompleto: document.getElementById("EmpleadoIdBuscar").value,
        DNI: dniEmpleado ? Number(dniEmpleado) : null,
        NroLegajo: nroLegajo,
        Fecha: fechaFiltro ? fechaFiltro : null,
        EstadoAsistencia: estadoAsistencia
    };

    const res = await authFetch("InformesGeneralesPdf/GenerarInformeAsistencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtro)
    });

    const { asistencias, resumen } = await res.json();

    let filtrosAplicadosArray = [];
    if (filtro.DNI) filtrosAplicadosArray.push(`[DNI: ${filtro.DNI}]`);
    if (filtro.NombreCompleto) filtrosAplicadosArray.push(`[Nombre: ${filtro.NombreCompleto}]`);
    if (filtro.NroLegajo) filtrosAplicadosArray.push(`[Legajo: ${filtro.NroLegajo}]`);
    if (filtro.Fecha) filtrosAplicadosArray.push(`[Fecha: ${new Date(filtro.Fecha).toLocaleDateString("es-AR")}]`);
    if (filtro.EstadoAsistencia !== null) {
        const estadoTexto =
            filtro.EstadoAsistencia === 1 ? "Completa" :
                filtro.EstadoAsistencia === 2 ? "Incompleta" :
                    filtro.EstadoAsistencia === 3 ? "Ausente" :
                        filtro.EstadoAsistencia === 4 ? "Tarde" :
                            filtro.EstadoAsistencia === 5 ? "Fuera de Horario" :
                                "Desconocido";
        filtrosAplicadosArray.push(`[Estado: ${estadoTexto}]`);
    }
    const filtrosAplicados =
        filtrosAplicadosArray.length > 0 ? filtrosAplicadosArray.join("  |  ") : "No se aplicaron";

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Asistencias", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    let y = 29;
    const fechaHoy = new Date().toLocaleString("es-AR");

    doc.text("Generado:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(fechaHoy, 33, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.text("Total Asistencias:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${resumen.total}`, 45, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Ausentes:", 48, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${resumen.ausentes}`, 68, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Llegadas Tarde:", 72, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${resumen.llegadasTarde}`, 103, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Total Horas Trabajadas:", 107, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${resumen.totalHorasTrabajadas.toFixed(2)} hs`, 152, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.text("Filtros Aplicados:", 14, y);
    doc.setFont("helvetica", "bold");
    const filtrosText = doc.splitTextToSize(filtrosAplicados, 260);
    doc.text(filtrosText, 44, y);
    y += filtrosText.length * 6 + 2;

    doc.setDrawColor(180);
    doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
    y += 7;

    if (asistencias.length === 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(180, 0, 0);
        doc.text("No hay resultados para los filtros aplicados.", doc.internal.pageSize.getWidth() / 2, y + 10, { align: "center" });
    } else {
        doc.autoTable({
            startY: y,
            head: [["Empleado", "Estado", "1° Entrada", "1° Salida", "2° Entrada", "2° Salida"]],
            body: asistencias.map(a => [
                a.empleadoNombre,
                a.estado,
                a.primerEntrada ? a.primerEntrada : "-",
                a.primerSalida ? a.primerSalida : "-",
                a.segundaEntrada ? a.segundaEntrada : "-",
                a.segundaSalida ? a.segundaSalida : "-"
            ]),
            styles: { font: "helvetica", fontSize: 10 },
            headStyles: { fillColor: [19, 115, 204], textColor: 255, fontStyle: "bold" },
            margin: { left: 14, right: 14 }
        });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10, { align: "left" });
        doc.text("www.WorkSync.com", doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);

    const html = `<html><head><title>Informe de Asistencias</title></head>
        <body class="pdf-body">
        <iframe class="pdf-frame" width="100%" height="100%" src="${url}"></iframe>
        </body></html>`;

    const w = window.open();
    w.document.open();
    w.document.write(html);
    w.document.close();

}




//////////////////////////////////////////////////////////////////////////////////////////
// INICILIAZMOS AL CARGAR LA VISTA /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
ObtenerAsistencias();





