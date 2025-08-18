//INICIO PANEL FORMUALRIO//
//Función para abrir el formulario lateral
function abrirPanelEvaluaciones() {
  document.getElementById("panelEvaluaciones").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputFecha = document.getElementById("CalificacionEvaluacion");
    if (inputFecha) inputFecha.focus();
  }, 400);
}

//Funcion para cerrar el formulario lateral
function cerrarPanelEvaluaciones() {
  document.getElementById("panelEvaluaciones").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

    LimpiarModalEvaluacion();
}
//FIN PANEL FORMULARIO//


//Inicio Panel Criterios//
function abrirPanelCriterios() {
  document.getElementById("panelCriterios").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputTipoCriterio = document.getElementById("IdTipoCriterio");
    if (inputTipoCriterio) inputTipoCriterio.focus();
  }, 400);
}

$(document).on("click", ".crearCriterio", function () {
  const idEvaluacion = $(this).data("evaluacion-id");
  evaluacionIdSeleccionada = idEvaluacion; 
  abrirPanelCriterios();
});

//Funcion para cerrar el formulario lateral
function cerrarPanelCriterios() {
  document.getElementById("panelCriterios").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

    LimpiarModalEvaluacion();
}
//FIN PANEL CRITERIOS//

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


  document.getElementById('filtrarFechaSelect').addEventListener('change', function () {
    const mostrar = this.value === 'si';
    document.getElementById('fechasInputs').classList.toggle('d-none', !mostrar);

      // Opcional: limpiar valores al ocultar
      document.getElementById("FechaEvalBuscar").value = "";
  });

//Onchange de filtro
document.getElementById("EmpleadoIdBuscar").onchange = function () {
  ObtenerEvaluaciones();
}

document.getElementById("FechaEvalBuscar").onchange = function () {
  ObtenerEvaluaciones();
}

document.getElementById("CalificacionBuscar").onchange = function () {
  ObtenerEvaluaciones();
}

//Funcion para obtener las evaluaciones
async function ObtenerEvaluaciones() {
  let nombreEmpleado = document.getElementById("EmpleadoIdBuscar").value;
  let fechaInput = document.getElementById("FechaEvalBuscar").value;
  let calificacionEvaluacion = document.getElementById("CalificacionBuscar").value;
  let calificacion = calificacionEvaluacion !== "0" && calificacionEvaluacion !== "" ? calificacionEvaluacion: null;


  let filtro = {
    nombreEmpleado: nombreEmpleado,
    fecha: fechaInput ? fechaInput : null,
    calificacion : calificacion,
  }
  console.log(filtro);
    const res = await authFetch("Evaluaciones/Filtrar", {
      method: "POST",
      body: JSON.stringify(filtro),
    })
    .then(response => response.json())
    .then((data => {
        MostrarEvaluaciones(data);
        LimpiarModalEvaluacion();
        cerrarPanelEvaluaciones();
    }))
  
    .catch((error) => {
      MostrarErrorCatch();
    });

}


function MostrarEvaluaciones(data) {
  if (window.innerWidth <= 764) {
    MostrarEvaluacionesMobile(data);
  } else {
    MostrarEvaluacionesDesktop(data);
  }
}

