
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

  $("#EmpleadoIdBuscar, #TipoHorarioBuscar").on("input change", function () {
    ObtenerHorarios(false);
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
      ObtenerHorarios(false);
      ObtenerTotalHorarios()
    }
  });

  $("#filtrarHorarioSelect").on("change", function () {
    const filtrar = $(this).val() === "si";

    $("#divFechas").toggle(filtrar);

    if (!filtrar) {
      $("#HorarioInicioBuscar, #HorarioFinBuscar").val("");
    }

    ObtenerHorarios(false);
    ObtenerTotalHorarios();
  });
});



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA OBTENER LOS HORARIOS ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerHorarios(mostrarSpinner = true) {

  if (mostrarSpinner) mostrarPantallaCarga();

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
    })

    .finally(() => { if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1200); } });
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
  ObtenerHorarios(false);
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
      <div id="horarioContainer">
      <div class="border rounded py-2 px-2 mb-2 d-flex align-items-center justify-content-between flex-wrap bg-white">
        <button class="btn-editar" style="background: none; border: none;" onclick="MostrarModalEditar(${horario.id})" data-tippy-content="Editar">
          <i class="bi bi-pencil-square icono-editar"></i>
        </button>

        <div class="info-horario d-flex align-items-center flex-grow-1" style="gap: 30px; position: relative; min-width: 0;">
          <div class="empleado fw-bold text-truncate">
            ${horario.empleadoString || "Sin nombre"}
          </div>
          <div class="puesto text-muted small text-truncate">
            ${horario.puestoEmpleado || "Sin puesto"}
          </div>
          <div class="badge tipo text-truncate ${tipoClase}">
            ${tipoStr}
          </div>
        </div>

        <div class="botones-acciones d-flex align-items-center justify-content-end" style="min-width: 120px; gap: 10px;">
          <button class="btn-borrar" style="background: none; border: none;" onclick="EliminarHorarioId(${horario.id})" data-tippy-content="Eliminar">
            <i class="bi bi-trash3 icono-borrar"></i>
          </button>
          <button class="toggle-detalle" style="background: none; border: none; font-weight: bold;" aria-expanded="false" aria-label="Mostrar detalles" data-tippy-content="Detalle">
            <i class="bi bi-chevron-down"></i>
          </button>
        </div>
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
      <div class="panelHorarios px-2 mb-2 container" style="display: none; background-color: #ffffff;">
        <h3 class="p-2 mt-1" style="font-size: 1rem; font-weight: 600;">Detalle de los Horarios y Días</h3>
        <div class="table-responsive pb-2">
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

      const estaVisible = detalleHTML.is(":visible");

      detalleHTML.stop(true, true).slideToggle(200);
      iconoChevron
        .removeClass("bi-chevron-up bi-chevron-down")
        .addClass(estaVisible ? "bi-chevron-down" : "bi-chevron-up");
      $(this).attr("aria-expanded", !estaVisible);

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
      <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex mb-3" id="horarioContainer">
        <div class="card shadow-sm p-2 position-relative rounded d-flex flex-column w-100" style="min-height: 180px;">
          <div class="flex-grow-1 d-flex flex-column">

            <h5 class="text-start fw-bold mb-2" style="font-size: 1.2rem;">
              ${empleadoString || "Sin nombre"}
            </h5>

            <p class="mb-2 my-1 text-muted d-flex align-items-center" style="font-size: 0.9rem;">
              ${puestoEmpleado || "Sin puesto"}
            </p>

            <span class="badge ${tipoClase} my-2" style="width: fit-content; font-size: 1rem;">
              ${tipoStr}
            </span>
          </div>

          <!-- Botones de acción -->
          <div class="d-flex justify-content-between mt-3 align-items-center">
            <div>
              <button class="btn-ver" onclick="MostrarDetalleHorario(${id})" data-tippy-content="Detalle" style="background: none; border: none;">
                <i class="bi bi-info-circle icono-ver btn-sm"></i>
              </button>
            </div>
            <div>
              <button class="btn-editar" onclick="MostrarModalEditar(${id})" data-tippy-content="Editar" style="background: none; border: none;">
                <i class="bi bi-pencil-square icono-editar btn-sm"></i>
              </button>
              <button class="btn-eliminar" onclick="EliminarHorarioId(${id})" data-tippy-content="Eliminar" style="background: none; border: none;">
                <i class="bi bi-trash icono-borrar btn-sm"></i>
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
/// LIMPIAR FORMULARIO DE HORARIO ////////////////////////////////////// //////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function LimpiarModalHorario() {

     ObtenerEmpleadosSinHorariosDropDown(); 

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

    await ObtenerEmpleadosSinHorariosDropDown(data.empleadoId);

    document.getElementById("EmpleadoId").value = data.empleadoId;

    document.getElementById("TipoHorario").value = data.tipoHorario;

    document.getElementById("lunes").checked = data.lunes;
    document.getElementById("martes").checked = data.martes;
    document.getElementById("miercoles").checked = data.miercoles;
    document.getElementById("jueves").checked = data.jueves;
    document.getElementById("viernes").checked = data.viernes;
    document.getElementById("sabado").checked = data.sabado;
    document.getElementById("domingo").checked = data.domingo;

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
      document.getElementById("SegundoHorarioInicio").value = data.segundoHorarioInicio;
      document.getElementById("SegundoHorarioFin").value = data.segundoHorarioFin;
    }

    abrirPanelHorario();

  } catch (error) {
    MostrarErrorCatch();
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCION QUE CONVIERTE A MINUTOS Y MANEJA LOS CRUCE DEL DIA //////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function obtenerRangoMinutos(horaInicio, horaFin) {
  const [hI, mI] = horaInicio.split(":").map(Number);
  const [hF, mF] = horaFin.split(":").map(Number);

  let inicio = hI * 60 + mI;
  let fin = hF * 60 + mF;

  if (fin < inicio) fin += 24 * 60;

  return { inicio, fin, duracion: fin - inicio };
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCION QUE SIRPE APRA VALIDAR LOS BLOQIES DE INICIO Y FIN DE AMBOS
////////////////////////////////////////////////////////////////////////////////////////////////////////
function validarBloque(inicioInput, finInput, errorIni, errorFin) {
  let valido = true;

  errorIni.textContent = "";
  errorFin.textContent = "";
  errorIni.style.display = "none";
  errorFin.style.display = "none";

  inicioInput.classList.remove("is-invalid", "is-valid");
  finInput.classList.remove("is-invalid", "is-valid");

  if (!inicioInput.value) {
    errorIni.textContent = "Obligatorio.";
    errorIni.style.display = "block";
    inicioInput.classList.add("is-invalid");
    valido = false;
  }

  if (!finInput.value) {
    errorFin.textContent = "Obligatorio.";
    errorFin.style.display = "block";
    finInput.classList.add("is-invalid");
    valido = false;
  }

  if (inicioInput.value && finInput.value) {
    const rango = obtenerRangoMinutos(inicioInput.value, finInput.value);

    if (rango.duracion <= 0) {
      errorFin.textContent = "Fin debe ser mayor que inicio.";
      errorFin.style.display = "block";
      finInput.classList.add("is-invalid");
      valido = false;
    } else {
      inicioInput.classList.add("is-valid");
      finInput.classList.add("is-valid");
    }
  }

  return valido;
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
  const errorDiasSemana = document.getElementById("errorDiasSemana");

  const errorHorarioInicio = document.getElementById("errorHorarioInicio");
  const errorHorarioFin = document.getElementById("errorHorarioFin");

  const errorPrimerHorarioInicio = document.getElementById("errorPrimerHorarioInicio");
  const errorPrimerHorarioFin = document.getElementById("errorPrimerHorarioFin");
  const errorSegundoHorarioInicio = document.getElementById("errorSegundoHorarioInicio");
  const errorSegundoHorarioFin = document.getElementById("errorSegundoHorarioFin");

  let esValido = true;

  [errorEmpleado, errorTipoHorario, errorDiasSemana].forEach(e => {
    e.textContent = "";
    e.style.display = "none";
  });

  [selectEmpleado, selectTipoHorario].forEach(i =>
    i.classList.remove("is-invalid", "is-valid")
  );

  if (!selectEmpleado.value.trim()) {
    errorEmpleado.textContent = "Obligatorio.";
    errorEmpleado.style.display = "block";
    selectEmpleado.classList.add("is-invalid");
    esValido = false;
  } else {
    selectEmpleado.classList.add("is-valid");
  }

  if (!selectTipoHorario.value || selectTipoHorario.value === "0") {
    errorTipoHorario.textContent = "Obligatorio.";
    errorTipoHorario.style.display = "block";
    selectTipoHorario.classList.add("is-invalid");
    esValido = false;
  } else {
    selectTipoHorario.classList.add("is-valid");
  }

  if (selectTipoHorario.value === "1") {
    const valido = validarBloque(
      inputHorarioInicio, inputHorarioFin,
      errorHorarioInicio, errorHorarioFin
    );
    if (!valido) esValido = false;
  }

  if (selectTipoHorario.value === "2") {
    const bloque1Valido = validarBloque(
      primerHorarioInicio, primerHorarioFin,
      errorPrimerHorarioInicio, errorPrimerHorarioFin
    );

    const bloque2Valido = validarBloque(
      segundoHorarioInicio, segundoHorarioFin,
      errorSegundoHorarioInicio, errorSegundoHorarioFin
    );

    if (!bloque1Valido || !bloque2Valido) esValido = false;

    if (bloque1Valido && bloque2Valido) {
      const rango1 = obtenerRangoMinutos(primerHorarioInicio.value, primerHorarioFin.value);
      let rango2 = obtenerRangoMinutos(segundoHorarioInicio.value, segundoHorarioFin.value);

      if (rango2.inicio <= rango1.fin) {
        rango2.inicio += 24 * 60;
        rango2.fin += 24 * 60;
      }

      if (rango2.inicio <= rango1.fin) {
        errorSegundoHorarioInicio.textContent = "Debe empezar después del primero.";
        errorSegundoHorarioInicio.style.display = "block";
        segundoHorarioInicio.classList.add("is-invalid");
        esValido = false;
      }
    }
  }

  const diasSeleccionados = [
    "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"
  ].some(dia => document.getElementById(dia)?.checked);

  if (!diasSeleccionados) {
    errorDiasSemana.textContent = "Seleccione al menos un día.";
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
  const inicioInput = document.getElementById("HorarioInicio");
  const finInput = document.getElementById("HorarioFin");
  const errorInicio = document.getElementById("errorHorarioInicio");
  const errorFin = document.getElementById("errorHorarioFin");

  [inicioInput, finInput].forEach(i => i.classList.remove("is-invalid", "is-valid"));
  [errorInicio, errorFin].forEach(e => { e.style.display = "none"; e.textContent = ""; });

  if (!inicioInput.value) {
    inicioInput.classList.add("is-invalid");
    errorInicio.textContent = "Ingrese hora de inicio.";
    errorInicio.style.display = "block";
    return;
  }

  if (!finInput.value) {
    finInput.classList.add("is-invalid");
    errorFin.textContent = "Ingrese hora de fin.";
    errorFin.style.display = "block";
    return;
  }

  const rango = obtenerRangoMinutos(inicioInput.value, finInput.value);

  if (rango.duracion <= 0) {
    finInput.classList.add("is-invalid");
    errorFin.textContent = "La hora fin debe ser mayor que la de inicio.";
    errorFin.style.display = "block";
  } else {
    inicioInput.classList.add("is-valid");
    finInput.classList.add("is-valid");
  }
});


document.getElementById("horarioAlterno").addEventListener("input", () => {
  const pInicio = document.getElementById("PrimerHorarioInicio");
  const pFin = document.getElementById("PrimerHorarioFin");
  const sInicio = document.getElementById("SegundoHorarioInicio");
  const sFin = document.getElementById("SegundoHorarioFin");

  const ePI = document.getElementById("errorPrimerHorarioInicio");
  const ePF = document.getElementById("errorPrimerHorarioFin");
  const eSI = document.getElementById("errorSegundoHorarioInicio");
  const eSF = document.getElementById("errorSegundoHorarioFin");

  const limpiar = (input, error) => {
    input.classList.remove("is-invalid", "is-valid");
    error.style.display = "none";
    error.textContent = "";
  };

  [[pInicio,ePI],[pFin,ePF],[sInicio,eSI],[sFin,eSF]].forEach(([i,e]) => limpiar(i,e));

  // 🔹 BLOQUE 1
  let r1 = null;
  if (pInicio.value && pFin.value) {
    r1 = obtenerRangoMinutos(pInicio.value, pFin.value);
    if (r1.duracion <= 0) {
      pFin.classList.add("is-invalid");
      ePF.textContent = "Fin debe ser mayor que inicio.";
      ePF.style.display = "block";
    } else {
      pInicio.classList.add("is-valid");
      pFin.classList.add("is-valid");
    }
  }

  // 🔹 BLOQUE 2
  let r2 = null;
  if (sInicio.value && sFin.value) {
    r2 = obtenerRangoMinutos(sInicio.value, sFin.value);
    if (r2.duracion <= 0) {
      sFin.classList.add("is-invalid");
      eSF.textContent = "Fin debe ser mayor que inicio.";
      eSF.style.display = "block";
    } else {
      sInicio.classList.add("is-valid");
      sFin.classList.add("is-valid");
    }
  }

  // 🔹 NO SUPERPOSICIÓN ENTRE BLOQUES
  if (r1 && r2) {
    let inicio2 = r2.inicio;
    let fin2 = r2.fin;

    if (inicio2 <= r1.fin) {
      inicio2 += 24 * 60;
      fin2 += 24 * 60;
    }

    if (inicio2 <= r1.fin) {
      sInicio.classList.add("is-invalid");
      eSI.textContent = "Debe iniciar después de que termine el primero.";
      eSI.style.display = "block";
    }
  }
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

  if (!ValidarFormularioHorario()) {
    ocultarOverlayGuardando();
    return;
  }

  mostrarOverlayGuardando();

  try {
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
      horarioInicio: null,
      horarioFin: null,
      segundoHorarioInicio: null,
      segundoHorarioFin: null,
    };

    if (tipoHorario === 1) {
      horario.horarioInicio = formatearHora(document.getElementById("HorarioInicio").value);
      horario.horarioFin = formatearHora(document.getElementById("HorarioFin").value);
      delete horario.segundoHorarioInicio;
      delete horario.segundoHorarioFin;
    } else if (tipoHorario === 2) {
      horario.horarioInicio = formatearHora(document.getElementById("PrimerHorarioInicio").value);
      horario.horarioFin = formatearHora(document.getElementById("PrimerHorarioFin").value);
      horario.segundoHorarioInicio = formatearHora(document.getElementById("SegundoHorarioInicio").value);
      horario.segundoHorarioFin = formatearHora(document.getElementById("SegundoHorarioFin").value);
    }

    const response = await authFetch("Horarios", {
      method: "POST",
      body: JSON.stringify(horario),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorHorarioExistente(errorData.mensaje);
      } else {
        MostrarErrorCatch();
      }
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      ObtenerHorarios(false);
      cerrarPanelHorario();
      ObtenerEmpleadosSinHorariosDropDown();

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
    }, 800);

  } catch (error) {
    MostrarErrorCatch();
    ocultarOverlayGuardando();
  }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA EDITAR HORARIO ///////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function EditarHorario(id) {
  if (!ValidarFormularioHorario()) {
    ocultarOverlayGuardando();
    return;
  }

  mostrarOverlayGuardando();

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

    horarioInicio: null,
    horarioFin: null,
    segundoHorarioInicio: null,
    segundoHorarioFin: null,
  };

  if (tipoHorario === 1) {
    const inicio = document.getElementById("HorarioInicio").value;
    const fin = document.getElementById("HorarioFin").value;
    if (inicio) horarioEditar.horarioInicio = formatearHora(inicio);
    if (fin) horarioEditar.horarioFin = formatearHora(fin);

    delete horarioEditar.segundoHorarioInicio;
    delete horarioEditar.segundoHorarioFin;

  } else if (tipoHorario === 2) {
    const primerInicio = document.getElementById("PrimerHorarioInicio").value;
    const primerFin = document.getElementById("PrimerHorarioFin").value;
    const segundoInicio = document.getElementById("SegundoHorarioInicio").value;
    const segundoFin = document.getElementById("SegundoHorarioFin").value;

    if (primerInicio) horarioEditar.horarioInicio = formatearHora(primerInicio);
    if (primerFin) horarioEditar.horarioFin = formatearHora(primerFin);
    if (segundoInicio) horarioEditar.segundoHorarioInicio = formatearHora(segundoInicio);
    if (segundoFin) horarioEditar.segundoHorarioFin = formatearHora(segundoFin);
  }
  try {
    const response = await authFetch(`Horarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(horarioEditar),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorHorarioExistente(errorData.mensaje);
      } else {
        MostrarErrorCatch();
      }
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      ObtenerHorarios(false);

      cerrarPanelHorario();

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

    }, 800);

  } catch (error) {
    MostrarErrorCatch();
    ocultarOverlayGuardando();
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
          text: "Permanece registrada.",
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
      ObtenerHorarios(false);
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

  const esMobile = window.innerWidth < 768;
  if (esMobile) {
    doc.save("Informe_Horarios.pdf");
    return;
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


