////////////////////////////////////////////////////////////////////////////////////////////////////////
// ABRIR PANEL DE TIPO DE CRITERIO ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function AbrirPanelTipoDeCriterio() {
  document.getElementById("panelTipoDeCriterio").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreTipoDeCriterio");
    if (inputNombre) inputNombre.focus();
  }, 400);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// CERRAR PANEL DE TIPO DE CRITERIO ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function CerrarPanelTipoDeCriterio() {
  document.getElementById("panelTipoDeCriterio").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalTipoDeCriterio();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICILIAR LOS ONCHANGE DE FILTROS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
  ObtenerTiposDeCriterios(false);

  $("#EstadoIdBuscar, #NombreTipoDeCriterioBuscar").on("input", function () {
    ObtenerTiposDeCriterios(false);
  });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
// OBTENER LOS DATOS DE LA API DE TIPOS DE CRITERIOS ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerTiposDeCriterios(mostrarSpinner = true) {
  if (mostrarSpinner) mostrarPantallaCarga();

  try {
    let estado = document.getElementById("EstadoIdBuscar").value;
    let filtro = {
      nombre: document.getElementById("NombreTipoDeCriterioBuscar").value,
      eliminado: estado !== "" ? parseInt(estado) : null,
    };

    const res = await authFetch("TiposDeCriterios/Filtrar", {
      method: "POST",
      body: JSON.stringify(filtro),
    });

    const data = await res.json();
    MostrarTiposDeCriterios(data);
    LimpiarModalTipoDeCriterio();
    CerrarPanelTipoDeCriterio();

  } catch (error) {
    MostrarErrorCatch();
  } finally {
    if (mostrarSpinner) {
      setTimeout(() => {
        ocultarPantallaCarga();
      }, 1200);
    }
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// MOSTRAR LOS DATOS DE LA API DE TIPOS DE CRITERIOS ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarTiposDeCriterios(data) {
  window.listaTiposDeCriterios = data;

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
    let iconColor = item.eliminado ? "text-danger" : "text-success"

    $("#tablaTiposCriterioBody").append(
      "<tr>" +
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
      "<td class='align-middle flex-text" +
      filaClass +
      " tipo-de-criterio-truncado'>" +
      item.nombre +
      "</td>" +
      "<td class='d-flex justify-content-center align-items-center'>" +
      "<button class='btn-editar' data-action='edit' style='" +
      visibleBotones +
      " background: none; border: none;' onclick='MostrarModalEditar(" +
      item.id + ")' data-tippy-content='Editar'>" +
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
// MOSTRAR MODAL DE EDICION DE LA TIPO DE CRITERIO //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function MostrarModalEditar(id) {
  const res = await authFetch(`TiposDeCriterios/${id}`);
  const tipoDeCriterio = await res.json();
  const nombre = tipoDeCriterio.nombre ? tipoDeCriterio.nombre.trim() : "";
  document.getElementById("IdTipoDeCriterio").value = tipoDeCriterio.id;
  document.getElementById("NombreTipoDeCriterio").value = nombre;

  AbrirPanelTipoDeCriterio();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// BUSCAR EL ID DE LA TIPO DE CRITERIO Y LLAMAR A LA FUNCIÓN DE EDICION O CREACIÓN ////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function BuscarTipoDeCriterioId() {
  const id = parseInt(document.getElementById("IdTipoDeCriterio").value);

  if (!id || id === 0) {
    CrearTipoDeCriterio();
  } else {
    EditarTipoDeCriterio(id);
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA CREAR UNA TIPO DE CRITERIO ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function CrearTipoDeCriterio() {
  if (!ValidarFormularioTipoDeCriterio()) {
    ocultarOverlayGuardando();
    return;
  }

  mostrarOverlayGuardando();

  try {
    const tipoDeCriterio = {
      nombre: document.getElementById("NombreTipoDeCriterio").value.trim(),
    };

    const response = await authFetch("TiposDeCriterios", {
      method: "POST",
      body: JSON.stringify(tipoDeCriterio),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.mensaje) {
        MostrarErrorTipoDeCriterioExistente(data.mensaje);
      }
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      CerrarPanelTipoDeCriterio();
      ObtenerTiposDeCriterios(false);

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
    }, 800);

  } catch (error) {
    MostrarErrorCatch();
    ocultarOverlayGuardando();
  }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA EDITAR UNA TIPO DE CRITERIO //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EditarTipoDeCriterio(id) {
  if (!ValidarFormularioTipoDeCriterio()) {
    ocultarOverlayGuardando();
    return;
  }

  mostrarOverlayGuardando();

  try {
    const tipoDeCriterio = {
      id: document.getElementById("IdTipoDeCriterio").value,
      nombre: document.getElementById("NombreTipoDeCriterio").value.trim(),
    };

    const response = await authFetch(`TiposDeCriterios/${id}`, {
      method: "PUT",
      body: JSON.stringify(tipoDeCriterio),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.mensaje) {
        MostrarErrorTipoDeCriterioExistente(data.mensaje);
      }
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      CerrarPanelTipoDeCriterio();
      ObtenerTiposDeCriterios(false);

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
    }, 800);

  } catch (error) {
    MostrarErrorCatch();
    ocultarOverlayGuardando();
  }
}





////////////////////////////////////////////////////////////////////////////////////////////////////////
// LIMPIAR EL MODAL DE TIPO DE CRITERIO /////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function LimpiarModalTipoDeCriterio() {

  document.getElementById("IdTipoDeCriterio").value = "";
  const inputNombre = document.getElementById("NombreTipoDeCriterio");
  inputNombre.value = "";

  inputNombre.classList.remove("is-invalid");
  inputNombre.classList.remove("is-valid");

  const inputErrorNombre = document.getElementById("errorNombreTipoDeCriterio");
  inputErrorNombre.textContent = "";
  inputErrorNombre.style.display = "none";
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA VALIDAR EL FORMULARIO DE TIPO DE CRITERIO /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function ValidarFormularioTipoDeCriterio() {
  const inputNombre = document.getElementById("NombreTipoDeCriterio");
  const inputErrorNombre = document.getElementById("errorNombreTipoDeCriterio");
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
document.getElementById("NombreTipoDeCriterio").addEventListener("input", () => {
  const inputNombre = document.getElementById("NombreTipoDeCriterio");
  const errorNombre = document.getElementById("errorNombreTipoDeCriterio");
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
    inputNombre.classList.add("is-valid"); // Color verde cuando cumple
    errorNombre.style.display = "none";
  }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA MOSTRAR EL ERROR DE TIPO DE CRITERIO EXISTENTE ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarErrorTipoDeCriterioExistente(mensaje) {
  const errorTipoDeCriterio = document.getElementById("errorNombreTipoDeCriterio");
  const inputNombreTipoDeCriterio = document.getElementById("NombreTipoDeCriterio");

  errorTipoDeCriterio.textContent = mensaje;
  errorTipoDeCriterio.style.display = "block";
  inputNombreTipoDeCriterio.classList.add("is-invalid");
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA MOSTRAR EL MODAL DE ELIMINAR UN TIPO DE CRITERIO //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA ELIMINAR UN TIPO DE CRITERIO //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
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
      ObtenerTiposDeCriterios(false);
    } else {

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
ObtenerTiposDeCriterios()