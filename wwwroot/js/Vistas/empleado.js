// Función para abrir el panel lateral
function AbrirPanelEmpleado() {

  // Reiniciar el valor del select
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
}

//Funcion para cerrar el panel lateral
function CerrarPanelEmpleado() {
  document.getElementById("panelEmpleado").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarFormularioEmpleado();
}

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

//INICIO ONCHANGE DE FILTROS//
$(document).ready(function () {
  ObtenerEmpleados();

  $("#EmpleadoIdBuscar").on("input", function () {
    ObtenerEmpleados();
  });

  $("#DniEmpleadoFiltro").on("input", function () {
    ObtenerEmpleados();
  });

  $("#EstadoCivilEmpleadoFiltro").on("change", function () {
    ObtenerEmpleados();
  });

  $("#TipoSexoEmpleadoFiltro").on("change", function () {
    ObtenerEmpleados();
  });

  $("#IdLocalidadFiltro").on("change", function () {
    ObtenerEmpleados();
  });

  $("#IdPuestoFiltro").on("change", function () {
    ObtenerEmpleados();
  });
});

async function ComboParaFiltrarLocalidadPuesto() {
  // Obtener localidades
  const resLocalidades = await authFetch("Localidades", {
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

  // Obtener puestos
  const resPuestos = await authFetch("Puestos", {
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

  // Obtener empleados con filtros vacíos por defecto
  ObtenerEmpleados();
}

// Función Para Obtener los empelados
async function ObtenerEmpleados() {
  let dniEmpleado = document.getElementById("DniEmpleadoFiltro").value;

  let estadoCivilEmpleado = document.getElementById(
    "EstadoCivilEmpleadoFiltro"
  ).value;
  let estadoCivil =
    estadoCivilEmpleado !== "0" && estadoCivilEmpleado !== ""
      ? parseInt(estadoCivilEmpleado)
      : null;

  let tipoSexoEmpleado = document.getElementById(
    "TipoSexoEmpleadoFiltro"
  ).value;
  let tipoSexo =
    tipoSexoEmpleado !== "0" && tipoSexoEmpleado !== ""
      ? parseInt(tipoSexoEmpleado)
      : null;

  let localidadFiltro = document.getElementById("IdLocalidadFiltro").value;
  let puestoFiltro = document.getElementById("IdPuestoFiltro").value;

  let filtro = {
    nombreCompleto: document.getElementById("EmpleadoIdBuscar").value,
    dNI: dniEmpleado ? Number(dniEmpleado) : null,
    estadoCiviles: estadoCivil,
    tipoSexo: tipoSexo,
    localidadId: localidadFiltro === "0" ? null : Number(localidadFiltro),
    puestoId: puestoFiltro === "0" ? null : Number(puestoFiltro),
  };

  const res = await authFetch("Empleados/Filtrar", {
    method: "POST",
    body: JSON.stringify(filtro),
  })
    .then((response) => response.json())
    .then((data) => {
      MostrarEmpleados(data);
      LimpiarFormularioEmpleado();
      CerrarPanelEmpleado();
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}

// Funcion para mostrar todos los empleados
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
    const estadoCivil = item.estadoCivilesString || "-";

    const activo = item.eliminado == false;

    const textoEstado = activo ? "A" : "D";
    const tooltipEstadoBadge = activo ? "Activo" : "Desactivado";
    const claseEstado = activo
      ? "bg-success text-white"
      : "bg-danger text-white";
    const iconoEstado = activo
      ? "bi-person-x icono-desactivar-empleado"
      : "bi-person-check icono-activar-empleado";
    const tooltipEstado = activo ? "Desactivar" : "Activar";

    contenedor.append(`
      <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex">
        <div class="card shadow-sm p-2 rounded-3 position-relative d-flex flex-column w-100" style="border-bottom: 4px solid ${
          activo ? "#198754" : "#DC3545"
        }; min-height: 260px;">
          <div class="flex-grow-1 d-flex flex-column">

            <!-- Título y estado -->
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="fw-bold mb-0" style="font-size: 1rem;">${nombre}</h5>
              <span class="badge ${claseEstado}" style="font-size: 0.65rem; padding: 0.2em 0.45em;" data-tippy-content="${tooltipEstadoBadge}">${textoEstado}</span>
            </div>

            <!-- Puesto -->
            <p class="mb-1 text-muted d-flex align-items-center" style="font-size: 0.9rem;">
              <i class="bi bi-briefcase me-2" style="font-size: 1rem;"></i>
              <span>${puesto}</span>
            </p>

            <!-- Email -->
            <p class="mb-1 text-muted d-flex align-items-center" style="font-size: 0.9rem;">
              <i class="bi bi-envelope me-2" style="font-size: 1rem;"></i>
              <span>${email}</span>
            </p>

            <!-- Teléfono -->
            <p class="mb-2 text-muted d-flex align-items-center" style="font-size: 0.9rem;">
              <i class="bi bi-telephone me-2" style="font-size: 1rem;"></i>
              <span>${telefono}</span>
            </p>

            <hr class="m-0 mb-2"/>

            <!-- DNI y Estado Civil -->
            <div class="d-flex gap-2 flex-wrap">
              <span class="badge text-dark" style="background-color: #d0e7ff; font-size: 0.75rem;">DNI: ${dni}</span>
              <span class="badge text-dark" style="background-color: #d4edda; font-size: 0.75rem;">${estadoCivil}</span>
            </div>
          </div>

          <!-- Botones de acción -->
<div class="d-flex justify-content-between mt-2 align-items-center">
  <!-- Siempre mostrar historial, ver más y editar -->
  <div>
    <button class="btn-historial" style="background: none; border: none; cursor: pointer;" onclick="VerHistorialEmpleado(${
      item.id
    })" data-tippy-content="Historial">
      <i class="bi bi-card-text btn-sm icono-historial-empleado"></i>
    </button>
  </div>
  <div>
    <button class="btn-ver" style="background: none; border: none; cursor: pointer;" onclick="MostrarDetalleEmpleado(${
      item.id
    })" data-tippy-content="Ver más">
      <i class="bi bi-info-circle btn-sm iocno-ver-empleado"></i>
    </button>
    <button class="btn-editar" style="background: none; border: none; cursor: pointer;" onclick="MostrarModalEditarEmpleado(${
      item.id
    })" data-tippy-content="Editar">
      <i class="bi bi-pencil-square btn-sm icono-editar-empleado"></i>
    </button>
  </div>
</div>

  
</div>


        </div>
      </div>
    `);
  });

  // Inicializar tooltips
  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

//Funcion para mostrar todo el detalle del empleado
function MostrarDetalleEmpleado(id) {
  const empleado = empleadosData.find((e) => e.id === id);
  if (!empleado) return;

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
    empleado.estadoCivilesString || "";
  document.getElementById("detalleCantidadHijos").textContent =
    empleado.cantidadHijos || 0;
  document.getElementById("detallePuesto").textContent =
    empleado.puestoIdString || "";
  document.getElementById("detalleLocalidad").textContent =
    empleado.localidadIdString || "";
  document.getElementById("detalleSexo").textContent =
    empleado.tipoSexoString || "";
  document.getElementById("detalleNombreCreador").textContent =
    empleado.usuarioNombreCreador || "";
  document.getElementById("detalleEmailCreador").textContent =
    empleado.usuarioEmailCreador || "";

  // Mostrar el offcanvas
  const offcanvas = new bootstrap.Offcanvas("#offcanvasDetalleEmpleado");
  offcanvas.show();
}

// Función para mostrar el modal de editar empleado
async function MostrarModalEditarEmpleado(id) {
  const res = await authFetch(`Empleados/${id}`);
  const empleado = await res.json();

  const fecha = new Date(empleado.fechaNacimiento);
  const fechaFormateada = fecha.toISOString().slice(0, 10); // "YYYY-MM-DD"

  document.getElementById("IdEmpleado").value = empleado.id;
  document.getElementById("NombreEmpleado").value = empleado.nombreCompleto;
  document.getElementById("DniEmpleado").value = empleado.dni;
  document.getElementById("CuilEmpleado").value = empleado.cuil;
  document.getElementById("TelefonoEmpleado").value = empleado.telefono;
  document.getElementById("EmailEmpleado").value = empleado.email;
  document.getElementById("FechaNacimientoEmpleado").value = fechaFormateada;
  document.getElementById("DireccionEmpleado").value = empleado.direccion;
  document.getElementById("EstadoCivilEmpleado").value = empleado.estadoCiviles;
  document.getElementById("CantidadHijosEmpleado").value =
    empleado.cantidadHijos;
  document.getElementById("TipoSexoEmpleado").value = empleado.tipoSexo;
  document.getElementById("IdLocalidad").value = empleado.localidadId;
  document.getElementById("IdPuesto").value = empleado.puestoId;

  AbrirPanelEmpleado();
}

// Función para buscar empleado por id
function BuscarEmpleadoId() {
  const id = parseInt(document.getElementById("IdEmpleado").value);

  // Si el id no existe o es 0, entonces es una nueva empleado y llamamos a la función para crear
  if (!id || id === 0) {
    CrearEmpleado();
  } else {
    EditarEmpleado(id);
  }
}

// Funcion para validar el formulario de empleado

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

  // Opcionales
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

  // Obtener valores
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

  // Limpiar estado previo
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

  // Validación campos obligatorios

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
  } else if (dni.length < 8) {
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
  } else if (fechaNacimiento.length < 10) {
    inputFechaNacimiento.classList.add("is-invalid");
    inputErrorFechaNacimiento.textContent = "Formato inválido.";
    inputErrorFechaNacimiento.style.display = "block";
    esValido = false;
  } else {
    inputFechaNacimiento.classList.add("is-valid");
  }

  if (tipoSexo.length === 0) {
    inputTipoSexo.classList.add("is-invalid");
    inputErrorTipoSexo.textContent = "Campo obligatorio.";
    inputErrorTipoSexo.style.display = "block";
    esValido = false;
  } else {
    inputTipoSexo.classList.add("is-valid");
  }

  if (localidadId.length === 0) {
    inputIdLocalidad.classList.add("is-invalid");
    inputErrorIdLocalidad.textContent = "Campo obligatorio.";
    inputErrorIdLocalidad.style.display = "block";
    esValido = false;
  } else {
    inputIdLocalidad.classList.add("is-valid");
  }

  if (puestoId.length === 0) {
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

  // Validación opcionales, sólo si tienen valor

  // CantidadHijos (solo valida si tiene algo)
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
    // Si está vacío, limpiamos cualquier validación previa
    inputCantidadHijos.classList.remove("is-invalid", "is-valid");
    inputErrorCantidadHijos.style.display = "none";
  }

  // Cuil (solo valida si tiene algo)
  if (cuil.length > 0) {
    if (!/^\d{11}$/.test(cuil)) {
      inputCuil.classList.add("is-invalid");
      inputErrorCuil.textContent = "Debe tener 11 dígitos.";
      inputErrorCuil.style.display = "block";
      esValido = false;
    } else {
      inputCuil.classList.add("is-valid");
    }
  } else {
    inputCuil.classList.remove("is-invalid", "is-valid");
    inputErrorCuil.style.display = "none";
  }

  /// EstadoCivil (solo valida si tiene algo)
  // EstadoCivilEmpleado (solo valida si tiene algo distinto a "0")
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

// NombreEmpleado
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

// DniEmpleado
document.getElementById("DniEmpleado").addEventListener("input", () => {
  const input = document.getElementById("DniEmpleado");
  const error = document.getElementById("errorDniEmpleado");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");

  if (valor.length === 0) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else if (valor.length < 8) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "DNI 8 digitos.";
  } else {
    input.classList.add("is-valid");
    error.style.display = "none";
  }
});

// EmailEmpleado
document.getElementById("EmailEmpleado").addEventListener("input", () => {
  const input = document.getElementById("EmailEmpleado");
  const error = document.getElementById("errorEmailEmpleado");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");

  if (valor.length === 0) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Campo obligatorio.";
  } else if (!valor.includes("@")) {
    input.classList.add("is-invalid");
    error.style.display = "block";
    error.textContent = "Email inválido.";
  } else {
    input.classList.remove("is-invalid");
    error.style.display = "none";
  }
});

// TelefonoEmpleado
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

// FechaNacimientoEmpleado
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
    } else if (valor.length < 10) {
      input.classList.add("is-invalid");
      error.style.display = "block";
      error.textContent = "Formato inválido.";
    } else {
      input.classList.add("is-valid");
      error.style.display = "none";
    }
  });

