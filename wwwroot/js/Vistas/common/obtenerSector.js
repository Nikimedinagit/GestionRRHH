// Función para obtener los sectores
async function ObtenerSectoresDropDown() {
    const res = await authFetch("Sector", {
        method: "GET",
      })
        .then(response => response.json())  
        .then(data => {
            MostrarSectoresDropDown(data) 
        })
        .catch(error => console.log("No se puede acceder al servicio.", error))  // En caso que falle, muestra el error por consola.
}


function MostrarSectoresDropDown(data) {
      const $dropdown = $('#IdSector');
    $dropdown.empty();  

    // Agrega la opción por defecto
    $dropdown.append(`<option value="" selected disabled hidden>Seleccione un sector</option>`);

    // Filtra solo los no eliminados
    data = data.filter(item => item.eliminado === false);

    // Agrega los sectores activos
    $.each(data, function (index, item) {
        $dropdown.append(`<option value="${item.id}">${item.nombre}</option>`);
    });


}


ObtenerSectoresDropDown();