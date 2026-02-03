
/////////////////////////////////////////////////////////////
//Funcion para abrir el panel de empleado ///////////////////
/////////////////////////////////////////////////////////////
function AbrirPanelEmpleado() {
  let id = document.getElementById("IdEmpleado").value;
  console.log(id);
  if (!id) {
    document.getElementById("EstadoCivilEmpleado").value = "0";
    document.getElementById("TipoSexoEmpleado").value = "0";
    document.getElementById("IdLocalidad").value = "0";
    document.getElementById("IdPuesto").value = "0";

    document.getElementById("panelEmpleado").classList.add("abierto");
    const fondo = document.getElementById("fondoOscuro");
    fondo.classList.add("visible");

    setTimeout(() => {
      const inputNombre = document.getElementById("NombreEmpleado");
      if (inputNombre) inputNombre.focus();
    }, 400);
  } else {
    document.getElementById("panelEmpleado").classList.add("abierto");
    const fondo = document.getElementById("fondoOscuro");
    fondo.classList.add("visible");

    setTimeout(() => {
      const inputNombre = document.getElementById("NombreEmpleado");
      if (inputNombre) inputNombre.focus();
    }, 400);
  }
}


/////////////////////////////////////////////////////////////
//Funcion para cerrar el panel de empleado ///////////////////
/////////////////////////////////////////////////////////////
function CerrarPanelEmpleado() {
  document.getElementById("panelEmpleado").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarFormularioEmpleado();
}


/////////////////////////////////////////////////////////////
//INICIO ONCHANGE DE FILTROS ////////////////////////////////
/////////////////////////////////////////////////////////////
$(document).ready(function () {
  const filtros = "#EmpleadoIdBuscar, #DniEmpleadoFiltro, #EstadoCivilEmpleadoFiltro, #TipoSexoEmpleadoFiltro, #IdLocalidadFiltro, #IdPuestoFiltro, #NroLegajoFiltro";

  $(filtros).on("input change", () => {
    ObtenerEmpleados(false);
    ObtenerTotalEmpleados();
  });

  ObtenerEmpleados(false);
  ObtenerTotalEmpleados();
});



/////////////////////////////////////////////////////////////
// COMPLETAR SELECT LOCALDIADES Y PUESTOS //////////////////
/////////////////////////////////////////////////////////////
async function ComboParaFiltrarLocalidadPuesto() {
  const resLocalidades = await authFetch("Localidades/Activos", {
    method: "GET",
  });
  const localidades = await resLocalidades.json();

  const $comboLocalidad = $("#IdLocalidadFiltro");
  $comboLocalidad.empty();

  let opciones = `<option value="0">[Todas]</option>`;
  localidades.forEach((item) => {
    opciones += `<option value="${item.id}">${item.nombre}</option>`;
  });
  $comboLocalidad.html(opciones);

  const resPuestos = await authFetch("Puestos/Activos", {
    method: "GET",
  });
  const puestos = await resPuestos.json();

  const $comboPuesto = $("#IdPuestoFiltro");
  $comboPuesto.empty();

  let opcionesPuesto = `<option value="0">[Todas]</option>`;
  puestos.forEach((item) => {
    opcionesPuesto += `<option value="${item.id}">${item.descripcion}</option>`;
  });
  $comboPuesto.html(opcionesPuesto);

  ObtenerEmpleados();
}


/////////////////////////////////////////////////////////////
// OBTENER DATOS DE LA API /////////////////////////////////////
/////////////////////////////////////////////////////////////
async function ObtenerEmpleados(mostrarSpinner = true) {

  if (mostrarSpinner) mostrarPantallaCarga();

  try {
    let nombreCompleto = document.getElementById("EmpleadoIdBuscar").value;
    let dniEmpleado = document.getElementById("DniEmpleadoFiltro").value;
    let nroLegajo = document.getElementById("NroLegajoFiltro").value;
    let estadoCivilEmpleado = document.getElementById("EstadoCivilEmpleadoFiltro").value;
    let estadoCivil = estadoCivilEmpleado !== "0" && estadoCivilEmpleado !== "" ? parseInt(estadoCivilEmpleado) : null;
    let tipoSexoEmpleado = document.getElementById("TipoSexoEmpleadoFiltro").value;
    let tipoSexo = tipoSexoEmpleado !== "0" && tipoSexoEmpleado !== "" ? parseInt(tipoSexoEmpleado) : null;
    let localidadFiltro = document.getElementById("IdLocalidadFiltro").value;
    let puestoFiltro = document.getElementById("IdPuestoFiltro").value;

    let filtro = {
      nombreCompleto: nombreCompleto,
      dNI: dniEmpleado ? Number(dniEmpleado) : null,
      nroLegajo: nroLegajo,
      estadoCiviles: estadoCivil,
      tipoSexo: tipoSexo,
      localidadId: localidadFiltro === "0" ? null : Number(localidadFiltro),
      puestoId: puestoFiltro === "0" ? null : Number(puestoFiltro),
    };

    const response = await authFetch("Empleados/Filtrar", {
      method: "POST",
      body: JSON.stringify(filtro),
    })

    const data = await response.json();
    MostrarEmpleados(data);
    LimpiarFormularioEmpleado();
    ObtenerTotalEmpleados();

  } catch (error) {
    MostrarErrorCatch();
  }

  finally { if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1200); } };

}

///////////////////////////////////////////////////////////////////
// FUNCION PARA OBTENER EL ESTADO CIVIL EN TEXTO SEGUN SEXO /////////////////////
/////////////////////////////////////////////////////////////////////
function obtenerEstadoCivilTexto(estadoCivil, tipoSexo) {
  switch (estadoCivil.toUpperCase()) {
    case "SOLTERO":
      return tipoSexo === 2 ? "SOLTERA" : "SOLTERO";
    case "CASADO":
      return tipoSexo === 2 ? "CASADA" : "CASADO";
    case "DIVORCIADO":
      return tipoSexo === 2 ? "DIVORCIADA" : "DIVORCIADO";
    case "VIUDO":
      return tipoSexo === 2 ? "VIUDA" : "VIUDO";
    default:
      return estadoCivil.toUpperCase();
  }
}



