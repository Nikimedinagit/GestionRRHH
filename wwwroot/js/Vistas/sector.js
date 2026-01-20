
////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA ABRIR EL PANEL DE SECTOR ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function AbrirPanelSector() {
  document.getElementById("panelSector").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreSector");
    if(inputNombre) inputNombre.focus();
  }, 400);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA CERRAR EL PANEL DE SECTOR ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
  function CerrarPanelSector() {
    document.getElementById("panelSector").classList.remove("abierto");
    const fondo = document.getElementById("fondoOscuro");
    fondo.classList.remove("visible");

    LimpiarModalSector();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIXAR LOS ONCHANGES DEL FILTRO //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
  ObtenerSectores();

  $("#EstadoIdBuscar, #NombreSectorBuscar").on("input", function () {
    ObtenerSectores();
  });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA OBTENER LOS DATOS DE LA API DE SECTORES ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerSectores(mostrarSpinner = true) {

    if (mostrarSpinner) mostrarPantallaCarga();

    let estadoId = document.getElementById("EstadoIdBuscar").value;
    let filtro = {
        nombre: document.getElementById("NombreSectorBuscar").value.trim(),
        eliminado: estadoId !== "" ? parseInt(estadoId) : null,
    }
    const res = await authFetch("Sector/Filtrar", {
        method: "POST",
        body: JSON.stringify(filtro)
    })
    .then(response => response.json())
    .then(data => {
        MostrarSectores(data);
        LimpiarModalSector();
        CerrarPanelSector();
      })
    .catch((error) => {
      MostrarErrorCatch();
    })
    .finally(() => { if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1500); } });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA MOSTRAR LOS DATOS DE LA API DE SECTORES ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarSectores(data) {
    window.listaSectores = data;

  $("#tablaSectoresBody").empty();

  if (data.length === 0) {
    $("#tablaSectoresBody").append(
      "<tr><td colspan='2' class='text-center text-muted'>No hay sectores para mostrar.</td></tr>"
    );
    return;
  }

  $.each(data, function (index, item) {
    let filaClass = item.eliminado ? "fila-desactivada" : "";
    let visibleBotones = item.eliminado ? "display: none;" : "";
    let iconColor = item.eliminado ? "text-danger" : "text-success";

    $("#tablaSectoresBody").append(
      "<tr>" +
        "<td class='text-center align-middle'>" +
        "<button class='btn-editar' type='button' class='btn btn-sm " +
        (item.eliminado ? "btn-outline-success" : "btn-outline-danger") +
        "' data-tippy-content='" +
        (item.eliminado ? "Activar" : "Desactivar") +
        "' onclick='EliminarSectorId(" +
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
        " sector-truncado'>" +
        item.nombre +
        "</td>" +
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

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA MOSTRAR EL MODAL DE EDICIÓN DE LA SECTOR ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function MostrarModalEditar(id) {

    const res = await authFetch(`Sector/${id}`);
    const sector = await res.json();

    document.getElementById('IdSector').value = sector.id;
    document.getElementById('NombreSector').value = sector.nombre;

    AbrirPanelSector(); 
}   


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA BUSCAR EL ID DE LA SECTOR Y LLAMAR A LA FUNCIÓN DE EDICIÓN O CREACIÓN //////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function BuscarSectorId() { 
    
    const id = parseInt(document.getElementById("IdSector").value); 
    if (!id || id === 0) {
        CrearSector();
    }
    else {
        EditarSector(id); 
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA LIMPIAR EL FORMULARIO DE LA SECTOR ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function LimpiarModalSector() {
  document.getElementById('IdSector').value = '';
  const inputNombre = document.getElementById('NombreSector');
  inputNombre.value = '';

  inputNombre.classList.remove('is-invalid');
  inputNombre.classList.remove('is-valid');

  const inputErrorNombre = document.getElementById('errorNombreSector');
  inputErrorNombre.textContent = '';
  inputErrorNombre.style.display = 'none';
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA VALIDAR EL FORMULARIO DE SECTOR //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function ValidarFormularioSector() {
    const inputNombre = document.getElementById("NombreSector");
    const inputErrorNombre = document.getElementById("errorNombreSector");
    const nombre = inputNombre.value.trim();

    inputErrorNombre.style.display = 'none';
    inputErrorNombre.textContent = '';
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
/// VALIDACIÓN EN VIVO: CAMBIA EL COLOR MIENTRAS EL USUARIO ESCRIBE ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById("NombreSector").addEventListener("input", () => {
    const inputNombre = document.getElementById("NombreSector");
    const errorNombre = document.getElementById("errorNombreSector");
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
/// FUNCIÓN PARA MOSTRAR EL ERROR DE SECTOR EXISTENTE ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarErrorSectorExistente(mensaje) {
    const errorSector = document.getElementById("errorNombreSector");
    const inputNombreSector = document.getElementById("NombreSector");

    errorSector.textContent = mensaje;
    errorSector.style.display = "block";
    inputNombreSector.classList.add("is-invalid");
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA CREAR UNA SECTOR ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function CrearSector() {
  if (!ValidarFormularioSector()) return;

  mostrarOverlayGuardando();

  try {
    const sector = {
      nombre: document.getElementById("NombreSector").value.trim(),
    };

    const response = await authFetch("Sector", {
      method: "POST",
      body: JSON.stringify(sector),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorSectorExistente(errorData.mensaje);
      }
      return;
    }

    ObtenerSectores(false);

  } catch (error) {
    MostrarErrorCatch();
  } finally {
    setTimeout(() => {
      ocultarOverlayGuardando();
      CerrarPanelSector();

      Swal.fire({
        title: "¡Sector creado!",
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
    }, 1500);
  }
}




////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA EDITAR UNA SECTOR ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EditarSector(id) {
  if (!ValidarFormularioSector()) return;

  mostrarOverlayGuardando();

  try {
    let sectorId = parseInt(document.getElementById("IdSector").value);

    const sector = {
      id: sectorId,
      nombre: document.getElementById("NombreSector").value.trim(),
    };

    const response = await authFetch(`Sector/${id}`, {
      method: "PUT",
      body: JSON.stringify(sector),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorSectorExistente(errorData.mensaje);
      }
      return;
    }

    ObtenerSectores(false);

  } catch (error) {
    MostrarErrorCatch();
  } finally {
    setTimeout(() => {
      ocultarOverlayGuardando();
      CerrarPanelSector();

      Swal.fire({
        title: "¡Sector Modificado!",
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

    }, 1500);
  }
}





////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION APRA MOSTRAR EL MODAL DE ELIMINAR SECTOR ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function EliminarSectorId(id, eliminado) {
   Swal.fire({
    title: eliminado
      ? "¿Deseás reactivar este sector?"
      : "¿Deseás desactivar este sector?",
    html: eliminado
      ? "<p class='swal2-content-center'>Esta acción volverá a habilitar el sector en el sistema.</p>"
      : "<p class='swal2-content-center'>El sector se desactivará y dejará de estar disponible.</p>",
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
      EliminarSiSector(id);
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
/// FUNCIÓN PARA ELIMINAR SI SECTOR /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EliminarSiSector(id) {
   try {
    const response = await authFetch(`Sector/${id}`, {
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
      ObtenerSectores();
    } else {
      Swal.fire({
        title: "Acción no permitida",
        html: `
          <div class="text-center">
            <p>${data.mensaje || "No se puede realizar esta acción."}</p>
            <p>Eliminá los puesto antes de intentar desactivarlo.</p>
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
/// INICIALIZAR AL CARGAR LA VISTA ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
ObtenerSectores();


