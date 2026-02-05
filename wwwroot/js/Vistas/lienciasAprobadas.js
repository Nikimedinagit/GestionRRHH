////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR LOS ONCHANGE DE FILTROS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
  $("#TipoDeLicenciaIdBuscar, #FechaAprobacionBuscar").on("input", ObtenerLicenciasAprobadas(false));
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMBO PARA FILTRAR POR TIPO DE LICENCIA //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ComboParaFiltrarPorLicencia() {
  const res = await authFetch("TipoDeLicencias/Activos", {
    method: "GET",
  });

  const licencias = await res.json();

  const $combo = $("#TipoDeLicenciaIdBuscar");
  $combo.empty();

  let opciones = `<option value="0">[Todas]</option>`;
  licencias.forEach((item) => {
    opciones += `<option value="${item.id}">${item.nombre}</option>`;
  });
  $combo.html(opciones);

  ObtenerLicenciasAprobadas();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// OBTENER LOS DATOS DE LA API DE APROBACION DE LICENCIAS ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerLicenciasAprobadas(mostrarSpinner = true) {

  if (mostrarSpinner) mostrarPantallaCarga();

  try {
    let tipoDeLicenciaId = document.getElementById("TipoDeLicenciaIdBuscar").value;
    let tipoDeLicencia = tipoDeLicenciaId !== "0" && tipoDeLicenciaId !== "" ? parseInt(tipoDeLicenciaId) : null;

    let fechaAprobacionValue = document.getElementById("FechaAprobacionBuscar").value;
    let fechaAprobacion = fechaAprobacionValue ? new Date(fechaAprobacionValue) : null;

    let filtro = {
      fechaAprobacion: fechaAprobacion,
      tipoDeLicenciaId: tipoDeLicencia
    };

    const response = await authFetch("AprobacionDeLicencias/Filtrar", {
      method: "POST",
      body: JSON.stringify(filtro),
    })

    const data = await response.json();
    MostrarLicenciasAprobadas(data);

  } catch (error) {
    MostrarErrorServicio();
  }

  finally { if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1200); } };

}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS DATOS DE LA API DE APROBACION DE LICENCIAS ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarLicenciasAprobadas(data) {
  licenciaAprobadasGlobal = data;
  $("#tablaLicenciasAprobadasBody").empty();

  if (data.length === 0) {
    $("#tablaLicenciasAprobadasBody").append(
      "<tr><td colspan='5' class='text-center text-muted'>No hay licencias aprobadas para mostrar.</td></tr>"
    );
    return;
  }

  const estiloAprobada = {
    backgroundColor: "#d4f4dd", // verde pastel
    color: "#2e7d32",           // verde fuerte
    fontSize: "0.70rem",
    fontWeight: "700",
    padding: "0.25em 0.5em",
    borderRadius: "4px",
    display: "inline-block"
  };

  $.each(data, function (index, item) {
    const badgeHtml = `<span class="badge" style="
      background-color: ${estiloAprobada.backgroundColor};
      color: ${estiloAprobada.color};
      font-size: ${estiloAprobada.fontSize};
      font-weight: ${estiloAprobada.fontWeight};
      padding: ${estiloAprobada.padding};
      border-radius: ${estiloAprobada.borderRadius};
      display: ${estiloAprobada.display};
    ">${item.estadoString}</span>`;

    $("#tablaLicenciasAprobadasBody").append(
      `<tr>
        <td class="text-center columna-fecha">${item.fechaDeAprobacion}</td>
        <td class="text-center columna-estado">
          ${badgeHtml}
        </td>
        <td class="text-center columna-licencia text-wrap">${item.licenciaString}</td>
        <td class="text-center columna-responsable">
          <strong>${item.nombreUsuarioAprobador}</strong><br>
          <small class="text-muted">${item.emailUsuarioAprobador}</small>
        </td>
        <td class="text-center columna-accion d-md-none">
          <button class="btn-editar icono-ver-detalle-licencia-aprobada" style="background: none; border: none;" onclick="MostrarDetalleLicenciaAprobada(${index})" data-tippy-content="Ver más">
            <i class="bi bi-info-circle"></i>
          </button>
        </td>
      </tr>`
    );
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR EL DETALLE DE LA APROBACION DE LICENCIA /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarDetalleLicenciaAprobada(index) {
  const item = licenciaAprobadasGlobal[index];

  document.getElementById("detalleFechaAprobacion").textContent = item.fechaDeAprobacion || 'N/D';
  document.getElementById("detalleEstadoAprobacion").textContent = item.estadoString || 'N/D';
  document.getElementById("detalleLicenciaAprobacion").textContent = item.licenciaString || 'N/D';
  document.getElementById("detalleResponsableNombre").textContent = item.nombreUsuarioAprobador || 'N/D';
  document.getElementById("detalleResponsableEmail").textContent = item.emailUsuarioAprobador || 'N/D';

  const offcanvasElement = document.getElementById("offcanvasDetalleLicenciaAprobadas");
  const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
  offcanvas.show();
}






////////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA GENERA UN INFORME PARA LAS LICENCIAS APROBADAS SEGUN SU FILTRO //////////////
////////////////////////////////////////////////////////////////////////////////
async function GenerarInformePdfLicenciasAprobadas() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  let tipoLicencia = document.getElementById("TipoDeLicenciaIdBuscar").value;
  let fechaAprobacion = document.getElementById("FechaAprobacionBuscar").value;
  let tipoLicenciaNombre = document.getElementById("TipoDeLicenciaIdBuscar").selectedOptions[0]?.text || "";

  let filtro = {
    tipoDeLicenciaId: tipoLicencia !== "0" ? Number(tipoLicencia) : null,
    fechaAprobacion: fechaAprobacion || null,
  };

  const res = await authFetch("InformesGeneralesPdf/GenerarInformeLicenciasAprobadas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filtro)
  });

  const { licenciasAprobadas, resumen } = await res.json();

  doc.setTextColor(19, 115, 204);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Informe de Licencias Aprobadas", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  let y = 29;
  const fechaHoy = new Date().toLocaleString("es-AR");

  doc.text("Generado:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(fechaHoy, 33, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text("Total Licencias Aprobadas:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.totalAprobadas}`, 63, y);

  y += 6;

  const filtrosAplicadosArray = [];

  if (filtro.tipoDeLicenciaId) filtrosAplicadosArray.push(`[Tipo Licencia: ${tipoLicenciaNombre}]`);
  if (filtro.fechaAprobacion) filtrosAplicadosArray.push(`[Fecha Aprobacion: ${filtro.fechaAprobacion}]`);

  const filtrosAplicados = filtrosAplicadosArray.length > 0
    ? filtrosAplicadosArray.join("  |  ")
    : "No se aplicaron";

  doc.setFont("helvetica", "normal");
  doc.text("Filtros Aplicados:", 13, y);
  doc.setFont("helvetica", "bold");

  const filtrosText = doc.splitTextToSize(filtrosAplicados, 260);
  doc.text(filtrosText, 45, y);

  y += filtrosText.length * 6 + 2;

  doc.setDrawColor(180);
  doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
  y += 7;

  if (licenciasAprobadas.length > 0) {
    doc.autoTable({
      startY: y,
      head: [["Fecha Aprobacion", "Estado", "Licencia ", "Responsable"]],
      body: licenciasAprobadas.map(l => [
        l.fechaDeAprobacion,
        l.estadoString,
        l.licenciaString,
        `${l.nombreUsuarioAprobador}\n${l.emailUsuarioAprobador}`
      ]),
      styles: { font: "helvetica", fontSize: 10 },
      headStyles: { fillColor: [19, 115, 204], textColor: 255, fontStyle: "bold" },
      margin: { left: 14, right: 14 },
      tableWidth: "auto"
    });
  } else {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 0, 0);
    doc.text(
      "No hay resultados para los filtros aplicados.",
      doc.internal.pageSize.getWidth() / 2,
      y + 10,
      { align: "center" }
    );
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10);
    doc.text(
      "www.WorkSync.com",
      doc.internal.pageSize.getWidth() - 20,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  }

  const esMobile = window.innerWidth < 768;

  if (esMobile) {
    doc.save("Informe_Licencias_Aprobadas.pdf");
    return;
  }

  
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  const html = `<html><head><title>Informe de Licencias Aprobadas</title></head>
    <body class="pdf-body">
    <iframe class="pdf-frame" width="100%" height="100%" src="${url}"></iframe>
    </body></html>`;

  const w = window.open();
  w.document.open();
  w.document.write(html);
  w.document.close();
}






////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR AL CARGAR LA VISTA ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
ComboParaFiltrarPorLicencia();