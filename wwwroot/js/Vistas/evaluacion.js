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


//PANEL FILTROS//
//FIN PANEL FILTROS//


//Funcion para obtener las evaluaciones
function ObtenerEvaluaciones() {
    fetch('http://localhost:5106/api/Evaluaciones')
    .then(response => response.json())
    .then((data => {
        MostrarEvaluaciones(data);
        LimpiarModalEvaluacion();
    }))
}

//Funcion para mostrar las evaluaciones
function MostrarEvaluaciones(data) {
  $("#tablaEvaluacionesBody").empty();

  if (data.length === 0) {
    $("#tablaEvaluacionesBody").append(
      "<tr><td colspan='4' class='text-center text-muted'>No hay evaluaciones para mostrar.</td></tr>"
    );
    return;
  }

  data.forEach(element => {
let tr = "<tr>" +
      "<td class='text-center align-middle'>" +
        // Botón Eliminar
        "<button style='background: none; border: none;' onclick='EliminarEvaluacionId(" + element.id + ")' data-tippy-content='Eliminar'>" +
          "<i class='bi-x-circle icono-eliminar btn-sm'></i>" +
        "</button>" +
      "</td>" +
      "<td>" + element.fecha.split("T")[0] + "</td>" + // Fecha
      "<td>" + element.calificacion + "</td>" +
      "<td>" + element.empleadoId + "</td>" +
      "<td class='d-flex justify-content-center align-items-center'>" +
        // Botón Editar
        "<button style='background: none; border: none;' onclick='MostrarModalEditar(" + element.id + ")' data-tippy-content='Editar'>" +
          "<i class='bi bi-pencil-square icono-editar btn-sm'></i>" +
        "</button>" +
      "</td>" +
      "</tr>";
    $("#tablaEvaluacionesBody").append(tr);
  });

  // Inicializar tooltips de Tippy
  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

// Funcion para mostrar el modal de edición de la evaluación   
function MostrarModalEditar(id) {
    // console.log(id);
  fetch(`http://localhost:5106/api/Evaluaciones/${id}`,
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

//Funcion crear evaluacion
function CrearEvaluacion() {
    if(!ValidarFormularioEvaluacion())
        return;

const evaluacion = {
  calificacion: document.getElementById("CalificacionEvaluacion").value,
  empleadoId: document.getElementById("EmpleadoId").value,
};
    fetch('http://localhost:5106/api/Evaluaciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
function EditarEvaluacion(id) {

    if(!ValidarFormularioEvaluacion())
        return;

    const evaluacion = {
    id: document.getElementById("IdEvaluacion").value,
    calificacion: document.getElementById("CalificacionEvaluacion").value,
    empleadoId: document.getElementById("EmpleadoId").value,
    };
    fetch(`http://localhost:5106/api/Evaluaciones/${id}`, {
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

//Funcion para eliminar una evaluacion
function EliminarEvaluacionId(id) {
    Swal.fire({
        title: "¿Eliminar evaluación?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
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
            EliminarSiEvaluacion(id);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: "Acción cancelada",
                text: "La evaluación sigue activa.",
                icon: "info",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: "bottom-end",
            })
        }
      })
}

function EliminarSiEvaluacion(id) {
    fetch(`http://localhost:5106/api/Evaluaciones/${id}`,
        {
            method: "DELETE"
        })
    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudo eliminar la evaluacion");
      }
      return response.text();
    })
    .then((data) => {
        ObtenerEvaluaciones();

        Swal.fire({
            toast: true,
            position: "bottom-end",
            icon: "success",
            title: "¡Evaluación Eliminada!",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: "#f0f0f0",
            color: "#000",
        })
    })
}

//Funcion para limpiar el formulario de evaluacion
function LimpiarModalEvaluacion() {
    //Limpiar el formulario
    document.getElementById("IdEvaluacion").value = "";
    const inputCalificacion = document.getElementById("CalificacionEvaluacion");
    inputCalificacion.value = "";
    const inputEmpleado = document.getElementById("EmpleadoId");
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

// 🎨 Validación en vivo: cambia el color mientras el usuario escribe
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
  const inputEmpleadoId = document.getElementById("EmpleadoId");

  errorEmpleado.textContent = mensaje;
  errorEmpleado.style.display = "block";
  inputEmpleadoId.classList.add("is-invalid");
}
ObtenerEvaluaciones();