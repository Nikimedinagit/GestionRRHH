// ========================== Inicialización ==========================
$(document).ready(function () {
    ComboParaFiltrarPuesto();
    ObtenerVariacionDesempenoEmpleado();

    $("#IdPuestoFiltro, #IdEmpleadoFiltro, #AnioFiltro, #TrimestreFiltro, #NombreFiltro, #LegajoFiltro, #FechaDesdeFiltro, #FechaHastaFiltro, #EstadoFiltro")
        .on("input change", function () {
            ObtenerVariacionDesempenoEmpleado();
        });
});

// ========================== Combos ==========================
async function ComboParaFiltrarPuesto() {
    const res = await authFetch("Puestos/Activos", { method: "GET" });
    const puestos = await res.json();
    const $combo = $("#IdPuestoFiltro");
    $combo.empty();
    let opciones = `<option value="0">[Todos]</option>`;
    puestos.forEach((item) => opciones += `<option value="${item.id}">${item.descripcion}</option>`);
    $combo.html(opciones);
}

// ========================== Obtener Datos ==========================
async function ObtenerVariacionDesempenoEmpleado() {
    const filtro = {
        puesto: $("#IdPuestoFiltro").val() === "0" ? null : Number($("#IdPuestoFiltro").val()),
        nombre: $("#NombreFiltro").val() || null,
        nroLegajo: $("#LegajoFiltro").val() || null,
        fechaDesde: $("#FechaDesdeFiltro").val() || null,
        fechaHasta: $("#FechaHastaFiltro").val() || null,
        estado: $("#EstadoFiltro").val() || null
    };

    try {
        const response = await authFetch("Resultados/VariacionDesempenoEmpleadoN4", {
            method: "POST",
            body: JSON.stringify(filtro)
        });
        const data = await response.json();
        MostrarVariacionDesempenoEmpleado(data);
        return data;
    } catch (error) {
        MostrarErrorCatch();
    }
}

// ========================== Renderizado Responsivo ==========================
function reRenderIfCacheVariacion() {
    if (window._cacheVariacion) {
        MostrarVariacionDesempenoEmpleado(window._cacheVariacion);
    }
}
window.addEventListener("resize", reRenderIfCacheVariacion);

function MostrarVariacionDesempenoEmpleado(data) {
    window._cacheVariacion = data;
    const tabla = $("#listadoVariacionDesempenoEmpleado");
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="6" class="text-start">No se encontraron resultados</td></tr>`);
        return;
    }

    const width = window.innerWidth;
    const isMobile = width < 576;
    const isTablet = width >= 576 && width < 992;
    const isDesktop = width >= 992;

    const badgeEstado = (estado) => {
        let bg = "#d1ecf1", color = "#0c5460";
        if (estado === "SUBIO") { bg = "#d4edda"; color = "#155724"; }
        if (estado === "BAJO") { bg = "#f8d7da"; color = "#721c24"; }
        if (estado === "SE MANTUVO") { bg = "#fff3cd"; color = "#856404"; }
        return `<span style="display:inline-block;padding:0.35em 0.65em;font-size:0.75rem;font-weight:600;border-radius:0.25rem;background:${bg};color:${color};"><b>${estado}</b></span>`;
    };

    data.forEach((empleado, idxEmp) => {
        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="6" class="fw-bold text-wrap">
                    ${empleado.nombre} (${empleado.nroLegajo})
                </td>
            </tr>
        `);

        if (!empleado.varacion || empleado.varacion.length === 0) {
            tabla.append(`
                <tr>
                    <td colspan="6" class="text-start">Sin suficientes evaluaciones</td>
                </tr>
            `);
            return;
        }

        empleado.varacion.forEach((v, idxVar) => {
            const collapseId = `collapseVar_${idxEmp}_${idxVar}`;

            if (isDesktop) {
                tabla.append(`
                    <tr>
                        <td class="text-center">${badgeEstado(v.estado)}</td>
                        <td class="text-center fw-bold">${v.calificacionActual}</td>
                        <td class="text-center fw-bold">${v.calificacionAnterior}</td>
                        <td class="text-center fw-bold">${v.diferencia}</td>
                        <td class="text-center">${new Date(v.fechaAnterior).toLocaleDateString()}</td>
                        <td class="text-center">${new Date(v.fechaActual).toLocaleDateString()}</td>
                    </tr>
                `);
                return;
            }

            if (isTablet) {
                tabla.append(`
                    <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                        <td class="text-center">${badgeEstado(v.estado)}</td>
                        <td class="text-center fw-bold">${v.calificacionActual}</td>
                        <td class="text-center fw-bold">${v.calificacionAnterior}</td>
                        <td class="text-center fw-bold">${v.diferencia}</td>
                    </tr>
                `);
                tabla.append(`
                    <tr class="collapse" id="${collapseId}">
                        <td colspan="4" class="p-2 bg-light">
                            <div class="d-flex flex-column gap-2 small" style="font-size: 12px">
                                <div><b>Fecha Anterior:</b> ${new Date(v.fechaAnterior).toLocaleDateString()}</div>
                                <div><b>Fecha Actual:</b> ${new Date(v.fechaActual).toLocaleDateString()}</div>
                            </div>
                        </td>
                    </tr>
                `);
                return;
            }

            if (isMobile) {
                tabla.append(`
                    <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                        <td class="text-center">${badgeEstado(v.estado)}</td>
                        <td class="text-center fw-bold">${v.calificacionActual}</td>
                    </tr>
                `);
                tabla.append(`
                    <tr class="collapse" id="${collapseId}">
                        <td colspan="2" class="p-2 bg-light">
                            <div class="d-flex flex-column gap-2 small" style="font-size: 12px">
                                <div><b>Calificación Anterior:</b> ${v.calificacionAnterior}</div>
                                <div><b>Diferencia:</b> ${v.diferencia}</div>
                                <div><b>Fecha Anterior:</b> ${new Date(v.fechaAnterior).toLocaleDateString()}</div>
                                <div><b>Fecha Actual:</b> ${new Date(v.fechaActual).toLocaleDateString()}</div>
                            </div>
                        </td>
                    </tr>
                `);
                return;
            }
        });
    });
}


