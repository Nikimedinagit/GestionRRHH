
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
    const res = await authfetch("Empleados")
    .then(response => response.json())
    .then(data => {
        MostrarEmpleados(data)
       LimpiarFormularioEmpleado();
      })
     .catch(error => {
        console.error('No se pudo obtener los empleados', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar empleados',
            text: 'No se pudo obtener la lista de empleados.',
        });

     });
}

// Función para mostrar los empleados en la tabla
function MostrarEmpleados(data) {
    $('#tablaEmpleadosBody').empty();

    $.each(data, function(index, item) {
      let iconClass = item.eliminado ? "bx bx-toggle-left" : "bx bx-toggle-right";
      let toggleColorClass = item.eliminado ? "icon-toggle-off style= color: red;" : "icon-toggle-on style= color: green;";

      // Fila principal
      let filaPrincipal = 
        "<tr data-id='" + item.id + "'>" +
          "<td>" + item.nombreCompleto + "</td>" +
          "<td>" + item.dni + "</td>" +
          "<td>" + (item.puesto?.descripcion || '') + "</td>" +
          "<td class='td-acciones'>" +
            "<button class='icon-btn icon-ver' title='Ver más' onclick='MostrarDetalleEmpleado(" + JSON.stringify(item).replace(/'/g, "\\'") + ")'>" +
              "<i class='bx bx-show'></i>" +
            "</button>"+

            "<button class='icon-btn icon-editar' title='Editar' onclick='MostrarModalEditarEmpleado(" +
            item.id + ")'>" +
              "<i class='bx bx-edit'></i>" +
            "</button>" +
            "<button class='icon-btn " + toggleColorClass + "' title='Activar/Desactivar' onclick='EliminarCategoriaId(" + item.id + ", " + item.eliminado + ")'>" +
              "<i class='" + iconClass + "'></i>" +
            "</button>" +
          "</td>" +
        "</tr>";

      
      $('#tablaEmpleadosBody').append(filaPrincipal );
    });
  }

 // Funcion para mostrar los detalles del empleado
function MostrarDetalleEmpleado(item) {
  document.getElementById("detalleNombre").textContent = item.nombreCompleto || '';
  document.getElementById("detalleDni").textContent = item.dni || '';
  document.getElementById("detalleCuil").textContent = item.cuil || '';
  document.getElementById("detalleTelefono").textContent = item.telefono || '';
  document.getElementById("detalleEmail").textContent = item.email || '';
  document.getElementById("detalleFechaNacimiento").textContent = item.fechaNacimiento || '';
  document.getElementById("detalleDireccion").textContent = item.direccion || '';
  document.getElementById("detalleEstadoCivil").textContent = item.estadoCiviles || '';
  document.getElementById("detalleCantidadHijos").textContent = item.cantidadHijos || 0;
  document.getElementById("detallePuesto").textContent = item.puesto?.descripcion || '';
  document.getElementById("detalleLocalidad").textContent = item.localidad?.nombre || '';
  document.getElementById("detalleSexo").textContent = item.tipoSexo || '';

  document.getElementById('modalDetallesEmpleado').classList.add('show');
  document.getElementById('overlay').classList.add('show');
}

// Función para cerrar el modal de detalles
function cerrarModalDetalles() {
  document.getElementById('modalDetallesEmpleado').classList.remove('show');
  document.getElementById('overlay').classList.remove('show');
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