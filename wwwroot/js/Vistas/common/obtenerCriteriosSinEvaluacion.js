
////////////////////////////////////////////////////////////////////////////////////////////////////////
// OBTENER LOS DATOS DE LA API DE TIPOS DE CRITERIOS ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerTiposCriterioDisponibles(evaluacionId = null) {
    const $dropdown = $('#IdTipoCriterio');
    $dropdown.prop("disabled", true);

    try {
        let url = "TiposDeCriterios/TiposCriterioDisponibles";
        if (evaluacionId) {
            url += `?evaluacionId=${evaluacionId}`;
        }

        const response = await authFetch(url);
        const data = await response.json();

        $dropdown.empty();

        if (data.length === 0) {
            $dropdown.append(`<option value="">No hay criterios disponibles</option>`);
            $dropdown.prop("disabled", true);
            return;
        }

        $dropdown.append(`<option value="" selected disabled hidden>Seleccione</option>`);

        $.each(data, function (index, item) {
            $dropdown.append(`<option value="${item.id}">${item.nombre}</option>`);
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
// ObtenerTiposCriterioDisponibles();