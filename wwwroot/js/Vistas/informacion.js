////////////////////////////////////////////////////////////
//Funcion para abrir el panel de empleado ///////////////////
/////////////////////////////////////////////////////////////
function AbrirPanelEmpleado() {
  let id = document.getElementById("IdEmpleado").value;
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
}



//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA OBTENER LA INFO DEL USUARIO LOGUEADO
//////////////////////////////////////////////////////////////////////////////////////
async function ObtenerMiInformacion() {
    try {
        const resp = await authFetch('Empleados/MiInformacion', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const empleado = await resp.json();

        MostrarMiInformacion(empleado);
        LimpiarFormularioEmpleado();
    } catch (error) {
        MostrarErrorCatch();
    }
}


//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LA CARD DEL USUARIO LOGUEADO
//////////////////////////////////////////////////////////////////////////////////////
function MostrarMiInformacion(empleado) {
    const contenedor = $("#contenedorInformacionPersonal");
    contenedor.empty();

    const bordeColor = "#0d6efd";

    const card = `
        <div class="col-12 d-flex">
        <div class="card shadow-sm rounded-3 w-100 h-100" style="border-left: 4px solid ${bordeColor};">

            <div class="card shadow-sm m-2 p-3 d-flex flex-row align-items-center justify-content-between">
            <div class="d-flex flex-row align-items-center gap-3">
                <img src="./dist/assets/images/user/avatar-8.jpg"
                    alt="Foto" class="rounded-circle"
                    style="width: 80px; height: 80px; object-fit: cover; border: 2px solid #a8dadc;">
                <div>
                <h5 class="fw-bold mb-0" style="font-size: 1rem;">${empleado.nombreCompleto}</h5>
                <div class="d-flex flex-wrap gap-2">
                    <span class="badge fw-bold" style="background-color: #e3f2fd; color: #1565c0; font-size: 0.75rem; letter-spacing: 0.05rem;">
                    ${empleado.puestoIdString}
                    </span>
                </div>
                </div>
            </div>

            <button class="btn btn-agregar" onclick="MostrarModalEditarEmpleado(${empleado.id})">
                <i class="fa-solid fa-pen-to-square me-1"></i>Editar
            </button>
            </div>

            <div class="card shadow-sm m-2 p-3">
            <h6 class="fw-bold mb-3">
                <span class="badge fw-bold" style="background-color: #f3e5f5; color: #6a1b9a; font-size: 0.85rem;">Información Personal</span>
            </h6>
            <div class="row mb-2">
                <div class="col-md-6 mb-2">
                <span class="badge" style="background-color:#d0e7ff; color:#141414; font-size:0.85rem">
                    <strong>Dni:</strong> ${empleado.dni || "-"}
                </span>
                </div>
                <div class="col-md-6 mb-2" style="color:#141414; font-size:0.85rem;">
                <strong>Cuil:</strong> ${empleado.cuil || "-"}
                </div>
                <div class="col-md-6 mb-2">
                <span class="badge" style="background-color:#d0e7ff; color:#141414; font-size:0.85rem">
                    <strong>Fecha de Nacimiento:</strong> ${empleado.fechaNacimientoString || "-"}
                </span>
                </div>
                <div class="col-md-6 mb-2" style="color:#141414; font-size:0.85rem;">
                <strong>Localidad:</strong> ${empleado.localidadIdString || "-"}
                </div>
                <div class="col-md-6 mb-2" style="color:#141414; font-size:0.85rem;">
                <strong>Dirección:</strong> ${empleado.direccion || "-"}
                </div>
                <div class="col-md-6 mb-2" style="color:#141414; font-size:0.85rem;">
                <strong>Cantidad de Hijos:</strong> ${empleado.cantidadHijos || 0}
                </div>
                <div class="col-md-6 mb-2">
                <span class="badge" style="background-color:#d0e7ff; color:#141414; font-size:0.85rem">
                <strong>Estado Civil:</strong> ${empleado.tipoSexoString || "-"}
                </span>
                </div>
            </div>
            </div>

            <div class="row m-2 g-2">
            <div class="col-md-6">
                <div class="card shadow-sm p-3 h-100">
                <h6 class="fw-bold mb-2">
                    <span class="badge fw-bold" style="background-color: #f3e5f5; color: #6a1b9a; font-size: 0.85rem;">Contacto</span>
                </h6>
                <div class="row">
                    <div class="col-md-12 mb-2">
                    <span class="badge" style="background-color:#d0e7ff; color:#141414; font-size:0.85rem">
                        <strong>Email:</strong> ${empleado.email || "-"}
                    </span>
                    </div>
                    <div class="col-md-12 mb-2">
                        <strong>Teléfono:</strong> ${empleado.telefono || "-"}
                    </div>
                </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card shadow-sm p-3 h-100">
                <h6 class="fw-bold mb-2">
                    <span class="badge fw-bold" style="background-color: #f3e5f5; color: #6a1b9a; font-size: 0.85rem;">Información Laboral</span>
                </h6>
                <div class="row">
                    <div class="col-md-12 mb-2">
                    <span class="badge" style="background-color:#d0e7ff; color:#141414; font-size:0.85rem">
                        <strong>Puesto:</strong> ${empleado.puestoIdString || "-"}
                    </span>
                    </div>
                    <div class="col-md-12 mb-2">
                    <span class="badge" style="background-color:#d0e7ff; color:#141414; font-size:0.85rem">
                        <strong>Número de Legajo:</strong> ${empleado.nroLegajo || "-"}
                    </span>
                    </div>
                </div>
                </div>
            </div>
            </div>

        </div>
        </div>
        `;

    contenedor.append(card);
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
  document.getElementById("TipoSexoEmpleado").disabled = true;

  AbrirPanelEmpleado();
}



///////////////////////////////////////////////////////////////////////////////
// BUSCAMOS EL ID PAR AVER SI ES NUEVO O EXISTE //////////////////////////////
///////////////////////////////////////////////////////////////////////////////
function BuscarEmpleadoId() {
  const id = parseInt(document.getElementById("IdEmpleado").value);

    EditarEmpleado(id);
  
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
  document.getElementById("TipoSexoEmpleado").disabled = false;
}


//////////////////////////////////////////////////////////////////////////////////////
// EDITAR EMPLEADO //////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function EditarEmpleado() {
  if (!ValidarFormularioEmpleado()) return;

  const empleadoId = Number(document.getElementById("IdEmpleado").value);

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
    cantidadHijos: Number(document.getElementById("CantidadHijosEmpleado").value.trim() || null),
    tipoSexo: Number(document.getElementById("TipoSexoEmpleado").value),
    localidadId: Number(document.getElementById("IdLocalidad").value),
    puestoId: Number(document.getElementById("IdPuesto").value),
  };

  try {
    const response = await authFetch(`Empleados/${empleadoId}`, {
      method: "PUT",
      body: JSON.stringify(empleado),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.mensaje) MostrarErrorEmpleadoExistente(errorData.mensaje);
      return;
    }

    // Mostrar toast de éxito
    Swal.fire({
      title: "¡Información Modificada!",
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

    // Cerrar panel y refrescar info
    CerrarPanelEmpleado();
    ObtenerMiInformacion();

  } catch (error) {
    MostrarErrorCatch();
  }
}

//////////////////////////////////////////////////////////////////////////////////////
// LLAMAR A LA FUNCION AL CARGAR LA VISTA
//////////////////////////////////////////////////////////////////////////////////////
ObtenerMiInformacion();
