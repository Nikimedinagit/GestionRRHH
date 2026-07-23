// =================================== Inicializar Filtros ===================================
$(document).ready(function () {

    ComboParaFiltrarPuesto();

    $("#IdPuestoFiltro").on("change", function () {
        ObtenerPromedioDiasLicencia();
    });

});



// ========================== Completar Select de Puesto Para Poder Filtrar =================
async function ComboParaFiltrarPuesto() {

    const resPuestos = await authFetch("Puestos/Activos", {
        method: "GET",
    });

    const puestos = await resPuestos.json();

    const $comboPuesto = $("#IdPuestoFiltro");
    $comboPuesto.empty();

    let opciones = `<option value="0">[Todos]</option>`;

    puestos.forEach(item => {
        opciones += `<option value="${item.id}">${item.descripcion}</option>`;
    });

    $comboPuesto.html(opciones);

    ObtenerPromedioDiasLicencia();
}


// =================================== Obtener Promedio Dias Licencia por Sector/Puesto ===================================
async function ObtenerPromedioDiasLicencia() {

    const puesto = document.getElementById("IdPuestoFiltro").value;

    const filtro = {
        puesto: puesto && puesto !== "0" ? parseInt(puesto) : null
    };

    try {
        const response = await authFetch("Resultados/PromedioDiasPorSectorPuestoN3", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();

        MostrarPromedioDiasLicencia(data);

        return data;

    } catch (error) {
        MostrarErrorCatch();
    }
}


// ======================== Detectar Responsividad =============================
function detectarCambioResponsivePromedioDias() {
    if (window._cachePromedioDiasLicencia) {
        MostrarPromedioDiasLicencia(window._cachePromedioDiasLicencia);
    }
}

window.matchMedia("(max-width: 574px)").addEventListener("change", detectarCambioResponsivePromedioDias);
window.matchMedia("(max-width: 767px)").addEventListener("change", detectarCambioResponsivePromedioDias);



// ================= Mostrar Promedio de Días por Sector / Puesto =================
function MostrarPromedioDiasLicencia(data) {

    window._cachePromedioDiasLicencia = data;

    const tabla = $("#listadoPromedioDiasLicencia");
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

    const badgeBase = `
        display:inline-block;
        padding:0.3em 0.6em;
        font-size:0.75rem;
        font-weight:600;
        border-radius:0.25rem;
    `;

    const badge = (valor, bg, color) =>
        `<span style="${badgeBase} background:${bg}; color:${color};">${valor}</span>`;

    data.forEach((sector, iSector) => {

        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="4" class="fw-bold text-wrap">
                    Sector: ${sector.nombreSector}
                </td>
            </tr>
        `);

        sector.puestos.forEach((puesto, iPuesto) => {

            tabla.append(`
                <tr style="background:#e8f0ff !important;">
                    <td colspan="4" class="fw-bold text-wrap">
                        Puesto: ${puesto.nombrePuesto}
                    </td>
                </tr>
            `);

            puesto.promedios.forEach((p, iProm) => {

                const collapseId = `collapseProm_${iSector}_${iPuesto}_${iProm}`;

                const attrs = (isMobile || isTablet)
                    ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;"`
                    : "";

                tabla.append(`
                    <tr ${attrs}>
                        <td class="text-center fw-bold">
                            ${p.cantidadLicencia}
                        </td>
                        <td class="text-center fw-bold">
                            ${p.porcentajeDias.toFixed(2)}%
                        </td>
                        <td class="text-center d-none d-sm-table-cell">
                            ${badge(p.maxDias, "#f8d7da", "#721c24")}
                        </td>
                        <td class="text-center d-none d-md-table-cell">
                            ${badge(p.minDias, "#d4edda", "#155724")}
                        </td>
                    </tr>
                `);

                if (isMobile || isTablet) {
                    tabla.append(`
                        <tr id="${collapseId}" class="collapse">
                            <td colspan="4" class="p-2 bg-light text-wrap" style="font-size:12px;">
                                ${isMobile ? `
                                    <div class="mb-1">
                                        <b>Máx. Días:</b>
                                        ${badge(p.maxDias, "#f8d7da", "#721c24")}
                                    </div>
                                ` : ``}
                                <div>
                                    <b>Mín. Días:</b>
                                    ${badge(p.minDias, "#d4edda", "#155724")}
                                </div>
                            </td>
                        </tr>
                    `);
                }

            });
        });
    });
}



// ========================== Formatear Nombre de los Select =========================
function Capitalizar(texto) {
    if (!texto) return "";
    return texto
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}



////////////////////////////////////////////////////////////////////////////////////////////////
/// GENERAR INFORME PDF - PROMEDIO DE DÍAS POR SECTOR / PUESTO (NIVEL 3)
////////////////////////////////////////////////////////////////////////////////////////////////
async function GenerarInformePdfPromedioDiasLicencia() {

    const sectores = await ObtenerPromedioDiasLicencia();

    if (!sectores || !Array.isArray(sectores) || sectores.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
        "Informe de Promedio de Días de Licencia por Sector y Puesto",
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

    let totalSectores = sectores.length;
    let totalPuestos = 0;
    let totalLicencias = 0;

    sectores.forEach(sec => {
        totalPuestos += sec.puestos.length;
        sec.puestos.forEach(p =>
            p.promedios.forEach(pr => totalLicencias += pr.cantidadLicencia)
        );
    });

    doc.setFont("helvetica", "normal");
    doc.text("Total Sectores:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalSectores}`, 41, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Puestos:", 44, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalPuestos}`, 62, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Licencias:", 65, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalLicencias}`, 85, y);
    y += 6;

    let puestoRaw = document.getElementById("IdPuestoFiltro").value;
    let filtrosAplicadosArray = [];

    if (puestoRaw && puestoRaw !== "0") {
        const puestoNombreRaw = $("#IdPuestoFiltro option:selected").text();
        filtrosAplicadosArray.push(`[Puesto: ${Capitalizar(puestoNombreRaw)}]`);
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

    sectores.forEach(sec => {

        body.push([
            {
                content: `Sector: ${sec.nombreSector}`,
                colSpan: 5,
                styles: {
                    fillColor: [183, 211, 255],
                    fontStyle: "bold",
                    halign: "left"
                }
            }
        ]);

        sec.puestos.forEach(p => {

            body.push([
                {
                    content: `Puesto: ${p.nombrePuesto}`,
                    colSpan: 5,
                    styles: {
                        fillColor: [232, 240, 255],
                        fontStyle: "bold",
                        halign: "left"
                    }
                }
            ]);

            p.promedios.forEach(pr => {
                body.push([
                    pr.cantidadLicencia,
                    `${pr.porcentajeDias.toFixed(2)}%`,
                    pr.maxDias,
                    pr.minDias,
                    ""
                ]);
            });
        });
    });

    doc.autoTable({
        startY: y,
        head: [["Cantidad", "Porc. Días (%)", "Máx. Días", "Mín. Días", ""]],
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
            "www.LoguiSoft.com",
            doc.internal.pageSize.getWidth() - 20,
            doc.internal.pageSize.getHeight() - 10,
            { align: "right" }
        );
    }

    const esMobile = window.innerWidth < 768;

    if (esMobile) {
        doc.save("Informe_Promedio_De_Días_De_Licencia.pdf");
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
    w.document.title = "Informe de Promedio de Días de Licencia";
    w.document.close();
}
