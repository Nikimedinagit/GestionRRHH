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

    // LimpiarModalCursos();
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
        // LimpiarModalCursos();
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

            <!-- Modalidad del curso -->
            <div class="d-flex align-items-center" style="gap: 20px;">
                <div class="badge ${claseModalidad}" title="${modalidadNombre}" >
                  ${modalidadNombre}
                </div>
            <button class="toggle-detalle" style="background: none; border: none; font-weight: bold;" aria-expanded="false" aria-label="Mostrar detalles" data-tippy-content="Detalle">
              <i class="bi bi-chevron-down"></i>
            </button>
          </div>
        </div>
      `);

      contenedor.append(item);
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
        document.getElementById("DescripcionCurso").value = data.descripcion

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

//Funcion crear curso
async function CrearCurso() {

const curso = {
  nombre: document.getElementById("NombreCurso").value,
  modalidad: parseInt(document.getElementById("ModalidadCurso").value),
  descripcion: document.getElementById("DescripcionCurso").value,
};
console.log(curso);
    const res = await authFetch("Cursos", {
      method: 'POST',
      body: JSON.stringify(curso),
    })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        ValidarEvaluacionExistente(response.mensaje);
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

ObtenerCursos();