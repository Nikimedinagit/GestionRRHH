// Función para abrir el formulario lateral
function AbrirPanelSector() {
  document.getElementById("panelSector").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreSector");
    if(inputNombre) inputNombre.focus();
  }, 400);
}

  //Funcion para cerrar el formulario lateral
  function CerrarPanelSector() {
    document.getElementById("panelSector").classList.remove("abierto");
    const fondo = document.getElementById("fondoOscuro");
    fondo.classList.remove("visible");

    LimpiarModalSector();

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
  ObtenerSectores();

  $("#EstadoIdBuscar").on("change", function () {
    ObtenerSectores();
  });
});
//FIN ONCHANGE DE FILTROS//


// Obtener Sectores
async function ObtenerSectores() {
    let estadoId = document.getElementById("EstadoIdBuscar").value;
    let filtro = {
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
    .catch(error => console.log('No se pudo obtener las sectores', error)); 
}


// Funcion Para Mostrar Las Sectores
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
    let iconColor = item.eliminado ? "text-success" : "text-danger";

    $("#tablaSectoresBody").append(
      "<tr>" +
        // Columna Activo (toggle)
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
        // Columna Provincia (nombre)
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

// Funcion para mostar el modal de edición de la sector
async function MostrarModalEditar(id) {

    const res = await authFetch(`Sector/${id}`);
    const sector = await res.json();

    document.getElementById('IdSector').value = sector.id;
    document.getElementById('NombreSector').value = sector.nombre;

    AbrirPanelSector(); 
}   


// Funcion para buscar el id de la sector y llamar a la función de edición o creación
function BuscarSectorId() { 
    
    const id = parseInt(document.getElementById("IdSector").value); 
    const nombre = document.getElementById("NombreSector").value.trim();
    //Si el id no existe o es 0, entonces es una nueva sector y llamamos a la función para crear
    if (!id || id === 0) {
        CrearSector();
    }
    else {
        EditarSector(id); 
    }
}


// Funcion para limpiar el formulario de la sector
function LimpiarModalSector() {
  // Limpia el formulario
  document.getElementById('IdSector').value = '';
  const inputNombre = document.getElementById('NombreSector');
  inputNombre.value = '';

  // Limpia los estilos de validación
  inputNombre.classList.remove('is-invalid');
  inputNombre.classList.remove('is-valid');

  // Limpia el mensaje de error
  const inputErrorNombre = document.getElementById('errorNombreSector');
  inputErrorNombre.textContent = '';
  inputErrorNombre.style.display = 'none';
}


// Función para validar el formulario de sector
function ValidarFormularioSector() {
    const inputNombre = document.getElementById("NombreSector");
    const inputErrorNombre = document.getElementById("errorNombreSector");
    const nombre = inputNombre.value.trim();

    // Limpiar errores previos
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

    inputNombre.classList.add("is-valid"); // Aplica color verde cuando es válido
    inputErrorNombre.style.display = "none";
    return true;
}

// 🎨 Validación en vivo: cambia el color mientras el usuario escribe
document.getElementById("NombreSector").addEventListener("input", () => {
    const inputNombre = document.getElementById("NombreSector");
    const errorNombre = document.getElementById("errorNombreSector");
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


function MostrarErrorSectorExistente(mensaje) {
    const errorSector = document.getElementById("errorNombreSector");
    const inputNombreSector = document.getElementById("NombreSector");

    errorSector.textContent = mensaje;
    errorSector.style.display = "block";
    inputNombreSector.classList.add("is-invalid");
}



// Funcion para crear una sector
async function CrearSector() {

    if (!ValidarFormularioSector()) return;

    const sector = {
        nombre: document.getElementById('NombreSector').value.trim(),
    }
    const res = await authFetch('Sector', {
        method: 'POST',
        body: JSON.stringify(sector)
    })
    .then((response) => response.json())
    .then(response => {

        if (response.mensaje){
            MostrarErrorSectorExistente(response.mensaje);
        } else {
            CerrarPanelSector();
            ObtenerSectores();
            // Mostrar alerta de éxito
        Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: '¡Sector Creado!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#f0f0f0',
        color: '#000',
        });
        }

      
   

    
    })
} 


// Funcion para editar una sector
function EditarSector(id) {

    if (!ValidarFormularioSector()) return;

    let sectorId = document.getElementById('IdSector').value;
    let sector = {
        id: sectorId,
        nombre: document.getElementById('NombreSector').value.trim()
    }
    const res = authFetch(`Sector/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sector)
    })
    .then(response => response.json())
    .then(response => {
        if (response.mensaje){
            MostrarErrorSectorExistente(response.mensaje);
        } else {
            ObtenerSectores();
            // Mostrar alerta de éxito
        Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: '¡Sector Modificado!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#f0f0f0',
        color: '#000',
        });
        }
    })
} 


// Función para eliminar una sector
function EliminarSectorId(id, eliminado) {
  Swal.fire({
    title: eliminado ? "¿Reactivar sector?" : "¿Desactivar sector?",
    text: eliminado
      ? "Se reactivará este sector en el sistema."
      : "Este sector se desactivará y no estará disponible.",
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
      EliminarSiSector(id);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Acción cancelada",
        text: eliminado
          ? "El sector sigue desactivado."
          : "El sector sigue activo.",
        icon: "info",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "bottom-end",
      });
    }
  });
}

// Función para eliminar una sector
async function EliminarSiSector(id) {
   const res = await authFetch(`Sector/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("No se pudo eliminar/reactivar la sector");
        }
        return response.json();
    })
    .then((data) => {
        ObtenerSectores();

        // Mostrar el mensaje que vino del backend
        Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'success',
            title: '¡' + data.mensaje + '!',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: '#f0f0f0',
            color: '#000',
        });
    })
    .catch(error => {
        console.error(error);
        Swal.fire('Error', 'No se pudo actualizar la sector.', 'error');
    });
}


ObtenerSectores();


