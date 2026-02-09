////////////////////////////////////////////////////////////////////////////////////////////////////////
// ABRIR PANEL DE PROVINCIA ////////////////////////////////////////////////////////////////////  
////////////////////////////////////////////////////////////////////////////////////////////////////////
function abrirPanelProvincia() {
  document.getElementById("panelProvincia").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreProvincia");
    if (inputNombre) inputNombre.focus();
  }, 400);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// CERRAR PANEL DE PROVINCIA ////////////////////////////////////////////////////////////////////  
////////////////////////////////////////////////////////////////////////////////////////////////////////
function cerrarPanelProvincia() {
  document.getElementById("panelProvincia").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalProvincia();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICILIZAR LOS ONCHANGE DE FILTROS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {

  $("#EstadoIdBuscar, #NombreProvinciaBuscar").on("input", function () {
    ObtenerProvincias(false);
  });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
// OBTENER LOS DATOS DE LA API DE PROVINCIAS ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerProvincias(mostrarSpinner = true) {

  if (mostrarSpinner) mostrarPantallaCarga();

  try {
    let estado = document.getElementById("EstadoIdBuscar").value;
    let filtro = {
      nombre: document.getElementById("NombreProvinciaBuscar").value,
      eliminado: estado !== "" ? parseInt(estado) : null,
    };

    const response = await authFetch("Provincias/Filtrar", {
      method: "POST",
      body: JSON.stringify(filtro),
    })

    const data = await response.json();
    MostrarProvincias(data);
    LimpiarModalProvincia();
    cerrarPanelProvincia();

  } catch (error) {
    MostrarErrorCatch();
  }

  finally {
    if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1200); };
  }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS DATOS DE LA API DE PROVINCIAS ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarProvincias(data) {
  window.listaProvincias = data;

  $("#tablaProvinciasBody").empty();

  if (data.length === 0) {
    $("#tablaProvinciasBody").append(
      "<tr><td colspan='2' class='text-center text-muted'>No hay provincias para mostrar.</td></tr>"
    );
    return;
  }

  $.each(data, function (index, item) {
    let filaClass = item.eliminado ? "fila-desactivada" : "";
    let visibleBotones = item.eliminado ? "display: none;" : "";
    let iconColor = item.eliminado ? "text-danger" : "text-success";

    $("#tablaProvinciasBody").append(
      "<tr>" +
      "<td class='text-center align-middle'>" +
      "<button class='btn-editar' type='button' class='btn btn-sm " +
      (item.eliminado ? "btn-outline-success" : "btn-outline-danger") +
      "' data-tippy-content='" +
      (item.eliminado ? "Activar" : "Desactivar") +
      "' onclick='EliminarProvinciaId(" +
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
     "<td class='align-middle flex-text provincia-truncada" + filaClass + "'>" +
      item.nombre +
      "</td>" +
      "<td class='d-flex justify-content-center align-items-center'>" +
      "<button class='btn-editar' data-action='edit' style='" +
      visibleBotones +
      " background: none; border: none;' onclick='MostrarModalEditar(" +
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
// FUNCION PARA MOSTRAR EL MODAL DE EDICION DE LA PROVINCIA /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function MostrarModalEditar(id) {
  const res = await authFetch(`Provincias/${id}`);
  const provincia = await res.json();
  const nombre = provincia.nombre ? provincia.nombre.trim() : "";
  document.getElementById("IdProvincia").value = provincia.id;
  document.getElementById("NombreProvincia").value = nombre;

  abrirPanelProvincia();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA BUSCAR EL ID DE LA PROVINCIA Y LLAMAR A LA FUNCIÓN DE EDICION O CREACIÓN ////////  
////////////////////////////////////////////////////////////////////////////////////////////////////////
function BuscarProvinciaId() {
  const id = parseInt(document.getElementById("IdProvincia").value);

  if (!id || id === 0) {
    CrearProvincia();
  } else {
    EditarProvincia(id);
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA LIMPIAR EL MODAL DE PROVINCIA //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function LimpiarModalProvincia() {
  document.getElementById("IdProvincia").value = "";
  const inputNombre = document.getElementById("NombreProvincia");
  inputNombre.value = "";

  inputNombre.classList.remove("is-invalid");
  inputNombre.classList.remove("is-valid");

  const inputErrorNombre = document.getElementById("errorNombreProvincia");
  inputErrorNombre.textContent = "";
  inputErrorNombre.style.display = "none";
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA VALIDAR EL FORMULARIO DE PROVINCIA ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function ValidarFormularioProvincia() {
  const inputNombre = document.getElementById("NombreProvincia");
  const inputErrorNombre = document.getElementById("errorNombreProvincia");
  const nombre = inputNombre.value.trim();

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

  inputNombre.classList.add("is-valid");
  inputErrorNombre.style.display = "none";
  return true;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// VALIDACION EN VIVO: CAMBIA EL COLOR MIENTRAS EL USUARIO ESCRIBE //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById("NombreProvincia").addEventListener("input", () => {
  const inputNombre = document.getElementById("NombreProvincia");
  const errorNombre = document.getElementById("errorNombreProvincia");
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
  }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR EL ERROR DE PROVINCIA EXISTENTE /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarErrorProvinciaExistente(mensaje) {
  const errorProvincia = document.getElementById("errorNombreProvincia");
  const inputNombreProvincia = document.getElementById("NombreProvincia");

  errorProvincia.textContent = mensaje;
  errorProvincia.style.display = "block";
  inputNombreProvincia.classList.add("is-invalid");
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA CREAR UNA PROVINCIA ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function CrearProvincia() {
  if (!ValidarFormularioProvincia()) {
    ocultarOverlayGuardando();
    return;
  }

  mostrarOverlayGuardando();

  try {
    const provincia = {
      nombre: document.getElementById("NombreProvincia").value.trim(),
    };

    const response = await authFetch("Provincias", {
      method: "POST",
      body: JSON.stringify(provincia),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorProvinciaExistente(errorData.mensaje);
      } else {
        MostrarErrorCatch();
      }
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      ObtenerProvincias(false);
      cerrarPanelProvincia();

      Swal.fire({
        title: "¡Provincia Creada!",
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
// FUNCION PARA EDITAR UNA PROVINCIA //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EditarProvincia(id) {
  if (!ValidarFormularioProvincia()) {
    ocultarOverlayGuardando();
    return;
  }

  mostrarOverlayGuardando();

  try {
    const provinciaId = parseInt(document.getElementById("IdProvincia").value);

    const provincia = {
      id: provinciaId,
      nombre: document.getElementById("NombreProvincia").value.trim(),
    };

    const response = await authFetch(`Provincias/${id}`, {
      method: "PUT",
      body: JSON.stringify(provincia),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorProvinciaExistente(errorData.mensaje);
      } else {
        MostrarErrorCatch();
      }
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      ObtenerProvincias(false);

      cerrarPanelProvincia();

      Swal.fire({
        title: "¡Provincia Modificada!",
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
// FUNCION PARA MOSTRRAR EL MODAL DE ELIMINAR PROVINCIA /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function EliminarProvinciaId(id, eliminado) {
  Swal.fire({
    title: eliminado
      ? "¿Deseás reactivar esta provincia?"
      : "¿Deseás desactivar esta provincia?",
    html: eliminado
      ? "<p class='swal2-content-center'>Esta acción volverá a habilitar la provincia en el sistema.</p>"
      : "<p class='swal2-content-center'>La provincia se desactivará y dejará de estar disponible.</p>",
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
        EliminarSiProvincia(id);
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
// FUNCIÓN PARA ELIMINAR SI PROVINCIA ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EliminarSiProvincia(id) {
  try {
    const response = await authFetch(`Provincias/${id}`, {
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
      ObtenerProvincias(false);
    } else {
      Swal.fire({
        title: "Acción no permitida",
        html: `
          <div class="text-center">
            <p>${data.mensaje || "No se puede realizar esta acción."}</p>
            <p>Eliminá las localidades antes de intentar desactivarlo.</p>
          </div>
        `,
        confirmButtonText: "Entendido",
        customClass: {
          popup: "shadow rounded p-3",
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
ObtenerProvincias();
