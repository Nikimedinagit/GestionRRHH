//////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIONES PARA OBTENER LOS DATOS DE LA API TOTAL DE JUSTIFICACIONES /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerTotalJustificaciones() {
  try {
    const fechaEl = document.getElementById("FechaBuscar");
    const estadoEl = document.getElementById("EstadoJustificacionBuscar");
    const empleadoEl = document.getElementById("EmpleadoIdBuscar");

    const fecha = fechaEl ? fechaEl.value : null;
    const estado = estadoEl ? parseInt(estadoEl.value) : null;
    const empleado = empleadoEl ? empleadoEl.value : "";

    const filtro = {
      fechaJustificacion: fecha || null,
      estadoJustificacion: estado || null,
      empleadoTexto: empleado,
    };

    const response = await authFetch("CardsEstadisticas/JustificacionesEstadisticas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filtro),
    });
    const data = await response.json();

    document.getElementById("totalJustificaciones").textContent = data.totalJustificaciones;
    document.getElementById("justificacionesPendientes").textContent = data.justificacionesPendientes;
    document.getElementById("justificacionesAprobadas").textContent = data.justificacionesAprobadas;
    document.getElementById("justificacionesRechazadas").textContent = data.justificacionesRechazadas;

  } catch (error) {
    MostrarErrorCatch(error);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIALIZAR AL CARGAR LA VISTA /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
ObtenerTotalJustificaciones();