function MostrarEvaluacionesDesktop(data) {
  const contenedor = $("#contenedorEvaluaciones");
  contenedor.empty();

  if (data.length === 0) {
    contenedor.append(
      "<div class='text-center text-muted py-3'>No hay evaluaciones para mostrar.</div>"
    );
    return;
  }

  if(Array.isArray(data)){
  data.forEach(element => {
    const nota = Number(element.calificacion);
    const fecha = element.fecha.split("T")[0].split("-").reverse().join("/") || "Sin fecha";;

    let etiqueta = "Regular";
    let badgeClass = "badge-regular";

    if (nota >= 9) {
      etiqueta = "Excelente";
      badgeClass = "badge-excelente";
    } else if (nota >= 7) {
      etiqueta = "Muy Buena";
      badgeClass = "badge-muybuena";
    } else if (nota >= 5) {
      etiqueta = "Buena";
      badgeClass = "badge-buena";
    }

    const item = $(`
      <div class="evaluacion-item border rounded py-2 px-3 mb-2 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center" style="gap: 20px;">
        <button class="btn-editar me-1" style="background: none; border: none;  data-action="edit" onclick="MostrarModalEditar(${element.id})" data-tippy-content="Editar">
          <i class="bi bi-pencil-square icono-editar"></i>
        </button>

        <div class="d-flex flex-column" style="margin-right: 20px; min-width: 180px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <div class="fw-bold" title="${element.empleadoNombre || 'Sin nombre'}">
            ${element.empleadoNombre || 'Sin nombre'}
          </div>
          <div class="text-muted" style="opacity: 0.6;" title="${element.empleadoPuesto || 'Sin puesto'}">
            ${element.empleadoPuesto || 'Sin puesto'}
          </div>
        </div>
        </div>
        <div class=" d-flex align-items-center text-muted text-center" style="opacity: 0.6; min-width: 200px; flex-shrink: 0;">
          <span style="margin-right: 5px;">&bull;</span>
          Fue evaluado el ${fecha}
        </div>
        <div class="d-flex align-items-center" style="min-width: 220px; justify-content: flex-end; gap: 10px;">
          <div class="d-flex align-items-center" style="margin-right: 20px;">
            <div class="text-dark fw-bold" style="margin-right: 10px;">${nota}/10</div>
            <div class="badge-pill ${badgeClass}" style="padding: 4px 12px;">${etiqueta}</div>
          </div>
          <button class="toggle-detalle" style="background: none; border: none; font-weight: bold;" aria-expanded="false" aria-label="Mostrar detalles" data-tippy-content="Detalle">
            <i class="bi bi-chevron-down"></i>
          </button>
        </div>
      </div>
    `);

    const detalleHTML = $(`
      <div class="panelCriterios collapse px-3 pb-2" style="display: none;">
        <div class="mb-3">
          <h3 class="titulo-sub-seccion">Criterios de Evaluación</h3>
        </div>
        <hr style="margin-bottom: 1rem;"/>
        <div class="criterios-panel mt-3">
          <button class="btn btn-agregar-criterio mb-2 crearCriterio" data-evaluacion-id="${element.id}"> 
            <span>Agregar Criterio</span>
          </button>
          <div class="table-responsive">
            <table class="table table-bordered table-hover">
            <colgroup>
              <col style="width: 25%" />
              <col style="width: 65%" />
              <col  style="width: 10%" />
            </colgroup>
              <thead>
                <tr>
                  <th class="text-start header-table">Criterio</th>
                  <th class="text-start header-table">Descripción</th>
                  <th class="text-center header-table">Acciones</th>
                  </tr>
              </thead>
              <tbody class="tabla-criterios-body" data-evaluacion-id="${element.id}">
                <!-- Se insertan dinámicamente -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `);

item.find(".toggle-detalle").on("click", function () {
  const iconoChevron = $(this).find("i");
  const panel = detalleHTML;
  $(".panelCriterios.mostrar").not(panel).slideUp(200).removeClass("mostrar");
  $(".toggle-detalle i").not(iconoChevron)
    .removeClass("bi-chevron-up")
    .addClass("bi-chevron-down");

  panel.slideToggle(200, function () {
    panel.toggleClass("mostrar", panel.is(":visible"));
  });
  iconoChevron.toggleClass("bi-chevron-down bi-chevron-up");
});


 
    contenedor.append(item);
    contenedor.append(detalleHTML);
    ObtenerCriterioDeEvaluacion(element.id);
  });
}
  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

function MostrarEvaluacionesMobile(data) {
  const contenedor = document.getElementById("contenedorEvaluaciones");
  contenedor.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    contenedor.innerHTML =
      "<div class='text-center text-muted py-3'>No hay evaluaciones para mostrar.</div>";
    return;
  }
  data.forEach((element, item) => {
    const nota = Number(element.calificacion);
    const fecha = element.fecha.split("T")[0].split("-").reverse().join("/") || "Sin fecha";
    let etiqueta = "Regular";
    let badgeClass = "badge-regular";

    if (nota >= 9) {
      etiqueta = "Excelente";
      badgeClass = "badge-excelente";
    } else if (nota >= 7) {
      etiqueta = "Muy Buena";
      badgeClass = "badge-muybuena";
    } else if (nota >= 5) {
      etiqueta = "Buena";
      badgeClass = "badge-buena";
    }

    contenedor.innerHTML += `
      <div class="col-12 col-md-6 p-2 col-lg-4 col-xl-3 d-flex">
        <div class="card shadow-sm p-2 rounded-3 d-flex flex-column w-100" style="min-height: 180px;">
          <div class="flex-grow-1 d-flex flex-column">
            <h5 class="text-start fw-bold mb-2" style="font-size: 1.2rem;">
              ${element.empleadoNombre || "Sin nombre"}
            </h5>
            <p class="mb-2 my-2 text-muted d-flex align-items-center" style="font-size: 0.9rem;">
              <i class="bi bi-briefcase me-2"></i>
              ${element.empleadoPuesto || "Sin puesto"}
            </p>
            <small class="text-muted mb-2" style="font-size: 0.75rem;">
              ${fecha || "Fecha no disponible"}
            </small>
            <span class="badge ${badgeClass} my-2" style="width: fit-content; font-size: 1rem;">
              ${etiqueta}
            </span>
          </div>
          
        <div class="d-flex justify-content-between mt-2 align-items-center">
          <!-- Siempre mostrar historial, ver más y editar -->
          <div>
          <button class="btn-ver" onclick="MostrarDetalleCriterios(${element.id})" data-tippy-content="Detalle" style="background: none; border: none;">
            <i class="bi bi-info-circle iocno-ver-horario btn-sm"></i>
          </button>
          </div>
          <div>
            <button class="btn-ver" style="background: none; border: none; cursor: pointer;" onclick="MostrarModalEditar(${
              element.id
            })" data-tippy-content="Editar" style="background: none; border: none;">
              <i class="bi bi-pencil-square icono-editar-horario btn-sm"></i>
            </button>
            <button class="toggle-detalle" style="background: none; border: none; font-weight: bold;" aria-expanded="false" aria-label="Mostrar detalles" data-tippy-content="Detalle">
              <i class="bi bi-chevron-down"></i>
            </button>
          </div>
        </div>


        <div class="panelCriterios mt-2" style="display:none;">
          <div class="d-flex justify-content-end mb-2">
            <button class="btn btn-agregar-criterio mb-2 crearCriterio" data-evaluacion-id="${ element.id}"> 
            <span>Agregar Criterio</span>
            </button>
          </div>
          <div class="table-responsive">
            <table class="table table-bordered table-hover table-sm align-middle">
              <colgroup>
                <col style="width: 70%" /> 
                <col style="width: 30%" /> 
              </colgroup>
              <thead>
                <tr>
                  <th class="text-start header-table">Criterio</th>
                  <th class="text-center header-table">Acciones</th>
                </tr>
              </thead>
              <tbody class="tabla-criterios-body" data-evaluacion-id="${element.id}">
              </tbody>
            </table>
          </div>
        </div>

    `;

      ObtenerCriterioDeEvaluacion(element.id);
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });

  // Mostrar/ocultar tabla
  document.querySelectorAll(".toggle-detalle").forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = this.closest(".card");
      const detalleTabla = card.querySelector(".panelCriterios");
      const icono = this.querySelector("i");

      if (detalleTabla.style.display === "none") {
        detalleTabla.style.display = "block";
        icono.classList.replace("bi-chevron-down", "bi-chevron-up");
      } else {
        detalleTabla.style.display = "none";
        icono.classList.replace("bi-chevron-up", "bi-chevron-down");
      }
    });
  });
}

