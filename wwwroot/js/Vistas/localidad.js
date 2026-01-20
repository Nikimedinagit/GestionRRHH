////////////////////////////////////////////////////////////////////////////////////////////////////////
// ABRIR PANEL DE LOCALIDAD ////////////////////////////////////////////////////////////////////  
////////////////////////////////////////////////////////////////////////////////////////////////////////
function AbrirPanelLocalidad() {
  document.getElementById("panelLocalidad").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreLocalidad");
    if (inputNombre) inputNombre.focus();
  }, 400);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
// CERRAR PANEL DE LOCALIDAD ////////////////////////////////////////////////////////////////////  
////////////////////////////////////////////////////////////////////////////////////////////////////////
function CerrarPanelLocalidad() {
  document.getElementById("panelLocalidad").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalLocalidad();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICILIZAR LOS ONCHANGE DE FILTROS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {

  $("#EstadoIdBuscar, #ProvinciaIdBuscar, #NombreLocalidadBuscar").on("input", function () {
    ObtenerLocalidades(false);
  });
});



////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMBO PARA FILTRAR PROVINCIAS //////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ComboParaFiltrarProvincias() {
  const res = await authFetch("Provincias/Activos", {
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// OBTENER LOS DATOS DE LA API DE LOCALIDADES ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerLocalidades(mostrarSpinner = true) {

  if (mostrarSpinner) mostrarPantallaCarga()

  try {
    let estadoId = document.getElementById("EstadoIdBuscar").value;
    let provinciaId = document.getElementById("ProvinciaIdBuscar").value;

    let filtro = {
      nombre: document.getElementById("NombreLocalidadBuscar").value,
      eliminado: estadoId !== "" ? parseInt(estadoId) : null,
      provinciaId: provinciaId !== "" ? parseInt(provinciaId) : null,
    };

    const response = await authFetch("Localidades/Filtrar", {
      method: "POST",
      body: JSON.stringify(filtro),
    })

    const data = await response.json();
    MostrarLocalidades(data);
    LimpiarModalLocalidad();
    CerrarPanelLocalidad();

  } catch (error) {
    MostrarErrorCatch();
  }

  finally { if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1200); } };
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS DATOS DE LA API DE LOCALIDADES ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
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
      "<td class='align-middle " +
      filaClass +
      " localidad-truncada'>" +
      item.nombre +
      "</td>" +
      "<td class='align-middle d-none d-md-table-cell " +
      filaClass +
      "'>" +
      (item.provinciaString || "Sin provincia") +
      "</td>" +
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

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR EL MODAL DE EDICION DE LA LOCALIDAD /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function MostrarModalEditarLocalidad(id) {
  const res = await authFetch(`Localidades/${id}`);
  const localidad = await res.json();
  const nombre = localidad.nombre ? localidad.nombre.trim() : "";
  document.getElementById("IdLocalidad").value = localidad.id;
  document.getElementById("NombreLocalidad").value = nombre;
  document.getElementById("IdProvincia").value = localidad.provinciaId;

  AbrirPanelLocalidad();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA BUSCAR EL ID DE LA LOCALIDAD Y LLAMAR A LA FUNCIÓN DE EDICION O CREACIÓN ////////  
////////////////////////////////////////////////////////////////////////////////////////////////////////
function BuscarLocalidadId() {
  const id = parseInt(document.getElementById("IdLocalidad").value);

  if (!id || id === 0) {
    CrearLocalidad();
  } else {
    EditarLocalidad(id);
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA LIMPIAR EL FORMULARIO DE LA LOCALIDAD ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function LimpiarModalLocalidad() {
  document.getElementById("IdLocalidad").value = "";

  const inputNombre = document.getElementById("NombreLocalidad");
  inputNombre.value = "";

  const inputIdProvincia = document.getElementById("IdProvincia");
  inputIdProvincia.value = "";

  inputNombre.classList.remove("is-invalid");
  inputNombre.classList.remove("is-valid");
  inputIdProvincia.classList.remove("is-invalid");
  inputIdProvincia.classList.remove("is-valid");

  const inputErrorNombre = document.getElementById("errorNombreLocalidad");
  inputErrorNombre.textContent = "";
  inputErrorNombre.style.display = "none";

  const inputErrorIdProvincia = document.getElementById("errorIdProvincia");
  inputErrorIdProvincia.textContent = "";
  inputErrorIdProvincia.style.display = "none";
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA VALIDAR EL FORMULARIO DE LOCALIDAD ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function ValidarFormularioLocalidad() {
  const inputNombre = document.getElementById("NombreLocalidad");
  const inputErrorNombre = document.getElementById("errorNombreLocalidad");

  const selectProvincia = document.getElementById("IdProvincia");
  const inputErrorProvincia = document.getElementById("errorIdProvincia");

  const nombre = inputNombre.value.trim();
  const provinciaSeleccionada = selectProvincia.value;

  inputErrorNombre.style.display = "none";
  inputErrorNombre.textContent = "";
  inputNombre.classList.remove("is-invalid", "is-valid");

  inputErrorProvincia.style.display = "none";
  inputErrorProvincia.textContent = "";
  selectProvincia.classList.remove("is-invalid", "is-valid");

  let esValido = true;

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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// VALIDACION EN VIVO: CAMBIA EL COLOR MIENTRAS EL USUARIO ESCRIBE //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById("NombreLocalidad").addEventListener("input", () => {
  const inputNombre = document.getElementById("NombreLocalidad");
  const errorNombre = document.getElementById("errorNombreLocalidad");
  const nombre = inputNombre.value.trim();

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

document.getElementById("IdProvincia").addEventListener("change", () => {
  const input = document.getElementById("IdProvincia");
  const error = document.getElementById("errorIdProvincia");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");

  if (valor.length === 0) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else {
    input.classList.add("is-valid");
    error.style.display = "none";
  }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR EL ERROR DE LOCALIDAD EXISTENTE /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarErrorLocalidadExistente(mensaje) {
  const errorLocalidad = document.getElementById("errorNombreLocalidad");
  const inputNombreLocalidad = document.getElementById("NombreLocalidad");

  errorLocalidad.textContent = mensaje;
  errorLocalidad.style.display = "block";
  inputNombreLocalidad.classList.add("is-invalid");
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA CREAR UNA LOCALIDAD ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function CrearLocalidad() {
  if (!ValidarFormularioLocalidad()) {
    ocultarOverlayGuardando();
    return;
  };

  mostrarOverlayGuardando();

  try {
    const localidad = {
      nombre: document.getElementById("NombreLocalidad").value.trim(),
      provinciaId: document.getElementById("IdProvincia").value,
    };

    const response = await authFetch("Localidades", {
      method: "POST",
      body: JSON.stringify(localidad),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorLocalidadExistente(errorData.mensaje);
      } else {
        MostrarErrorCatch();
      }
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      ObtenerLocalidades(false);
      CerrarPanelLocalidad();

      Swal.fire({
        title: "¡Localidad creada!",
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
    }, 800);

  } catch (error) {
    MostrarErrorCatch();
    ocultarOverlayGuardando();
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA EDITAR UNA LOCALIDAD //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EditarLocalidad(id) {
  if (!ValidarFormularioLocalidad()) {
    ocultarOverlayGuardando();
    return;
  };

  mostrarOverlayGuardando();

  try {
    const localidadId = parseInt(document.getElementById("IdLocalidad").value);

    const localidad = {
      id: localidadId,
      nombre: document.getElementById("NombreLocalidad").value.trim(),
      provinciaId: parseInt(document.getElementById("IdProvincia").value),
    };

    const response = await authFetch(`Localidades/${id}`, {
      method: "PUT",
      body: JSON.stringify(localidad),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorLocalidadExistente(errorData.mensaje);
      } else {
        MostrarErrorCatch();
      }
      ocultarOverlayGuardando();
      return;
    }


    setTimeout(() => {
      ocultarOverlayGuardando();
      ObtenerLocalidades(false);
      CerrarPanelLocalidad();

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
    }, 800);

  } catch (error) {
    MostrarErrorCatch();
    ocultarOverlayGuardando();
  }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION MOSTRAR MODAL DE ELIMINAR LOCALIDAD ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA ELIMINAR SI LOCALIDAD //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
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
      ObtenerLocalidades(false);
    } else {

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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR AL CARGAR LA VISTA ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
ComboParaFiltrarProvincias();