/////////////////////////////////////////////////////////////
// FUNCIONES PARA MOSTRAR LOS DATOS DE LA API ///////////////
/////////////////////////////////////////////////////////////
function MostrarEmpleados(data) {
  const contenedor = $("#empleadosContainer");
  contenedor.empty();

  if (!data.length) {
    contenedor.append(`
      <div class="col-12 text-center text-muted">No hay empleados para mostrar.</div>
    `);
    return;
  }

  window.empleadosData = data;

  data.forEach((item) => {
    const nombre = item.nombreCompleto || "-";
    const puesto = item.puestoIdString || "-";
    const email = item.email || "-";
    const telefono = item.telefono || "-";
    const dni = item.dni || "-";

    let estadoCivil = obtenerEstadoCivilTexto(item.estadoCivilesString || "-", item.tipoSexo);


    const activo = item.eliminado == false;
    const textoEstado = activo ? "A" : "D";
    const tooltipEstadoBadge = activo ? "Activo" : "Desactivado";
    const claseEstado = activo
      ? "badge-empleado-activo"
      : "badge-empleado-desactivado";

    contenedor.append(`
      <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex">
        <div class="card shadow-sm p-2 rounded position-relative d-flex flex-column w-100" style="border-bottom: 4px solid ${activo ? "#198754" : "#DC3545"
      }; background-color: ${activo ? "#ffffff" : "#f8d7da3b"} ;  min-height: 260px;">
          <div class="flex-grow-1 d-flex flex-column">

            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="fw-bold mb-0" style="font-size: 1rem;">${nombre}</h5>
              <span class="badge ${claseEstado}" style="font-size: 0.65rem fw-bold; padding: 0.2em 0.45em;" data-tippy-content="${tooltipEstadoBadge}">${textoEstado}</span>
            </div>

            <p class="mb-1 text-muted d-flex align-items-center" style="font-size: 0.9rem;">
              <i class="bi bi-briefcase me-2" style="font-size: 1rem;"></i>
              <span>${puesto}</span>
            </p>

            <p class="mb-1 text-muted d-flex align-items-center" style="font-size: 0.9rem;">
              <i class="bi bi-envelope me-2" style="font-size: 1rem;"></i>
              <span class="flex-text">${email}</span>
            </p>

            <p class="mb-2 text-muted d-flex align-items-center" style="font-size: 0.9rem;">
              <i class="bi bi-telephone me-2" style="font-size: 1rem;"></i>
              <span>${telefono}</span>
            </p>

            <hr class="m-0 mb-2"/>

            <div class="d-flex gap-2 flex-wrap">
              <span class="badge text-dark" style="background-color: #d0e7ff; font-size: 0.75rem;">DNI: ${dni}</span>
              <span class="badge text-dark" style="background-color: #d4edda; font-size: 0.75rem;">${estadoCivil}</span>
            </div>
          </div>

        <div class="d-flex justify-content-between mt-2 align-items-center">
          <div>
            <button class="btn-historial" style="background: none; border: none; cursor: pointer;" onclick="VerHistorialEmpleado(${item.id
      })" data-tippy-content="Historial">
              <i class="bi bi-card-text btn-sm icono-historial"></i>
            </button>
          </div>
          <div>
            <button class="btn-ver" style="background: none; border: none; cursor: pointer;" onclick="MostrarDetalleEmpleado(${item.id
      })" data-tippy-content="Ver más">
              <i class="bi bi-info-circle btn-sm icono-ver"></i>
            </button>
            <button class="btn-editar" style="background: none; border: none; cursor: pointer;" onclick="MostrarModalEditarEmpleado(${item.id
      })" data-tippy-content="Editar">
              <i class="bi bi-pencil-square btn-sm icono-editar"></i>
            </button>
          </div>
        </div>
        </div>
        </div>
      </div>
    `);
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}


/////////////////////////////////////////////////////////////
// MOSTRAR DETALLE DE LOS EMPLEADO POR ID ////////////////////
/////////////////////////////////////////////////////////////
function MostrarDetalleEmpleado(id) {
  const empleado = empleadosData.find((e) => e.id === id);
  if (!empleado) return;

  const tipoSexoMap = {
    1: "MASCULINO",
    2: "FEMENINO",
    3: "NO BINARIO",
    4: "OTRO",
  };

  document.getElementById("detalleNombre").textContent =
    empleado.nombreCompleto || "";
  document.getElementById("detalleDni").textContent = empleado.dni || "";
  document.getElementById("detalleCuil").textContent = empleado.cuil || "";
  document.getElementById("detalleTelefono").textContent =
    empleado.telefono || "";
  document.getElementById("detalleEmail").textContent = empleado.email || "";
  document.getElementById("detalleFechaNacimiento").textContent =
    empleado.fechaNacimientoString || "";
  document.getElementById("detalleDireccion").textContent =
    empleado.direccion || "";
  document.getElementById("detalleEstadoCivil").textContent =
    obtenerEstadoCivilTexto(empleado.estadoCivilesString || "-", empleado.tipoSexo);
  document.getElementById("detalleCantidadHijos").textContent =
    empleado.cantidadHijos || 0;
  document.getElementById("detallePuesto").textContent =
    empleado.puestoIdString || "";
  document.getElementById("detalleLegajo").textContent =
    empleado.nroLegajo || "";
  document.getElementById("detalleEdad").textContent =
    empleado.edad + " AÑOS" || "";
  document.getElementById("detalleLocalidad").textContent =
    empleado.localidadIdString || "";
  document.getElementById("detalleSexo").textContent =
    tipoSexoMap[empleado.tipoSexo] || "";
  document.getElementById("detalleNombreCreador").textContent =
    empleado.usuarioNombreCreador || "";
  document.getElementById("detalleEmailCreador").textContent =
    empleado.usuarioEmailCreador || "";

  const offcanvas = new bootstrap.Offcanvas("#offcanvasDetalleEmpleado");
  offcanvas.show();
}


///////////////////////////////////////////////////////////////////////////////
// MOSTRAR DAATOS EN EL MODAL DE EDITAR EMPLEADO //////////////////////////////
///////////////////////////////////////////////////////////////////////////////
async function MostrarModalEditarEmpleado(id) {
  const res = await authFetch(`Empleados/${id}`);
  const empleado = await res.json();

  const fecha = new Date(empleado.fechaNacimiento);
  const fechaFormateada = fecha.toISOString().slice(0, 10);

  document.getElementById("IdEmpleado").value = empleado.id;
  document.getElementById("NombreEmpleado").value = empleado.nombreCompleto;
  document.getElementById("DniEmpleado").value = empleado.dni;
  document.getElementById("CuilEmpleado").value = empleado.cuil || "";
  document.getElementById("TelefonoEmpleado").value = empleado.telefono;
  document.getElementById("EmailEmpleado").value = empleado.email;
  document.getElementById("FechaNacimientoEmpleado").value = fechaFormateada;
  document.getElementById("DireccionEmpleado").value = empleado.direccion;
  document.getElementById("EstadoCivilEmpleado").value = empleado.estadoCiviles;
  document.getElementById("CantidadHijosEmpleado").value = empleado.cantidadHijos;
  document.getElementById("TipoSexoEmpleado").value = empleado.tipoSexo;
  document.getElementById("IdLocalidad").value = empleado.localidadId;
  document.getElementById("IdPuesto").value = empleado.puestoId;

  document.getElementById("DniEmpleado").disabled = true;
  document.getElementById("EmailEmpleado").disabled = true;
  document.getElementById("FechaNacimientoEmpleado").disabled = true;
  document.getElementById("CuilEmpleado").disabled = true;
  document.getElementById("NombreEmpleado").disabled = true;

  AbrirPanelEmpleado();
}


///////////////////////////////////////////////////////////////////////////////
// BUSCAMOS EL ID PAR AVER SI ES NUEVO O EXISTE //////////////////////////////
///////////////////////////////////////////////////////////////////////////////
function BuscarEmpleadoId() {
  const id = parseInt(document.getElementById("IdEmpleado").value);
  if (!id || id === 0) {
    CrearEmpleado();
  } else {
    EditarEmpleado(id);
  }
}


///////////////////////////////////////////////////////////////////////////////
// FUNCION PARA VALIDAR EL FORMULARIO DE EMPLEADO /////////////////////////////
///////////////////////////////////////////////////////////////////////////////
function ValidarFormularioEmpleado() {
  const inputNombre = document.getElementById("NombreEmpleado");
  const inputErrorNombre = document.getElementById("errorNombreEmpleado");

  const inputDni = document.getElementById("DniEmpleado");
  const inputErrorDni = document.getElementById("errorDniEmpleado");

  const inputTelefono = document.getElementById("TelefonoEmpleado");
  const inputErrorTelefono = document.getElementById("errorTelefonoEmpleado");

  const inputFechaNacimiento = document.getElementById(
    "FechaNacimientoEmpleado"
  );
  const inputErrorFechaNacimiento = document.getElementById(
    "errorFechaNacimientoEmpleado"
  );

  const inputDireccion = document.getElementById("DireccionEmpleado");
  const inputErrorDireccion = document.getElementById("errorDireccionEmpleado");

  const inputTipoSexo = document.getElementById("TipoSexoEmpleado");
  const inputErrorTipoSexo = document.getElementById("errorTipoSexoEmpleado");

  const inputIdLocalidad = document.getElementById("IdLocalidad");
  const inputErrorIdLocalidad = document.getElementById("errorIdLocalidad");

  const inputIdPuesto = document.getElementById("IdPuesto");
  const inputErrorIdPuesto = document.getElementById("errorIdPuesto");

  const inputGmail = document.getElementById("EmailEmpleado");
  const inputErrorGmail = document.getElementById("errorEmailEmpleado");

  const inputCantidadHijos = document.getElementById("CantidadHijosEmpleado");
  const inputErrorCantidadHijos = document.getElementById(
    "errorCantidadHijosEmpleado"
  );

  const inputCuil = document.getElementById("CuilEmpleado");
  const inputErrorCuil = document.getElementById("errorCuilEmpleado");

  const inputEstadoCivil = document.getElementById("EstadoCivilEmpleado");
  const inputErrorEstadoCivil = document.getElementById(
    "errorEstadoCivilEmpleado"
  );

  const nombre = inputNombre.value.trim();
  const dni = inputDni.value.trim();
  const telefono = inputTelefono.value.trim();
  const fechaNacimiento = inputFechaNacimiento.value.trim();
  const direccion = inputDireccion.value.trim();
  const tipoSexo = inputTipoSexo.value.trim();
  const localidadId = inputIdLocalidad.value.trim();
  const puestoId = inputIdPuesto.value.trim();
  const gmail = inputGmail.value.trim();

  const cantidadHijos = inputCantidadHijos.value.trim();
  const cuil = inputCuil.value.trim();
  const estadoCivil = inputEstadoCivil.value.trim();

  const inputs = [
    inputNombre,
    inputDni,
    inputTelefono,
    inputFechaNacimiento,
    inputDireccion,
    inputTipoSexo,
    inputIdLocalidad,
    inputIdPuesto,
    inputGmail,
    inputCantidadHijos,
    inputCuil,
    inputEstadoCivil,
  ];
  const errores = [
    inputErrorNombre,
    inputErrorDni,
    inputErrorTelefono,
    inputErrorFechaNacimiento,
    inputErrorDireccion,
    inputErrorTipoSexo,
    inputErrorIdLocalidad,
    inputErrorIdPuesto,
    inputErrorGmail,
    inputErrorCantidadHijos,
    inputErrorCuil,
    inputErrorEstadoCivil,
  ];
  inputs.forEach((input) => input.classList.remove("is-invalid", "is-valid"));
  errores.forEach((error) => (error.style.display = "none"));

  let esValido = true;

  if (nombre.length === 0) {
    inputNombre.classList.add("is-invalid");
    inputErrorNombre.textContent = "Campo obligatorio.";
    inputErrorNombre.style.display = "block";
    esValido = false;
  } else if (nombre.length < 3) {
    inputNombre.classList.add("is-invalid");
    inputErrorNombre.textContent = "Mínimo 3 caracteres.";
    inputErrorNombre.style.display = "block";
    esValido = false;
  } else {
    inputNombre.classList.add("is-valid");
  }

  if (dni.length === 0) {
    inputDni.classList.add("is-invalid");
    inputErrorDni.textContent = "Campo obligatorio.";
    inputErrorDni.style.display = "block";
    esValido = false;
  } else if (!/^\d{8}$/.test(dni)) {
    inputDni.classList.add("is-invalid");
    inputErrorDni.textContent = "DNI inválido.";
    inputErrorDni.style.display = "block";
    esValido = false;
  } else {
    inputDni.classList.add("is-valid");
  }

  if (telefono.length === 0) {
    inputTelefono.classList.add("is-invalid");
    inputErrorTelefono.textContent = "Campo obligatorio.";
    inputErrorTelefono.style.display = "block";
    esValido = false;
  } else {
    inputTelefono.classList.add("is-valid");
  }

  if (direccion.length === 0) {
    inputDireccion.classList.add("is-invalid");
    inputErrorDireccion.textContent = "Campo obligatorio.";
    inputErrorDireccion.style.display = "block";
    esValido = false;
  } else if (direccion.length < 3) {
    inputDireccion.classList.add("is-invalid");
    inputErrorDireccion.textContent = "Mínimo 3 caracteres.";
    inputErrorDireccion.style.display = "block";
    esValido = false;
  } else {
    inputDireccion.classList.add("is-valid");
  }

  if (fechaNacimiento.length === 0) {
    inputFechaNacimiento.classList.add("is-invalid");
    inputErrorFechaNacimiento.textContent = "Campo obligatorio.";
    inputErrorFechaNacimiento.style.display = "block";
    esValido = false;
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
    inputFechaNacimiento.classList.add("is-invalid");
    inputErrorFechaNacimiento.textContent = "Formato inválido (YYYY-MM-DD).";
    inputErrorFechaNacimiento.style.display = "block";
    esValido = false;
  } else {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    if (edad < 16) {
      inputFechaNacimiento.classList.add("is-invalid");
      inputErrorFechaNacimiento.textContent = "Mayor de 16 años.";
      inputErrorFechaNacimiento.style.display = "block";
      esValido = false;
    } else if (edad > 80) {
      inputFechaNacimiento.classList.add("is-invalid");
      inputErrorFechaNacimiento.textContent = "Menor de 80 años.";
      inputErrorFechaNacimiento.style.display = "block";
      esValido = false;
    } else if (fechaNac > hoy) {
      inputFechaNacimiento.classList.add("is-invalid");
      inputErrorFechaNacimiento.textContent = "No puede ser una fecha futura.";
      inputErrorFechaNacimiento.style.display = "block";
      esValido = false;
    } else {
      inputFechaNacimiento.classList.remove("is-invalid");
      inputErrorFechaNacimiento.style.display = "none";
      inputFechaNacimiento.classList.add("is-valid");
    }
  }

  if (parseInt(tipoSexo) === 0 || isNaN(parseInt(tipoSexo))) {
    inputTipoSexo.classList.add("is-invalid");
    inputErrorTipoSexo.textContent = "Campo obligatorio.";
    inputErrorTipoSexo.style.display = "block";
    esValido = false;
  } else {
    inputTipoSexo.classList.add("is-valid");
  }

  if (parseInt(localidadId) === 0 || isNaN(parseInt(localidadId))) {
    inputIdLocalidad.classList.add("is-invalid");
    inputErrorIdLocalidad.textContent = "Campo obligatorio.";
    inputErrorIdLocalidad.style.display = "block";
    esValido = false;
  } else {
    inputIdLocalidad.classList.add("is-valid");
  }

  if (parseInt(puestoId) === 0 || isNaN(parseInt(puestoId))) {
    inputIdPuesto.classList.add("is-invalid");
    inputErrorIdPuesto.textContent = "Campo obligatorio.";
    inputErrorIdPuesto.style.display = "block";
    esValido = false;
  } else {
    inputIdPuesto.classList.add("is-valid");
  }

  if (gmail.length === 0) {
    inputGmail.classList.add("is-invalid");
    inputErrorGmail.textContent = "Campo obligatorio.";
    inputErrorGmail.style.display = "block";
    esValido = false;
  } else {
    inputGmail.classList.add("is-valid");
  }

  if (cantidadHijos.length > 0) {
    if (!/^\d+$/.test(cantidadHijos)) {
      inputCantidadHijos.classList.add("is-invalid");
      inputErrorCantidadHijos.textContent = "1 digito.";
      inputErrorCantidadHijos.style.display = "block";
      esValido = false;
    } else {
      inputCantidadHijos.classList.add("is-valid");
    }
  } else {
    inputCantidadHijos.classList.remove("is-invalid", "is-valid");
    inputErrorCantidadHijos.style.display = "none";
  }
  if (cuil.length === 0) {
    inputCuil.classList.add("is-invalid");
    inputErrorCuil.textContent = "Campo obligatorio.";
    inputErrorCuil.style.display = "block";
    esValido = false;
  } else if (!/^\d{11}$/.test(cuil)) {
    inputCuil.classList.add("is-invalid");
    inputErrorCuil.textContent = "Debe tener 11 dígitos.";
    inputErrorCuil.style.display = "block";
    esValido = false;
  } else {
    inputCuil.classList.add("is-valid");
    inputErrorCuil.style.display = "none";
  }

  if (estadoCivil !== "0") {
    const valoresValidos = ["1", "2", "3", "4"];

    if (!valoresValidos.includes(estadoCivil)) {
      inputEstadoCivil.classList.add("is-invalid");
      inputErrorEstadoCivil.textContent = "Seleccione un estado civil válido.";
      inputErrorEstadoCivil.style.display = "block";
      esValido = false;
    } else {
      inputEstadoCivil.classList.add("is-valid");
      inputErrorEstadoCivil.style.display = "none";
    }
  } else {
    inputEstadoCivil.classList.remove("is-invalid", "is-valid");
    inputErrorEstadoCivil.style.display = "none";
  }

  return esValido;
}



///////////////////////////////////////////////////////////////////////////////
// VALIDACIONES EN VIVO PARA ELFORMUALRIO DE EMPLEADO /////////////////////////
///////////////////////////////////////////////////////////////////////////////
document.getElementById("NombreEmpleado").addEventListener("input", () => {
  const input = document.getElementById("NombreEmpleado");
  const error = document.getElementById("errorNombreEmpleado");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");

  if (valor.length === 0) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else if (valor.length < 3) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Mínimo 3 caracteres.";
  } else {
    input.classList.add("is-valid");
    error.style.display = "none";
  }
});

document.getElementById("DniEmpleado").addEventListener("input", () => {
  const input = document.getElementById("DniEmpleado");
  const error = document.getElementById("errorDniEmpleado");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");

  if (valor.length === 0) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else if (!/^\d{8}$/.test(valor)) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "8 dígitos.";
  } else {
    input.classList.add("is-valid");
    error.style.display = "none";
  }
});

