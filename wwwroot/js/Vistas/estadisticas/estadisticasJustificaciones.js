//////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIONES PARA OBTENER LOS DATOS DE LA API TOTAL DE JUSTIFICACIONES /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerTotalJustificaciones() {
  try {
    const response = await authFetch("CardsEstadisticas/JustificacionesEstadisticas");
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