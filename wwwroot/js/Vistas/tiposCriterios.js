//INICIO PANEL FORMUALRIO//
//Función para abrir el formulario lateral
function AbrirPanelTipoDeCriterio() {
  document.getElementById("panelTipoDeCriterio").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreTipoDeCriterio");
    if (inputNombre) inputNombre.focus();
  }, 400);
}

//Funcion para cerrar el formulario lateral
function CerrarPanelTipoDeCriterio() {
  document.getElementById("panelTipoDeCriterio").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalTipoDeCriterio();
}
//FIN PANEL FORMULARIO//


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
  ObtenerTiposDeCriterios();

  $("#EstadoIdBuscar").on("change", function () {
    ObtenerTiposDeCriterios();
  });
});
//FIN ONCHANGE DE FILTROS//


// Funcion para obtener los tipos de criterios
async function ObtenerTiposDeCriterios() {

  let estado = document.getElementById("EstadoIdBuscar").value;
  let filtro = {
    eliminado: estado !== "" ? parseInt(estado) : null,
  };

  const res = await authFetch("TiposDeCriterios/Filtrar", {
    method: "POST",
    body: JSON.stringify(filtro),
  })
    .then(response => response.json())
    .then((data) => {
        MostrarTiposDeCriterios(data);
        LimpiarModalTipoDeCriterio();
        CerrarPanelTipoDeCriterio();
    })
    .catch((error) => {;
      MostrarErrorCatch();
    });
   
}


// Funcion Para Mostrar los tipos de criterios en la tabla
function MostrarTiposDeCriterios(data) {
    window.listaTiposDeCriterios= data;

  $("#tablaTiposCriterioBody").empty();

  if (data.length === 0) {
    $("#tablaTiposCriterioBody").append(
      "<tr><td colspan='2' class='text-center text-muted'>No hay tipos de criterios para mostrar.</td></tr>"
    );
    return;
  }

  $.each(data, function (index, item) {
    let filaClass = item.eliminado ? "fila-desactivada" : "";
    let visibleBotones = item.eliminado ? "display: none;" : "";
    let iconColor = item.eliminado ? "text-success" : "text-danger";

    $("#tablaTiposCriterioBody").append(
      "<tr>" +
        // Columna Activo (toggle)
        "<td class='text-center align-middle'>" +
        "<button class='btn-editar' type='button' class='btn btn-sm " +
        (item.eliminado ? "btn-outline-success" : "btn-outline-danger") +
        "' data-tippy-content='" +
        (item.eliminado ? "Activar" : "Desactivar") +
        "' onclick='EliminarTipoDeCriterioId(" +
        item.id +
        ", " +
        item.eliminado +
        ")' style='background: none; border: none;'>" +
        "<i class='icon-desactivar bi " +
        (item.eliminado ? "bi-toggle-off" : "bi-toggle-on") +
        " " +
        iconColor +
        "'></i>" +
        "</button>" +
        "</td>" +
        // Columna Tipo de criterio(nombre)
        "<td class='align-middle " +
        filaClass +
        "'>" +
        item.nombre +
        "</td>" +
        // Columna Acciones (editar)
        "<td class='d-flex justify-content-center align-items-center'>" +
        "<button class='btn-editar' data-action='edit' style='" +
        visibleBotones +
        " background: none; border: none;' onclick='MostrarModalEditar(" +
        item.id +  ")' data-tippy-content='Editar'>" +
        "<i class='bi bi-pencil-square icono-editar'></i>" +
        "</button>" +
        "</td>" +
        "</tr>"
    );
  });

  // Inicializar tooltips de Tippy
  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

// Funcion para mostrar el modal de edición de la tipo de criterio
async function MostrarModalEditar(id) {
  const res = await authFetch(`TiposDeCriterios/${id}`);
  const tipoDeCriterio = await res.json();
  const nombre = tipoDeCriterio.nombre ? tipoDeCriterio.nombre.trim() : "";
  document.getElementById("IdTipoDeCriterio").value = tipoDeCriterio.id;
  document.getElementById("NombreTipoDeCriterio").value = nombre;

  AbrirPanelTipoDeCriterio();
}

// Funcion para buscar el id de la tipo de criterio y llamar a la función de edición o creación
function BuscarTipoDeCriterioId() {
  const id = parseInt(document.getElementById("IdTipoDeCriterio").value);

  if (!id || id === 0) {
    CrearTipoDeCriterio();
  } else {
    EditarTipoDeCriterio(id);
  }
}

// Función para crear una tipo de criterio
async function CrearTipoDeCriterio() {
if (!ValidarFormularioTipoDeCriterio()) return;

  const tipoDeCriterio = {
    nombre: document.getElementById("NombreTipoDeCriterio").value.trim(),
  };
  const res = await authFetch("TiposDeCriterios", {
    method: "POST",
    body: JSON.stringify(tipoDeCriterio),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        MostrarErrorTipoDeCriterioExistente(response.mensaje);
      } else {
        CerrarPanelTipoDeCriterio();
        ObtenerTiposDeCriterios(); 
        // Mostrar alerta de éxito
        Swal.fire({
          title: "¡Criterio Creado!",
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 2200,
          timerProgressBar: true,
          background: "#f4fff7",
          color: "#1c3d26",
          icon: "success",
          iconColor: "#28a746d8",
          customClass: {
            popup: "swal2-toast-success",
            title: "swal2-toast-success-title",
            icon: "swal2-toast-success-icon",
          },
        });
      }
    })
    .catch((error) => {;
      MostrarErrorCatch();
    });
}

