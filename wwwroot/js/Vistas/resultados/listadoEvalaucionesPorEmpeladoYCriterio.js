// ========================== Inicializar Filtros al Cargar la Página ==========================
$(document).ready(function () {
    $("#EmpleadoIdBuscar, #NroLegajoFiltro, #FechaInicioBuscar, #FechaFinBuscar")
        .on("input change", function () {
            ObtenerEvaluacionesConCriterios();
        });
});

// =========================== Obtener Listado desde la API ====================================
async function ObtenerEvaluacionesConCriterios() {
    const filtro = {
        nombre: document.getElementById("EmpleadoIdBuscar").value,
        nroLegajo: document.getElementById("NroLegajoFiltro").value,
        fechaDesde: document.getElementById("FechaInicioBuscar").value || null,
        fechaHasta: document.getElementById("FechaFinBuscar").value || null,
    };

    try {
        const response = await authFetch("Resultados/EmpleadoEvaluacionesCriteriosN3", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();
        MostrarEvaluacionesConCriterios(data);

        return data;
    } catch (error) {
        MostrarErrorCatch();
    }
}

// ======================= Media Query =======================
var mqTabletMobile = window.matchMedia("(max-width: 991px)");
var mqMobile = window.matchMedia("(max-width: 574px)");

mqTabletMobile.addEventListener("change", () => {
    if (window._cacheEvaluacionesCriterios)
        MostrarEvaluacionesConCriterios(window._cacheEvaluacionesCriterios);
});
mqMobile.addEventListener("change", () => {
    if (window._cacheEvaluacionesCriterios)
        MostrarEvaluacionesConCriterios(window._cacheEvaluacionesCriterios);
});


// ========================== Renderizar Tabla de Evaluaciones con Criterios ===================
function MostrarEvaluacionesConCriterios(data) {
    window._cacheEvaluacionesCriterios = data;
    const tabla = $("#listadoEvalaucionesPorEmpeladoYCriterio");
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="6" class="text-start">No se encontraron resultados</td></tr>`);
        return;
    }

    const isMobile = mqMobile.matches;

    data.forEach((emp, eIndex) => {
        tabla.append(`
            <tr style="background:#b7d3ff !important; ">
                <td colspan="6" class="fw-bold text-wrap">
                    ${emp.nombre} (Legajo: ${emp.nroLegajo})
                </td>
            </tr>
        `);

        emp.evaluaciones.forEach((ev, evIndex) => {
            let etiqueta = "REGULAR";
            let badgeClass = "badge-regular";
            if (ev.calificacion >= 9) { etiqueta = "EXCELENTE"; badgeClass = "badge-excelente"; }
            else if (ev.calificacion >= 7) { etiqueta = "MUY BUENA"; badgeClass = "badge-muybuena"; }
            else if (ev.calificacion >= 5) { etiqueta = "BUENA"; badgeClass = "badge-buena"; }

            const badgeHtml = `<span class="badge ${badgeClass}">(${ev.calificacion}) ${etiqueta}</span>`;
            const collapseId = `eval_${eIndex}_${evIndex}`;

            if (isMobile) {
                tabla.append(`
                    <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer; background:#e8f0ff !important;">
                        <td class="text-center">${new Date(ev.fecha).toLocaleDateString("es-AR")}</td>
                        <td class="text-center" style="font-size:12px !important">${badgeHtml}</td>
                    </tr>
                `);

                tabla.append(`
                    <tr class="collapse" id="${collapseId}">
                        <td colspan="6" class="p-2 bg-light" style="font-size:12px;">
                            <b>Periodo:</b> ${ev.periodo}
                        </td>
                    </tr>
                `);
            } else {
                tabla.append(`
                    <tr style="background:#e8f0ff !important;">
                        <td class="text-center">${new Date(ev.fecha).toLocaleDateString("es-AR")}</td>
                        <td class="text-center">${ev.periodo}</td>
                        <td class="text-center">${badgeHtml}</td>
                    </tr>
                `);
            }

            ev.criterios.forEach(c => {
                tabla.append(`
                    <tr style="background:#ffffff !important;">
                        <td colspan="3" class="ps-2 pe-2 text-wrap">
                            <b>${c.nombre}:</b> ${c.descripcion}
                        </td>
                    </tr>
                `);
            });
        });
    });
}



// ========================== Generar Informe en PDF  ===============
function TextoCalificacion(calificacion) {
    if (calificacion >= 9) return `(${calificacion}) EXCELENTE`;
    if (calificacion >= 7) return `(${calificacion}) MUY BUENA`;
    if (calificacion >= 5) return `(${calificacion}) BUENA`;
    return `(${calificacion}) REGULAR`;
}

async function GenerarInformePdfListadoEvaluacionEmpleadoCriterio() {
    const empleados = await ObtenerEvaluacionesConCriterios();

    if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Evaluaciones con Criterios", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

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
    const totalEvaluaciones = empleados.reduce((a, e) => a + e.evaluaciones.length, 0);
    const totalCriterios = empleados.reduce((a, e) => a + e.evaluaciones.reduce((b, ev) => b + ev.criterios.length, 0), 0);

    doc.setFont("helvetica", "normal");
    doc.text("Total Empleados:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalEmpleados}`, 45, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Evaluaciones:", 49, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalEvaluaciones}`, 76, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Criterios:", 82, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalCriterios}`, 101, y);
    y += 6;

    let nombreFiltro = $("#EmpleadoIdBuscar").val();
    let legajoFiltro = $("#NroLegajoFiltro").val();
    let fechaDesde = $("#FechaInicioBuscar").val();
    let fechaHasta = $("#FechaFinBuscar").val();

    let filtros = [];
    if (nombreFiltro) filtros.push(`[Nombre: ${nombreFiltro}]`);
    if (legajoFiltro) filtros.push(`[Legajo: ${legajoFiltro}]`);
    if (fechaDesde) filtros.push(`[Desde: ${fechaDesde}]`);
    if (fechaHasta) filtros.push(`[Hasta: ${fechaHasta}]`);

    const filtrosText = filtros.length > 0 ? filtros.join("  |  ") : "No se aplicaron";

    doc.setFont("helvetica", "normal");
    doc.text("Filtros Aplicados:", 14, y);
    doc.setFont("helvetica", "bold");
    const filtrosSplit = doc.splitTextToSize(filtrosText, 260);
    doc.text(filtrosSplit, 45, y);
    y += filtrosSplit.length * 6 + 2;

    doc.setDrawColor(180);
    doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
    y += 7;

    const body = [];
    empleados.forEach(emp => {
        body.push([{
            content: `${emp.nombre} (Legajo: ${emp.nroLegajo})`,
            colSpan: 3,
            styles: { fillColor: [183, 211, 255], fontStyle: "bold" }
        }]);

        emp.evaluaciones.forEach(ev => {
            body.push([
                {
                    content: new Date(ev.fecha).toLocaleDateString("es-AR"),
                    styles: { fillColor: [232, 240, 255] }
                },
                {
                    content: ev.periodo,
                    styles: { fillColor: [232, 240, 255] }
                },
                {
                    content: TextoCalificacion(ev.calificacion),
                    styles: { fillColor: [232, 240, 255] }
                }
            ]);

            ev.criterios.forEach(c => {
                body.push([
                    {
                        content: `${c.nombre}`,
                        styles: { fillColor: [255, 255, 255], fontStyle: "bold" }
                    },
                    {
                        content: c.descripcion,
                        colSpan: 2,
                        styles: { fillColor: [255, 255, 255], fontStyle: "normal" }
                    }
                ]);
            });
        });
    });


    if (body.length === 0) {
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
            head: [["Fecha", "Periodo", "Calificación"]],
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
    w.document.title = "Informe de Evaluaciones con Criterios";
    w.document.close();
}


ObtenerEvaluacionesConCriterios();