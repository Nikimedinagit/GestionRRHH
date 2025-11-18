// =========================================================================================
// =============== Inicializar Filtros al Cargar la Página =================================
// =========================================================================================
$(document).ready(function () {

    ObtenerJustificacionesPorSector();

    $("#FechaInicioBuscar, #FechaFinBuscar, #EstadoJustificacionBuscar").on("change", function () {

        let fechaInicioRaw = $("#FechaInicioBuscar").val();
        let fechaFinRaw = $("#FechaFinBuscar").val();

        if (fechaInicioRaw && fechaFinRaw) {
            const inicio = new Date(fechaInicioRaw);
            const fin = new Date(fechaFinRaw);

            if (fin < inicio) {
                $("#FechaFinBuscar").val(fechaInicioRaw);
            }
        }

        ObtenerJustificacionesPorSector();
    });

});


// =========================================================================================
// =========================== Obtener Listado desde la API =================================
// =========================================================================================
async function ObtenerJustificacionesPorSector() {

    const filtro = {
        fechaDesde: document.getElementById("FechaInicioBuscar").value || null,
        fechaHasta: document.getElementById("FechaFinBuscar").value || null,
        estado: document.getElementById("EstadoJustificacionBuscar").value == "0"
            ? null : Number(document.getElementById("EstadoJustificacionBuscar").value)
    };

    try {

        const response = await authFetch("Resultados/SectorEmpeladoJustificacionN3", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();

        MostrarJustificacionesPorSector(data);

        return data;

    } catch (error) {
        MostrarErrorCatch();
    }
}


// =========================================================================================
// ======================== Detectar Responsividad con collapse =============================
// =========================================================================================
var mediaQuery = window.matchMedia("(max-width: 767px)");
mediaQuery.addEventListener("change", () => {
    if (window._cacheJustificacionesSector) {
        MostrarJustificacionesPorSector(window._cacheJustificacionesSector);
    }
});



function FormatearFecha(fechaIso) {
    const soloFecha = fechaIso.split("T")[0];
    const [anio, mes, dia] = soloFecha.split("-");
    return `${dia}/${mes}/${anio}`;
}



// =========================================================================================
// ========================== Renderizar Tabla de Resultados =================================
// =========================================================================================
function MostrarJustificacionesPorSector(data) {

    window._cacheJustificacionesSector = data;

    const tabla = $("#listadoJustificacionesPorSector");
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="3" class="text-start">No se encontraron resultados</td></tr>`);
        return;
    }

    const coloresEstado = {
        PENDIENTE: "badge-pendiente",
        APROBADA: "badge-aprobada",
        RECHAZADA: "badge-rechazada",
    };

    let isMobile = mediaQuery.matches;

    data.forEach((sector, indexSector) => {

        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="3" class="fw-bold text-wrap">
                    Sector: ${sector.nombre}
                </td>
            </tr>
        `);

        sector.empleado.forEach((emp, indexEmp) => {

            tabla.append(`
                <tr style="background:#f0f6ff !important;">
                    <td colspan="3" class="fw-bold text-wrap">
                        ${emp.nombre} (Legajo: ${emp.nroLegajo})
                    </td>
                </tr>
            `);

            emp.justificaciones.forEach((j, indexJust) => {

                const estado = j.estado?.toUpperCase() ?? "-";
                const estilo = coloresEstado[estado] || "badge-default";

                const collapseId = `collapse${indexSector}_${indexEmp}_${indexJust}`;
                const attrs = isMobile
                    ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;"`
                    : `style="cursor:default;"`;

                tabla.append(`
                    <tr ${attrs}>
                        <td class="text-center align-middle">${j.fecha ? FormatearFecha(j.fecha) : "-"}</td>

                        <td class="text-start align-middle ${isMobile ? "d-none" : "text-wrap"}">
                            ${j.motivo}
                        </td>

                        <td class="text-center align-middle">
                            <span class="badge fw-bold fs-6 ${estilo}">
                                ${estado}
                            </span>
                        </td>
                    </tr>
                `);

                if (isMobile) {
                    tabla.append(`
                        <tr id="${collapseId}" class="collapse">
                            <td colspan="3" class="p-2 bg-light text-wrap">
                                <b>Motivo:</b> ${j.motivo}
                            </td>
                        </tr>
                    `);
                }

            });
        });
    });
}



