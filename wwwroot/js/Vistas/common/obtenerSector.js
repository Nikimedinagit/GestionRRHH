// Función para obtener los sectores
function ObtenerSectoresDropDown() {
    fetch('https://localhost:7006/Sector', {
        method: "GET",
      })
        .then(response => response.json()) // Convierte la respuesta en json.
        .then(data => {
            MostrarSectoresDropDown(data) // Muestra los datos en la tabla.
        })
        .catch(error => console.log("No se puede acceder al servicio.", error))  // En caso que falle, muestra el error por consola.
}


function MostrarSectoresDropDown(data) {
    $("#IdSector").empty();  

    // Mostrar solo los activos 
    data = data.filter(item => item.eliminado == false);

    // mostar una opcion para seleccionar
    $('#IdSector').append(
        `<option value="0" selected disabled hidden>Seleccione un sector</option>`
    );
        
    $.each(data, function (index, item) {
        $('#IdSector').append( 
            `<option value="${item.id}">${item.nombre}</option>`
        );
    });
}


ObtenerSectoresDropDown();