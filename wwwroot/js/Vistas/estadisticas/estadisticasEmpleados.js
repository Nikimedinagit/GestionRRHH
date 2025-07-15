async function ObtenerTotalEmpleados() {
  const res = await authFetch("Empleados/Total")
    .then(response => response.json())
    .then(data => {
      document.getElementById("totalEmpleados").textContent = data.total;
      ObtenerTotalEmpleados();
    })
    .catch(error => console.log("No se pudo obtener el total de empleados", error));
}
ObtenerTotalEmpleados();

async function ObtenerMasculinosEmpleados() {
  const res = await authFetch("Empleados/Masculinos")
    .then(response => response.json())
    .then(data => {
      document.getElementById("masculinosEmpleados").textContent = data.total;
      ObtenerMasculinosEmpleados();
    })
    .catch(error => console.log("No se pudo obtener los masculinos empleados", error));
}
ObtenerMasculinosEmpleados();

async function ObtenerFemeninosEmpleados() {
  const res = await authFetch("Empleados/Femeninos")
    .then(response => response.json())
    .then(data => {
      document.getElementById("femeninosEmpleados").textContent = data.total;
      ObtenerFemeninosEmpleados();
    })
    .catch(error => console.log("No se pudo obtener los femeninos empleados", error));
}
ObtenerFemeninosEmpleados();

async function ObtenerOtrosEmpleados() {
  const res = await authFetch("Empleados/Otros")
    .then(response => response.json())
    .then(data => {
      document.getElementById("otrosEmpleados").textContent = data.total;
      ObtenerOtrosEmpleados();
    })
    .catch(error => console.log("No se pudo obtener los otros empleados", error));
}
ObtenerOtrosEmpleados();