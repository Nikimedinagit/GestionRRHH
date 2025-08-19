//Función para abrir el formulario lateral
function AbrirPanelLocalidad() {
  document.getElementById("panelLocalidad").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreLocalidad");
    if (inputNombre) inputNombre.focus();
  }, 400);
}

//Funcion para cerrar el formulario lateral
function CerrarPanelLocalidad() {
  document.getElementById("panelLocalidad").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalLocalidad();
}

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
  ObtenerLocalidades();

  $("#EstadoIdBuscar, #ProvinciaIdBuscar").on("change", function () {
    ObtenerLocalidades();
  });
});
//FIN ONCHANGE DE FILTROS//

async function ComboParaFiltrarProvincias() {
  const res = await authFetch("Provincias", {
    method: "GET",
  });

  const provincias = await res.json();

  const $combo = $("#ProvinciaIdBuscar");
  $combo.empty();

  let opciones = `<option value="0">[Todas]</option>`;
  provincias.forEach((item) => {
    opciones += `<option value="${item.id}">${item.nombre}</option>`;
  });
  $combo.html(opciones);

  ObtenerLocalidades();
}

// Funcion Para Obtener las Localidades
async function ObtenerLocalidades() {
  let estadoId = document.getElementById("EstadoIdBuscar").value;
  let provinciaId = document.getElementById("ProvinciaIdBuscar").value;

  let filtro = {
    eliminado: estadoId !== "" ? parseInt(estadoId) : null,
    provinciaId: provinciaId !== "" ? parseInt(provinciaId) : null,
  };

  const res = await authFetch("Localidades/Filtrar", {
    method: "POST",
    body: JSON.stringify(filtro),
  })
    .then((response) => response.json())
    .then((data) => {
      MostrarLocalidades(data);
      LimpiarModalLocalidad();
      CerrarPanelLocalidad();
    })
    .catch((error) => {
      MostrarErrorCatch();
      });
}

