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

// =================================== Mostrar Listado de Cursos por Modalidad ===================================
function MostrarCursosPorEstado(data) {
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
    "Sin modalidad": "badge-default",
  };

  data.forEach((empleado) => {
    tbody.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="5" class="fw-bold text-start">
                    Empleado: ${empleado.nombreEmpleado}
                </td>
            </tr>
        `);

    empleado.resultados.forEach((resultado) => {
      tbody.append(`
                <tr style="background:#e8f0ff !important;">
                    <td colspan="5" class="fw-bold text-start ps-3">
                        Resultado: ${resultado.estado}
                    </td>
                </tr>
            `);

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
        const badgeClass = modalidadColor[modalidadText] || "badge-default";

        tbody.append(`
                    <tr>
                        <td class="text-start">${curso.nombreCurso}</td>
                        <td class="text-center">
                            <span class="${badgeClass}">${modalidadText}</span>
                        </td>
                        <td class="text-center">${fechaInicio}</td>
                        <td class="text-center">${fechaFin}</td>
                    </tr>
                `);
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

  const filtrosAplicadosArray = [];
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
  data.forEach((empleado) => {
    body.push([
      {
        content: `Empleado: ${empleado.nombreEmpleado}`,
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
