///////////////////////////////////////////////////////////////////////////////////////////////
/// INICIALIZAR FILTROS PARA LISTADO DE CANTIDAD DE LICENCIAS POR TIPO - NIVEL 1
////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
    ComboParaFiltrarTipoLicencia();

    $("#IdTipoLicenciaFiltro").on("input change", function () {
        ObtenerCantidadLicenciasPorTipo();
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////
/// COMPLETAR SELECT DE TIPOS DE LICENCIA PARA FILTRAR
////////////////////////////////////////////////////////////////////////////////////////////////
async function ComboParaFiltrarTipoLicencia() {
    try {
        const resTipos = await authFetch("TipoDeLicencias/Activos", { method: "GET" });
        const tipos = await resTipos.json();

        const $combo = $("#IdTipoLicenciaFiltro");
        $combo.empty();

        let opciones = `<option value="0">[Todos]</option>`;
        tipos.forEach((item) => {
            opciones += `<option value="${item.id}">${item.nombre}</option>`;
        });
        $combo.html(opciones);

        ObtenerCantidadLicenciasPorTipo();
    } catch (error) {
        MostrarErrorCatch();
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////
/// OBTENER LISTADO DE CANTIDAD DE LICENCIAS POR TIPO
////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerCantidadLicenciasPorTipo() {
    const filtro = {
        tipoDeLicencia: parseInt($("#IdTipoLicenciaFiltro").val()) || null
    };

    try {
        const response = await authFetch("Resultados/CantidadLicenciasPorTipoN1", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();
        MostrarCantidadLicenciasPorTipo(data);

        return data;
    } catch (error) {
        MostrarErrorCatch();
    }
}



// ======================== Detectar Responsividad =============================
function detectarCambioResponsive() {
    if (window._cacheCantidadLicenciasTipo) {
        MostrarCantidadLicenciasPorTipo(window._cacheCantidadLicenciasTipo);
    }
}

window.matchMedia("(max-width: 574px)").addEventListener("change", detectarCambioResponsive);
window.matchMedia("(max-width: 767px)").addEventListener("change", detectarCambioResponsive);




// ======================== Mostrar Cantidad de Licencias por Tipo ==========================
function MostrarCantidadLicenciasPorTipo(data) {

    window._cacheCantidadLicenciasTipo = data;

    const tabla = $("#listadoCantidadLicenciaPorTipo");
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

    const mqMobile = window.matchMedia("(max-width: 574px)");
    const mqTablet = window.matchMedia("(max-width: 767px)");

    const isMobile = mqMobile.matches;
    const isTablet = !isMobile && mqTablet.matches;

    let totalCantidad = 0;

    data.forEach((item, index) => {

        totalCantidad += item.cantidad;

        const collapseId = `collapseTipo_${index}`;

        const attrs = (isMobile || isTablet)
            ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;"`
            : "";

        tabla.append(`
            <tr ${attrs}>
                <td class="text-start text-wrap">${item.tipoLicencia}</td>
                <td class="text-center fw-bold fs-6">${item.cantidad}</td>
                <td class="text-center fw-bold fs-6 d-none d-sm-table-cell">
                    ${item.porcentajeTotal.toFixed(2)}%
                </td>
                <td class="text-center fw-bold fs-6 d-none d-md-table-cell">
                    ${item.promedioDias.toFixed(2)}
                </td>
            </tr>
        `);

        if (isMobile || isTablet) {
            tabla.append(`
                <tr id="${collapseId}" class="collapse">
                    <td colspan="4" class="p-2 bg-light text-wrap">
                        ${isMobile ? `<div><b>Porcentaje:</b> <b>${item.porcentajeTotal.toFixed(2)}%</b></div>` : ``}
                        <div><b>Prom. Días:</b> <b>${item.promedioDias.toFixed(2)}</b></div>
                    </td>
                </tr>
            `);
        }
    });

    tabla.append(`
        <tr class="border-top">
            <td class="fw-bold fs-6">TOTAL</td>
            <td class="text-center fw-bold fs-6">${totalCantidad}</td>
            <td class="text-center fw-bold fs-6 d-none d-sm-table-cell">
               100.00%
            </td>
            <td class="d-none d-md-table-cell"></td>
        </tr>
    `);
}





// ========================== Formatear Nombre de los Select=========================================
function Capitalizar(texto) {
    if (!texto) return "";
    return texto
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}



////////////////////////////////////////////////////////////////////////////////////////////////
/// GENERAR INFORME PDF - CANTIDAD DE LICENCIAS POR TIPO (NIVEL 1)
////////////////////////////////////////////////////////////////////////////////////////////////
async function GenerarInformePdfCantidadLicenciasPorTipo() {

    const tipos = await ObtenerCantidadLicenciasPorTipo();

    if (!tipos || !Array.isArray(tipos) || tipos.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Cantidad de Licencias por Tipo", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    let y = 29;
    const fechaHoy = new Date().toLocaleString("es-AR");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    doc.setFont("helvetica", "normal");
    doc.text("Generado:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(fechaHoy, 33, y);
    y += 6;

    const totalTipos = tipos.length;
    const totalLicencias = tipos.reduce((acc, tipo) => acc + tipo.cantidad, 0);

    doc.setFont("helvetica", "normal");
    doc.text("Total Tipos de Licencia:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalTipos}`, 56, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Licencias:", 60, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalLicencias}`, 80, y);
    y += 6;

    let tipoLicenciaRaw = document.getElementById("IdTipoLicenciaFiltro").value;
    let filtrosAplicadosArray = [];

    if (tipoLicenciaRaw && tipoLicenciaRaw !== "0") {
        const tipoNombreRaw = $("#IdTipoLicenciaFiltro option:selected").text();
        const licenciaNombre = Capitalizar(tipoNombreRaw);
        filtrosAplicadosArray.push(`[Tipo Licencia: ${licenciaNombre}]`);
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

    const body = tipos.map(tipo => [
        tipo.tipoLicencia,
        tipo.cantidad,
        `${tipo.porcentajeTotal.toFixed(2)}%`,
        tipo.promedioDias.toFixed(2)
    ]);

    doc.autoTable({
        startY: y,
        head: [["Tipo de Licencia", "Cantidad", "Porc. Total (%)", "Prom. Días"]],
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
        doc.text("www.LoguiSoft.com", doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }


    const esMobile = window.innerWidth < 768;

    if (esMobile) {
        doc.save("Informe_Cantidad_De_Licencia_Por_Tipo.pdf");
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
    w.document.title = "Informe de Cantidad de Licencias por Tipo";
    w.document.close();
}



