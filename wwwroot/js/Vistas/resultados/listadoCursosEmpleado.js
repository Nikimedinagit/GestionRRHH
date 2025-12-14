// =================================== Inicializar Filtros ===================================
$(document).ready(function () {
    ObtenerCursosPorEmpleado();

    $("#EmpleadoIdBuscar, #NombreCursoBuscar, #ResultadoBuscar")
        .on("input change", function () {
            ObtenerCursosPorEmpleado();
        });
});


// =================================== Obtener Listado de Cursos por Empleado ===================================
async function ObtenerCursosPorEmpleado() {
    const filtro = {
        nombreCurso: document.getElementById("NombreCursoBuscar").value,
        nombre: document.getElementById("EmpleadoIdBuscar").value,
        resultado: document.getElementById("ResultadoBuscar").value,
    }
    console.log(filtro);
    try {
        const response = await authFetch("Resultados/CursosPorEmpleadoN3", {
            method: "POST",
            body: JSON.stringify(filtro)
        });
        const data = await response.json();
        MostrarCursosPorEmpleado(data);
        return data;
    }
    catch (error) {
        MostrarErrorCatch();
    }
}


// =================================== Mostrar Listado de Cursos por Empleado ===================================
function MostrarCursosPorEmpleado(data) {
    const tbody = $('#listadoCursosPorEmpleado');
    tbody.empty();

    if (!data || data.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="3" class="text-start">
                    No se encontraron resultados
                </td>
            </tr>
        `);
        return;
    }

    data.forEach(curso => {
        tbody.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="3" class="fw-bold text-start">
                    Curso: ${curso.nombreCurso}
                </td>
            </tr>
        `);

        curso.empleados.forEach(emp => {
            tbody.append(`
                <tr style="background:#e8f0ff !important;">
                    <td colspan="3" class="fw-bold text-start">
                        ${emp.nombreEmpleado}
                    </td>
                </tr>
            `);
            let badgeHtml = "";
            if (!emp.asistio) {
                badgeHtml = `
                    <span style="
                        font-size:0.65rem;
                        padding:2px 6px;
                        border-radius:4px;
                        background:#6c757d;
                        color:#fff;
                        font-weight:600;
                    ">
                        SIN ASISTENCIA
                    </span>
                `;
            } else {
                const aprobado = emp.calificacionTexto === "Aprobado";

                badgeHtml = `
                    <span style="
                        font-size:0.65rem;
                        padding:2px 6px;
                        border-radius:4px;
                        background:${aprobado ? '#d4f4dd' : '#f8d7da'};
                        color:${aprobado ? '#2e7d32' : '#c62828'};
                        font-weight:600;
                    ">
                        ${emp.calificacionTexto.toUpperCase()}
                    </span>
                `;
            }
            const asistioTexto = emp.asistio ? "SI" : "NO";
            const certificadoTexto = emp.tieneCertificado ? "SI" : "NO";
            tbody.append(`
                <tr>
                    <td class="text-start align-middle">
                        ${asistioTexto}
                    </td>
                    <td class="text-center align-middle">
                        ${badgeHtml}
                    </td>
                    <td class="text-center align-middle fw-bold">
                        ${certificadoTexto}
                    </td>
                </tr>
            `);
        });
    });
}


// =================================== Generar Informe en PDF ===================================
async function GenerarInformePdfCursosPorEmpleado() {

    const cursos = await ObtenerCursosPorEmpleado();

    if (!cursos || !Array.isArray(cursos) || cursos.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");

    doc.setTextColor(19, 115, 204);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
        "Informe de Cursos por Empleado",
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

    const totalCursos = cursos.length;
    const totalEmpleados = cursos.reduce((acc, c) => acc + c.empleados.length, 0);

    doc.setFont("helvetica", "normal");
    doc.text("Total Cursos:", 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalCursos}`, 38, y);

    doc.setFont("helvetica", "normal");
    doc.text("| Empleados:", 44, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalEmpleados}`, 68, y);
    y += 6;

    let empleadoRaw = document.getElementById("EmpleadoIdBuscar").value;
    let nombreCursoRaw = document.getElementById("NombreCursoBuscar").value;
    let resultadoRaw = document.getElementById("ResultadoBuscar").value;

    let filtrosAplicadosArray = [];
    if (empleadoRaw) filtrosAplicadosArray.push(`[Empleado: ${empleadoRaw}]`);
    if (nombreCursoRaw) filtrosAplicadosArray.push(`[Curso: ${nombreCursoRaw}]`);
    if (resultadoRaw) filtrosAplicadosArray.push(`[Resultado: ${resultadoRaw}]`);

    const filtrosAplicados =
        filtrosAplicadosArray.length > 0
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
    cursos.forEach(curso => {
        body.push([
            {
                content: curso.nombreCurso,
                colSpan: 3,
                styles: {
                    halign: "left",
                    fillColor: [183, 211, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold"
                }
            }
        ]);

        curso.empleados.forEach(emp => {
            body.push([
                {
                    content: emp.nombreEmpleado,
                    colSpan: 3,
                    styles: {
                        halign: "left",
                        fillColor: [232, 240, 255],
                        textColor: [0, 0, 0],
                        fontStyle: "bold"
                    }
                }
            ]);
            body.push([
                emp.asistio ? "Sí" : "No",
                {
                    content: emp.calificacionTexto,
                    styles: { fontStyle: "bold" }
                },
                emp.tieneCertificado ? "Sí" : "No"
            ]);
        });
    });

    doc.autoTable({
        startY: y,
        head: [["Asistió", "Resultado", "Certificado"]],
        body: body,
        styles: {
            font: "helvetica",
            fontSize: 10
        },
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
            <body style="margin:0">
                <iframe width="100%" height="100%" src="${url}"></iframe>
            </body>
        </html>
    `;

    const w = window.open("", "_blank");
    w.document.open();
    w.document.write(html);
    w.document.title = "Informe de Cursos por Empleado";
    w.document.close();
}




ObtenerCursosPorEmpleado()