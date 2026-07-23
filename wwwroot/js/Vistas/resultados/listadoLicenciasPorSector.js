// =================================== Inicializar Filtros ===================================
$(document).ready(function () {
    ObtenerLicenciasPorSector();
    ComboParaFiltrarPuesto();
    ComboParaFiltrarSector();

    $("#FechaInicioBuscar, #FechaFinBuscar, #EmpleadoIdBuscar, #NroLegajoFiltro, #IdSectorFiltro, #IdPuestoFiltro, #EstadoIdBuscar")
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

            ObtenerLicenciasPorSector();
        });
});



// ========================== Completar Selec de Sector Para Poder Filtrar =================
async function ComboParaFiltrarSector() {
    const resLocalidades = await authFetch("Sector/Activos", {
        method: "GET",
    });
    const localidades = await resLocalidades.json();

    const $comboLocalidad = $("#IdSectorFiltro");
    $comboLocalidad.empty();

    let opciones = `<option value="0">[Todos]</option>`;
    localidades.forEach((item) => {
        opciones += `<option value="${item.id}">${item.nombre}</option>`;
    });
    $comboLocalidad.html(opciones);
    ObtenerLicenciasPorSector()
}


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
    ObtenerLicenciasPorSector()
}

// =================================== Obtener Listado de Licencias por Sector ===================================
async function ObtenerLicenciasPorSector() {

    const filtro = {
        nombre: document.getElementById("EmpleadoIdBuscar").value,
        nroLegajo: document.getElementById("NroLegajoFiltro").value,
        sector: parseInt(document.getElementById("IdSectorFiltro").value) || null,
        puesto: parseInt(document.getElementById("IdPuestoFiltro").value) || null,
        estado: parseInt(document.getElementById("EstadoIdBuscar").value) || null,
        fechaDesde: document.getElementById("FechaInicioBuscar").value || null,
        fechaHasta: document.getElementById("FechaFinBuscar").value || null,
    }

    try {
        const response = await authFetch("Resultados/LicenciasPorSectorN4", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();

        MostrarLicenciasPorSector(data);

        return data;
    }
    catch (error) {
        MostrarErrorCatch();
    }
}


// ======================== Detectar Responsividad con collapse =============================
var mediaQuery = window.matchMedia("(max-width: 574px)");
mediaQuery.addEventListener("change", () => {
    if (window._cacheLicenciasSector) {
        MostrarLicenciasPorSector(window._cacheLicenciasSector);
    }
});



// =================================== Mostrar Listado de Licencias por Sector ===================================
function MostrarLicenciasPorSector(data) {

    window._cacheLicenciasSector = data;


    const tabla = $('#listadoLicenciasPorSector');
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="3" class="text-start">No se encontraron resultados</td></tr>`);
        return;
    }

    const estadoEstilo = {
        PENDIENTE: { backgroundColor: "#fff3cd", color: "#856404" },
        APROBADA: { backgroundColor: "#d4f4dd", color: "#2e7d32" },
        RECHAZADA: { backgroundColor: "#f8d7da", color: "#c62828" },
        EXPIRADA: { backgroundColor: "#e2e3e5", color: "#495057" },
        DEFAULT: { backgroundColor: "#e2e3e5", color: "#495057" }
    };

    const badgeBaseStyle = `
        display:inline-block;
        padding:0.35em 0.65em;
        font-size:0.7rem;
        font-weight:600;
        border-radius:0.25rem;
    `;

    const mediaQuery = window.matchMedia("(max-width: 574px)");
    let isMobile = mediaQuery.matches;
    mediaQuery.addEventListener("change", e => { isMobile = e.matches; });

    data.forEach((sector, iSector) => {
        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="3" class="fw-bold text-wrap">
                    Sector: ${sector.sector}
                </td>
            </tr>
        `);

        sector.puestos.forEach((puesto, iPuesto) => {
            tabla.append(`
                <tr style="background:#e8f0ff !important;">
                    <td colspan="3" class="fw-bold text-wrap">
                        Puesto: ${puesto.puesto}
                    </td>
                </tr>
            `);

            puesto.empleados.forEach((emp, iEmp) => {
                tabla.append(`
                    <tr style="background:#f0f9ff !important;">
                        <td colspan="3" class="fw-bold text-wrap">
                            ${emp.nombre} (Legajo: ${emp.nroLegajo})
                        </td>
                    </tr>
                `);

                emp.licencias.forEach((lic, iLic) => {
                    const estado = (lic.estado || "").trim().toUpperCase();
                    const estilo = estadoEstilo[estado] || estadoEstilo.DEFAULT;

                    const badgeHtml = `
                        <span style="${badgeBaseStyle}
                                     background-color:${estilo.backgroundColor};
                                     color:${estilo.color};">
                            ${estado}
                        </span>
                    `;

                    const collapseId = `collapse${iSector}_${iPuesto}_${iEmp}_${iLic}`;
                    const attrs = isMobile
                        ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;"`
                        : `style="cursor:default;"`;

                    tabla.append(`
                        <tr ${attrs}>
                            <td class="text-start align-middle text-wrap">${lic.tipoDeLicencia}</td>
                            <td class="text-center align-middle">${badgeHtml}</td>
                            <td class="text-center align-middle text-wrap ${isMobile ? "d-none" : ""}">
                                ${lic.periodo}
                            </td>
                        </tr>
                    `);

                    if (isMobile) {
                        tabla.append(`
                            <tr id="${collapseId}" class="collapse">
                                <td colspan="3" class="p-2 bg-light text-wrap">
                                    <b>Periodo:</b> ${lic.periodo}
                                </td>
                            </tr>
                        `);
                    }
                });
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



//===================== Generar Informe en PDF =======================================
async function GenerarInformePdfListadoLicenciasPorSector() {

    const sectores = await ObtenerLicenciasPorSector();

    if (!sectores || !Array.isArray(sectores) || sectores.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Licencias por Sector", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    let y = 29;
    const fechaHoy = new Date().toLocaleString("es-AR");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    doc.setFont("helvetica", "normal");
    doc.text("Generado:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(fechaHoy, 33, y);
    y += 6;

    const totalSectores = sectores.length;
    const totalLicencias = sectores.reduce((acc, s) => acc + s.puestos.reduce((a, p) => a + p.empleados.reduce((e, emp) => e + emp.licencias.length, 0), 0), 0);

    doc.setFont("helvetica", "normal");
    doc.text("Total Sectores:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalSectores}`, 41, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Licencias:", 45, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalLicencias}`, 66, y);
    y += 6;

    const sectorRaw = $("#IdSectorFiltro option:selected").text();
    const puestoRaw = $("#IdPuestoFiltro option:selected").text();
    const empleadoRaw = $("#EmpleadoIdBuscar").val();
    const nroLegajoRaw = $("#NroLegajoFiltro").val();
    const estadoRaw = $("#EstadoIdBuscar option:selected").text();
    const fechaInicioRaw = $("#FechaInicioBuscar").val();
    const fechaFinRaw = $("#FechaFinBuscar").val();

    let filtrosAplicadosArray = [];

    if (sectorRaw && sectorRaw !== "[Todos]" && sectorRaw !== "0") {
        filtrosAplicadosArray.push(`[Sector: ${Capitalizar(sectorRaw)}]`);
    }
    if (puestoRaw && puestoRaw !== "[Todos]" && puestoRaw !== "0" && puestoRaw !== "No hay puestos disponibles") {
        filtrosAplicadosArray.push(`[Puesto: ${Capitalizar(puestoRaw)}]`);
    }
    if (empleadoRaw) {
        filtrosAplicadosArray.push(`[Empleado: ${empleadoRaw}]`);
    }
    if (nroLegajoRaw) {
        filtrosAplicadosArray.push(`[Legajo: ${nroLegajoRaw}]`);
    }
    if (estadoRaw && estadoRaw !== "[Todos]" && estadoRaw !== "0") {
        filtrosAplicadosArray.push(`[Estado: ${Capitalizar(estadoRaw)}]`);
    }
    if (fechaInicioRaw) {
        filtrosAplicadosArray.push(`[Desde: ${fechaInicioRaw}]`);
    }
    if (fechaFinRaw) {
        filtrosAplicadosArray.push(`[Hasta: ${fechaFinRaw}]`);
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

    sectores.forEach(sector => {
        body.push([
            {
                content: `Sector: ${sector.sector}`,
                colSpan: 3,
                styles: { halign: "left", fillColor: [220, 230, 241], textColor: [0, 0, 0], fontStyle: "bold" }
            }
        ]);

        sector.puestos.forEach(puesto => {
            body.push([
                {
                    content: `Puesto: ${puesto.puesto}`,
                    colSpan: 3,
                    styles: { halign: "left", fillColor: [232, 240, 255], textColor: [0, 0, 0], fontStyle: "bold" }
                }
            ]);

            puesto.empleados.forEach(emp => {
                body.push([
                    {
                        content: `${emp.nombre} (Legajo: ${emp.nroLegajo})`,
                        colSpan: 3,
                        styles: { halign: "left", fillColor: [240, 249, 255], textColor: [0, 0, 0], fontStyle: "bold" }
                    }
                ]);

                emp.licencias.forEach(l => {
                    body.push([l.tipoDeLicencia, l.estado, l.periodo]);
                });
            });
        });
    });

    doc.autoTable({
        startY: y,
        head: [["Tipo de Licencia", "Estado", "Periodo"]],
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
        doc.save("Informe_Licencias_Por_Sector.pdf");
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
    w.document.title = "Informe de Licencias por Sector";
    w.document.close();
}
