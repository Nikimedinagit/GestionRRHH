//INICIO PANEL FORMUALRIO//
//Función para abrir el formulario lateral
function abrirPanelHorario() {
  document.getElementById("panelHorario").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("EmpleadoId");
    if (inputNombre) inputNombre.focus();
  }, 400);
}

//Funcion para cerrar el formulario lateral
function cerrarPanelHorario() {
  document.getElementById("panelHorario").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  // LimpiarModalHorario();
}

function toggleHorarioInputs() {
  const tipo = document.getElementById("TipoHorario").value;
  const recorridoDiv = document.getElementById("horarioRecorrido");
  const separadoDiv = document.getElementById("horarioSeparado");

  if (tipo === "1") {
    recorridoDiv.classList.remove("d-none");
    recorridoDiv.classList.add("d-flex");

    separadoDiv.classList.add("d-none");
    separadoDiv.classList.remove("d-block");
  } else if (tipo === "2") {
    separadoDiv.classList.remove("d-none");
    separadoDiv.classList.add("d-block");

    recorridoDiv.classList.add("d-none");
    recorridoDiv.classList.remove("d-flex");
  } else {
    recorridoDiv.classList.add("d-none");
    recorridoDiv.classList.remove("d-flex");

    separadoDiv.classList.add("d-none");
    separadoDiv.classList.remove("d-block");
  }
}

//FIN PANEL FORMULARIO//

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

// Mostrar/ocultar fechas
document
  .getElementById("filtrarHorarioSelect")
  .addEventListener("change", function () {
    const mostrar = this.value === "si";
    document
      .getElementById("horariosInputs")
      .classList.toggle("d-none", !mostrar);
    document
      .getElementById("horariosInputsFin")
      .classList.toggle("d-none", !mostrar);

    // Opcional: limpiar valores al ocultar
    document.getElementById("HorarioInicioBuscar").value = "";
    document.getElementById("HorarioFinBuscar").value = "";
  });

//Onchange de filtro
$(document).ready(function () {
  ObtenerHorarios();
  $(
    "#EmpleadoIdBuscar, #TipoHorarioBuscar, #HorarioInicioBuscar, #HorarioFinBuscar"
  ).on("input", function () {
    ObtenerHorarios();
  });
});

