////////////////////////////////////////////////////////////////////////////////////////////////////////
// OBTENER LOS DATOS DE LA API DE EMPLEADOS ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerEmpleadosSinAsistencia() {    
    const cursoId = cursoIdSeleccionado;


    const $dropdown = $('#EmpleadoIdAsistencia'); 
    $dropdown.prop("disabled", true).empty();

    try {
        const response = await authFetch(`Empleados/SinAsistencia/${cursoId}`);
        const data = await response.json();

        if (data.length === 0) {
            $dropdown.append(`<option value="">No hay empleados disponibles</option>`);
            return;
        }

        $dropdown.append(`<option value="" selected disabled hidden>Seleccione</option>`);
        $.each(data, function (index, item) {
            $dropdown.append(`<option value="${item.id}">${item.nombreCompleto}</option>`);
        });

        $dropdown.prop("disabled", false);
    } catch {
        $dropdown.prop("disabled", true);
        MostrarErrorCatch();
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// INICILAR AL CARGAR LA VISTA ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
// ObtenerEmpleadosSinAsistencia();