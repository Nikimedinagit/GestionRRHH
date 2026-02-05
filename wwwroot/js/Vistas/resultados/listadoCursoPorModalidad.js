// =================================== Inicializar Filtros ===================================
$(document).ready(function () {
  ObtenerCursosPorModalidad();

  $("#NombreCursoBuscar, #ModalidadBuscar").on("input change", function () {
    ObtenerCursosPorModalidad();
  });
});

// =================================== Obtener Listado de Cursos por Modalidad ===================================
async function ObtenerCursosPorModalidad() {
  const filtro = {
    Modalidad: parseInt(document.getElementById("ModalidadBuscar").value),
    NombreCurso: document.getElementById("NombreCursoBuscar").value,
  };
  console.log(filtro);
  try {
    const response = await authFetch("Resultados/CursosPorModalidadN2", {
      method: "POST",
      body: JSON.stringify(filtro),
    });
    const data = await response.json();
    MostrarCursosPorModalidad(data);
    return data;
  } catch (error) {
    MostrarErrorCatch();
  }
}

// =================================== Mostrar Listado de Cursos por Modalidad ===================================
function MostrarCursosPorModalidad(data) {
    const tbody = $("#listadoCursosPorModalidad");
    tbody.empty();

    if (!data || data.length === 0) {
        tbody.append(`
            <tr>
                <td class="text-start">
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

    data.forEach((modalidad) => {
        const modalidadTexto = (modalidad.modalidad || "SIN MODALIDAD").toUpperCase();
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
        tbody.append(`
            <tr style="background:#e8f0ff !important;">
                <td class="fw-bold text-start text-wrap">
                    Modalidad: ${badgeHtml}
                </td>
            </tr>
        `);
        modalidad.cursos.forEach((curso) => {
            tbody.append(`
                <tr>
                    <td class="text-start text-wrap">
                        ${curso.nombreCurso}
                    </td>
                </tr>
            `);
        });
    });
}



// =================================== Generar Informe en PDF ===================================
async function GenerarInformePdfCursosPorModalidad() {
  const modalidades = await ObtenerCursosPorModalidad();

  if (!modalidades || !Array.isArray(modalidades) || modalidades.length === 0) {
    ErrorGeneralInformePdf();
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  doc.setTextColor(19, 115, 204);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Informe de Cursos por Modalidad",
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

  const totalCursos = modalidades.reduce(
    (acc, m) => acc + (m.cursos ? m.cursos.length : 0),
    0
  );
  doc.setFont("helvetica", "normal");
  doc.text("Total Cursos:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${totalCursos}`, 38, y);
  y += 6;

  const modalidadSelect = document.getElementById("ModalidadBuscar");
  const modalidadRaw =
    modalidadSelect.options[modalidadSelect.selectedIndex].text;
  const nombreCursoRaw = document.getElementById("NombreCursoBuscar").value;

  const filtrosAplicadosArray = [];
  if (modalidadRaw && modalidadRaw !== "[Todos]")
    filtrosAplicadosArray.push(`[Modalidad: ${modalidadRaw}]`);
  if (nombreCursoRaw) filtrosAplicadosArray.push(`[Curso: ${nombreCursoRaw}]`);

  const filtrosAplicados =
    filtrosAplicadosArray.length > 0
      ? filtrosAplicadosArray.join("  |  ")
      : "No se aplicaron";

  console.log(filtrosAplicados);

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
  modalidades.forEach((modalidad) => {
    body.push([
      {
        content: `Modalidad: ${modalidad.modalidad}`,
        colSpan: 1,
        styles: {
          halign: "left",
          fillColor: [183, 211, 255],
          fontStyle: "bold",
        },
      },
    ]);
    if (modalidad.cursos && modalidad.cursos.length > 0) {
      modalidad.cursos.forEach((curso) => {
        body.push([curso.nombreCurso]);
      });
    }
  });

  doc.autoTable({
    startY: y,
    head: [["Nombre Curso"]],
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
    doc.save("Informe_Cursos_Por_Modalidad.pdf");
    return;
  }

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const html = `<html><body style="margin:0"><iframe width="100%" height="100%" src="${url}"></iframe></body></html>`;
  const w = window.open("", "_blank");
  w.document.open();
  w.document.write(html);
  w.document.title = "Informe de Cursos por Modalidad";
  w.document.close();
}

ObtenerCursosPorModalidad();
