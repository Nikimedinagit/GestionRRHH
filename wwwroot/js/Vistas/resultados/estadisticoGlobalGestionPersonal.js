

// =========================================================================================
// =========================== Obtener Listado desde la API =================================
// =========================================================================================
async function ObtenerEstadisticaGlobal() {
    try {
        const res = await authFetch("Resultados/GlobalN1", {
            method: "POST",
        });

        const data = await res.json();
        MostrarEstadisticoGlobal(data);
        return data;
    } catch (err) {
        MostrarErrorCatch();
    }
}


// =========================================================================================
// ======================== Detectar Responsividad con collapse =============================
// =========================================================================================
function reRenderIfCacheGlobal() {
    if (window._cacheEstadisticoGlobal) {
        MostrarEstadisticoGlobal(window._cacheEstadisticoGlobal);
    }
}
window.addEventListener("resize", reRenderIfCacheGlobal);


// =========================================================================================
// ======================= Renderizar Tabla de Resultados ===================================
// =========================================================================================
function MostrarEstadisticoGlobal(data) {

    window._cacheEstadisticoGlobal = data;

    const tabla = $("#estadisticoGlobal");
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="10" class="text-start">No se encontraron resultados</td></tr>`);
        return;
    }

    const width = window.innerWidth;
    const isMobile = width < 576;
    const isTablet = width >= 576 && width < 992;
    const isDesktop = width >= 992;

    const badge = (t, bg, color) =>
        `<span class="badge px-3 py-2 fw-bold" style="background:${bg};color:${color};font-size:0.85rem;">${t}</span>`;

    data.forEach((row, idx) => {

        const mes = row.mes || row.Mes || row.MesNombre || String(row.Mes);

        const activos = row.activos ?? 0;
        const presentes = row.presentes ?? 0;
        const ausentes = row.ausentes ?? 0;

        const tarde = row.tarde ?? 0;
        const incompletas = row.incompletas ?? 0;
        const fueraHorario = row.fueraDeHorario ?? 0;
        const justificaciones = row.justificaciones ?? 0;

        const presentismo = Number(row.porcentajePresentismo ?? 0).toFixed(2) + "%";
        const ausentismo = Number(row.porcentajeAusentismo ?? 0).toFixed(2) + "%";

        const collapseId = `collapseGlobal_${idx}`;

  
        if (isDesktop) {

            tabla.append(`
                <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                    <td class="text-start fw-bold">${mes}</td>
                    <td class="text-center fw-bold">${activos}</td>

                    <td class="text-center">${badge(presentes, "#a3dc9a72", "#06923E")}</td>
                    <td class="text-center">${badge(ausentes, "#f8d7da", "#c62828")}</td>

                    <td class="text-center">${badge(presentismo, "#a3dc9a72", "#06923E")}</td>
                    <td class="text-center">${badge(ausentismo, "#f8d7da", "#c62828")}</td>
                </tr>
            `);

            tabla.append(`
                <tr class="collapse" id="${collapseId}">
                    <td colspan="6" class="p-2 bg-light">
                        <div class="d-flex flex-column gap-2 small">

                            <div><b style="font-size:12px">Tarde:</b> ${badge(tarde, "#fff3cd", "#b68400")}</div>
                            <div><b style="font-size:12px">Incompletas:</b> ${badge(incompletas, "#cfe2ff", "#084298")}</div>
                            <div><b style="font-size:12px">Fuera de Horario:</b> ${badge(fueraHorario, "#e0bbff", "#5a189a")}</div>
                            <div><b style="font-size:12px">Justificaciones:</b> ${badge(justificaciones, "#ececec", "#333333")}</div>

                        </div>
                    </td>
                </tr>
            `);

            return;
        }

        if (isMobile) {

            tabla.append(`
                <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                    <td class="text-start fw-bold">${mes}</td>
                    <td class="text-center fw-bold">${badge(presentismo, "#a3dc9a72", "#06923E")}</td>
                </tr>
            `);

            tabla.append(`
                <tr class="collapse" id="${collapseId}">
                    <td colspan="2" class="p-2 bg-light">
                        <div class="d-flex flex-column gap-2 small">

                            <div style="font-size:12px;" class="fw-bold"><b style="font-size:12px">Activos:</b> ${activos}</div>
                            <div><b style="font-size:12px">Ausentismo:</b> ${badge(ausentismo, "#f8d7da", "#c62828")}</div>

                            <div><b style="font-size:12px">Presentes:</b> ${badge(presentes, "#a3dc9a72", "#06923E")}</div>
                            <div><b style="font-size:12px">Ausentes:</b> ${badge(ausentes, "#f8d7da", "#c62828")}</div>

                            <div><b style="font-size:12px">Tarde:</b> ${badge(tarde, "#fff3cd", "#b68400")}</div>
                            <div><b style="font-size:12px">Incompletas:</b> ${badge(incompletas, "#cfe2ff", "#084298")}</div>
                            <div><b style="font-size:12px">Fuera de Horario:</b> ${badge(fueraHorario, "#e0bbff", "#5a189a")}</div>
                            <div><b style="font-size:12px">Justificaciones:</b> ${badge(justificaciones, "#ececec", "#333333")}</div>

                        </div>
                    </td>
                </tr>
            `);

            return;
        }


        if (isTablet) {

            tabla.append(`
                <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                    <td class="text-start fw-bold">${mes}</td>
                    <td class="text-center fw-bold">${activos}</td>

                    <td class="text-center">${badge(presentismo, "#a3dc9a72", "#06923E")}</td>
                    <td class="text-center">${badge(ausentismo, "#f8d7da", "#c62828")}</td>
                </tr>
            `);

            tabla.append(`
                <tr class="collapse" id="${collapseId}">
                    <td colspan="4" class="p-2 bg-light">
                        <div class="d-flex flex-column gap-2 small">

                            <div><b style="font-size:12px">Presentes:</b> ${badge(presentes, "#a3dc9a72", "#06923E")}</div>
                            <div><b style="font-size:12px">Ausentes:</b> ${badge(ausentes, "#f8d7da", "#c62828")}</div>

                            <div><b style="font-size:12px">Tarde:</b> ${badge(tarde, "#fff3cd", "#b68400")}</div>
                            <div><b style="font-size:12px">Incompletas:</b> ${badge(incompletas, "#cfe2ff", "#084298")}</div>
                            <div><b style="font-size:12px">Fuera de Horario:</b> ${badge(fueraHorario, "#e0bbff", "#5a189a")}</div>
                            <div><b style="font-size:12px">Justificaciones:</b> ${badge(justificaciones, "#ececec", "#333333")}</div>

                        </div>
                    </td>
                </tr>
            `);

            return;
        }

    });
}


// =========================================================================================
// ========================== Generar Informe en PDF ========================================
// =========================================================================================
async function GenerarInformePdfEstadisticoGlobal() {

    const data = window._cacheEstadisticoGlobal || await ObtenerEstadisticaGlobal();

    if (!data || !Array.isArray(data) || data.length === 0) {
        ErrorGeneralInformePdf(); 
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe Estadístico Global", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

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
        const mes = r.mes ?? r.Mes ?? r.MesNombre ?? String(r.Mes);
        const activos = r.activos ?? r.Activos ?? 0;
        const presentes = r.presentes ?? r.Presentes ?? 0;
        const ausentes = r.ausentes ?? r.Ausentes ?? 0;
        const tarde = r.tarde ?? r.Tarde ?? 0;
        const incompletas = r.incompletas ?? r.Incompletas ?? 0;
        const fueraHorario = r.fueraDeHorario ?? r.FueraDeHorario ?? 0;
        const presentismo = (r.porcentajePresentismo ?? r.PorcentajePresentismo ?? 0);
        const ausentismo = (r.porcentajeAusentismo ?? r.PorcentajeAusentismo ?? 0);
        const just = r.justificaciones ?? r.Justificaciones ?? 0;

        body.push([
            mes,
            activos,
            presentes,
            ausentes,
            tarde,
            incompletas,
            fueraHorario,
            `${Number(presentismo).toFixed(2)}%`,
            `${Number(ausentismo).toFixed(2)}%`,
            just
        ]);
    });

    doc.autoTable({
        startY: y,
        head: [["Mes", "Activos", "Presentes", "Ausentes", "Tarde", "Incompleto", "Fue. Horario", "Presentismo (%)", "Ausentismo (%)", "Justificaciones"]],
        body: body,
        styles: { font: "helvetica", fontSize: 10, halign: "center" },
        columnStyles: {
            0: { halign: "left" } 
        },
        headStyles: { fillColor: [19, 115, 204], textColor: 255, fontStyle: "bold", halign: "center" },
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
      <head><title>Informe Estadístico Global</title></head>
      <body class="pdf-body">
        <iframe class="pdf-frame" width="100%" height="100%" src="${url}"></iframe>
      </body>
    </html>`;

    const w = window.open();
    w.document.open();
    w.document.write(html);
    w.document.close();
}





ObtenerEstadisticaGlobal();