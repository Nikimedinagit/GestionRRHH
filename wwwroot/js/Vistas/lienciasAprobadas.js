////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR LOS ONCHANGE DE FILTROS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
  $("#TipoDeLicenciaIdBuscar, #FechaAprobacionBuscar").on("input", ObtenerLicenciasAprobadas);
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
async function ObtenerLicenciasAprobadas() {

    let tipoDeLicenciaId = document.getElementById("TipoDeLicenciaIdBuscar").value;
    let tipoDeLicencia = tipoDeLicenciaId !== "0" && tipoDeLicenciaId !== "" ? parseInt(tipoDeLicenciaId) : null;

    let fechaAprobacionValue = document.getElementById("FechaAprobacionBuscar").value;
    let fechaAprobacion = fechaAprobacionValue ? new Date(fechaAprobacionValue) : null;
    
    let filtro = {
      fechaAprobacion:fechaAprobacion,
      tipoDeLicenciaId:tipoDeLicencia
    };
  const res = await authFetch("AprobacionDeLicencias/Filtrar", {
    method: "POST",
    body: JSON.stringify(filtro),
  })
    .then(response => response.json())
    .then((data) => {
      MostrarLicenciasAprobadas(data);
    })
    .catch((error) => {
      console.log("No se puede acceder al servicio.", error);
      MostrarErrorServicio();
    });
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
        <td class="text-center columna-licencia">${item.licenciaString}</td>
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






async function GenerarInformePdfLicenciasAprobadas() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");
}






////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR AL CARGAR LA VISTA ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
ComboParaFiltrarPorLicencia();