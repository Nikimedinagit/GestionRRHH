
////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIONES PARA EL PANEL DE HORARIOS ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function abrirPanelHorario() {
  document.getElementById("panelHorario").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("EmpleadoId");
    if (inputNombre) inputNombre.focus();
  }, 400);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION ARA CERRAR EL PANEL DE HORARIOS ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function cerrarPanelHorario() {
  document.getElementById("panelHorario").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalHorario();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION ARA TOGGLE LOS INPUTS DEL PANEL DE HORARIOS ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function toggleHorarioInputs() {
  const tipo = document.getElementById("TipoHorario").value;
  const continuoDiv = document.getElementById("horarioContinuo");
  const alternoDiv = document.getElementById("horarioAlterno");

  if (tipo === "1") {
    continuoDiv.classList.remove("d-none");
    continuoDiv.classList.add("d-flex");

    alternoDiv.classList.add("d-none");
    alternoDiv.classList.remove("d-block");
  } else if (tipo === "2") {
    alternoDiv.classList.remove("d-none");
    alternoDiv.classList.add("d-block");

    continuoDiv.classList.add("d-none");
    continuoDiv.classList.remove("d-flex");
  } else {
    continuoDiv.classList.add("d-none");
    continuoDiv.classList.remove("d-flex");

    alternoDiv.classList.add("d-none");
    alternoDiv.classList.remove("d-block");
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// ALTERNAR SEGUN SELCCION SELEC TIPO DE HORARIO /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
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

    document.getElementById("HorarioInicioBuscar").value = "";
    document.getElementById("HorarioFinBuscar").value = "";
  });


////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR LOS FILTROS DE BUSQUEDA ///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
  ObtenerHorarios();

  $("#EmpleadoIdBuscar, #TipoHorarioBuscar").on("input change", function () {
    ObtenerHorarios();
    ObtenerTotalHorarios()
  });

  $("#HorarioInicioBuscar, #HorarioFinBuscar").on("input change", function () {
    let inicio = $("#HorarioInicioBuscar").val();
    let fin = $("#HorarioFinBuscar").val();

    if (inicio && fin) {
      const fechaInicio = new Date(inicio);
      const fechaFin = new Date(fin);

      if (fechaFin < fechaInicio) {
        $("#HorarioFinBuscar").val(inicio);
      }
    }

    if ($("#filtrarHorarioSelect").val() === "si") {
      ObtenerHorarios();
      ObtenerTotalHorarios()
    }
  });

  $("#filtrarHorarioSelect").on("change", function () {
    const filtrar = $(this).val() === "si";

    $("#divFechas").toggle(filtrar);

    if (!filtrar) {
      $("#HorarioInicioBuscar, #HorarioFinBuscar").val("");
    }

    ObtenerHorarios();
    ObtenerTotalHorarios();
  });
});



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA OBTENER LOS HORARIOS ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerHorarios() {
  let tipoHorario = document.getElementById("TipoHorarioBuscar").value;
  let tipo =
    tipoHorario !== "0" && tipoHorario !== "" ? parseInt(tipoHorario) : null;

  let horarioInicioRaw = document.getElementById("HorarioInicioBuscar").value;
  let horarioFinRaw = document.getElementById("HorarioFinBuscar").value;

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
      window.horariosData = data;
      MostrarHorarios(data);
      LimpiarModalHorario();
      ObtenerTotalHorarios();
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS HORARIOS ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarHorarios(data) {
  if (window.innerWidth <= 764) {
    MostrarHorariosMobile(data);
  } else {
    MostrarHorariosDesktop(data);
  }
}

window.addEventListener("resize", function () {
    ObtenerHorarios();
});



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS HORARIOS DESKTOP ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarHorariosDesktop(data) {
  const contenedor = $("#contenedorHorarios");
  contenedor.empty();

  if (!Array.isArray(data) || data.length === 0) {
    contenedor.append(
      "<div class='text-center text-muted py-3'>No hay horarios para mostrar.</div>"
    );
    return;
  }

  const tipoColor = {
    ALTERNO: "bg-alterno",
    CONTINUO: "bg-continuo",
  };

  data.forEach((horario) => {
    const tipoStr = horario.tipoHorarioString
      ? horario.tipoHorarioString.toUpperCase()
      : "";

    const tipoClase = tipoColor[tipoStr] || "";

    const item = $(`
      <div class="horarios-item border rounded py-2 px-3 mb-2 d-flex align-items-center justify-content-between flex-wrap">
        <button class="btn-editar me-2" style="background: none; border: none;" onclick="MostrarModalEditar(${horario.id})" data-tippy-content="Editar">
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
            ${tipoStr}
          </div>
        </div>

        <div class="botones-acciones d-flex align-items-center justify-content-end" style="min-width: 120px; gap: 10px;">
          <button class="btn-eliminar" style="background: none; border: none;" onclick="EliminarHorarioId(${horario.id})" data-tippy-content="Eliminar">
            <i class="bi bi-trash icono-eliminar"></i>
          </button>
          <button class="toggle-detalle" style="background: none; border: none; font-weight: bold;" aria-expanded="false" aria-label="Mostrar detalles" data-tippy-content="Detalle">
            <i class="bi bi-chevron-down"></i>
          </button>
        </div>
      </div>
    `);

    const diasNombres = [
      { key: "lunes", label: "Lunes" },
      { key: "martes", label: "Martes" },
      { key: "miercoles", label: "Miércoles" },
      { key: "jueves", label: "Jueves" },
      { key: "viernes", label: "Viernes" },
      { key: "sabado", label: "Sábado" },
      { key: "domingo", label: "Domingo" },
    ];

    const esSeparado = tipoStr === "ALTERNO";

    let filasHorario = "";

    diasNombres.forEach((dia) => {
      if (horario[dia.key]) {
        if (esSeparado) {
          filasHorario += `
            <tr>
              <td>${dia.label}</td>
              <td class="text-center">${horario.horarioInicioString || "-"}</td>
              <td class="text-center">${horario.horarioFinString || "-"}</td>
              <td class="text-center">${horario.segundoHorarioInicioString || "-"}</td>
              <td class="text-center">${horario.segundoHorarioFinString || "-"}</td>
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
      <div class="panelHorarios px-3 pb-2" style="display: none;">
        <h3 class="titulo-sub-seccion mb-3" style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem;">Detalle de Horarios y Días</h3>
        <div class="table-responsive">
          <table class="table table-bordered table-hover">
            <colgroup>
              <col style="width: 25%" />
              <col style="width: 18%" />
              <col style="width: 18%" />
              ${esSeparado ? `<col style="width: 18%" /><col style="width: 21%" />` : ""}
            </colgroup>
            <thead>
              <tr>
                <th class="text-start header-table">Días</th>  
                <th class="text-center header-table">Inicio °1</th>
                <th class="text-center header-table">Fin °1</th>
                ${esSeparado ? `<th class="text-center header-table">Inicio °2</th><th class="text-center header-table">Fin °2</th>` : ""}
              </tr>
            </thead>
            <tbody>
              ${filasHorario || `<tr><td colspan="${esSeparado ? 5 : 3}" class="tabla-horarios-body text-center text-muted">Sin días activos</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `);

    item.find(".toggle-detalle").on("click", function () {
      const iconoChevron = $(this).find("i");

      contenedor.find(".panelHorarios:visible").not(detalleHTML).slideUp(200);
      contenedor.find(".toggle-detalle i").removeClass("bi-chevron-up").addClass("bi-chevron-down");
      contenedor.find(".toggle-detalle").attr("aria-expanded", "false");

      detalleHTML.stop(true, true).slideToggle(200);
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



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS HORARIOS MOVILES ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarHorariosMobile(data) {
  const contenedor = document.getElementById("contenedorHorarios");
  contenedor.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    contenedor.innerHTML =
      "<div class='text-center text-muted py-3'>No hay horarios para mostrar.</div>";
    return;
  }

  const tipoColor = {
    ALTERNO: "bg-alterno",
    CONTINUO: "bg-continuo",
  };
  window.horariosData = data;

  data.forEach((horario) => {
    const { id, empleadoString, puestoEmpleado, tipoHorarioString } = horario;

    const tipoStr = tipoHorarioString ? tipoHorarioString.toUpperCase() : "";
    const tipoClase = tipoColor[tipoStr] || "bg-light text-dark";

    contenedor.innerHTML += `
      <div class="col-12 col-md-6 p-2 col-lg-4 col-xl-3 d-flex">
        <div class="card shadow-sm p-2 rounded-3 d-flex flex-column w-100" style="min-height: 180px;">
          <div class="flex-grow-1 d-flex flex-column">

            <!-- Nombre del empleado -->
            <h5 class="text-start fw-bold mb-2" style="font-size: 1.2rem;">
              ${empleadoString || "Sin nombre"}
            </h5>

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


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// MOSTRAR DETALLE DE HORARIO //////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarDetalleHorario(id) {
  const horario = horariosData.find((e) => e.id === id);
  if (!horario) return;

  const esSeparado = horario.tipoHorarioString?.toLowerCase() === "alterno";

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

    inicio1Elem.textContent = horario.horarioInicioString || "-";
    fin1Elem.textContent = horario.horarioFinString || "-";

    if (
      esSeparado &&
      horario.segundoHorarioInicioString &&
      horario.segundoHorarioFinString
    ) {
      turno2Div.style.display = "block";
      inicio2Elem.textContent = horario.segundoHorarioInicioString;
      fin2Elem.textContent = horario.segundoHorarioFinString;
    } else {
      turno2Div.style.display = "none";
      inicio2Elem.textContent = "";
      fin2Elem.textContent = "";
    }
  });

  const offcanvasElement = document.getElementById("offcanvasDetalleHorario");
  const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
  offcanvas.show();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// LIMPIAR FORMULARIO DE HORARIO ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function LimpiarModalHorario() {
  document.getElementById("IdHorario").value = "";
  const inputEmpleado = document.getElementById("EmpleadoId");
  inputEmpleado.value = "";
  const selectTipoHorario = document.getElementById("TipoHorario");
  selectTipoHorario.value = 0;
  const inputHorarioInicio = document.getElementById("HorarioInicio");
  inputHorarioInicio.value = "";
  const inputHorarioFin = document.getElementById("HorarioFin");
  inputHorarioFin.value = "";
  const inputPrimerHorarioInicio = document.getElementById("PrimerHorarioInicio");
  inputPrimerHorarioInicio.value = "";
  const inputPrimerHorarioFin = document.getElementById("PrimerHorarioFin");
  inputPrimerHorarioFin.value = "";
  const inputSegundoHorarioInicio = document.getElementById("SegundoHorarioInicio");
  inputSegundoHorarioInicio.value = "";
  const inputSegundoHorarioFin = document.getElementById("SegundoHorarioFin");
  inputSegundoHorarioFin.value = "";
  const checkDiasSemana = document.getElementById("diasSemana");
  checkDiasSemana.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
    checkbox.checked = false;
  });

  inputEmpleado.classList.remove("is-invalid", "is-valid");
  selectTipoHorario.classList.remove("is-invalid", "is-valid");
  inputHorarioInicio.classList.remove("is-invalid", "is-valid");
  inputHorarioFin.classList.remove("is-invalid", "is-valid");
  inputPrimerHorarioInicio.classList.remove("is-invalid", "is-valid");
  inputPrimerHorarioFin.classList.remove("is-invalid", "is-valid");
  inputSegundoHorarioInicio.classList.remove("is-invalid", "is-valid");
  inputSegundoHorarioFin.classList.remove("is-invalid", "is-valid");

  const inputErrorEmpleado = document.getElementById("errorEmpleadoId");
  inputErrorEmpleado.textContent = "";
  inputErrorEmpleado.style.display = "none";
  const selectErrorIdTipoHorario = document.getElementById("errorTipoHorario");
  selectErrorIdTipoHorario.textContent = "";
  selectErrorIdTipoHorario.style.display = "none";
  const inputErrorHorarioInicio = document.getElementById("errorHorarioInicio");
  inputErrorHorarioInicio.textContent = "";
  inputErrorHorarioInicio.style.display = "none";
  const inputErrorHorarioFin = document.getElementById("errorHorarioFin");
  inputErrorHorarioFin.textContent = "";
  inputErrorHorarioFin.style.display = "none";
  const inputErrorPrimerHorarioInicio = document.getElementById("errorPrimerHorarioInicio");
  inputErrorPrimerHorarioInicio.textContent = "";
  inputErrorPrimerHorarioInicio.style.display = "none";
  const inputErrorPrimerHorarioFin = document.getElementById("errorPrimerHorarioFin");
  inputErrorPrimerHorarioFin.textContent = "";
  inputErrorPrimerHorarioFin.style.display = "none";
  const inputErrorSegundoHorarioInicio = document.getElementById("errorSegundoHorarioInicio");
  inputErrorSegundoHorarioInicio.textContent = "";
  inputErrorSegundoHorarioInicio.style.display = "none";
  const inputErrorSegundoHorarioFin = document.getElementById("errorSegundoHorarioFin");
  inputErrorSegundoHorarioFin.textContent = "";
  inputErrorSegundoHorarioFin.style.display = "none";
  const errorDiasSemana = document.getElementById("errorDiasSemana");
  errorDiasSemana.textContent = "";
  errorDiasSemana.style.display = "none";

  document.getElementById("horarioContinuo").classList.add("d-none");
  document.getElementById("horarioAlterno").classList.add("d-none");

  document.getElementById("EmpleadoId").disabled = false;
  document.getElementById("TipoHorario").disabled = false;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// BUSCAMOS POR ID SI EXISTE ESPARAEDITAR SINO EXISTE PARA CREAR //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function BuscarHorarioId() {
  const id = document.getElementById("IdHorario").value;
  if (!id || id === 0) {
    CrearHorario();
  } else {
    EditarHorario(id);
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR DATOS EN EL MODAL DE EDICION /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
async function MostrarModalEditar(id) {
  try {
    const response = await authFetch(`Horarios/${id}`);

    const data = await response.json();

    document.getElementById("IdHorario").value = data.id;
    document.getElementById("TipoHorario").value = data.tipoHorario;

    document.getElementById("lunes").checked = data.lunes;
    document.getElementById("martes").checked = data.martes;
    document.getElementById("miercoles").checked = data.miercoles;
    document.getElementById("jueves").checked = data.jueves;
    document.getElementById("viernes").checked = data.viernes;
    document.getElementById("sabado").checked = data.sabado;
    document.getElementById("domingo").checked = data.domingo;

    document.getElementById("EmpleadoId").value = data.empleadoId;

    document.getElementById("EmpleadoId").disabled = true;
    document.getElementById("TipoHorario").disabled = true;

    if (data.tipoHorario === 1) {
      document.getElementById("horarioContinuo").classList.remove("d-none");
      document.getElementById("horarioAlterno").classList.add("d-none");

      document.getElementById("HorarioInicio").value = data.horarioInicio;
      document.getElementById("HorarioFin").value = data.horarioFin;
    } else if (data.tipoHorario === 2) {
      document.getElementById("horarioContinuo").classList.add("d-none");
      document.getElementById("horarioAlterno").classList.remove("d-none");

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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA VALIDAR FORMULARIO ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function ValidarFormularioHorario() {
  const selectEmpleado = document.getElementById("EmpleadoId");
  const selectTipoHorario = document.getElementById("TipoHorario");

  const inputHorarioInicio = document.getElementById("HorarioInicio");
  const inputHorarioFin = document.getElementById("HorarioFin");

  const primerHorarioInicio = document.getElementById("PrimerHorarioInicio");
  const primerHorarioFin = document.getElementById("PrimerHorarioFin");
  const segundoHorarioInicio = document.getElementById("SegundoHorarioInicio");
  const segundoHorarioFin = document.getElementById("SegundoHorarioFin");

  const errorEmpleado = document.getElementById("errorEmpleadoId");
  const errorTipoHorario = document.getElementById("errorTipoHorario");
  const errorHorarioInicio = document.getElementById("errorHorarioInicio");
  const errorHorarioFin = document.getElementById("errorHorarioFin");
  const errorDiasSemana = document.getElementById("errorDiasSemana");

  const errorPrimerHorarioInicio = document.getElementById("errorPrimerHorarioInicio");
  const errorPrimerHorarioFin = document.getElementById("errorPrimerHorarioFin");
  const errorSegundoHorarioInicio = document.getElementById("errorSegundoHorarioInicio");
  const errorSegundoHorarioFin = document.getElementById("errorSegundoHorarioFin");

  // Limpiar errores previos
  [
    errorEmpleado, errorTipoHorario, errorHorarioInicio, errorHorarioFin, errorDiasSemana,
    errorPrimerHorarioInicio, errorPrimerHorarioFin, errorSegundoHorarioInicio, errorSegundoHorarioFin
  ].forEach(err => {
    err.textContent = "";
    err.style.display = "none";
  });

  [
    selectEmpleado, selectTipoHorario,
    inputHorarioInicio, inputHorarioFin,
    primerHorarioInicio, primerHorarioFin,
    segundoHorarioInicio, segundoHorarioFin
  ].forEach(input => input.classList.remove("is-invalid", "is-valid"));

  let esValido = true;

  // Validar empleado
  if (!selectEmpleado.value.trim()) {
    errorEmpleado.textContent = "Campo obligatorio.";
    errorEmpleado.style.display = "block";
    selectEmpleado.classList.add("is-invalid");
    esValido = false;
  } else {
    selectEmpleado.classList.add("is-valid");
  }

  // Validar tipo de horario
  if (!selectTipoHorario.value.trim() || selectTipoHorario.value === "0") {
    errorTipoHorario.textContent = "Campo obligatorio.";
    errorTipoHorario.style.display = "block";
    selectTipoHorario.classList.add("is-invalid");
    esValido = false;
  } else {
    selectTipoHorario.classList.add("is-valid");
  }

  // Horario continuo
  if (selectTipoHorario.value === "1") {
    if (!inputHorarioInicio.value) {
      errorHorarioInicio.textContent = "Campo obligatorio.";
      errorHorarioInicio.style.display = "block";
      inputHorarioInicio.classList.add("is-invalid");
      esValido = false;
    } else {
      inputHorarioInicio.classList.add("is-valid");
    }

    if (!inputHorarioFin.value) {
      errorHorarioFin.textContent = "Campo obligatorio.";
      errorHorarioFin.style.display = "block";
      inputHorarioFin.classList.add("is-invalid");
      esValido = false;
    } else {
      inputHorarioFin.classList.add("is-valid");
    }

    if (inputHorarioInicio.value && inputHorarioFin.value) {
      const [hiH, hiM] = inputHorarioInicio.value.split(":").map(Number);
      const [hfH, hfM] = inputHorarioFin.value.split(":").map(Number);
      const inicio = new Date(0, 0, 0, hiH, hiM);
      const fin = new Date(0, 0, 0, hfH, hfM);

      if (fin <= inicio) fin.setDate(fin.getDate() + 1)

      const duracion = (fin - inicio) / (1000 * 60);
      if (duracion <= 0) {
        errorHorarioFin.textContent = "Duración inválida.";
        errorHorarioFin.style.display = "block";
        inputHorarioFin.classList.add("is-invalid");
        esValido = false;
      } else {
        inputHorarioFin.classList.add("is-valid");
      }

    }
  }

  // Horario alterno
  if (selectTipoHorario.value === "2") {
    const horarios = [
      { inicio: primerHorarioInicio, fin: primerHorarioFin, errorIni: errorPrimerHorarioInicio, errorFin: errorPrimerHorarioFin },
      { inicio: segundoHorarioInicio, fin: segundoHorarioFin, errorIni: errorSegundoHorarioInicio, errorFin: errorSegundoHorarioFin }
    ];

    horarios.forEach(horario => {
      if (!horario.inicio.value) {
        horario.errorIni.textContent = "Campo obligatorio.";
        horario.errorIni.style.display = "block";
        horario.inicio.classList.add("is-invalid");
        esValido = false;
      } else {
        horario.inicio.classList.add("is-valid");
      }

      if (!horario.fin.value) {
        horario.errorFin.textContent = "Campo obligatorio.";
        horario.errorFin.style.display = "block";
        horario.fin.classList.add("is-invalid");
        esValido = false;
      } else {
        horario.fin.classList.add("is-valid");
      }

      if (horario.inicio.value && horario.fin.value) {
        const [hH, hM] = horario.inicio.value.split(":").map(Number);
        const [fH, fM] = horario.fin.value.split(":").map(Number);
        const inicioDate = new Date(0, 0, 0, hH, hM);
        const finDate = new Date(0, 0, 0, fH, fM);

        if (finDate <= inicioDate) {
          finDate.setDate(finDate.getDate() + 1);
        }

        const duracion = (finDate - inicioDate) / (1000 * 60)
        if (duracion <= 0) {
          horario.errorFin.textContent = "Duración inválida.";
          horario.errorFin.style.display = "block";
          horario.fin.classList.add("is-invalid");
          esValido = false;
        } else {
          horario.errorFin.style.display = "none";
          horario.fin.classList.remove("is-invalid");
          horario.fin.classList.add("is-valid");
        }
      }
    });

    if (primerHorarioFin.value && segundoHorarioInicio.value) {
      const [pfH, pfM] = primerHorarioFin.value.split(":").map(Number);
      const [piH, piM] = primerHorarioInicio.value.split(":").map(Number);
      const [siH, siM] = segundoHorarioInicio.value.split(":").map(Number);
      const primerInicioDate = new Date(0, 0, 0, piH, piM);
      const primerFinDate = new Date(0, 0, 0, pfH, pfM);

      if (primerFinDate <= primerInicioDate) primerFinDate.setDate(primerFinDate.getDate() + 1);

      const segundoInicioDate = new Date(0, 0, 0, siH, siM);
      if (segundoInicioDate <= primerFinDate) {
        segundoInicioDate.setDate(segundoInicioDate.getDate() + 1);
      }
      if (segundoInicioDate <= primerFinDate) {
        errorSegundoHorarioInicio.textContent = "El inicio del segundo horario debe ser mayor que el fin del primero.";
        errorSegundoHorarioInicio.style.display = "block";
        segundoHorarioInicio.classList.add("is-invalid");
        esValido = false;
      } else {
        errorSegundoHorarioInicio.style.display = "none";
        segundoHorarioInicio.classList.remove("is-invalid");
        segundoHorarioInicio.classList.add("is-valid")
      }
    }
  }

  // Validar días de la semana
  const diasSeleccionados = [
    "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"
  ].some(dia => document.getElementById(dia)?.checked);

  if (!diasSeleccionados) {
    errorDiasSemana.textContent = "Debe seleccionar al menos un día.";
    errorDiasSemana.style.display = "block";
    esValido = false;
  }

  return esValido;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// VAIDACION EN VIVO PARA ELFORMUALRIO DE HORARIOS ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById("EmpleadoId").addEventListener("input", () => {
  const inputEmpleado = document.getElementById("EmpleadoId");
  const errorEmpleado = document.getElementById("errorEmpleadoId");
  const empleado = inputEmpleado.value.trim();

  inputEmpleado.classList.remove("is-invalid", "is-valid");

  if (empleado.length === 0) {
    inputEmpleado.classList.add("is-invalid");
    errorEmpleado.style.display = "block";
    errorEmpleado.textContent = "Campo obligatorio.";
  } else {
    inputEmpleado.classList.add("is-valid");
    errorEmpleado.style.display = "none";
  }
});

document.getElementById("TipoHorario").addEventListener("input", () => {
  const inputTipoHorario = document.getElementById("TipoHorario");
  const errorTipoHorario = document.getElementById("errorTipoHorario");
  const tipoHorario = inputTipoHorario.value.trim();

  inputTipoHorario.classList.remove("is-invalid", "is-valid");

  if (tipoHorario.length === 0 || tipoHorario === "0") {
    inputTipoHorario.classList.add("is-invalid");
    errorTipoHorario.style.display = "block";
    errorTipoHorario.textContent = "Campo obligatorio.";
  } else {
    inputTipoHorario.classList.add("is-valid");
    errorTipoHorario.style.display = "none";
  }
});

document.getElementById("horarioContinuo").addEventListener("input", () => {
  const inputHorarioInicio = document.getElementById("HorarioInicio");
  const errorHorarioInicio = document.getElementById("errorHorarioInicio");
  const inputHorarioFin = document.getElementById("HorarioFin");
  const errorHorarioFin = document.getElementById("errorHorarioFin");

  inputHorarioInicio.classList.remove("is-invalid", "is-valid");
  inputHorarioFin.classList.remove("is-invalid", "is-valid");
  errorHorarioInicio.style.display = "none";
  errorHorarioFin.style.display = "none";

  if (!inputHorarioInicio.value) {
    inputHorarioInicio.classList.add("is-invalid");
    errorHorarioInicio.style.display = "block";
    errorHorarioInicio.textContent = "Ingrese hora de inicio.";
  } else {
    inputHorarioInicio.classList.add("is-valid");
  }

  if (!inputHorarioFin.value) {
    inputHorarioFin.classList.add("is-invalid");
    errorHorarioFin.style.display = "block";
    errorHorarioFin.textContent = "Ingrese hora de fin.";
    return;
  }

  if (inputHorarioInicio.value && inputHorarioFin.value) {
    const [hiH, hiM] = inputHorarioInicio.value.split(":").map(Number);
    const [hfH, hfM] = inputHorarioFin.value.split(":").map(Number);

    const horarioInicio = new Date(0, 0, 0, hiH, hiM);
    let horarioFin = new Date(0, 0, 0, hfH, hfM);

    if (horarioFin <= horarioInicio) {
      horarioFin.setDate(horarioFin.getDate() + 1);
    }

    // Validación final
    if (horarioFin > horarioInicio) {
      inputHorarioFin.classList.add("is-valid");
      errorHorarioFin.style.display = "none";
    } else {
      inputHorarioFin.classList.add("is-invalid");
      errorHorarioFin.style.display = "block";
      errorHorarioFin.textContent = "Debe ser mayor que la hora de inicio.";
    }
  }
});

document.getElementById("horarioAlterno").addEventListener("input", () => {
  const inputs = [
    { id: "PrimerHorarioInicio", error: "errorPrimerHorarioInicio", mensaje: "Ingrese hora de inicio." },
    { id: "PrimerHorarioFin", error: "errorPrimerHorarioFin", mensaje: "Ingrese hora de fin." },
    { id: "SegundoHorarioInicio", error: "errorSegundoHorarioInicio", mensaje: "Ingrese hora de inicio." },
    { id: "SegundoHorarioFin", error: "errorSegundoHorarioFin", mensaje: "Ingrese hora de fin." }
  ];

  const valores = {};
  inputs.forEach(item => {
    const input = document.getElementById(item.id);
    const error = document.getElementById(item.error);
    input.classList.remove("is-invalid", "is-valid");
    error.style.display = "none";
    error.textContent = "";
    valores[item.id] = input.value;

    if (!input.value) {
      input.classList.add("is-invalid");
      error.textContent = "Ingrese hora.";
      error.style.display = "block";
    } else {
      input.classList.add("is-valid");
    }
  });
});

document.getElementById("diasSemana").addEventListener("input", () => {
  const diasIds = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
  const errorDiasSemana = document.getElementById("errorDiasSemana");

  const diasSeleccionados = diasIds.filter(dia => document.getElementById(dia)?.checked);
  if (!diasSeleccionados.length) {
    errorDiasSemana.textContent = "Debe seleccionar al menos un día.";
    errorDiasSemana.style.display = "block";
    esValido = false;
  } else {
    errorDiasSemana.style.display = "none";
  }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIONES PARA VALIDAR DATOS EXISTENTES ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarErrorHorarioExistente(mensaje) {
  const errorEmpleado = document.getElementById("errorEmpleadoId");
  const inputEmpleado = document.getElementById("EmpleadoId");

  errorEmpleado.textContent = mensaje;
  errorEmpleado.style.display = "block";
  inputEmpleado.classList.add("is-invalid");
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION ARA FORMAR HORA ///////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function formatearHora(hora) {
  return hora && hora !== "" ? `${hora}:00` : "00:00:00";
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA CREAR HORARIO ///////////////////////////////////////////////////////////////////////  
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function CrearHorario() {

  if (!ValidarFormularioHorario()) return;

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
    horario.horarioInicio = formatearHora(
      document.getElementById("HorarioInicio").value
    );
    horario.horarioFin = formatearHora(
      document.getElementById("HorarioFin").value
    );
  } else if (tipoHorario === 2) {
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

  const res = await authFetch("Horarios", {
    method: "POST",
    body: JSON.stringify(horario),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        MostrarErrorHorarioExistente(response.mensaje);
      } else {
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
      }
    })

    .catch((error) => {
      MostrarErrorCatch();
    });

}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA EDITAR HORARIO ///////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EditarHorario(id) {
  if (!ValidarFormularioHorario()) return;

  const tipoHorario = parseInt(document.getElementById("TipoHorario").value);
  const horarioId = document.getElementById("IdHorario").value;

  const horarioEditar = {
    id: horarioId,
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
    horarioEditar.horarioInicio = formatearHora(document.getElementById("HorarioInicio").value);
    horarioEditar.horarioFin = formatearHora(document.getElementById("HorarioFin").value);
  } else if (tipoHorario === 2) {
    horarioEditar.horarioInicio = formatearHora(document.getElementById("PrimerHorarioInicio").value);
    horarioEditar.horarioFin = formatearHora(document.getElementById("PrimerHorarioFin").value);
    horarioEditar.segundoHorarioInicio = formatearHora(document.getElementById("SegundoHorarioInicio").value);
    horarioEditar.segundoHorarioFin = formatearHora(document.getElementById("SegundoHorarioFin").value);
  }

  try {
    const response = await authFetch(`Horarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(horarioEditar),
    });

    const result = await response.json();

    if (result.mensaje) {
      MostrarErrorHorarioExistente(result.mensaje);
      return;
    }

    cerrarPanelHorario();
    ObtenerHorarios();
    Swal.fire({
      title: "¡Horario Modificado!",
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
// FUNCION PARA MODALCONFRIMAR ELIMIANR HORARIO /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EliminarHorarioId(id) {
  Swal.fire({
    title: "¿Desea eliminar este horario?",
    html: `
      <div class="text-center">
        <p>Este horario será eliminado de forma definitiva. ¿Desea continuar?</p>
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
      if (result.isConfirmed) {
        EliminarSiHorario(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Acción Cancelada",
          text: "Continuará eliminando.",
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
// FUNCION APRA ELIMINAR HORARIO /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EliminarSiHorario(id) {
  try {
    const response = await authFetch(`Horarios/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        title: "¡Horario Eliminado!",
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
      ObtenerHorarios();
    }
  } catch (error) {
    MostrarErrorCatch();
  }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA GENERAR INFORME PDF DE HORARIOS /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function GenerarInformePdfHorarios() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  let tipoHorario = document.getElementById("TipoHorarioBuscar").value;
  let tipo = tipoHorario !== "0" && tipoHorario !== "" ? parseInt(tipoHorario) : null;
  let horarioInicioRaw = document.getElementById("HorarioInicioBuscar").value;
  let horarioFinRaw = document.getElementById("HorarioFinBuscar").value;
  let horarioInicio = horarioInicioRaw ? `${horarioInicioRaw}:00` : null;
  let horarioFin = horarioFinRaw ? `${horarioFinRaw}:00` : null;
  let empleadoTexto = document.getElementById("EmpleadoIdBuscar").value;

  let filtro = {
    tipoHorario: tipo,
    horarioInicio: horarioInicio,
    horarioFin: horarioFin,
    empleadoTexto: empleadoTexto,
  };

  const res = await authFetch("InformesGeneralesPdf/GenerarInformeHorarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filtro)
  });

  const { horarios, resumen } = await res.json();

   if (!horarios || !Array.isArray(horarios) || horarios.length === 0) {
        ErrorGeneralInformePdf();
        return;
    }

  doc.setTextColor(19, 115, 204);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Informe de Horarios", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

  let y = 29;
  const fechaHoy = new Date().toLocaleString("es-AR");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Generado:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(fechaHoy, 33, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text("Total Horarios Asignados:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.totalHorariosAsignados}`, 60, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Total Horas Semanales:", 64, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.totalHorasFormateadas}`, 109, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Empleados trabajan fines de semana:", 128, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.empleadosFindes}`, 196, y);
  y += 6;

  let filtrosAplicadosArray = [];
  if (filtro.empleadoTexto) filtrosAplicadosArray.push(`[Empleado: ${filtro.empleadoTexto}]`);
  if (filtro.tipoHorario) filtrosAplicadosArray.push(`[Tipo Horario: ${filtro.tipoHorario === 1 ? "Continuo" : "Alterno"}]`);
  if (filtro.horarioInicio) filtrosAplicadosArray.push(`[Horario Inicio: ${filtro.horarioInicio}]`);
  if (filtro.horarioFin) filtrosAplicadosArray.push(`[Horario Fin: ${filtro.horarioFin}]`);

  const filtrosAplicados = filtrosAplicadosArray.length > 0 ? filtrosAplicadosArray.join("  |  ") : "No se aplicaron";
  doc.setFont("helvetica", "normal");
  doc.text("Filtros Aplicados:", 14, y);
  doc.setFont("helvetica", "bold");
  const filtrosText = doc.splitTextToSize(filtrosAplicados, 260);
  doc.text(filtrosText, 44, y);
  y += filtrosText.length * 6 + 2;

  doc.setDrawColor(180);
  doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
  y += 7;

    doc.autoTable({
      startY: y,
      head: [["Empleado", "Puesto", "Tipo Horario", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom", "1° Entrada", "1° Salida", "2° Entrada", "2° Salida"]],
      body: horarios.map(h => [
        h.nombreCompleto,
        h.puesto,
        h.tipoHorario,
        h.lunes ? "X" : "",
        h.martes ? "X" : "",
        h.miercoles ? "X" : "",
        h.jueves ? "X" : "",
        h.viernes ? "X" : "",
        h.sabado ? "X" : "",
        h.domingo ? "X" : "",
        h.horarioInicio,
        h.horarioFin,
        h.segundoHorarioInicio,
        h.segundoHorarioFin
      ]),
      styles: { font: "helvetica", fontSize: 10 },
      headStyles: { fillColor: [19, 115, 204], textColor: 255, fontStyle: "bold" },
      margin: { left: 14, right: 14 }
    });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10, { align: "left" });
    doc.text("www.WorkSync.com", doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: "right" });
  }

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  const html = `<html><head><title>Informe de Horarios</title></head>
    <body class="pdf-body">
    <iframe class="pdf-frame" width="100%" height="100%" src="${url}"></iframe>
    </body></html>`;

  const w = window.open();
  w.document.open();
  w.document.write(html);
  w.document.close();

}



////////////////////////////////////////////////////////////////////////////////////////////////////////
//INICIALIZAR AL CARGAR LA VISTA /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
ObtenerHorarios();


