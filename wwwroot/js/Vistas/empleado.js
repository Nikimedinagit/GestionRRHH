
// Función para abrir el panel lateral
function AbrirPanelEmpleado() {
  document.getElementById("panelEmpleado").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreEmpleado");
    if(inputNombre) inputNombre.focus();
  }, 400);

  
}

 //Funcion para cerrar el panel lateral
  function CerrarPanelEmpleado() {
    document.getElementById("panelEmpleado").classList.remove("abierto");
    const fondo = document.getElementById("fondoOscuro");
    fondo.classList.remove("visible");

    LimpiarFormularioEmpleado();
}


// Función Para Obtener las Localidades
async function ObtenerEmpleados() {
    const res = await authFetch("Empleados")
    .then(response => response.json())
    .then(data => {
        MostrarEmpleados(data)
       LimpiarFormularioEmpleado();
       CerrarPanelEmpleado();
      })
     .catch(error => {
        console.error('No se pudo obtener los empleados', error);
     });
}


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


  data.forEach(item => {
    const nombre = item.nombreCompleto || "-";
    const puesto = item.puesto?.descripcion || "-";
    const email = item.email || "-";
    const telefono = item.telefono || "-";
    const dni = item.dni || "-";
    const estadoCivil = item.estadoCiviles || "-";
    const activo = item.eliminado == false;

    const textoEstado = activo ? "ACTIVO" : "DESACTIVADO";
    const claseEstado = activo ? "bg-success text-white" : "bg-danger text-white";
    const iconoEstado = activo ? "bi-person-x icono-desactivar-empleado" : "bi-person-check icono-activar-empleado";
    const tooltipEstado = activo ? "Desactivar" : "Activar";

    contenedor.append(`
      <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex">
        <div class="card shadow-sm p-2 rounded-3 position-relative d-flex flex-column w-100" style="border-bottom: 4px solid ${activo ? "#198754" : "#DC3545"}; min-height: 260px;">
          <div class="flex-grow-1 d-flex flex-column">

            <!-- Título y estado -->
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="fw-bold mb-0" style="font-size: 1rem;">${nombre}</h5>
              <span class="badge ${claseEstado}" style="font-size: 0.65rem; padding: 0.2em 0.45em;">${textoEstado}</span>
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
          <div class="d-flex justify-content-end mt-2">
            <button class="btn-ver" style="background: none; border: none; cursor: pointer;" onclick="MostrarDetalleEmpleado(${item.id})" data-tippy-content="Ver más">
              <i class="bi bi-info-circle btn-sm iocno-ver-empleado"></i>
            </button>
            <button class="btn-editar" style="background: none; border: none; cursor: pointer;" onclick="MostrarModalEditar(${item.id})" data-tippy-content="Editar">
              <i class="bi bi-pencil-square btn-sm icono-editar-empleado"></i>
            </button>
            <button class="btn-estado" style="background: none; border: none; cursor: pointer;" onclick="ToggleEstadoEmpleado(${item.id}, ${!activo})" data-tippy-content="${tooltipEstado}">
              <i class="bi ${iconoEstado} btn-sm text-danger"></i>
            </button>
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



function MostrarDetalleEmpleado(id) {
  const empleado = empleadosData.find(e => e.id === id);
  if (!empleado) return;

  document.getElementById("detalleNombre").textContent = empleado.nombreCompleto || '';
  document.getElementById("detalleDni").textContent = empleado.dni || '';
  document.getElementById("detalleCuil").textContent = empleado.cuil || '';
  document.getElementById("detalleTelefono").textContent = empleado.telefono || '';
  document.getElementById("detalleEmail").textContent = empleado.email || '';
  document.getElementById("detalleFechaNacimiento").textContent = empleado.fechaNacimiento || '';
  document.getElementById("detalleDireccion").textContent = empleado.direccion || '';
  document.getElementById("detalleEstadoCivil").textContent = empleado.estadoCiviles || '';
  document.getElementById("detalleCantidadHijos").textContent = empleado.cantidadHijos || 0;
  document.getElementById("detallePuesto").textContent = empleado.puesto?.descripcion || '';
  document.getElementById("detalleLocalidad").textContent = empleado.localidad?.nombre || '';
  document.getElementById("detalleSexo").textContent = empleado.tipoSexo || '';

  // Mostrar el offcanvas
  const offcanvas = new bootstrap.Offcanvas('#offcanvasDetalleEmpleado');
  offcanvas.show();
}






// Función para mostrar el modal de editar empleado
async function MostrarModalEditarEmpleado(id) {
  const res = await authfetch(`Empleados/${id}`);
  const empleado = await res.json();

  document.getElementById("IdEmpleado").value = empleado.id;
  document.getElementById("NombreEmpleado").value = empleado.nombreCompleto;
  document.getElementById("DniEmpleado").value = empleado.dni;
  document.getElementById("CuilEmpleado").value = empleado.cuil;
  document.getElementById("TelefonoEmpleado").value = empleado.telefono;
  document.getElementById("EmailEmpleado").value = empleado.email;
  document.getElementById("FechaNacimientoEmpleado").value = empleado.fechaNacimiento;
  document.getElementById("DireccionEmpleado").value = empleado.direccion;
  document.getElementById("EstadoCivilEmpleado").value = empleado.estadoCiviles;
  document.getElementById("CantidadHijosEmpleado").value = empleado.cantidadHijos;
  document.getElementById("TipoSexoEmpleado").value = empleado.tipoSexo;
  document.getElementById("IdLocalidad").value = empleado.localidadId;
  document.getElementById("IdPuesto").value = empleado.puestoId;

    AbrirPanelEmpleado();
  }


// Función para buscar empleado por id
function BuscarEmpleadoId() {
    const id = parseInt(document.getElementById("IdEmpleado").value);    

    const nombreCompleto = document.getElementById("NombreEmpleado").value.trim();
    const dni = document.getElementById("DniEmpleado").value.trim();
    const cuil = document.getElementById("CuilEmpleado").value.trim();
    const telefono = document.getElementById("TelefonoEmpleado").value.trim();
    const email = document.getElementById("EmailEmpleado").value.trim();
    const fechaNacimiento = document.getElementById("FechaNacimientoEmpleado").value.trim();
    const direccion = document.getElementById("DireccionEmpleado").value.trim();
    const estadoCivil = document.getElementById("EstadoCivilEmpleado").value.trim();
    const cantidadHijos = document.getElementById("CantidadHijosEmpleado").value.trim();
    const tipoSexo = document.getElementById("TipoSexoEmpleado").value.trim();
    const localidadId = document.getElementById("IdLocalidad").value.trim();
    const puestoId = document.getElementById("IdPuesto").value.trim();

    // Si el id no existe o es 0, entonces es una nueva empleado y llamamos a la función para crear
    if (!id || id === 0) {
      CrearEmpleado();
    }

    else {
      EditarEmpleado(id, nombreCompleto, dni, cuil, telefono, email, fechaNacimiento, direccion, estadoCivil, cantidadHijos, tipoSexo, localidadId, puestoId);
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

  const inputFechaNacimiento = document.getElementById("FechaNacimientoEmpleado");
  const inputErrorFechaNacimiento = document.getElementById("errorFechaNacimientoEmpleado");

  const inputDireccion = document.getElementById("DireccionEmpleado");
  const inputErrorDireccion = document.getElementById("errorDireccionEmpleado");

  const inputTipoSexo = document.getElementById("TipoSexoEmpleado");
  const inputErrorTipoSexo = document.getElementById("errorTipoSexoEmpleado");

  const inputIdLocalidad = document.getElementById("IdLocalidad");
  const inputErrorIdLocalidad = document.getElementById("errorIdLocalidad");

  const inputIdPuesto = document.getElementById("IdPuesto");
  const inputErrorIdPuesto = document.getElementById("errorIdPuesto");

  // Obtener valores
  const nombre = inputNombre.value.trim();
  const dni = inputDni.value.trim();
  const telefono = inputTelefono.value.trim();
  const fechaNacimiento = inputFechaNacimiento.value.trim();
  const direccion = inputDireccion.value.trim();
  const tipoSexo = inputTipoSexo.value.trim();
  const localidadId = inputIdLocalidad.value.trim();
  const puestoId = inputIdPuesto.value.trim();

  // Limpiar estado previo
  const inputs = [
    inputNombre, inputDni, inputTelefono, inputFechaNacimiento,
    inputDireccion, inputTipoSexo, inputIdLocalidad, inputIdPuesto
  ];
  const errores = [
    inputErrorNombre, inputErrorDni, inputErrorTelefono, inputErrorFechaNacimiento,
    inputErrorDireccion, inputErrorTipoSexo, inputErrorIdLocalidad, inputErrorIdPuesto
  ];
  inputs.forEach(input => input.classList.remove("is-invalid", "is-valid"));
  errores.forEach(error => error.style.display = "none");

  // Validaciones
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
    error.textContent = "DNI inválido.";
  } else {
    input.classList.add("is-valid");
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
  } else {
    input.classList.add("is-valid");
    error.style.display = "none";
  }
});

// FechaNacimientoEmpleado
document.getElementById("FechaNacimientoEmpleado").addEventListener("input", () => {
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

// TipoSexoEmpleado (select)
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

  const inputFechaNacimiento = document.getElementById("FechaNacimientoEmpleado");
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

  const inputErrorFechaNacimiento = document.getElementById("errorFechaNacimientoEmpleado");
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
}

// Función para crear empleado
function CrearEmpleado() {
    if(!ValidarFormularioEmpleado()) return;

  const empleado = {
    nombreCompleto: document.getElementById("NombreEmpleado").value.trim(),
    dNI: parseInt(document.getElementById("DniEmpleado").value.trim()),
    cuil: parseInt(document.getElementById("CuilEmpleado").value.trim()),
    telefono: document.getElementById("TelefonoEmpleado").value.trim() || "",
    email: document.getElementById("EmailEmpleado").value.trim(),
    fechaNacimiento: document.getElementById("FechaNacimientoEmpleado").value,
    direccion: document.getElementById("DireccionEmpleado").value.trim(),
    estadoCiviles: document.getElementById("EstadoCivilEmpleado").value.trim(), // Si envías string, revisa backend para convertir enum
    cantidadHijos: parseInt(document.getElementById("CantidadHijosEmpleado").value.trim()) || 0,
    tipoSexo: document.getElementById("TipoSexoEmpleado").value.trim(),
    localidadId: parseInt(document.getElementById("IdLocalidad").value.trim()) || 0,
    puestoId: parseInt(document.getElementById("IdPuesto").value.trim()) || 0,
  };



    console.log(empleado);

    // Enviamos el objeto al backend.
    fetch("https://localhost:7006/Empleados", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(empleado)
    })
    .then(response => {
      if (response.ok) {
        
        ObtenerEmpleados();
      } else {
        // Si hubo un error, mostramos un mensaje.
        alert("Error al crear el empleado.");
      }
    });
  }


  

    




ObtenerEmpleados();