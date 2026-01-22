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

// ======================= Media Query =======================
var mqTabletMobile = window.matchMedia("(max-width: 991px)");
var mqMobile = window.matchMedia("(max-width: 574px)");

mqTabletMobile.addEventListener("change", () => {
    if (window._cacheCursosEmpleado)
        MostrarCursosPorEmpleado(window._cacheCursosEmpleado);
});
mqMobile.addEventListener("change", () => {
    if (window._cacheCursosEmpleado)
        MostrarCursosPorEmpleado(window._cacheCursosEmpleado);
});


// =================================== Mostrar Listado de Cursos por Empleado ===================================
function MostrarCursosPorEmpleado(data) {
    window._cacheCursosEmpleado = data;
    const tabla = $("#listadoCursosPorEmpleado");
    tabla.empty();

    if (!data || data.length === 0) {
        tabla.html(`<tr><td colspan="3" class="text-start">No se encontraron resultados</td></tr>`);
        return;
    }

    const isMobile = mqMobile.matches;
    const EstadoCursoEstilo = {
        "SIN ASISTENCIA": { backgroundColor: "#e2e3e5", color: "#495057" },
        "APROBADO": { backgroundColor: "#a3dc9a72", color: "#06923E" },
        "REPROBADO": { backgroundColor: "#f8d7da", color: "#c62828" }
    };

    data.forEach((curso, cIndex) => {
        tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="3" class="fw-bold text-wrap">
                    Curso: ${curso.nombreCurso}
                </td>
            </tr>
        `);
        curso.empleados.forEach((emp, eIndex) => {
            tabla.append(`
                <tr style="background:#e8f0ff !important;">
                    <td colspan="3" class="fw-bold text-wrap">
                        ${emp.nombreEmpleado} (Puesto: ${emp.nombrePuesto})
                    </td>
                </tr>
            `);

            const estadoTexto = emp.asistio && emp.calificacionTexto
                ? emp.calificacionTexto.toUpperCase()
                : "SIN ASISTENCIA";
            const estilo = EstadoCursoEstilo[estadoTexto];
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
                    ${estadoTexto}
                </span>
            `;
            const asistioTexto = emp.asistio ? "SI" : "NO";
            const certificadoTexto = emp.tieneCertificado ? "SI" : "NO";
            const collapseId = `curso_${cIndex}_${eIndex}`;
            if (isMobile) {
                tabla.append(`
                    <tr data-bs-toggle="collapse"
                        data-bs-target="#${collapseId}"
                        style="cursor:pointer;">
                        <td class="text-center">${asistioTexto}</td>
                        <td class="text-center">${badgeHtml}</td>
                    </tr>
                `);

                tabla.append(`
                    <tr class="collapse" id="${collapseId}">
                        <td colspan="3" class="p-2 bg-light" style="font-size:12px;">
                            <b>Certificado:</b> ${certificadoTexto}
                        </td>
                    </tr>
                `);
            } else {

                tabla.append(`
                    <tr>
                        <td class="text-center">${asistioTexto}</td>
                        <td class="text-center">${badgeHtml}</td>
                        <td class="text-center">${certificadoTexto}</td>
                    </tr>
                `);
            }
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
    doc.text("| Empleados:", 42, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalEmpleados}`, 66, y);
    y += 6;

    let empleadoRaw = document.getElementById("EmpleadoIdBuscar").value;
    let nombreCursoRaw = document.getElementById("NombreCursoBuscar").value;
    let resultadoRaw = document.getElementById("ResultadoBuscar").value;

    let filtrosAplicadosArray = [];

    if (empleadoRaw) filtrosAplicadosArray.push(`[Empleado: ${empleadoRaw}]`);
    if (nombreCursoRaw) filtrosAplicadosArray.push(`[Curso: ${nombreCursoRaw}]`);

    if (resultadoRaw) {
        const resultadoCapitalizado =
            resultadoRaw.charAt(0).toUpperCase() + resultadoRaw.slice(1).toLowerCase();
        filtrosAplicadosArray.push(`[Resultado: ${resultadoCapitalizado}]`);
    }

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
                    content: `${emp.nombreEmpleado} (Puesto: ${emp.nombrePuesto})`,
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

    const esMobile = window.innerWidth < 768;

    if (esMobile) {
        doc.save("Informe_Empleados.pdf");
        return;
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