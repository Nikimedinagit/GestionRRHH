
////////////////////////////////////////////////////////////////////////////////////////////////////////
// ABRIR PANEL DE TIPO DE LICENCIA ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function AbrirPanelTipoDeLicencia() {
  document.getElementById("panelTipoDeLicencia").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreTipoDeLicencia");
    if (inputNombre) inputNombre.focus();
  }, 400);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// CERRAR PANEL DE TIPO DE LICENCIA ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function CerrarPanelTipoDeLicencia() {
  document.getElementById("panelTipoDeLicencia").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalTipoDeLicencia();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICILIZAR LOS ONCHANGE DE FILTROS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {

  $("#EstadoIdBuscar, #NombreTipoLicenciaBuscar").on("input", function () {
    ObtenerTiposDeLicencias(false);
  });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
// OBTENER LOS DATOS DE LA API DE TIPOS DE LICENCIAS ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerTiposDeLicencias(mostrarSpinner = true) {

  if (mostrarSpinner) mostrarPantallaCarga();

  try {
    let estado = document.getElementById("EstadoIdBuscar").value;
    let filtro = {
      nombre: document.getElementById("NombreTipoLicenciaBuscar").value,
      eliminado: estado !== "" ? parseInt(estado) : null,
    };

    const response = await authFetch("TipoDeLicencias/Filtrar", {
      method: "POST",
      body: JSON.stringify(filtro),
    })
    const data = await response.json();
    MostrarTiposDeLicencias(data);
    LimpiarModalTipoDeLicencia();
    CerrarPanelTipoDeLicencia();
  } catch (error) {
    MostrarErrorCatch();
  }
  finally { if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1200); } };
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS TIPOS DE LICENCIAS ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarTiposDeLicencias(data) {
  window.listaTiposDeLicencias = data;

  $("#tablaTiposLicenciaBody").empty();

  if (data.length === 0) {
    $("#tablaTiposLicenciaBody").append(
      "<tr><td colspan='2' class='text-center text-muted'>No hay tipos de licencias para mostrar.</td></tr>"
    );
    return;
  }

  $.each(data, function (index, item) {
    let filaClass = item.eliminado ? "fila-desactivada" : "";
    let visibleBotones = item.eliminado ? "display: none;" : "";
    let iconColor = item.eliminado ? "text-danger" : "text-success";

    $("#tablaTiposLicenciaBody").append(
      "<tr>" +
      "<td class='text-center align-middle'>" +
      "<button class='btn-editar' type='button' class='btn btn-sm " +
      (item.eliminado ? "btn-outline-success" : "btn-outline-danger") +
      "' data-tippy-content='" +
      (item.eliminado ? "Activar" : "Desactivar") +
      "' onclick='EliminarTipoDeLicenciaId(" +
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
      " tipo-de-licencia-truncado'>" +
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
// FUNCION PARA MOSTRAR EL MODAL DE EDICION DE LA TIPO DE LICENCIA ////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function MostrarModalEditar(id) {
  const res = await authFetch(`TipoDeLicencias/${id}`);
  const tipoDeLicencia = await res.json();
  const nombre = tipoDeLicencia.nombre ? tipoDeLicencia.nombre.trim() : "";
  document.getElementById("IdTipoDeLicencia").value = tipoDeLicencia.id;
  document.getElementById("NombreTipoDeLicencia").value = nombre;

  AbrirPanelTipoDeLicencia();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA BUSCAR EL ID DE LA TIPO DE LICENCIA Y LLAMAR A LA FUNCIÓN DE EDICION O CREACIÓN ////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function BuscarTipoDeLicenciaId() {
  const id = parseInt(document.getElementById("IdTipoDeLicencia").value);

  if (!id || id === 0) {
    CrearTipoDeLicencia();
  } else {
    EditarTipoDeLicencia(id);
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA LIMPIAR EL MODAL DE TIPO DE LICENCIA //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function LimpiarModalTipoDeLicencia() {

  document.getElementById("IdTipoDeLicencia").value = "";
  const inputNombre = document.getElementById("NombreTipoDeLicencia");
  inputNombre.value = "";

  inputNombre.classList.remove("is-invalid");
  inputNombre.classList.remove("is-valid");

  const inputErrorNombre = document.getElementById("errorNombreTipoDeLicencia");
  inputErrorNombre.textContent = "";
  inputErrorNombre.style.display = "none";
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA VALIDAR EL FORMULARIO DE TIPO DE LICENCIA ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function ValidarFormularioTipoDeLicencia() {
  const inputNombre = document.getElementById("NombreTipoDeLicencia");
  const inputErrorNombre = document.getElementById("errorNombreTipoDeLicencia");
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
document.getElementById("NombreTipoDeLicencia").addEventListener("input", () => {
  const inputNombre = document.getElementById("NombreTipoDeLicencia");
  const errorNombre = document.getElementById("errorNombreTipoDeLicencia");
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
// FUNCIÓN PARA MOSTRAR EL ERROR DE TIPO DE LICENCIA EXISTENTE /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarErrorTipoDeLicenciaExistente(mensaje) {
  const errorTipoDeLicencia = document.getElementById("errorNombreTipoDeLicencia");
  const inputNombreTipoDeLicencia = document.getElementById("NombreTipoDeLicencia");

  errorTipoDeLicencia.textContent = mensaje;
  errorTipoDeLicencia.style.display = "block";
  inputNombreTipoDeLicencia.classList.add("is-invalid");
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA CREAR UNA TIPO DE LICENCIA ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function CrearTipoDeLicencia() {

  if (!ValidarFormularioTipoDeLicencia()) {
    ocultarOverlayGuardando();
    return;
  };

  mostrarOverlayGuardando();

  try {
    const tipoDeLicencia = {
      nombre: document.getElementById("NombreTipoDeLicencia").value.trim(),
    };
    const response = await authFetch("TipoDeLicencias", {
      method: "POST",
      body: JSON.stringify(tipoDeLicencia),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorTipoDeLicenciaExistente(errorData.mensaje);
      } else {
        MostrarErrorCatch();
      }
      ocultarOverlayGuardando();
      return;
    }


    setTimeout(() => {
      ocultarOverlayGuardando();
      ObtenerTiposDeLicencias(false);
      CerrarPanelTipoDeLicencia();

      Swal.fire({
        title: "¡Licencia Creada!",
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
  };
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA EDITAR UNA TIPO DE LICENCIA //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EditarTipoDeLicencia(id) {

  if (!ValidarFormularioTipoDeLicencia()) {
    ocultarOverlayGuardando();
    return;
  };

  mostrarOverlayGuardando();

  try {
    let tipoDeLicencia = {
      id: document.getElementById("IdTipoDeLicencia").value,
      nombre: document.getElementById("NombreTipoDeLicencia").value.trim(),
    };
    const response = await authFetch(`TipoDeLicencias/${id}`, {
      method: "PUT",
      body: JSON.stringify(tipoDeLicencia),
    })


    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorTipoDeLicenciaExistente(errorData.mensaje);
      } else {
        MostrarErrorCatch();
      }
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      ObtenerTiposDeLicencias(false);
      CerrarPanelTipoDeLicencia();

      Swal.fire({
        title: "¡Licencia Modificada!",
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
  };
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION MOSTRAR MODAL DE ELIMINAR TIPO DE LICENCIA ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function EliminarTipoDeLicenciaId(id, eliminado) {
  Swal.fire({
    title: eliminado
      ? "¿Deseás reactivar esta licencia?"
      : "¿Deseás desactivar esta licencia?",
    html: eliminado
      ? "<p class='swal2-content-center'>Esta acción volverá a habilitar la licencia en el sistema.</p>"
      : "<p class='swal2-content-center'>La licencia se desactivará y dejará de estar disponible.</p>",
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
        EliminarSiTipoDeLicencia(id);
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
// FUNCIÓN PARA ELIMINAR SI TIPO DE LICENCIA ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EliminarSiTipoDeLicencia(id) {
  try {
    const response = await authFetch(`TipoDeLicencias/${id}`, {
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
      ObtenerTiposDeLicencias(false);
    } else {
      Swal.fire({
        title: "Acción no permitida",
        html: `
          <div class="text-center">
            <p>${data.mensaje || "No se puede realizar esta acción."}</p>
            <p>Eliminá o espere a la expiracion de la licencia antes de intentar desactivarla.</p>
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
ObtenerTiposDeLicencias();