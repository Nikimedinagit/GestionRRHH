
////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA ABRIR EL PANEL DE EVALUACIONES //////////////////////////////////////////////////////// 
////////////////////////////////////////////////////////////////////////////////////////////////////////
function abrirPanelEvaluaciones() {
  document.getElementById("panelEvaluaciones").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputFecha = document.getElementById("CalificacionEvaluacion");
    if (inputFecha) inputFecha.focus();
  }, 400);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA CERRAR EL PANEL DE EVALUACIONES //////////////////////////////////////////////////////// 
////////////////////////////////////////////////////////////////////////////////////////////////////////
function cerrarPanelEvaluaciones() {
  document.getElementById("panelEvaluaciones").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalEvaluacion();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA ABRIR EL PANEL DE CRITERIOS //////////////////////////////////////////////////////// 
////////////////////////////////////////////////////////////////////////////////////////////////////////
function abrirPanelCriterios() {
  document.getElementById("panelCriterios").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputTipoCriterio = document.getElementById("IdTipoCriterio");
    if (inputTipoCriterio) inputTipoCriterio.focus();
  }, 400);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// AL HACER CLICK ABRIR PANEL CRITERIOS CON EL ID CORREPODNIENTE DE LA EVALUACION //////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).on("click", ".crearCriterio", function () {
  const idEvaluacion = $(this).data("evaluacion-id");
  evaluacionIdSeleccionada = idEvaluacion;
  abrirPanelCriterios();
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA CERRAR EL PANEL DE CRITERIOS //////////////////////////////////////////////////////// 
////////////////////////////////////////////////////////////////////////////////////////////////////////
function cerrarPanelCriterios() {
  document.getElementById("panelCriterios").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalEvaluacion();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR LOS ONCHANGE DE FILTROS ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
  ObtenerEvaluaciones();

  $("#EmpleadoIdBuscar").on("input", function () {
    ObtenerEvaluaciones();
  });

  $("#FechaEvalBuscar").on("input", function () {
    ObtenerEvaluaciones();
  });

  $("#CalificacionBuscar").on("input", function () {
    ObtenerEvaluaciones();
  });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
// OBTENER LOS DATOS DE LA EVALUACIONES ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerEvaluaciones() {

  let nombreEmpleado = document.getElementById("EmpleadoIdBuscar").value;
  let fechaInput = document.getElementById("FechaEvalBuscar").value;
  let calificacionEvaluacion = document.getElementById("CalificacionBuscar").value;
  let calificacion = calificacionEvaluacion !== "0" && calificacionEvaluacion !== "" ? calificacionEvaluacion : null;

  let filtro = {
    nombreEmpleado: nombreEmpleado,
    fecha: fechaInput ? fechaInput : null,
    calificacion: calificacion,
  }

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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS DATOS DE LA EVALUACIONES ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarEvaluaciones(data) {
  if (window.innerWidth <= 820) {
    MostrarEvaluacionesMobile(data);
  } else {
    MostrarEvaluacionesDesktop(data);
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS DATOS DE LA EVALUACIONES DESKTOP /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarEvaluacionesDesktop(data) {
  const contenedor = $("#contenedorEvaluaciones");
  contenedor.empty();

  const rol = getRol()?.toUpperCase();

  if (!Array.isArray(data) || data.length === 0) {
    contenedor.append("<div class='text-center text-muted py-3'>No hay evaluaciones para mostrar.</div>");
    return;
  }

  data.forEach(element => {
    const nota = Number(element.calificacion);
    const fecha = element.fecha
      ? element.fecha.split("T")[0].split("-").reverse().join("/")
      : "Sin fecha";

    let etiqueta = "REGULAR";
    let badgeClass = "badge-regular";

    if (nota >= 9) { etiqueta = "EXCELENTE"; badgeClass = "badge-excelente"; }
    else if (nota >= 7) { etiqueta = "MUY BUENA"; badgeClass = "badge-muybuena"; }
    else if (nota >= 5) { etiqueta = "BUENA"; badgeClass = "badge-buena"; }

    let claseBorde = "";
    switch (element.claseBorde) {
      case "green": claseBorde = "border-success"; break;
      case "yellow": claseBorde = "border-warning"; break;
      case "blue": claseBorde = "border-primary"; break;
      default: claseBorde = "";
    }

    const botonEditarHTML = element.esEditable
      ? `<button class="btn-editar me-1" style="background: none; border: none;" onclick="MostrarModalEditar(${element.id})" data-tippy-content="Editar">
           <i class="bi bi-pencil-square icono-editar"></i>
         </button>`
      : "";

    const nombreMostrar = (element.claseBorde === "green" || element.claseBorde === "yellow")
      ? element.empleadoNombre
      : element.usuarioNombreEvaluador;

    const rolMostrar = (element.claseBorde === "green" || element.claseBorde === "yellow")
      ? element.empleadoPuesto
      : element.usuarioRolEvaluador;


    const item = $(`
      <div class="evaluacion-item rounded py-2 px-3 mb-2 d-flex align-items-center justify-content-between"
           style="border-left: 3px solid ${element.claseBorde === "green" ? "#198754" : element.claseBorde === "yellow" ? "#ffc107" : element.claseBorde === "blue" ? "#0d6efd" : "#dee2e6"};">
        <div class="d-flex align-items-center" style="gap: 20px;">
          ${botonEditarHTML}
          <div class="d-flex flex-column" style="margin-right: 20px; min-width: 180px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <div class="fw-bold" title="${nombreMostrar}">${nombreMostrar}</div>
            <div class="text-muted" style="opacity: 0.6;" title="${rolMostrar}">${rolMostrar}</div>
          </div>
        </div>
        <div class="d-flex align-items-center text-muted text-center" style="opacity: 0.6; min-width: 200px; flex-shrink: 0;">
          <span style="margin-right: 5px;">&bull;</span>
          Fecha de evaluación: ${fecha}
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
      <div class="panelCriterios px-3 pb-2" style="display: none;">
        <div class="mb-3">
          <h3 class="titulo-sub-seccion">Criterios de Evaluación</h3>
        </div>
        <hr style="margin-bottom: 1rem;"/>
        <div class="criterios-panel mt-3">
          ${element.esEditable ? `<button class="btn btn-agregar-criterio mb-2 crearCriterio" data-evaluacion-id="${element.id}">Agregar Criterio</button>` : ""}
          <div class="table-responsive">
            <table class="table table-bordered table-hover align-middle w-100">
              <colgroup>
                <col style="width: 25%" />
                <col style="width: 65%" />
                 ${element.esEditable ? `<col style="width: 10%" />` : ""}
              </colgroup>
             <thead>
              <tr>
                <th class="text-start header-table">Criterio</th>
                <th class="text-start header-table">Descripción</th>
                ${element.esEditable ? `<th class="text-center header-table">Acciones</th>` : ""}
              </tr>
            </thead>
            <tbody class="tabla-criterios-body" data-evaluacion-id="${element.id}"></tbody>
            </table>
          </div>
        </div>
      </div>
    `);

    item.find(".toggle-detalle").on("click", function () {
      const iconoChevron = $(this).find("i");
      contenedor.find(".panelCriterios:visible").not(detalleHTML).slideUp(200).removeClass("mostrar");
      contenedor.find(".toggle-detalle i").not(iconoChevron).removeClass("bi-chevron-up").addClass("bi-chevron-down");
      contenedor.find(".toggle-detalle").attr("aria-expanded", "false");

      detalleHTML.stop(true, true).slideToggle(200, function () {
        detalleHTML.toggleClass("mostrar", detalleHTML.is(":visible"));
      });
      iconoChevron.toggleClass("bi-chevron-down bi-chevron-up");
      $(this).attr("aria-expanded", $(this).attr("aria-expanded") !== "true");
    });

    contenedor.append(item);
    contenedor.append(detalleHTML);
    ObtenerCriterioDeEvaluacion(element.id, element.esEditable);
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS DATOS DE LA EVALUACIONES MOBILE /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarEvaluacionesMobile(data) {
  const contenedor = document.getElementById("contenedorEvaluaciones");
  contenedor.innerHTML = "";

  const rol = getRol()?.toUpperCase();

  if (!Array.isArray(data) || data.length === 0) {
    contenedor.innerHTML =
      "<div class='text-center text-muted py-3'>No hay evaluaciones para mostrar.</div>";
    return;
  }

  data.forEach((element) => {
    const nota = Number(element.calificacion);
    const fecha = element.fecha
      ? element.fecha.split("T")[0].split("-").reverse().join("/")
      : "Sin fecha";

    // Etiquetas de calificación
    let etiqueta = "REGULAR";
    let badgeClass = "badge-regular";

    if (nota >= 9) { etiqueta = "EXCELENTE"; badgeClass = "badge-excelente"; }
    else if (nota >= 7) { etiqueta = "MUY BUENA"; badgeClass = "badge-muybuena"; }
    else if (nota >= 5) { etiqueta = "BUENA"; badgeClass = "badge-buena"; }

    // Clase de borde según color
    let bordeColor = "#dee2e6";
    switch(element.claseBorde) {
      case "green": bordeColor = "#198754"; break;  // propia
      case "yellow": bordeColor = "#ffc107"; break; // de otros
      case "blue": bordeColor = "#0d6efd"; break;   // destinada al usuario
    }

    const esEditable = element.esEditable === true || element.esEditable === "true";

    // Nombre y rol a mostrar según color
    const nombreMostrar = (element.claseBorde === "green" || element.claseBorde === "yellow")
      ? element.empleadoNombre    // verde o amarillo → mostrar empleado evaluado
      : element.usuarioNombreEvaluador; // azul → mostrar quien la realizó

    const rolMostrar = (element.claseBorde === "green" || element.claseBorde === "yellow")
      ? element.empleadoPuesto    // verde o amarillo → mostrar puesto del evaluado
      : element.usuarioRolEvaluador; // azul → mostrar rol de quien la realizó

    const botonEditarHTML = esEditable
      ? `<button class="btn-ver" style="background: none; border: none; cursor: pointer;" onclick="MostrarModalEditar(${element.id})" data-tippy-content="Editar">
           <i class="bi bi-pencil-square icono-editar-horario btn-sm"></i>
         </button>`
      : "";

    const botonAgregarCriterioHTML = esEditable
      ? `<div class="d-flex justify-content-center mb-2">
           <button class="btn btn-agregar-criterio mb-2 crearCriterio" data-evaluacion-id="${element.id}"> 
             <span>Agregar Criterio</span>
           </button>
         </div>`
      : "";

    contenedor.innerHTML += `
      <div class="col-12 col-md-6 p-2 col-lg-4 col-xl-3 d-flex">
        <div class="card shadow-sm p-2 rounded-3 d-flex flex-column w-100" style="min-height: 180px; border-left: 3px solid ${bordeColor};">
          <div class="flex-grow-1 d-flex flex-column">
            <h5 class="text-start fw-bold mb-2" style="font-size: 1.2rem;" title="${nombreMostrar}">
              ${nombreMostrar || "Sin nombre"}
            </h5>
            <p class="mb-2 my-2 text-muted d-flex align-items-center" style="font-size: 0.9rem;" title="${rolMostrar}">
              <i class="bi bi-briefcase me-2"></i>
              ${rolMostrar || "Sin puesto"}
            </p>
            <small class="text-muted mb-2" style="font-size: 0.75rem;">
              ${fecha}
            </small>
            <span class="badge ${badgeClass} my-2" style="width: fit-content; font-size: 1rem;">
              ${etiqueta}
            </span>
          </div>
          
          <div class="d-flex justify-content-between mt-2 align-items-center">
            <div>
              <button class="btn-ver" onclick="MostrarDetalleCriterios(${element.id}, ${esEditable})" data-tippy-content="Detalle" style="background: none; border: none;">
                <i class="bi bi-info-circle iocno-ver-horario btn-sm"></i>
              </button>
            </div>
            <div>
              ${botonEditarHTML}
              <button class="toggle-detalle" style="background: none; border: none; font-weight: bold;" aria-expanded="false" aria-label="Mostrar detalles" data-tippy-content="Detalle">
                <i class="bi bi-chevron-down"></i>
              </button>
            </div>
          </div>

          <div class="panelCriterios mt-2" style="display:none;">
            ${botonAgregarCriterioHTML}
            <div class="table-responsive">
              <table class="table table-bordered table-hover table-sm align-middle">
                <colgroup>
                  <col style="width: 70%" /> 
                  ${element.esEditable ? `<col style="width: 30%" />` : ""}
                </colgroup>
                <thead>
                  <tr>
                    <th class="text-start header-table">Criterio</th>
                    ${esEditable ? `<th class="text-center header-table">Acciones</th>` : ""}
                  </tr>
                </thead>
                <tbody class="tabla-criterios-body" data-evaluacion-id="${element.id}">
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    ObtenerCriterioDeEvaluacion(element.id, esEditable);
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });

  document.querySelectorAll(".toggle-detalle").forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = this.closest(".card");
      const detalleTabla = card.querySelector(".panelCriterios");
      const icono = this.querySelector("i");

      document.querySelectorAll(".panelCriterios").forEach((panel) => {
        if (panel !== detalleTabla) {
          panel.style.display = "none";
          panel.closest(".card").querySelector(".toggle-detalle i").classList.replace("bi-chevron-up", "bi-chevron-down");
        }
      });

      if (detalleTabla.style.display === "none") {
        detalleTabla.style.display = "block";
        icono.classList.replace("bi-chevron-down", "bi-chevron-up");

        const evaluacionId = detalleTabla.querySelector(".tabla-criterios-body").dataset.evaluacionId;
        ObtenerCriterioDeEvaluacion(Number(evaluacionId), esEditable);
      } else {
        detalleTabla.style.display = "none";
        icono.classList.replace("bi-chevron-up", "bi-chevron-down");
      }
    });
  });
}



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR EL MODAL DE EDICION DE LA EVALUACION ////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA BUSCAR EL ID DE LA EVALUACION Y LLAMAR A LA FUNCION DE EDICION O CREACION /////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function BuscarEvaluacionId() {
  const id = parseInt(document.getElementById("IdEvaluacion").value);

  if (!id || id === 0) {
    CrearEvaluacion();
  } else {
    EditarEvaluacion(id);
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA LIMPIAR EL FORMULARIO DE EVALUACION ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function LimpiarModalEvaluacion() {
  document.getElementById("IdEvaluacion").value = "";
  const inputCalificacion = document.getElementById("CalificacionEvaluacion");
  inputCalificacion.value = 0;
  const inputEmpleado = document.getElementById("EmpleadoId");
  inputEmpleado.value = "";
  const selectTipoCriterio = document.getElementById("IdTipoCriterio");
  selectTipoCriterio.value = "";
  const inputDescripcion = document.getElementById("Descripcion");
  inputDescripcion.value = "";

  inputCalificacion.classList.remove("is-invalid", "is-valid");
  inputEmpleado.classList.remove("is-invalid", "is-valid");
  selectTipoCriterio.classList.remove("is-invalid", "is-valid");
  inputDescripcion.classList.remove("is-invalid", "is-valid");

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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA VALIDAR EL FORMULARIO DE EVALUACION ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function ValidarFormularioEvaluacion() {
  const inputCalificacion = document.getElementById("CalificacionEvaluacion");
  const inputErrorCalificacion = document.getElementById("errorCalificacionEvaluacion");

  const inputEmpleado = document.getElementById("EmpleadoId");
  const inputErrorEmpleado = document.getElementById("errorEmpleadoId");

  const calificacion = parseFloat(inputCalificacion.value);
  const empleadoId = inputEmpleado.value.trim();

  inputErrorCalificacion.style.display = "none";
  inputErrorCalificacion.textContent = "";
  inputCalificacion.classList.remove("is-invalid", "is-valid");
  inputErrorEmpleado.style.display = "none";
  inputErrorEmpleado.textContent = "";
  inputEmpleado.classList.remove("is-invalid", "is-valid");

  let esValid = true;

  if (isNaN(calificacion) || calificacion === 0) {
    inputCalificacion.classList.add("is-invalid");
    inputErrorCalificacion.style.display = "block";
    inputErrorCalificacion.textContent = "Campo obligatorio.";
    esValid = false;
  }

  if (empleadoId === "") {
    inputEmpleado.classList.add("is-invalid");
    inputErrorEmpleado.style.display = "block";
    inputErrorEmpleado.textContent = "Campo obligatorio.";
    esValid = false;
  }
  return esValid;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// VALIDACION EN VIVO: CAMBIA EL COLOR MIENTRAS EL USUARIO ESCRIBE //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById("CalificacionEvaluacion").addEventListener("change", () => {
  const selectCalificacion = document.getElementById("CalificacionEvaluacion");
  const errorCalificacion = document.getElementById("errorCalificacionEvaluacion");
  const calificacion = parseInt(selectCalificacion.value);

  selectCalificacion.classList.remove("is-invalid", "is-valid");

  if (isNaN(calificacion) || calificacion === 0) {
    selectCalificacion.classList.add("is-invalid");
    errorCalificacion.style.display = "block";
    errorCalificacion.textContent = "Campo obligatorio.";
  } else {
    selectCalificacion.classList.add("is-valid");
    errorCalificacion.style.display = "none";
  }
});

document.getElementById("EmpleadoId").addEventListener("change", () => {
  const input = document.getElementById("EmpleadoId");
  const error = document.getElementById("errorEmpleadoId");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");

  let esValid = true;

  if (valor === "0") {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Seleccione un empleado.";
    esValid = false;
  } else {
    input.classList.add("is-valid");
    error.style.display = "none";
  };
  return esValid;
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
// VADIDAR DAROS DE EVALUACION EXISTENTE ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function ValidarEvaluacionExistente(mensaje) {
  const errorEmpleado = document.getElementById("errorEmpleadoId");
  const inputEmpleadoId = document.getElementById("EmpleadoId");

  errorEmpleado.textContent = mensaje;
  errorEmpleado.style.display = "block";
  inputEmpleadoId.classList.add("is-invalid");
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION CREAR EVALUACION ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function CrearEvaluacion() {

  if (!ValidarFormularioEvaluacion())
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA EDITAR UNA EVALUACION //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EditarEvaluacion(id) {

  if (!ValidarFormularioEvaluacion())
    return;

  const evaluacion = {
    id: document.getElementById("IdEvaluacion").value,
    calificacion: document.getElementById("CalificacionEvaluacion").value,
    empleadoId: document.getElementById("EmpleadoId").value,
  };
  const res = await authFetch(`Evaluaciones/${id}`, {
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// OBTENER LOS CRITERIOS DE EVALUACION ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////  
async function ObtenerCriterioDeEvaluacion(evaluacionId, esEditable) {
  try {
    const res = await authFetch("CriteriosDeEvaluacion", { method: "GET" });
    const data = await res.json();

    const criteriosFiltrados = data.filter(c => c.evaluacionId === evaluacionId);

    MostrarCriterioDeEvaluacion(evaluacionId, criteriosFiltrados, esEditable);
  } catch (error) {
    MostrarErrorCatch();
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS CRITERIOS DE EVALUACION ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarCriterioDeEvaluacion(evaluacionId, data, esEditable) {
  const tablaBody = $(`.tabla-criterios-body[data-evaluacion-id="${evaluacionId}"]`);
  if (!tablaBody.length) return;

  tablaBody.empty();

  if (data.length === 0) {
    tablaBody.append(
      `<tr><td colspan='${esEditable ? 3 : 2}' class='text-center text-muted'>
        No hay criterios de evaluación para mostrar.
      </td></tr>`
    );
    return;
  }

  const enMovil = window.innerWidth <= 820;

  $.each(data, function (index, item) {
    if (enMovil) {
      tablaBody.append(`
        <tr>
          <td class='align-middle'>${item.tipoDeCriterio.nombre}</td>
          ${esEditable
          ? `<td class='align-middle text-center'>
                <button class='btn-eliminar' style='background: none; border: none;' 
                  onclick='EliminarCriterioDeEvaluacion(${item.id}, ${evaluacionId}, ${esEditable})' data-tippy-content='Eliminar'>
                  <i class='bi bi-trash3 icono-elimina-detalle'></i>
                </button>
              </td>`
          : ""
        }
        </tr>
      `);
    }
    else {
      tablaBody.append(`
        <tr>
          <td class='align-middle'>${item.tipoDeCriterio.nombre}</td>
          <td class='align-middle'>${item.descripcion || "Sin descripción"}</td>
          ${esEditable
          ? `<td class='d-flex justify-content-center align-items-center'>
                  <button class='btn-eliminar' style='background: none; border: none;' 
                    onclick='EliminarCriterioDeEvaluacion(${item.id}, ${evaluacionId}, ${esEditable})' data-tippy-content='Eliminar'>
                    <i class='bi bi-trash3 icono-elimina-detalle'></i>
                  </button>
                </td>`
          : ""
        }
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR EL DETALLE DE CRITERIOS DE EVALUACION ////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
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
              <p class="detalle-criterio-titulo-seccion">Información del Criterio</p>

              <div class="detalle-criterio-fila">
                <span class="detalle-criterio-valor-nombre">${item.tipoDeCriterio.nombre}</span>
              </div>

              <div class="detalle-criterio-fila">
                <span class="detalle-criterio-valor">${item.descripcion || "Sin descripción"}</span>
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
    });

  const offcanvasElement = document.getElementById("offcanvasDetalleCriterios");
  if (offcanvasElement.parentNode !== document.body) {
    document.body.appendChild(offcanvasElement);
  }

  let offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
  if (!offcanvas) offcanvas = new bootstrap.Offcanvas(offcanvasElement);
  offcanvas.show();
}



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA BUSCAR EL ID DE CRITERIO Y LLAMAR A LA FUNCION DE EDICION O CREACION ///////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function BuscarCriterioId() {
  const id = parseInt(document.getElementById("IdCriterio").value);

  if (!id || id === 0) {
    CrearCriterioDeEvaluacion();
  } else {
    EditarCriterioDeEvaluacion(id);
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA VALDIAR EL FORMULARIO DE CRITERIO DE EVALUACION ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function ValidarFormularioCriterioDeEvaluacion() {
  const selectTipoCriterio = document.getElementById("IdTipoCriterio");
  const selectErrorIdTipoCriterio = document.getElementById("errorIdTipoCriterio");

  const inputDescripcion = document.getElementById("Descripcion");
  const inputErrorDescripcion = document.getElementById("errorDescripcion");

  const tipoDeCriterioId = selectTipoCriterio.value;
  const descripcion = inputDescripcion.value.trim();

  selectErrorIdTipoCriterio.style.display = "none";
  selectErrorIdTipoCriterio.textContent = "";
  selectTipoCriterio.classList.remove("is-invalid", "is-valid");
  inputErrorDescripcion.style.display = "none";
  inputErrorDescripcion.textContent = "";
  inputDescripcion.classList.remove("is-invalid", "is-valid");

  let esValid = true;

  if (tipoDeCriterioId === "") {
    selectTipoCriterio.classList.add("is-invalid");
    selectErrorIdTipoCriterio.style.display = "block";
    selectErrorIdTipoCriterio.textContent = "Campo obligatorio.";
    esValid = false;
  }

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

////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA VALIDAR EL FORMULARIO EN VIVO DE CRITERIO DE EVALUACION ////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById("Descripcion").addEventListener("input", () => {
  const inputDescripcion = document.getElementById("Descripcion");
  const errorDescripcion = document.getElementById("errorDescripcion");
  const descripcion = inputDescripcion.value;

  inputDescripcion.classList.remove("is-invalid", "is-valid");

  let esValid = true;

  if (descripcion.length === 0) {
    inputDescripcion.classList.add("is-invalid");
    errorDescripcion.style.display = "block";
    errorDescripcion.textContent = "Campo obligatorio.";
    esValid = false;
  }
  else if (descripcion.length < 3) {
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

document.getElementById("IdTipoCriterio").addEventListener("change", () => {
  const selectTipoCriterio = document.getElementById("IdTipoCriterio");
  const errorTipoCriterio = document.getElementById("errorIdTipoCriterio");
  const valor = selectTipoCriterio.value;

  selectTipoCriterio.classList.remove("is-invalid", "is-valid");
  errorTipoCriterio.style.display = "none";
  errorTipoCriterio.textContent = "";

  if (valor === "" || valor === "0") {
    selectTipoCriterio.classList.add("is-invalid");
    errorTipoCriterio.style.display = "block";
    errorTipoCriterio.textContent = "Campo obligatorio.";
  } else {
    selectTipoCriterio.classList.add("is-valid");
  }
});



////////////////////////////////////////////////////////////////////////////////////////////////////////
// VADIDAR DAROS DE CRITERIO DE EVALUACION EXISTENTE ////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function ValidarCriterioDeEvaluacionExistente(mensaje) {
  const errorCriterio = document.getElementById("errorIdTipoCriterio");
  const inputCriterio = document.getElementById("IdTipoCriterio");

  errorCriterio.textContent = mensaje;
  errorCriterio.style.display = "block";
  inputCriterio.classList.add("is-invalid");
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA CREAR CRITERIO DE EVALUACION ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function CrearCriterioDeEvaluacion() {
  if (!ValidarFormularioCriterioDeEvaluacion())
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
        ObtenerCriterioDeEvaluacion(evaluacionIdSeleccionada, true);
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR EL MODAL DE ELIMINAR CRITERIO DE EVALUACION ///////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function EliminarCriterioDeEvaluacion(id, evaluacionId, esEditable) {
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
  }).then((result) => {
    if (result.isConfirmed) {
      EliminarSiCriterio(id, evaluacionId, esEditable);
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
  });
}



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA ELIMINAR SI CRITERIO ///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EliminarSiCriterio(id, evaluacionId, esEditable) {
  try {
    const res = await authFetch(`CriteriosDeEvaluacion/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("No se pudo eliminar el criterio");

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

    ObtenerCriterioDeEvaluacion(evaluacionId, esEditable);

  } catch (error) {
    MostrarErrorCatch();
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LAS OPCIONES DE CURSO POR ROL /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarOpcionesEvaluacionesPorRol() {
  const rol = getRol()?.toUpperCase();
  if (!rol) return;

  if (rol === "ADMINISTRADOR"  ){
    $("#cardEstadisticasEvaluaciones, #btnMostrarGenerar, #btnNuevaEvaluacion, #filtroEmpleado").removeClass("d-none");
    $("#EvaluacionCreadoPorUsuario, #EvaluacionCreadoSuperior, #EvaluacionRecibida").addClass("d-none");
  }
  else if (rol === "RRHH" || rol === "SUPERVISOR") {
    $("#cardEstadisticasEvaluaciones, #btnMostrarGenerar, #btnNuevaEvaluacion, #filtroEmpleado").removeClass("d-none");
  } else if (rol === "EMPLEADO") {
    $("#tituloEvaluaciones").text("Visualizá tu progreso, resultados y estado de las evaluaciones realizadas.");
    $("#EvaluacionCreadoPorUsuario, #EvaluacionCreadoSuperior, #EvaluacionRecibida, #JustificacionCriterioEliminar").addClass("d-none");

  }
}




////////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA GENERA UN INFORME PARA EVALUACIONES SEGUN SU FILTRO //////////////
////////////////////////////////////////////////////////////////////////////////
async function GenerarInformePdfEvaluacion() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margen = 14;
  const anchoUtil = pageWidth - (margen * 2);

  let empleadoBuscar = document.getElementById("EmpleadoIdBuscar")?.value || "";
  let calificacion = document.getElementById("CalificacionBuscar")?.value || 0;
  let fechaEval = document.getElementById("FechaEvalBuscar")?.value || null;

  const filtro = {
    nombreEmpleado: empleadoBuscar.trim() || null,
    fecha: fechaEval || null,
    calificacion: calificacion !== "0" ? Number(calificacion) : null,
  };

  const res = await authFetch("InformesGeneralesPdf/GenerarInformeEvaluaciones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filtro),
  });

  const data = await res.json();
  const evaluaciones = data.evaluacion || [];
  const resumen = data.resumen;

  doc.setTextColor(19, 115, 204);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Informe de Evaluación", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  let y = 29;
  const fechaHoy = new Date().toLocaleString("es-AR");

  doc.text("Generado:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(fechaHoy, 33, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text("Total Evaluaciones:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.total}`, 49, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Excelente:", 55, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.evaluacionCalificacion["Excelente"]}`,76, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Buena:", 81, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.evaluacionCalificacion["Buena"]}`, 96, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Muy Buena:", 101, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.evaluacionCalificacion["Muy Buena"]}`, 125, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Mala:", 130, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.evaluacionCalificacion["Mala"]}`, 142, y);

  y += 6;

  const filtrosAplicadosArray = [];
  if (filtro.nombreEmpleado) filtrosAplicadosArray.push(`[Empleado: ${filtro.nombreEmpleado}]`);
  if (filtro.calificacion) {
    let calificacionNombre = document.getElementById("CalificacionBuscar").selectedOptions[0]?.text || calificacion;
    filtrosAplicadosArray.push(`[Calificación: ${calificacionNombre}]`);
  }
  if (filtro.fecha) filtrosAplicadosArray.push(`[Fecha: ${filtro.fecha}]`);

  const filtrosAplicados = filtrosAplicadosArray.length > 0 ? filtrosAplicadosArray.join("  |  ") : "No se aplicaron";

  doc.setFont("helvetica", "normal");
  doc.text("Filtros Aplicados:", 14, y);
  doc.setFont("helvetica", "bold");
  const filtrosText = doc.splitTextToSize(filtrosAplicados, 260);
  doc.text(filtrosText, margen + 32, y);

  y += filtrosText.length * 6 + 2;

  doc.setDrawColor(180);
  doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
  y += 7;

  if (evaluaciones.length === 0) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 0, 0);
    doc.text("No hay resultados para los filtros aplicados.", pageWidth / 2, y + 10, { align: "center" });

    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Página ${i} de ${pages}`, margen, doc.internal.pageSize.getHeight() - 10);
    }

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const w = window.open();
    w.document.write(`<iframe width='100%' height='100%' src='${url}'></iframe>`);
    return;
  }

  const colEvaluacion = {
    0: { cellWidth: anchoUtil / 3 },  
    1: { 
      cellWidth: anchoUtil / 3, 
      halign: "left",       
      valign: "top",        
      cellPadding: { left: 10, top: 2, right: 0 } 
    },
    2: { cellWidth: anchoUtil / 3 },  
  };

  const colCriterios = {
    0: { cellWidth: anchoUtil / 2 }, 
    1: { cellWidth: anchoUtil / 2 },
  };

  for (let index = 0; index < evaluaciones.length; index++) {
    const evaluacion = evaluaciones[index];

    const calificacionTexto = evaluacion.calificacionStr
      ? evaluacion.calificacionStr.replace(/,/g, " | ")
      : evaluacion.calificacion ?? "-";

    const tablaEvaluacionBody = [
      [
        evaluacion.fecha ? new Date(evaluacion.fecha).toLocaleDateString("es-AR") : "-",
        evaluacion.calificacion ?? "-",
        evaluacion.empleado ?? "-",
      ],
    ];

    doc.autoTable({
      startY: y,
      head: index === 0 ? [["Fecha", "Calificación", "Empleado"]] : [],
      body: tablaEvaluacionBody,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: index === 0 ? { fillColor: [19, 115, 204], textColor: 255, fontStyle: "bold" } : {},
      margin: { left: margen, right: margen },
      columnStyles: colEvaluacion,
      tableWidth: anchoUtil,
      didParseCell: function (data) {
        if (data.section === "body") {
          data.cell.styles.fillColor = [210, 230, 255];  
          data.cell.styles.textColor = 0;
        }
      },
    });

    y = doc.lastAutoTable.finalY + -1; 

    if (evaluacion.criterios && evaluacion.criterios.length > 0) {
      const tablaCriteriosBody = evaluacion.criterios.map((criterio) => [
        criterio.criterioNombre ?? "-",  
        criterio.criterioDescripcion ?? "-"  
      ]);

      doc.autoTable({
        startY: y,
        head: [["Criterio", "Descripción"]],
        body: tablaCriteriosBody,
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [225, 225, 225], textColor: 0, fontStyle: "bold" },
        margin: { left: margen, right: margen },
        columnStyles: colCriterios,
        tableWidth: anchoUtil, 
        didParseCell: function (data) {
          if (data.section === "body") {
            data.cell.styles.fillColor = [255, 255, 255]; 
            data.cell.styles.textColor = 0;
          }
        },
      });

      y = doc.lastAutoTable.finalY + -1; 
    }

    if (y > 185) {
      doc.addPage();
      y = 20;
    }
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10);
    doc.text("www.WorkSync.com", pageWidth - 20, doc.internal.pageSize.getHeight() - 10, { align: "right" });
  }

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const html = `<html><head><title>Informe de Evaluaciones</title></head>
    <body class="pdf-body">
    <iframe class="pdf-frame" width="100%" height="100%" src="${url}"></iframe>
    </body></html>`;

  const w = window.open();
  w.document.open();
  w.document.write(html);
  w.document.close();
}





////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR AL CARGAR LA EVALUACIONES ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
MostrarOpcionesEvaluacionesPorRol();
ObtenerEvaluaciones();
