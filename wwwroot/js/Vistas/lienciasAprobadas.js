//PANEL FILTROS//
//Funcion para abrir panel de filtros
function AbrilPanelFiltros(idPanel) {
  const panel = document.getElementById(idPanel);
  if (!panel) return;

  if (panel.classList.contains("activo")) {
    panel.classList.remove("activo");
    setTimeout(() => panel.classList.add("d-none"), 300);
    document.removeEventListener("mousedown", DetectarClickFueraDeFiltro);
  } else {
    panel.classList.remove("d-none");
    setTimeout(() => panel.classList.add("activo"), 10);
    // Agrega el listener para cerrar al hacer clic fuera
    setTimeout(() => {
      document.addEventListener("mousedown", DetectarClickFueraDeFiltro);
    }, 20);
  }

  // Funcion sid etecta un clcik fuera del contenedir del filtro lo cierra
  function DetectarClickFueraDeFiltro(event) {
    if (
      !panel.contains(event.target) &&
      event.target.id !== "btnMostrarFiltros"
    ) {
      panel.classList.remove("activo");
      setTimeout(() => panel.classList.add("d-none"), 300);
      document.removeEventListener("mousedown", DetectarClickFueraDeFiltro);
    }
  }
}
//FIN PANEL FILTROS//


//INICIO PANEL GENERAR//
//Funcion para abrir panel de genera
function AbrilPanelGenerar(idPanel) {
  const panel = document.getElementById(idPanel);
  if (!panel) return;

  if (panel.classList.contains("activo")) {
    panel.classList.remove("activo");
    setTimeout(() => panel.classList.add("d-none"), 300);
    document.removeEventListener("mousedown", DetectarClickFueraDeGenerar);
  } else {
    panel.classList.remove("d-none");
    setTimeout(() => panel.classList.add("activo"), 10);
    // Agrega el listener para cerrar al hacer clic fuera
    setTimeout(() => {
      document.addEventListener("mousedown", DetectarClickFueraDeGenerar);
    }, 20);
  }

  // Funcion sid etecta un clcik fuera del contenedir de generar lo cierra
  function DetectarClickFueraDeGenerar(event) {
    if (
      !panel.contains(event.target) &&
      event.target.id !== "btnMostrarGenerar"
    ) {
      panel.classList.remove("activo");
      setTimeout(() => panel.classList.add("d-none"), 300);
      document.removeEventListener("mousedown", DetectarClickFueraDeGenerar);
    }
  }
}
//FIN PANEL GENERAR//

// INICIO ONCHANGE DE FILTROS//
$(document).ready(function () {
  ComboParaFiltrarPorLicencia();

  $("#TipoDeLicenciaIdBuscar").on("change", ObtenerLicenciasAprobadas);
  $("#FechaAprobacionBuscar").on("change", ObtenerLicenciasAprobadas);
  $("#filtrarFechaSelect").on("change", function () {
    const filtrarFecha = $(this).val() === "si";
    $("#fechasInputs").toggle(filtrarFecha);

    if (!filtrarFecha) {
      $("#FechaAprobacionBuscar").val('');
    }

    ObtenerLicenciasAprobadas();
  });
});


//FIN ONCHANGE DE FILTROS//

async function ComboParaFiltrarPorLicencia() {
  const res = await authFetch("TipoDeLicencias", {
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


function MostrarLicenciasAprobadas(data) {
  licenciaAprobadasGlobal = data;
  $("#tablaLicenciasAprobadasBody").empty();

  if (data.length === 0) {
    $("#tablaLicenciasAprobadasBody").append(
      "<tr><td colspan='5' class='text-center text-muted'>No hay licencias aprobadas para mostrar.</td></tr>"
    );
    return;
  }

  $.each(data, function (index, item) {
    $("#tablaLicenciasAprobadasBody").append(
      `<tr>
        <td class="text-center columna-fecha">${item.fechaDeAprobacion}</td>
        <td class="text-center columna-estado">
          <span class="badge badge-success">${item.estadoString}</span>
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

  // Inicializar tooltips
  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

function MostrarDetalleLicenciaAprobada(index) {
  const item = licenciaAprobadasGlobal[index];

  // Setear valores en el offcanvas
  document.getElementById("detalleFechaAprobacion").textContent = item.fechaDeAprobacion || 'N/D';
  document.getElementById("detalleEstadoAprobacion").textContent = item.estadoString || 'N/D';
  document.getElementById("detalleLicenciaAprobacion").textContent = item.licenciaString || 'N/D';
  document.getElementById("detalleResponsableNombre").textContent = item.nombreUsuarioAprobador || 'N/D';
  document.getElementById("detalleResponsableEmail").textContent = item.emailUsuarioAprobador || 'N/D';

  // Mostrar offcanvas
  const offcanvasElement = document.getElementById("offcanvasDetalleLicenciaAprobadas");
  const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
  offcanvas.show();
}






ComboParaFiltrarPorLicencia();