// DireccionEmpleado
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

// IdLocalidad (select)
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

//TipoSexoEmpleado (select)
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

// IdPuesto (select)
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

// CuilEmpleado (input)
document.getElementById("CuilEmpleado").addEventListener("input", () => {
  const input = document.getElementById("CuilEmpleado");
  const error = document.getElementById("errorCuilEmpleado");
  const valor = input.value.trim();

  input.classList.remove("is-invalid", "is-valid");
  error.style.display = "none";

  if (valor.length > 0) {
    if (!/^\d{11}$/.test(valor)) {
      input.classList.add("is-invalid");
      error.textContent = "Debe tener 11 dígitos.";
      error.style.display = "block";
    } else {
      input.classList.add("is-valid");
      error.style.display = "none";
    }
  }
});

// CantidadHijosEmpleado (input)
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

// EstadoCivilEmpleado (select)
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
      // Si es la opción por defecto, limpiamos validación
      input.classList.remove("is-invalid", "is-valid");
      error.style.display = "none";
    }
  });

//EmailEmpleado(input)
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

// Funcion limpiar formulario de empleado
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

  // Limpia los estilos de validación
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

  // Limpia el mensaje de error
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
}

//Funcion para mostrar los errores de un empleado existente
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

  // Limpiar mensajes y estilos previos
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

  // Mostrar errores según el mensaje
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

