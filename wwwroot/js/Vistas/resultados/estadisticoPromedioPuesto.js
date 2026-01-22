// =================================== Inicializar los Filtros ===================================
$(document).ready(function () {
    ComboParaFiltrarPuesto();

    $("#FechaInicioBuscar, #FechaFinBuscar, #IdPuestoFiltro")
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

            ObtenerPromedioPorPuesto();
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

    ObtenerPromedioPorPuesto();
}



// =================================== Obtener Listado de Promedio Por Empleado ===================================
async function ObtenerPromedioPorPuesto() {

    const puesto = document.getElementById("IdPuestoFiltro").value;

    const filtro = {
        puesto: puesto === "0" ? null : Number(puesto),
        fechaDesde: document.getElementById("FechaInicioBuscar").value || null,
        fechaHasta: document.getElementById("FechaFinBuscar").value || null,
    }

    try {
        const response = await authFetch("Resultados/PromedioCalificacionesPuestoN2", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();

        MostrarPromedioPorPuesto(data);

        return data;
    }
    catch (error) {
        MostrarErrorCatch();
    }
}


// ======================== Detectar Responsividad con collapse =============================
function reRenderIfCachePromedioPuesto() {
    if (window._cachePromedioPuesto) {
        MostrarPromedioPorPuesto(window._cachePromedioPuesto);
    }
}
window.addEventListener("resize", reRenderIfCachePromedioPuesto);


// ======================== Mostrar Datos =============================
function MostrarPromedioPorPuesto(data) {

    window._cachePromedioPuesto = data;

    const tabla = $("#listadoPromedioPuesto");
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

    data.forEach((puesto, idxPuesto) => {
        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="6" class="fw-bold text-wrap">
                    ${puesto.puesto}
                </td>
            </tr>
        `);

        puesto.promedios.forEach((prom, idxProm) => {
            const collapseId = `collapsePuesto_${idxPuesto}_${idxProm}`;

            const promedio = prom.promedio ?? 0;
            const cantEmpleados = prom.cantidadEmpleados ?? 0;
            const cantEvaluaciones = prom.cantidadEvaluaciones ?? 0;
            const mejor = prom.mejorPromedioEmpleado ?? 0;
            const peor = prom.peorPromedioEmpleado ?? 0;

            if (isDesktop) {
                tabla.append(`
                    <tr>
                        <td class="text-center fw-bold">${promedio}</td>
                        <td class="text-center fw-bold">${cantEmpleados}</td>
                        <td class="text-center fw-bold">${cantEvaluaciones}</td>
                        <td class="text-center">${badge(mejor, "#d4edda", "#155724")}</td>
                        <td class="text-center">${badge(peor, "#f8d7da", "#721c24")}</td>
                    </tr>
                `);
                return;
            }

            if (isTablet) {
                tabla.append(`
                    <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                        <td class="text-center fw-bold">${promedio}</td>
                        <td class="text-center fw-bold">${cantEmpleados}</td>
                    </tr>
                `);

                tabla.append(`
                    <tr class="collapse" id="${collapseId}">
                        <td colspan="2" class="p-2 bg-light">
                            <div class="d-flex flex-column gap-2 small" style="font-size: 12px">
                                <div><b>Cant. Evaluaciones:</b> ${cantEvaluaciones}</div>
                                <div><b>Mejor Promedio:</b> ${badge(mejor, "#d4edda", "#155724")}</div>
                                <div><b>Peor Promedio:</b> ${badge(peor, "#f8d7da", "#721c24")}</div>
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
                        <td class="text-center fw-bold">${cantEmpleados}</td>
                    </tr>
                `);

                tabla.append(`
                    <tr class="collapse" id="${collapseId}">
                        <td colspan="2" class="p-2 bg-light">
                            <div class="d-flex flex-column gap-2 small" style="font-size: 12px">
                                <div><b>Cant. Evaluaciones:</b> ${cantEvaluaciones}</div>
                                <div><b>Mejor Promedio:</b> ${badge(mejor, "#d4edda", "#155724")}</div>
                                <div><b>Peor Promedio:</b> ${badge(peor, "#f8d7da", "#721c24")}</div>
                            </div>
                        </td>
                    </tr>
                `);
                return;
            }
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


// =================================== Generar Informe PDF Promedio Por Puesto ===================================
async function GenerarInformePdfPromedioPorPuesto() {

    const puestos = await ObtenerPromedioPorPuesto();

    if (!puestos || !Array.isArray(puestos) || puestos.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Promedio de Calificaciones por Puesto", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

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
    const totalEmpleados = puestos.reduce((acc, p) => acc + p.promedios.reduce((a, prom) => a + prom.cantidadEmpleados, 0), 0);
    const totalEvaluaciones = puestos.reduce((acc, p) => acc + p.promedios.reduce((a, prom) => a + prom.cantidadEvaluaciones, 0), 0);

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

    let fechaInicioRaw = document.getElementById("FechaInicioBuscar").value;
    let fechaFinRaw = document.getElementById("FechaFinBuscar").value;
    let puestoRaw = document.getElementById("IdPuestoFiltro").value;

    let filtrosAplicadosArray = [];
    if (fechaInicioRaw) filtrosAplicadosArray.push(`[Desde: ${fechaInicioRaw}]`);
    if (fechaFinRaw) filtrosAplicadosArray.push(`[Hasta: ${fechaFinRaw}]`);
    if (puestoRaw && puestoRaw !== "0") {
        const puestoNombreRaw = $("#IdPuestoFiltro option:selected").text();
        const puestoNombre = Capitalizar(puestoNombreRaw);
        filtrosAplicadosArray.push(`[Puesto: ${puestoNombre}]`);
    }

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

    puestos.forEach(p => {
        body.push([
            {
                content: `${p.puesto}`,
                colSpan: 5,
                styles: {
                    halign: "left",
                    fillColor: [183, 211, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold"
                }
            }
        ]);

        p.promedios.forEach(prom => {
            body.push([
                prom.promedio,
                prom.cantidadEmpleados,
                prom.cantidadEvaluaciones,
                prom.mejorPromedioEmpleado,
                prom.peorPromedioEmpleado
            ]);
        });
    });

    doc.autoTable({
        startY: y,
        head: [["Promedio", "Cant. Empleados", "Cant. Eval.", "Mejor Prom.", "Peor Prom."]],
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
    w.document.title = "Informe de Promedio de Calificaciones por Puesto";
    w.document.close();
}