// Funcion para mostrar el modal de edición de la evaluación   
async function MostrarModalEditar(id) {
  const res = await authFetch(`Evaluaciones/${id}`,
    {
        method: "GET"
    })
    .then(response => response.json())
    .then((data => {
        document.getElementById("IdEvaluacion").value = data.id;
        document.getElementById("CalificacionEvaluacion").value = data.calificacion;
        document.getElementById("EmpleadoId").value = data.empleadoId;

        abrirPanelEvaluaciones();
    }))
}

//Funcion para buscar el id de la evaluacion y llamar a la función de edición o creación
function BuscarEvaluacionId() {
  const id = parseInt(document.getElementById("IdEvaluacion").value);

  if (!id || id === 0) {
    CrearEvaluacion();
  } else {
    EditarEvaluacion(id);
  }
}

//Funcion para limpiar el formulario de evaluacion
function LimpiarModalEvaluacion() {
    //Limpiar el formulario
    document.getElementById("IdEvaluacion").value = "";
    const inputCalificacion = document.getElementById("CalificacionEvaluacion");
    inputCalificacion.value = "";
    const inputEmpleado = document.getElementById("EmpleadoId");
    inputEmpleado.value = "";
    const selectTipoCriterio = document.getElementById("IdTipoCriterio");
    selectTipoCriterio.value = "";
    const inputDescripcion = document.getElementById("Descripcion");
    inputDescripcion.value = "";

    //Limpia las validaciones
    inputCalificacion.classList.remove("is-invalid", "is-valid");
    inputEmpleado.classList.remove("is-invalid", "is-valid");
    selectTipoCriterio.classList.remove("is-invalid", "is-valid");
    inputDescripcion.classList.remove("is-invalid", "is-valid");

    //Limpiar los mensajes de error
    const inputErrorCalificacion = document.getElementById("errorCalificacionEvaluacion");
    inputErrorCalificacion.textContent = "";
    inputErrorCalificacion.style.display = "none";
    const inputErrorEmpleado = document.getElementById("errorEmpleadoId");
    inputErrorEmpleado.textContent = "";
    inputErrorEmpleado.style.display = "none";
    const selectErrorIdTipoCriterio = document.getElementById("errorIdTipoCriterio");
    selectErrorIdTipoCriterio.textContent = "";
    selectErrorIdTipoCriterio.style.display = "none";
    const inputErrorDescripcion = document.getElementById("errorDescripcion");
    inputErrorDescripcion.textContent = "";
    inputErrorDescripcion.style.display = "none";
}

