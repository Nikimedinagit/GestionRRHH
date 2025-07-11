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
    .catch((error) => console.log("No se pudo obtener los tipos de criterios", error));
}

// function ObtenerTiposDeCriterios() {
//     fetch('http://localhost:5106/api/TiposDeCriterios')
//     .then(response => response.json())
//     .then((data => {
//         MostrarTiposDeCriterios(data);
//         LimpiarModalTipoDeCriterio();
//         CerrarPanelTipoDeCriterio();
//     }))
// }

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
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "¡Tipo de Criterio Creado!",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#f0f0f0",
          color: "#000",
        });
      }
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
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "¡Tipo de Criterio Modificado!",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#f0f0f0",
          color: "#000",
        });
      }
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
    title: eliminado ? "¿Reactivar tipo de criterio?" : "¿Desactivar tipo de criterio?",
    text: eliminado
      ? "Se reactivará esta tipo de criterio en el sistema."
      : "Este tipo de criterio se desactivará y no estará disponible.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: eliminado ? "Reactivar" : "Desactivar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: "swal2-border-radius",
      confirmButton: eliminado ? "swal2-btn-reactivar" : "swal2-btn-desactivar",
      cancelButton: "swal2-btn-cancelar",
      title: "swal2-title-custom",
      content: "swal2-content-custom",
    },
    background: "#fff",
    color: "#22223b",
  })
  .then((result) => {
    if (result.isConfirmed) {
      EliminarSiTipoDeCriterio(id);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Acción cancelada",
        text: eliminado
          ? "El tipo de criterio sigue desactivado."
          : "El tipo de criterio sigue activo.",
        icon: "info",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "bottom-end",
      });
    }
  });
}

// Función para eliminar un tipo de criterio
async function EliminarSiTipoDeCriterio(id) {
  const res = await authFetch(`TiposDeCriterios/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudo eliminar/reactivar el tipo de criterio");
      }
      return response.json();
    })
    .then((data) => {
      ObtenerTiposDeCriterios();

      // Mostrar el mensaje que vino del backend
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: "¡" + data.mensaje + "!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#f0f0f0",
        color: "#000",
      });
    })
    .catch((error) => {
      console.error(error);
      Swal.fire("Error", "No se pudo actualizar el tipo de criterio.", "error");
    });
}

ObtenerTiposDeCriterios()