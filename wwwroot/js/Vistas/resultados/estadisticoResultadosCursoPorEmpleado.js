// =================================== Inicializar los Filtros ===================================
$(document).ready(function () {
    ObtenerResultadosPorEmpleado();

    $("#EmpleadoIdBuscar, #ResultadoBuscar, #FechaInicioBuscar, #FechaFinBuscar")
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

            ObtenerResultadosPorEmpleado();
        });
});


// =================================== Obtener Listado de Resultado Emeplados ===================================
async function ObtenerResultadosPorEmpleado() {

    const filtro = {
        nombreEmpleado: document.getElementById("EmpleadoIdBuscar").value,
        estado: document.getElementById("ResultadoBuscar").value,
        fechaDesde: document.getElementById("FechaInicioBuscar").value || null,
        fechaHasta: document.getElementById("FechaFinBuscar").value || null,
    }

    try {
        const response = await authFetch("Resultados/ResultadoCursoPorEmpleado", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();

        MostrarResultadosPorEmpleado(data);

        return data;
    }
    catch (error) {
        MostrarErrorCatch();
    }
}


// ======================== Detectar Responsividad con collapse =============================
function reRenderIfCachePromedio() {
    if (window._cacheResultadoEmpleado) {
        MostrarResultadosPorEmpleado(window._cacheResultadoEmpleado);
    }
}
window.addEventListener("resize", reRenderIfCachePromedio);



// ======================== Mostrar Datos =============================
function MostrarResultadosPorEmpleado(data) {
    window._cacheResultadoEmpleado = data;

    const tabla = $("#listadoResultadosPorEmpleado");
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
        const collapseId = `collapseEmp_${idxEmp}`;
        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="6" class="fw-bold text-wrap">
                    ${empleado.nombreEmpleado}, (Legajo: ${empleado.nroLegajo}, Puesto: ${empleado.nombrePuesto})
                </td>
            </tr>
        `);

        const totalCursos = empleado.totalCursos ?? 0;
        const totalAprobados = empleado.totalAprobados ?? 0;
        const totalReprobados = empleado.totalReprobados ?? 0;
        const porcentaje = parseFloat(empleado.porcentajeAprobacion) ?? 0;
        const notaPromedio = parseFloat(empleado.notaPromedio) ?? 0;

        const badgeAprobados = badge(totalAprobados, "#d4edda", "#155724");
        const badgeReprobados = badge(totalReprobados, "#f8d7da", "#721c24");

        const aprobadoNota = !isNaN(notaPromedio) && notaPromedio >= 6;
        const bgNota = aprobadoNota ? "#d4edda" : "#f8d7da";
        const colorNota = aprobadoNota ? "#155724" : "#721c24";
        const badgeNota = badge(notaPromedio.toFixed(2), bgNota, colorNota);

        const badgePorcentaje = badge(`${porcentaje.toFixed(2)}%`, "#d4edda", "#155724");

        if (isDesktop) {
            tabla.append(`
                <tr>
                    <td class="text-center fw-bold">${totalCursos}</td>
                    <td class="text-center fw-bold">${badgeAprobados}</td>
                    <td class="text-center fw-bold">${badgeReprobados}</td>
                    <td class="text-center fw-bold">${badgePorcentaje}</td>
                    <td class="text-center fw-bold">${badgeNota}</td>
                </tr>
            `);
        } else if (isTablet) {
            tabla.append(`
                <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                    <td class="text-center fw-bold">${totalCursos}</td>
                    <td class="text-center fw-bold">${badgeAprobados}</td>
                    <td class="text-center fw-bold">${badgeReprobados}</td>
                </tr>
            `);
            tabla.append(`
                <tr class="collapse" id="${collapseId}">
                    <td colspan="3" class="p-2 bg-light">
                        <div class="d-flex flex-column gap-2 small" style="font-size: 12px">
                            <div><b>Aprobación (%):</b> ${badgePorcentaje}</div>
                            <div><b>Nota Promedio:</b> ${badgeNota}</div>
                        </div>
                    </td>
                </tr>
            `);
        } else if (isMobile) {
            tabla.append(`
                <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                    <td class="text-center fw-bold">${totalCursos}</td>
                    <td class="text-center fw-bold">${badgeAprobados}</td>
                </tr>
            `);
            tabla.append(`
                <tr class="collapse" id="${collapseId}">
                    <td colspan="2" class="p-2 bg-light">
                        <div class="d-flex flex-column gap-2 small" style="font-size: 12px">
                            <div><b>Reprobados:</b> ${badgeReprobados}</div>
                            <div><b>Aprobación (%):</b> ${badgePorcentaje}</div>
                            <div><b>Nota Promedio:</b> ${badgeNota}</div>
                        </div>
                    </td>
                </tr>
            `);
        }
    });
}




// =================================== Generar Informe PDF Resultado Emeplados ===================================
async function GenerarInformePdfResultadosPorEmpleado() {

    const empleados = await ObtenerResultadosPorEmpleado();

    if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Resultados de Cursos por Empleado", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    let y = 29;
    const fechaHoy = new Date().toLocaleString("es-AR");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Generado:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(fechaHoy, 33, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.text("Total Empleados:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${empleados.length}`, 46, y);
    y += 6;

    let fechaInicioRaw = document.getElementById("FechaInicioBuscar")?.value || "";
    let fechaFinRaw = document.getElementById("FechaFinBuscar")?.value || "";
    let nombreRaw = document.getElementById("EmpleadoIdBuscar")?.value || "";
    let resultadoRaw = document.getElementById("ResultadoBuscar")?.value || "";

    let filtrosAplicadosArray = [];

    if (fechaInicioRaw) filtrosAplicadosArray.push(`[Desde: ${fechaInicioRaw}]`);
    if (fechaFinRaw) filtrosAplicadosArray.push(`[Hasta: ${fechaFinRaw}]`);
    if (nombreRaw) filtrosAplicadosArray.push(`[Empleado: ${nombreRaw}]`);

    if (resultadoRaw) {
        const resultadoCapitalizado =
            resultadoRaw
                .split(" ")
                .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
                .join(" ");
        filtrosAplicadosArray.push(`[Resultado: ${resultadoCapitalizado}]`);
    }

    const filtrosAplicados =
        filtrosAplicadosArray.length > 0
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
        body.push([{
            content: `${emp.nombreEmpleado}, (Legajo: ${emp.nroLegajo}, Puesto: ${emp.nombrePuesto})`,
            colSpan: 5,
            styles: { halign: "left", fillColor: [183, 211, 255], fontStyle: "bold" }
        }]);
        body.push([
            emp.totalCursos,
            emp.totalAprobados,
            emp.totalReprobados,
            `${emp.porcentajeAprobacion?.toFixed(2) ?? "0.00"}%`,
            emp.notaPromedio?.toFixed(2) ?? "0.00"
        ]);
    });

    doc.autoTable({
        startY: y,
        head: [["Total Cursos", "Aprobados", "Reprobados", "% Aprobación", "Nota Promedio"]],
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
        doc.save("Informe_Resultados_De_Cursos_Por_Empleado.pdf");
        return;
    }

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);

    const html = `<html><body class="pdf-body"><iframe class="pdf-frame" width="100%" height="100%" src="${url}"></iframe></body></html>`;
    const w = window.open("", "_blank");
    w.document.open();
    w.document.write(html);
    w.document.title = "Informe de Resultados de Cursos por Empleado";
    w.document.close();
}

ObtenerResultadosPorEmpleado()