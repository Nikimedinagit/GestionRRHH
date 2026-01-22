


// =================================== Iniicalizar los Filtros ===================================
$(document).ready(function () {
    ObtenerAsistenciaPorEmpleado();

    $("#FechaInicioBuscar, #FechaFinBuscar, #EmpleadoIdBuscar, #NroLegajoFiltro")
        .on("input change", function () {

            let fechaInicioRaw = $("#FechaInicioBuscar").val();
            let fechaFinRaw = $("#FechaFinBuscar").val();

            if (fechaInicioRaw && fechaFinRaw) {
                const fechaInicio = new Date(fechaInicioRaw);
                const fechaFin = new Date(fechaFinRaw);

                if (fechaFin < fechaInicio) {
                    $("#FechaFinBuscar").val(fechaInicioRaw);
                }
            }

            ObtenerAsistenciaPorEmpleado();
        });
});




// =================================== Obtener Listado de Asistencia Por Empleado ===================================
async function ObtenerAsistenciaPorEmpleado() {

    const filtro = {
        nombre: document.getElementById("EmpleadoIdBuscar").value,
        nroLegajo: document.getElementById("NroLegajoFiltro").value,
        fechaDesde: document.getElementById("FechaInicioBuscar").value || null,
        fechaHasta: document.getElementById("FechaFinBuscar").value || null,
    }

    try {
        const response = await authFetch("Resultados/AsistenciaPorEmpleadoN2", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();

        MostrarAsistenciaPorEmpleado(data);

        return data;
    }
    catch (error) {
        MostrarErrorCatch();
    }
}


// =================================== Reandilizar al Escuchar Cambios de Tamaños ===================================
var mediaQuery = window.matchMedia("(max-width: 767px)");
mediaQuery.addEventListener("change", () => {
    if (window._cacheAsistenciaEmpleado) {
        MostrarAsistenciaPorEmpleado(window._cacheAsistenciaEmpleado);
    }
});

// =================================== Mostrar Listado de Asistencia Por Empleado ===================================
function MostrarAsistenciaPorEmpleado(data) {

    window._cacheAsistenciaEmpleado = data;

    const tabla = $('#listadoAsitenciaPorEmpleado');
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="6" class="text-start">No se encontraron resultados</td></tr>`);
        return;
    }

    const EstadoAsistenciaEstilo = {
        COMPLETA: { backgroundColor: "#a3dc9a72", color: "#06923E" },
        INCOMPLETA: { backgroundColor: "#fff3cd", color: "#856404" },
        AUSENTE: { backgroundColor: "#f8d7da", color: "#c62828" },
        TARDE: { backgroundColor: "#ffe5d0", color: "#d35400" },
        "FUERA DE HORARIO": { backgroundColor: "#e2e3e5", color: "#495057" }
    };

    const tabletsMobiless = mediaQuery.matches;

    data.forEach((empleado, indexEmp) => {
        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="6" class="fw-bold text-wrap">
                    ${empleado.nombre} (Legajo: ${empleado.nroLegajo}, Puesto: ${empleado.puesto})
                </td>
            </tr>
        `);

        empleado.asistencias.forEach((asistencia, indexAsis) => {

            let estado = (asistencia.estado || "").trim().toUpperCase();
            if (estado.replace(/\s+/g, "") === "FUERADEHORARIO") estado = "FUERA DE HORARIO";

            const estilo = EstadoAsistenciaEstilo[estado] || {
                backgroundColor: "#e2e3e5",
                color: "#495057"
            };

            const collapseId = `collapse${indexEmp}_${indexAsis}`;

            const toggleAttrs = tabletsMobiless
                ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;"`
                : `style="cursor:default;"`;


            const badgeHtml = `
                <span class="fw-bold"
                      style="
                        display:inline-block;
                        padding:0.35em 0.65em;
                        font-size:0.7rem;
                        font-weight:600;
                        border-radius:0.25rem;
                        background-color:${estilo.backgroundColor};
                        color:${estilo.color};
                      ">
                    ${estado}
                </span>
            `;

            tabla.append(`
                <tr ${toggleAttrs}>
                    <td class="text-center align-middle">${asistencia.fecha || "-"}</td>
                    <td class="text-center align-middle">${badgeHtml}</td>
                    <td class="text-center align-middle d-none d-sm-table-cell">${asistencia.primerEntrada || "-"}</td>
                    <td class="text-center align-middle d-none d-sm-table-cell">${asistencia.primeraSalida || "-"}</td>
                    <td class="text-center align-middle d-none d-md-table-cell">${asistencia.segundaEntrada || "-"}</td>
                    <td class="text-center align-middle d-none d-md-table-cell">${asistencia.segundaSalida || "-"}</td>
                </tr>
            `);

            if (tabletsMobiless) {
                tabla.append(`
                    <tr class="collapse" id="${collapseId}">
                        <td colspan="6" class="p-2 bg-light">
                            <div class="d-sm-none">
                                <b>Entrada 1:</b> ${asistencia.primerEntrada || "-"}<br>
                                <b>Salida 1:</b> ${asistencia.primeraSalida || "-"}<br><br>
                            </div>
                            <div class="d-md-none">
                                <b>Entrada 2:</b> ${asistencia.segundaEntrada || "-"}<br>
                                <b>Salida 2:</b> ${asistencia.segundaSalida || "-"}
                            </div>
                        </td>
                    </tr>
                `);
            }
        });
    });
}



