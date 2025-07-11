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


//Funcion para obtener las evaluaciones
async function ObtenerEvaluaciones() {
    const res = await authFetch("Evaluaciones")
    .then(response => response.json())
    .then((data => {
        MostrarEvaluaciones(data);
        LimpiarModalEvaluacion();
        cerrarPanelEvaluaciones();
    }))
  
    .catch(error => console.log("No se pudo obtener las evaluaciones", error));

}



function MostrarEvaluaciones(data) {
  const contenedor = $("#contenedorEvaluaciones");
  contenedor.empty();

  if (data.length === 0) {
    contenedor.append(
      "<div class='text-center text-muted py-3'>No hay evaluaciones para mostrar.</div>"
    );
    return;
  }

  data.forEach(element => {
    const nota = Number(element.calificacion);
    const fecha = element.fecha.split("T")[0];

    // Etiqueta según nota
    let etiqueta = "Regular";
    let badgeClass = "badge-regular";

    if (nota >= 9 && nota <= 10) {
      etiqueta = "Excelente";
      badgeClass = "badge-excelente";
    } else if (nota >= 7 && nota < 9) {
      etiqueta = "Muy Buena";
      badgeClass = "badge-muybuena";
    } else if (nota >= 5 && nota < 7) {
      etiqueta = "Buena";
      badgeClass = "badge-buena";
    } else {
      etiqueta = "Regular";
      badgeClass = "badge-regular";
    }


    const item = $(`
  <div class="evaluacion-item border rounded py-2 px-3 mb-2 d-flex align-items-center justify-content-between">

    <!-- Columna izquierda (Nombre + Puesto) -->
    <div class="d-flex flex-column" style="margin-right: 20px; min-width: 180px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
      <div class="fw-bold" title="${element.empleado?.nombreCompleto || 'Sin nombre'}">
        ${element.empleado?.nombreCompleto || 'Sin nombre'}
      </div>
      <div class="text-muted" style="opacity: 0.6;" title="${element.empleado?.puesto?.descripcion || 'Sin puesto'}">
        ${element.empleado?.puesto?.descripcion || 'Sin puesto'}
      </div>
    </div>

    <!-- Fecha con punto al inicio, centrada y con ancho fijo -->
    <div class="text-muted text-center" style="opacity: 0.6; min-width: 200px; flex-shrink: 0;">
      <span style="margin-right: 5px;">&bull;</span>
      Fue evaluado el ${fecha}
    </div>

    <!-- Nota + etiqueta + botón -->
    <div class="d-flex align-items-center" style="min-width: 220px; justify-content: flex-end; gap: 10px;">

      <div class="d-flex align-items-center" style="margin-right: 20px;">
        <div class="text-dark fw-bold" style="margin-right: 10px;">${nota}/10</div>
        <div class="badge-pill ${badgeClass}" style="padding: 4px 12px;">
          ${etiqueta}
        </div>
      </div>

      <button class="toggle-detalle" style="background: none; border: none; font-weight: bold;" aria-expanded="false" aria-label="Mostrar detalles" data-tippy-content="Detalle">
        <i class="bi bi-chevron-down"></i>
      </button>

    </div>

  </div>

  <div class="evaluacion-detalle collapse px-3 pb-2" style="display: none;">
  </div>
`);


    // Toggle del acordeón
    item.find(".toggle-detalle").on("click", function () {
      const detalle = item.next(".evaluacion-detalle");
      detalle.slideToggle(200);
      const icon = $(this).find("i");
      icon.toggleClass("bi-chevron-down bi-chevron-up");
    });

    contenedor.append(item);
  });

  // Inicializar tooltips de Tippy
  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}