// Funcion Para Mostrar Las Localidades
function MostrarLocalidades(data) {
  window.listaLocalidades = data;
  $("#tablaLocalidadesBody").empty();

  if (data.length === 0) {
    $("#tablaLocalidadesBody").append(
      "<tr><td colspan='3' class='text-center text-muted'>No hay localidades para mostrar.</td></tr>"
    );
    return;
  }

  $.each(data, function (index, item) {
    let filaClass = item.eliminado ? "fila-desactivada" : "";
    let visibleBotones = item.eliminado ? "display: none;" : "";
    let iconColor = item.eliminado ? "text-danger" : "text-success";

    $("#tablaLocalidadesBody").append(
      "<tr>" +
        // Columna Activo (toggle)
        "<td class='text-center align-middle'>" +
        "<button class='btn-editar' type='button' class='btn btn-sm " +
        (item.eliminado ? "btn-outline-success" : "btn-outline-danger") +
        "' data-tippy-content='" +
        (item.eliminado ? "Activar" : "Desactivar") +
        "' onclick='EliminarLocalidadId(" +
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
        // columna Localidad (nombre)
        "<td class='align-middle " +
        filaClass +
        " localidad-truncada'>" +
        item.nombre +
        "</td>" +
        // Columna Provincia (nombre)
        "<td class='align-middle d-none d-md-table-cell " +
        filaClass +
        "'>" +
        (item.provinciaString || "Sin provincia") +
        "</td>" +
        // Columna Acciones (editar)
        "<td class='d-flex justify-content-center align-items-center'>" +
        "<button class='btn-editar' data-action='edit' style='" +
        visibleBotones +
        " background: none; border: none;' onclick='MostrarModalEditarLocalidad(" +
        item.id +
        ")' data-tippy-content='Editar'>" +
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

// Funcion para mostrar el modal de edición de la localidad
async function MostrarModalEditarLocalidad(id) {
  const res = await authFetch(`Localidades/${id}`);
  const localidad = await res.json();
  const nombre = localidad.nombre ? localidad.nombre.trim() : "";
  document.getElementById("IdLocalidad").value = localidad.id;
  document.getElementById("NombreLocalidad").value = nombre;
  document.getElementById("IdProvincia").value = localidad.provinciaId;

  AbrirPanelLocalidad();
}

// Funcion para buscar el id de la localidad y llamar a la función de edición o creación
function BuscarLocalidadId() {
  const id = parseInt(document.getElementById("IdLocalidad").value);

  //Si el id no existe o es 0, entonces es una nueva localidad y llamamos a la función para crear
  if (!id || id === 0) {
    CrearLocalidad();
  } else {
    EditarLocalidad(id);
  }
}

// Funcion para limpiar el formulario de la localidad
function LimpiarModalLocalidad() {
  // Limpia el formulario
  document.getElementById("IdLocalidad").value = "";

  const inputNombre = document.getElementById("NombreLocalidad");
  inputNombre.value = "";

  const inputIdProvincia = document.getElementById("IdProvincia");
  inputIdProvincia.value = "";

  // Limpia los estilos de validación
  inputNombre.classList.remove("is-invalid");
  inputNombre.classList.remove("is-valid");
  inputIdProvincia.classList.remove("is-invalid");
  inputIdProvincia.classList.remove("is-valid");

  // Limpia el mensaje de error
  const inputErrorNombre = document.getElementById("errorNombreLocalidad");
  inputErrorNombre.textContent = "";
  inputErrorNombre.style.display = "none";

  const inputErrorIdProvincia = document.getElementById("errorIdProvincia");
  inputErrorIdProvincia.textContent = "";
  inputErrorIdProvincia.style.display = "none";
}

// Función para validar el formulario de localidad
function ValidarFormularioLocalidad() {
  const inputNombre = document.getElementById("NombreLocalidad");
  const inputErrorNombre = document.getElementById("errorNombreLocalidad");

  const selectProvincia = document.getElementById("IdProvincia");
  const inputErrorProvincia = document.getElementById("errorIdProvincia");

  const nombre = inputNombre.value.trim();
  const provinciaSeleccionada = selectProvincia.value;

  // Limpiar errores previos
  inputErrorNombre.style.display = "none";
  inputErrorNombre.textContent = "";
  inputNombre.classList.remove("is-invalid", "is-valid");

  inputErrorProvincia.style.display = "none";
  inputErrorProvincia.textContent = "";
  selectProvincia.classList.remove("is-invalid", "is-valid");

  let esValido = true;

  // Validar nombre
  if (nombre.length === 0) {
    inputNombre.classList.add("is-invalid");
    inputErrorNombre.style.display = "block";
    inputErrorNombre.textContent = "Campo obligatorio.";
    esValido = false;
  } else if (nombre.length < 3) {
    inputNombre.classList.add("is-invalid");
    inputErrorNombre.style.display = "block";
    inputErrorNombre.textContent = "Mínimo 3 caracteres.";
    esValido = false;
  } else {
    inputNombre.classList.add("is-valid");
  }

  // Validar provincia
  if (!provinciaSeleccionada) {
    selectProvincia.classList.add("is-invalid");
    inputErrorProvincia.style.display = "block";
    inputErrorProvincia.textContent = "Seleccione una provincia.";
    esValido = false;
  } else {
    selectProvincia.classList.add("is-valid");
  }

  return esValido;
}

// Validación en vivo: cambia el color mientras el usuario escribe
document.getElementById("NombreLocalidad").addEventListener("input", () => {
  const inputNombre = document.getElementById("NombreLocalidad");
  const errorNombre = document.getElementById("errorNombreLocalidad");
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
    inputNombre.classList.add("is-valid");
    errorNombre.style.display = "none";
    errorNombre.textContent = "";
  }
});

// Funcion para mostrar un mensaje de error en la pantalla
function MostrarErrorLocalidadExistente(mensaje) {
  const errorLocalidad = document.getElementById("errorNombreLocalidad");
  const inputNombreLocalidad = document.getElementById("NombreLocalidad");

  errorLocalidad.textContent = mensaje;
  errorLocalidad.style.display = "block";
  inputNombreLocalidad.classList.add("is-invalid");
}

// Funcion crear localidad
async function CrearLocalidad() {
  if (!ValidarFormularioLocalidad()) return;

  const localidad = {
    nombre: document.getElementById("NombreLocalidad").value.trim(),
    provinciaId: document.getElementById("IdProvincia").value,
  };
  const res = await authFetch("Localidades", {
    method: "POST",
    body: JSON.stringify(localidad),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        MostrarErrorLocalidadExistente(response.mensaje);
      } else {
        CerrarPanelLocalidad();
        ObtenerLocalidades();
        // Mostrar alerta de éxito
        Swal.fire({
        title: "¡Localidad Creada!",
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

//Funcion para editar localidad
async function EditarLocalidad(id) {
  if (!ValidarFormularioLocalidad()) return;

  let localidadId = document.getElementById("IdLocalidad").value;

  let localidad = {
    id: localidadId,
    nombre: document.getElementById("NombreLocalidad").value.trim(),
    provinciaId: parseInt(document.getElementById("IdProvincia").value),
  };
  const res = await authFetch("Localidades/" + id, {
    method: "PUT",
    body: JSON.stringify(localidad),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        MostrarErrorLocalidadExistente(response.mensaje);
      } else {
        ObtenerLocalidades();
        // Mostrar alerta de éxito
        Swal.fire({
        title: "¡Localidad Modificada!",
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

// Funcion para activar o desactivar una localidad
function EliminarLocalidadId(id, eliminado) {
  Swal.fire({
    title: eliminado
      ? "¿Deseás reactivar esta localidad?"
      : "¿Deseás desactivar esta localidad?",
    html: eliminado
      ? "<p class='swal2-content-center'>Esta acción volverá a habilitar la localidad en el sistema.</p>"
      : "<p class='swal2-content-center'>La localidad se desactivará y dejará de estar disponible.</p>",
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
  }).then((result) => {
    if (result.isConfirmed) {
      EliminarSiLocalidad(id);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Acción Cancelada",
        text: eliminado ? "Continuará desactivada." : "Continuará activada.",
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

async function EliminarSiLocalidad(id) {
  try {
    const response = await authFetch(`Localidades/${id}`, {
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
      ObtenerLocalidades();
    } else {
      // Error controlado desde el backend
      Swal.fire({
        title: "Acción no permitida",
        html: `
          <div class="text-center">
            <p>${data.mensaje || "No se puede realizar esta acción."}</p>
            <p>Eliminá los empleados antes de intentar desactivarlo.</p>
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


ComboParaFiltrarProvincias();
