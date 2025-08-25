//INICIO PANEL FORMUALRIO//
//Función para abrir el formulario lateral
function AbrirPanelTipoDeLicencia() {
  document.getElementById("panelTipoDeLicencia").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreTipoDeLicencia");
    if (inputNombre) inputNombre.focus();
  }, 400);
}

//Funcion para cerrar el formulario lateral
function CerrarPanelTipoDeLicencia() {
  document.getElementById("panelTipoDeLicencia").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalTipoDeLicencia();
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
  ObtenerTiposDeLicencias();

  $("#EstadoIdBuscar").on("change", function () {
    ObtenerTiposDeLicencias();
  });
});
//FIN ONCHANGE DE FILTROS//


// Funcion para obtener los tipos de licencias
async function ObtenerTiposDeLicencias() {

  let estado = document.getElementById("EstadoIdBuscar").value;
  let filtro = {
    eliminado: estado !== "" ? parseInt(estado) : null,
  };

  const res = await authFetch("TipoDeLicencias/Filtrar", {
    method: "POST",
    body: JSON.stringify(filtro),
  })
    .then(response => response.json())
    .then((data) => {
      MostrarTiposDeLicencias(data);
      LimpiarModalTipoDeLicencia();
      CerrarPanelTipoDeLicencia();
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}



// Funcion Para Mostrar los tipos de licencias en la tabla
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
        // Columna Activo (toggle)
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
        // Columna Tipo de Licencia (nombre)
        "<td class='align-middle " +
        filaClass +
        " tipo-de-licencia-truncado'>" +
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


// Funcion para mostrar el modal de edición de la tipo de licencia
async function MostrarModalEditar(id) {
  const res = await authFetch(`TipoDeLicencias/${id}`);
  const tipoDeLicencia = await res.json();
  const nombre = tipoDeLicencia.nombre ? tipoDeLicencia.nombre.trim() : "";
  document.getElementById("IdTipoDeLicencia").value = tipoDeLicencia.id;
  document.getElementById("NombreTipoDeLicencia").value = nombre;

  AbrirPanelTipoDeLicencia();
}

// Funcion para buscar el id de la tipo de licencia y llamar a la función de edición o creación
function BuscarTipoDeLicenciaId() {
  const id = parseInt(document.getElementById("IdTipoDeLicencia").value);

  if (!id || id === 0) {
    CrearTipoDeLicencia();
  } else {
    EditarTipoDeLicencia(id);
  }
}

// Funcion para limpiar el modal de tipo de licencia
function LimpiarModalTipoDeLicencia() {
  // Limpia el formulario
  document.getElementById("IdTipoDeLicencia").value = "";
  const inputNombre = document.getElementById("NombreTipoDeLicencia");
  inputNombre.value = "";

  // Limpia los estilos de validación
  inputNombre.classList.remove("is-invalid");
  inputNombre.classList.remove("is-valid");

  // Limpia el mensaje de error
  const inputErrorNombre = document.getElementById("errorNombreTipoDeLicencia");
  inputErrorNombre.textContent = "";
  inputErrorNombre.style.display = "none";
}

// Función para validar el formulario de tipo de licencia
function ValidarFormularioTipoDeLicencia() {
  const inputNombre = document.getElementById("NombreTipoDeLicencia");
  const inputErrorNombre = document.getElementById("errorNombreTipoDeLicencia");
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
document.getElementById("NombreTipoDeLicencia").addEventListener("input", () => {
  const inputNombre = document.getElementById("NombreTipoDeLicencia");
  const errorNombre = document.getElementById("errorNombreTipoDeLicencia");
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

function MostrarErrorTipoDeLicenciaExistente(mensaje) {
  const errorTipoDeLicencia = document.getElementById("errorNombreTipoDeLicencia");
  const inputNombreTipoDeLicencia = document.getElementById("NombreTipoDeLicencia");

  errorTipoDeLicencia.textContent = mensaje;
  errorTipoDeLicencia.style.display = "block";
  inputNombreTipoDeLicencia.classList.add("is-invalid");
}

// Función para crear una tipo de licencia
async function CrearTipoDeLicencia() {
  if (!ValidarFormularioTipoDeLicencia()) return;

  const tipoDeLicencia = {
    nombre: document.getElementById("NombreTipoDeLicencia").value.trim(),
  };
  const res = await authFetch("TipoDeLicencias", {
    method: "POST",
    body: JSON.stringify(tipoDeLicencia),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        MostrarErrorTipoDeLicenciaExistente(response.mensaje);
      } else {
        CerrarPanelTipoDeLicencia();
        ObtenerTiposDeLicencias(); 
        // Mostrar alerta de éxito
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
      }
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}

// Función para editar una tipo de licencia
async function EditarTipoDeLicencia(id) {

  if (!ValidarFormularioTipoDeLicencia()) return;
  
  let tipoDeLicencia = {
    id: document.getElementById("IdTipoDeLicencia").value,
    nombre: document.getElementById("NombreTipoDeLicencia").value.trim(),
  };
  const res = await authFetch(`TipoDeLicencias/${id}`, {
    method: "PUT",
    body: JSON.stringify(tipoDeLicencia),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        MostrarErrorTipoDeLicenciaExistente(response.mensaje);
      } else {
        ObtenerTiposDeLicencias(); 
        // Mostrar alerta de éxito
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
      }
    })
     .catch((error) => {
      MostrarErrorCatch();
      });
}



// Función para eliminar una tipo de licencia
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

// Función para eliminar una tipo de licencia
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
      ObtenerTiposDeLicencias();
    } else {
      // Error controlado desde el backend
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

ObtenerTiposDeLicencias();