document.getElementById("CuilEmpleado").addEventListener("input", () => {
  const input = document.getElementById("CuilEmpleado");
  const error = document.getElementById("errorCuilEmpleado");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");

  if (valor.length === 0) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else if (!/^\d{8}$/.test(valor)) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "11 dígitos.";
  } else {
    input.classList.add("is-valid");
    error.style.display = "none";
  }
});

document.getElementById("TelefonoEmpleado").addEventListener("input", () => {
  const input = document.getElementById("TelefonoEmpleado");
  const error = document.getElementById("errorTelefonoEmpleado");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");

  if (valor.length === 0) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else if (!/^\d{10}$/.test(valor)) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "10 dígitos.";
  } else {
    input.classList.add("is-valid");
    error.style.display = "none";
  }
});

document
  .getElementById("FechaNacimientoEmpleado")
  .addEventListener("input", () => {
    const input = document.getElementById("FechaNacimientoEmpleado");
    const error = document.getElementById("errorFechaNacimientoEmpleado");
    const valor = input.value.trim();

    input.classList.remove("is-invalid", "is-valid");

    if (valor.length === 0) {
      input.classList.add("is-invalid");
      error.style.display = "block";
      error.textContent = "Campo obligatorio.";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      input.classList.add("is-invalid");
      error.style.display = "block";
      error.textContent = "Formato inválido (00/00/0000).";
    } else {
      const hoy = new Date();
      const fechaNacimiento = new Date(valor);
      let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      const mes = hoy.getMonth() - fechaNacimiento.getMonth();
      const dia = hoy.getDate() - fechaNacimiento.getDate();
      if (mes < 0 || (mes === 0 && dia < 0)) edad--;

      if (edad < 16) {
        input.classList.add("is-invalid");
        error.style.display = "block";
        error.textContent = "Mayor de 16 años.";
      } else if (edad > 80) {
        input.classList.add("is-invalid");
        error.style.display = "block";
        error.textContent = "Menor de 80 años.";
      } else if (fechaNacimiento > hoy) {
        input.classList.add("is-invalid");
        error.style.display = "block";
        error.textContent = "Fecha invalida.";
      } else {
        input.classList.add("is-valid");
        error.style.display = "none";
      }
    }
  });

