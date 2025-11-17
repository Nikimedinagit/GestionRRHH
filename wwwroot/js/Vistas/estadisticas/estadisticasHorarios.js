//////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIONES PARA OBTENER LOS DATOS DE LA API TOTAL DE HORARIOS /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerTotalHorarios() {
  try {

    let tipoHorario = document.getElementById("TipoHorarioBuscar").value;
    let tipo =
      tipoHorario !== "0" && tipoHorario !== "" ? parseInt(tipoHorario) : null;

    let horarioInicioRaw = document.getElementById("HorarioInicioBuscar").value;
    let horarioFinRaw = document.getElementById("HorarioFinBuscar").value;

    let horarioInicio = horarioInicioRaw ? `${horarioInicioRaw}:00` : null;
    let horarioFin = horarioFinRaw ? `${horarioFinRaw}:00` : null;

    let empleadoTexto = document.getElementById("EmpleadoIdBuscar").value;

    let filtro = {
      tipoHorario: tipo,
      horarioInicio: horarioInicio,
      horarioFin: horarioFin,
      empleadoTexto: empleadoTexto,
    };

    const res = await authFetch("CardsEstadisticas/HorariosEstadisticas", {
      method: "POST",
      body: JSON.stringify(filtro),
    });
    const data = await res.json();

    document.getElementById("totalHorariosAsignados").textContent = data.totalHorariosAsignados;
    document.getElementById("totalHorasSemanales").textContent =
      `${data.totalHorasFormateadas}`;
    document.getElementById("empleadosFindes").textContent = data.empleadosFindes;

  } catch (error) {
    MostrarErrorCatch(error);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIALIZAR AL CARGAR LA VISTA /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
ObtenerTotalHorarios();

