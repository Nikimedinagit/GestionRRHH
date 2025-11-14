
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCION PARA FORMATEAR LAS HORAS TRABAJADAS /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function formatearTiempo(minutos) {
  if (minutos < 60) {
    return `${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);
  const restoMinutos = minutos % 60;
  return `${horas}:${restoMinutos.toString().padStart(2, "0")} hs`;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIONES PARA OBTENER LOS DATOS DE LA API TOTAL DE ASISTENCIAS HOY /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerTotalAsitenciasHoy() {
  try {

    let estadoAsistencia = document.getElementById("EstadoAsistenciaBuscar").value;
    if (estadoAsistencia === "0") estadoAsistencia = null;
    else estadoAsistencia = Number(estadoAsistencia);

    let dniEmpleado = document.getElementById("DniBuscar").value;
    let nroLegajo = document.getElementById("NroLegajoBuscar").value;
    let fechaFiltro = document.getElementById("FechaBuscar").value;

    const asistenciasFiltradas = {
      nombreCompleto: document.getElementById("EmpleadoIdBuscar").value,
      DNI: dniEmpleado ? Number(dniEmpleado) : null,
      nroLegajo: nroLegajo,
      fecha: fechaFiltro ? fechaFiltro : null,
      estadoAsistencia: estadoAsistencia
    };
    const response = await authFetch("CardsEstadisticas/AsistenciasEstadisticas", {
      method: "POST",
      body: JSON.stringify(asistenciasFiltradas)
    });
    const data = await response.json();

    document.getElementById("totalAsistenciasHoy").textContent = data.totalAsistenciasHoy;
    document.getElementById("totalHorasTrabajadas").textContent = formatearTiempo(data.totalHorasTrabajadas);
    document.getElementById("empleadosAusentes").textContent = data.empleadosAusentes;
    document.getElementById("empleadosLLegadasTardes").textContent = data.empleadosLLegadasTardes;
  } catch (error) {
    MostrarErrorCatch(error);
  }
}



//////////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIALIZAR AL CARGAR LA VISTA /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
ObtenerTotalAsitenciasHoy();