//Funcion para validar el formulario de evaluacion
function ValidarFormularioEvaluacion() {
    const inputCalificacion = document.getElementById("CalificacionEvaluacion");
    const inputErrorCalificacion = document.getElementById("errorCalificacionEvaluacion");

    const inputEmpleado = document.getElementById("EmpleadoId");
    const inputErrorEmpleado = document.getElementById("errorEmpleadoId");

    const calificacion = parseFloat(inputCalificacion.value);
    const empleadoId = inputEmpleado.value.trim();

    //Limpiar errores previos
    inputErrorCalificacion.style.display = "none";
    inputErrorCalificacion.textContent = "";
    inputCalificacion.classList.remove("is-invalid", "is-valid");
    inputErrorEmpleado.style.display = "none";
    inputErrorEmpleado.textContent = "";
    inputEmpleado.classList.remove("is-invalid", "is-valid");
  
    let esValid = true;

    if(isNaN(calificacion)){
        inputCalificacion.classList.add("is-invalid");
        inputErrorCalificacion.style.display = "block";
        inputErrorCalificacion.textContent = "Campo obligatorio.";
        esValid = false;
    } else if(calificacion < 0 || calificacion > 10){
        inputCalificacion.classList.add("is-invalid");
        inputErrorCalificacion.style.display = "block";
        inputErrorCalificacion.textContent = "Calificación debe estar entre 0 y 10.";
        esValid = false;
    }else {
        inputCalificacion.classList.add("is-valid");
    }

    if(empleadoId === ""){
        inputEmpleado.classList.add("is-invalid");
        inputErrorEmpleado.style.display = "block";
        inputErrorEmpleado.textContent = "Seleccione un empleado.";
        esValid = false;
    }
    return esValid;
}

