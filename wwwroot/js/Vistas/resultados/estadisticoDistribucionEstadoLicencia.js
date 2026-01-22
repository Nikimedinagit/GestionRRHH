// ======================== Inicialización =============================
$(document).ready(function () {
    ObtenerDistribucionEstadoLicencia();
});


// ======================== Obtener Distribución Estados =============================
async function ObtenerDistribucionEstadoLicencia() {

    try {
        const response = await authFetch("Resultados/DistribucionEstadosN1", {
            method: "GET"
        });

        const data = await response.json();

        MostrarDistribucionEstadoLicencia(data);
        return data;

    } catch (error) {
        MostrarErrorCatch();
    }
}


// ======================== Detectar Responsividad =============================
function detectarCambioResponsiveDistribucion() {
    if (window._cacheDistribucionEstados) {
        MostrarDistribucionEstadoLicencia(window._cacheDistribucionEstados);
    }
}

window.matchMedia("(max-width: 574px)").addEventListener("change", detectarCambioResponsiveDistribucion);
window.matchMedia("(max-width: 767px)").addEventListener("change", detectarCambioResponsiveDistribucion);


// ======================== Mostrar Distribución de Estados =============================
function MostrarDistribucionEstadoLicencia(data) {

    window._cacheDistribucionEstados = data;

    const tabla = $("#listadoDistribucionEstadoLicencia");
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`
            <tr>
                <td colspan="4" class="text-center text-muted">
                    No se encontraron resultados
                </td>
            </tr>
        `);
        return;
    }

    const estadoEstilo = {
        PENDIENTE: { backgroundColor: "#fff3cd", color: "#856404" },
        APROBADA: { backgroundColor: "#d4f4dd", color: "#2e7d32" },
        RECHAZADA: { backgroundColor: "#f8d7da", color: "#c62828" },
        EXPIRADA: { backgroundColor: "#e2e3e5", color: "#495057" }
    };

    const mqMobile = window.matchMedia("(max-width: 574px)");
    const mqTablet = window.matchMedia("(max-width: 767px)");
    const isMobile = mqMobile.matches;
    const isTablet = !isMobile && mqTablet.matches;

    let totalCantidad = data.reduce((acc, item) => acc + (item.cantidad ?? item.Cantidad ?? 0), 0);

    data.forEach((item, index) => {

        const estadoTexto = (item.nombreEstado ?? item.NombreEstado ?? "").trim().toUpperCase();
        const estilo = estadoEstilo[estadoTexto] || { backgroundColor: "#e9ecef", color: "#495057" };

        const badgeEstado = `
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
                ${estadoTexto}
            </span>
        `;

        const cantidad = item.cantidad ?? item.Cantidad ?? 0;
        const porcentaje = totalCantidad > 0 ? (cantidad * 100) / totalCantidad : 0;

        const collapseId = `collapseEstado_${index}`;
        const attrs = (isMobile || isTablet)
            ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;"`
            : "";

        tabla.append(`
            <tr ${attrs}>
                <td class="text-start text-wrap">${badgeEstado}</td>
                <td class="text-center fw-bold">${cantidad}</td>
                <td class="text-center d-none d-sm-table-cell">${porcentaje.toFixed(2)}%</td>
                <td class="text-center d-none d-md-table-cell">
                    ${item.ultima ?? item.Ultima
                ? new Date(item.ultima ?? item.Ultima).toLocaleDateString("es-AR")
                : "-"
            }
                </td>
            </tr>
        `);

        if (isMobile || isTablet) {
            tabla.append(`
                <tr id="${collapseId}" class="collapse">
                    <td colspan="4" class="p-2 bg-light text-wrap" style="font-size:12px;">
                        ${isMobile ? `<div class="mb-1"><b>Porcentaje:</b> ${porcentaje.toFixed(2)}%</div>` : ""}
                        <div><b>Última Licencia:</b> ${item.ultima ?? item.Ultima ? new Date(item.ultima ?? item.Ultima).toLocaleDateString("es-AR") : "-"}</div>
                    </td>
                </tr>
            `);
        }
    });

    tabla.append(`
        <tr class="border-top" style="background:#f1f3f5;">
            <td class="fw-bold fs-6">TOTAL</td>
            <td class="text-center fw-bold fs-6">${totalCantidad}</td>
            <td class="text-center fw-bold d-none d-sm-table-cell fs-6">100.00%</td>
            <td class="d-none d-md-table-cell"></td>
        </tr>
    `);
}




// ======================== Generar PDF - Distribución de Estados ==========================
async function GenerarInformePdfDistribucionEstados() {
    const data = window._cacheDistribucionEstados;

    if (!data || !Array.isArray(data) || data.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
        "Informe de Distribución de Estados de Licencia",
        doc.internal.pageSize.getWidth() / 2,
        20,
        { align: "center" }
    );

    let y = 29;
    const fechaHoy = new Date().toLocaleString("es-AR");

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    doc.setFont("helvetica", "normal");
    doc.text("Generado:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(fechaHoy, 33, y);
    y += 6;

    doc.setDrawColor(180);
    doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
    y += 7;

    const body = data.map(item => {
        const estadoTexto = (item.nombreEstado ?? item.NombreEstado ?? "").trim().toUpperCase();
        const cantidad = item.cantidad ?? item.Cantidad ?? 0;
        const porcentaje = item.porcentajeTotal ?? item.PorcentajeTotal ?? 0;
        const ultima = item.ultima ?? item.Ultima
            ? new Date(item.ultima ?? item.Ultima).toLocaleDateString("es-AR")
            : "-";

        return [estadoTexto, cantidad, porcentaje.toFixed(2) + "%", ultima];
    });

    doc.autoTable({
        startY: y,
        head: [["Estado", "Cantidad", "Porc. Total (%)", "Última Licencia"]],
        body: body,
        styles: { font: "helvetica", fontSize: 10 },
        headStyles: {
            fillColor: [19, 115, 204],
            textColor: 255,
            fontStyle: "bold"
        },
        margin: { left: 14, right: 14 }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10);
        doc.text(
            "www.WorkSync.com",
            doc.internal.pageSize.getWidth() - 20,
            doc.internal.pageSize.getHeight() - 10,
            { align: "right" }
        );
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
    w.document.title = "Informe de Distribución de Estados de Licencia";
    w.document.close();
}