// Función para crear empleado
async function CrearEmpleado() {
  if (!ValidarFormularioEmpleado()) return;

  const empleado = {
    nombreCompleto: document.getElementById("NombreEmpleado").value.trim(),
    dni: Number(document.getElementById("DniEmpleado").value.trim()),
    cuil: Number(document.getElementById("CuilEmpleado").value.trim()),
    telefono: document.getElementById("TelefonoEmpleado").value.trim(),
    email: document.getElementById("EmailEmpleado").value.trim(),
    fechaNacimiento: document.getElementById("FechaNacimientoEmpleado").value,
    direccion: document.getElementById("DireccionEmpleado").value.trim(),
    estadoCiviles: Number(document.getElementById("EstadoCivilEmpleado").value),
    cantidadHijos: Number(
      document.getElementById("CantidadHijosEmpleado").value.trim()
    ),
    tipoSexo: Number(document.getElementById("TipoSexoEmpleado").value),
    localidadId: Number(document.getElementById("IdLocalidad").value),
    puestoId: Number(document.getElementById("IdPuesto").value),
  };

  const res = await authFetch("Empleados", {
    method: "POST",
    body: JSON.stringify(empleado),
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.mensaje) {
          MostrarErrorEmpleadoExistente(errorData.mensaje);
        }
        return;
      }

      // Éxito
      ObtenerEmpleados();
      CerrarPanelEmpleado();

      // Mostrar alerta de éxito
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
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}

