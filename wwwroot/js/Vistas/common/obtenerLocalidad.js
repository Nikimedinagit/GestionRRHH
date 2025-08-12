async function ObtenerLocalidadesDropDown() {
    const res = await authFetch("Localidades/Activos", {
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


    // mostar una opcion para seleccionar
    $('#IdLocalidad').append(
        `<option value="0" selected disabled hidden>Seleccione</option>`
    );
        
    $.each(data, function (index, item) {
        $('#IdLocalidad').append( 
            `<option value="${item.id}">${item.nombre}</option>`
        );
    });
}



ObtenerLocalidadesDropDown();
   