// =========================================================================================
// ========================== Generar Informe en PDF =========================================
// =========================================================================================
async function GenerarInformePdfListadoJustificacionPorSector() {

    const sectores = await ObtenerJustificacionesPorSector();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Justificaciones por Sector", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    let y = 29;
    const fechaHoy = new Date().toLocaleString("es-AR");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    doc.setFont("helvetica", "normal");
    doc.text("Generado:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(fechaHoy, 33, y);
    y += 6;

    const totalSectores = sectores.length;
    const totalEmpleados = sectores.reduce((a, s) => a + s.empleado.length, 0);
    const totalJustificaciones = sectores.reduce((a, s) => a + s.empleado.reduce((b, e) => b + e.justificaciones.length, 0), 0);

    doc.setFont("helvetica", "normal");
    doc.text("Total Sectores:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalSectores}`, 42, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Total Empleados:", 46, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalEmpleados}`, 80, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Total Justificaciones:", 84, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalJustificaciones}`, 124, y);
    y += 6;

    let fechaInicioRaw = $("#FechaInicioBuscar").val();
    let fechaFinRaw = $("#FechaFinBuscar").val();
    let estadoSeleccionado = $("#EstadoJustificacionBuscar").val();

    let filtros = [];
    if (fechaInicioRaw) filtros.push(`[Desde: ${fechaInicioRaw}]`);
    if (fechaFinRaw) filtros.push(`[Hasta: ${fechaFinRaw}]`);

    if (estadoSeleccionado !== "0") {
        const estadoTexto = estadoSeleccionado === "1" ? "Pendiente" :
            estadoSeleccionado === "2" ? "Aprobada" :
                estadoSeleccionado === "3" ? "Rechazada" :
                    "Desconocido";

        filtros.push(`[Estado: ${estadoTexto}]`);
    }

    const filtrosText = filtros.length > 0 ? filtros.join("  |  ") : "No se aplicaron";


    doc.setFont("helvetica", "normal");
    doc.text("Filtros Aplicados:", 14, y);
    doc.setFont("helvetica", "bold");
    const filtrosSplit = doc.splitTextToSize(filtrosText, 260);
    doc.text(filtrosSplit, 44, y);
    y += filtrosSplit.length * 6 + 2;

    doc.setDrawColor(180);
    doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
    y += 7;

    const body = [];
    sectores.forEach(sector => {
        body.push([{
            content: `Sector: ${sector.nombre}`,
            colSpan: 3,
            styles: { fillColor: [183, 211, 255], fontStyle: "bold" }
        }]);

        sector.empleado.forEach(emp => {
            body.push([{
                content: `${emp.nombre} (Legajo: ${emp.nroLegajo})`,
                colSpan: 3,
                styles: { fillColor: [225, 235, 255] }
            }]);

            emp.justificaciones.forEach(j => {
                const fecha = j.fecha ? new Date(j.fecha).toLocaleDateString("es-AR") : "-";
                body.push([fecha, j.motivo, j.estado]);
            });
        });
    });

    // Después de armar el body pero antes de doc.autoTable
    if (sectores.length === 0 || body.length === 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(180, 0, 0);
        doc.text(
            "No hay resultados para los filtros aplicados.",
            doc.internal.pageSize.getWidth() / 2,
            y + 10,
            { align: "center" }
        );
    } else {
        doc.autoTable({
            startY: y,
            head: [["Fecha", "Motivo", "Estado"]],
            body: body,
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

    const html = `
        <html>
        <body class="pdf-body">
            <iframe class="pdf-frame" width="100%" height="100%" src="${url}"></iframe>
        </body>
        </html>
    `;
   const w = window.open("", "_blank"); 
w.document.open();
w.document.write(html);
w.document.title = "Informe de Justificaciones por Sector";
w.document.close();

}


ObtenerJustificacionesPorSector();
