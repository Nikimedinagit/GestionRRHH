async function ObtenerTotalHorarios() {
  const res = await authFetch("Horarios/Total")
    .then(response => response.json())
    .then(data => {
      document.getElementById("totalHorariosAsignados").textContent = data.total;
      ObtenerTotalHorarios();
    })
    .catch(error => console.log("No se pudo obtener el total de horarios", error));
}
ObtenerTotalHorarios();

async function ObtenerTotalHorasSemanales() {
  const res = await authFetch("Horarios/HorasSemanales")
    .then(response => response.json())
    .then(data => {
      document.getElementById("totalHorasSemanales").textContent = data.totalHorasSemanales;
      ObtenerTotalHorasSemanales();
    })
    .catch(error => console.log("No se pudo obtener las horas semanales", error));
}
ObtenerTotalHorasSemanales();


async function ObtenerEmpleadosQueTrabajanFinesDeSemana() {
  const res = await authFetch("Horarios/FindesDeSemana")
    .then(response => response.json())
    .then(data => {
      document.getElementById("empleadosFindes").textContent = data.empleadosFindes;
      ObtenerEmpleadosQueTrabajanFinesDeSemana();
    })
    .catch(error => console.log("No se pudo obtener los empleados que trabajan fines de semana", error));
}

ObtenerEmpleadosQueTrabajanFinesDeSemana();