// Función para editar una tipo de criterio
async function EditarTipoDeCriterio(id) {

if (!ValidarFormularioTipoDeCriterio()) return;
  
  let tipoDeCriterio = {
    id: document.getElementById("IdTipoDeCriterio").value,
    nombre: document.getElementById("NombreTipoDeCriterio").value.trim(),
  };
  const res = await authFetch(`TiposDeCriterios/${id}`, {
    method: "PUT",
    body: JSON.stringify(tipoDeCriterio),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        MostrarErrorTipoDeCriterioExistente(response.mensaje);
      } else {
        ObtenerTiposDeCriterios(); 
        // Mostrar alerta de éxito
       Swal.fire({
          title: "¡Criterio Modificado!",
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 2200,
          timerProgressBar: true,
          background: "#f4fff7",
          color: "#1c3d26",
          icon: "success",
          iconColor: "#28a746d8",
          customClass: {
            popup: "swal2-toast-success",
            title: "swal2-toast-success-title",
            icon: "swal2-toast-success-icon",
          },
        });
      }
    })
     .catch((error) => {
      MostrarErrorCatch();
    }); 
}


// Funcion para limpiar el modal de tipo de criterio
function LimpiarModalTipoDeCriterio() {
  // Limpia el formulario
  document.getElementById("IdTipoDeCriterio").value = "";
  const inputNombre = document.getElementById("NombreTipoDeCriterio");
  inputNombre.value = "";

  // Limpia los estilos de validación
  inputNombre.classList.remove("is-invalid");
  inputNombre.classList.remove("is-valid");

  // Limpia el mensaje de error
  const inputErrorNombre = document.getElementById("errorNombreTipoDeCriterio");
  inputErrorNombre.textContent = "";
  inputErrorNombre.style.display = "none";
}

// Función para validar el formulario de tipo de criterio
function ValidarFormularioTipoDeCriterio() {
  const inputNombre = document.getElementById("NombreTipoDeCriterio");
  const inputErrorNombre = document.getElementById("errorNombreTipoDeCriterio");
  const nombre = inputNombre.value.trim();

  // Limpiar errores previos
  inputErrorNombre.style.display = "none";
  inputErrorNombre.textContent = "";
  inputNombre.classList.remove("is-invalid", "is-valid");

  if (nombre.length === 0) {
    inputNombre.classList.add("is-invalid");
    inputErrorNombre.style.display = "block";
    inputErrorNombre.textContent = "Campo obligatorio.";
    return false;
  }

  if (nombre.length < 3) {
    inputNombre.classList.add("is-invalid");
    inputErrorNombre.style.display = "block";
    inputErrorNombre.textContent = "Mínimo 3 caracteres.";
    return false;
  }

  inputNombre.classList.add("is-valid"); // Aplica color verde cuando es válido
  inputErrorNombre.style.display = "none";
  return true;
}

