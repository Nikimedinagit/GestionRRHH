//Funcion para obtener las asistencias
async function ObtenerAsistencia(cursoId) {
  const res = await authFetch("AsistenciasCapacitacion", {
    method: "GET",
  })
    .then(response => response.json())
    .then(data => {
      // Filtrar cursos por asistencia
      const cursosFiltrados = data.filter(c => c.cursoId === cursoId);
      MostrarAsistencias(cursoId, cursosFiltrados);
    })
    .catch(error => console.log("Error al obtener asistencias", error));
}



function MostrarAsistencias(cursoId, data) {
  const tablaBody = $(`.tabla-asistencias-body[data-curso-id="${cursoId}"]`);
  if (!tablaBody.length) return;

  tablaBody.empty();

  if (data.length === 0) {
    tablaBody.append(
      "<tr><td colspan='5' class='text-center text-muted'>No hay asistencias para mostrar.</td></tr>"
    );
    return;
  }

  $.each(data, function (index, item) {
    tablaBody.append(`
      <tr>
        <td class='text-center align-middle'>
          <input type="checkbox" class="checkbox-asistio" data-id="${item.id}" ${item.asistio ? "checked" : ""} />
        </td>
        <td class='align-middle'>${item.empleado.nombreCompleto}</td>
        <td class='align-middle'>${new Date(item.fecha).toLocaleDateString()}</td>
        <td class='align-middle'>${item.resultado || ""}</td>
        <td class='d-flex justify-content-center align-items-center'>
          <button class='btn-eliminar' style='background: none; border: none;' 
            onclick='EliminarAsistencia(${item.id})' data-tippy-content='Eliminar'>
            <i class='bi bi-trash3 icono-elimina-detalle'></i>
          </button>
        </td>
      </tr>
    `);
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}


function BuscarAsistenciaId() {
  const id = parseInt(document.getElementById("IdAsistencia").value);

  if (!id || id === 0) {
    CrearAsistencia();
  } else {
    EditarAsistencia(id);
  }
}


// function ValidarFormularioAsistencia() {
//     const selectTipoCriterio = document.getElementById("IdTipoCriterio");
//     const selectErrorIdTipoCriterio = document.getElementById("errorIdTipoCriterio");

//     const inputDescripcion = document.getElementById("Descripcion");
//     const inputErrorDescripcion = document.getElementById("errorDescripcion");

//     const tipoDeCriterioId = selectTipoCriterio.value;
//     const descripcion = inputDescripcion.value.trim();

//     //Limpiar errores previos
//     selectErrorIdTipoCriterio.style.display = "none";
//     selectErrorIdTipoCriterio.textContent = "";
//     selectTipoCriterio.classList.remove("is-invalid", "is-valid");
//     inputErrorDescripcion.style.display = "none";
//     inputErrorDescripcion.textContent = "";
//     inputDescripcion.classList.remove("is-invalid", "is-valid");

//     let esValid = true;

//     if(tipoDeCriterioId === ""){
//         selectTipoCriterio.classList.add("is-invalid");
//         selectErrorIdTipoCriterio.style.display = "block";
//         selectErrorIdTipoCriterio.textContent = "Seleccione un criterio.";
//         esValid = false;
//     }

//     // Validar descripcion
//     if (descripcion.length === 0) {
//       inputDescripcion.classList.add("is-invalid");
//       inputErrorDescripcion.style.display = "block";
//       inputErrorDescripcion.textContent = "Campo obligatorio.";
//       esValid = false;
//     } else if (descripcion.length < 3) {
//       inputDescripcion.classList.add("is-invalid");
//       inputErrorDescripcion.style.display = "block";
//       inputErrorDescripcion.textContent = "Mínimo 3 caracteres.";
//       esValid = false;
//     } else {
//       inputDescripcion.classList.add("is-valid");
//     }
//     return esValid;
// }
// document.getElementById("Descripcion").addEventListener("input", () => {
//     const inputDescripcion = document.getElementById("Descripcion");
//     const errorDescripcion = document.getElementById("errorDescripcion");
//     const descripcion = inputDescripcion.value;

//     // Limpiar cualquier estado previo
//     inputDescripcion.classList.remove("is-invalid", "is-valid");

//     let esValid = true;

//     if(descripcion.length === 0){
//       inputDescripcion.classList.add("is-invalid");
//       errorDescripcion.style.display = "block";
//       errorDescripcion.textContent = "Campo obligatorio.";
//       esValid = false;
//     }
//     else if(descripcion.length < 3){
//       inputDescripcion.classList.add("is-invalid");
//       errorDescripcion.style.display = "block";
//       errorDescripcion.textContent = "Mínimo 3 caracteres.";
//       esValid = false;
//     } else {
//       inputDescripcion.classList.add("is-valid");
//       errorDescripcion.style.display = "none";
//       errorDescripcion.textContent = "";
//     }
//     return esValid;
// });


// //Funcion para validar criterios de evaluacion existente 
// function ValidarCriterioDeEvaluacionExistente(mensaje) {
//     const errorCriterio = document.getElementById("errorIdTipoCriterio");
//     const inputCriterio = document.getElementById("IdTipoCriterio");

//     errorCriterio.textContent = mensaje;
//     errorCriterio.style.display = "block";
//     inputCriterio.classList.add("is-invalid");
// }

async function CrearAsistencia() {
    // if(!ValidarFormularioCriterioDeEvaluacion())
    //     return;

const asistencia = {
  asistencia: document.getElementById("IdAsistencia").value,
  empleadoId: document.getElementById("EmpleadoId").value,
  fecha: document.getElementById("FechaAsistencia").value,
  resultado: document.getElementById("ResultadoAsistencia").value,
  cursoId: cursoIdSeleccionado,
};
    const res = await authFetch("AsistenciasCapacitacion", {
      method: 'POST',
      body: JSON.stringify(asistencia),
    })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        ValidarCriterioDeEvaluacionExistente(response.mensaje);
      } else {
        cerrarPanelAsistencias();
        ObtenerAsistencia(cursoIdSeleccionado);        
        Swal.fire({
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "¡Asistencia Creada!",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#f0f0f0",
          color: "#000",
        });
      }
    });
}

function EliminarCriterioDeEvaluacion(id) {
    Swal.fire({
        title: "¿Está seguro que desea eliminar este criterio?",
        text: "Este criterio sera eliminado de forma definitiva. ¿Deseás continuar?",
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
            EliminarSiCriterio(id);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: "Acción cancelada",
                text: "El criterio permanece registrado.",
                icon: "info",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: "bottom-end",
            })
        }
      })
}

function EliminarSiCriterio(id) {
    fetch(`http://localhost:5106/api/CriteriosDeEvaluacion/${id}`,
        {
            method: "DELETE"
        })
    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudo eliminar el criterio");
      }
      return response.text();
    })
    .then((data) => {
    ObtenerCriterioDeEvaluacion(evaluacionIdSeleccionada);

        Swal.fire({
            toast: true,
            position: "bottom-end",
            icon: "success",
            title: "¡Criterio de Evaluación Eliminado!",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: "#f0f0f0",
            color: "#000",
        })
    })
}

//Funcion para obtener los criterios de evaluacion de una evaluacion
ObtenerCriterioDeEvaluacion(evaluacionIdSeleccionada);

