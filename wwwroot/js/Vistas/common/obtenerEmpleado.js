async function ObtenerEmpleadosDropDown() {
    const res = await authFetch("Empleados/Activos", {
        method: "GET",
      })
        .then(response => response.json()) 
        .then(data => {
            MostrarEmpleadosDropDown(data) 
        })
        .catch(error => console.log("No se puede acceder al servicio.", error))  
}


function MostrarEmpleadosDropDown(data) {
    const $dropdown = $('#EmpleadoId, #EmpleadoIdCertificado');
    $dropdown.empty();  

    $dropdown.append(`<option value="" selected disabled hidden>Seleccione</option>`);

    $.each(data, function (index, item) {
        $dropdown.append(`<option value="${item.id}">${item.nombreCompleto}</option>`);
    });
}

ObtenerEmpleadosDropDown();