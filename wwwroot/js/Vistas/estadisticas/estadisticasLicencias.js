//////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIONES PARA OBTENER LOS DATOS DE LA API TOTAL DE LICENCIAS /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerTotalLicencias() {
  try {
    const response = await authFetch("CardsEstadisticas/LicenciasEstadisticas");
    const data = await response.json();

    document.getElementById("totalLicencias").textContent = data.totalLicencias;
    document.getElementById("aprobadasLicencias").textContent = data.aprobadasLicencias;
    document.getElementById("pendientesLicencias").textContent = data.pendientesLicencias;
    document.getElementById("rechazadasLicencias").textContent = data.rechazadasLicencias;
    document.getElementById("expiradasLicencias").textContent = data.expiradasLicencias;
  } catch (error) {
    MostrarErrorCatch(error);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIALIZAR AL CARGAR LA VISTA /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
ObtenerTotalLicencias();