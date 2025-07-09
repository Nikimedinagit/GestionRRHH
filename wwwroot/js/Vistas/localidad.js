//Función para abrir el formulario lateral
function AbrirPanelLocalidad() {
  document.getElementById("panelLocalidad").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreLocalidad");
    if(inputNombre) inputNombre.focus();
  }, 400);
}

 //Funcion para cerrar el formulario lateral
  function CerrarPanelLocalidad() {
    document.getElementById("panelLocalidad").classList.remove("abierto");
    const fondo = document.getElementById("fondoOscuro");
    fondo.classList.remove("visible");

    LimpiarModalLocalidad();
}


// Funcion Para Obtener las Localidades
function ObetenerLocalidades() {
    fetch('https://localhost:7006/Localidades')
    .then(response => response.json())
    .then(data => {
        MostrarLocalidades(data)
        LimpiarModalLocalidad();
        CerrarPanelLocalidad();
      })
    .catch(error => console.log('No se pudo obtener las localidades', error));
}


// Funcion Para Mostrar Las Localidades
function MostrarLocalidades(data) {
    $('#tablaLocalidadesBody').empty();

    data.forEach(element => {
        console.log("Localidad:", element.nombre, "Provincia:", element.provincia);

        const tr = document.createElement('tr');
        if (element.eliminado) {
            tr.classList.add('fila-desactivada');
        }

        // Celda nombre (localidad)
        const tdNombre = document.createElement('td');
        tdNombre.textContent = element.nombre;
        tr.appendChild(tdNombre);

        // Celda provincia (nombre provincia)
        const tdProvincia = document.createElement('td');
        tdProvincia.textContent = element.provincia?.nombre || '';
        tr.appendChild(tdProvincia);

        // Celda acciones
        const tdAcciones = document.createElement('td');
        tdAcciones.classList.add('acciones');
        tdAcciones.style.textAlign = 'center'; 

      
        if (!element.eliminado) {
            const btnEditar = document.createElement('button');
            btnEditar.className = 'icon-btn icon-editar';
            btnEditar.title = 'Editar localidad';
            btnEditar.innerHTML = '<i class="bx bx-edit"></i>';
            btnEditar.onclick = () => MostrarModalEditarLocalidad(element.id, element.nombre, element.provinciaId);
            tdAcciones.appendChild(btnEditar);
        }


        const btnToggle = document.createElement('button');
        btnToggle.className = 'icon-btn icon-toggle';
        btnToggle.title = element.eliminado ? 'Activar localidad' : 'Desactivar localidad';
        btnToggle.innerHTML = element.eliminado
            ? '<i class="bx bx-toggle-right" style="color: green;"></i>'
            : '<i class="bx bx-toggle-left" style="color: red;"></i>';
        btnToggle.onclick = () => EliminarLocalidadId(element.id, element.eliminado);
        tdAcciones.appendChild(btnToggle);

        tr.appendChild(tdAcciones);

        $('#tablaLocalidadesBody').append(tr);
    });
}


// Funcion para mostrar el modal de edición de la localidad
function MostrarModalEditarLocalidad(id, nombre, provinciaId) {
    document.getElementById('IdLocalidad').value = id;
    document.getElementById('NombreLocalidad').value = nombre;
    document.getElementById('IdProvincia').value = provinciaId;

    AbrirPanelLocalidad();
}


// Funcion para buscar el id de la localidad y llamar a la función de edición o creación
function BuscarLocalidadId() {
    
    const id = parseInt(document.getElementById("IdLocalidad").value);    

    const nombre = document.getElementById("NombreLocalidad").value.trim();

    const provinciaId = parseInt(document.getElementById("IdProvincia").value);

    //Si el id no existe o es 0, entonces es una nueva localidad y llamamos a la función para crear
    if (!id || id === 0) {
        CrearLocalidad();
    }
    else {
        EditarLocalidad(id, nombre, provinciaId); 
    }
}


// Funcion para limpiar el formulario de la localidad
function LimpiarModalLocalidad() {
  // Limpia el formulario
  document.getElementById('IdLocalidad').value = '';

  const inputNombre = document.getElementById('NombreLocalidad');
  inputNombre.value = ''; 

  const inputIdProvincia = document.getElementById('IdProvincia');
  inputIdProvincia.value = '';


  // Limpia los estilos de validación
  inputNombre.classList.remove('is-invalid');
  inputNombre.classList.remove('is-valid');
  inputIdProvincia.classList.remove('is-invalid');
  inputIdProvincia.classList.remove('is-valid');

  // Limpia el mensaje de error
  const inputErrorNombre = document.getElementById('errorNombreLocalidad');
  inputErrorNombre.textContent = '';
  inputErrorNombre.style.display = 'none';

  const inputErrorIdProvincia = document.getElementById('errorIdProvincia');
  inputErrorIdProvincia.textContent = '';   
  inputErrorIdProvincia.style.display = 'none';
}


