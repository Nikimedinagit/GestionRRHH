// =============== Inicializar Filtros al Cargar la Página =================================
$(document).ready(function () {
    $("#EmpleadoIdBuscar, #NroLegajoFiltro, #IdPuestoFiltro, #FechaInicioBuscar, #FechaFinBuscar")
        .on("input change", function () {
            ObtenerEmpleadosPorSectorEvaluaciones();
        });

});


// ========================== Completar Selec de Sector Para Poder Filtrar =================
async function ComboParaFiltrarPuesto() {
    const resLocalidades = await authFetch("Puestos/Activos", {
        method: "GET",
    });
    const localidades = await resLocalidades.json();

    const $comboLocalidad = $("#IdPuestoFiltro");
    $comboLocalidad.empty();

    let opciones = `<option value="0">[Todos]</option>`;
    localidades.forEach((item) => {
        opciones += `<option value="${item.id}">${item.descripcion}</option>`;
    });
    $comboLocalidad.html(opciones);

    ObtenerEmpleadosPorSectorEvaluaciones();
}

// =========================== Obtener Listado desde la API =================================
async function ObtenerEmpleadosPorSectorEvaluaciones() {

    const sectorFiltro = document.getElementById("IdPuestoFiltro").value;

    const filtro = {
        nombre: document.getElementById("EmpleadoIdBuscar").value,
        nroLegajo: document.getElementById("NroLegajoFiltro").value,
        puesto: sectorFiltro === "0" ? null : Number(sectorFiltro),
        fechaDesde: document.getElementById("FechaInicioBuscar").value || null,
        fechaHasta: document.getElementById("FechaFinBuscar").value || null,
    };

    try {
        const response = await authFetch("Resultados/PuestoEmpleadosEvaluacionesN3", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();

        MostrarEmpleadosPorSectorEvaluaciones(data);

        return data;

    } catch (error) {
        MostrarErrorCatch();
    }
}


// ======================= Media Query =======================
var mqTabletMobile = window.matchMedia("(max-width: 991px)");
var mqMobile = window.matchMedia("(max-width: 574px)");

mqTabletMobile.addEventListener("change", () => {
    if (window._cacheEmpleadosSector)
        MostrarEmpleadosPorSectorEvaluaciones(window._cacheEmpleadosSector);
});
mqMobile.addEventListener("change", () => {
    if (window._cacheEmpleadosSector)
        MostrarEmpleadosPorSectorEvaluaciones(window._cacheEmpleadosSector);
});


// ========================== Renderizar Tabla de Evaluaciones por Sector ===================
function MostrarEmpleadosPorSectorEvaluaciones(data) {
    window._cacheEmpleadosSector = data;
    const tabla = $("#listadoEmpeladosPorSectorYEvaluaciones");
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="6" class="text-start">No se encontraron resultados</td></tr>`);
        return;
    }

    const isMobile = mqMobile.matches;
    const isTabletMobile = mqTabletMobile.matches;

    data.forEach((sector, sIndex) => {
        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="6" class="fw-bold text-wrap">
                    Puesto: ${sector.nombre}
                </td>
            </tr>
        `);

        sector.empleados.forEach((emp, eIndex) => {
            tabla.append(`
                <tr style="background:#e8f0ff !important;">
                    <td colspan="6" class="fw-bold">
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
                const collapseId = `eval_${sIndex}_${eIndex}_${evIndex}`;

                if (isMobile) {
                    tabla.append(`
                        <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
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
                }
                else if (isTabletMobile) {
                    tabla.append(`
                        <tr>
                            <td class="text-center">${new Date(ev.fecha).toLocaleDateString("es-AR")}</td>
                            <td class="text-center">${ev.periodo}</td>
                            <td class="text-center">${badgeHtml}</td>
                        </tr>
                    `);
                }
                else {
                    tabla.append(`
                        <tr>
                            <td class="text-center">${new Date(ev.fecha).toLocaleDateString("es-AR")}</td>
                            <td class="text-center">${ev.periodo}</td>
                            <td class="text-center">${badgeHtml}</td>
                        </tr>
                    `);
                }
            });
        });
    });
}




// ========================== Formatear Nombre de los Select=========================================
function Capitalizar(texto) {
    if (!texto) return "";
    return texto
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}



// ========================== Generar Informe en PDF Evaluaciones por Puesto ===============
function TextoCalificacion(calificacion) {
    if (calificacion >= 9) return `(${calificacion}) EXCELENTE`;
    if (calificacion >= 7) return `(${calificacion}) MUY BUENA`;
    if (calificacion >= 5) return `(${calificacion}) BUENA`;
    return `(${calificacion}) REGULAR`;
}

async function GenerarInformePdfListadoEvaluacionSectorCriterio() {

    const puestos = await ObtenerEmpleadosPorSectorEvaluaciones();

    if (!puestos || !Array.isArray(puestos) || puestos.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Evaluaciones por Puesto", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    let y = 29;
    const fechaHoy = new Date().toLocaleString("es-AR");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    doc.setFont("helvetica", "normal");
    doc.text("Generado:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(fechaHoy, 33, y);
    y += 6;

    const totalPuestos = puestos.length;
    const totalEmpleados = puestos.reduce((a, p) => a + p.empleados.length, 0);
    const totalEvaluaciones = puestos.reduce((a, p) => a + p.empleados.reduce((b, e) => b + e.evaluaciones.length, 0), 0);

    doc.setFont("helvetica", "normal");
    doc.text("Total Puestos:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalPuestos}`, 40, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Empleados:", 44, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalEmpleados}`, 68, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Evaluaciones:", 72, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalEvaluaciones}`, 99, y);
    y += 6;

    let nombreFiltro = $("#EmpleadoIdBuscar").val();
    let legajoFiltro = $("#NroLegajoFiltro").val();
    let puestoFiltro = $("#IdPuestoFiltro").val();

    let filtros = [];
    if (nombreFiltro) filtros.push(`[Nombre: ${nombreFiltro}]`);
    if (legajoFiltro) filtros.push(`[Legajo: ${legajoFiltro}]`);
    if (puestoFiltro && puestoFiltro !== "0") {
        const puestoNombreRaw = $("#IdPuestoFiltro option:selected").text();
        const puestoNombre = Capitalizar(puestoNombreRaw);
        filtros.push(`[Puesto: ${puestoNombre}]`);
    }
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
    puestos.forEach(puesto => {
        body.push([{
            content: `Puesto: ${puesto.nombre}`,
            colSpan: 3,
            styles: { fillColor: [183, 211, 255], fontStyle: "bold" }
        }]);

        puesto.empleados.forEach(emp => {
            body.push([{
                content: `${emp.nombre} (Legajo: ${emp.nroLegajo})`,
                colSpan: 3,
                styles: { fillColor: [232, 240, 255], fontStyle: "bold" }
            }]);

            emp.evaluaciones.forEach(ev => {
                body.push([
                    new Date(ev.fecha).toLocaleDateString("es-AR"),
                    ev.periodo,
                    TextoCalificacion(ev.calificacion)
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
        doc.text("www.LoguiSoft.com", doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }

    const esMobile = window.innerWidth < 768;

    if (esMobile) {
        doc.save("Informe_Evaluaciones_Por_Puesto.pdf");
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
    w.document.title = "Informe de Evaluaciones por Puesto";
    w.document.close();
}





ComboParaFiltrarPuesto();
