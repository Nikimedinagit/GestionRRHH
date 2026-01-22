// =================================== Inicializar los Filtros ===================================
$(document).ready(function () {
    ComboParaFiltrarEmpleado();
    ComboParaFiltrarPuesto();

    $("#IdPuestoFiltro, #IdEmpleadoFiltro, #AnioFiltro, #TrimestreFiltro")
        .on("input change", function () {
            ObtenerEvolucionDesempeno();
        });
});

// ========================== Completar Selects de Puesto y Empleado =================
async function ComboParaFiltrarPuesto() {
    const res = await authFetch("Puestos/Activos", { method: "GET" });
    const puestos = await res.json();

    const $combo = $("#IdPuestoFiltro");
    $combo.empty();

    let opciones = `<option value="0">[Todos]</option>`;
    puestos.forEach((item) => {
        opciones += `<option value="${item.id}">${item.descripcion}</option>`;
    });
    $combo.html(opciones);

    ObtenerEvolucionDesempeno();
}

async function ComboParaFiltrarEmpleado() {
    const res = await authFetch("Empleados/Activos", { method: "GET" });
    const empleados = await res.json();

    const $combo = $("#IdEmpleadoFiltro");
    $combo.empty();

    let opciones = `<option value="0">[Todos]</option>`;
    empleados.forEach((item) => {
        opciones += `<option value="${item.id}">${item.nombreCompleto}</option>`;
    });
    $combo.html(opciones);

    ObtenerEvolucionDesempeno();

}