async function GenerarInformePdfListadoAsistenciaPorEmpleado() {

    const empleados = await ObtenerAsistenciaPorEmpleado();

    if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Asistencias por Empleado", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    let y = 29;
    const fechaHoy = new Date().toLocaleString("es-AR");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    doc.setFont("helvetica", "normal");
    doc.text("Generado:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(fechaHoy, 33, y);
    y += 6;

    const totalEmpleados = empleados.length;
    const totalAsistencias = empleados.reduce((acc, emp) => acc + emp.asistencias.length, 0);

    doc.setFont("helvetica", "normal");
    doc.text("Total Empleados:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalEmpleados}`, 46, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Total Asistencias:", 50, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalAsistencias}`, 84, y);
    y += 6;

    let fechaInicioRaw = document.getElementById("FechaInicioBuscar").value;
    let fechaFinRaw = document.getElementById("FechaFinBuscar").value;

    let filtrosAplicadosArray = [];
    if (fechaInicioRaw) filtrosAplicadosArray.push(`[Desde: ${fechaInicioRaw}]`);
    if (fechaFinRaw) filtrosAplicadosArray.push(`[Hasta: ${fechaFinRaw}]`);

    const filtrosAplicados = filtrosAplicadosArray.length > 0 ? filtrosAplicadosArray.join("  |  ") : "No se aplicaron";

    doc.setFont("helvetica", "normal");
    doc.text("Filtros Aplicados:", 14, y);
    doc.setFont("helvetica", "bold");
    const filtrosText = doc.splitTextToSize(filtrosAplicados, 260);
    doc.text(filtrosText, 45, y);
    y += filtrosText.length * 6 + 2;

    doc.setDrawColor(180);
    doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
    y += 7;

    const body = [];

    empleados.forEach(emp => {
        body.push([
            {
                content: `${emp.nombre} (Legajo: ${emp.nroLegajo}, Puesto: ${emp.puesto})`,
                colSpan: 6,
                styles: {
                    halign: "left",
                    fillColor: [220, 230, 241],
                    textColor: [0, 0, 0],
                    fontStyle: "bold"
                }
            }
        ]);

        emp.asistencias.forEach(a => {
            body.push([
                a.fecha,
                a.estado,
                a.primerEntrada || "-",
                a.primeraSalida || "-",
                a.segundaEntrada || "-",
                a.segundaSalida || "-"
            ]);
        });
    });

    doc.autoTable({
        startY: y,
        head: [["Fecha", "Estado", "1° Entrada", "1° Salida", "2° Entrada", "2° Salida"]],
        body: body,
        styles: { font: "helvetica", fontSize: 10 },
        headStyles: { fillColor: [19, 115, 204], textColor: 255, fontStyle: "bold" },
        margin: { left: 14, right: 14 }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10);
        doc.text("www.WorkSync.com", doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }

    const esMobile = window.innerWidth < 768;

    if (esMobile) {
        doc.save("Informe_Empleados.pdf");
        return;
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
    w.document.title = "Informe de Asistencia por Empelado";
    w.document.close();
}


ObtenerAsistenciaPorEmpleado();