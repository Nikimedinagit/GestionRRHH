// Función para abrir el formulario lateral
function AbrirPanelPuesto() {
  document.getElementById("panelPuesto").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombrePuesto");
    if(inputNombre) inputNombre.focus();
  }, 400);
}

  //Funcion para cerrar el formulario lateral
  function CerrarPanelPuesto() {
    document.getElementById("panelPuesto").classList.remove("abierto");
    const fondo = document.getElementById("fondoOscuro");
    fondo.classList.remove("visible");

    LimpiarModalPuesto();

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

//ONCHANGE DE FILTROS//
$(document).ready(function () {
  ObtenerPuestos();

  $("#EstadoIdBuscar, #SectorIdBuscar").on("change", function () {
    ObtenerPuestos();
  });
});
//FIN ONCHANGE DE FILTROS//



async function ComboParaFiltrarSectores() {
    const res = await authFetch("Sector", {
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


// Obtener Puestos
async function ObtenerPuestos() {
    let estadoId = document.getElementById("EstadoIdBuscar").value;
    let sectorId = document.getElementById("SectorIdBuscar").value;

    let filtro = {
        eliminado: estadoId !== "" ? parseInt(estadoId) : null,
        sectorId: sectorId !== "" ? parseInt(sectorId) : null,
    };

    const res = await authFetch("Puestos/Filtrar", {
        method: 'POST',
        body: JSON.stringify(filtro)
    })
    .then(response => response.json())
    .then(data => {
        MostrarPuestos(data)
        LimpiarModalPuesto();
        CerrarPanelPuesto();
      })
    .catch(error => console.log('No se pudo obtener las puestos', error)); 
}


// Funcion Para Mostrar Las Puestos
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
    let iconColor = item.eliminado ? "text-success" : "text-danger";

    $("#tablaPuestosBody").append(
      "<tr>" +
        // Columna Activo (toggle)
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
        // columna Puesto (nombre)
       "<td class='align-middle " + filaClass + " puesto-truncado'>" + item.descripcion + "</td>" +

        // Columna Sector (nombre)
        "<td class='align-middle d-none d-md-table-cell" +
        filaClass +
        "'>" +
        (item.sectorString || "Sin sector") +
        "</td>" +
        // Columna Acciones (editar)
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

  // Inicializar tooltips de Tippy
  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

function toggleDetalle(id) {
    const fila = document.getElementById(`detalle-${id}`);
    fila.style.display = fila.style.display === 'none' ? 'table-row' : 'none';
}



// Funcion para mostar el modal de edición de la puesto
async function MostrarModalEditarPuesto(id) {

    const res = await authFetch(`Puestos/${id}`);
    const puesto = await res.json();

    document.getElementById("IdPuesto").value = puesto.id;
    document.getElementById("NombrePuesto").value = puesto.descripcion;
    document.getElementById("IdSector").value = puesto.sectorId;

    AbrirPanelPuesto(); 
}   


// Funcion para buscar el id de la puesto y llamar a la función de edición o creación
function BuscarPuestosId() { 
    
    const id = parseInt(document.getElementById("IdPuesto").value); 


    //Si el id no existe o es 0, entonces es una nueva puesto y llamamos a la función para crear
    if (!id || id === 0) {
        CrearPuesto();
    } else {
        EditarPuesto(id);
    }
}


// Funcion para limpiar el formulario de la puesto
function LimpiarModalPuesto() {
  // Limpia el formulario
  document.getElementById('IdPuesto').value = '';
  const inputNombre = document.getElementById('NombrePuesto');
  inputNombre.value = '';

  const inputIdSector = document.getElementById('IdSector');
  inputIdSector.value = '';


  // Limpia los estilos de validación
  inputNombre.classList.remove('is-invalid');
  inputNombre.classList.remove('is-valid');
  inputIdSector.classList.remove('is-invalid');
  inputIdSector.classList.remove('is-valid');

  // Limpia el mensaje de error
  const inputErrorNombre = document.getElementById('errorNombrePuesto');
  inputErrorNombre.textContent = '';
  inputErrorNombre.style.display = 'none';

  const inputErrorIdSector = document.getElementById('errorIdSector');
  inputErrorIdSector.textContent = '';   
  inputErrorIdSector.style.display = 'none';
}   


// Función para validar el formulario de puesto
function ValidarFormularioPuesto() {
    const inputNombre = document.getElementById("NombrePuesto");
    const inputErrorNombre = document.getElementById("errorNombrePuesto");
    const selectSector = document.getElementById("IdSector");
    const inputErrorSector = document.getElementById("errorIdSector");
    const nombre = inputNombre.value.trim();
    const sectorSeleccionada = selectSector.value;

    // Limpiar errores previos
    inputErrorNombre.style.display = 'none';
    inputErrorNombre.textContent = '';
    inputNombre.classList.remove("is-invalid", "is-valid");

    inputErrorSector.style.display = 'none';
    inputErrorSector.textContent = '';
    selectSector.classList.remove("is-invalid", "is-valid");

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
        inputErrorNombre.style.display = "none";
        inputErrorNombre.textContent = "";
    }

    // Validar sector
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



// 🎨 Validación en vivo: cambia el color mientras el usuario escribe
document.getElementById("NombrePuesto").addEventListener("input", () => {
    const inputNombre = document.getElementById("NombrePuesto");
    const errorNombre = document.getElementById("errorNombrePuesto");
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
        inputNombre.classList.add("is-valid"); // Aplica color verde cuando es válido
        errorNombre.style.display = "none";
    }
});


function MostrarErrorPuestoExistente(mensaje) {
    const errorPuesto = document.getElementById("errorNombrePuesto");
    const inputNombrePuesto = document.getElementById("NombrePuesto");

    errorPuesto.textContent = mensaje;
    errorPuesto.style.display = "block";
    inputNombrePuesto.classList.add("is-invalid");
}


// Función para crear una puesto
async function CrearPuesto() {

    if (!ValidarFormularioPuesto()) return;

    const puesto = {
        descripcion: document.getElementById('NombrePuesto').value.trim(),
        sectorId: document.getElementById('IdSector').value
    }
    const res = await authFetch("Puestos", {
            method: 'POST', 
            body: JSON.stringify(puesto)
        })
    .then(response => response.json())
    .then(response => {

        if (response.mensaje){
            MostrarErrorPuestoExistente(response.mensaje);
        } else {
            CerrarPanelPuesto();
            ObtenerPuestos();
            // Mostrar alerta de éxito
        Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: '¡Puesto Creado!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#f0f0f0',
        color: '#000',
        });
        }

      
   

    
    })
} 


// Funcion para editar una puesto
async function EditarPuesto(id) {
    if (!ValidarFormularioPuesto()) return;

    let puestoId = document.getElementById("IdPuesto").value;

    let puesto = {
        id: puestoId,
        descripcion: document.getElementById("NombrePuesto").value.trim(),
        sectorId: document.getElementById("IdSector").value
    }
        const res = await authFetch(`Puestos/${id}`, {
            method: 'PUT', 
            body: JSON.stringify(puesto)
        })
    .then(response => response.json())
    .then(response => {
        if (response.mensaje){
            MostrarErrorPuestoExistente(response.mensaje);
        } else {
            ObtenerPuestos();
            // Mostrar alerta de éxito
        Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: '¡Puesto Modificado!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#f0f0f0',
        color: '#000',
        });
        }
    })
} 


// Función para eliminar una puesto
function EliminarPuestoId(id, eliminado) {
  Swal.fire({
    title: eliminado ? "¿Reactivar puesto?" : "¿Desactivar puesto?",
    text: eliminado
      ? "Se reactivará este puesto en el sistema."
      : "Este puesto se desactivará y no estará disponible.",
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
      EliminarSiPuesto(id);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Acción cancelada",
        text: eliminado
          ? "La puesto sigue desactivado."
          : "La puesto sigue activo.",
        icon: "info",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "bottom-end",
      });
    }
  });
}

// Función para eliminar una puesto
async function EliminarSiPuesto(id) {
    const res = await authFetch(`Puestos/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("No se pudo eliminar/reactivar la puesto");
        }
        return response.json();
    })
    .then((data) => {
        ObtenerPuestos();

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
        Swal.fire('Error', 'No se pudo actualizar la puesto.', 'error');
    });
}       



ComboParaFiltrarSectores();