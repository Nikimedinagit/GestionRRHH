//////////////////////////////////////////////////////////////////////////////////////
// DEFINIMOS VARIABLES PARA USAR EN LOS EVENTOS DE LOS BOTONES DE LAS VISTAS
//////////////////////////////////////////////////////////////////////////////////////
var cursoIdSeleccionado;

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA ABRIR PANEL DE CURSOS  /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
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

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA CERRAR PANEL DE CURSOS  /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function cerrarPanelCursos() {
  document.getElementById("panelCursos").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalCursos();
}

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA ABRIR PANEL DE ASISTENCIAS  /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
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
  abrirPanelAsistencias();
});

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA CERRAR PANEL DE ASISTENCIAS  /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function cerrarPanelAsistencias() {
  document.getElementById("panelAsistencias").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalAsistencias();
}

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA ABRIR PANEL DE CERTIFICADOS  /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
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
  abrirPanelCertificados();
});

///////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA CERRRAR EL PANEL DE FORMULARIO DE CERTIFICADOS
///////////////////////////////////////////////////////////////////////////////////////////////////
function cerrarPanelCertificados() {
  document.getElementById("panelCertificados").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");
  LimpiarModalCertificado();
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR LOS ONCHANGES DE LOS FILTROS ///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
  $("#NombreCursoBuscar, #ModalidadBuscar, #FechaCursoBuscar").on(
    "input",
    function () {
      ObtenerCursos();
    }
  );
});