document.getElementById("DireccionEmpleado").addEventListener("input", () => {
  const input = document.getElementById("DireccionEmpleado");
  const error = document.getElementById("errorDireccionEmpleado");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");

  if (valor.length === 0) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else if (valor.length < 3) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Mínimo 3 caracteres.";
  } else {
    input.classList.add("is-valid");
    error.style.display = "none";
  }
});

document.getElementById("IdLocalidad").addEventListener("change", () => {
  const input = document.getElementById("IdLocalidad");
  const error = document.getElementById("errorIdLocalidad");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");

  if (valor.length === 0) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else {
    input.classList.add("is-valid");
    error.style.display = "none";
  }
});

document.getElementById("TipoSexoEmpleado").addEventListener("change", () => {
  const input = document.getElementById("TipoSexoEmpleado");
  const error = document.getElementById("errorTipoSexoEmpleado");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");

  if (valor.length === 0) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else {
    input.classList.add("is-valid");
    error.style.display = "none";
  }
});

document.getElementById("IdPuesto").addEventListener("change", () => {
  const input = document.getElementById("IdPuesto");
  const error = document.getElementById("errorIdPuesto");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");

  if (valor.length === 0) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else {
    input.classList.add("is-valid");
    error.style.display = "none";
  }
});

document.getElementById("CuilEmpleado").addEventListener("input", () => {
  const input = document.getElementById("CuilEmpleado");
  const error = document.getElementById("errorCuilEmpleado");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");
  error.style.display = "none";

  if (valor.length > 0) {
    if (!/^\d{11}$/.test(valor)) {
      input.classList.add("is-invalid");
      error.textContent = "11 dígitos.";
      error.style.display = "block";
    } else {
      input.classList.add("is-valid");
      error.style.display = "none";
    }
  }
});

