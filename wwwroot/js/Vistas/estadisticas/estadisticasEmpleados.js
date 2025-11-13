////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIONES PARA OBTENER LOS DATOS DE LA API TOTAL DE EMPLEADOS /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerTotalEmpleados() {
  try {

    let nombreCompletoEmpleado = document.getElementById("EmpleadoIdBuscar").value;
    let dniEmpleado = document.getElementById("DniEmpleadoFiltro").value;
    let nroLegajo = document.getElementById("NroLegajoFiltro").value;
    let estadoCivilEmpleado = document.getElementById("EstadoCivilEmpleadoFiltro").value;
    let estadoCivil = estadoCivilEmpleado !== "0" && estadoCivilEmpleado !== "" ? parseInt(estadoCivilEmpleado) : null;
    let tipoSexoEmpleado = document.getElementById("TipoSexoEmpleadoFiltro").value;
    let tipoSexo = tipoSexoEmpleado !== "0" && tipoSexoEmpleado !== "" ? parseInt(tipoSexoEmpleado) : null;
    let localidadFiltro = document.getElementById("IdLocalidadFiltro").value;
    let puestoFiltro = document.getElementById("IdPuestoFiltro").value;

    let filtro = {
      nombreCompleto: nombreCompletoEmpleado,
      dNI: dniEmpleado ? Number(dniEmpleado) : null,
      nroLegajo: nroLegajo,
      estadoCiviles: estadoCivil,
      tipoSexo: tipoSexo,
      localidadId: localidadFiltro === "0" ? null : Number(localidadFiltro),
      puestoId: puestoFiltro === "0" ? null : Number(puestoFiltro),
    };

    const response = await authFetch("CardsEstadisticas/EmpleadosEstadisticas",
      { method: "POST", body: JSON.stringify(filtro) }
    );
    const data = await response.json();

    document.getElementById("totalEmpleados").textContent = data.totalEmpleados;
    document.getElementById("masculinosEmpleados").textContent = data.masculinos;
    document.getElementById("femeninosEmpleados").textContent = data.femeninos;
    document.getElementById("noBinarioEmpleados").textContent = data.noBinarios;
    document.getElementById("otrosEmpleados").textContent = data.otros;
  } catch (error) {
    MostrarErrorCatch(error);
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIALIZAR AL CARGAR LA VISTA /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
ObtenerTotalEmpleados();