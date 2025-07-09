// Función para abrir el formulario lateral
function AbrirPanelSector() {
  document.getElementById("panelSector").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreSector");
    if(inputNombre) inputNombre.focus();
  }, 400);
}

  //Funcion para cerrar el formulario lateral
  function CerrarPanelSector() {
    document.getElementById("panelSector").classList.remove("abierto");
    const fondo = document.getElementById("fondoOscuro");
    fondo.classList.remove("visible");

    LimpiarModalSector();

}

// Obtener Sectores
function ObtenerSectores() {
    fetch('https://localhost:7006/Sector')
    .then(response => response.json())
    .then(data => {
        MostrarSectores(data)
        LimpiarModalSector();
        CerrarPanelSector();
      })
    .catch(error => console.log('No se pudo obtener las sectores', error)); 
}


// Funcion Para Mostrar Las Sectores
function MostrarSectores(data) {
    $('#tablaSectoresBody').empty();

    data.forEach(element => {
        const tr = document.createElement('tr');
        if (element.eliminado) {
            tr.classList.add('fila-desactivada');
        }

        // Celda nombre
        const tdNombre = document.createElement('td');
        tdNombre.textContent = element.nombre;
        tr.appendChild(tdNombre);

        // Celda acciones (editar + activar/desactivar)
        const tdAcciones = document.createElement('td');
        tdAcciones.className = 'acciones-cell';

        if (!element.eliminado) {
          
            const btnEditar = document.createElement('button');
            btnEditar.className = 'icon-btn icon-editar';
            btnEditar.title = 'Editar sector';
            btnEditar.innerHTML = '<i class="bx bx-edit"></i>';
            btnEditar.onclick = () => MostrarModalEditar(element.id, element.nombre);
            tdAcciones.appendChild(btnEditar);
        }           

        const btnToggle = document.createElement('button');
        btnToggle.className = 'icon-btn icon-toggle';
        btnToggle.title = element.eliminado ? 'Activar sector' : 'Desactivar sector';
        btnToggle.innerHTML = element.eliminado
            ? '<i class="bx bx-toggle-right" style="color: green;"></i>'
            : '<i class="bx bx-toggle-left" style="color: red;"></i>';
        btnToggle.onclick = () => EliminarSectorId(element.id, element.eliminado);
        tdAcciones.appendChild(btnToggle);

        tr.appendChild(tdAcciones);
        $('#tablaSectoresBody').append(tr);
    });
}


// Funcion para mostar el modal de edición de la sector
function MostrarModalEditar(id, nombre) {
    document.getElementById('IdSector').value = id;
    document.getElementById('NombreSector').value = nombre;

    AbrirPanelSector(); 
}   


// Funcion para buscar el id de la sector y llamar a la función de edición o creación
function BuscarSectorId() { 
    
    const id = parseInt(document.getElementById("IdSector").value); 
    const nombre = document.getElementById("NombreSector").value.trim();
    //Si el id no existe o es 0, entonces es una nueva sector y llamamos a la función para crear
    if (!id || id === 0) {
        CrearSector();
    }
    else {
        EditarSector(id, nombre); 
    }
}


// Funcion para limpiar el formulario de la sector
function LimpiarModalSector() {
  // Limpia el formulario
  document.getElementById('IdSector').value = '';
  const inputNombre = document.getElementById('NombreSector');
  inputNombre.value = '';

  // Limpia los estilos de validación
  inputNombre.classList.remove('is-invalid');
  inputNombre.classList.remove('is-valid');

  // Limpia el mensaje de error
  const inputErrorNombre = document.getElementById('errorNombreSector');
  inputErrorNombre.textContent = '';
  inputErrorNombre.style.display = 'none';
}


// Función para validar el formulario de sector
function ValidarFormularioSector() {
    const inputNombre = document.getElementById("NombreSector");
    const inputErrorNombre = document.getElementById("errorNombreSector");
    const nombre = inputNombre.value.trim();

    // Limpiar errores previos
    inputErrorNombre.style.display = 'none';
    inputErrorNombre.textContent = '';
    inputNombre.classList.remove("is-invalid", "is-valid");

    if (nombre.length === 0) {
        inputNombre.classList.add("is-invalid");
        inputErrorNombre.style.display = "block";
        inputErrorNombre.textContent = "Campo obligatorio.";
        return false;
    }

    if (nombre.length < 3) {
        inputNombre.classList.add("is-invalid");
        inputErrorNombre.style.display = "block";
        inputErrorNombre.textContent = "Mínimo 3 caracteres.";
        return false;
    }

    inputNombre.classList.add("is-valid"); // Aplica color verde cuando es válido
    inputErrorNombre.style.display = "none";
    return true;
}

// 🎨 Validación en vivo: cambia el color mientras el usuario escribe
document.getElementById("NombreSector").addEventListener("input", () => {
    const inputNombre = document.getElementById("NombreSector");
    const errorNombre = document.getElementById("errorNombreSector");
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
        inputNombre.classList.add("is-valid"); // Color verde cuando cumple
        errorNombre.style.display = "none";
    }
});


function MostrarErrorSectorExistente(mensaje) {
    const errorSector = document.getElementById("errorNombreSector");
    const inputNombreSector = document.getElementById("NombreSector");

    errorSector.textContent = mensaje;
    errorSector.style.display = "block";
    inputNombreSector.classList.add("is-invalid");
}



// Funcion para crear una sector
function CrearSector() {

    if (!ValidarFormularioSector()) return;

    const sector = {
        nombre: document.getElementById('NombreSector').value.trim(),
    }
    fetch('https://localhost:7006/Sector',
        {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sector)
        })
    .then(response => response.json())
    .then(response => {

        if (response.mensaje){
            MostrarErrorSectorExistente(response.mensaje);
        } else {
            CerrarPanelSector();
            ObtenerSectores();
            // Mostrar alerta de éxito
        Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: '¡Sector Creado!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#f0f0f0',
        color: '#000',
        });
        }

      
   

    
    })
} 


// Funcion para editar una sector
function EditarSector(id, nombre) {
    let sector = {
        id: id,
        nombre: nombre
    }
    fetch('https://localhost:7006/Sector/' + id,
        {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sector)
        })
    .then(response => response.json())
    .then(response => {
        if (response.mensaje){
            MostrarErrorSectorExistente(response.mensaje);
        } else {
            ObtenerSectores();
            // Mostrar alerta de éxito
        Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: '¡Sector Modificado!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#f0f0f0',
        color: '#000',
        });
        }
    })
} 


// Función para eliminar una sector
function EliminarSectorId(id, eliminado) {
    Swal.fire({
        title: '¿Está seguro?',
        text: eliminado 
            ? '¿Está seguro de que desea reactivar esta sector?' 
            : 'Una vez desactivada, no podrá usar esta sector.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true
    }).then((result) => {
        if (result.isConfirmed) {
            EliminarSiSector(id);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Acción cancelada',
                text: eliminado 
                    ? 'El sector sigue desactivada.' 
                    : 'El sector sigue activa.',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'bottom-end'
            });
        }
    });
}

// Función para eliminar una sector
function EliminarSiSector(id) {
    fetch('https://localhost:7006/Sector/' + id, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("No se pudo eliminar/reactivar la sector");
        }
        return response.json();
    })
    .then((data) => {
        ObtenerSectores();

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
        Swal.fire('Error', 'No se pudo actualizar la sector.', 'error');
    });
}


ObtenerSectores();


