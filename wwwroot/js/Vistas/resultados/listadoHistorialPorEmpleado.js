// =========================================================================================
// =============== Inicializar Filtros al Cargar la Página =================================
// =========================================================================================
$(document).ready(function () {

    $("#EmpleadoIdBuscar, #NroLegajoFiltro").on("input change", function () {
        ObtenerHistorialPorEmpleado();
    });
});


// =========================================================================================
// =========================== Obtener Listado desde la API =================================
// =========================================================================================
async function ObtenerHistorialPorEmpleado() {


    const filtro = {
        nombre: document.getElementById("EmpleadoIdBuscar").value,
        nroLegajo: document.getElementById("NroLegajoFiltro").value,
    };

    try {
        const response = await authFetch("Resultados/EmpleadoHistorialLaboralN2", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();

        MostrarHistorialPorEmpleado(data);

        return data;

    } catch (error) {
        MostrarErrorCatch();
    }
}


// =========================================================================================
// ======================== Detectar Responsividad con collapse =============================
// =========================================================================================
var mediaQueryTablet = window.matchMedia("(max-width: 767px)");
var mediaQueryMobile = window.matchMedia("(max-width: 575px)");

function reRenderIfCacheHistorial() {
    if (window._cacheHistorialEmpleado) {
        MostrarHistorialPorEmpleado(window._cacheHistorialEmpleado);
    }
}

mediaQueryTablet.addEventListener("change", reRenderIfCacheHistorial);
mediaQueryMobile.addEventListener("change", reRenderIfCacheHistorial);


// =========================================================================================
// ======================= Renderizar Tabla de Resultados ===================================
// =========================================================================================
function MostrarHistorialPorEmpleado(data) {

    window._cacheHistorialEmpleado = data;

    const tabla = $("#listadoHistorialPorEmpleado");
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="5" class="text-start">No se encontraron resultados</td></tr>`);
        return;
    }

    const collapseEnabled = mediaQueryTablet.matches;
    const isMobile = mediaQueryMobile.matches;

    data.forEach((emp, indexEmp) => {

        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="5" class="fw-bold text-wrap">
                    ${emp.nombre} (Legajo: ${emp.nroLegajo})
                </td>
            </tr>
        `);

        emp.historial.forEach((h, indexHis) => {

            const collapseId = `collapseH${indexEmp}_${indexHis}`;
            const toggleAttrs = collapseEnabled
                ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;"`
                : `style="cursor:default;"`;

            tabla.append(`
                <tr ${toggleAttrs}>
                    <td class="text-center align-middle">${h.periodo}</td>
                    <td class="text-start align-middle text-wrap">${h.puestoActual}</td>
                    <td class="text-start align-middle text-wrap d-none d-sm-table-cell">${h.puestoAnterior}</td>
                    <td class="text-start align-middle text-wrap d-none d-md-table-cell">${h.sectorActual}</td>
                    <td class="text-start align-middle text-wrap d-none d-md-table-cell">${h.sectorAnterior}</td>
                </tr>
            `);

            if (collapseEnabled) {

                let collapseContent = "";

                if (isMobile) collapseContent += `<b>Puesto Anterior:</b> ${h.puestoAnterior}<br>`;
                collapseContent += `<b>Sector Actual:</b> ${h.sectorActual}<br>`;
                collapseContent += `<b>Sector Anterior:</b> ${h.sectorAnterior}`;

                tabla.append(`
                    <tr>
                        <td colspan="5" class="p-0">
                            <div id="${collapseId}" class="collapse">
                                <div class="p-2 bg-light text-wrap">
                                    ${collapseContent}
                                </div>
                            </div>
                        </td>
                    </tr>
                `);
            }
        });
    });
}



// =========================================================================================
// ========================== Generar Informe en PDF ========================================
// =========================================================================================
async function GenerarInformePdfListadoHistorialPorEmpleado() {

    const data = window._cacheHistorialEmpleado;

    if (!data || !Array.isArray(data) || data.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Historial por Empleado", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    let y = 29;
    const fechaHoy = new Date().toLocaleString("es-AR");

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    doc.setFont("helvetica", "normal");
    doc.text("Generado:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(fechaHoy, 33, y);
    y += 6;

    const totalEmpleados = data.length;
    const totalMovimientos = data.reduce((a, e) => a + e.historial.length, 0);

    doc.setFont("helvetica", "normal");
    doc.text("Total Empleados:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalEmpleados}`, 46, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Total Movimientos:", 50, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalMovimientos}`, 89, y);
    y += 6;

    let nombreFiltro = $("#EmpleadoIdBuscar").val();
    let legajoFiltro = $("#NroLegajoFiltro").val();

    let filtros = [];
    if (nombreFiltro) filtros.push(`[Nombre: ${nombreFiltro}]`);
    if (legajoFiltro) filtros.push(`[Legajo: ${legajoFiltro}]`);

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

    data.forEach(emp => {

        body.push([{
            content: `${emp.nombre}   (Legajo: ${emp.nroLegajo})`,
            colSpan: 5,
            styles: { fillColor: [183, 211, 255], fontStyle: "bold" }
        }]);

        emp.historial.forEach(h => {
            body.push([
                h.periodo,
                h.puestoActual,
                h.puestoAnterior || "-",
                h.sectorActual,
                h.sectorAnterior || "-"
            ]);
        });
    });

    if (body.length === 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(180, 0, 0);
        doc.text(
            "No hay historial cargado para los filtros aplicados.",
            doc.internal.pageSize.getWidth() / 2,
            y + 10,
            { align: "center" }
        );
    } else {
        doc.autoTable({
            startY: y,
            head: [["Periodo", "Puesto Actual", "Puesto Anterior", "Sector Actual", "Sector Anterior"]],
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
        doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10);
        doc.text("www.WorkSync.com", doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }

    const esMobile = window.innerWidth < 768;

    if (esMobile) {
        doc.save("Informe_Historial_Por_Empleado.pdf");
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
    w.document.title = "Informe Historial por Empleado";
    w.document.close();
}



ObtenerHistorialPorEmpleado();
