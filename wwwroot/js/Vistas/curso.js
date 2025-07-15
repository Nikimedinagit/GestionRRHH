//INICIO PANEL FORMUALRIO//
function abrirPanelCursos() {
  document.getElementById("panelCursos").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreCurso");
    if (inputNombre) inputNombre.focus();
  }, 400);
}

//Funcion para cerrar el formulario lateral
function cerrarPanelCursos() {
  document.getElementById("panelCursos").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalCursos();
}
//FIN PANEL FORMULARIO//



//Funcion para obtener los cursos
async function ObtenerCursos() {
    const res = await authFetch("Cursos", {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        MostrarCursos(data)
        LimpiarModalCursos();
        cerrarPanelCursos();
      })
    .catch(error => console.log('No se pudo obtener los cursos', error)); 
}


// Funcion para mostrar los cursos
function MostrarCursos(data) {
  const contenedor = $("#contenedorCursos");
  contenedor.empty();

  if (data.length === 0) {
    contenedor.append(
      "<div class='text-center text-muted py-3'>No hay cursos para mostrar.</div>"
    );
    return;
  }

  const modalidades = {
    1: "PRESENCIAL",
    2: "VIRTUAL",
    3: "MIXTO",
  };

  const modalidadColor = {
    PRESENCIAL: "badge-presencial ",
    VIRTUAL: "badge-virtual",
    MIXTO: "badge-mixto",
  };


  if (Array.isArray(data)) {
    data.forEach(element => {
      const modalidadNombre = modalidades[element.modalidad];
      const claseModalidad = modalidadColor[modalidadNombre] || "bg-light text-dark";
      const fecha = element.fechaInicio.split("T")[0];
      const horaCompleta = element.fechaInicio.split("T")[1];
      const hora = horaCompleta.substring(0, 5);

      const item = $(`
      <div class="curso-item border rounded py-2 px-3 mb-2 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center" style="gap: 20px;">

        <!-- Botón Editar -->
          <button class="btn-editar me-1" style="background: none; border: none;" data-action="edit" onclick="MostrarModalEditar(${element.id})" data-tippy-content="Editar">
            <i class="bi bi-pencil-square icono-editar"></i>
          </button>

        <!-- Nombre del curso -->
          <div class="fw-bold text-truncate" title="${element.nombre || 'Sin nombre'}">
            ${element.nombre || 'Sin nombre'}
          </div>
        </div>
            
        <!-- Fecha Inicio -->
        <div class="flex-grow-1 text-center text-muted" style="opacity: 0.7;">
          <span style="margin-right: 5px;">&bull;</span>
          El curso comienza el ${fecha} a las ${hora}
        </div>

        <!-- Modalidad del curso -->
          <div class="d-flex align-items-center" style="gap: 20px;">
            <div class="badge ${claseModalidad}" title="${modalidadNombre}" >
              ${modalidadNombre}
            </div>

                
        <!-- Boton ver asistencia -->
        <button class="toggle-detalle" style="background: none; border: none; font-weight: bold;" data-tippy-content="Ver Asistencias">
          <i class="bi-calendar-check"></i>
        </button>

        <button class="toggle-detalle" style="background: none; border: none; font-weight: bold;"  data-tippy-content="Ver Ceritificados">
          <i class="bi-award"></i>
        </button>

        <button class="toggle-detalle" style="background: none; border: none; font-weight: bold;" aria-expanded="false" aria-label="Mostrar detalles" data-tippy-content="Detalle">
          <i class="bi bi-chevron-down"></i>
        </button>
        </div>
    </div>
      `);

      const descripcionDetalle = $(`
        <div class="panelCriterios px-3 pb-2" style="display: none;">
          <div class="mb-3">
            <h3 class="titulo-sub-seccion">Descripción</h3>
          </div>
          <hr style="margin-bottom: 1rem;" />
          <div class="table-responsive">
            <table class="table table-bordered">
              <tbody>
                <tr>
                  <td id="DescripcionCurso_${element.id}">
                    <!-- Aquí va el texto dinámico de la descripción -->
                    ${element.descripcion ?? "Sin descripción"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `);
  item.find(".toggle-detalle").on("click", function () {
    const iconoChevron = $(this).find("i"); // Icono de la flecha
    const panel = descripcionDetalle ; // Contenedor del panel
  // Alternar visibilidad
    panel.slideToggle(200, function () {
    panel.toggleClass("mostrar", panel.is(":visible"));
  });

  iconoChevron.toggleClass("bi-chevron-down bi-chevron-up");
});
      contenedor.append(item);
      contenedor.append(descripcionDetalle );
    });
  }

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}