// Validación en vivo: cambia el color mientras el usuario escribe
document.getElementById("NombreTipoDeCriterio").addEventListener("input", () => {
  const inputNombre = document.getElementById("NombreTipoDeCriterio");
  const errorNombre = document.getElementById("errorNombreTipoDeCriterio");
  const nombre = inputNombre.value.trim();

  // Limpiar cualquier estado previo
  inputNombre.classList.remove("is-invalid", "is-valid");

  if (nombre.length === 0) {
    inputNombre.classList.add("is-invalid");
    errorNombre.style.display = "block";
    errorNombre.textContent = "Campo obligatorio.";
  } else if (nombre.length < 3) {
    inputNombre.classList.add("is-invalid");
    errorNombre.style.display = "block";
    errorNombre.textContent = "Mínimo 3 caracteres.";
  } else {
    inputNombre.classList.add("is-valid"); // Color verde cuando cumple
    errorNombre.style.display = "none";
  }
});

function MostrarErrorTipoDeCriterioExistente(mensaje) {
  const errorTipoDeCriterio = document.getElementById("errorNombreTipoDeCriterio");
  const inputNombreTipoDeCriterio = document.getElementById("NombreTipoDeCriterio");

  errorTipoDeCriterio.textContent = mensaje;
  errorTipoDeCriterio.style.display = "block";
  inputNombreTipoDeCriterio.classList.add("is-invalid");
}

// Función para eliminar una tipo de criterio
function EliminarTipoDeCriterioId(id, eliminado) {
  Swal.fire({
    title: eliminado
      ? "¿Deseás reactivar este criterio?"
      : "¿Deseás desactivar este criterio?",
    html: eliminado
      ? "<p class='swal2-content-center'>Esta acción volverá a habilitar el criterio en el sistema.</p>"
      : "<p class='swal2-content-center'>El criterio se desactivará y dejará de estar disponible.</p>",
    showCancelButton: true,
    confirmButtonText: eliminado ? "Sí, activar" : "Sí, desactivar",
    cancelButtonText: "Cancelar",
    focusCancel: true,
    customClass: {
      popup: "swal2-border-radius swal2-custom-popup",
      confirmButton: eliminado ? "swal2-btn-activar" : "swal2-btn-desactivar",
      cancelButton: "swal2-btn-cancelar",
      title: "swal2-title-custom",
      htmlContainer: "swal2-content-custom",
    },
    background: "#ffffff",
    color: "#1a1a1a",
  })
  .then((result) => {
    if (result.isConfirmed) {
      EliminarSiTipoDeCriterio(id);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Acción Cancelada",
        text: eliminado ? "Continuará desactivado." : "Continuará activado.",
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
        background: "#fef8f4",
        color: "#5f4339",
        icon: "info",
        iconColor: "#ff914d",
        customClass: {
          popup: "swal2-toast-status",
          title: "swal2-toast-title",
          content: "swal2-toast-content",
        },
      });
    }
  });
}

// Función para eliminar un tipo de criterio
async function EliminarSiTipoDeCriterio(id) {
 try {
    const response = await authFetch(`TiposDeCriterios/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        title: "¡" + data.mensaje + "!",
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
        background: "#f4fff7",
        color: "#1c3d26",
        icon: "success",
        iconColor: "#28a746d8",
        customClass: {
          popup: "swal2-toast-success",
          title: "swal2-toast-success-title",
          icon: "swal2-toast-success-icon",
        },
      });
      ObtenerTiposDeCriterios();
    } else {
      // Error controlado desde el backend
      Swal.fire({
        title: "Acción no permitida",
        html: `
          <div class="text-center">
            <p>${data.mensaje || "No se puede realizar esta acción."}</p>
            <p>Eliminá los criterios en evaluaciones antes de intentar desactivarlo.</p>
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
  } catch (error) {
    MostrarErrorCatch();
  }
}

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

ObtenerTiposDeCriterios()