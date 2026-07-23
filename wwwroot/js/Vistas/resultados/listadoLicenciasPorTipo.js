// =================================== Inicializar Filtros ===================================
$(document).ready(function () {
    ComboParaFiltrarTipoLicencia();

    $("#FechaInicioBuscar, #FechaFinBuscar, #EmpleadoIdBuscar, #NroLegajoFiltro, #IdTipoLicenciaFiltro, #EstadoIdBuscar")
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

            ObtenerLicenciasPorTipo();
        });
});



// ========================== Completar Selec de Sector Para Poder Filtrar =================
async function ComboParaFiltrarTipoLicencia() {
    const resLocalidades = await authFetch("TipoDeLicencias/Activos", {
        method: "GET",
    });
    const localidades = await resLocalidades.json();

    const $comboLocalidad = $("#IdTipoLicenciaFiltro");
    $comboLocalidad.empty();

    let opciones = `<option value="0">[Todos]</option>`;
    localidades.forEach((item) => {
        opciones += `<option value="${item.id}">${item.nombre}</option>`;
    });
    $comboLocalidad.html(opciones);

    ObtenerLicenciasPorTipo();
}



// =================================== Obtener Listado de Licencias por Tipo ===================================
async function ObtenerLicenciasPorTipo() {

    const filtro = {
        nombre: document.getElementById("EmpleadoIdBuscar").value,
        nroLegajo: document.getElementById("NroLegajoFiltro").value,
        tipoDeLicenciaId: parseInt(document.getElementById("IdTipoLicenciaFiltro").value) || null,
        estado: parseInt(document.getElementById("EstadoIdBuscar").value) || null,
        fechaDesde: document.getElementById("FechaInicioBuscar").value || null,
        fechaHasta: document.getElementById("FechaFinBuscar").value || null,
    }

    try {
        const response = await authFetch("Resultados/LicenciasPorTipoN3", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();

        MostrarLicenciasPorTipo(data);

        return data;
    }
    catch (error) {
        MostrarErrorCatch();
    }
}


// =================================== Mostrar Listado de Licencias por Tipo ===================================
function MostrarLicenciasPorTipo(data) {

    const tabla = $('#listadoLicenciasPorTipo');
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="2" class="text-start">No se encontraron resultados</td></tr>`);
        return;
    }

    const estadoEstilo = {
        PENDIENTE: {
            backgroundColor: "#fff3cd",
            color: "#856404",
            borde: "#ffc107"
        },
        APROBADA: {
            backgroundColor: "#d4f4dd",
            color: "#2e7d32",
            borde: "#52C41A"
        },
        RECHAZADA: {
            backgroundColor: "#f8d7da",
            color: "#c62828",
            borde: "#ff0000"
        },
        EXPIRADA: {
            backgroundColor: "#e2e3e5",
            color: "#495057",
            borde: "#6c757d"
        }
    };

    data.forEach(tipo => {
        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="2" class="fw-bold text-wrap">
                    Tipo de Licencia: ${tipo.tipoDeLicencia}
                </td>
            </tr>
        `);

        tipo.empleados.forEach(emp => {
            tabla.append(`
                <tr style="background:#e8f0ff !important;">
                    <td colspan="2" class="fw-bold text-wrap">
                        ${emp.nombre} (Legajo: ${emp.nroLegajo})
                    </td>
                </tr>
            `);

            emp.licencias.forEach(lic => {
                let estado = (lic.estado || "").trim().toUpperCase();
                const estilo = estadoEstilo[estado] || {
                    backgroundColor: "#e2e3e5",
                    color: "#495057",
                    borde: "#6c757d"
                };

                const badgeHtml = `
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
                        ${estado}
                    </span>
                `;

                tabla.append(`
                    <tr>
                        <td class="text-center align-middle">${badgeHtml}</td>
                        <td class="text-center align-middle text-wrap">${lic.periodo}</td>
                    </tr>
                `);
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




// =================================== Generar Informe PDF Promedio ===================================

async function GenerarInformePdfListadoLicenciasPorTipo() {

    const tipos = await ObtenerLicenciasPorTipo();

    if (!tipos || !Array.isArray(tipos) || tipos.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Licencias por Tipo", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

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
    const totalLicencias = tipos.reduce((acc, tipo) => acc + tipo.empleados.reduce((a, e) => a + e.licencias.length, 0), 0);

    doc.setFont("helvetica", "normal");
    doc.text("Total Tipos de Licencia:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalTipos}`, 56, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Licencias:", 60, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalLicencias}`, 80, y);
    y += 6;

    let fechaInicioRaw = document.getElementById("FechaInicioBuscar").value;
    let fechaFinRaw = document.getElementById("FechaFinBuscar").value;
    let empleadoRaw = document.getElementById("EmpleadoIdBuscar").value;
    let nroLegajoRaw = document.getElementById("NroLegajoFiltro").value;
    let tipoLicenciaRaw = document.getElementById("IdTipoLicenciaFiltro").value;
    let estadoRaw = document.getElementById("EstadoIdBuscar").value;

    let filtrosAplicadosArray = [];

    if (empleadoRaw) filtrosAplicadosArray.push(`[Empleado: ${empleadoRaw}]`);
    if (nroLegajoRaw) filtrosAplicadosArray.push(`[Legajo: ${nroLegajoRaw}]`);
    if (tipoLicenciaRaw && tipoLicenciaRaw !== "0") filtrosAplicadosArray.push(`[Tipo Licencia: ${tipoLicenciaRaw}]`);
    if (estadoRaw && estadoRaw !== "0") {
        const tipoNombreRaw = $("#EstadoIdBuscar option:selected").text();
        const tipoNombre = Capitalizar(tipoNombreRaw);
        filtrosAplicadosArray.push(`[Tipo Licencia: ${tipoNombre}]`);
    }
    if (fechaInicioRaw) filtrosAplicadosArray.push(`[Desde: ${fechaInicioRaw}]`);
    if (fechaFinRaw) filtrosAplicadosArray.push(`[Hasta: ${fechaFinRaw}]`);

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

    tipos.forEach(tipo => {
        body.push([
            {
                content: `Tipo de Licencia: ${tipo.tipoDeLicencia}`,
                colSpan: 3,
                styles: {
                    halign: "left",
                    fillColor: [220, 230, 241],
                    textColor: [0, 0, 0],
                    fontStyle: "bold"
                }
            }
        ]);

        tipo.empleados.forEach(emp => {
            body.push([
                {
                    content: `${emp.nombre} (Legajo: ${emp.nroLegajo})`,
                    colSpan: 3,
                    styles: {
                        halign: "left",
                        fillColor: [232, 240, 255],
                        textColor: [0, 0, 0],
                        fontStyle: "bold"
                    }
                }
            ]);

            emp.licencias.forEach(l => {
                body.push([
                    l.estado,
                    l.periodo,
                    emp.nombre
                ]);
            });
        });
    });

    doc.autoTable({
        startY: y,
        head: [["Estado", "Periodo", "Empleado"]],
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
        doc.save("Informe_Licencias_Por_Tipo.pdf");
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
    w.document.title = "Informe de Licencias por Tipo";
    w.document.close();
}
