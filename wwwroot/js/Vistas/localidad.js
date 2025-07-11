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
    .catch((error) => console.log("No se pudo obtener las localidades", error));
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
    let iconColor = item.eliminado ? "text-success" : "text-danger";

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
        "'>" +
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

// 🎨 Validación en vivo: cambia el color mientras el usuario escribe
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
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "¡Localidad Creada!",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#f0f0f0",
          color: "#000",
        });
      }
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
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "¡Localidad Modificada!",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#f0f0f0",
          color: "#000",
        });
      }
    });
}

// Funcion para activar o desactivar una localidad
function EliminarLocalidadId(id, eliminado) {
  Swal.fire({
    title: eliminado ? "¿Reactivar localidad?" : "¿Desactivar localidad?",
    text: eliminado
      ? "Se reactivará esta localidad en el sistema."
      : "Esta localidad se desactivará y no estará disponible.",
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
  }).then((result) => {
    if (result.isConfirmed) {
      EliminarSiLocalidad(id);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Acción cancelada",
        text: eliminado
          ? "La localidad sigue desactivada."
          : "La localidad sigue activa.",
        icon: "info",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "bottom-end",
      });
    }
  });
}

async function EliminarSiLocalidad(id) {
  const res = await authFetch(`Localidades/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudo eliminar/reactivar la localidad");
      }
      return response.json();
    })
    .then((data) => {
      ObtenerLocalidades();

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
      Swal.fire("Error", "No se pudo actualizar la localidad.", "error");
    });
}

ComboParaFiltrarProvincias();
