async function ObtenerPuestosDropDown() {
    const res = await authFetch("Puestos/Activos", {
        method: "GET",
      })
        .then(response => response.json()) 
        .then(data => {
            MostrarPuestosDropDown(data) 
        })
        .catch(error => console.log("No se puede acceder al servicio.", error))  
}


function MostrarPuestosDropDown(data) {
    $("#IdPuesto").empty();

    // mostar una opcion para seleccionar
    $('#IdPuesto').append(
        `<option value="0" selected disabled hidden>Seleccione</option>`
    );
        
    $.each(data, function (index, item) {
        $('#IdPuesto').append( 
            `<option value="${item.id}">${item.descripcion}</option>`
        );
    });
}



ObtenerPuestosDropDown();
   