// Funcion para mostrar el modal de edición de la evaluación   
async function MostrarModalEditar(id) {
  const res = await authFetch(`Cursos/${id}`,
    {
        method: "GET"
    })
    .then(response => response.json())
    .then((data => {
        document.getElementById("IdCurso").value = data.id;
        document.getElementById("NombreCurso").value = data.nombre;
        document.getElementById("ModalidadCurso").value = data.modalidad;
        document.getElementById("DescripcionCurso").value = data.descripcion;
        document.getElementById("FechaInicioCurso").value = data.fechaInicio;

        abrirPanelCursos();
    }))
}

//Funcion para buscar el id del curso y llamar a la función de edición o creación
function BuscarCursoId() {
  const id = parseInt(document.getElementById("IdCurso").value);

  if (!id || id === 0) {
    CrearCurso();
  } else {
    EditarCurso(id);
  }
}


function LimpiarModalCursos() {
    //Limpiar el formulario
    document.getElementById("IdCurso").value = "";
    const inputNombre = document.getElementById("NombreCurso");
    inputNombre.value = "";
    const selectModalidad = document.getElementById("ModalidadCurso");
    selectModalidad.value = "";
    const inputDescripcion = document.getElementById("DescripcionCurso");
    inputDescripcion.value = "";
    const inputFechaInicio = document.getElementById("FechaInicioCurso");
    inputFechaInicio.value = "";

    //Limpia las validaciones
    inputNombre.classList.remove("is-invalid", "is-valid");
    selectModalidad.classList.remove("is-invalid", "is-valid");
    inputDescripcion.classList.remove("is-invalid", "is-valid");
    inputFechaInicio.classList.remove("is-invalid", "is-valid");

    //Limpiar los mensajes de error
    const inputErrorNombre = document.getElementById("errorNombreCurso");
    inputErrorNombre.textContent = "";
    inputErrorNombre.style.display = "none";
    const selectErrorModalidad = document.getElementById("errorModalidadCurso");
    selectErrorModalidad.textContent = "";
    selectErrorModalidad.style.display = "none";
    const inputErrorDescripcion = document.getElementById("errorDescripcionCurso");
    inputErrorDescripcion.textContent = "";
    inputErrorDescripcion.style.display = "none";
    const inputErrorFechaInicio = document.getElementById("errorFechaInicioCurso");
    inputErrorFechaInicio.textContent = "";
    inputErrorFechaInicio.style.display = "none";
}

