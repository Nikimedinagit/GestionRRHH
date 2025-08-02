var cursoIdSeleccionado;
//INICIO PANEL FORMUALRIO//
function abrirPanelCursos() {
  document.getElementById("panelAsistencias").classList.remove("abierto");
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

//Inicio Panel Asistencias//
function abrirPanelAsistencias() {
  document.getElementById("panelAsistencias").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputEmpleadoId = document.getElementById("EmpleadoId");
    if (inputEmpleadoId) inputEmpleadoId.focus();
  }, 400);
  
}

$(document).on("click", ".crearAsistencias", function () {
  const cursoId = $(this).data("curso-id");
  cursoIdSeleccionado = cursoId; 
  console.log(cursoIdSeleccionado);
  abrirPanelAsistencias();
});

function cerrarPanelAsistencias() {
  document.getElementById("panelAsistencias").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalAsistencias();
}

//Inicio Panel Certificado//
function abrirPanelCertificados() {
  document.getElementById("panelCertificados").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputEmpleadoId = document.getElementById("EmpleadoId");
    if (inputEmpleadoId) inputEmpleadoId.focus();
  }, 400);
  
}

$(document).on("click", ".crearCertificado", function () {
  const cursoId = $(this).data("curso-id");
  cursoIdSeleccionado = cursoId; 
  console.log(cursoIdSeleccionado);
  abrirPanelCertificados();
});