///////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIONES PARA OBTENER LOS CURSOS ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerCursos(mostrarSpinner = true) {

  if (mostrarSpinner) mostrarPantallaCarga();

  let nombreCurso = document.getElementById("NombreCursoBuscar").value;
  let modalidadCurso = document.getElementById("ModalidadBuscar").value;
  let modalidad =
    modalidadCurso !== "0" && modalidadCurso !== "" ? modalidadCurso : null;
  let fecha = document.getElementById("FechaCursoBuscar").value;

  const filtro = {
    nombreCurso: nombreCurso,
    modalidad: modalidad,
    fecha: fecha ? fecha : null,
  };
  const res = await authFetch("Cursos/Filtrar", {
    method: "POST",
    body: JSON.stringify(filtro),
  })
    .then((response) => response.json())
    .then((data) => {
      MostrarCursos(data);
      LimpiarModalCursos();
      cerrarPanelCursos();
      btenerTotalCursos();
    })
    .catch((error) => {
      MostrarErrorCatch();
    })

    .finally(() => { if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1500); } });
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIONES PARA MOSTRAR LOS CURSOS ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarCursos(data) {
  if (window.innerWidth <= 880) {
    MostrarCursosMobile(data);
  } else {
    MostrarCursosDesktop(data);
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIONES PARA MOSTRAR LOS CURSOS DESKTOP /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarCursosDesktop(data) {
  const contenedor = $("#contenedorCursos");
  contenedor.empty();

  const rol = getRol()?.toUpperCase();

  if (data.length === 0) {
    contenedor.append(
      "<div class='text-center text-muted py-3'>No hay cursos para mostrar.</div>"
    );
    return;
  }

  const modalidades = { 1: "PRESENCIAL", 2: "VIRTUAL", 3: "MIXTO" };
  const modalidadColor = {
    PRESENCIAL: "badge-presencial",
    VIRTUAL: "badge-virtual",
    MIXTO: "badge-mixto",
  };

  data.forEach((element) => {
    const fechaIni = new Date(element.fechaInicio);
    const fechaFin = new Date(element.fechaFinalizacion);

    const fechaInicioFormateada =
      fechaIni.toLocaleDateString("es-AR") +
      " " +
      fechaIni.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const fechaFinalizacionFormateada =
      fechaFin.toLocaleDateString("es-AR") +
      " " +
      fechaFin.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const modalidadNombre = modalidades[element.modalidad] || "Desconocida";

    if (rol === "ADMINISTRADOR" || rol === "RRHH") {
      let botonesAccion = `
        <button class="btn-ver-asistencias icono-asistencia" style="background: none; border: none;" data-tippy-content="Ver Asistencias">
          <i class="bi-calendar-check"></i>
        </button>
        <button class="btn-ver-certificados icono-certificado" style="background: none; border: none;" data-tippy-content="Ver Certificados">
          <i class="bi-award"></i>
        </button>
        <button class="btn-ver-descripcion" style="background: none; border: none;" data-tippy-content="Detalle">
          <i class="bi bi-chevron-down"></i>
        </button>
      `;

      let botonEditar = "";
      if (!element.finalizado) {
        botonEditar = `
          <div class="me-2">
            <button class="btn-editar" style="background: none; border: none;" onclick="MostrarModalEditar(${element.id})" data-tippy-content="Editar">
              <i class="bi bi-pencil-square icono-editar"></i>
            </button>
          </div>
        `;
      }

      const item = $(`
        <div class="curso-item border rounded py-2 px-3 mb-2 d-flex align-items-start justify-content-between" data-curso-id="${element.id
        }">
          <div class="d-flex align-items-start" style="gap: 10px; flex-grow: 1; min-width: 0;">
            ${botonEditar}
            <div class="d-flex flex-column" style="min-width: 0;">
              <div class="fw-bold" title="${element.nombre || "Sin nombre"
        }" style="white-space: normal; word-break: break-word;">
                ${element.nombre || "Sin nombre"}
              </div>
              <div class="text-muted small" style="opacity: 0.9; font-size: 0.80rem;"">
                ${fechaInicioFormateada} || ${fechaFinalizacionFormateada}
              </div>
            </div>
          </div>
          <div class="d-flex align-items-center" style="gap: 20px;">
            <div class="badge ${modalidadColor[modalidadNombre]
        }" title="${modalidadNombre}">${modalidadNombre}</div>
            <div class="d-flex align-items-center" style="gap: 10px;">
              ${botonesAccion}
            </div>
          </div>
        </div>
      `);

      const descripcionDetalle = $(`
        <div class="panelCriterios px-3 pb-2" style="display: none;">
          <div class="mb-3">
            <h3 class="titulo-sub-seccion">${element.nombre}</h3>
          </div>
          <hr style="margin-bottom: 1rem;" />
          <div class="table-responsive">
            <table class="table table-bordered">
              <tbody>
                <tr>
                 <td id="DescripcionCurso_${element.id}" class="text-wrap">
                    ${element.descripcion ?? "Sin descripción"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `);

      const certificadoDetalle = $(`
        <div class="panelCertificados px-3 pb-2" style="display: none;">
          <div class="mb-3">
            <h3 class="titulo-sub-seccion">Certificados</h3>
          </div>
          <hr style="margin-bottom: 1rem;" />
          <div class="certificados-panel mt-3">
            <button class="btn btn-agregar-asistencia mb-2 crearCertificado" data-curso-id="${element.id}">
              <span>Cargar Certificados</span>
            </button>
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th class="text-start header-table">Empleado</th>
                    <th class="text-center header-table">Documento Descargable</th>
                    <th class="text-center header-table">Acciones</th>
                  </tr>
                </thead>
                <tbody class="tabla-certificados-body" data-curso-id="${element.id}"></tbody>
              </table>
            </div>
          </div>
        </div>
      `);

      const asistenciaDetalle = $(`
        <div class="panelAsistencias px-3 pb-2" style="display: none;">
          <div class="mb-3">
            <h3 class="titulo-sub-seccion">Asistencia de Curso</h3>
          </div>
          <hr style="margin-bottom: 1rem;" />
          <div class="asistencias-panel mt-3">
            <button class="btn btn-agregar-asistencia mb-2 crearAsistencias" data-curso-id="${element.id}">
              <span>Registrar Asistencia</span>
            </button>
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th class="text-center header-table">Asistió</th>
                    <th class="text-start header-table">Empleado</th>
                    <th class="text-center header-table">Resultado</th>
                    <th class="text-center header-table">Acciones</th>
                  </tr>
                </thead>
                <tbody class="tabla-asistencias-body" data-curso-id="${element.id}"></tbody>
              </table>
            </div>
          </div>
        </div>
      `);

      function togglePanel(item, panel, btn, tipo = "descripcion") {
        btn.on("click", function (e) {
          e.stopPropagation();

          $(".panelCriterios, .panelCertificados, .panelAsistencias")
            .not(panel)
            .slideUp(200)
            .removeClass("mostrar");

          if (tipo === "descripcion") {
            $(".btn-ver-descripcion i")
              .not(btn.find("i"))
              .removeClass("bi-chevron-up")
              .addClass("bi-chevron-down");
          }

          panel.slideToggle(200, function () {
            panel.toggleClass("mostrar", panel.is(":visible"));
          });

          if (tipo === "descripcion") {
            const icono = btn.find("i");
            if (
              icono.hasClass("bi-chevron-down") ||
              icono.hasClass("bi-chevron-up")
            ) {
              icono.toggleClass("bi-chevron-down bi-chevron-up");
            }
          }
        });
      }

      togglePanel(
        item,
        descripcionDetalle,
        item.find(".btn-ver-descripcion"),
        "descripcion"
      );
      togglePanel(
        item,
        certificadoDetalle,
        item.find(".btn-ver-certificados"),
        "fijo"
      );
      togglePanel(
        item,
        asistenciaDetalle,
        item.find(".btn-ver-asistencias"),
        "fijo"
      );

      contenedor.append(
        item,
        descripcionDetalle,
        certificadoDetalle,
        asistenciaDetalle
      );

      ObtenerAsistencia(element.id);
      ObtenerCertificados(element.id);
    } else if (rol === "SUPERVISOR" || rol === "EMPLEADO") {
      const resultado = parseFloat(element.resultado);
      const aprobado = !isNaN(resultado) && resultado >= 6;
      const badgeClass = aprobado ? "badge-aprobado" : "badge-desaprobado";
      const borderColor = aprobado
        ? "border-bottom: 3px solid #28a745;"
        : "border-bottom: 3px solid #dc3545;";

      const descripcionCorta = element.descripcion
        ? element.descripcion.length > 100
          ? element.descripcion.substring(0, 100) + "..."
          : element.descripcion
        : "Sin descripción";

      const fechaIni = new Date(element.fechaInicio).toLocaleDateString(
        "es-AR",
        { day: "2-digit", month: "2-digit", year: "numeric" }
      );
      const fechaFin = new Date(element.fechaFinalizacion).toLocaleDateString(
        "es-AR",
        { day: "2-digit", month: "2-digit", year: "numeric" }
      );

      const botonDescargar =
        aprobado && element.certificadoId
          ? `
        <p class="text-muted d-flex align-items-center gap-2 mb-2">
            <button onclick="DescargarDocumento(${element.certificadoId})" 
                    class="document-link d-flex align-items-center gap-1" 
                    data-tippy-content="Descargar" 
                    style="color: inherit; text-decoration: none; font-size: 0.9rem; border:none; background:none; cursor:pointer;">
                <i class="bi bi-file-earmark-text" style="font-size: 1rem;"></i>
                <span>Descargar</span>
            </button>
        </p>
        `
          : "Certificado no disponible";

      const card = $(`
          <div class="col-12 col-md-6 mb-3 px-0 px-md-2">
              <div class="card shadow-sm rounded-3 p-3 h-100" style="${borderColor}">
                  <h5 class="fw-bold mb-2" title="${element.nombre || "Sin nombre"
        }">${element.nombre || "Sin nombre"}</h5>
                  <p class="text-muted mb-2" style="font-size: 0.9rem;">${descripcionCorta}</p>

                  <!-- Contenedor modalidad + fecha -->
                  <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2">
                      <span class="badge ${modalidadColor[modalidadNombre]
        } mb-1 mb-md-0">${modalidadNombre}</span>
                      <span class="text-muted" style="font-size: 0.95rem;">${fechaIni} - ${fechaFin}</span>
                  </div>

                  <div class="d-flex justify-content-between align-items-center mt-3">
                      <span class="badge-pill ${badgeClass}" style="padding: 4px 12px;">${aprobado ? "Aprobado" : "Desaprobado"
        }</span>
                      ${botonDescargar}
                  </div>
              </div>
          </div>
      `);

      contenedor.append(card);
    }
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIONES PARA MOSTRAR LOS CURSOS MOBILE /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarCursosMobile(data) {
  const contenedor = document.getElementById("contenedorCursos");
  contenedor.innerHTML = "";

  const rol = getRol()?.toUpperCase();

  if (!Array.isArray(data) || data.length === 0) {
    contenedor.innerHTML =
      "<div class='text-center text-muted py-3'>No hay cursos para mostrar.</div>";
    return;
  }

  const modalidades = { 1: "PRESENCIAL", 2: "VIRTUAL", 3: "MIXTO" };
  const modalidadColor = {
    PRESENCIAL: "badge-presencial",
    VIRTUAL: "badge-virtual",
    MIXTO: "badge-mixto",
  };

  data.forEach((element) => {
    const modalidadNombre = modalidades[element.modalidad] || "SIN MODALIDAD";
    const claseModalidad =
      modalidadColor[modalidadNombre] || "bg-light text-dark";

    const fechaInicio = element.fechaInicio
      ? new Date(element.fechaInicio)
      : null;
    const fechaFin = element.fechaFinalizacion
      ? new Date(element.fechaFinalizacion)
      : null;

    const fechaInicioStr = fechaInicio
      ? fechaInicio.toLocaleDateString("es-AR")
      : "Sin fecha";
    const fechaFinStr = fechaFin
      ? fechaFin.toLocaleDateString("es-AR")
      : "Sin fecha";

    if (rol === "ADMINISTRADOR" || rol === "RRHH") {
      let botonesIzquierda = `
        <button class="btn-ver-asistencias icono-asistencia-mobile" style="background:none;border:none;" data-tippy-content="Ver Asistencias">
          <i class="bi-calendar-check"></i>
        </button>
        <button class="btn-ver-certificados icono-certificado-mobile" style="background:none;border:none;" data-tippy-content="Ver Certificados">
          <i class="bi-award"></i>
        </button>
      `;
      let botonesDerecha = `
        <button class="btn-editar me-1" style="background:none;border:none;" onclick="MostrarModalEditar(${element.id})" data-tippy-content="Editar">
          <i class="bi bi-pencil-square icono-editar"></i>
        </button>
        <button class="btn-ver-descripcion" style="background:none;border:none;" data-tippy-content="Detalle">
          <i class="bi bi-chevron-down"></i>
        </button>
      `;

      const card = document.createElement("div");
      card.className =
        "col-12 col-md-6 p-2 col-lg-4 col-xl-3 d-flex flex-column";
      card.innerHTML = `
        <div class="card shadow-sm p-2 rounded-3 d-flex flex-column w-100" style="min-height: 210px;">
          <div class="flex-grow-1 d-flex flex-column">
            <h5 class="text-start fw-bold mb-2" style="font-size: 1.2rem;">${element.nombre || "Sin nombre"
        }</h5>
            <small class="text-muted mb-1" style="font-size: 0.90rem;">
              <i class="bx bx-calendar me-1"></i>${fechaInicioStr} — ${fechaFinStr}
            </small>
            <span class="badge ${claseModalidad} my-2" style="width: fit-content; font-size: 1rem;">${modalidadNombre}</span>
          </div>
          <div class="d-flex justify-content-between mt-2 align-items-center">
            <div>${botonesIzquierda}</div>
            <div>${botonesDerecha}</div>
          </div>
        </div>
      `;

      const descripcionDetalle = $(` 
        <div class="panelDescripcionCurso px-3 pb-2" style="display: none;">
          <div class="mb-3">
            <h3 class="titulo-sub-seccion">${element.nombre}</h3>
          </div>
          <hr style="margin-bottom: 1rem;" />
          <div class="table-responsive">
            <table class="table table-bordered">
              <tbody>
                <tr>
                  <td id="DescripcionCurso_${element.id
        }" style="white-space: normal; word-wrap: break-word;">
                    ${element.descripcion ?? "Sin descripción"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `);

      $(card)
        .find(".btn-ver-descripcion")
        .on("click", function () {
          $(".panelDescripcionCurso:visible")
            .not(descripcionDetalle)
            .slideUp(200);
          descripcionDetalle.slideToggle(200);

          const icono = $(this).find("i");
          $(".btn-ver-descripcion i")
            .not(icono)
            .removeClass("bi-chevron-up")
            .addClass("bi-chevron-down");
          icono.toggleClass("bi-chevron-down bi-chevron-up");
        });

      $(card)
        .find(".btn-ver-certificados")
        .on("click", function () {
          cursoIdSeleccionado = element.id;
          ObtenerCertificados(element.id);

          const offcanvasAsist = bootstrap.Offcanvas.getInstance(
            document.getElementById("offcanvasAsistencias")
          );
          if (offcanvasAsist) offcanvasAsist.hide();

          const offcanvas = new bootstrap.Offcanvas(
            document.getElementById("offcanvasCertificados")
          );
          offcanvas.show();
        });

      $(card)
        .find(".btn-ver-asistencias")
        .on("click", function () {
          cursoIdSeleccionado = element.id;
          ObtenerAsistencia(element.id);

          const offcanvasCert = bootstrap.Offcanvas.getInstance(
            document.getElementById("offcanvasCertificados")
          );
          if (offcanvasCert) offcanvasCert.hide();

          const offcanvas = new bootstrap.Offcanvas(
            document.getElementById("offcanvasAsistencias")
          );
          offcanvas.show();
        });

      contenedor.appendChild(card);
      contenedor.appendChild(descripcionDetalle[0]);
    } else if (rol === "SUPERVISOR" || rol === "EMPLEADO") {
      const resultado = parseFloat(element.resultado);
      const aprobado = !isNaN(resultado) && resultado >= 6;
      const badgeClass = aprobado ? "badge-aprobado" : "badge-desaprobado";
      const borderColor = aprobado
        ? "border-bottom: 3px solid #28a745;"
        : "border-bottom: 3px solid #dc3545;";

      const descripcionCorta = element.descripcion
        ? element.descripcion.length > 100
          ? element.descripcion.substring(0, 100) + "..."
          : element.descripcion
        : "Sin descripción";

      const fechaIni = fechaInicioStr;
      const fechaFin = fechaFinStr;

      const botonDescargar =
        aprobado && element.certificadoId
          ? `
        <p class="text-muted d-flex align-items-center gap-2 mb-2">
            <button onclick="DescargarDocumento(${element.certificadoId})" 
                    class="document-link d-flex align-items-center gap-1" 
                    data-tippy-content="Descargar" 
                    style="color: inherit; text-decoration: none; font-size: 0.9rem; border:none; background:none; cursor:pointer;">
                <i class="bi bi-file-earmark-text" style="font-size: 1rem;"></i>
                <span>Descargar</span>
            </button>
        </p>
        `
          : "";

      const card = $(` 
        <div class="col-12 col-md-6 mb-3 px-0 px-md-2">
          <div class="card shadow-sm rounded-3 p-3 h-100" style="${borderColor}">
            <h5 class="fw-bold mb-2" title="${element.nombre || "Sin nombre"
        }">${element.nombre || "Sin nombre"}</h5>
            <p class="text-muted mb-2" style="font-size: 0.9rem;">${descripcionCorta}</p>
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2">
              <span class="badge ${modalidadColor[modalidadNombre]
        } mb-1 mb-md-0">${modalidadNombre}</span>
              <span class="text-muted" style="font-size: 0.95rem;">${fechaIni} - ${fechaFin}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <span class="badge-pill ${badgeClass}" style="padding: 4px 12px;">${aprobado ? "Aprobado" : "Desaprobado"
        }</span>
              ${botonDescargar}
            </div>
          </div>
        </div>
      `);

      $(contenedor).append(card);
    }
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR EL MODAL DE EDICION DE LA CURSO ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function MostrarModalEditar(id) {
  const res = await authFetch(`Cursos/${id}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("IdCurso").value = data.id;
      document.getElementById("NombreCurso").value = data.nombre;
      document.getElementById("ModalidadCurso").value = data.modalidad;
      document.getElementById("DescripcionCurso").value = data.descripcion;
      document.getElementById("FechaInicioCurso").value = data.fechaInicio;
      document.getElementById("FechaFinCurso").value = data.fechaFinalizacion;

      abrirPanelCursos();
    });
}

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA BUSCAR EL ID DEL CURSO Y LLAMAR A LA FUNCIÓN DE EDICION O CREACIÓN ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function BuscarCursoId() {
  const id = parseInt(document.getElementById("IdCurso").value);

  if (!id || id === 0) {
    CrearCurso();
  } else {
    EditarCurso(id);
  }
}

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA LIMPIAR EL FORMULARIO DE LA CURSO ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function LimpiarModalCursos() {
  document.getElementById("IdCurso").value = "";
  const inputNombre = document.getElementById("NombreCurso");
  inputNombre.value = "";
  const selectModalidad = document.getElementById("ModalidadCurso");
  selectModalidad.value = "";
  const inputDescripcion = document.getElementById("DescripcionCurso");
  inputDescripcion.value = "";
  const inputFechaInicio = document.getElementById("FechaInicioCurso");
  inputFechaInicio.value = "";
  const inputFechaFinalizacion = document.getElementById("FechaFinCurso");
  inputFechaFinalizacion.value = "";

  inputNombre.classList.remove("is-invalid", "is-valid");
  selectModalidad.classList.remove("is-invalid", "is-valid");
  inputDescripcion.classList.remove("is-invalid", "is-valid");
  inputFechaInicio.classList.remove("is-invalid", "is-valid");
  inputFechaFinalizacion.classList.remove("is-invalid", "is-valid");

  const inputErrorNombre = document.getElementById("errorNombreCurso");
  inputErrorNombre.textContent = "";
  inputErrorNombre.style.display = "none";
  const selectErrorModalidad = document.getElementById("errorModalidadCurso");
  selectErrorModalidad.textContent = "";
  selectErrorModalidad.style.display = "none";
  const inputErrorDescripcion = document.getElementById(
    "errorDescripcionCurso"
  );
  inputErrorDescripcion.textContent = "";
  inputErrorDescripcion.style.display = "none";
  const inputErrorFechaInicio = document.getElementById(
    "errorFechaInicioCurso"
  );
  inputErrorFechaInicio.textContent = "";
  inputErrorFechaInicio.style.display = "none";
  const inputErrorFechaFinalizacion =
    document.getElementById("errorFechaFinCurso");
  inputErrorFechaFinalizacion.textContent = "";
  inputErrorFechaFinalizacion.style.display = "none";
}

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA LIMPIAR EL FORMULARIO DE LA CURSO ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function ValidarFormularioCursos() {
  const inputNombre = document.getElementById("NombreCurso");
  const inputErrorNombre = document.getElementById("errorNombreCurso");

  const selectModalidad = document.getElementById("ModalidadCurso");
  const selectErrorModalidad = document.getElementById("errorModalidadCurso");

  const inputDescripcion = document.getElementById("DescripcionCurso");
  const inputErrorDescripcion = document.getElementById(
    "errorDescripcionCurso"
  );

  const inputFechaInicio = document.getElementById("FechaInicioCurso");
  const inputErrorFechaInicio = document.getElementById(
    "errorFechaInicioCurso"
  );

  const inputFechaFinalizacion = document.getElementById("FechaFinCurso");
  const inputErrorFechaFinalizacion =
    document.getElementById("errorFechaFinCurso");

  const esEdicion = !!document.getElementById("IdCurso").value;

  [
    inputNombre,
    selectModalidad,
    inputDescripcion,
    inputFechaInicio,
    inputFechaFinalizacion,
  ].forEach((el) => {
    el.classList.remove("is-invalid", "is-valid");
  });
  [
    inputErrorNombre,
    selectErrorModalidad,
    inputErrorDescripcion,
    inputErrorFechaInicio,
    inputErrorFechaFinalizacion,
  ].forEach((el) => {
    el.style.display = "none";
    el.textContent = "";
  });

  let esValid = true;
  const nombre = inputNombre.value.trim();
  const modalidadSeleccionada = selectModalidad.value;
  const descripcion = inputDescripcion.value.trim();
  const fechaInicio = inputFechaInicio.value;
  const fechaFinalizacion = inputFechaFinalizacion.value;

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

  if (!modalidadSeleccionada) {
    selectModalidad.classList.add("is-invalid");
    selectErrorModalidad.style.display = "block";
    selectErrorModalidad.textContent = "Campo obligatorio.";
    esValid = false;
  } else {
    selectModalidad.classList.add("is-valid");
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

  if (!fechaInicio) {
    inputFechaInicio.classList.add("is-invalid");
    inputErrorFechaInicio.style.display = "block";
    inputErrorFechaInicio.textContent = "Campo obligatorio.";
    esValid = false;
  } else {
    const inicio = new Date(fechaInicio);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (!esEdicion && inicio < hoy) {
      inputFechaInicio.classList.add("is-invalid");
      inputErrorFechaInicio.style.display = "block";
      inputErrorFechaInicio.textContent =
        "La fecha de inicio no puede ser anterior a hoy.";
      esValid = false;
    } else {
      inputFechaInicio.classList.add("is-valid");
    }
  }

  if (!fechaFinalizacion) {
    inputFechaFinalizacion.classList.add("is-invalid");
    inputErrorFechaFinalizacion.style.display = "block";
    inputErrorFechaFinalizacion.textContent = "Campo obligatorio.";
    esValid = false;
  } else if (
    fechaInicio &&
    new Date(fechaFinalizacion) <= new Date(fechaInicio)
  ) {
    inputFechaFinalizacion.classList.add("is-invalid");
    inputErrorFechaFinalizacion.style.display = "block";
    inputErrorFechaFinalizacion.textContent =
      "La fecha de fin debe ser posterior a la fecha de inicio.";
    esValid = false;
  } else {
    inputFechaFinalizacion.classList.add("is-valid");
  }

  return esValid;
}

//////////////////////////////////////////////////////////////////////////////////////
/// VALIDACION EN VIVO: CAMBIA EL COLOR MIENTRAS EL USUARIO ESCRIBE ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
document.getElementById("NombreCurso").addEventListener("input", () => {
  const input = document.getElementById("NombreCurso");
  const error = document.getElementById("errorNombreCurso");
  const value = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");

  if (value.length === 0) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else if (value.length < 3) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Mínimo 3 caracteres.";
  } else {
    input.classList.add("is-valid");
    error.style.display = "none";
    error.textContent = "";
  }
});

document.getElementById("ModalidadCurso").addEventListener("change", () => {
  const select = document.getElementById("ModalidadCurso");
  const error = document.getElementById("errorModalidadCurso");

  select.classList.remove("is-invalid", "is-valid");

  if (!select.value) {
    select.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else {
    select.classList.add("is-valid");
    error.style.display = "none";
    error.textContent = "";
  }
});

document.getElementById("DescripcionCurso").addEventListener("input", () => {
  const input = document.getElementById("DescripcionCurso");
  const error = document.getElementById("errorDescripcionCurso");
  const value = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");

  if (value.length === 0) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else if (value.length < 3) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Mínimo 3 caracteres.";
  } else {
    input.classList.add("is-valid");
    error.style.display = "none";
    error.textContent = "";
  }
});

document.getElementById("FechaInicioCurso").addEventListener("change", () => {
  const inputInicio = document.getElementById("FechaInicioCurso");
  const errorInicio = document.getElementById("errorFechaInicioCurso");
  const value = inputInicio.value;

  inputInicio.classList.remove("is-invalid", "is-valid");
  errorInicio.style.display = "none";
  errorInicio.textContent = "";

  if (!value) {
    inputInicio.classList.add("is-invalid");
    errorInicio.style.display = "block";
    errorInicio.textContent = "Campo obligatorio.";
  } else {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = new Date(value);

    const esEdicion = !!document.getElementById("IdCurso").value;
    if (!esEdicion && inicio < hoy) {
      inputInicio.classList.add("is-invalid");
      errorInicio.style.display = "block";
      errorInicio.textContent =
        "La fecha de inicio no puede ser anterior a hoy.";
    } else {
      inputInicio.classList.add("is-valid");
    }
  }
});

document.getElementById("FechaFinCurso").addEventListener("change", () => {
  const inputInicio = document.getElementById("FechaInicioCurso");
  const inputFin = document.getElementById("FechaFinCurso");
  const errorFin = document.getElementById("errorFechaFinCurso");

  inputFin.classList.remove("is-invalid", "is-valid");
  errorFin.style.display = "none";
  errorFin.textContent = "";

  const inicio = new Date(inputInicio.value);
  const fin = new Date(inputFin.value);

  if (!inputFin.value) {
    inputFin.classList.add("is-invalid");
    errorFin.style.display = "block";
    errorFin.textContent = "Campo obligatorio.";
  } else if (fin <= inicio) {
    inputFin.classList.add("is-invalid");
    errorFin.style.display = "block";
    errorFin.textContent =
      "La fecha de fin debe ser posterior a la fecha de inicio.";
  } else {
    inputFin.classList.add("is-valid");
  }
});

//////////////////////////////////////////////////////////////////////////////////////
/// VALIDACION DE CURSOS EXISTENTES ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function ValidarCursoExistente(mensaje) {
  const errorNombre = document.getElementById("errorNombreCurso");
  const inputNombre = document.getElementById("NombreCurso");

  errorNombre.textContent = mensaje;
  errorNombre.style.display = "block";
  inputNombre.classList.add("is-invalid");
}

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA CREAR UN NUEVO CURSO //////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function CrearCurso() {
  if (!ValidarFormularioCursos()) return;
  mostrarOverlayGuardando();

  try {
    const curso = {
      nombre: document.getElementById("NombreCurso").value.trim(),
      modalidad: parseInt(document.getElementById("ModalidadCurso").value),
      descripcion: document.getElementById("DescripcionCurso").value.trim(),
      fechaInicio: document.getElementById("FechaInicioCurso").value,
      fechaFinalizacion: document.getElementById("FechaFinCurso").value,
    };

    const response = await authFetch("Cursos", {
      method: "POST",
      body: JSON.stringify(curso),
    });

    const data = await response.json();

    if (data.codigo === 0 || data.codigo === 1) {
      ValidarCursoExistente(data.mensaje);
      return;
    }
    ObtenerCursos(false);

  } catch (error) {
    MostrarErrorCatch();
  } finally {
    setTimeout(() => {
      ocultarOverlayGuardando();
      cerrarPanelCursos();

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
    }, 1500);
  }
}


//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA EDITAR UN CURSO ///////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function EditarCurso(id) {
  if (!ValidarFormularioCursos()) return;

  mostrarOverlayGuardando();

  try {
    const curso = {
      id: parseInt(document.getElementById("IdCurso").value),
      nombre: document.getElementById("NombreCurso").value.trim(),
      modalidad: parseInt(document.getElementById("ModalidadCurso").value),
      descripcion: document.getElementById("DescripcionCurso").value.trim(),
      fechaInicio: document.getElementById("FechaInicioCurso").value,
      fechaFinalizacion: document.getElementById("FechaFinCurso").value,
    };
    const response = await authFetch(`Cursos/${id}`, {
      method: "PUT",
      body: JSON.stringify(curso),
    });

    const data = await response.json();
    if (data.mensaje) {
      ValidarCursoExistente(data.mensaje);
      return;
    }
    ObtenerCursos(false);

  } catch (error) {
    MostrarErrorCatch();
  } finally {
    setTimeout(() => {
      ocultarOverlayGuardando();
      cerrarPanelCursos();

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
    }, 1500);
  }
}


//////////////////////////////////////////////////////////////////////////////////////
// INICIALAIR AL CARGAR LA VISTA //////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
ObtenerCursos();

//////////////////////////////////////////////////////////////////////////////////////
/// FUNCION APRA OBTENER  LOS DATOS DE LA API //////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function ObtenerAsistencia(cursoId, mostrarSpinner = true) {
  if (mostrarSpinner) mostrarPantallaCarga();

  const res = await authFetch("AsistenciasCapacitacion", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      const cursosFiltrados = data.filter((c) => c.cursoId === cursoId);
      MostrarAsistencias(cursoId, cursosFiltrados);
    })
    .catch((error) => {
      MostrarErrorCatch();
    })
    .finally(() => { if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1500); } });
}

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS ASISTENCIAS /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function MostrarAsistencias(cursoId, data) {
  const enMovil = window.innerWidth <= 880;

  const tablaBody = $(`.tabla-asistencias-body[data-curso-id="${cursoId}"]`);
  const cardsContenedor = $("#contenedorAsistenciasOffcanvas");

  if (enMovil) {
    if (!cardsContenedor.length) return;
    cardsContenedor.empty();

    if (!data || data.length === 0) {
      cardsContenedor.append(`
        <div class="col-12 text-center text-muted py-3">
          No hay asistencias para mostrar.
        </div>
      `);
      return;
    }

    data.forEach((item) => {
      const resultado = Number(item.resultado);
      const aprobado = resultado >= 6;
      const etiqueta = aprobado ? "Aprobado" : "Desaprobado";
      const badgeClass = aprobado ? "badge-aprobado" : "badge-desaprobado";

      const card = $(`
        <div class="col-12 mb-2">
          <div class="card shadow-sm rounded-3 p-3 d-flex align-items-center justify-content-between flex-row">
            
            <div class="d-flex align-items-center flex-grow-1 me-2">
              <input class="form-check-input checkbox-asistio-card me-2" 
                    type="checkbox" 
                    data-id="${item.id}" 
                    ${item.asistencia ? "checked" : ""}
                    ${item.asistencia ? 'style="pointer-events:none;"' : ""}/>
              
              <div class="d-flex flex-column">
                <h6 class="fw-bold mb-1 text-truncate" style="max-width: 200px;">
                  ${item.empleado.nombreCompleto}
                </h6>
                <span class="badge-pill ${badgeClass}" 
                      style="padding: 4px 10px; font-size: 0.8rem; align-self: start;">
                  ${etiqueta}
                </span>
              </div>
            </div>

            <button class='btn-eliminar text-danger' 
                    style='background: none; border: none; font-size: 1.1rem;' 
                    onclick='EliminarAsistencia(${item.id})' 
                    data-tippy-content='Eliminar'>
              <i class='bi bi-trash3'></i>
            </button>

          </div>
        </div>
      `);
      cardsContenedor.append(card);
    });

    $(".checkbox-asistio-card")
      .off("change")
      .on("change", function () {
        const asistenciaId = $(this).data("id");
        const nuevoEstado = $(this).is(":checked");
        MarcarAsistencia(asistenciaId, nuevoEstado);

        if (nuevoEstado) {
          $(this)
            .prop("disabled", true)
            .addClass("checkbox-verde");
        }
      });

  } else {
    if (!tablaBody.length) return;
    tablaBody.empty();

    if (!data || data.length === 0) {
      tablaBody.append(
        "<tr><td colspan='5' class='text-center text-muted'>No hay asistencias para mostrar.</td></tr>"
      );
      return;
    }

    $.each(data, function (index, item) {
      const resultado = Number(item.resultado);
      const aprobado = resultado >= 6;
      const etiqueta = aprobado ? "Aprobado" : "Desaprobado";
      const badgeClass = aprobado ? "badge-aprobado" : "badge-desaprobado";

      tablaBody.append(`
        <tr>
          <td class='text-center align-middle'>
            <input type="checkbox" class="checkbox-asistio" data-id="${item.id
        }" ${item.asistencia ? "checked" : ""}
            ${item.asistencia ? 'style="pointer-events:none;"' : ""} />
          </td>
          <td class='align-middle nombre-empleado' title='${item.empleado.nombreCompleto
        }'>
            ${item.empleado.nombreCompleto}
          </td>
          <td class='text-center align-middle'>
            <span class="badge-pill ${badgeClass}" style="padding: 4px 12px;">${etiqueta}</span>
          </td>
          <td class='d-flex justify-content-center align-items-center'>
            <button class='btn-eliminar' style='background: none; border: none;' 
              onclick='EliminarAsistencia(${item.id
        })' data-tippy-content='Eliminar'>
              <i class='bi bi-trash3 icono-elimina-detalle'></i>
            </button>
          </td>
        </tr>
      `);
    });

    $(".checkbox-asistio")
      .off("change")
      .on("change", function () {
        const asistenciaId = $(this).data("id");
        const nuevoEstado = $(this).is(":checked");
        MarcarAsistencia(asistenciaId, nuevoEstado);

        if (nuevoEstado) {
          $(this)
            .prop("disabled", true)
            .addClass("checkbox-verde");
        }
      });
  }

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA LIMPIAR EL FORMULARIO DE LA ASISTENCIA //////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function ValidarFormularioAsistencia() {
  const selectEmpleadoId = document.getElementById("EmpleadoId");
  const selectErrorEmpleadoId = document.getElementById("errorEmpleadoId");

  const selectResultado = document.getElementById("ResultadoAsistencia");
  const selectErrorResultado = document.getElementById(
    "errorResultadoAsistencia"
  );

  const empleadoId = selectEmpleadoId.value;
  const resultado = parseInt(selectResultado.value);

  selectErrorEmpleadoId.style.display = "none";
  selectErrorEmpleadoId.textContent = "";
  selectEmpleadoId.classList.remove("is-invalid", "is-valid");
  selectErrorResultado.style.display = "none";
  selectErrorResultado.textContent = "";
  selectResultado.classList.remove("is-invalid", "is-valid");

  let esValid = true;

  if (empleadoId === "") {
    selectEmpleadoId.classList.add("is-invalid");
    selectErrorEmpleadoId.style.display = "block";
    selectErrorEmpleadoId.textContent = "Campo obligatorio.";
    esValid = false;
  }

  if (isNaN(resultado) || resultado === 0) {
    selectResultado.classList.add("is-invalid");
    selectErrorResultado.style.display = "block";
    selectErrorResultado.textContent = "Campo obligatorio.";
    esValid = false;
  }

  return esValid;
}

//////////////////////////////////////////////////////////////////////////////////////
// VALIDACIONES EN VIVO  PARA EL FORMULARIO DE ASISTENCIAS ///////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
document.getElementById("EmpleadoId").addEventListener("input", () => {
  const inputEmpleado = document.getElementById("EmpleadoId");
  const errorEmpleadoId = document.getElementById("errorEmpleadoId");
  const empleadoId = inputEmpleado.value;

  inputEmpleado.classList.remove("is-invalid", "is-valid");

  let esValid = true;

  if (empleadoId === "") {
    inputEmpleado.classList.add("is-invalid");
    errorEmpleadoId.style.display = "block";
    errorEmpleadoId.textContent = "Campo obligatorio.";
    esValid = false;
  } else {
    inputEmpleado.classList.add("is-valid");
    errorEmpleadoId.style.display = "none";
    errorEmpleadoId.textContent = "";
  }
  return esValid;
});

document
  .getElementById("ResultadoAsistencia")
  .addEventListener("change", () => {
    const selectResultado = document.getElementById("ResultadoAsistencia");
    const errorResultado = document.getElementById("errorResultadoAsistencia");
    const valor = parseInt(selectResultado.value);

    selectResultado.classList.remove("is-invalid", "is-valid");

    if (isNaN(valor) || valor === 0) {
      selectResultado.classList.add("is-invalid");
      errorResultado.style.display = "block";
      errorResultado.textContent = "Campo obligatorio.";
    } else {
      selectResultado.classList.add("is-valid");
      errorResultado.style.display = "none";
      errorResultado.textContent = "";
    }
  });

//////////////////////////////////////////////////////////////////////////////////////
// LIMPIAR FORMULARIO DE ASISTENCIA //////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function LimpiarModalAsistencias() {
  document.getElementById("IdAsistencia").value = "";
  const inputEmpleado = document.getElementById("EmpleadoId");
  inputEmpleado.value = "";
  const inputResultadoAsistencia = document.getElementById(
    "ResultadoAsistencia"
  );
  inputResultadoAsistencia.value = 0;

  inputEmpleado.classList.remove("is-invalid", "is-valid");
  inputResultadoAsistencia.classList.remove("is-invalid", "is-valid");

  const inputErrorEmpleado = document.getElementById("errorEmpleadoId");
  inputErrorEmpleado.textContent = "";
  inputErrorEmpleado.style.display = "none";
  const inputErrorResultado = document.getElementById(
    "errorResultadoAsistencia"
  );
  inputErrorResultado.textContent = "";
  inputErrorResultado.style.display = "none";
}

function ValidarAsistenciaExistente(mensaje) {
  const errorEmpleadoId = document.getElementById("errorEmpleadoId");
  const inputEmpleadoId = document.getElementById("EmpleadoId");

  errorEmpleadoId.textContent = mensaje;
  errorEmpleadoId.style.display = "block";
  inputEmpleadoId.classList.add("is-invalid");
}

//////////////////////////////////////////////////////////////////////////////////////
// CREAR ASISTENCIA //////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function CrearAsistencia() {
  if (!ValidarFormularioAsistencia()) return;

  mostrarOverlayGuardandoAsistencias();

  try {
    const asistencia = {
      asistencia: false,
      empleadoId: parseInt(document.getElementById("EmpleadoId").value),
      resultado: document.getElementById("ResultadoAsistencia").value.trim(),
      cursoId: cursoIdSeleccionado,
    };

    const response = await authFetch("AsistenciasCapacitacion", {
      method: "POST",
      body: JSON.stringify(asistencia),
    });
    const data = await response.json();

    if (data.mensaje) {
      ValidarAsistenciaExistente(data.mensaje);
      return;
    }
    await ObtenerAsistencia(cursoIdSeleccionado, false); 

  } catch (error) {
    MostrarErrorCatch();
  } finally {
    setTimeout(() => {
      ocultarOverlayGuardandoAsistencias();
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
    }, 1500);
  }
}




//////////////////////////////////////////////////////////////////////////////////////
// MODAL CONFIRMAR ELIMINAR ASISTENCIA /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
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
  }).then((result) => {
    if (result.isConfirmed) {
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
  });
}

//////////////////////////////////////////////////////////////////////////////////////
// ELIMINAR ASISTENCIA ////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function EliminarSiAsistencia(id) {
  try {
    const res = await authFetch(`AsistenciasCapacitacion/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    ObtenerAsistencia(cursoIdSeleccionado);

    if (res.ok) {
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
      });
    } else {
      Swal.fire({
        title: "Acción no permitida",
        html: `
          <div class="text-center">
            <p>${data.mensaje || "No se puede realizar esta acción."}</p>
            <p>Eliminá el certificado antes de intentar eliminar la asistencia.</p>
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
  } catch (error) {
    MostrarErrorCatch();
  }
}

//////////////////////////////////////////////////////////////////////////////////////
// MARCAR ASISTENCIA //////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function MarcarAsistencia(id, nuevoEstado) {
  const res = await authFetch(`AsistenciasCapacitacion/CambiarEstado/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nuevoEstado),
  })
    .then(() => {
      if (nuevoEstado) {
        ObtenerAsistencia(cursoIdSeleccionado, false);
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
      } else {
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
    .catch((error) => {
      MostrarErrorCatch();
    });
}

//////////////////////////////////////////////////////////////////////////////////////
// INICILAIZAR AL CARGAR LA VISTA //////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
ObtenerAsistencia(cursoIdSeleccionado);

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA OBTENER LOS CERTIFICADOS ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function ObtenerCertificados(cursoId, mostrarSpinner = true) {
  if (mostrarSpinner) mostrarPantallaCarga();
  const res = await authFetch("Certificados", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      const cursosFiltrados = data.filter((c) => c.cursoId === cursoId);
      MostrarCertificados(cursoId, cursosFiltrados);
    })
    .catch((error) => {
      MostrarErrorCatch();
    })
    .finally(() => { if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1500); } });
}


//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS CERTIFICADOS ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function MostrarCertificados(cursoId, data) {
  const enMovil = window.innerWidth <= 880;

  const tablaBody = $(`.tabla-certificados-body[data-curso-id="${cursoId}"]`);
  const cardsContenedor = $("#contenedorCertificadosOffcanvas");

  if (enMovil) {
    if (!cardsContenedor.length) return;
    cardsContenedor.empty();

    if (!data || data.length === 0) {
      cardsContenedor.append(`
        <div class="col-12 text-center text-muted py-3">
          No hay certificados para mostrar.
        </div>
      `);
      return;
    }

    data.forEach((item) => {
      const documentoHtml = item.documentoNombre
        ? `
        <p class="text-muted d-flex align-items-center gap-2 mb-2">
            <button onclick="DescargarDocumento(${item.id})" class="document-link d-flex align-items-center gap-1" data-tippy-content="Descargar" style="color: inherit; text-decoration: none; font-size: 0.9rem; border:none; background:none; cursor:pointer;">
                <i class="bi bi-file-earmark-text" style="font-size: 1rem;"></i>
                <span>Descargar</span>
            </button>
        </p>
        `
        : "";

      const card = $(`
          <div class="col-12 mb-2">
            <div class="card shadow-sm rounded-3 p-3">
              <h6 class="fw-bold mb-1">${item.empleado.nombreCompleto}</h6>
              <div class="d-flex justify-content-between align-items-center mt-2">
                <div>${documentoHtml}</div>
                <button class='btn-eliminar'  style='background: none; border: none;'
        onclick='EliminarCertificado(${item.id}, ${cursoId})'                        data-tippy-content="Eliminar">
                  <i class='bi bi-trash3 icono-elimina-detalle'></i>
                </button>
              </div>
            </div>
          </div>
        `);

      cardsContenedor.append(card);
    });
  } else {
    if (!tablaBody.length) return;
    tablaBody.empty();

    if (!data || data.length === 0) {
      tablaBody.append(
        "<tr><td colspan='4' class='text-center text-muted'>No hay certificados para mostrar.</td></tr>"
      );
      return;
    }

    $.each(data, function (index, item) {
      const documentoHtml = item.documentoNombre
        ? `
        <p class="text-muted d-flex align-items-center justify-content-center gap-2 mb-2">
            <button onclick="DescargarDocumento(${item.id})" class="document-link d-flex align-items-center gap-1" data-tippy-content="Descargar" style="color: inherit; text-decoration: none; font-size: 0.9rem; border:none; background:none; cursor:pointer;">
                <i class="bi bi-file-earmark-text" style="font-size: 1rem;"></i>
                <span>Descargar</span>
            </button>
        </p>
        `
        : "";
      tablaBody.append(`
        <tr>
          <td class='align-middle nombre-empleado'>${item.empleado.nombreCompleto}</td>
          <td class='align-middle text-center' style="font-size: 0.8rem;">${documentoHtml}</td>
          <td class='d-flex justify-content-center align-items-center'>
            <button class='btn-eliminar' style='background: none; border: none;' 
    onclick='EliminarCertificado(${item.id}, ${cursoId})' data-tippy-content='Eliminar'>
    <i class='bi bi-trash3 icono-elimina-detalle'></i>
</button>

          </td>
        </tr>
      `);
    });
  }

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });

  MostrarOpcionesCursosPorRol();
}

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA DESCARGAR UN CERTIFICADO ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function DescargarDocumento(id) {
  try {
    const response = await authFetch(`Certificados/Documento/${id}`);

    const blob = await response.blob();

    const disposition = response.headers.get("Content-Disposition");
    let filename = "archivo_descargado";

    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?([^;\r\n]+)/i);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1].replace(/['"]/g, ""));
      }
    }

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    MostrarErrorCatch();
  }
}