// Función para editar empleado
async function EditarEmpleado(id) {
  if (!ValidarFormularioEmpleado()) return;

  let empleadoId = parseInt(document.getElementById("IdEmpleado").value);

  const empleado = {
    id: empleadoId,
    nombreCompleto: document.getElementById("NombreEmpleado").value.trim(),
    dni: Number(document.getElementById("DniEmpleado").value.trim()),
    cuil: Number(document.getElementById("CuilEmpleado").value.trim()),
    telefono: document.getElementById("TelefonoEmpleado").value.trim(),
    email: document.getElementById("EmailEmpleado").value.trim(),
    fechaNacimiento: document.getElementById("FechaNacimientoEmpleado").value,
    direccion: document.getElementById("DireccionEmpleado").value.trim(),
    estadoCiviles: Number(document.getElementById("EstadoCivilEmpleado").value),
    cantidadHijos: Number(
      document.getElementById("CantidadHijosEmpleado").value.trim()
    ),
    tipoSexo: Number(document.getElementById("TipoSexoEmpleado").value),
    localidadId: Number(document.getElementById("IdLocalidad").value),
    puestoId: Number(document.getElementById("IdPuesto").value),
  };
  const res = await authFetch(`Empleados/${id}`, {
    method: "PUT",
    body: JSON.stringify(empleado),
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.mensaje) {
          MostrarErrorEmpleadoExistente(errorData.mensaje);
        }
        return;
      }
      CerrarPanelEmpleado();
      ObtenerEmpleados();
      // Mostrar alerta de éxito
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
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}

