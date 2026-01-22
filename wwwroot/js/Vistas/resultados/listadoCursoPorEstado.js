// =================================== Inicializar Filtros ===================================
$(document).ready(function () {
  ObtenerCursosPorEstado();

  $("#NombreCursoBuscar, #ResultadoBuscar, #EmpleadoBuscar, #FechaInicioBuscar, #FechaFinBuscar").on(
    "input change",
    function () {
      let fechaInicioRaw = $("#FechaInicioBuscar").val();
      let fechaFinRaw = $("#FechaFinBuscar").val();

      if (fechaInicioRaw && fechaFinRaw) {
        const fechaInicio = new Date(fechaInicioRaw);
        const fechaFin = new Date(fechaFinRaw);

        if (fechaFin < fechaInicio) {
          $("#FechaFinBuscar").val(fechaInicioRaw);
        }
      }
      ObtenerCursosPorEstado();
    }
  );
});

// =================================== Obtener Listado de Cursos por Modalidad ===================================
async function ObtenerCursosPorEstado() {
  const filtro = {
    estado: document.getElementById("ResultadoBuscar").value,
    NombreCurso: document.getElementById("NombreCursoBuscar").value,
    NombreEmpleado: document.getElementById("EmpleadoBuscar").value,
    fechaDesde: document.getElementById("FechaInicioBuscar").value || null,
    fechaHasta: document.getElementById("FechaFinBuscar").value || null,
  };
  console.log(filtro);
  try {
    const response = await authFetch(
      "Resultados/CursosPorEmpleadoYResultadoN3",
      {
        method: "POST",
        body: JSON.stringify(filtro),
      }
    );
    const data = await response.json();
    MostrarCursosPorEstado(data);
    return data;
  } catch (error) {
    MostrarErrorCatch();
  }
}


// ======================= Media Query =======================
var mqTabletMobile = window.matchMedia("(max-width: 991px)");
var mqMobile = window.matchMedia("(max-width: 574px)");

mqTabletMobile.addEventListener("change", () => {
  if (window._cacheCursosEmpleadoEstado)
    MostrarCursosPorEstado(window._cacheCursosEmpleadoEstado);
});
mqMobile.addEventListener("change", () => {
  if (window._cacheCursosEmpleadoEstado)
    MostrarCursosPorEstado(window._cacheCursosEmpleadoEstado);
});