//////////////////////////////////////////////////////////////////////////////////////
// LIMPIAR FORMULARIO DE CERTIFICADO ////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function LimpiarModalCertificado() {
  document.getElementById("IdCertificado").value = "";

  const inputEmpleado = document.getElementById("EmpleadoIdCertificado");
  inputEmpleado.value = "";
  inputEmpleado.classList.remove("is-invalid", "is-valid");

  const inputDocumento = document.getElementById("DocumentoAdjunto");
  inputDocumento.value = "";
  inputDocumento.classList.remove("is-invalid", "is-valid");

  const archivoActual = document.getElementById("archivoAdjuntoActual");
  if (archivoActual) archivoActual.textContent = "";

  const inputErrorEmpleado = document.getElementById(
    "errorEmpleadoIdCertificado"
  );
  inputErrorEmpleado.textContent = "";
  inputErrorEmpleado.style.display = "none";

  const inputErrorDocumento = document.getElementById("errorDocumentoAdjunto");
  inputErrorDocumento.textContent = "";
  inputErrorDocumento.style.display = "none";

  const inputErrorArchivoAdjunto = document.getElementById(
    "errorArchivoAdjunto"
  );
  if (inputErrorArchivoAdjunto) {
    inputErrorArchivoAdjunto.textContent = "";
    inputErrorArchivoAdjunto.style.display = "none";
  }
}

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA VALIDAR EL FORMULARIO DE CERTIFICADO //////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function ValidarFormularioCertificado() {
  const selectEmpleadoId = document.getElementById("EmpleadoIdCertificado");
  const selectErrorEmpleadoId = document.getElementById(
    "errorEmpleadoIdCertificado"
  );

  const inputDocumento = document.getElementById("DocumentoAdjunto");
  const inputErrorDocumento = document.getElementById("errorDocumentoAdjunto");

  const empleadoId = selectEmpleadoId.value;
  const documento = inputDocumento.value;

  selectErrorEmpleadoId.style.display = "none";
  selectErrorEmpleadoId.textContent = "";
  selectEmpleadoId.classList.remove("is-invalid", "is-valid");
  inputErrorDocumento.style.display = "none";
  inputErrorDocumento.textContent = "";
  inputDocumento.classList.remove("is-invalid", "is-valid");

  let esValid = true;

  if (empleadoId === "") {
    selectEmpleadoId.classList.add("is-invalid");
    selectErrorEmpleadoId.style.display = "block";
    selectErrorEmpleadoId.textContent = "Campo obligatorio.";
    esValid = false;
  }
  if (documento.length === 0) {
    inputDocumento.classList.add("is-invalid");
    inputErrorDocumento.style.display = "block";
    inputErrorDocumento.textContent = "Campo obligatorio.";
    esValid = false;
  }
  return esValid;
}

