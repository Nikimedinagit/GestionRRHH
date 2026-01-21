////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA ABRIR CONTENEDOR DE  FILTROS /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    setTimeout(() => {
      document.addEventListener("mousedown", DetectarClickFueraDeFiltro);
    }, 20);
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  // FUNCION SI EL CLICK FUERA DEL CONTENEDOR DEL FILTRO LO CIERRA /////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA ABRIR CONTENEDOR DE  GENERAR /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    setTimeout(() => {
      document.addEventListener("mousedown", DetectarClickFueraDeGenerar);
    }, 20);
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  // FUNCION SI EL CLICK FUERA DEL CONTENEDOR DEL GENERAL LO CIERRA /////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR EL ERROR DE CATCH ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
// function MostrarErrorCatch() {
//   Swal.fire({
//     title: "¡Error!",
//     html: `
//       <div class="text-center">
//         <p>No se pudo acceder al servidor. Por favor, inténtalo de nuevo.</p>
//       </div>
//     `,
//     confirmButtonText: "Entendido",
//     customClass: {
//       popup: "shadow rounded-3 p-3",
//       confirmButton: "btn btn-danger",
//       title: "fs-5 text-dark mb-2",
//       htmlContainer: "text-muted fs-6",
//     },
//     buttonsStyling: false,
//   });
// }

function MostrarErrorCatch() {
  console.error("No se pudo acceder al servidor. Por favor, inténtalo de nuevo.");
}



/////////////////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA OCULTAR Y MOSTRAR EL CONTENEDOR DE AYUDA     ///////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
function toggleAyuda() {
  const btnToggle = document.getElementById('toggle-ayuda');
  const contenidoAyuda = document.getElementById('contenido-ayuda');
  const headerAyuda = document.querySelector('.info-ayuda-header');

  const oculto = contenidoAyuda.classList.toggle('d-none');

  if (oculto) {
    btnToggle.innerHTML = '<i class="bi bi-eye me-1"></i> Mostrar';
    headerAyuda.classList.remove('mb-3'); 
  } else {
    btnToggle.innerHTML = '<i class="bi bi-eye-slash me-1"></i> Ocultar';
    headerAyuda.classList.add('mb-3'); 
  }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR EL ERROR GENERAR INFORMES VACIOS///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function ErrorGeneralInformePdf() {
    Swal.fire({
        title: "No es posible generar el informe",
        html: `
          <div class="text-center">
            <p>No se encontraron resultados con los filtros aplicados.</p>
            <p>Modificá los criterios de búsqueda e intentá nuevamente.</p>
          </div>
        `,
        confirmButtonText: "Entendido",
        customClass: {
            popup: "shadow rounded-3 p-3",
            confirmButton: "btn btn-danger",
            title: "fs-5 text-dark mb-2",
            htmlContainer: "text-muted fs-6",
        },
        buttonsStyling: false,
    });
}


//////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA MOSTRAR EL SPINNER DE CARGARGANDO DE ESPERA /////////////// 
//////////////////////////////////////////////////////////////////////////////
function mostrarPantallaCarga() {
  document.getElementById("pantallaCargaGeneral").style.display = "flex";
}

function ocultarPantallaCarga() {
  document.getElementById("pantallaCargaGeneral").style.display = "none";
}


//////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA MOSTRAR EL SPINNER EN LA VISTA DE NOTIFICACIONES DE CARGARGANDO DE ESPERA /////////////// 
//////////////////////////////////////////////////////////////////////////////
function mostrarPantallaCargaNotificaciones() {
  document.getElementById("pantallaCargaGeneralNotificaciones").style.display = "flex";
}

function ocultarPantallaCargaNotificaciones() {
  document.getElementById("pantallaCargaGeneralNotificaciones").style.display = "none";
}


//////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA MOSTRAR EL SPINNER DE GUARDANDO /////////////// 
//////////////////////////////////////////////////////////////////////////////
function mostrarOverlayGuardando() {
  document.getElementById("overlayGuardando").classList.remove("d-none");
}

function ocultarOverlayGuardando() {
  document.getElementById("overlayGuardando").classList.add("d-none");
}

function mostrarOverlayGuardandoAsistencia() {
  document.getElementById("overlayGuardandoAsistencia").classList.remove("d-none");
}

function ocultarOverlayGuardandoAsistencia() {
  document.getElementById("overlayGuardandoAsistencia").classList.add("d-none");
}

function mostrarOverlayGuardandoCertificado() {
  document.getElementById("overlayGuardandoCertificado").classList.remove("d-none");
}

function ocultarOverlayGuardandoCertificado() {
  document.getElementById("overlayGuardandoCertificado").classList.add("d-none");
}

//////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA MOSTRAR EL SPINNER DE GUARDANDO DE CRITERIOS DENTRO DE LA VISTA DE EVALUACIONES /////////////// 
//////////////////////////////////////////////////////////////////////////////
function mostrarOverlayGuardandoCriterios() {
  document.getElementById("overlayGuardandoCriterios").classList.remove("d-none");
}

function ocultarOverlayGuardandoCriterios() {
  document.getElementById("overlayGuardandoCriterios").classList.add("d-none");
}



//////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA EL TOGGLE DE RESULTADOS /////////////// 
//////////////////////////////////////////////////////////////////////////////
function toggleResultados() {
    const btn = document.getElementById("btnResultados");
    const contenedor = document.getElementById("contenedorResultados");

    if (!btn || !contenedor) return;

    const textoBtn = btn.querySelector(".texto-btn");
    const abierto = contenedor.classList.toggle("show");

    btn.classList.toggle("active");

    if (textoBtn) {
        textoBtn.textContent = abierto
            ? "Ocultar Resultados"
            : "Más Resultados";
    }
}

