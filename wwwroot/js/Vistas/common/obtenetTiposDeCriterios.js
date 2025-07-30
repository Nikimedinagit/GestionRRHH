async function ObtenerTiposDeCriteriosDropDown() {
    const res = await authFetch("TiposDeCriterios/Activos", {
        method: "GET",
      })
        .then(response => response.json()) 
        .then(data => {
            MostrarTiposDeCriteriosDropDown(data) 
        })
        .catch(error => console.log("No se puede acceder al servicio.", error))  
}


function  MostrarTiposDeCriteriosDropDown(data) {
    const $dropdown = $('#IdTipoCriterio');
    $dropdown.empty();

    // Agrega la opción por defecto
    $dropdown.append(`<option value="" selected disabled hidden>Seleccione</option>`);

    // Agrega los tipos de licencia activos
    $.each(data, function (index, item) {
        $dropdown.append(`<option value="${item.id}">${item.nombre}</option>`);
    });
}



ObtenerTiposDeCriteriosDropDown();