//////////////////////////////////////////////////////////////////////////////////////
// VALIDACIÓN EN VIVO: CAMBIA EL COLOR MIENTRAS EL USUARIO ESCRIBE ///////////////////
//////////////////////////////////////////////////////////////////////////////////////
document
  .getElementById("EmpleadoIdCertificado")
  .addEventListener("input", () => {
    const input = document.getElementById("EmpleadoIdCertificado");
    const error = document.getElementById("errorEmpleadoIdCertificado");
    const valor = input.value.trim();

    input.classList.remove("is-invalid", "is-valid");
    error.style.display = "none";
    error.textContent = "";

    if (valor === "" || valor === "0") {
      input.classList.add("is-invalid");
      error.style.display = "block";
      error.textContent = "Campo obligatorio.";
    } else {
      input.classList.add("is-valid");
    }
  });

document.getElementById("DocumentoAdjunto").addEventListener("change", () => {
  const input = document.getElementById("DocumentoAdjunto");
  const error = document.getElementById("errorDocumentoAdjunto");
  const tieneArchivo = input.files.length > 0;

  input.classList.remove("is-invalid", "is-valid");
  error.style.display = "none";
  error.textContent = "";

  if (!tieneArchivo) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else {
    input.classList.add("is-valid");
  }
});

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA VALIDAR EL EXISTENCIA DE CERTIFICADO //////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function ValidarCertificadoExistente(mensaje) {
  const errorEmpleadoId = document.getElementById("errorEmpleadoIdCertificado");
  const inputEmpleadoId = document.getElementById("EmpleadoIdCertificado");

  errorEmpleadoId.textContent = mensaje;
  errorEmpleadoId.style.display = "block";
  inputEmpleadoId.classList.add("is-invalid");
}

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA CREAR UN CERTIFICADO //////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function CrearCertificado() {
  if (!ValidarFormularioCertificado()) return;

  mostrarOverlayGuardandoCertificados();

  try {
    const formData = new FormData();
    formData.append(
      "EmpleadoId",
      document.getElementById("EmpleadoIdCertificado").value
    );
    formData.append("CursoId", cursoIdSeleccionado);

    const archivo = document.getElementById("DocumentoAdjunto").files[0];
    if (archivo) {
      formData.append("DocumentoAdjunto", archivo);
    }

    const res = await authFetch("Certificados", {
      method: "POST",
      body: formData,
    });

    const response = await res.json();

    if (response.mensaje) {
      ValidarCertificadoExistente(response.mensaje);
      return;
    }

    await ObtenerCertificados(cursoIdSeleccionado, false); 

  } catch (error) {
    MostrarErrorCatch();
  } finally {
    setTimeout(() => {
      ocultarOverlayGuardandoCertificados();
      cerrarPanelCertificados();

      Swal.fire({
        title: "¡Certificado Creado!",
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
    }, 1500); 
  }
}


//////////////////////////////////////////////////////////////////////////////////////
// MOSTRAR EL MODAL DE ELIMINAR UN CERTIFICADO ////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function EliminarCertificado(id, cursoId) {
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
  }).then((result) => {
    if (result.isConfirmed) {
      EliminarSiCertificado(id, cursoId);
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


//////////////////////////////////////////////////////////////////////////////////////
// ELIMINAR SI EL CERTIFICADO //////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function EliminarSiCertificado(id, cursoId) {
  try {
    const res = await authFetch(`Certificados/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("No se pudo eliminar el certificado");

    // Actualizamos la tabla / cards del curso correcto
    ObtenerCertificados(cursoId);

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
    });
  } catch (error) {
    MostrarErrorCatch();
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LAS OPCIONES DE CURSO POR ROL /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarOpcionesCursosPorRol() {
  const rol = getRol()?.toUpperCase();
  if (!rol) return;

  if (rol === "ADMINISTRADOR" || rol === "RRHH") {
    $(
      "#cardEstadisticasCursos, #btnMostrarGenerar, #btnNuevoCurso"
    ).removeClass("d-none");
    $(
      "#PresencialRA, #VirtualRA, #MixtoRA, #AprobadoRA, #DesaprobadoRA, #AsistenciaRA, #CertificadoRA, #DescripcionRA, #EditarRA, #AsistioRA, #DescargarRA"
    ).removeClass("d-none");
  } else if (rol === "SUPERVISOR" || rol === "EMPLEADO") {
    $("#tituloCursos").text(
      "Visualizá los cursos en los que participaste y descargá los certificados disponibles."
    );
    $(
      "#AprobadoES, #DesaprobdoES, #PresencialES, #VirtualES, #MixtoES, #CertificadoES, #FechaES"
    ).removeClass("d-none");
  }
}

////////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA GENERA UN INFORME PARA CURSOS SEGUN SU FILTRO //////////////
////////////////////////////////////////////////////////////////////////////////
async function GenerarInformePdfCursos() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margen = 14;
  const anchoUtil = pageWidth - margen * 2;

  let nombreCurso = document.getElementById("NombreCursoBuscar")?.value || "";
  let modalidad = document.getElementById("ModalidadBuscar")?.value || 0;
  let fechaCurso = document.getElementById("FechaCursoBuscar")?.value || null;

  const filtro = {
    nombreCurso: nombreCurso.trim() || null,
    modalidad: modalidad != "0" ? Number(modalidad) : null,
    fecha: fechaCurso || null,
  };

  const res = await authFetch("InformesGeneralesPdf/GenerarInformeCursos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filtro),
  });

  const data = await res.json();
  const cursos = data.cursos || [];
  const resumen = data.resumen;

  doc.setTextColor(19, 115, 204);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Informe de Cursos", doc.internal.pageSize.getWidth() / 2, 20, {
    align: "center",
  });

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
  doc.text("Total Cursos:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.total}`, 39, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Presencial:", 44, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.presencial}`, 66, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Virtual:", 72, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.online}`, 87, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Mixto:", 91, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.mixto}`, 104, y);

  y += 6;

  const filtrosAplicadosArray = [];

  if (filtro.nombreCurso)
    filtrosAplicadosArray.push(`[Nombre: ${filtro.nombreCurso}]`);
  if (filtro.modalidad) {
    let modalidadNombre =
      document.getElementById("ModalidadBuscar").selectedOptions[0]?.text ||
      modalidad;
    filtrosAplicadosArray.push(`[Modalidad: ${modalidadNombre}]`);
  }
  if (filtro.fecha) filtrosAplicadosArray.push(`[Fecha: ${filtro.fecha}]`);

  const filtrosAplicados =
    filtrosAplicadosArray.length > 0
      ? filtrosAplicadosArray.join("  |  ")
      : "No se aplicaron";

  doc.setFont("helvetica", "normal");
  doc.text("Filtros Aplicados:", 14, y);
  doc.setFont("helvetica", "bold");

  const filtrosText = doc.splitTextToSize(filtrosAplicados, 260);
  doc.text(filtrosText, margen + 32, y);

  y += filtrosText.length * 6 + 2;

  doc.setDrawColor(180);
  doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
  y += 7;

  if (cursos.length === 0) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 0, 0);
    doc.text(
      "No hay resultados para los filtros aplicados.",
      pageWidth / 2,
      y + 10,
      { align: "center" }
    );

    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(
        `Página ${i} de ${pages}`,
        margen,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const w = window.open();
    w.document.write(
      `<iframe width='100%' height='100%' src='${url}'></iframe>`
    );
    return;
  }

  const colCurso = {
    0: { cellWidth: 45 },
    1: { cellWidth: 120 },
    2: { cellWidth: 30 },
    3: { cellWidth: 25 },
    4: { cellWidth: 25 },
    5: { cellWidth: 24 },
  };

  const colAsistencia = {
    0: { cellWidth: 30 },
    1: { cellWidth: 120 },
    2: { cellWidth: 40 },
    3: { cellWidth: 79 },
  };

  for (let index = 0; index < cursos.length; index++) {
    const curso = cursos[index];

    const modalidadTexto = curso.modalidadStr
      ? curso.modalidadStr.replace(/,/g, " | ")
      : curso.modalidad ?? "-";

    const tablaCursoBody = [
      [
        curso.nombreCurso,
        curso.descripcion,
        modalidadTexto,
        curso.fechaInicio
          ? new Date(curso.fechaInicio).toLocaleDateString("es-AR")
          : "-",
        curso.fechaFinalizacion
          ? new Date(curso.fechaFinalizacion).toLocaleDateString("es-AR")
          : "-",
        curso.finalizado ? "Sí" : "No",
      ],
    ];

    doc.autoTable({
      startY: y,
      head:
        index === 0
          ? [
            [
              "Curso",
              "Descripción",
              "Modalidad",
              "Inicio",
              "Fin",
              "Finalizado",
            ],
          ]
          : [],
      body: tablaCursoBody,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles:
        index === 0
          ? { fillColor: [19, 115, 204], textColor: 255, fontStyle: "bold" }
          : {},
      margin: { left: margen, right: margen },
      columnStyles: {
        ...colCurso,
        5: { halign: "center" },
      },
      tableWidth: anchoUtil,
      didParseCell: function (data) {
        if (data.section === "body") {
          data.cell.styles.fillColor = [210, 230, 255];
          data.cell.styles.textColor = 0;
        }
      },
    });

    y = doc.lastAutoTable.finalY + -1;

    if ((curso.empleados || []).length > 0) {
      const tablaAsistenciaBody = curso.empleados.map((e) => [
        e.asistio ? "Sí" : "No",
        e.nombreEmpleado,
        Number(e.resultado) >= 6 ? "Aprobado" : "Desaprobado",
        e.certificado?.archivo ? "Sí" : "No",
      ]);

      doc.autoTable({
        startY: y,
        head: [["Asistió", "Empleado", "Resultado", "Certificado"]],
        body: tablaAsistenciaBody,
        styles: { fontSize: 9, cellPadding: 2 },

        headStyles: {
          fillColor: [225, 225, 225],
          textColor: 0,
          fontStyle: "bold",
        },

        margin: { left: margen, right: margen },
        columnStyles: colAsistencia,
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
    doc.text(
      `Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      "www.WorkSync.com",
      doc.internal.pageSize.getWidth() - 20,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  }

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  const html = `<html><head><title>Informe de Cursos</title></head>
    <body class="pdf-body">
    <iframe class="pdf-frame" width="100%" height="100%" src="${url}"></iframe>
    </body></html>`;

  const w = window.open();
  w.document.open();
  w.document.write(html);
  w.document.close();
}

//////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR AL CARGAR LA VISTA //////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
ObtenerCertificados(cursoIdSeleccionado);
MostrarOpcionesCursosPorRol();
