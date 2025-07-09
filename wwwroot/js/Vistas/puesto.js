// Función para abrir el formulario lateral
function AbrirPanelPuesto() {
  document.getElementById("panelPuesto").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombrePuesto");
    if(inputNombre) inputNombre.focus();
  }, 400);
}

  //Funcion para cerrar el formulario lateral
  function CerrarPanelPuesto() {
    document.getElementById("panelPuesto").classList.remove("abierto");
    const fondo = document.getElementById("fondoOscuro");
    fondo.classList.remove("visible");

    LimpiarModalPuesto();

}

// Obtener Puestos
function ObtenerPuestos() {
    fetch('https://localhost:7006/Puestos')
    .then(response => response.json())
    .then(data => {
        MostrarPuestos(data)
        LimpiarModalPuesto();
        CerrarPanelPuesto();
      })
    .catch(error => console.log('No se pudo obtener las puestos', error)); 
}


// Funcion Para Mostrar Las Puestos
function MostrarPuestos(data) {
    $('#tablaPuestosBody').empty();

    data.forEach(element => {
        const tr = document.createElement('tr');
        if (element.eliminado) {
            tr.classList.add('fila-desactivada');
        }

        // Celda nombre
        const tdNombre = document.createElement('td');
        tdNombre.textContent = element.descripcion;
        tr.appendChild(tdNombre);

        // Celda sector (nombre sector)
        const tdSector = document.createElement('td');
        tdSector.classList.add('col-sector');
        tdSector.textContent = element.sector?.nombre || '';
        tr.appendChild(tdSector);

        // Celda acciones
        const tdAcciones = document.createElement('td');
        tdAcciones.className = 'acciones-cell';

        if (!element.eliminado) {
            const btnEditar = document.createElement('button');
            btnEditar.className = 'icon-btn icon-editar';
            btnEditar.title = 'Editar puesto';
            btnEditar.innerHTML = '<i class="bx bx-edit"></i>';
            btnEditar.onclick = () => MostrarModalEditar(element.id, element.descripcion, element.sectorId);
            tdAcciones.appendChild(btnEditar);
        }

        const btnToggle = document.createElement('button');
        btnToggle.className = 'icon-btn icon-toggle';
        btnToggle.title = element.eliminado ? 'Activar puesto' : 'Desactivar puesto';
        btnToggle.innerHTML = element.eliminado
            ? '<i class="bx bx-toggle-right" style="color: green;"></i>'
            : '<i class="bx bx-toggle-left" style="color: red;"></i>';
        btnToggle.onclick = () => EliminarPuestoId(element.id, element.eliminado);
        tdAcciones.appendChild(btnToggle);

       if (!element.eliminado) {
        const btnDetalle = document.createElement('button');
        btnDetalle.className = 'icon-btn icon-detalle btn-verde';  
        btnDetalle.title = 'Ver detalle';
        btnDetalle.innerHTML = '<i class="bx bx-chevron-down"></i>';
        btnDetalle.onclick = () => toggleDetalle(element.id);
        tdAcciones.appendChild(btnDetalle);
        }


        tr.appendChild(tdAcciones);
        $('#tablaPuestosBody').append(tr);

        // Segunda fila: Detalle
        const trDetalle = document.createElement('tr');
        trDetalle.id = `detalle-${element.id}`;
        trDetalle.style.display = 'none';

        const tdDetalle = document.createElement('td');
        tdDetalle.colSpan = 3;
        tdDetalle.innerHTML = `
            <div class="detalle-contenido">
                <strong>Puesto:</strong> ${element.descripcion} <br>
                <strong>Sector:</strong> ${element.sector?.nombre || 'Sin sector'}
            </div>
        `;
        trDetalle.appendChild(tdDetalle);
        $('#tablaPuestosBody').append(trDetalle);
    });
}

function toggleDetalle(id) {
    const fila = document.getElementById(`detalle-${id}`);
    fila.style.display = fila.style.display === 'none' ? 'table-row' : 'none';
}



// Funcion para mostar el modal de edición de la puesto
function MostrarModalEditar(id, descripcion, sectorId) {          
    document.getElementById('IdPuesto').value = id;
    document.getElementById('NombrePuesto').value = descripcion;
    document.getElementById('IdSector').value = sectorId;

    AbrirPanelPuesto(); 
}   


// Funcion para buscar el id de la puesto y llamar a la función de edición o creación
function BuscarPuestosId() { 
    
    const id = parseInt(document.getElementById("IdPuesto").value); 

    const nombre = document.getElementById("NombrePuesto").value.trim();

    const sectorId = parseInt(document.getElementById("IdSector").value);

    //Si el id no existe o es 0, entonces es una nueva puesto y llamamos a la función para crear
    if (!id || id === 0) {
        CrearPuesto();
    }
    else {
        EditarPuesto(id, nombre, sectorId); 
    }
}