// Funcion para mostrar el modal de edición de la evaluación   
async function MostrarModalEditar(id) {
    // console.log(id);
  const res = await authFetch(`Evaluaciones/${id}`,
    {
        method: "GET"
    })
    .then(response => response.json())
    .then((data => {
        document.getElementById("IdEvaluacion").value = data.id;
        document.getElementById("CalificacionEvaluacion").value = data.calificacion;
        document.getElementById("IdEmpleado").value = data.empleadoId;

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
    const inputEmpleado = document.getElementById("IdEmpleado");
    inputEmpleado.value = "";

    //Limpia las validaciones
    inputCalificacion.classList.remove("is-invalid", "is-valid");
    inputEmpleado.classList.remove("is-invalid", "is-valid");

    //Limpiar los mensajes de error
    const inputErrorCalificacion = document.getElementById("errorCalificacionEvaluacion");
    inputErrorCalificacion.textContent = "";
    inputErrorCalificacion.style.display = "none";
    const inputErrorEmpleado = document.getElementById("errorEmpleadoId");
    inputErrorEmpleado.textContent = "";
    inputErrorEmpleado.style.display = "none";
}

//Funcion para validar el formulario de evaluacion
function ValidarFormularioEvaluacion() {
    const inputCalificacion = document.getElementById("CalificacionEvaluacion");
    const inputErrorCalificacion = document.getElementById("errorCalificacionEvaluacion");

    const inputEmpleado = document.getElementById("IdEmpleado");
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
  }
});

//Funcion para evitar que se pueda evaluar el mismo empleado en el mismo mes
function ValidarEvaluacionExistente(mensaje) {
  const errorEmpleado = document.getElementById("errorEmpleadoId");
  const inputIdEmpleado = document.getElementById("EmpleadoId");

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
  empleadoId: document.getElementById("IdEmpleado").value,
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
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "¡Evaluación Creada!",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#f0f0f0",
          color: "#000",
        });
      }
    });
}

//Funcion para editar una evaluacion
async function EditarEvaluacion(id) {

    if(!ValidarFormularioEvaluacion())
        return;

    const evaluacion = {
    id: document.getElementById("IdEvaluacion").value,
    calificacion: document.getElementById("CalificacionEvaluacion").value,
    IdEmpleado: document.getElementById("EmpleadoId").value,
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
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "¡Evaluación Modificada!",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#f0f0f0",
          color: "#000",
        });
      }
    });
}

// //Funcion para eliminar una evaluacion
// function EliminarEvaluacionId(id) {
//     Swal.fire({
//         title: "Confirmar eliminación",
//         text: "Esta evaluación será eliminada de forma definitiva. ¿Deseás continuar?",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonText: "Eliminar",
//         cancelButtonText: "Cancelar",
//         reverseButtons: true,
//         focusCancel: true,
//         customClass: {
//           popup: "swal2-border-radius",
//           confirmButton: "swal2-btn-eliminar",
//           cancelButton: "swal2-btn-cancelar",
//           title: "swal2-title-custom",
//           content: "swal2-content-custom",
//         },
//         background: "#fff",
//         color: "#22223b",
//       })
//       .then((result) => {
//         if(result.isConfirmed) {
//             EliminarSiEvaluacion(id);
//         } else if (result.dismiss === Swal.DismissReason.cancel) {
//             Swal.fire({
//                 title: "Acción cancelada",
//                 text: "La evaluación permanece registrada.",
//                 icon: "info",
//                 timer: 2000,
//                 showConfirmButton: false,
//                 toast: true,
//                 position: "bottom-end",
//             })
//         }
//       })
// }

// function EliminarSiEvaluacion(id) {
//     fetch(`http://localhost:5106/api/Evaluaciones/${id}`,
//         {
//             method: "DELETE"
//         })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("No se pudo eliminar la evaluacion");
//       }
//       return response.text();
//     })
//     .then((data) => {
//         ObtenerEvaluaciones();

//         Swal.fire({
//             toast: true,
//             position: "bottom-end",
//             icon: "success",
//             title: "¡Evaluación Eliminada!",
//             showConfirmButton: false,
//             timer: 2000,
//             timerProgressBar: true,
//             background: "#f0f0f0",
//             color: "#000",
//         })
//     })
// }


ObtenerEvaluaciones();