// =================================== Obtener Listado Evolución Desempeño ===================================
async function ObtenerEvolucionDesempeno() {
    const filtro = {
        puesto: $("#IdPuestoFiltro").val() === "0" ? null : Number($("#IdPuestoFiltro").val()),
        empleado: $("#IdEmpleadoFiltro").val() === "0" ? null : Number($("#IdEmpleadoFiltro").val()),
        año: $("#AnioFiltro").val() || null,
        trimestre: $("#TrimestreFiltro").val() === "0" ? null : Number($("#TrimestreFiltro").val())
    };

    try {
        const response = await authFetch("Resultados/EvolucionDesempenoN3", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();
        MostrarEvolucionDesempeno(data);

        return data;
    }
    catch (error) {
        MostrarErrorCatch();
    }
}

// ======================== Detectar Responsividad con collapse =============================
function reRenderIfCacheEvolucion() {
    if (window._cacheEvolucion) {
        MostrarEvolucionDesempeno(window._cacheEvolucion);
    }
}
window.addEventListener("resize", reRenderIfCacheEvolucion);

// ======================== Mostrar Datos =============================
function MostrarEvolucionDesempeno(data) {
    window._cacheEvolucion = data;

    const tabla = $("#listadoEvolucionDesempeno");
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="7" class="text-start">No se encontraron resultados</td></tr>`);
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

    data.forEach((periodo, idx) => {
        const collapseId = `collapseEvol_${idx}`;

        const anio = periodo.año ?? "-";
        const trimestre = periodo.trimestre ?? "-";
        const promedio = periodo.promedio ?? 0;
        const cantidad = periodo.cantidadEvaluaciones ?? 0;
        const max = periodo.maxCalificacion ?? 0;
        const min = periodo.minCalificacion ?? 0;
        const variacion = periodo.variacionRespectoAnterior ?? 0;

        if (isDesktop) {
            tabla.append(`
                <tr>
                    <td class="text-center fw-bold">${anio}</td>
                    <td class="text-center fw-bold">${trimestre}</td>
                    <td class="text-center fw-bold">${promedio}</td>
                    <td class="text-center fw-bold">${cantidad}</td>
                    <td class="text-center">${badge(max, "#d4edda", "#155724")}</td>
                    <td class="text-center">${badge(min, "#f8d7da", "#721c24")}</td>
                    <td class="text-center fw-bold">${variacion}</td>
                </tr>
            `);
            return;
        }

        if (isTablet) {
            tabla.append(`
                <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                    <td class="text-center fw-bold">${anio}</td>
                    <td class="text-center fw-bold">${trimestre}</td>
                    <td class="text-center fw-bold">${promedio}</td>
                    <td class="text-center fw-bold">${cantidad}</td>
                </tr>
            `);

            tabla.append(`
                <tr class="collapse" id="${collapseId}">
                    <td colspan="4" class="p-2 bg-light">
                        <div class="d-flex flex-column gap-2 small" style="font-size: 12px">
                            <div><b>Máx.:</b> ${badge(max, "#d4edda", "#155724")}</div>
                            <div><b>Mín.:</b> ${badge(min, "#f8d7da", "#721c24")}</div>
                            <div><b>Variación:</b> ${variacion}</div>
                        </div>
                    </td>
                </tr>
            `);
            return;
        }

        if (isMobile) {
            tabla.append(`
                <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                    <td class="text-center fw-bold">${anio}</td>
                    <td class="text-center fw-bold">${trimestre}</td>
                </tr>
            `);

            tabla.append(`
                <tr class="collapse" id="${collapseId}">
                    <td colspan="2" class="p-2 bg-light">
                        <div class="d-flex flex-column gap-2 small" style="font-size: 12px">
                            <div><b>Promedio:</b> ${promedio}</div>
                            <div><b>Cant. Eval.:</b> ${cantidad}</div>
                            <div><b>Máx.:</b> ${badge(max, "#d4edda", "#155724")}</div>
                            <div><b>Mín.:</b> ${badge(min, "#f8d7da", "#721c24")}</div>
                            <div><b>Variación:</b> ${variacion}</div>
                        </div>
                    </td>
                </tr>
            `);
            return;
        }
    });
}



function Capitalizar(texto) {
    if (!texto) return "";
    return texto.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

async function GenerarInformePdfEvolucionDesempeno() {
    const periodos = await ObtenerEvolucionDesempeno();
    if (!periodos || !Array.isArray(periodos) || periodos.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Evolución del Desempeño por Año / Trimestre", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    let y = 29;
    const fechaHoy = new Date().toLocaleString("es-AR");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    doc.setFont("helvetica", "normal");
    doc.text("Generado:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(fechaHoy, 33, y);
    y += 6;

    let filtrosAplicadosArray = [];
    const puestoRaw = $("#IdPuestoFiltro").val();
    const empleadoRaw = $("#IdEmpleadoFiltro").val();
    const anioRaw = $("#AnioFiltro").val();
    const trimestreRaw = $("#TrimestreFiltro").val();

    if (puestoRaw && puestoRaw !== "0") {
        const puestoNombre = Capitalizar($("#IdPuestoFiltro option:selected").text());
        filtrosAplicadosArray.push(`[Puesto: ${puestoNombre}]`);
    }
    if (empleadoRaw && empleadoRaw !== "0") {
        const empleadoNombre = Capitalizar($("#IdEmpleadoFiltro option:selected").text());
        filtrosAplicadosArray.push(`[Empleado: ${empleadoNombre}]`);
    }
    if (anioRaw) filtrosAplicadosArray.push(`[Año: ${anioRaw}]`);
    if (trimestreRaw && trimestreRaw !== "0") filtrosAplicadosArray.push(`[Trimestre: ${$("#TrimestreFiltro option:selected").text()}]`);

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
    periodos.forEach(p => {
        body.push([
            p.año,
            p.trimestre,
            p.promedio,
            p.cantidadEvaluaciones,
            p.maxCalificacion,
            p.minCalificacion,
            p.variacionRespectoAnterior
        ]);
    });

    doc.autoTable({
        startY: y,
        head: [["Año", "Trimestre", "Promedio", "Cant. Eval.", "Máx. Calificación", "Mín. Calificación", "Variación"]],
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
    w.document.title = "Informe de Evolución del Desempeño por Año / Trimestre";
    w.document.close();
}