// Función para eliminar una provincia
// function EliminarEmpleadoId(id, eliminado) {
//   Swal.fire({
//     title: eliminado
//       ? "¿Deseás reactivar este empleado?"
//       : "¿Deseás desactivar este empleado?",
//     html: eliminado
//       ? "<p class='swal2-content-center'>Esta acción volverá a habilitar el empleado en el sistema.</p>"
//       : "<p class='swal2-content-center'>El empleado se desactivará y dejará de estar disponible.</p>",
//     showCancelButton: true,
//     confirmButtonText: eliminado ? "Sí, activar" : "Sí, desactivar",
//     cancelButtonText: "Cancelar",
//     focusCancel: true,
//     customClass: {
//       popup: "swal2-border-radius swal2-custom-popup",
//       confirmButton: eliminado ? "swal2-btn-activar" : "swal2-btn-desactivar",
//       cancelButton: "swal2-btn-cancelar",
//       title: "swal2-title-custom",
//       htmlContainer: "swal2-content-custom",
//     },
//     background: "#ffffff",
//     color: "#1a1a1a",
//   }).then((result) => {
//     if (result.isConfirmed) {
//       EliminarSiEmpleado(id);
//     } else if (result.dismiss === Swal.DismissReason.cancel) {
//       Swal.fire({
//         title: "Acción Cancelada",
//         text: eliminado ? "Continuará desactivad0." : "Continuará activado.",
//         toast: true,
//         position: "bottom-end",
//         showConfirmButton: false,
//         timer: 2200,
//         timerProgressBar: true,
//         background: "#fef8f4",
//         color: "#5f4339",
//         icon: "info",
//         iconColor: "#ff914d",
//         customClass: {
//           popup: "swal2-toast-status",
//           title: "swal2-toast-title",
//           content: "swal2-toast-content",
//         },
//       });
//     }
//   });
// }

// Función para eliminar una provincia
// async function EliminarSiEmpleado(id) {
//   const res = await authFetch(`Empleados/${id}`, {
//     method: "DELETE",
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("No se pudo eliminar/reactivar el empleado");
//       }
//       return response.json();
//     })
//     .then((data) => {
//       ObtenerEmpleados();

//       Swal.fire({
//         title: "¡" + data.mensaje + "!",
//         toast: true,
//         position: "bottom-end",
//         showConfirmButton: false,
//         timer: 2200,
//         timerProgressBar: true,
//         background: "#f4fff7",
//         color: "#1c3d26",
//         icon: "success",
//         iconColor: "#28a746d8",
//         customClass: {
//           popup: "swal2-toast-success",
//           title: "swal2-toast-success-title",
//           icon: "swal2-toast-success-icon",
//         },
//       });
//     })
//     .catch((error) => {
//       MostrarErrorCatch();
//     });
// }

// Función para mostra el offcanvas de historial
function VerHistorialEmpleado(empleadoId) {
  ObtenerHistorialEmpleados(empleadoId);

  const offcanvasElement = document.getElementById(
    "offcanvasHistorialEmpleado"
  );
  console.log("Elemento encontrado:", offcanvasElement);

  const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
  offcanvas.show();
}

// Función para obtener el historial de empleados
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

// Función para mostrar el historial de empleados
function MostrarHistorialEmpleado(data) {
  historialGlobal = data; // Guardar para acceder luego
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

  // Inicializar tooltips
  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

function MostrarDetalleHistorial(index) {
  const item = historialGlobal[index];

  // Setear valores en el offcanvas
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

  // Mostrar offcanvas
  const offcanvasElement = document.getElementById("offcanvasDetalleHistorial");
  const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
  offcanvas.show();
}

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

ComboParaFiltrarLocalidadPuesto();