// Validación en vivo: cambia el color mientras el usuario escribe
document.getElementById("CalificacionEvaluacion").addEventListener("input", () => {
    const inputCalificacion = document.getElementById("CalificacionEvaluacion");
    const errorCalificacion = document.getElementById("errorCalificacionEvaluacion");
    const calificacion = parseFloat(inputCalificacion.value);

  // Limpiar cualquier estado previo
  inputCalificacion.classList.remove("is-invalid", "is-valid");

      let esValid = true;

    if(isNaN(calificacion)){
        inputCalificacion.classList.add("is-invalid");
        errorCalificacion.style.display = "block";
        errorCalificacion.textContent = "Campo obligatorio.";
        esValid = false;
    } else if(calificacion < 0 || calificacion > 10){
        inputCalificacion.classList.add("is-invalid");
        errorCalificacion.style.display = "block";
        errorCalificacion.textContent = "Calificación debe estar entre 0 y 10.";
        esValid = false;
    } else {
    inputCalificacion.classList.add("is-valid"); // Color verde cuando cumple
    errorCalificacion.style.display = "none";
  };
  return esValid;
});
document.getElementById("EmpleadoId").addEventListener("change", () => {
    const input  = document.getElementById("EmpleadoId");
    const error = document.getElementById("errorEmpleadoId");
    const valor = input.value.trim();

  // Limpiar cualquier estado previo
  input.classList.remove("is-invalid", "is-valid");

    let esValid = true;

    if(valor === "0"){
        input.classList.add("is-invalid");
        error.style.display = "block";
        error.textContent = "Seleccione un empleado.";
        esValid = false;
    } else {
    input.classList.add("is-valid"); // Color verde cuando cumple
    error.style.display = "none";
  };
  return esValid;
  });


//Funcion para evitar que se pueda evaluar el mismo empleado en el mismo mes
function ValidarEvaluacionExistente(mensaje) {
  const errorEmpleado = document.getElementById("errorEmpleadoId");
  const inputEmpleadoId = document.getElementById("EmpleadoId");

  errorEmpleado.textContent = mensaje;
  errorEmpleado.style.display = "block";
  inputEmpleadoId.classList.add("is-invalid");
}

