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
  $("#tablaLicenciasAprobadasBody").empty();

  if (data.length === 0) {
    $("#tablaLicenciasAprobadasBody").append(
      "<tr><td colspan='3' class='text-center text-muted'>No hay licencias aprobadas para mostrar.</td></tr>"
    );
    return;
  }

$.each(data, function (index, item) {
  $("#tablaLicenciasAprobadasBody").append(
    "<tr>" +
    "<td>" + item.fechaDeAprobacion + "</td>" +
    "<td class='text-center'>" + item.estadoString + "</td>" +
    "<td class='text-center'>" + item.licenciaString + "</td>" +
    "</tr>"
  );
});



  $('[data-toggle="tooltip"]').tooltip();
}



ComboParaFiltrarPorLicencia();