document
  .getElementById("CantidadHijosEmpleado")
  .addEventListener("input", () => {
    const input = document.getElementById("CantidadHijosEmpleado");
    const error = document.getElementById("errorCantidadHijosEmpleado");
    const valor = input.value.trim();

    input.classList.remove("is-invalid", "is-valid");
    error.style.display = "none";

    if (valor.length > 0) {
      if (!/^\d+$/.test(valor)) {
        input.classList.add("is-invalid");
        error.textContent = "Debe ser un número entero positivo.";
        error.style.display = "block";
      } else {
        input.classList.add("is-valid");
        error.style.display = "none";
      }
    }
  });

document
  .getElementById("EstadoCivilEmpleado")
  .addEventListener("change", () => {
    const input = document.getElementById("EstadoCivilEmpleado");
    const error = document.getElementById("errorEstadoCivilEmpleado");
    const valor = input.value.trim();

    input.classList.remove("is-invalid", "is-valid");

    if (valor !== "0") {
      const valoresValidos = ["1", "2", "3", "4"];
      if (!valoresValidos.includes(valor)) {
        input.classList.add("is-invalid");
        error.textContent = "Seleccione un estado civil válido.";
        error.style.display = "block";
      } else {
        input.classList.add("is-valid");
        error.style.display = "none";
      }
    } else {
      input.classList.remove("is-invalid", "is-valid");
      error.style.display = "none";
    }
  });

document.getElementById("EmailEmpleado").addEventListener("input", () => {
  const input = document.getElementById("EmailEmpleado");
  const error = document.getElementById("errorEmailEmpleado");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");
  error.style.display = "none";

  if (valor.length > 0) {
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(valor)) {
      input.classList.add("is-invalid");
      error.textContent = "Formato inválido.";
      error.style.display = "block";
    } else {
      input.classList.add("is-valid");
      error.style.display = "none";
    }
  }
});


