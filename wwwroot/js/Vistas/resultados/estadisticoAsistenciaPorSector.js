
// =============== Inicializar Filtros al Cargar la Página =================================
$(document).ready(function () {

    $("#IdSectorFiltro, #EmpleadoIdBuscar, #NroLegajoFiltro").on("input change", function () {
        ObtenerAsistenciaPorSector();
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



    ObtenerAsistenciaPorSector();
}



// =================================== Obtener Listado de Asistencia Por Empleado ===================================
async function ObtenerAsistenciaPorSector() {

    const sectorFiltro = document.getElementById("IdSectorFiltro").value;

    const filtro = {
        sector: sectorFiltro === "0" ? null : Number(sectorFiltro),
        nombre: document.getElementById("EmpleadoIdBuscar").value,
        nroLegajo: document.getElementById("NroLegajoFiltro").value,
    }

    try {
        const response = await authFetch("Resultados/EmpleadoAsistenciaSectorN2", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();

        MostrarAsistenciaPorSector(data);

        return data;
    }
    catch (error) {
        MostrarErrorCatch();
    }
}



// ======================= Media Query =======================
var mqTabletMobile = window.matchMedia("(max-width: 991px)");
var mqMobile = window.matchMedia("(max-width: 574px)");

mqTabletMobile.addEventListener("change", () => {
    if (window._cacheAsistenciaSector) MostrarAsistenciaPorSector(window._cacheAsistenciaSector);
});
mqMobile.addEventListener("change", () => {
    if (window._cacheAsistenciaSector) MostrarAsistenciaPorSector(window._cacheAsistenciaSector);
});



// ======================= Mostrar Asistencia por Sector =======================
function MostrarAsistenciaPorSector(data) {

    window._cacheAsistenciaSector = data;

    const tabla = $('#listadoAsistenciaPorSector');
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="6" class="text-start">No se encontraron resultados</td></tr>`);
        return;
    }

    const badgeStyle = {
        presente: { bg: "#a3dc9a72", color: "#06923E" },
        ausente: { bg: "#f8d7da", color: "#c62828" },
        incompleta: { bg: "#fff3cd", color: "#856404" },
        tarde: { bg: "#ffe5d0", color: "#d35400" },
        fuera: { bg: "#e2e3e5", color: "#495057" }
    };

    const badgeBase = `
        display:inline-block;
        padding:0.35em 0.65em;
        font-size:0.75rem;
        font-weight:600;
        border-radius:0.25rem;
    `;

    const badge = (valor, estilo) =>
        `<span style="${badgeBase} background:${estilo.bg}; color:${estilo.color};">${valor}</span>`;

    const isMobile = mqMobile.matches;
    const isTabletMobile = mqTabletMobile.matches;

    data.forEach((sector, idxSector) => {

        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="6" class="fw-bold text-start text-wrap">
                    ${sector.nombre}
                </td>
            </tr>
        `);

        sector.empeladoAsistencia.forEach((emp, idxEmp) => {

            const collapseId = `sec_${idxSector}_${idxEmp}`;

            if (isMobile) {
                tabla.append(`
                    <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                        <td colspan="6" class="text-start text-wrap">
                            ${emp.nombre} (Nro Legajo: ${emp.nroLegajo})
                        </td>
                    </tr>
                `);

                tabla.append(`
                    <tr class="collapse" id="${collapseId}">
                        <td colspan="6" class="p-2 bg-light" style="font-size:12px !important;">
                            <b>Presente:</b> ${badge(emp.presente, badgeStyle.presente)}<br>
                            <b>Ausente:</b> ${badge(emp.ausentes, badgeStyle.ausente)}<br>
                            <b>Incompleta:</b> ${badge(emp.incompletas, badgeStyle.incompleta)}<br>
                            <b>Tarde:</b> ${badge(emp.tarde, badgeStyle.tarde)}<br>
                            <b>Fuera de horario:</b> ${badge(emp.fueraDeHorario, badgeStyle.fuera)}
                        </td>
                    </tr>
                `);
                return;
            }

            if (isTabletMobile) {
                tabla.append(`
                    <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                        <td class="text-start text-wrap">
                            ${emp.nombre} (Legajo: ${emp.nroLegajo})
                        </td>
                        <td class="text-center">${badge(emp.presente, badgeStyle.presente)}</td>
                        <td class="text-center">${badge(emp.ausentes, badgeStyle.ausente)}</td>
                    </tr>
                `);

                tabla.append(`
                    <tr class="collapse" id="${collapseId}">
                        <td colspan="6" class="p-2 bg-light" style="font-size:12px;">
                            <b>Incompleta:</b> ${badge(emp.incompletas, badgeStyle.incompleta)}<br>
                            <b>Tarde:</b> ${badge(emp.tarde, badgeStyle.tarde)}<br>
                            <b>Fuera de horario:</b> ${badge(emp.fueraDeHorario, badgeStyle.fuera)}
                        </td>
                    </tr>
                `);
                return;
            }

            tabla.append(`
                <tr>
                    <td class="text-start text-wrap">${emp.nombre} (Legajo: ${emp.nroLegajo})</td>
                    <td class="text-center">${badge(emp.presente, badgeStyle.presente)}</td>
                    <td class="text-center">${badge(emp.ausentes, badgeStyle.ausente)}</td>
                    <td class="text-center">${badge(emp.incompletas, badgeStyle.incompleta)}</td>
                    <td class="text-center">${badge(emp.tarde, badgeStyle.tarde)}</td>
                    <td class="text-center">${badge(emp.fueraDeHorario, badgeStyle.fuera)}</td>
                </tr>
            `);
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



// ========================== Generar Informe en PDF  ===============
async function GenerarInformePdfListadoAsistenciaEmpeladoSector() {

    const sectores = await ObtenerAsistenciaPorSector();

    if (!sectores || !Array.isArray(sectores) || sectores.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Asistencia de Empleados por Sector", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

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
    const totalEmpleados = sectores.reduce((a, s) => a + s.empeladoAsistencia.length, 0);

    doc.setFont("helvetica", "normal");
    doc.text("Total Sectores:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalSectores}`, 42, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Empleados:", 46, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalEmpleados}`, 70, y);
    y += 6;

    let sectorFiltro = $("#IdSectorFiltro").val();

    let filtros = [];
    if (sectorFiltro && sectorFiltro !== "0") {
        const nombre = $("#IdSectorFiltro option:selected").text();
        const nombreCap = Capitalizar(nombre);
        filtros.push(`[Sector: ${nombreCap}]`);
    }

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

    sectores.forEach(sector => {
        body.push([{
            content: `Sector: ${sector.nombre}`,
            colSpan: 7,
            styles: { fillColor: [183, 211, 255], fontStyle: "bold" }
        }]);

        sector.empeladoAsistencia.forEach(emp => {
            body.push([
                `${emp.nombre} (Nro Legajo: ${emp.nroLegajo})`,
                emp.presente,
                emp.ausentes,
                emp.incompletas,
                emp.tarde,
                emp.fueraDeHorario
            ]);
        });
    });

    if (body.length === 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(180, 0, 0);
        doc.text(
            "No hay resultados para los filtros aplicados.",
            doc.internal.pageSize.getWidth() / 2,
            y + 10,
            { align: "center" }
        );
    } else {
        doc.autoTable({
            startY: y,
            head: [["Nombre", "Presente", "Ausente", "Incompleta", "Tarde", "Fuera de Horario"]],
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
        doc.text("www.LoguiSoft.com", doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }

    const esMobile = window.innerWidth < 768;

    if (esMobile) {
        doc.save("Informe_Estadistico_De_Asistenica_Por_Sector.pdf");
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
    w.document.title = "Informe Estadistico de Asistencia por Sector";
    w.document.close();
}



ComboParaFiltrarSector();