function cerrarPanelCertificados() {
  document.getElementById("panelCertificados").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalCertificado();
}




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
    .catch((error) => {;
      MostrarErrorCatch();
      });
}

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

            <button class="btn-editar me-1" style="background: none; border: none;" onclick="MostrarModalEditar(${element.id})" data-tippy-content="Editar">
              <i class="bi bi-pencil-square icono-editar"></i>
            </button>

          <div class="fw-bold text-truncate" style="max-width: 200px;" title="${element.nombre || 'Sin nombre'}">
            ${element.nombre || 'Sin nombre'}
          </div>
          </div>

          <div class="flex-grow-1 text-center text-muted" style="opacity: 0.7;">
            <span style="margin-right: 5px;">&bull;</span>
            Comienza el ${fecha} a las ${hora}
          </div>

          <div class="d-flex align-items-center" style="gap: 20px;">
            <div class="badge ${claseModalidad}" title="${modalidadNombre}">
              ${modalidadNombre}
            </div>

            <button class="btn-ver-asistencias icono-asistencia" style="background: none; border: none;" data-tippy-content="Ver Asistencias">
              <i class="bi-calendar-check"></i>
            </button>

            <button class="btn-ver-certificados icono-certificado" style="background: none; border: none;" data-tippy-content="Ver Certificados">
              <i class="bi-award"></i>
            </button>

            <button class="btn-ver-descripcion" style="background: none; border: none;" data-tippy-content="Detalle">
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
                    ${element.descripcion ?? "Sin descripción"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `);

      const asistenciaDetalle = $(`
        <div class="panelAsistencias collapse px-3 pb-2" style="display: none;">
          <div class="mb-3">
            <h3 class="titulo-sub-seccion">Asistencia de Cursos</h3>
          </div>
          <hr style="margin-bottom: 1rem;" />
          <div class="asistencias-panel mt-3">
            <button class="btn btn-agregar-asistencia mb-2 crearAsistencias" data-curso-id="${element.id}">
              <span>Registrar Asistencia</span>
            </button>
            <div class="table-responsive">
              <table class="table table-bordered">
                <colgroup>
                  <col style="width: 5%" />
                  <col style="width: 38%" />
                  <col style="width: 15%" />
                  <col style="width: 22%" />
                  <col style="width: 10%" />
                </colgroup>
                <thead>
                  <tr>
                    <th class="text-start header-table">Asistió</th>
                    <th class="text-start header-table">Empleado</th>
                    <th class="text-center header-table">Fecha</th>
                    <th class="text-center header-table">Resultado</th>
                    <th class="text-center header-table">Acciones</th>
                  </tr>
                </thead>
                <tbody class="tabla-asistencias-body" data-curso-id="${element.id}">
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `);

      const certificadoetalle = $(`
        <div class="panelCertificados collapse px-3 pb-2" style="display: none;">
          <div class="mb-3">
            <h3 class="titulo-sub-seccion">Certificados</h3>
          </div>
          <hr style="margin-bottom: 1rem;" />
          <div class="certificados-panel mt-3">
            <button class="btn btn-agregar-certificado mb-2 crearCertificado" data-curso-id="${element.id}">
              <span>Carga de Certificados</span>
            </button>
            <div class="table-responsive">
              <table class="table table-bordered">
                <colgroup>
                  <col style="width: 42%" />
                  <col style="width: 14%" />
                  <col style="width: 34%" />
                  <col style="width: 10%" />
                </colgroup>
                <thead>
                  <tr>
                    <th class="text-start header-table">Empleado</th>
                    <th class="text-center header-table">Fecha de Emisión</th>
                    <th class="text-center header-table">Documento Descargable</th>
                    <th class="text-center header-table">Acciones</th>
                  </tr>
                </thead>
                <tbody class="tabla-certificados-body" data-curso-id="${element.id}">
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `);

      // Mostrar descripción
      item.find(".btn-ver-descripcion").on("click", function () {
        descripcionDetalle.slideToggle(200, function () {
          descripcionDetalle.toggleClass("mostrar", descripcionDetalle.is(":visible"));
        });

        if (asistenciaDetalle.is(":visible")) {
          asistenciaDetalle.slideUp(200).removeClass("mostrar");
        }else if (certificadoetalle.is(":visible")) {
          certificadoetalle.slideUp(200).removeClass("mostrar");
        }

        const icono = $(this).find("i");
        icono.toggleClass("bi-chevron-down bi-chevron-up");
      });

      // Mostrar asistencias
      item.find(".btn-ver-asistencias").on("click", function () {
        asistenciaDetalle.slideToggle(200, function () {
          asistenciaDetalle.toggleClass("mostrar", asistenciaDetalle.is(":visible"));
        });

        if (descripcionDetalle.is(":visible")) {
          descripcionDetalle.slideUp(200).removeClass("mostrar");
        }else if (certificadoetalle.is(":visible")) {
          certificadoetalle.slideUp(200).removeClass("mostrar");
        }
      });

      // Mostrar cerificados
      item.find(".btn-ver-certificados").on("click", function () {
        certificadoetalle.slideToggle(200, function () {
          certificadoetalle.toggleClass("mostrar", certificadoetalle.is(":visible"));
        });

        if (asistenciaDetalle.is(":visible")) {
          asistenciaDetalle.slideUp(200).removeClass("mostrar");
        }else if (descripcionDetalle.is(":visible")) {
          descripcionDetalle.slideUp(200).removeClass("mostrar");
        }
      });

      contenedor.append(item);
      contenedor.append(descripcionDetalle);
      contenedor.append(asistenciaDetalle);
      contenedor.append(certificadoetalle);

      ObtenerAsistencia(element.id);
      ObtenerCertificados(element.id);
    });
  }

  // Tooltip
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

// Validación en vivo: cambia el color mientras el usuario escribe
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
          title: "¡Curso Creado!",
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
    .catch((error) => {;
      MostrarErrorCatch();
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
          title: "¡Curso Modificado!",
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
    .catch((error) => {;
      MostrarErrorCatch();
      });
}
ObtenerCursos();









//FUNCIONES PARA LAS ASISTENCIAS
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
    .catch((error) => {;
      MostrarErrorCatch();
      });
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
    const resultado = Number(item.resultado);
    let etiqueta = "Aprobado";
    let badgeClass = "badge-aprobado";

    if (resultado >= 6) {
      etiqueta = "Aprobado";
      badgeClass = "badge-aprobado";
    } else {
      etiqueta = "Desaprobado";
      badgeClass = "badge-desaprobado";
    } 
    tablaBody.append(`
      <tr>
        <td class='text-center align-middle'>
          <input type="checkbox" class="checkbox-asistio" data-id="${item.id}" ${item.asistencia? "checked" : ""} />
        </td>
        <td class='align-middle nombre-empleado' title='${item.empleado.nombreCompleto}'>
          ${item.empleado.nombreCompleto}
        </td>
        <td class='align-middle'>${new Date(item.fecha).toLocaleDateString()}</td>
        <td class='align-middle'>
        <span class="badge-pill ${badgeClass}" style="padding: 4px 12px; text-aling: center;">${etiqueta}</span>
        </td>
        <td class='d-flex justify-content-center align-items-center'>
          <button class='btn-eliminar' style='background: none; border: none;' 
            onclick='EliminarAsistencia(${item.id})' data-tippy-content='Eliminar'>
            <i class='bi bi-trash3 icono-elimina-detalle'></i>
          </button>
        </td>
      </tr>
    `);
  });

  $(".checkbox-asistio").off("change").on("change", function () {
  const asistenciaId = $(this).data("id");
  const nuevoEstado = $(this).is(":checked");
  MarcarAsistencia(asistenciaId, nuevoEstado);
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

function ValidarFormularioAsistencia() {
    const selectEmpleadoId = document.getElementById("EmpleadoId");
    const selectErrorEmpleadoId = document.getElementById("errorEmpleadoId");

    const inputFecha = document.getElementById("FechaAsistencia");
    const inputErrorFecha = document.getElementById("errorFechaAsistencia");

    const inputResultado = document.getElementById("ResultadoAsistencia");
    const inputErrorResultado = document.getElementById("errorResultadoAsistencia");

    const empleadoId = selectEmpleadoId.value;
    const fecha = inputFecha.value;;
    const resultado = parseInt(inputResultado.value);

    //Limpiar errores previos
    selectErrorEmpleadoId.style.display = "none";
    selectErrorEmpleadoId.textContent = "";
    selectEmpleadoId.classList.remove("is-invalid", "is-valid");
    inputErrorFecha.style.display = "none";
    inputErrorFecha.textContent = "";
    inputFecha.classList.remove("is-invalid", "is-valid");
    inputErrorResultado.style.display = "none";
    inputErrorResultado.textContent = "";
    inputResultado.classList.remove("is-invalid", "is-valid");

    let esValid = true;

    if(empleadoId === ""){
        selectEmpleadoId.classList.add("is-invalid");
        selectErrorEmpleadoId.style.display = "block";
        selectErrorEmpleadoId.textContent = "Seleccione un empleado.";
        esValid = false;
    }

    //Validar fecha
    if (fecha.length === 0) {
      inputFecha.classList.add("is-invalid");
      inputErrorFecha.style.display = "block";
      inputErrorFecha.textContent = "Seleccione una fecha.";
      esValid = false;
    }
    // Validar resultado 
    if (isNaN(resultado)) {
      inputResultado.classList.add("is-invalid");
      inputErrorResultado.style.display = "block";
      inputErrorResultado.textContent = "Ingrese un resultado.";
      esValid = false;
    }else if (resultado < 0 || resultado > 10) {
      inputResultado.classList.add("is-invalid");
      inputErrorResultado.style.display = "block";
      inputErrorResultado.textContent = "Resultado debe estar entre 0 y 10.";
      esValid = false;
    }else {
      inputResultado.classList.add("is-valid");
    }
    return esValid;
}
document.getElementById("EmpleadoId").addEventListener("input", () => {
    const inputEmpleado = document.getElementById("EmpleadoId");
    const errorEmpleadoId = document.getElementById("errorEmpleadoId");
    const empleadoId = inputEmpleado.value;

    // Limpiar cualquier estado previo
    inputEmpleado.classList.remove("is-invalid", "is-valid");

    let esValid = true;

    if(empleadoId === ""){
      inputEmpleado.classList.add("is-invalid");
      errorEmpleadoId.style.display = "block";
      errorEmpleadoId.textContent = "Seleccione un empleado.";
      esValid = false;
    } else {
      inputEmpleado.classList.add("is-valid");
      errorEmpleadoId.style.display = "none";
      errorEmpleadoId.textContent = "";
    }
    return esValid;
});

function LimpiarModalAsistencias() {
    //Limpiar el formulario
    document.getElementById("IdAsistencia").value = "";
    const inputEmpleado = document.getElementById("EmpleadoId");
    inputEmpleado.value = "";
    const inputFechaAsistencia = document.getElementById("FechaAsistencia");
    inputFechaAsistencia.value = "";
    const inputResultadoAsistencia = document.getElementById("ResultadoAsistencia");
    inputResultadoAsistencia.value = "";

    //Limpia las validaciones
    inputEmpleado.classList.remove("is-invalid", "is-valid");
    inputFechaAsistencia.classList.remove("is-invalid", "is-valid");
    inputResultadoAsistencia.classList.remove("is-invalid", "is-valid");

    //Limpiar los mensajes de error
    const inputErrorEmpleado = document.getElementById("errorEmpleadoId");
    inputErrorEmpleado.textContent = "";
    inputErrorEmpleado.style.display = "none";
    const inputErrorFecha = document.getElementById("errorFechaAsistencia");
    inputErrorFecha.textContent = "";
    inputErrorFecha.style.display = "none";
    const inputErrorResultado = document.getElementById("errorResultadoAsistencia");
    inputErrorResultado.textContent = "";
    inputErrorResultado.style.display = "none";
}

function ValidarAsistenciaExistente(mensaje) {
  const errorEmpleadoId = document.getElementById("errorEmpleadoId");
  const inputEmpleadoId = document.getElementById("EmpleadoId");
  const errorFechaAsistencia = document.getElementById("errorFechaAsistencia");
  const inputFechaAsistencia = document.getElementById("FechaAsistencia");

  errorFechaAsistencia.textContent = mensaje;
  errorFechaAsistencia.style.display = "block";
  inputFechaAsistencia.classList.add("is-invalid");

  errorEmpleadoId.textContent = mensaje;
  errorEmpleadoId.style.display = "block";
  inputEmpleadoId.classList.add("is-invalid");
}

async function CrearAsistencia() {
  if(!ValidarFormularioAsistencia()){
    return;
  }

const asistencia = {
  asistencia: false,
  empleadoId: parseInt(document.getElementById("EmpleadoId").value),
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
        ValidarAsistenciaExistente(response.mensaje);
      } else {
        ObtenerAsistencia(cursoIdSeleccionado); 
                cerrarPanelAsistencias();
       
        Swal.fire({
          title: "¡Asistencia Creada!",
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
    .catch((error) => {;
      MostrarErrorCatch();
      });
}
function EliminarAsistencia(id) {
    Swal.fire({
    title: "¿Desea eliminar esta asistencia?",
    html: `
      <div class="text-center">
        <p>Esta asistencia será eliminada de forma definitiva. ¿Desea continuar?</p>
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
            EliminarSiAsistencia(id);
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

async function EliminarSiAsistencia(id) {
    const res = await authFetch(`AsistenciasCapacitacion/${id}`, {
      method: 'DELETE',
    })
      if (!res.ok) {
        throw new Error("No se pudo eliminar la asistencia");
      }
    await ObtenerAsistencia(cursoIdSeleccionado);

        Swal.fire({
        title: "¡Asistencia Eliminada!",
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
      })
      .catch((error) => {;
        MostrarErrorCatch();
        });
}

async function MarcarAsistencia(id, nuevoEstado)  {
    const res = await authFetch(`AsistenciasCapacitacion/CambiarEstado/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nuevoEstado)
    })
    .then(() => {
      if(nuevoEstado){
        ObtenerAsistencia(cursoIdSeleccionado);
        Swal.fire({
          title: "¡Asistio Empleado!",
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 1500,
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
      //Si marca y luego desmarca
      else {
        ObtenerAsistencia(cursoIdSeleccionado);
          Swal.fire({
          title: "¡No Asistio Empleado!",
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 1500,
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
    .catch((error) => {;
      MostrarErrorCatch();
      });
}

ObtenerAsistencia(cursoIdSeleccionado);



//FUNCIONES PARA LOS CERTIFICADOS
//Funcion para obtener los certificados
async function ObtenerCertificados(cursoId) {
  const res = await authFetch("Certificados", {
    method: "GET",
  })
    .then(response => response.json())
    .then(data => {
      // Filtrar cursos por certificados
      const cursosFiltrados = data.filter(c => c.cursoId === cursoId);
      MostrarCertificados(cursoId, cursosFiltrados);
    })
    .catch((error) => {;
      MostrarErrorCatch();
      });
}

function MostrarCertificados(cursoId, data) {
  const tablaBody = $(`.tabla-certificados-body[data-curso-id="${cursoId}"]`);
  if (!tablaBody.length) return;

  tablaBody.empty();

  if (data.length === 0) {
    tablaBody.append(
      "<tr><td colspan='5' class='text-center text-muted'>No hay certificados para mostrar.</td></tr>"
    );
    return;
  }

  const baseUrlArchivos = "/uploads/documentos/";
  $.each(data, function (index, item) {
    let documentoUrl = "";
    if (item.documentoDescargable) {
      documentoUrl = item.documentoDescargable.startsWith("http")
        ? item.documentoDescargable
        : baseUrlArchivos + item.documentoDescargable;
    }

    const documentoHtml = item.documentoDescargable
    ? `
    <p class="d-flex justify-content-center text-muted d-flex align-items-center gap-2 mb-2">
      <a href="${documentoUrl}" target="_blank" download class="document-link d-flex align-items-center gap-1" data-tippy-content="Descargar" style="color: inherit; text-decoration: none; font-size: 0.9rem;">
        <i class="bi bi-file-earmark-text" style="font-size: 1rem;"></i>
        <span>Descargar</span>
      </a>
    </p>
    `
    : "";

    tablaBody.append(`
      <tr>
        <td class='align-middle nombre-empleado' title='${item.empleado.nombreCompleto}'>
          ${item.empleado.nombreCompleto}
        </td>
        <td class='align-middle text-center'>${new Date(item.fechaEmision).toLocaleDateString()}</td>
        <td class='align-middle text-center' style="font-size: 0.8rem;">${documentoHtml}</td>
        <td class='d-flex justify-content-center align-items-center'>
          <button class='btn-eliminar' style='background: none; border: none;' 
            onclick='EliminarCertificado(${item.id})' data-tippy-content='Eliminar'>
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

function BuscarCertificadoId() {
  const id = parseInt(document.getElementById("IdCertificado").value);

  if (!id || id === 0) {
    CrearCertificado();
  } else {
    EditarCertificado(id);
  }
}

function LimpiarModalCertificado() {
    //Limpiar el formulario
    document.getElementById("IdCertificado").value = "";
    const inputEmpleado = document.getElementById("EmpleadoIdCertificado");
    inputEmpleado.value = "";
    const inputDocumento = document.getElementById("DocumentoDescargable");
    inputDocumento.value = "";

    //Limpia las validaciones
    inputEmpleado.classList.remove("is-invalid", "is-valid");
    inputDocumento.classList.remove("is-invalid", "is-valid");

    //Limpiar los mensajes de error
    const inputErrorEmpleado = document.getElementById("errorEmpleadoIdCertificado");
    inputErrorEmpleado.textContent = "";
    inputErrorEmpleado.style.display = "none";
    const inputErrorDocumento = document.getElementById("errorDocumentoDescargable");
    inputErrorDocumento.textContent = "";
    inputErrorDocumento.style.display = "none";
}


function ValidarFormularioCertificado() {
    const selectEmpleadoId = document.getElementById("EmpleadoIdCertificado");
    const selectErrorEmpleadoId = document.getElementById("errorEmpleadoIdCertificado");

    const inputDocumento = document.getElementById("DocumentoDescargable");
    const inputErrorDocumento = document.getElementById("errorDocumentoDescargable");

    const empleadoId = selectEmpleadoId.value;
    const documento = inputDocumento.value;

    //Limpiar errores previos
    selectErrorEmpleadoId.style.display = "none";
    selectErrorEmpleadoId.textContent = "";
    selectEmpleadoId.classList.remove("is-invalid", "is-valid");
    inputErrorDocumento.style.display = "none";
    inputErrorDocumento.textContent = "";
    inputDocumento.classList.remove("is-invalid", "is-valid");

    let esValid = true;

    if(empleadoId === ""){
        selectEmpleadoId.classList.add("is-invalid");
        selectErrorEmpleadoId.style.display = "block";
        selectErrorEmpleadoId.textContent = "Seleccione un empleado.";
        esValid = false;
    }
    // Validar resultado 
    if (documento.length === 0) {
      inputDocumento.classList.add("is-invalid");
      inputErrorDocumento.style.display = "block";
      inputErrorDocumento.textContent = "Seleccione un documento.";
      esValid = false;
    }
    return esValid;
}


function ValidarCertificadoExistente(mensaje) {
  const errorEmpleadoId = document.getElementById("errorEmpleadoIdCertificado");
  const inputEmpleadoId = document.getElementById("EmpleadoIdCertificado");

  errorEmpleadoId.textContent = mensaje;
  errorEmpleadoId.style.display = "block";
  inputEmpleadoId.classList.add("is-invalid");
}

async function CrearCertificado() {
  if(!ValidarFormularioCertificado()){
    return;
  }

    const certificado = {
      cursoId: cursoIdSeleccionado,
      empleadoId: parseInt(document.getElementById("EmpleadoIdCertificado").value),
      documentoDescargable: document.getElementById("DocumentoDescargable").value || "",
    };
    console.log(certificado);
    const res = await authFetch("Certificados", {
      method: 'POST',
      body: JSON.stringify(certificado),
    })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        ValidarCertificadoExistente(response.mensaje);
      } else {
        ObtenerCertificados(cursoIdSeleccionado); 
        cerrarPanelCertificados();
       
        Swal.fire({
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "¡Certificado Creado!",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#f0f0f0",
          color: "#000",
        });
      }
    });
}

function EliminarCertificado(id) {
    Swal.fire({
    title: "¿Desea eliminar este certificado?",
    html: `
      <div class="text-center">
        <p>Este certificado será eliminado de forma definitiva. ¿Desea continuar?</p>
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
            EliminarSiCertificado(id);
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

async function EliminarSiCertificado(id) {
    const res = await authFetch(`Certificados/${id}`, {
      method: 'DELETE',
    })
      if (!res.ok) {
        throw new Error("No se pudo eliminar el certificado");
      }
    await ObtenerCertificados(cursoIdSeleccionado);

        Swal.fire({
        title: "¡Certificado Eliminado!",
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
      })
      .catch((error) => {;
        MostrarErrorCatch();
        });
}
ObtenerCertificados(cursoIdSeleccionado);

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

