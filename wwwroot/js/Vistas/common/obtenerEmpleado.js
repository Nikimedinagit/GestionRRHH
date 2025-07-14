async function ObtenerEmpleadosDropDown() {
    const res = await authFetch("Empleados", {
        method: "GET",
      })
        .then(response => response.json()) 
        .then(data => {
            MostrarEmpleadosDropDown(data) 
        })
        .catch(error => console.log("No se puede acceder al servicio.", error))  
}


function MostrarEmpleadosDropDown(data) {
    const $dropdown = $('#EmpleadoId');
     console.log("Select encontrado:", $dropdown.length); 
    $dropdown.empty();  

    // Agrega la opción por defecto
    $dropdown.append(`<option value="" selected disabled hidden>Seleccione</option>`);

    // Filtra solo los no eliminados
    // data = data.filter(item => item.eliminado === false);

    // Agrega los empleados activos
    $.each(data, function (index, item) {
        $dropdown.append(`<option value="${item.id}">${item.nombreCompleto}</option>`);
    });
}

ObtenerEmpleadosDropDown();