// =================================== Mostrar Listado de Cursos por Modalidad ===================================
function MostrarCursosPorEstado(data) {
  window._cacheCursosEmpleadoEstado = data;
  const tbody = $("#listadoCursosPorEstado");
  tbody.empty();

  if (!data || data.length === 0) {
    tbody.append(`
            <tr>
                <td colspan="5" class="text-start">
                    No se encontraron resultados
                </td>
            </tr>
        `);
    return;
  }

  const modalidadColor = {
    PRESENCIAL: "badge-presencial",
    VIRTUAL: "badge-virtual",
    MIXTO: "badge-mixto",
    "SIN MODALIDAD": "badge-default",
  };

  const EstadoCursoEstilo = {
    "SIN ASISTENCIA": { backgroundColor: "#e2e3e5", color: "#495057" },
    "APROBADO": { backgroundColor: "#a3dc9a72", color: "#06923E" },
    "REPROBADO": { backgroundColor: "#f8d7da", color: "#c62828" }
  };

  const isMobile = mqMobile.matches;

  data.forEach((empleado, empIndex) => {
    tbody.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="5" class="text-wrap fw-bold text-start">
                    ${empleado.nombreEmpleado} (Puesto: ${empleado.nombrePuesto})
                </td>
            </tr>
        `);

    empleado.resultados.forEach((resultado, resIndex) => {
      const estadoTexto = resultado.estado.toUpperCase();
      const estilo = EstadoCursoEstilo[estadoTexto] || { backgroundColor: "#e2e3e5", color: "#495057" };

      const badgeEstadoHtml = `
                <span class="fw-bold"
                      style="
                        display:inline-block;
                        padding:0.35em 0.65em;
                        font-size:0.7rem;
                        font-weight:600;
                        border-radius:0.25rem;
                        background-color: ${estilo.backgroundColor};
                        color: ${estilo.color};
                      ">
                    ${estadoTexto}
                </span>
            `;

      tbody.append(`
                <tr style="background:#e8f0ff !important;">
                    <td colspan="5" class="text-wrap fw-bold text-start">
                        Resultado: ${badgeEstadoHtml}
                    </td>
                </tr>
            `);

      resultado.cursos.forEach((curso, cIndex) => {
        const fechaInicio = new Date(curso.fechaInicio).toLocaleString([], {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const fechaFin = new Date(curso.fechaFin).toLocaleString([], {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        const modalidadTexto = (curso.modalidad || "SIN MODALIDAD").toUpperCase();
        const badgeClass = modalidadColor[modalidadTexto] || "badge-default";
        const badgeHtml = `
                    <span class="${badgeClass} fw-bold"
                          style="
                            display:inline-block;
                            padding:0.35em 0.65em;
                            font-size:0.7rem;
                            font-weight:600;
                            border-radius:0.25rem;
                          ">
                        ${modalidadTexto}
                    </span>
                `;

        const collapseId = `curso_${empIndex}_${resIndex}_${cIndex}`;

        if (isMobile) {
          tbody.append(`
                        <tr data-bs-toggle="collapse"
                            data-bs-target="#${collapseId}"
                            style="cursor:pointer;">
                            <td class="text-start text-wrap">${curso.nombreCurso}</td>
                            <td class="text-center">${badgeHtml}</td>
                        </tr>
                    `);
          tbody.append(`
                        <tr class="collapse" id="${collapseId}">
                            <td colspan="5" class="p-2 bg-light" style="font-size:12px;">
                                <b>Fecha Inicio:</b> ${fechaInicio} <br>
                                <b>Fecha Fin:</b> ${fechaFin}
                            </td>
                        </tr>
                    `);
        } else {
          tbody.append(`
                        <tr>
                            <td class="text-start">${curso.nombreCurso}</td>
                            <td class="text-center">${badgeHtml}</td>
                            <td class="text-center">${fechaInicio}</td>
                            <td class="text-center">${fechaFin}</td>
                        </tr>
                    `);
        }
      });
    });
  });
}



// =================================== Generar Informe en PDF ===================================
async function GenerarInformePdfCursosPorEstado() {
  const data = await ObtenerCursosPorEstado();

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
    "Informe de Cursos por Estado y Empleados",
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

  let totalEmpleados = data.length;
  let totalAprobados = 0;
  let totalReprobados = 0;

  data.forEach((emp) => {
    emp.resultados.forEach((res) => {
      res.cursos.forEach((curso) => {
        if (curso.nota >= 6) totalAprobados++;
        else totalReprobados++;
      });
    });
  });

  doc.setFont("helvetica", "normal");
  doc.text("Total Empleados:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${totalEmpleados}`, 45, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Total Aprobados:", 49, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${totalAprobados}`, 81, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Total Reprobados:", 85, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${totalReprobados}`, 119, y);

  y += 6;

  const nombreCursoRaw = document.getElementById("NombreCursoBuscar").value;
  const empleadoRaw = document.getElementById("EmpleadoBuscar").value;
  const resultadoRaw = document.getElementById("ResultadoBuscar").value;
  const fechaInicioRaw = document.getElementById("FechaInicioBuscar").value;
  const fechaFinRaw = document.getElementById("FechaFinBuscar").value;

  const filtrosAplicadosArray = [];
  if (empleadoRaw) filtrosAplicadosArray.push(`[Empleado: ${empleadoRaw}]`);
  if (nombreCursoRaw) filtrosAplicadosArray.push(`[Curso: ${nombreCursoRaw}]`);
  if (resultadoRaw) filtrosAplicadosArray.push(`[Resultado: ${resultadoRaw}]`);
  if (fechaInicioRaw) {
    filtrosAplicadosArray.push(`[Desde: ${fechaInicioRaw}]`);
  }
  if (fechaFinRaw) {
    filtrosAplicadosArray.push(`[Hasta: ${fechaFinRaw}]`);
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
  data.forEach((empleado) => {
    body.push([
      {
        content: `Empleado: ${empleado.nombreEmpleado} (Puesto: ${empleado.nombrePuesto})`,
        colSpan: 4,
        styles: {
          halign: "left",
          fillColor: [183, 211, 255],
          fontStyle: "bold",
        },
      },
    ]);

    empleado.resultados.forEach((resultado) => {
      body.push([
        {
          content: `Resultado: ${resultado.estado}`,
          colSpan: 4,
          styles: {
            halign: "left",
            fillColor: [232, 240, 255],
            fontStyle: "bold",
          },
        },
      ]);
      resultado.cursos.forEach((curso) => {
        const fechaInicio = new Date(curso.fechaInicio).toLocaleString([], {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const fechaFin = new Date(curso.fechaFin).toLocaleString([], {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        const modalidadText = curso.modalidad || "Sin modalidad";

        body.push([
          curso.nombreCurso,
          {
            content: modalidadText,
            styles: { fontStyle: "bold", halign: "center" },
          },
          fechaInicio,
          fechaFin,
        ]);
      });
    });
  });

  doc.autoTable({
    startY: y,
    head: [["Nombre Curso", "Modalidad", "Fecha Inicio", "Fecha Fin"]],
    body: body,
    styles: { font: "helvetica", fontSize: 10 },
    headStyles: {
      fillColor: [19, 115, 204],
      textColor: 255,
      fontStyle: "bold",
    },
    margin: { left: 14, right: 14 },
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
  const html = `<html><body style="margin:0"><iframe width="100%" height="100%" src="${url}"></iframe></body></html>`;
  const w = window.open("", "_blank");
  w.document.open();
  w.document.write(html);
  w.document.title = "Informe de Cursos por Estado y Empleados";
  w.document.close();
}

ObtenerCursosPorEstado();
