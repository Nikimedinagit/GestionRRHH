// =================================== Inicializar los Filtros ===================================
$(document).ready(function () {
  ObtenerPromedioPorEmpleado();

  $(
    "#EmpleadoIdBuscar, #ModalidadBuscar, #FechaInicioBuscar, #FechaFinBuscar"
  ).on("input change", function () {
    let fechaInicioRaw = $("#FechaInicioBuscar").val();
    let fechaFinRaw = $("#FechaFinBuscar").val();

    if (fechaInicioRaw && fechaFinRaw) {
      const fechaInicio = new Date(fechaInicioRaw);
      const fechaFin = new Date(fechaFinRaw);

      if (fechaFin < fechaInicio) {
        $("#FechaFinBuscar").val(fechaInicioRaw);
      }
    }

    ObtenerPromedioPorEmpleado();
  });
});

// =================================== Obtener Listado de Resultado Emeplados ===================================
async function ObtenerPromedioPorEmpleado() {
  const filtro = {
    nombreEmpleado: document.getElementById("EmpleadoIdBuscar").value,
    modalidad: parseInt(document.getElementById("ModalidadBuscar").value),
    fechaDesde: document.getElementById("FechaInicioBuscar").value || null,
    fechaHasta: document.getElementById("FechaFinBuscar").value || null,
  };

  try {
    const response = await authFetch(
      "Resultados/PromedioCalificacionPorEmpleado",
      {
        method: "POST",
        body: JSON.stringify(filtro),
      }
    );

    const data = await response.json();

    MostrarPromedioPorEmpleado(data);

    return data;
  } catch (error) {
    MostrarErrorCatch();
  }
}

// ======================== Detectar Responsividad con collapse =============================
function reRenderIfCachePromedio() {
  if (window._cachePromedioEmpleado) {
    MostrarPromedioPorEmpleado(window._cachePromedioEmpleado);
  }
}
window.addEventListener("resize", reRenderIfCachePromedio);

// ======================== Mostarr Datos =============================
function MostrarPromedioPorEmpleado(data) {
  window._cachePromedioEmpleado = data;
  const tabla = $("#listadoPromedioPorEmpleado");
  tabla.empty();

  if (!data || data.length === 0) {
    tabla.html(`<tr><td colspan="5" class="text-start">No se encontraron resultados</td></tr>`);
    return;
  }

  const width = window.innerWidth;
  const isMobile = width < 576;
  const isTablet = width >= 576 && width < 992;
  const isDesktop = width >= 992;

  const badge = (t, bg, color) =>
    `<span style="
      display:inline-block;
      padding:0.35em 0.65em;
      font-size:0.75rem;
      font-weight:600;
      border-radius:0.25rem;
      background:${bg};
      color:${color};
    "><b>${t}</b></span>`;

  data.forEach((emp, idx) => {
    const collapseId = `collapseProm_${idx}`;

    // Header empleado
    tabla.append(`
      <tr style="background:#b7d3ff !important;">
        <td colspan="6" class="fw-bold text-wrap">
          ${emp.nombreEmpleado}, (NroLegajo: ${emp.nroLegajo}, Puesto: ${emp.nombrePuesto})
        </td>
      </tr>
    `);

    const totalCursos = emp.totalCursosRealizados ?? 0;
    const promedio = parseFloat(emp.notaPromedio) ?? 0;
    const mejor = emp.mejorCalificacion ?? 0;
    const peor = emp.peorCalificacion ?? 0;

    const aprobado = promedio >= 6;
    const badgePromedio = badge(
      promedio.toFixed(2),
      aprobado ? "#d4edda" : "#f8d7da",
      aprobado ? "#155724" : "#721c24"
    );

    const badgeMejor = badge(mejor, "#d4edda", "#155724");
    const badgePeor = badge(peor, "#f8d7da", "#721c24");

    /* ================= DESKTOP ================= */
    if (isDesktop) {
      tabla.append(`
        <tr>
          <td class="text-center fw-bold">${totalCursos}</td>
          <td class="text-center fw-bold">${badgePromedio}</td>
          <td class="text-center">${badgeMejor}</td>
          <td class="text-center">${badgePeor}</td>
        </tr>
      `);
      return;
    }

    /* ================= TABLET & MOBILE ================= */
    tabla.append(`
      <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
        <td class="text-center fw-bold">${totalCursos}</td>
        <td class="text-center fw-bold">${badgePromedio}</td>
      </tr>
    `);

    tabla.append(`
      <tr id="${collapseId}" class="collapse">
        <td colspan="2" class="p-2 bg-light">
          <div class="small d-flex flex-column gap-2">
            <div><b>Mejor calificación:</b> ${badgeMejor}</div>
            <div><b>Peor calificación:</b> ${badgePeor}</div>
          </div>
        </td>
      </tr>
    `);
  });
}



// =================================== Generar Informe PDF Resultado Emeplados ===================================
async function GenerarInformePdfPromedioPorEmpleado() {
  const empleados = await ObtenerPromedioPorEmpleado();

  if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
    ErrorGeneralInformePdf();
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  doc.setTextColor(19, 115, 204);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Informe de Promedio de Calificaciones por Empleado",
    doc.internal.pageSize.getWidth() / 2,
    20,
    { align: "center" }
  );

  let y = 29;

  const fechaHoy = new Date().toLocaleString("es-AR");

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.text("Generado:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(fechaHoy, 33, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text("Total Empleados:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${empleados.length}`, 46, y);
  y += 6;

  const nombreEmpleado =
    document.getElementById("EmpleadoIdBuscar")?.value || "";
  const modalidadRaw = document.getElementById("ModalidadBuscar")?.value;
  const fechaDesde = document.getElementById("FechaInicioBuscar")?.value || "";
  const fechaHasta = document.getElementById("FechaFinBuscar")?.value || "";

  const modalidadTexto = modalidadRaw
    ? modalidadRaw == 1
      ? "Presencial"
      : modalidadRaw == 2
      ? "Virtual"
      : modalidadRaw == 3
      ? "Mixta"
      : ""
    : "";

  let filtrosAplicadosArray = [];
  if (nombreEmpleado)
    filtrosAplicadosArray.push(`[Empleado: ${nombreEmpleado}]`);
  if (modalidadTexto)
    filtrosAplicadosArray.push(`[Modalidad: ${modalidadTexto}]`);
  if (fechaDesde) filtrosAplicadosArray.push(`[Desde: ${fechaDesde}]`);
  if (fechaHasta) filtrosAplicadosArray.push(`[Hasta: ${fechaHasta}]`);

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
  empleados.forEach((emp) => {
    body.push([
      {
        content: `${emp.nombreEmpleado}, (Legajo: ${emp.nroLegajo}, Puesto: ${emp.nombrePuesto})`,
        colSpan: 4,
        styles: {
          halign: "left",
          fillColor: [183, 211, 255],
          fontStyle: "bold",
        },
      },
    ]);
    body.push([
      emp.totalCursosRealizados ?? 0,
      emp.notaPromedio?.toFixed(2) ?? "0.00",
      emp.mejorCalificacion ?? 0,
      emp.peorCalificacion ?? 0,
    ]);
  });

  doc.autoTable({
    startY: y,
    head: [
      [
        "Total Cursos",
        "Nota Promedio",
        "Mejor Calificación",
        "Peor Calificación",
      ],
    ],
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
  w.document.title = "Informe de Promedio de Calificaciones por Empleado";
  w.document.close();
}


ObtenerPromedioPorEmpleado()