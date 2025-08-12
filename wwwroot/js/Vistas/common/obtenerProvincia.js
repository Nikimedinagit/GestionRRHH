async function ObtenerProvinciasDropDown() {
    const res = await authFetch("Provincias/Activos", {
        method: "GET",
      })
        .then(response => response.json()) 
        .then(data => {
            MostrarProvinciasDropDown(data) 
        })
        .catch(error => console.log("No se puede acceder al servicio.", error))  
}


function MostrarProvinciasDropDown(data) {
    const $dropdown = $('#IdProvincia');
    $dropdown.empty();  

    // Agrega la opción por defecto
    $dropdown.append(`<option value="" selected disabled hidden>Seleccione</option>`);

    // Agrega las provincias activas
    $.each(data, function (index, item) {
        $dropdown.append(`<option value="${item.id}">${item.nombre}</option>`);
    });
}




ObtenerProvinciasDropDown();
   