// =========================== Obtener Listado desde la API =================================
async function ObtenerEstadisticaJustificacion() {
    try {
        const res = await authFetch("Resultados/EstadisticaJustificaciones12Meses", {
            method: "POST",
        });

        const data = await res.json();
        MostrarEstadisticoJustificacion(data);
        return data;
    } catch (err) {
        MostrarErrorCatch();
    }
}



// ======================= Media Query =======================
var mqTabletMobile = window.matchMedia("(max-width: 991px)");
var mqMobile = window.matchMedia("(max-width: 574px)");

mqTabletMobile.addEventListener("change", () => {
    if (window._cacheEstadisticaJustificacion)
        MostrarEstadisticoJustificacion(window._cacheEstadisticaJustificacion);
});
mqMobile.addEventListener("change", () => {
    if (window._cacheEstadisticaJustificacion)
        MostrarEstadisticoJustificacion(window._cacheEstadisticaJustificacion);
});



// ======================= Mostrar Estadístico Justificación =======================
function MostrarEstadisticoJustificacion(data) {

    window._cacheEstadisticaJustificacion = data;

    const tabla = $("#listadoEstadisticoJustificaciones");
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="10" class="text-start">No se encontraron resultados</td></tr>`);
        return;
    }

    const isMobile = mqMobile.matches;
    const isTabletMobile = mqTabletMobile.matches;

    const badgeBase = `
        display:inline-block;
        padding:0.35em 0.65em;
        font-size:0.75rem;
        font-weight:600;
        border-radius:0.25rem;
    `;

    const badge = (valor, bg, color) =>
        `<span style="${badgeBase} background:${bg}; color:${color};">${valor}</span>`;

    data.forEach((item, index) => {

        const collapseId = `justi_${index}`;

        if (isMobile) {
            tabla.append(`
                <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                    <td class="fw-bold text-start text-wrap">${item.mes}</td>
                    <td class="text-center fw-bold">${item.total}</td>
                </tr>
            `);

            tabla.append(`
                <tr class="collapse" id="${collapseId}">
                    <td colspan="10" class="p-2 bg-light" style="font-size:12px;">
                        <b>Aprobadas:</b> ${badge(item.aprobadas, "#d4edda", "#155724")}<br>
                        <b>Pendientes:</b> ${badge(item.pendientes, "#fff3cd", "#856404")}<br>
                        <b>Rechazadas:</b> ${badge(item.rechazadas, "#f8d7da", "#721c24")}
                    </td>
                </tr>
            `);
            return;
        }

        if (isTabletMobile) {
            tabla.append(`
                <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                    <td class="fw-bold text-start text-wrap">${item.mes}</td>
                    <td class="text-center">${badge(item.aprobadas, "#d4edda", "#155724")}</td>
                    <td class="text-center fw-bold">${item.total}</td>
                </tr>
            `);

            tabla.append(`
                <tr class="collapse" id="${collapseId}">
                    <td colspan="10" class="p-2 bg-light" style="font-size:12px;">
                        <b>Pendientes:</b> ${badge(item.pendientes, "#fff3cd", "#856404")}<br>
                        <b>Rechazadas:</b> ${badge(item.rechazadas, "#f8d7da", "#721c24")}
                    </td>
                </tr>
            `);
            return;
        }

        tabla.append(`
            <tr>
                <td class="fw-bold text-start text-wrap">${item.mes}</td>
                <td class="text-center">${badge(item.aprobadas, "#d4edda", "#155724")}</td>
                <td class="text-center">${badge(item.pendientes, "#fff3cd", "#856404")}</td>
                <td class="text-center">${badge(item.rechazadas, "#f8d7da", "#721c24")}</td>
                <td class="text-center fw-bold">${item.total}</td>
            </tr>
        `);
    });
}




// ========================== Generar Informe en PDF ========================================
async function GenerarInformePdfListadoJustificaciones() {

    const data = window._cacheEstadisticaJustificacion || await ObtenerEstadisticaJustificacion();

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
        "Informe Estadístico de Justificaciones (Últimos 12 meses)",
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
    y += 8;

    doc.setDrawColor(180);
    doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
    y += 7;

    const body = [];

    data.forEach(r => {
        body.push([
            r.mes ?? r.Mes,
            r.aprobadas ?? 0,
            r.pendientes ?? 0,
            r.rechazadas ?? 0,
            r.total ?? 0
        ]);
    });

    doc.autoTable({
        startY: y,
        head: [["Mes", "Aprobadas", "Pendientes", "Rechazadas", "Total"]],
        body: body,
        styles: {
            font: "helvetica",
            fontSize: 10,
            halign: "center"
        },
        columnStyles: {
            0: { halign: "left" }
        },
        headStyles: {
            fillColor: [19, 115, 204],
            textColor: 255,
            fontStyle: "bold"
        },
        margin: { left: 14, right: 14 },

        didParseCell: function (data) {
            if (data.section === 'head' && data.column.index === 0) {
                data.cell.styles.halign = 'left';
            }
        }
    });


    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100);

        doc.text(
            `Página ${i} de ${pageCount}`,
            14,
            doc.internal.pageSize.getHeight() - 10
        );

        doc.text(
            "www.WorkSync.com",
            doc.internal.pageSize.getWidth() - 20,
            doc.internal.pageSize.getHeight() - 10,
            { align: "right" }
        );
    }

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);

    const html = `
    <html>
      <head><title>Informe Estadístico de Justificaciones</title></head>
      <body class="pdf-body">
        <iframe class="pdf-frame" width="100%" height="100%" src="${url}"></iframe>
      </body>
    </html>`;

    const w = window.open();
    w.document.open();
    w.document.write(html);
    w.document.close();
}


ObtenerEstadisticaJustificacion();