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

//INICIO FUNCION PARA MOSTRAR ERRORES DE CATCH EN LAS URL/PETICIONES //
function MostrarErrorCatch() {
  Swal.fire({
    title: "¡Error!",
    html: `
      <div class="text-center">
        <p>No se pudo acceder al servidor. Por favor, inténtalo de nuevo.</p>
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
// FIN FUNCION PARA MOSTRAR ERRORES DE CATCH EN LAS URL/PETICIONES //