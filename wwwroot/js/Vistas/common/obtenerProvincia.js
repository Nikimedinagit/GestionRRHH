function ObtenerProvinciasDropDown() {
    fetch('https://localhost:7006/Provincias', {
        method: "GET",
      })
        .then(response => response.json()) // Convierte la respuesta en json.
        .then(data => {
            MostrarProvinciasDropDown(data) // Muestra los datos en la tabla.
        })
        .catch(error => console.log("No se puede acceder al servicio.", error))  // En caso que falle, muestra el error por consola.
}


function MostrarProvinciasDropDown(data) {
    $("#IdProvincia").empty();  

    // Mostrar solo los activos 
    data = data.filter(item => item.eliminado == false);

    // mostar una opcion para seleccionar
    $('#IdProvincia').append(
        `<option value="0" selected disabled hidden>Seleccione una provincia</option>`
    );
        
    $.each(data, function (index, item) {
        $('#IdProvincia').append( 
            `<option value="${item.id}">${item.nombre}</option>`
        );
    });
}



ObtenerProvinciasDropDown();
   