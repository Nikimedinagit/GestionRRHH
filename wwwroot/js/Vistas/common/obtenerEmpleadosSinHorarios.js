
////////////////////////////////////////////////////////////////////////////////////////////////////////
// OBTENER LOS DATOS DE LA API DE EMPLEADOS ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerEmpleadosSinHorariosDropDown(empleadoIdActual = null) {
    const $dropdown = $('#EmpleadoId, #EmpleadoIdCertificado');
    $dropdown.prop("disabled", true);

    try {
        let url = "Empleados/ActivosSinHorario";
        if (empleadoIdActual) {
            url += `?empleadoIdActual=${empleadoIdActual}`;
        }

        const response = await authFetch(url);
        const data = await response.json();

        $dropdown.empty();

        if (data.length === 0) {
            $dropdown.append(`<option value="" selected>No hay empleados disponibles</option>`);
            $dropdown.prop("disabled", true);
            return;
        }

        $dropdown.append(`<option value="" selected disabled hidden>Seleccione</option>`);

        $.each(data, function (index, item) {
            $dropdown.append(`<option value="${item.id}">${item.nombreCompleto}</option>`);
        });

        $dropdown.prop("disabled", false);

    } catch {
        MostrarErrorCatch();
        $dropdown.prop("disabled", true);
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// INICILAR AL CARGAR LA VISTA ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
ObtenerEmpleadosSinHorariosDropDown();