// Funcion para limpiar el formulario de la puesto
function LimpiarModalPuesto() {
  // Limpia el formulario
  document.getElementById('IdPuesto').value = '';
  const inputNombre = document.getElementById('NombrePuesto');
  inputNombre.value = '';

  const inputIdSector = document.getElementById('IdSector');
  inputIdSector.value = '';


  // Limpia los estilos de validación
  inputNombre.classList.remove('is-invalid');
  inputNombre.classList.remove('is-valid');
  inputIdSector.classList.remove('is-invalid');
  inputIdSector.classList.remove('is-valid');

  // Limpia el mensaje de error
  const inputErrorNombre = document.getElementById('errorNombrePuesto');
  inputErrorNombre.textContent = '';
  inputErrorNombre.style.display = 'none';

  const inputErrorIdSector = document.getElementById('errorIdSector');
  inputErrorIdSector.textContent = '';   
  inputErrorIdSector.style.display = 'none';
}   


// Función para validar el formulario de puesto
function ValidarFormularioPuesto() {
    const inputNombre = document.getElementById("NombrePuesto");
    const inputErrorNombre = document.getElementById("errorNombrePuesto");
    const selectSector = document.getElementById("IdSector");
    const inputErrorSector = document.getElementById("errorIdSector");
    const nombre = inputNombre.value.trim();
    const sectorSeleccionada = selectSector.value;

    // Limpiar errores previos
    inputErrorNombre.style.display = 'none';
    inputErrorNombre.textContent = '';
    inputNombre.classList.remove("is-invalid", "is-valid");

    inputErrorSector.style.display = 'none';
    inputErrorSector.textContent = '';
    selectSector.classList.remove("is-invalid", "is-valid");

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
        inputErrorNombre.style.display = "none";
        inputErrorNombre.textContent = "";
    }

    // Validar sector
    if (!sectorSeleccionada) {
        selectSector.classList.add("is-invalid");
        inputErrorSector.style.display = "block";
        inputErrorSector.textContent = "Seleccione un sector.";
        esValido = false;
    } else {
        selectSector.classList.add("is-valid");
        inputErrorSector.style.display = "none";
        inputErrorSector.textContent = "";
    }

    return esValido;
}



// 🎨 Validación en vivo: cambia el color mientras el usuario escribe
document.getElementById("NombrePuesto").addEventListener("input", () => {
    const inputNombre = document.getElementById("NombrePuesto");
    const errorNombre = document.getElementById("errorNombrePuesto");
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
        inputNombre.classList.add("is-valid"); // Aplica color verde cuando es válido
        errorNombre.style.display = "none";
    }
});


function MostrarErrorPuestoExistente(mensaje) {
    const errorPuesto = document.getElementById("errorNombrePuesto");
    const inputNombrePuesto = document.getElementById("NombrePuesto");

    errorPuesto.textContent = mensaje;
    errorPuesto.style.display = "block";
    inputNombrePuesto.classList.add("is-invalid");
}


// Función para crear una puesto
function CrearPuesto() {

    if (!ValidarFormularioPuesto()) return;

    const puesto = {
        descripcion: document.getElementById('NombrePuesto').value.trim(),
        sectorId: document.getElementById('IdSector').value
    }
    fetch('https://localhost:7006/Puestos',
        {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(puesto)
        })
    .then(response => response.json())
    .then(response => {

        if (response.mensaje){
            MostrarErrorPuestoExistente(response.mensaje);
        } else {
            CerrarPanelPuesto();
            ObtenerPuestos();
            // Mostrar alerta de éxito
        Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: '¡Puesto Creado!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#f0f0f0',
        color: '#000',
        });
        }

      
   

    
    })
} 


// Funcion para editar una puesto
function EditarPuesto(id, descripcion, sectorId) {
    let puesto = {
        id: id,
        descripcion: descripcion,
        sectorId: sectorId
    }
    fetch('https://localhost:7006/Puestos/' + id,
        {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(puesto)
        })
    .then(response => response.json())
    .then(response => {
        if (response.mensaje){
            MostrarErrorPuestoExistente(response.mensaje);
        } else {
            ObtenerPuestos();
            // Mostrar alerta de éxito
        Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: '¡Puesto Modificado!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#f0f0f0',
        color: '#000',
        });
        }
    })
} 


// Función para eliminar una puesto
function EliminarPuestoId(id, eliminado) {
    Swal.fire({
        title: '¿Está seguro?',
        text: eliminado 
            ? '¿Está seguro de que desea reactivar esta puesto?' 
            : 'Una vez desactivada, no podrá usar esta puesto.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true
    }).then((result) => {
        if (result.isConfirmed) {
            EliminarSiPuesto(id);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Acción cancelada',
                text: eliminado 
                    ? 'La puesto sigue desactivada.' 
                    : 'La puesto sigue activa.',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'bottom-end'
            });
        }
    });
}

// Función para eliminar una puesto
function EliminarSiPuesto(id) {
    fetch('https://localhost:7006/Puestos/' + id, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("No se pudo eliminar/reactivar la puesto");
        }
        return response.json();
    })
    .then((data) => {
        ObtenerPuestos();

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
        Swal.fire('Error', 'No se pudo actualizar la puesto.', 'error');
    });
}       



ObtenerPuestos();