
async function ObtenerTotalEvaluaciones() {
  const res = await authFetch("Evaluaciones/Total")
    .then(response => response.json())
    .then(data => {
      document.getElementById("totalEvaluaciones").textContent = data.total;
    })
    .catch(error => console.log("No se pudo obtener el total de evaluaciones", error));
}
ObtenerTotalEvaluaciones();


async function ObtenerPromedioGeneral() {
  const res = await authFetch("Evaluaciones/PromedioGeneral")
    .then(response => response.json())
    .then(data => {
      document.getElementById("promedioEvaluaciones").textContent = data.promedio;
    })
    .catch(error => console.log("No se pudo obtener el promedio general", error));
}
ObtenerPromedioGeneral();


async function ObtenerEmpleadosEvaluados() {
  const res = await authFetch("Evaluaciones/Empleados")
    .then(response => response.json())
    .then(data => {
      document.getElementById("totalEmpleadosEvaluados").textContent = data.totalEmpleadosEvaluados;
    })
    .catch(error => console.log("No se pudo obtener los empleados evaluados", error));
}
ObtenerEmpleadosEvaluados();