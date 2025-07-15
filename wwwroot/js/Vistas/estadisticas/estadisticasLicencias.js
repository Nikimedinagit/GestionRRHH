async function ObtenerTotalLicencias() {
  const res = await authFetch("Licencias/Total")
    .then(response => response.json())
    .then(data => {
      document.getElementById("totalLicencias").textContent = data.total;
      ObtenerTotalLicencias();
    })
    .catch(error => console.log("No se pudo obtener el total de licencias", error));
}
ObtenerTotalLicencias();

async function ObtenerAprobadasLicencias() {
  const res = await authFetch("Licencias/Aprobadas")
    .then(response => response.json())
    .then(data => {
      document.getElementById("aprobadasLicencias").textContent = data.total;
      ObtenerAprobadasLicencias();
    })
    .catch(error => console.log("No se pudo obtener las licencias aprobadas", error));
}
ObtenerAprobadasLicencias();

async function ObtenerRechazadasLicencias() {
  const res = await authFetch("Licencias/Rechazadas")
    .then(response => response.json())
    .then(data => {
      document.getElementById("rechazadasLicencias").textContent = data.total;
      ObtenerRechazadasLicencias();
    })
    .catch(error => console.log("No se pudo obtener las licencias rechazadas", error));
}
ObtenerRechazadasLicencias();

async function ObtenerExpiradasLicencias() {
  const res = await authFetch("Licencias/Expiradas")
    .then(response => response.json())
    .then(data => {
      document.getElementById("expiradasLicencias").textContent = data.total;
      ObtenerExpiradasLicencias();
    })
    .catch(error => console.log("No se pudo obtener las licencias expiradas", error));
}
ObtenerExpiradasLicencias();

async function ObtenerPendientesLicencias() {
  const res = await authFetch("Licencias/Pendientes")
    .then(response => response.json())
    .then(data => {
      document.getElementById("pendientesLicencias").textContent = data.total;
      ObtenerPendientesLicencias();
    })
    .catch(error => console.log("No se pudo obtener las licencias pendientes", error));
}
ObtenerPendientesLicencias();