//Funcion para obtener los horarios
async function ObtenerHorarios() {
  let tipoHorario = document.getElementById("TipoHorarioBuscar").value;
  let tipo =
    tipoHorario !== "0" && tipoHorario !== "" ? parseInt(tipoHorario) : null;

  // Obtener las horas y, si no están vacías, agrego fecha fija para que sea un ISO válido
  let horarioInicioRaw = document.getElementById("HorarioInicioBuscar").value;
  let horarioFinRaw = document.getElementById("HorarioFinBuscar").value;

  // Formateo horas con fecha fija para mandar al backend
  let horarioInicio = horarioInicioRaw ? `${horarioInicioRaw}:00` : null;
  let horarioFin = horarioFinRaw ? `${horarioFinRaw}:00` : null;

  let empleadoTexto = document.getElementById("EmpleadoIdBuscar").value;

  let filtro = {
    tipoHorario: tipo,
    horarioInicio: horarioInicio,
    horarioFin: horarioFin,
    empleadoTexto: empleadoTexto,
  };
  const res = await authFetch("Horarios/Filtrar", {
    method: "POST",
    body: JSON.stringify(filtro),
  })
    .then((response) => response.json())
    .then((data) => {
      MostrarHorarios(data);
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}

function MostrarHorarios(data) {
  if (window.innerWidth <= 764) {
    MostrarHorariosMobile(data);
  } else {
    MostrarHorariosDesktop(data);
  }
}

function MostrarHorariosDesktop(data) {
  const contenedor = $("#contenedorHorarios");
  contenedor.empty();

  if (!Array.isArray(data) || data.length === 0) {
    contenedor.append(
      "<div class='text-center text-muted py-3'>No hay horarios para mostrar.</div>"
    );
    return;
  }

  // Defino colores para tipos, usando clases Bootstrap o propias
  const tipoColor = {
    Separado: "bg-separado",
    Recorrido: "bg-recorrido",
  };

  data.forEach((horario) => {
    const tipoStr = horario.tipoHorarioString
      ? horario.tipoHorarioString.charAt(0).toUpperCase() +
        horario.tipoHorarioString.slice(1).toLowerCase()
      : "";

    const tipoClase = tipoColor[tipoStr] || "";

    const item = $(`
      <div class="horarios-item border rounded py-2 px-3 mb-2 d-flex align-items-center justify-content-between flex-wrap">
        <button class="btn-editar me-2" style="background: none; border: none;" onclick="MostrarModalEditar(${
          horario.id
        })" data-tippy-content="Editar">
          <i class="bi bi-pencil-square icono-editar"></i>
        </button>

        <div class="info-horario d-flex align-items-center flex-grow-1" style="gap: 30px; position: relative; min-width: 0;">
          <div class="empleado fw-bold text-truncate">
            ${horario.empleadoString || "Sin nombre"}
          </div>
          <div class="puesto text-muted small text-truncate">
            ${horario.puestoEmpleado || "Sin puesto"}
          </div>
          <div class="tipo text-truncate ${tipoClase}">
            ${horario.tipoHorarioString || "Sin tipo"}
          </div>
        </div>

        <div class="botones-acciones d-flex align-items-center justify-content-end" style="min-width: 120px; gap: 10px;">
          <button class="btn-eliminar" style="background: none; border: none;" data-id="${
            horario.id
          }" data-tippy-content="Borrar">
            <i class="bi bi-trash icono-eliminar"></i>
          </button>
          <button class="toggle-detalle" style="background: none; border: none; font-weight: bold;" aria-expanded="false" aria-label="Mostrar detalles" data-tippy-content="Detalle">
            <i class="bi bi-chevron-down"></i>
          </button>
        </div>
      </div>
    `);

    // Días y labels
    const diasNombres = [
      { key: "lunes", label: "Lunes" },
      { key: "martes", label: "Martes" },
      { key: "miercoles", label: "Miércoles" },
      { key: "jueves", label: "Jueves" },
      { key: "viernes", label: "Viernes" },
      { key: "sabado", label: "Sábado" },
      { key: "domingo", label: "Domingo" },
    ];

    const esSeparado =
      horario.tipoHorarioString &&
      horario.tipoHorarioString.toLowerCase() === "separado";

    let filasHorario = "";

    diasNombres.forEach((dia) => {
      if (horario[dia.key]) {
        if (esSeparado) {
          filasHorario += `
            <tr>
              <td>${dia.label}</td>
              <td class="text-center">${horario.horarioInicioString || "-"}</td>
              <td class="text-center">${horario.horarioFinString || "-"}</td>
              <td class="text-center">${
                horario.segundoHorarioInicioString || "-"
              }</td>
              <td class="text-center">${
                horario.segundoHorarioFinString || "-"
              }</td>
            </tr>
          `;
        } else {
          filasHorario += `
            <tr>
              <td>${dia.label}</td>
              <td class="text-center">${horario.horarioInicioString || "-"}</td>
              <td class="text-center">${horario.horarioFinString || "-"}</td>
            </tr>
          `;
        }
      }
    });

    const detalleHTML = $(`
      <div class="panelHorarios collapse px-3 pb-2" style="display: none;">
        <h3 class="titulo-sub-seccion mb-3" style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem;">Detalle de Horarios</h3>
        <div class="table-responsive">
          <table class="table table-bordered table-hover">
            <colgroup>
              <col style="width: 25%" />
              <col style="width: 18%" />
              <col style="width: 18%" />
              ${
                esSeparado
                  ? `<col style="width: 18%" /><col style="width: 21%" />`
                  : ""
              }
            </colgroup>
            <thead>
              <tr>
                <th class="text-start header-table">Días</th>  
                <th class="text-center header-table">Inicio °1</th>
                <th class="text-center header-table">Fin °1</th>
                ${
                  esSeparado
                    ? `<th class="text-center header-table">Inicio °2</th><th class="text-center header-table">Fin °2</th>`
                    : ""
                }
              </tr>
            </thead>
            <tbody>
              ${
                filasHorario ||
                `<tr><td colspan="${
                  esSeparado ? 5 : 3
                }" class="tabla-horarios-body text-center text-muted">Sin días activos</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `);

    item.find(".toggle-detalle").on("click", function () {
      const iconoChevron = $(this).find("i");
      detalleHTML.slideToggle(200, function () {
        detalleHTML.toggleClass("mostrar", detalleHTML.is(":visible"));
      });
      iconoChevron.toggleClass("bi-chevron-down bi-chevron-up");
      const expanded = $(this).attr("aria-expanded") === "true";
      $(this).attr("aria-expanded", !expanded);
    });

    contenedor.append(item);
    contenedor.append(detalleHTML);
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

function MostrarHorariosMobile(data) {
  const contenedor = document.getElementById("contenedorHorarios");
  contenedor.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    contenedor.innerHTML =
      "<div class='text-center text-muted py-3'>No hay horarios para mostrar.</div>";
    return;
  }

  // Clase de color según tipo de horario
  const tipoColor = {
    Separado: "bg-separado",
    Recorrido: "bg-recorrido",
  };
  window.horariosData = data;

  data.forEach((horario) => {
    const { id, empleadoString, puestoEmpleado, tipoHorarioString } = horario;

    const tipoStr = tipoHorarioString
      ? tipoHorarioString.charAt(0).toUpperCase() +
        tipoHorarioString.slice(1).toLowerCase()
      : "-";

    const tipoClase = tipoColor[tipoStr] || "bg-light text-dark";

    contenedor.innerHTML += `
      <div class="col-12 col-md-6 p-2 col-lg-4 col-xl-3 d-flex">
        <div class="card shadow-sm p-2 rounded-3 d-flex flex-column w-100" style="min-height: 180px;">
          <div class="flex-grow-1 d-flex flex-column">

            <!-- Nombre del empleado -->
            <h5 class=text-start fw-bold mb-2" style="font-size: 1.2rem;">${
              empleadoString || "Sin nombre"
            }</h5>

            <!-- Puesto -->
            <p class="mb-2 my-2 text-muted d-flex align-items-center" style="font-size: 0.9rem;">
              <i class="bi bi-briefcase me-2"></i>
              ${puestoEmpleado || "Sin puesto"}
            </p>

            <!-- Tipo de horario -->
            <span class="badge ${tipoClase} my-2" style="width: fit-content; font-size: 1rem;">
              ${tipoStr}
            </span>
          </div>

          <!-- Botones de acción -->
          <div class="d-flex justify-content-between mt-3 align-items-center">
            <div>
            <button class="btn-ver" onclick="MostrarDetalleHorario(${id})" data-tippy-content="Detalle" style="background: none; border: none;">
              <i class="bi bi-info-circle iocno-ver-horario btn-sm"></i>
            </button>
            </div>
            <div>

            <button class="btn-editar" onclick="MostrarModalEditar(${id})" data-tippy-content="Editar" style="background: none; border: none;">
              <i class="bi bi-pencil-square icono-editar-horario btn-sm"></i>
            </button>
            <button class="btn-eliminar" onclick="EliminarHorarioId(${id})" data-tippy-content="Eliminar" style="background: none; border: none;">
              <i class="bi bi-trash icono-borrar-horario btn-sm"></i>
            </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

function MostrarDetalleHorario(id) {
  const horario = horariosData.find((e) => e.id === id);
  if (!horario) return;

  const esSeparado = horario.tipoHorarioString?.toLowerCase() === "separado";

  const dias = [
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
    "Domingo",
  ];

  dias.forEach((dia) => {
    const inicio1Elem = document.getElementById(`detalleInicio${dia}`);
    const fin1Elem = document.getElementById(`detalleFin${dia}`);
    const inicio2Elem = document.getElementById(`detalleInicio${dia}2`);
    const fin2Elem = document.getElementById(`detalleFin${dia}2`);
    const turno2Div = document.getElementById(`turno${dia}2`);

    // Primer horario
    inicio1Elem.textContent = horario.horarioInicioString || "-";
    fin1Elem.textContent = horario.horarioFinString || "-";

    // Segundo horario
    if (
      esSeparado &&
      horario.segundoHorarioInicioString &&
      horario.segundoHorarioFinString
    ) {
      turno2Div.style.display = "block"; // Mostrar el segundo bloque
      inicio2Elem.textContent = horario.segundoHorarioInicioString;
      fin2Elem.textContent = horario.segundoHorarioFinString;
    } else {
      turno2Div.style.display = "none"; // Ocultar si no aplica
      inicio2Elem.textContent = "";
      fin2Elem.textContent = "";
    }
  });

  // Mostrar offcanvas
  const offcanvasElement = document.getElementById("offcanvasDetalleHorario");
  const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
  offcanvas.show();
}

// funcion para mostar datos en el modal de edicion
async function MostrarModalEditar(id) {
  try {
    const response = await authFetch(`Horarios/${id}`);

    const data = await response.json();

    // Asignar valores al formulario
    document.getElementById("IdHorario").value = data.id;
    document.getElementById("TipoHorario").value = data.tipoHorario;

    // Días seleccionados
    document.getElementById("lunes").checked = data.lunes;
    document.getElementById("martes").checked = data.martes;
    document.getElementById("miercoles").checked = data.miercoles;
    document.getElementById("jueves").checked = data.jueves;
    document.getElementById("viernes").checked = data.viernes;
    document.getElementById("sabado").checked = data.sabado;
    document.getElementById("domingo").checked = data.domingo;

    // Empleado
    document.getElementById("EmpleadoId").value = data.empleadoId;

    // Mostrar campos según el tipo de horario
    if (data.tipoHorario === 1) {
      document.getElementById("horarioRecorrido").classList.remove("d-none");
      document.getElementById("horarioSeparado").classList.add("d-none");

      document.getElementById("HorarioInicio").value = data.horarioInicio;
      document.getElementById("HorarioFin").value = data.horarioFin;
    } else if (data.tipoHorario === 2) {
      document.getElementById("horarioRecorrido").classList.add("d-none");
      document.getElementById("horarioSeparado").classList.remove("d-none");

      document.getElementById("PrimerHorarioInicio").value = data.horarioInicio;
      document.getElementById("PrimerHorarioFin").value = data.horarioFin;
      document.getElementById("SegundoHorarioInicio").value =
        data.segundoHorarioInicio;
      document.getElementById("SegundoHorarioFin").value =
        data.segundoHorarioFin;
    }

    abrirPanelHorario();
  } catch (error) {
    MostrarErrorCatch();
  }
}
function BuscarHorarioId() {
  const id = document.getElementById("IdHorario").value;
  if (!id || id === 0) {
    CrearHorario();
  } else {
    EditarHorario(id);
  }
}

//funcion para formatear hora
function formatearHora(hora) {
  // Si está vacío o null devuelve "00:00:00", si no agrega ":00"
  return hora && hora !== "" ? `${hora}:00` : "00:00:00";
}

//funcion para crear un nuevo horario
async function CrearHorario() {
  const tipoHorario = parseInt(document.getElementById("TipoHorario").value);

  const horario = {
    tipoHorario: tipoHorario,
    lunes: document.getElementById("lunes").checked,
    martes: document.getElementById("martes").checked,
    miercoles: document.getElementById("miercoles").checked,
    jueves: document.getElementById("jueves").checked,
    viernes: document.getElementById("viernes").checked,
    sabado: document.getElementById("sabado").checked,
    domingo: document.getElementById("domingo").checked,
    empleadoId: parseInt(document.getElementById("EmpleadoId").value),

    horarioInicio: "00:00:00",
    horarioFin: "00:00:00",
    segundoHorarioInicio: "00:00:00",
    segundoHorarioFin: "00:00:00",
  };

  if (tipoHorario === 1) {
    // RECORRIDO
    horario.horarioInicio = formatearHora(
      document.getElementById("HorarioInicio").value
    );
    horario.horarioFin = formatearHora(
      document.getElementById("HorarioFin").value
    );
  } else if (tipoHorario === 2) {
    // SEPARADO
    horario.horarioInicio = formatearHora(
      document.getElementById("PrimerHorarioInicio").value
    );
    horario.horarioFin = formatearHora(
      document.getElementById("PrimerHorarioFin").value
    );
    horario.segundoHorarioInicio = formatearHora(
      document.getElementById("SegundoHorarioInicio").value
    );
    horario.segundoHorarioFin = formatearHora(
      document.getElementById("SegundoHorarioFin").value
    );
  }

  console.log("Horario que se envía:", horario);

  const res = await authFetch("Horarios", {
  method: "POST",
  body: JSON.stringify(horario),
})
  .then((response) => response.json())
  .then((data) => {
      cerrarPanelHorario();
      ObtenerHorarios();
      Swal.fire({
          title: "¡Horario Creado!",
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
  })
  .catch((error) => {
    console.log("No se pudo crear el horario:", error);
  });

}

//funcion

ObtenerHorarios();