////////////////////////////////////////////////////////////////////////////////
// LIMPIAR EL FORMULARIO  ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function LimpiarFormularioEmpleado() {
  document.getElementById("IdEmpleado").value = "";

  const inputNombre = document.getElementById("NombreEmpleado");
  inputNombre.value = "";

  const inputDni = document.getElementById("DniEmpleado");
  inputDni.value = "";

  const inputCuil = document.getElementById("CuilEmpleado");
  inputCuil.value = "";

  const inputTelefono = document.getElementById("TelefonoEmpleado");
  inputTelefono.value = "";

  const inputEmail = document.getElementById("EmailEmpleado");
  inputEmail.value = "";

  const inputFechaNacimiento = document.getElementById(
    "FechaNacimientoEmpleado"
  );
  inputFechaNacimiento.value = "";

  const inputDireccion = document.getElementById("DireccionEmpleado");
  inputDireccion.value = "";

  const inputEstadoCivil = document.getElementById("EstadoCivilEmpleado");
  inputEstadoCivil.value = "";

  const inputCantidadHijos = document.getElementById("CantidadHijosEmpleado");
  inputCantidadHijos.value = "";

  const inputTipoSexo = document.getElementById("TipoSexoEmpleado");
  inputTipoSexo.value = "";

  const inputIdLocalidad = document.getElementById("IdLocalidad");
  inputIdLocalidad.value = "";

  const inputIdPuesto = document.getElementById("IdPuesto");
  inputIdPuesto.value = "";

  const inputGmail = document.getElementById("EmailEmpleado");
  inputGmail.value = "";

  inputNombre.classList.remove("is-invalid");
  inputNombre.classList.remove("is-valid");

  inputDni.classList.remove("is-invalid");
  inputDni.classList.remove("is-valid");

  inputTelefono.classList.remove("is-invalid");
  inputTelefono.classList.remove("is-valid");

  inputFechaNacimiento.classList.remove("is-invalid");
  inputFechaNacimiento.classList.remove("is-valid");

  inputDireccion.classList.remove("is-invalid");
  inputDireccion.classList.remove("is-valid");

  inputTipoSexo.classList.remove("is-invalid");
  inputTipoSexo.classList.remove("is-valid");

  inputIdLocalidad.classList.remove("is-invalid");
  inputIdLocalidad.classList.remove("is-valid");

  inputIdPuesto.classList.remove("is-invalid");
  inputIdPuesto.classList.remove("is-valid");

  inputGmail.classList.remove("is-invalid");
  inputGmail.classList.remove("is-valid");

  inputCuil.classList.remove("is-invalid");
  inputCuil.classList.remove("is-valid");

  inputEstadoCivil.classList.remove("is-invalid");
  inputEstadoCivil.classList.remove("is-valid");

  inputCantidadHijos.classList.remove("is-invalid");
  inputCantidadHijos.classList.remove("is-valid");

  const inputErrorNombre = document.getElementById("errorNombreEmpleado");
  inputErrorNombre.textContent = "";
  inputErrorNombre.style.display = "none";

  const inputErrorDni = document.getElementById("errorDniEmpleado");
  inputErrorDni.textContent = "";
  inputErrorDni.style.display = "none";

  const inputErrorTelefono = document.getElementById("errorTelefonoEmpleado");
  inputErrorTelefono.textContent = "";
  inputErrorTelefono.style.display = "none";

  const inputErrorFechaNacimiento = document.getElementById(
    "errorFechaNacimientoEmpleado"
  );
  inputErrorFechaNacimiento.textContent = "";
  inputErrorFechaNacimiento.style.display = "none";

  const inputErrorDireccion = document.getElementById("errorDireccionEmpleado");
  inputErrorDireccion.textContent = "";
  inputErrorDireccion.style.display = "none";

  const inputErrorTipoSexo = document.getElementById("errorTipoSexoEmpleado");
  inputErrorTipoSexo.textContent = "";
  inputErrorTipoSexo.style.display = "none";

  const inputErrorIdLocalidad = document.getElementById("errorIdLocalidad");
  inputErrorIdLocalidad.textContent = "";
  inputErrorIdLocalidad.style.display = "none";

  const inputErrorIdPuesto = document.getElementById("errorIdPuesto");
  inputErrorIdPuesto.textContent = "";
  inputErrorIdPuesto.style.display = "none";

  const inputErrorGmail = document.getElementById("errorEmailEmpleado");
  inputErrorGmail.textContent = "";
  inputErrorGmail.style.display = "none";

  document.getElementById("DniEmpleado").disabled = false;
  document.getElementById("EmailEmpleado").disabled = false;
  document.getElementById("FechaNacimientoEmpleado").disabled = false;
  document.getElementById("CuilEmpleado").disabled = false;
  document.getElementById("NombreEmpleado").disabled = false;
}


////////////////////////////////////////////////////////////////////////////////
// VALIDACION DE UN EMPLEADO EXISTENTE /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function MostrarErrorEmpleadoExistente(mensajes) {
  const errorDniEmpleado = document.getElementById("errorDniEmpleado");
  const inputDniEmpleado = document.getElementById("DniEmpleado");

  const errorCuilEmpleado = document.getElementById("errorCuilEmpleado");
  const inputCuilEmpleado = document.getElementById("CuilEmpleado");

  const errorTelefonoEmpleado = document.getElementById(
    "errorTelefonoEmpleado"
  );
  const inputTelefonoEmpleado = document.getElementById("TelefonoEmpleado");

  const errorEmailEmpleado = document.getElementById("errorEmailEmpleado");
  const inputEmailEmpleado = document.getElementById("EmailEmpleado");

  errorDniEmpleado.textContent = "";
  errorDniEmpleado.style.display = "none";
  errorDniEmpleado.classList.remove("shake");
  inputDniEmpleado.classList.remove("is-invalid");

  errorCuilEmpleado.textContent = "";
  errorCuilEmpleado.style.display = "none";
  errorCuilEmpleado.classList.remove("shake");
  inputCuilEmpleado.classList.remove("is-invalid");

  errorTelefonoEmpleado.textContent = "";
  errorTelefonoEmpleado.style.display = "none";
  errorTelefonoEmpleado.classList.remove("shake");
  inputTelefonoEmpleado.classList.remove("is-invalid");

  errorEmailEmpleado.textContent = "";
  errorEmailEmpleado.style.display = "none";
  errorEmailEmpleado.classList.remove("shake");
  inputEmailEmpleado.classList.remove("is-invalid");

  mensajes.forEach((mensaje) => {
    const msgLower = mensaje.toLowerCase();
    if (msgLower.includes("dni")) {
      errorDniEmpleado.textContent = mensaje;
      errorDniEmpleado.style.display = "block";
      errorDniEmpleado.classList.remove("fade");
      errorDniEmpleado.classList.add("shake");
      inputDniEmpleado.classList.add("is-invalid");
    }

    if (msgLower.includes("cuil")) {
      errorCuilEmpleado.textContent = mensaje;
      errorCuilEmpleado.style.display = "block";
      errorCuilEmpleado.classList.remove("fade");
      errorCuilEmpleado.classList.add("shake");
      inputCuilEmpleado.classList.add("is-invalid");
    }

    if (msgLower.includes("telefono")) {
      errorTelefonoEmpleado.textContent = mensaje;
      errorTelefonoEmpleado.style.display = "block";
      errorTelefonoEmpleado.classList.remove("fade");
      errorTelefonoEmpleado.classList.add("shake");
      inputTelefonoEmpleado.classList.add("is-invalid");
    }

    if (msgLower.includes("email")) {
      errorEmailEmpleado.textContent = mensaje;
      errorEmailEmpleado.style.display = "block";
      errorEmailEmpleado.classList.remove("fade");
      errorEmailEmpleado.classList.add("shake");
      inputEmailEmpleado.classList.add("is-invalid");
    }
  });
}