// Función para validar el formulario de localidad
function ValidarFormularioLocalidad() {
    const inputNombre = document.getElementById("NombreLocalidad");
    const inputErrorNombre = document.getElementById("errorNombreLocalidad");

    const selectProvincia = document.getElementById("IdProvincia");
    const inputErrorProvincia = document.getElementById("errorIdProvincia");

    const nombre = inputNombre.value.trim();
    const provinciaSeleccionada = selectProvincia.value;

    // Limpiar errores previos
    inputErrorNombre.style.display = 'none';
    inputErrorNombre.textContent = '';
    inputNombre.classList.remove("is-invalid", "is-valid");

    inputErrorProvincia.style.display = 'none';
    inputErrorProvincia.textContent = '';
    selectProvincia.classList.remove("is-invalid", "is-valid");

    let esValido = true;

    // Validar nombre
    if (nombre.length === 0) {
        inputNombre.classList.add("is-invalid");
        inputErrorNombre.style.display = "block";
        inputErrorNombre.textContent = "Campo obligatorio.";
        esValido = false;
    } else if (nombre.length < 3) {
        inputNombre.classList.add("is-invalid");
        inputErrorNombre.style.display = "block";
        inputErrorNombre.textContent = "Mínimo 3 caracteres.";
        esValido = false;
    } else {
        inputNombre.classList.add("is-valid");
    }

    // Validar provincia
    if (!provinciaSeleccionada) {
        selectProvincia.classList.add("is-invalid");
        inputErrorProvincia.style.display = "block";
        inputErrorProvincia.textContent = "Seleccione una provincia.";
        esValido = false;
    } else {
        selectProvincia.classList.add("is-valid");
    }

    return esValido;
}



// 🎨 Validación en vivo: cambia el color mientras el usuario escribe
document.getElementById("NombreLocalidad").addEventListener("input", () => {
    const inputNombre = document.getElementById("NombreLocalidad");
    const errorNombre = document.getElementById("errorNombreLocalidad");
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


// Funcion para mostrar un mensaje de error en la pantalla 
function MostrarErrorLocalidadExistente(mensaje) {
    const errorLocalidad = document.getElementById("errorNombreLocalidad");
    const inputNombreLocalidad = document.getElementById("NombreLocalidad");    

    errorLocalidad.textContent = mensaje;
    errorLocalidad.style.display = "block";
    inputNombreLocalidad.classList.add("is-invalid");
}


// Funcion crear localidad
function CrearLocalidad() {

    if(!ValidarFormularioLocalidad()) return;

    const localidad = {
        nombre: document.getElementById('NombreLocalidad').value.trim(),
        provinciaId: document.getElementById('IdProvincia').value
    }
    fetch('https://localhost:7006/Localidades',
        {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(localidad)
        })
    .then(response => response.json())
    .then(response => {
        if (response.mensaje){
            MostrarErrorLocalidadExistente(response.mensaje);
        } else {

            CerrarPanelLocalidad();
            ObetenerLocalidades();
            // Mostrar alerta de éxito
        Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: '¡Localidad Creada!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#f0f0f0',
        color: '#000',
        });

         }
 
    })
}


//Funcion para editar localidad
function EditarLocalidad(id, nombre, provinciaId) {
    let localidad = {
        id: id,
        nombre: nombre,
        provinciaId: provinciaId
    }
    fetch('https://localhost:7006/Localidades/' + id,
        {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(localidad)
        })
    .then(response => response.json())
    .then(response => {
        if (response.mensaje){
            MostrarErrorLocalidadExistente(response.mensaje);
        } else {
            ObetenerLocalidades();
            // Mostrar alerta de éxito
        Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: '¡Localidad Modificada!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#f0f0f0',
        color: '#000',
        });
        }
    })

}


// Funcion para activar o desactivar una localidad
function EliminarLocalidadId(id, eliminado) {
    Swal.fire({
        title: '¿Está seguro?',
        text: eliminado 
            ? '¿Está seguro de que desea reactivar esta localidad?' 
            : 'Una vez desactivada, no podrá usar esta localidad.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true
    }).then((result) => {
        if (result.isConfirmed) {
            EliminarSiLocalidad(id);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Acción cancelada',
                text: eliminado 
                    ? 'La localidad sigue desactivada.' 
                    : 'La localidad sigue activa.',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'bottom-end'
            });
        }
    });
}


function EliminarSiLocalidad(id) {
    fetch('https://localhost:7006/Localidades/' + id, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("No se pudo eliminar/reactivar la localidad");
        }
        return response.json();
    })
    .then((data) => {
        ObetenerLocalidades();

        // Mostrar el mensaje que vino del backend
        Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'success',
            title: '¡' + data.mensaje + '!',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: '#f0f0f0',
            color: '#000',
        });
    })
    .catch(error => {
        console.error(error);
        Swal.fire('Error', 'No se pudo actualizar la localidad.', 'error');
    });
}



ObetenerLocalidades();