//Funcion para validar el formulario de cursos
function ValidarFormularioCursos() {
    const inputNombre = document.getElementById("NombreCurso");
    const inputErrorNombre = document.getElementById("errorNombreCurso");

    const selectModalidad = document.getElementById("ModalidadCurso");
    const selectErrorModalidad = document.getElementById("errorModalidadCurso");

    const inputDescripcion = document.getElementById("DescripcionCurso");
    const inputErrorDescripcion = document.getElementById("errorDescripcionCurso");

    const inputFechaInicio = document.getElementById("FechaInicioCurso");
    const inputErrorFechaInicio = document.getElementById("errorFechaInicioCurso");

    const nombre = inputNombre.value.trim();
    const modalidadSeleccionada = selectModalidad.value;
    const descripcion = inputDescripcion.value.trim();
    const fechaInicio = inputFechaInicio.value;

    //Limpiar errores previos
    inputErrorNombre.style.display = "none";
    inputErrorNombre.textContent = "";
    inputNombre.classList.remove("is-invalid", "is-valid");
    selectErrorModalidad.style.display = "none";
    selectErrorModalidad.textContent = "";
    selectModalidad.classList.remove("is-invalid", "is-valid");
    inputErrorDescripcion.style.display = "none";
    inputErrorDescripcion.textContent = "";
    inputDescripcion.classList.remove("is-invalid", "is-valid");
    inputErrorFechaInicio.style.display = "none";
    inputErrorFechaInicio.textContent = "";
    inputFechaInicio.classList.remove("is-invalid", "is-valid");
  
    let esValid = true;

    // Validar nombre
    if (nombre.length === 0) {
      inputNombre.classList.add("is-invalid");
      inputErrorNombre.style.display = "block";
      inputErrorNombre.textContent = "Campo obligatorio.";
      esValid = false;
    } else if (nombre.length < 3) {
      inputNombre.classList.add("is-invalid");
      inputErrorNombre.style.display = "block";
      inputErrorNombre.textContent = "Mínimo 3 caracteres.";
      esValid = false;
    } else {
      inputNombre.classList.add("is-valid");
    }

    // Validar modalidad
    if (!modalidadSeleccionada) {
      selectModalidad.classList.add("is-invalid");
      selectErrorModalidad.style.display = "block";
      selectErrorModalidad.textContent = "Seleccione una modalidad.";
      esValid = false;
    } else {
      selectModalidad.classList.add("is-valid");
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

    // Validar Fecha Inicio
    if (fechaInicio.length === 0) {
      inputFechaInicio.classList.add("is-invalid");
      inputErrorFechaInicio.style.display = "block";
      inputErrorFechaInicio.textContent = "Seleccione una fecha.";
      esValid = false;
    }else {
      inputNombre.classList.add("is-valid");
    }
    return esValid;
}

// 🎨 Validación en vivo: cambia el color mientras el usuario escribe
document.getElementById("NombreCurso").addEventListener("input", () => {
  const inputNombre = document.getElementById("NombreCurso");
  const errorNombre = document.getElementById("errorNombreCurso");
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
    inputNombre.classList.add("is-valid");
    errorNombre.style.display = "none";
    errorNombre.textContent = "";
  }
});

//Funcion para evitar que se pueda evaluar el mismo empleado en el mismo mes
function ValidarCursoExistente(mensaje) {
  const errorNombre = document.getElementById("errorNombreCurso");
  const inputNombre = document.getElementById("NombreCurso");

  errorNombre.textContent = mensaje;
  errorNombre.style.display = "block";
  inputNombre.classList.add("is-invalid");
}
//Funcion crear curso
async function CrearCurso() {
  if(!ValidarFormularioCursos()){
    return
  }

  const curso = {
    nombre: document.getElementById("NombreCurso").value,
    modalidad: parseInt(document.getElementById("ModalidadCurso").value),
    descripcion: document.getElementById("DescripcionCurso").value,
    fechaInicio: document.getElementById("FechaInicioCurso").value,
  };
console.log(curso);
    const res = await authFetch("Cursos", {
      method: 'POST',
      body: JSON.stringify(curso),
    })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        ValidarCursoExistente(response.mensaje);
      } else {
        cerrarPanelCursos();
        ObtenerCursos();
        // Mostrar alerta de éxito
        Swal.fire({
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "¡Curso Creado!",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#f0f0f0",
          color: "#000",
        });
      }
    });
}

//Funcion para editar un curso
async function EditarCurso(id) {

    if(!ValidarFormularioCursos())
        return;

    const curso = {
    id: document.getElementById("IdCurso").value,
    nombre: document.getElementById("NombreCurso").value,
    modalidad: parseInt(document.getElementById("ModalidadCurso").value),
    descripcion: document.getElementById("DescripcionCurso").value,
    fechaInicio : document.getElementById("FechaInicioCurso").value,
    };
    const res =  await authFetch(`Cursos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(curso),
    })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        ValidarCursoExistente(response.mensaje);
      } else {
        cerrarPanelCursos();
        ObtenerCursos();
        // Mostrar alerta de éxito
        Swal.fire({
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "¡Curso Modificado!",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#f0f0f0",
          color: "#000",
        });
      }
    });
}
ObtenerCursos();