//Funcion crear evaluacion
async function CrearEvaluacion() {

    if(!ValidarFormularioEvaluacion())
        return;

const evaluacion = {
  calificacion: document.getElementById("CalificacionEvaluacion").value,
  empleadoId: document.getElementById("EmpleadoId").value,
};
    const res = await authFetch("Evaluaciones", {
      method: 'POST',
      body: JSON.stringify(evaluacion),
    })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        ValidarEvaluacionExistente(response.mensaje);
      } else {
        cerrarPanelEvaluaciones();
        ObtenerEvaluaciones();
        // Mostrar alerta de éxito
        Swal.fire({
          title: "¡Evaluacion Creada!",
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

//Funcion para editar una evaluacion
async function EditarEvaluacion(id) {

    if(!ValidarFormularioEvaluacion())
        return;

    const evaluacion = {
    id: document.getElementById("IdEvaluacion").value,
    calificacion: document.getElementById("CalificacionEvaluacion").value,
    empleadoId: document.getElementById("EmpleadoId").value,
    };
    const res =  await authFetch(`Evaluaciones/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(evaluacion),
    })
    .then((response) => response.text())
    .then((response) => {
      if (response.mensaje) {
        ValidarEvaluacionExistente(response.mensaje);
      } else {
        cerrarPanelEvaluaciones();
        ObtenerEvaluaciones();
        // Mostrar alerta de éxito
         Swal.fire({
          title: "¡Evaluacion Modificada!",
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

ObtenerEvaluaciones();




//FUNCIONES CRITERIOS DE EVALUACION
async function ObtenerCriterioDeEvaluacion(evaluacionId) {
  const res = await authFetch("CriteriosDeEvaluacion", {
    method: "GET",
  })
    .then(response => response.json())
    .then(data => {
      // Filtrar criterios por evaluación
      const criteriosFiltrados = data.filter(c => c.evaluacionId === evaluacionId);
      MostrarCriterioDeEvaluacion(evaluacionId, criteriosFiltrados);
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}

function MostrarCriterioDeEvaluacion(evaluacionId, data) {
  const tablaBody = $(`.tabla-criterios-body[data-evaluacion-id="${evaluacionId}"]`);
  if (!tablaBody.length) return;

  tablaBody.empty();

  if (data.length === 0) {
    tablaBody.append(
      "<tr><td colspan='3' class='text-center text-muted'>No hay criterios de evaluación para mostrar.</td></tr>"
    );
    return;
  }

  const enMovil = window.innerWidth <= 764;

  $.each(data, function (index, item) {
    if (enMovil) {
    tablaBody.append(`
      <tr>
        <td class='align-middle'>${item.tipoDeCriterio.nombre}</td>
        <td class='d-flex justify-content-center align-items-center'>
          <button class='btn-eliminar' style='background: none; border: none;' 
            onclick='EliminarCriterioDeEvaluacion(${item.id})' data-tippy-content='Eliminar'>
            <i class='bi bi-trash3 icono-elimina-detalle'></i>
          </button>
        </td>
      </tr>
    `);
    } else {
      tablaBody.append(`
        <tr>
          <td class='align-middle'>${item.tipoDeCriterio.nombre}</td>
          <td class='align-middle'>${item.descripcion}</td>
          <td class='d-flex justify-content-center align-items-center'>
            <button class='btn-eliminar' style='background: none; border: none;' 
              onclick='EliminarCriterioDeEvaluacion(${item.id})' data-tippy-content='Eliminar'>
              <i class='bi bi-trash3 icono-elimina-detalle'></i>
            </button>
          </td>
        </tr>
      `);
    }
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });

}

async function MostrarDetalleCriterios(evaluacionId) {
  const contenedor = document.getElementById("contenedorCriteriosOffcanvas");

   const res = await authFetch("CriteriosDeEvaluacion", {
    method: "GET",
    })
    .then(response => response.json())
    .then(data => {
      const criteriosFiltrados = data.filter(c => c.evaluacionId === evaluacionId);

      contenedor.innerHTML = "";

      if (criteriosFiltrados.length === 0) {
        contenedor.innerHTML = "<div class='text-center text-muted'>No hay criterios para mostrar.</div>";
        return;
      }

      criteriosFiltrados.forEach(item => {
        const card = `
          <div class="card mb-3 detalle-criterio-tarjeta">
            <div class="card-body detalle-criterio-seccion">
              <p class="detalle-criterio-titulo-seccion">
                Información del Criterio
              </p>

              <div class="detalle-criterio-fila">
                <span class="detalle-criterio-valor-nombre"> ${item.tipoDeCriterio.nombre}</span>
              </div>

              <div class="detalle-criterio-fila">
                <span class="detalle-criterio-valor">${item.descripcion || "Sin descripción"}</span>
              </div>

              <hr style="margin: 0.5rem 0;" />

              <div style="display: flex; justify-content: center; align-items: center;">
                <button class="btn-eliminar" onclick="EliminarCriterioDeEvaluacion(${item.id})" data-tippy-content="Eliminar" style="background: none; border: none;">
                  <i class="bi bi-trash icono-borrar-horario btn-sm"></i>
                </button>
              </div>
            </div>
          </div>
        `;
        contenedor.innerHTML += card;
      });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
    })
  // Mostrar el offcanvas
  const offcanvasElement = document.getElementById("offcanvasDetalleCriterios");
  if (offcanvasElement.parentNode !== document.body) {
    document.body.appendChild(offcanvasElement);
  }
  let offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
  if (!offcanvas) offcanvas = new bootstrap.Offcanvas(offcanvasElement);
  offcanvas.show();
}

function BuscarCriterioId() {
  const id = parseInt(document.getElementById("IdCriterio").value);

  if (!id || id === 0) {
    CrearCriterioDeEvaluacion();
  } else {
    EditarCriterioDeEvaluacion(id);
  }
}

function ValidarFormularioCriterioDeEvaluacion() {
    const selectTipoCriterio = document.getElementById("IdTipoCriterio");
    const selectErrorIdTipoCriterio = document.getElementById("errorIdTipoCriterio");

    const inputDescripcion = document.getElementById("Descripcion");
    const inputErrorDescripcion = document.getElementById("errorDescripcion");

    const tipoDeCriterioId = selectTipoCriterio.value;
    const descripcion = inputDescripcion.value.trim();

    //Limpiar errores previos
    selectErrorIdTipoCriterio.style.display = "none";
    selectErrorIdTipoCriterio.textContent = "";
    selectTipoCriterio.classList.remove("is-invalid", "is-valid");
    inputErrorDescripcion.style.display = "none";
    inputErrorDescripcion.textContent = "";
    inputDescripcion.classList.remove("is-invalid", "is-valid");

    let esValid = true;

    if(tipoDeCriterioId === ""){
        selectTipoCriterio.classList.add("is-invalid");
        selectErrorIdTipoCriterio.style.display = "block";
        selectErrorIdTipoCriterio.textContent = "Seleccione un criterio.";
        esValid = false;
    }

    // Validar descripcion
    if (descripcion.length === 0) {
      inputDescripcion.classList.add("is-invalid");
      inputErrorDescripcion.style.display = "block";
      inputErrorDescripcion.textContent = "Campo obligatorio.";
      esValid = false;
    } else if (descripcion.length < 3) {
      inputDescripcion.classList.add("is-invalid");
      inputErrorDescripcion.style.display = "block";
      inputErrorDescripcion.textContent = "Mínimo 3 caracteres.";
      esValid = false;
    } else {
      inputDescripcion.classList.add("is-valid");
    }
    return esValid;
}
document.getElementById("Descripcion").addEventListener("input", () => {
    const inputDescripcion = document.getElementById("Descripcion");
    const errorDescripcion = document.getElementById("errorDescripcion");
    const descripcion = inputDescripcion.value;

    // Limpiar cualquier estado previo
    inputDescripcion.classList.remove("is-invalid", "is-valid");

    let esValid = true;

    if(descripcion.length === 0){
      inputDescripcion.classList.add("is-invalid");
      errorDescripcion.style.display = "block";
      errorDescripcion.textContent = "Campo obligatorio.";
      esValid = false;
    }
    else if(descripcion.length < 3){
      inputDescripcion.classList.add("is-invalid");
      errorDescripcion.style.display = "block";
      errorDescripcion.textContent = "Mínimo 3 caracteres.";
      esValid = false;
    } else {
      inputDescripcion.classList.add("is-valid");
      errorDescripcion.style.display = "none";
      errorDescripcion.textContent = "";
    }
    return esValid;
});



//Funcion para validar criterios de evaluacion existente 
function ValidarCriterioDeEvaluacionExistente(mensaje) {
    const errorCriterio = document.getElementById("errorIdTipoCriterio");
    const inputCriterio = document.getElementById("IdTipoCriterio");

    errorCriterio.textContent = mensaje;
    errorCriterio.style.display = "block";
    inputCriterio.classList.add("is-invalid");
}

async function CrearCriterioDeEvaluacion() {
    if(!ValidarFormularioCriterioDeEvaluacion())
        return;

const criterioEvaluacion = {
  tipoDeCriterioId: document.getElementById("IdTipoCriterio").value,
  descripcion: document.getElementById("Descripcion").value,
  evaluacionId: evaluacionIdSeleccionada,
};
    const res = await authFetch("CriteriosDeEvaluacion", {
      method: 'POST',
      body: JSON.stringify(criterioEvaluacion),
    })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        ValidarCriterioDeEvaluacionExistente(response.mensaje);
      } else {
        cerrarPanelCriterios();
        ObtenerCriterioDeEvaluacion(evaluacionIdSeleccionada);        
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
      }
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}

function EliminarCriterioDeEvaluacion(id) {
    Swal.fire({
    title: "¿Desea eliminar este criterio?",
    html: `
      <div class="text-center">
        <p>Este criterio será eliminado de forma definitiva. ¿Desea continuar?</p>
        <p>Esta acción no se puede deshacer.</p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    focusCancel: true,
    customClass: {
      popup: "swal2-border-radius",
      confirmButton: "swal2-btn-eliminar",
      cancelButton: "swal2-btn-cancelar",
      title: "swal2-title-custom",
      content: "swal2-content-custom",
    },
    background: "#fff",
    color: "#22223b",
  })
    .then((result) => {
      if(result.isConfirmed) {
            EliminarSiCriterio(id);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
           Swal.fire({
        title: "Acción Cancelada",
        text: "Permanece registrado.",
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
      })
}

async function EliminarSiCriterio(id) {
    const res = await authFetch(`CriteriosDeEvaluacion/${id}`, {
      method: "DELETE",
    })

    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudo eliminar el criterio");
      }
      return response.text();
    })
    .then((data) => {
         Swal.fire({
        title: "¡Criterio Eliminado!",
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
    ObtenerCriterioDeEvaluacion(evaluacionIdSeleccionada);

    })
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


//Funcion para obtener los criterios de evaluacion de una evaluacion
ObtenerCriterioDeEvaluacion(evaluacionIdSeleccionada);

