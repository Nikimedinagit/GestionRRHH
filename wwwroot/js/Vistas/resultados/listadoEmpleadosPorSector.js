// =========================================================================================
// =============== Inicializar Filtros al Cargar la Página =================================
// =========================================================================================
$(document).ready(function () {
    ObtenerEmpleadosPorSector();

    $("#EmpleadoIdBuscar, #NroLegajoFiltro, #IdSectorFiltro").on("input change", function () {
        ObtenerEmpleadosPorSector();
    });
});



// =========================================================================================
// ========================== Completar Selec de Sector Para Poder Filtrar =================
// =========================================================================================
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



    ObtenerEmpleadosPorSector();
}

// =========================================================================================
// =========================== Obtener Listado desde la API =================================
// =========================================================================================
async function ObtenerEmpleadosPorSector() {

    const sectorFiltro = document.getElementById("IdSectorFiltro").value;

    const filtro = {
        nombre: document.getElementById("EmpleadoIdBuscar").value,
        nroLegajo: document.getElementById("NroLegajoFiltro").value,
        sector: sectorFiltro === "0" ? null : Number(sectorFiltro)
    };

    try {
        const response = await authFetch("Resultados/SectorEmpleadoN2", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();

        MostrarEmpleadosPorSector(data);

        return data;

    } catch (error) {
        MostrarErrorCatch();
    }
}

// =========================================================================================
// ======================== Detectar Responsividad con collapse =============================
// =========================================================================================
var mediaQuery = window.matchMedia("(max-width: 767px)");
mediaQuery.addEventListener("change", () => {
    if (window._cacheEmpleadosSector) {
        MostrarEmpleadosPorSector(window._cacheEmpleadosSector);
    }
});

// =========================================================================================
// ========================== Renderizar Tabla de Resultados =================================
// =========================================================================================
function MostrarEmpleadosPorSector(data) {

    window._cacheEmpleadosSector = data;

    const tabla = $("#listadoEmpeladoPorSector");
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="3" class="text-start">No se encontraron resultados</td></tr>`);
        return;
    }

    let isMobile = mediaQuery.matches;

    data.forEach((sector, indexSector) => {

        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="3" class="fw-bold text-wrap">
                    Sector: ${sector.nombre}
                </td>
            </tr>
        `);

        sector.empleados.forEach((emp, indexEmp) => {

            const collapseId = `collapse${indexSector}_${indexEmp}`;
            const attrs = isMobile
                ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;"`
                : `style="cursor:default;"`;

            tabla.append(`
                <tr ${attrs}>
                    <td class="text-start align-middle">${emp.nombre}</td>
                    <td class="text-center align-middle">${emp.nroLegajo}</td>
                    <td class="text-start align-middle">${emp.puesto}</td>
                </tr>
            `);

            if (isMobile) {
                tabla.append(`
                    <tr id="${collapseId}" class="collapse">
                        <td colspan="3" class="p-2 bg-light text-wrap">
                            <b>Nombre:</b> ${emp.nombre} <br>
                            <b>Legajo:</b> ${emp.nroLegajo} <br>
                            <b>Puesto:</b> ${emp.puesto}
                        </td>
                    </tr>
                `);
            }
        });
    });
}



// =========================================================================================
// ========================== Formatear Nombre de los Select=========================================
// =========================================================================================
function Capitalizar(texto) {
    if (!texto) return "";
    return texto
        .toLowerCase() 
        .replace(/\b\w/g, char => char.toUpperCase());
}


// =========================================================================================
// ========================== Generar Informe en PDF =========================================
// =========================================================================================
async function GenerarInformePdfListadoEmpleadoPorSector() {

    const sectores = await ObtenerEmpleadosPorSector();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Empleados por Sector", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

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
    const totalEmpleados = sectores.reduce((a, s) => a + s.empleados.length, 0);

    doc.setFont("helvetica", "normal");
    doc.text("Total Sectores:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalSectores}`, 42, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Total Empleados:", 46, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalEmpleados}`, 80, y);
    y += 6;

    let nombreFiltro = $("#EmpleadoIdBuscar").val();
    let legajoFiltro = $("#NroLegajoFiltro").val();
    let sectorFiltro = $("#IdSectorFiltro").val();

    let filtros = [];
    if (nombreFiltro) filtros.push(`[Nombre: ${nombreFiltro}]`);
    if (legajoFiltro) filtros.push(`[Legajo: ${legajoFiltro}]`);
    if (sectorFiltro && sectorFiltro !== "0") {
    const sectorNombreRaw = $("#IdSectorFiltro option:selected").text();
    const sectorNombre = Capitalizar(sectorNombreRaw);
    filtros.push(`[Sector: ${sectorNombre}]`);
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
            colSpan: 3,
            styles: { fillColor: [183, 211, 255], fontStyle: "bold" }
        }]);

        sector.empleados.forEach(emp => {
            body.push([emp.nombre, emp.nroLegajo, emp.puesto]);
        });
    });

    if (sectores.length === 0 || body.length === 0) {
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
            head: [["Nombre", "Legajo", "Puesto"]],
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
        doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10, { align: "left" });
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
    w.document.title = "Informe de Empleados por Sector";
    w.document.close();
}

ComboParaFiltrarSector();