function Capitalizar(texto) {
    if (!texto) return "";
    return texto.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

async function GenerarInformePdfVariacionDesempenoEmpleado() {

    const empleados = await ObtenerVariacionDesempenoEmpleado();

    if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    // Título
    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Variación del Desempeño por Empleado", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    let y = 29;
    const fechaHoy = new Date().toLocaleString("es-AR");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    // Fecha
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

    // Filtros aplicados
    let filtrosAplicadosArray = [];
    const puestoRaw = $("#IdPuestoFiltro").val();
    const estadoRaw = $("#EstadoFiltro").val();

    if (puestoRaw && puestoRaw !== "0") {
        const puestoNombre = Capitalizar($("#IdPuestoFiltro option:selected").text());
        filtrosAplicadosArray.push(`[Puesto: ${puestoNombre}]`);
    }
    if (estadoRaw && estadoRaw !== "") {
        const estadoNombre = Capitalizar($("#EstadoFiltro option:selected").text());
        filtrosAplicadosArray.push(`[Estado: ${estadoNombre}]`);
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

    // Cuerpo del informe
    const body = [];

    empleados.forEach(emp => {
        body.push([
            {
                content: `${emp.nombre} (Legajo: ${emp.nroLegajo})`,
                colSpan: 6,
                styles: {
                    halign: "left",
                    fillColor:[183, 211, 255], 
                    textColor: [0, 0, 0],
                    fontStyle: "bold"
                }
            }
        ]);

        if (!emp.varacion || emp.varacion.length === 0) {
            body.push([
                {
                    content: "Sin suficientes evaluaciones",
                    colSpan: 6,
                    styles: {
                        halign: "left",
                        fillColor: [240, 240, 240],
                        textColor: [0, 0, 0],
                        fontStyle: "normal"
                    }
                }
            ]);
        } else {
            emp.varacion.forEach(v => {
                body.push([
                    v.estado,
                    v.calificacionActual,
                    v.calificacionAnterior,
                    v.diferencia,
                    new Date(v.fechaAnterior).toLocaleDateString("es-AR"),
                    new Date(v.fechaActual).toLocaleDateString("es-AR")
                ]);
            });
        }
    });

    doc.autoTable({
        startY: y,
        head: [["Estado", "Calificación Actual", "Calificación Anterior", "Diferencia", "Fecha Anterior", "Fecha Actual"]],
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
    w.document.title = "Informe de Variación del Desempeño por Empleado";
    w.document.close();
}
