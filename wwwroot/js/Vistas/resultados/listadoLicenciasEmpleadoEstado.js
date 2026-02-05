// =================================== Inicializar Filtros ===================================
$(document).ready(function () {
    ObtenerLicenciasPorEmpleadoEstado();

    $("#FechaInicioBuscar, #FechaFinBuscar, #EmpleadoIdBuscar, #NroLegajoFiltro")
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

            ObtenerLicenciasPorEmpleadoEstado();
        });
});


// =================================== Obtener Listado de Licencias por Empleado y Estado ===================================
async function ObtenerLicenciasPorEmpleadoEstado() {

    const filtro = {
        nombre: document.getElementById("EmpleadoIdBuscar").value,
        nroLegajo: document.getElementById("NroLegajoFiltro").value,
        fechaDesde: document.getElementById("FechaInicioBuscar").value || null,
        fechaHasta: document.getElementById("FechaFinBuscar").value || null,
    }

    console.log(filtro);

    try {
        const response = await authFetch("Resultados/LicenciasPorEmpleadoEstadoN3", {
            method: "POST",
            body: JSON.stringify(filtro)
        });

        const data = await response.json();

        MostrarLicenciasPorEmpleadoEstado(data);

        return data;
    }
    catch (error) {
        MostrarErrorCatch();
    }
}


// =================================== Mostrar Listado de Licencias por Empleado y Estado ===================================
function MostrarLicenciasPorEmpleadoEstado(data) {

    const tabla = $('#listadoLicenciasEmpleadoEstado');
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

    data.forEach(empleado => {
        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="2" class="fw-bold text-wrap">
                    ${empleado.nombre} (Legajo: ${empleado.nroLegajo})
                </td>
            </tr>
        `);

        empleado.estado.forEach(est => {
            let estado = (est.nombre || "").trim().toUpperCase();
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
                <tr style="background:#e8f0ff !important;">
                    <td colspan="2" class="fw-bold text-start">
                        Estado: ${badgeHtml}
                    </td>
                </tr>
            `);

            est.licencia.forEach(lic => {
                tabla.append(`
                    <tr>
                        <td class="text-start align-middle text-wrap">${lic.tipoDeLicencia}</td>
                        <td class="text-center align-middle text-wrap">${lic.periodo}</td>
                    </tr>
                `);
            });
        });
    });
}



// =================================== Generar Informe en PDF ===================================
async function GenerarInformePdfListadoLicenciasPorEmpleadoEstado() {

    const empleados = await ObtenerLicenciasPorEmpleadoEstado();

    if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Informe de Licencias por Empleado y Estado", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    let y = 29;
    const fechaHoy = new Date().toLocaleString("es-AR");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    doc.setFont("helvetica", "normal");
    doc.text("Generado:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(fechaHoy, 33, y);
    y += 6;

    const totalEmpleados = empleados.length;
    const totalLicencias = empleados.reduce((acc, emp) => acc + emp.estado.reduce((a, e) => a + e.licencia.length, 0), 0);

    doc.setFont("helvetica", "normal");
    doc.text("Total Empleados:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalEmpleados}`, 46, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Licencias:", 50, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalLicencias}`, 71, y);
    y += 6;


    let nombreRaw = document.getElementById("EmpleadoIdBuscar").value;
    let legajoRaw = document.getElementById("NroLegajoFiltro").value;
    let fechaInicioRaw = document.getElementById("FechaInicioBuscar").value;
    let fechaFinRaw = document.getElementById("FechaFinBuscar").value;

    let filtrosAplicadosArray = [];
    if (nombreRaw) filtrosAplicadosArray.push(`[Nombre: ${nombreRaw}]`);
    if (legajoRaw) filtrosAplicadosArray.push(`[Legajo: ${legajoRaw}]`);
    if (fechaInicioRaw) filtrosAplicadosArray.push(`[Desde: ${fechaInicioRaw}]`);
    if (fechaFinRaw) filtrosAplicadosArray.push(`[Hasta: ${fechaFinRaw}]`);

    const filtrosAplicados = filtrosAplicadosArray.length > 0 ? filtrosAplicadosArray.join("  |  ") : "No se aplicaron";

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

    empleados.forEach(emp => {
        body.push([
            {
                content: `${emp.nombre} (Legajo: ${emp.nroLegajo})`,
                colSpan: 3,
                styles: {
                    halign: "left",
                    fillColor: [183, 211, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold"
                }
            }
        ]);

        emp.estado.forEach(est => {
            body.push([
                {
                    content: `Estado: ${est.nombre}`,
                    colSpan: 3,
                    styles: {
                        halign: "left",
                        fillColor: [232, 240, 255],
                        textColor: [0, 0, 0],
                        fontStyle: "bold"
                    }
                }
            ]);

            est.licencia.forEach(l => {
                body.push([
                    l.tipoDeLicencia,
                    l.periodo,
                    est.nombre
                ]);
            });
        });
    });

    doc.autoTable({
        startY: y,
        head: [["Tipo de Licencia", "Periodo", "Estado"]],
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
        doc.text("www.WorkSync.com", doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }

    const esMobile = window.innerWidth < 768;

    if (esMobile) {
        doc.save("Informe_Licencias_Por_Empleado_Estado.pdf");
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
    w.document.title = "Informe de Licencias por Empleado y Estado";
    w.document.close();
}



ObtenerLicenciasPorEmpleadoEstado();