async function ObtenerLocalidadesDropDown() {
    const res = await authFetch("Localidades", {
        method: "GET",
      })
        .then(response => response.json()) 
        .then(data => {
            MostrarLocalidadesDropDown(data) 
        })
        .catch(error => console.log("No se puede acceder al servicio.", error))  
}


function MostrarLocalidadesDropDown(data) {
    $("#IdLocalidad").empty();

    // Mostrar solo los activos 
    data = data.filter(item => item.eliminado == false);

    // mostar una opcion para seleccionar
    $('#IdLocalidad').append(
        `<option value="0" selected disabled hidden>Seleccione una localidad</option>`
    );
        
    $.each(data, function (index, item) {
        $('#IdLocalidad').append( 
            `<option value="${item.id}">${item.nombre}</option>`
        );
    });
}



ObtenerLocalidadesDropDown();
   