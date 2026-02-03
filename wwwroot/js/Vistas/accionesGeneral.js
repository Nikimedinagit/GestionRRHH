////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA ABRIR CONTENEDOR DE  FILTROS /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function toggleFiltros() {
  const btn = document.getElementById("btnMostrarFiltros");
  const contenedor = document.getElementById("contenedorFiltros");

  if (!btn || !contenedor) return;

  const textoBtn = btn.querySelector(".texto-btn");
  
  contenedor.classList.toggle("d-none");
  
  const estaAbierto = !contenedor.classList.contains("d-none");

  btn.classList.toggle("active");

  if (textoBtn) {
    textoBtn.textContent = estaAbierto ? "Ocultar Filtros" : "Filtros";
    
    const icono = btn.querySelector("i");
    if (icono) {
      icono.className = estaAbierto 
        ? "fa-solid fa-eye-slash me-1" 
        : "fa-solid fa-arrow-down-wide-short me-1";
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
  const spinner = document.getElementById("pantallaCargaGeneral");
  if (spinner) spinner.style.display = "flex";
}

function ocultarPantallaCarga() {
  const spinner = document.getElementById("pantallaCargaGeneral");
  if (spinner) spinner.style.display = "none";
}

function mostrarSpinnerDetalle(panel, claseSpinner = ".panel-detalle-spinner") {
  const spinner = panel.querySelector(claseSpinner);
  if (spinner) spinner.style.display = "flex";
}

function ocultarSpinnerDetalle(panel, claseSpinner = ".panel-detalle-spinner") {
  const spinner = panel.querySelector(claseSpinner);
  if (spinner) spinner.style.display = "none";
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

  const textoBtn = btn.querySelector("span");
  const icono = btn.querySelector("i");
  const abierto = contenedor.classList.toggle("show");

  if (abierto) {
      contenedor.classList.remove('d-none');
      contenedor.classList.add('mb-3')
  } else {
      contenedor.classList.add('d-none');
  }

  if (textoBtn && icono) {
    if (abierto) {
      textoBtn.textContent = "Ocultar Resultados";
      icono.className = "fa-solid fa-eye-slash me-1"; 
    } else {
      textoBtn.textContent = "Más Resultados";
      icono.className = "fa-solid fa-list me-1"; 
    }
  }
}



//////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA MOSTRAR U OCULTAR EL BOTON DE SCROLL TOP /////////////// 
//////////////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', () => {
  const scrollTopBtn = document.querySelector('.scroll-top');
  if (!scrollTopBtn) return;

  function botonScrollTop() {
    if (window.scrollY > 20) {
      scrollTopBtn.classList.add('active');
    } else {
      scrollTopBtn.classList.remove('active');
    }
  }

  window.addEventListener('scroll', botonScrollTop);
  window.addEventListener('load', botonScrollTop);

  scrollTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});



