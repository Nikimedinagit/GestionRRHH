
////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA ABRIR EL PANEL DE PUESTO ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function AbrirPanelPuesto() {
  document.getElementById("panelPuesto").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombrePuesto");
    if (inputNombre) inputNombre.focus();
  }, 400);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA CERRAR EL PANEL DE PUESTO ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function CerrarPanelPuesto() {
  document.getElementById("panelPuesto").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalPuesto();

}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIALIZAR LOS ONCHANGE DE FILTROS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
  $("#EstadoIdBuscar, #SectorIdBuscar, #DescripcionPuestoBuscar").on("input", function () {
    ObtenerPuestos(false);
  });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA FILTRAR LOS SECTORES /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ComboParaFiltrarSectores() {
  const res = await authFetch("Sector/Activos", {
    method: "GET",
  })

  const sectores = await res.json();

  const $combo = $("#SectorIdBuscar");
  $combo.empty();

  let opciones = `<option value="0">[Todos]</option>`;
  sectores.forEach((item) => {
    opciones += `<option value="${item.id}">${item.nombre}</option>`;
  });
  $combo.html(opciones);

  ObtenerPuestos();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA OBTENER LOS DATOS DE LA API DE PUESTOS ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerPuestos(mostrarSpinner = true) {

  if (mostrarSpinner) mostrarPantallaCarga();

  try {
    let estadoId = document.getElementById("EstadoIdBuscar").value;
    let sectorId = document.getElementById("SectorIdBuscar").value;
    let descripcion = document.getElementById("DescripcionPuestoBuscar").value;

    let filtro = {
      descripcion: descripcion !== "" ? descripcion : null,
      eliminado: estadoId !== "" ? parseInt(estadoId) : null,
      sectorId: sectorId !== "" ? parseInt(sectorId) : null,
    };

    const response = await authFetch("Puestos/Filtrar", {
      method: 'POST',
      body: JSON.stringify(filtro)
    })

    const data = await response.json();
    MostrarPuestos(data)
    LimpiarModalPuesto();
    CerrarPanelPuesto();

  } catch (error) {
    MostrarErrorCatch();
  }

  finally { if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1200); } };
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA MOSTRAR LOS DATOS DE LA API DE PUESTOS ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarPuestos(data) {
  window.listaPuestos = data;
  $("#tablaPuestosBody").empty();

  if (data.length === 0) {
    $("#tablaPuestosBody").append(
      "<tr><td colspan='3' class='text-center text-muted'>No hay puestos para mostrar.</td></tr>"
    );
    return;
  }

  $.each(data, function (index, item) {
    let filaClass = item.eliminado ? "fila-desactivada" : "";
    let visibleBotones = item.eliminado ? "display: none;" : "";
    let iconColor = item.eliminado ? "text-danger" : "text-success";

    $("#tablaPuestosBody").append(
      "<tr>" +
      "<td class='text-center align-middle'>" +
      "<button class='btn-editar' type='button' class='btn btn-sm " +
      (item.eliminado ? "btn-outline-success" : "btn-outline-danger") +
      "' data-tippy-content='" +
      (item.eliminado ? "Activar" : "Desactivar") +
      "' onclick='EliminarPuestoId(" +
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
      "<td class='align-middle " + filaClass + " puesto-truncado'>" + item.descripcion + "</td>" +
      "<td class='text-start align-middle d-none d-md-table-cell " + filaClass + "'>" +
      (item.sectorString || "Sin sector") +
      "</td>" +
      "<td class='d-flex justify-content-center align-items-center'>" +
      "<button class='btn-editar' data-action='edit' style='" +
      visibleBotones +
      " background: none; border: none;' onclick='MostrarModalEditarPuesto(" +
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
/// FUNCIÓN PARA MOSTRAR EL MODAL DE EDICIÓN DE LA PUESTO /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function MostrarModalEditarPuesto(id) {

  const res = await authFetch(`Puestos/${id}`);
  const puesto = await res.json();

  document.getElementById("IdPuesto").value = puesto.id;
  document.getElementById("NombrePuesto").value = puesto.descripcion;
  document.getElementById("IdSector").value = puesto.sectorId;

  AbrirPanelPuesto();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA BUSCAR EL ID DE LA PUESTO Y LLAMAR A LA FUNCIÓN DE EDICIÓN O CREACIÓN //////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function BuscarPuestosId() {

  const id = parseInt(document.getElementById("IdPuesto").value);

  if (!id || id === 0) {
    CrearPuesto();
  } else {
    EditarPuesto(id);
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA LIMPIAR EL FORMULARIO DE LA PUESTO //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function LimpiarModalPuesto() {
  document.getElementById('IdPuesto').value = '';
  const inputNombre = document.getElementById('NombrePuesto');
  inputNombre.value = '';

  const inputIdSector = document.getElementById('IdSector');
  inputIdSector.value = '';

  inputNombre.classList.remove('is-invalid');
  inputNombre.classList.remove('is-valid');
  inputIdSector.classList.remove('is-invalid');
  inputIdSector.classList.remove('is-valid');

  const inputErrorNombre = document.getElementById('errorNombrePuesto');
  inputErrorNombre.textContent = '';
  inputErrorNombre.style.display = 'none';

  const inputErrorIdSector = document.getElementById('errorIdSector');
  inputErrorIdSector.textContent = '';
  inputErrorIdSector.style.display = 'none';
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA VALIDAR EL FORMULARIO DE PUESTO //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function ValidarFormularioPuesto() {
  const inputNombre = document.getElementById("NombrePuesto");
  const inputErrorNombre = document.getElementById("errorNombrePuesto");
  const selectSector = document.getElementById("IdSector");
  const inputErrorSector = document.getElementById("errorIdSector");
  const nombre = inputNombre.value.trim();
  const sectorSeleccionada = selectSector.value;

  inputErrorNombre.style.display = 'none';
  inputErrorNombre.textContent = '';
  inputNombre.classList.remove("is-invalid", "is-valid");

  inputErrorSector.style.display = 'none';
  inputErrorSector.textContent = '';
  selectSector.classList.remove("is-invalid", "is-valid");

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
    inputErrorNombre.style.display = "none";
    inputErrorNombre.textContent = "";
  }

  if (!sectorSeleccionada) {
    selectSector.classList.add("is-invalid");
    inputErrorSector.style.display = "block";
    inputErrorSector.textContent = "Seleccione un sector.";
    esValido = false;
  } else {
    selectSector.classList.add("is-valid");
    inputErrorSector.style.display = "none";
    inputErrorSector.textContent = "";
  }

  return esValido;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// VALIDACIÓN EN VIVO: CAMBIA EL COLOR MIENTRAS EL USUARIO ESCRIBE ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById("NombrePuesto").addEventListener("input", () => {
  const inputNombre = document.getElementById("NombrePuesto");
  const errorNombre = document.getElementById("errorNombrePuesto");
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

document.getElementById("IdSector").addEventListener("change", () => {
  const input = document.getElementById("IdSector");
  const error = document.getElementById("errorIdSector");
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
/// FUNCIÓN PARA MOSTRAR EL ERROR DE PUESTO EXISTENTE ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarErrorPuestoExistente(mensaje) {
  const errorPuesto = document.getElementById("errorNombrePuesto");
  const inputNombrePuesto = document.getElementById("NombrePuesto");

  errorPuesto.textContent = mensaje;
  errorPuesto.style.display = "block";
  inputNombrePuesto.classList.add("is-invalid");
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIÓN PARA CREAR UNA PUESTO ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function CrearPuesto() {

  if (!ValidarFormularioPuesto()) {
    ocultarOverlayGuardando();
    return;
  };

  mostrarOverlayGuardando();

  try {

    const puesto = {
      descripcion: document.getElementById('NombrePuesto').value.trim(),
      sectorId: document.getElementById('IdSector').value
    }
    const response = await authFetch("Puestos", {
      method: 'POST',
      body: JSON.stringify(puesto)
    })
    const data = await response.json();

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorPuestoExistente(errorData.mensaje);
      } else {
        MostrarErrorCatch();
      }
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      ObtenerPuestos(false);
      CerrarPanelPuesto();

      Swal.fire({
        title: "¡Puesto Creado!",
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
/// FUNCIÓN PARA EDITAR UNA PUESTO ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EditarPuesto(id) {

  if (!ValidarFormularioPuesto()) {
    ocultarOverlayGuardando();
    return;
  };

  mostrarOverlayGuardando();

  try {
    let puestoId = document.getElementById("IdPuesto").value;

    let puesto = {
      id: puestoId,
      descripcion: document.getElementById("NombrePuesto").value.trim(),
      sectorId: document.getElementById("IdSector").value
    }
    const response = await authFetch(`Puestos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(puesto)
    })
    const data = await response.json();
    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorPuestoExistente(errorData.mensaje);
      } else {
        MostrarErrorCatch();
      }
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      ObtenerPuestos(false);
      CerrarPanelPuesto();
      Swal.fire({
        title: "¡Puesto Modificado!",
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
// FUNCION PAR AMOSTRAR EL MODAL DE ELIMINAR PUESTO ////////////////////////////////////////////////  
////////////////////////////////////////////////////////////////////////////////////////////////////////
function EliminarPuestoId(id, eliminado) {
  Swal.fire({
    title: eliminado
      ? "¿Deseás reactivar este puesto?"
      : "¿Deseás desactivar este puesto?",
    html: eliminado
      ? "<p class='swal2-content-center'>Esta acción volverá a habilitar el puesto en el sistema.</p>"
      : "<p class='swal2-content-center'>El puesto se desactivará y dejará de estar disponible.</p>",
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
        EliminarSiPuesto(id);
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
/// FUNCIÓN PARA ELIMINAR SI PUESTO /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EliminarSiPuesto(id) {
  try {
    const response = await authFetch(`Puestos/${id}`, {
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
      ObtenerPuestos(false);
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
// INICILZIAR AL CARGAR LA VISTA ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
ComboParaFiltrarSectores();