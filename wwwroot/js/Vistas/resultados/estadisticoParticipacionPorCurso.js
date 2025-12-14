// =================================== Inicializar los Filtros ===================================
$(document).ready(function () {
  ObtenerParticipacionPorCurso();

  $(
    "#NombreCursoBuscar, #ModalidadBuscar, #FechaInicioBuscar, #FechaFinBuscar"
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

    ObtenerParticipacionPorCurso();
  });
});

// =================================== Obtener Listado de Resultado Emeplados ===================================
async function ObtenerParticipacionPorCurso() {
  const filtro = {
    nombreCurso: document.getElementById("NombreCursoBuscar").value,
    modalidad: parseInt(document.getElementById("ModalidadBuscar").value),
    fechaDesde: document.getElementById("FechaInicioBuscar").value || null,
    fechaHasta: document.getElementById("FechaFinBuscar").value || null,
  };

  try {
    const response = await authFetch("Resultados/ParticipacionPorCurso", {
      method: "POST",
      body: JSON.stringify(filtro),
    });

    const data = await response.json();

    MostrarParticipacionPorCurso(data);

    return data;
  } catch (error) {
    MostrarErrorCatch();
  }
}

// ======================== Detectar Responsividad con collapse =============================
function reRenderIfCachePromedio() {
  if (window._cachePromedioEmpleado) {
    MostrarParticipacionPorCurso(window._cachePromedioEmpleado);
  }
}
window.addEventListener("resize", reRenderIfCachePromedio);

// ======================== Mostarr Datos =============================
function MostrarParticipacionPorCurso(data) {
  const tabla = $("#listadoParticipacionPorCurso");
  tabla.empty();

  if (!data || data.length === 0) {
    tabla.html(
      `<tr><td colspan="6" class="text-start">No se encontraron resultados</td></tr>`
    );
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

  data.forEach((curso, idx) => {
    const collapseId = `collapseCurso_${idx}`;
    tabla.append(`
            <tr style="background:#b7d3ff !important;">
                <td colspan="6" class="fw-bold text-wrap">
                    ${curso.nombreCurso} <span class="text-muted">(${curso.modalidad})</span>
                </td>
            </tr>
        `);

    const participantes = curso.totalParticipantes ?? 0;
    const asistentes = curso.totalAsistentes ?? 0;
    const ausentes = curso.totalAusentes ?? 0;
    const porcentaje = curso.porcentajeAsistencia?.toFixed(2) ?? "0.00";
    const certificados = curso.totalCertificadosEmitidos ?? 0;
    if (isDesktop) {
      tabla.append(`
                <tr>
                    <td class="text-center">${participantes}</td>
                    <td class="text-center">${asistentes}</td>
                    <td class="text-center">${ausentes}</td>
                    <td class="text-center fw-bold">${porcentaje}%</td>
                    <td class="text-center">
                        ${badge(certificados, "#d1ecf1", "#0c5460")}
                    </td>
                </tr>
            `);
    } else if (isTablet) {
      tabla.append(`
                <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                    <td class="text-center">${participantes}</td>
                    <td class="text-center">${asistentes}</td>
                    <td class="text-center">${ausentes}</td>
                </tr>
            `);

      tabla.append(`
                <tr class="collapse" id="${collapseId}">
                    <td colspan="3" class="p-2 bg-light">
                        <div class="d-flex flex-column gap-2 small" style="font-size:12px">
                            <div><b>% Asistencia:</b> ${porcentaje}%</div>
                            <div><b>Certificados emitidos:</b> 
                                ${badge(certificados, "#d1ecf1", "#0c5460")}
                            </div>
                        </div>
                    </td>
                </tr>
            `);
    } else {
      tabla.append(`
                <tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" style="cursor:pointer;">
                    <td class="text-center">${participantes}</td>
                    <td class="text-center">${asistentes}</td>
                </tr>
            `);

      tabla.append(`
                <tr class="collapse" id="${collapseId}">
                    <td colspan="2" class="p-2 bg-light">
                        <div class="d-flex flex-column gap-2 small" style="font-size:12px">
                            <div><b>Ausentes:</b> ${ausentes}</div>
                            <div><b>% Asistencia:</b> ${porcentaje}%</div>
                            <div><b>Certificados:</b> ${certificados}</div>
                        </div>
                    </td>
                </tr>
            `);
    }
  });
}

// =================================== Generar Informe PDF Resultado Emeplados ===================================
async function GenerarInformePdfParticipacionPorCurso() {
  const cursos = await ObtenerParticipacionPorCurso();

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
    "Informe de Participación y Asistencia por Curso",
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
  doc.text("Total Cursos:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${cursos.length}`, 40, y);
  y += 6;

  const nombreCurso = document.getElementById("NombreCursoBuscar")?.value || "";
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

  let filtros = [];
  if (nombreCurso) filtros.push(`[Curso: ${nombreCurso}]`);
  if (modalidadTexto) filtros.push(`[Modalidad: ${modalidadTexto}]`);
  if (fechaDesde) filtros.push(`[Desde: ${fechaDesde}]`);
  if (fechaHasta) filtros.push(`[Hasta: ${fechaHasta}]`);

  const filtrosAplicados =
    filtros.length > 0 ? filtros.join("  |  ") : "No se aplicaron";

  doc.setFont("helvetica", "normal");
  doc.text("Filtros Aplicados:", 14, y);
  doc.setFont("helvetica", "bold");
  const filtrosText = doc.splitTextToSize(filtrosAplicados, 260);
  doc.text(filtrosText, 48, y);
  y += filtrosText.length * 6 + 2;

  doc.setDrawColor(180);
  doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
  y += 7;

  const body = [];

  cursos.forEach((curso) => {
    body.push([
      {
        content: `${curso.nombreCurso} (${curso.modalidad})`,
        colSpan: 5,
        styles: {
          fillColor: [183, 211, 255],
          fontStyle: "bold",
          halign: "left",
        },
      },
    ]);
    body.push([
      curso.totalParticipantes ?? 0,
      curso.totalAsistentes ?? 0,
      curso.totalAusentes ?? 0,
      `${curso.porcentajeAsistencia?.toFixed(2) ?? "0.00"}%`,
      curso.totalCertificadosEmitidos ?? 0,
    ]);
  });

  doc.autoTable({
    startY: y,
    head: [
      [
        "Total Participantes",
        "Asistentes",
        "Ausentes",
        "% Asistencia",
        "Certificados",
      ],
    ],
    body: body,
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [19, 115, 204],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { halign: "center" },
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
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
  w.document.title = "Informe de Participación y Asistencia por Curso";
  w.document.close();
}


ObtenerParticipacionPorCurso()