////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA CREAR EMPLEADO ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
async function CrearEmpleado() {
  if (!ValidarFormularioEmpleado()) {
    ocultarOverlayGuardando();
    return;
  }

  mostrarOverlayGuardando();

  try {
    const empleado = {
      nombreCompleto: document.getElementById("NombreEmpleado").value.trim(),
      dni: Number(document.getElementById("DniEmpleado").value.trim()),
      cuil: (() => {
        const val = document.getElementById("CuilEmpleado").value.trim();
        return val ? Number(val) : null;
      })(),
      telefono: document.getElementById("TelefonoEmpleado").value.trim(),
      email: document.getElementById("EmailEmpleado").value.trim(),
      fechaNacimiento: document.getElementById("FechaNacimientoEmpleado").value,
      direccion: document.getElementById("DireccionEmpleado").value.trim(),
      estadoCiviles: Number(document.getElementById("EstadoCivilEmpleado").value),
      cantidadHijos: (() => {
        const val = document.getElementById("CantidadHijosEmpleado").value.trim();
        return val ? Number(val) : null;
      })(),
      tipoSexo: Number(document.getElementById("TipoSexoEmpleado").value),
      localidadId: Number(document.getElementById("IdLocalidad").value),
      puestoId: Number(document.getElementById("IdPuesto").value),
    };

    const response = await authFetch("Empleados", {
      method: "POST",
      body: JSON.stringify(empleado),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorEmpleadoExistente(errorData.mensaje);
      } else {
        MostrarErrorCatch();
      }
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      ObtenerEmpleados(false);
      CerrarPanelEmpleado();
      Swal.fire({
        title: "¡Empleado Creado!",
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



//////////////////////////////////////////////////////////////////////////////////////
// EDITAR EMPLEADO //////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function EditarEmpleado(id) {
  if (!ValidarFormularioEmpleado()) {
    ocultarOverlayGuardando();
    return;
  }
  mostrarOverlayGuardando();

  try {
    let empleadoId = parseInt(document.getElementById("IdEmpleado").value);

    const empleado = {
      id: empleadoId,
      nombreCompleto: document.getElementById("NombreEmpleado").value.trim(),
      dni: Number(document.getElementById("DniEmpleado").value.trim()),
      cuil: Number(document.getElementById("CuilEmpleado").value.trim() || null),
      telefono: document.getElementById("TelefonoEmpleado").value.trim(),
      email: document.getElementById("EmailEmpleado").value.trim(),
      fechaNacimiento: document.getElementById("FechaNacimientoEmpleado").value,
      direccion: document.getElementById("DireccionEmpleado").value.trim(),
      estadoCiviles: Number(document.getElementById("EstadoCivilEmpleado").value),
      cantidadHijos: Number(
        document.getElementById("CantidadHijosEmpleado").value.trim() || null
      ),
      tipoSexo: Number(document.getElementById("TipoSexoEmpleado").value),
      localidadId: Number(document.getElementById("IdLocalidad").value),
      puestoId: Number(document.getElementById("IdPuesto").value),
    };

    const response = await authFetch(`Empleados/${id}`, {
      method: "PUT",
      body: JSON.stringify(empleado),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) {
        MostrarErrorEmpleadoExistente(errorData.mensaje);
      } else {
        MostrarErrorCatch();
      }
      ocultarOverlayGuardando();
      return;
    }

    setTimeout(() => {
      ocultarOverlayGuardando();
      ObtenerEmpleados(false);
      CerrarPanelEmpleado();

      Swal.fire({
        title: "¡Empleado Modificado!",
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



//////////////////////////////////////////////////////////////////////////////////////
// VER HISTORIAL EMPLEADO ///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function VerHistorialEmpleado(empleadoId) {
  ObtenerHistorialEmpleados(empleadoId);

  const offcanvasElement = document.getElementById(
    "offcanvasHistorialEmpleado"
  );
  console.log("Elemento encontrado:", offcanvasElement);

  const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
  offcanvas.show();
}


//////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA OBTENER LOS DATOS DEL HISTORIAL DE EMPLEADOS ////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerHistorialEmpleados(empleadoId) {
  const res = await authFetch(`HistorialLaboral/empleado/${empleadoId}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      MostrarHistorialEmpleado(data);
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}


//////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN PARA MOSTRAR EL HISTORIAL DE EMPLEADOS ////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
function MostrarHistorialEmpleado(data) {
  historialGlobal = data;
  $("#tablaHistorialEmpleadoBody").empty();

  if (!data || data.length === 0) {
    $("#tablaHistorialEmpleadoBody").append(
      "<tr><td colspan='4' class='text-center text-muted'>No hay historial disponible</td></tr>"
    );
    return;
  }

  $.each(data, function (index, item) {
    $("#tablaHistorialEmpleadoBody").append(
      "<tr>" +
      "<td class='text-center columna-fecha'>" +
      item.fechaModificacionString +
      "</td>" +
      "<td class='text-center'>" +
      "<strong>" +
      item.puestoAnterior +
      "</strong><br>" +
      "<small class='text-muted'>" +
      item.sectorAnterior +
      "</small>" +
      "</td>" +
      "<td class='text-center columna-puesto-actual'>" +
      "<strong>" +
      item.puestoActual +
      "</strong><br>" +
      "<small class='text-muted'>" +
      item.sectorActual +
      "</small>" +
      "</td>" +
      "<td class='text-center columna-responsable'>" +
      "<strong>" +
      item.usuarioModificadorNombre +
      "</strong><br>" +
      "<small class='text-muted'>" +
      item.usuarioModificadorEmail +
      "</small>" +
      "</td>" +
      "<td class='text-center columna-accion d-none d-md-table-cell'>" +
      `<button class="btn-editar icono-ver-detalle-historial-empleado" style="background: none; border: none;" onclick="MostrarDetalleHistorial(${index})" data-tippy-content="Ver más"><i class="bi bi-info-circle"></i></button>` +
      "</td>" +
      "</tr>"
    );
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}


//////////////////////////////////////////////////////////////////////////////////////////
// MOSTRAR DETALLE DE UN HISTORIAL DE EMPLEADO ////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
function MostrarDetalleHistorial(index) {
  const item = historialGlobal[index];

  document.getElementById("detalleFechaModificacion").textContent =
    item.fechaModificacionString || "N/D";
  document.getElementById("detallePuestoAnterior").textContent =
    item.puestoAnterior || "N/D";
  document.getElementById("detalleSectorAnterior").textContent =
    item.sectorAnterior || "N/D";
  document.getElementById("detallePuestoActual").textContent =
    item.puestoActual || "N/D";
  document.getElementById("detalleSectorActual").textContent =
    item.sectorActual || "N/D";
  document.getElementById("detalleResponsableNombre").textContent =
    item.usuarioModificadorNombre || "N/D";
  document.getElementById("detalleResponsableEmail").textContent =
    item.usuarioModificadorEmail || "N/D";

  const offcanvasElement = document.getElementById("offcanvasDetalleHistorial");
  const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
  offcanvas.show();
}



////////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA GENERA UN INFORME PARA EMPLEADOS SEGUN SU FILTRO //////////////
////////////////////////////////////////////////////////////////////////////////
async function GenerarInformePdfEmpleado() {

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  let nombreCompleto = document.getElementById("EmpleadoIdBuscar").value;
  let dniEmpleado = document.getElementById("DniEmpleadoFiltro").value;
  let nroLegajo = document.getElementById("NroLegajoFiltro").value;
  let estadoCivilEmpleado = document.getElementById("EstadoCivilEmpleadoFiltro").value;
  let estadoCivil = estadoCivilEmpleado !== "0" && estadoCivilEmpleado !== "" ? parseInt(estadoCivilEmpleado) : null;
  let tipoSexoEmpleado = document.getElementById("TipoSexoEmpleadoFiltro").value;
  let tipoSexo = tipoSexoEmpleado !== "0" && tipoSexoEmpleado !== "" ? parseInt(tipoSexoEmpleado) : null;
  let localidadFiltro = document.getElementById("IdLocalidadFiltro").value;
  let localidadNombre = document.getElementById("IdLocalidadFiltro").selectedOptions[0]?.text || "";
  let puestoFiltro = document.getElementById("IdPuestoFiltro").value;
  let puestoNombre = document.getElementById("IdPuestoFiltro").selectedOptions[0]?.text || "";

  let filtro = {
    nombreCompleto: nombreCompleto,
    dNI: dniEmpleado ? Number(dniEmpleado) : null,
    nroLegajo: nroLegajo,
    estadoCiviles: estadoCivil,
    tipoSexo: tipoSexo,
    localidadId: localidadFiltro === "0" ? null : Number(localidadFiltro),
    puestoId: puestoFiltro === "0" ? null : Number(puestoFiltro),
  };

  const res = await authFetch("InformesGeneralesPdf/GenerarInformeEmpleados", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filtro)
  });

  const { empleados, resumen } = await res.json();

  if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
    ErrorGeneralInformePdf();
    return;
  }

  let filtrosAplicadosArray = [];

  if (filtro.dNI) filtrosAplicadosArray.push(`[DNI: ${filtro.dNI}]`);
  if (filtro.nombreCompleto) filtrosAplicadosArray.push(`[Nombre: ${filtro.nombreCompleto}]`);
  if (filtro.nroLegajo) filtrosAplicadosArray.push(`[Legajo: ${filtro.nroLegajo}]`);

  if (filtro.estadoCiviles !== null) {
    const estadoCivilTexto =
      filtro.estadoCiviles === 1
        ? "Soltero"
        : filtro.estadoCiviles === 2
          ? "Casado"
          : filtro.estadoCiviles === 3
            ? "Divorciado"
            : filtro.estadoCiviles === 4
              ? "Viudo"
              : "Otro";
    filtrosAplicadosArray.push(`[Estado Civil: ${estadoCivilTexto}]`);
  }

  if (filtro.tipoSexo !== null) {
    const sexoTexto =
      filtro.tipoSexo === 1
        ? "Masculino"
        : filtro.tipoSexo === 2
          ? "Femenino"
          : filtro.tipoSexo === 3
            ? "No Binario"
            : "Otro";
    filtrosAplicadosArray.push(`[Sexo: ${sexoTexto}]`);
  }

  if (filtro.localidadId) filtrosAplicadosArray.push(`[Localidad: ${localidadNombre}]`);
  if (filtro.puestoId) filtrosAplicadosArray.push(`[Puesto: ${puestoNombre}]`);

  const filtrosAplicados =
    filtrosAplicadosArray.length > 0 ? filtrosAplicadosArray.join("  |  ") : "No se aplicaron";

  doc.setTextColor(19, 115, 204);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Informe de Empleados", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

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
  doc.text("Total Empleados:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.total}`, 45, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Hombres:", 49, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.hombres}`, 69, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Mujeres:", 73, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.mujeres}`, 91, y);

  doc.setFont("helvetica", "normal");
  doc.text("| No Binario:", 95, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.noBinario}`, 117, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Otros:", 121, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.otros}`, 135, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text("Filtros Aplicados:", 14, y);
  doc.setFont("helvetica", "bold");

  const filtrosText = doc.splitTextToSize(filtrosAplicados, 260);
  doc.text(filtrosText, 45, y);
  y += filtrosText.length * 6 + 0;

  doc.setDrawColor(180);
  doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
  y += 7;

  doc.setTextColor(0, 0, 0);
  const anchoPagina = doc.internal.pageSize.getWidth() - 30;
  empleados.forEach((e) => {
    if (y > 180) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.text(e.nombreCompleto.toUpperCase(), 14, y);
    y += 6;

    const datosEmpleado = [
      ["DNI", e.dni], 
      ["Legajo", e.nroLegajo],
      ["Edad", e.edad],
      ["CUIL", e.cuil],
      ["Dirección", e.direccion],
      ["Localidad", e.localidadNombre],
      ["Puesto", e.puestoNombre],
      ["Estado Civil", e.estadoCivil],
      ["Sexo", e.sexo],
      ["Email", e.email],
      ["Teléfono", e.telefono],
      ["Hijos", e.cantidadHijos]
    ];

    let xPos = 20;
    const margenDerecho = doc.internal.pageSize.getWidth() - 20;
    const espacioEntre = 8;

    datosEmpleado.forEach(([label, valor], idx) => {
      const textoLabel = `${label}:`;
      const textoValor = `${valor}`;
      const textoCompleto = idx < datosEmpleado.length - 1
        ? `${textoLabel} ${textoValor} |`
        : `${textoLabel} ${textoValor}`;

      const anchoTexto = doc.getTextWidth(textoCompleto);

      if (xPos + anchoTexto > margenDerecho) {
        xPos = 20;
        y += 6;
      }

      doc.setFont("helvetica", "bold");
      doc.text(textoLabel, xPos, y);

      const anchoLabel = doc.getTextWidth(textoLabel + " ");
      doc.setFont("helvetica", "normal");
      doc.text(textoValor, xPos + anchoLabel, y);

      if (idx < datosEmpleado.length - 1) {
        const anchoValor = doc.getTextWidth(textoValor + " ");
        doc.text("|", xPos + anchoLabel + anchoValor, y);
      }

      xPos += anchoTexto + espacioEntre;
    });

    y += 10;
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
    doc.save("Informe_Empleados.pdf");
    return;
  }

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  const html = `<html><head><title>Informe de Empleados</title></head>
  <body class="pdf-body">
  <iframe class="pdf-frame" width="100%" height="100%" src="${url}"></iframe>
  </body></html>`;

  const w = window.open();
  w.document.open();
  w.document.write(html);
  w.document.close();

}

//////////////////////////////////////////////////////////////////////////////////////////
// INICILIAZMOS AL CARGAR LA VISTA /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
ComboParaFiltrarLocalidadPuesto();



