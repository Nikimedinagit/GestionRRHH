// =================================== Inicializar los Filtros ===================================
$(document).ready(function () {
    ObtenerPromedioPorEmpleado();

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

            ObtenerPromedioPorEmpleado();
        });
});


// =================================== Obtener Listado de Promedio Por Empleado ===================================
async function ObtenerPromedioPorEmpleado() {

    const filtro = {
        nombre: document.getElementById("EmpleadoIdBuscar").value,
        nroLegajo: document.getElementById("NroLegajoFiltro").value,
        fechaDesde: document.getElementById("FechaInicioBuscar").value || null,
        fechaHasta: document.getElementById("FechaFinBuscar").value || null,
    }

    try {
        const response = await authFetch("Resultados/PromedioCalificacionesEmpleadoN2", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();

        MostrarPromedioPorEmpleado(data);

        return data;
    }
    catch (error) {
        MostrarErrorCatch();
    }
}


// ======================== Detectar Responsividad con collapse =============================
function reRenderIfCachePromedio() {
    if (window._cachePromedioEmpleado) {
        MostrarPromedioPorEmpleado(window._cachePromedioEmpleado);
    }
}
window.addEventListener("resize", reRenderIfCachePromedio);



// ======================== Mostarr Datos =============================
function MostrarPromedioPorEmpleado(data) {

    window._cachePromedioEmpleado = data;

    const tabla = $("#listadoPromedioEmpleado");
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="6" class="text-start">No se encontraron resultados</td></tr>`);
        return;
    }

    const width = window.innerWidth;
    const isMobile = width < 576;
    const isTablet = width >= 576 && width < 992;
    const isDesktop = width >= 992;

    const badge = (t, bg, color) =>
        `<span style="
            display:inline-block;
            padding:0.35em 0.65em;
            font-size:0.75rem;
            font-weight:600;
            border-radius:0.25rem;
            background:${bg};
            color:${color};
        "><b>${t}</b></span>`;

    data.forEach((empleado, idxEmp) => {
        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="6" class="fw-bold text-wrap">
                    ${empleado.nombre} (Legajo: ${empleado.nroLegajo})
                </td>
            </tr>
        `);

        empleado.promedios.forEach((prom, idxProm) => {
            const collapseId = `collapseProm_${idxEmp}_${idxProm}`;

            const promedio = prom.promedio ?? 0;
            const cantidad = prom.cantidadEvaluaciones ?? 0;
            const mejor = prom.mejorCalificacion ?? 0;
            const peor = prom.peorCalificacion ?? 0;
            const variacion = prom.variacion ?? 0;
            const ultima = prom.ultimaEvaluacion ? new Date(prom.ultimaEvaluacion).toLocaleDateString("es-AR") : "-";

            if (isDesktop) {
                tabla.append(`
                    <tr>
                        <td class="text-center fw-bold">${promedio}</td>
                        <td class="text-center fw-bold">${cantidad}</td>
                        <td class="text-center">${badge(mejor, "#d4edda", "#155724")}</td>
                        <td class="text-center">${badge(peor, "#f8d7da", "#721c24")}</td>
                        <td class="text-center fw-bold">${variacion}</td>
                        <td class="text-center">${badge(ultima, "#d1ecf1", "#0c5460")}</td>
                    </tr>
                `);
                return;
            }

            if (isTablet) {
                tabla.append(`
                    <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                        <td class="text-center fw-bold">${promedio}</td>
                        <td class="text-center fw-bold">${cantidad}</td>
                        <td class="text-center">${badge(mejor, "#d4edda", "#155724")}</td>
                        <td class="text-center">${badge(peor, "#f8d7da", "#721c24")}</td>
                    </tr>
                `);

                tabla.append(`
                    <tr class="collapse" id="${collapseId}">
                        <td colspan="4" class="p-2 bg-light">
                            <div class="d-flex flex-column gap-2 small" style="font-size: 12px">
                                <div><b>Variación:</b> ${variacion}</div>
                                <div><b>Última Eval.:</b> ${badge(ultima, "#d1ecf1", "#0c5460")}</div>
                            </div>
                        </td>
                    </tr>
                `);
                return;
            }

            if (isMobile) {
                tabla.append(`
                    <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                        <td class="text-center fw-bold">${promedio}</td>
                        <td class="text-center fw-bold">${cantidad}</td>
                    </tr>
                `);

                tabla.append(`
                    <tr class="collapse" id="${collapseId}">
                        <td colspan="2" class="p-2 bg-light">
                            <div class="d-flex flex-column gap-2 small" style="font-size: 12px">
                                <div><b>Mejor:</b> ${badge(mejor, "#d4edda", "#155724")}</div>
                                <div><b>Peor:</b> ${badge(peor, "#f8d7da", "#721c24")}</div>
                                <div><b>Variación:</b> ${variacion}</div>
                                <div><b>Última Eval.:</b> ${badge(ultima, "#d1ecf1", "#0c5460")}</div>
                            </div>
                        </td>
                    </tr>
                `);
                return;
            }
        });
    });
}



// =================================== Generar Informe PDF Promedio Por Empleado ===================================
async function GenerarInformePdfPromedioPorEmpleado() {

    const empleados = await ObtenerPromedioPorEmpleado();

    if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Promedio de Calificaciones por Empleado", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

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

    doc.setFont("helvetica", "normal");
    doc.text("Total Empleados:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalEmpleados}`, 46, y);
    y += 6;

    let fechaInicioRaw = document.getElementById("FechaInicioBuscar").value;
    let fechaFinRaw = document.getElementById("FechaFinBuscar").value;
    let nombreRaw = document.getElementById("EmpleadoIdBuscar").value;
    let nroLegajoRaw = document.getElementById("NroLegajoFiltro").value;

    let filtrosAplicadosArray = [];
    if (fechaInicioRaw) filtrosAplicadosArray.push(`[Desde: ${fechaInicioRaw}]`);
    if (fechaFinRaw) filtrosAplicadosArray.push(`[Hasta: ${fechaFinRaw}]`);
    if (nombreRaw) filtrosAplicadosArray.push(`[Nombre: ${nombreRaw}]`);
    if (nroLegajoRaw) filtrosAplicadosArray.push(`[Legajo: ${nroLegajoRaw}]`);

    const filtrosAplicados = filtrosAplicadosArray.length > 0
        ? filtrosAplicadosArray.join("  |  ")
        : "No se aplicaron";


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
                content: `${emp.nombre} (Legajo: ${emp.nroLegajo})`,
                colSpan: 6,
                styles: {
                    halign: "left",
                    fillColor: [183, 211, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold"
                }
            }
        ]);

        emp.promedios.forEach(p => {
            body.push([
                p.promedio,
                p.cantidadEvaluaciones,
                p.mejorCalificacion,
                p.peorCalificacion,
                p.variacion,
                p.ultimaEvaluacion ? new Date(p.ultimaEvaluacion).toLocaleDateString("es-AR") : "-"
            ]);
        });
    });

    doc.autoTable({
        startY: y,
        head: [["Promedio", "Cant. Eval.", "Mejor Cal.", "Peor Cal.", "Variación", "Última Eval."]],
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
    w.document.title = "Informe de Promedio de Calificaciones por Empleado";
    w.document.close();
}
