// Función para obtener los sectores
async function ObtenerSectoresDropDown() {
    const res = await authFetch("Sector/Activos", {
        method: "GET",
      })
        .then(response => response.json())  
        .then(data => {
            MostrarSectoresDropDown(data) 
        })
        .catch(error => console.log("No se puede acceder al servicio.", error))  
}


function MostrarSectoresDropDown(data) {
      const $dropdown = $('#IdSector');
    $dropdown.empty();  

    // Agrega la opción por defecto
    $dropdown.append(`<option value="" selected disabled hidden>Seleccione un sector</option>`);


    // Agrega los sectores activos
    $.each(data, function (index, item) {
        $dropdown.append(`<option value="${item.id}">${item.nombre}</option>`);
    });


}


ObtenerSectoresDropDown();