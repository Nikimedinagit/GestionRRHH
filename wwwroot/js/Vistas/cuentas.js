var cuentasData = [];

function EscaparHtmlCuenta(valor) {
  return $("<div>").text(valor || "").html();
}

function EstadoCuenta(cuenta) {
  if (EsCuentaDesarrolladora(cuenta)) return "PROTEGIDA";
  if (cuenta.habilitado && cuenta.empresaHabilitada) return "HABILITADA";
  return "DESHABILITADA";
}

function EsCuentaDesarrolladora(cuenta) {
  return cuenta.esDesarrollador === true ||
    (cuenta.email || "").trim().toLowerCase() === "loguisoft@gmail.com";
}

async function ObtenerCuentas(mostrarSpinner = true) {
  if (mostrarSpinner) mostrarPantallaCarga();
  try {
    const respuesta = await authFetch("Cuentas");
    if (!respuesta.ok) throw new Error();
    cuentasData = await respuesta.json();
    MostrarCuentas();
  } catch {
    MostrarErrorCatch();
  } finally {
    if (mostrarSpinner) setTimeout(() => ocultarPantallaCarga(), 1000);
  }
}

function MostrarCuentas() {
  const texto = document.getElementById("buscarCuenta").value.trim().toLowerCase();
  const estado = document.getElementById("estadoCuentaBuscar").value;
  const ordenEstados = {
    PROTEGIDA: 0,
    HABILITADA: 1,
    DESHABILITADA: 2,
  };
  const datos = cuentasData
    .filter((cuenta) => {
      const coincideTexto = `${cuenta.nombreCompleto} ${cuenta.empresa} ${cuenta.email}`.toLowerCase().includes(texto);
      return coincideTexto && (!estado || EstadoCuenta(cuenta) === estado);
    })
    .sort((cuentaA, cuentaB) => {
      const diferenciaEstado = ordenEstados[EstadoCuenta(cuentaA)] - ordenEstados[EstadoCuenta(cuentaB)];
      if (diferenciaEstado !== 0) return diferenciaEstado;
      return (cuentaA.empresa || "").localeCompare(cuentaB.empresa || "", "es", { sensitivity: "base" });
    });

  document.getElementById("totalCuentas").textContent = cuentasData.length;
  document.getElementById("cuentasHabilitadas").textContent =
    cuentasData.filter((cuenta) => EstadoCuenta(cuenta) === "HABILITADA" || EstadoCuenta(cuenta) === "PROTEGIDA").length;
  document.getElementById("cuentasDeshabilitadas").textContent =
    cuentasData.filter((cuenta) => EstadoCuenta(cuenta) === "DESHABILITADA").length;

  const estilos = {
    PROTEGIDA: ["#e7f1ff", "#256da6", "#0d6efd"],
    HABILITADA: ["#dff3e7", "#146c43", "#198754"],
    DESHABILITADA: ["#f8d7da", "#842029", "#dc3545"]
  };

  document.getElementById("contenedorCuentas").innerHTML = datos.map((cuenta) => {
    const estadoActual = EstadoCuenta(cuenta);
    const color = estilos[estadoActual];
    const protegida = EsCuentaDesarrolladora(cuenta);
    const activa = estadoActual === "HABILITADA";
    const fondoTarjeta = estadoActual === "DESHABILITADA" ? "#f8d7da3b" : "#ffffff";
    const accion = protegida
      ? `<span class="small fw-bold" style="color:#256da6;"><i class="bi bi-lock-fill me-1"></i>CUENTA PROTEGIDA</span>`
      : `<button type="button" class="btn rounded py-1 px-2 border bg-white"
          onclick="CambiarEstadoCuenta('${cuenta.id}', ${!activa})"
          style="box-shadow:none;color:${activa ? "#dc3545" : "#198754"};">
          <i class="bi ${activa ? "bi-person-x" : "bi-person-check"} me-1"></i>
          ${activa ? "Deshabilitar" : "Habilitar"}
        </button>`;

    return `<div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex">
      <div class="card border-0 shadow-sm rounded p-3 w-100 d-flex flex-column"
        style="border-bottom:4px solid ${color[2]} !important;background-color:${fondoTarjeta};min-height:205px;">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
          <div class="p-2 rounded" style="background:${color[0]};color:${color[1]};">
            <i class="bi ${protegida ? "bi-shield-lock" : "bi-building"} fs-5"></i>
          </div>
          <span class="badge fw-bold" style="background:${color[0]};color:${color[1]};font-size:.68rem;">${estadoActual}</span>
        </div>
        <div class="flex-grow-1">
          <h5 class="fw-bold text-dark mb-1 text-truncate" style="font-size:1rem;">${EscaparHtmlCuenta(cuenta.empresa)}</h5>
          <p class="mb-1 text-muted text-truncate" style="font-size:.85rem;">${EscaparHtmlCuenta(cuenta.nombreCompleto)}</p>
          <p class="mb-2 text-muted text-truncate" style="font-size:.8rem;text-transform:lowercase;">
            <i class="bi bi-envelope me-1"></i>${EscaparHtmlCuenta(cuenta.email)}
          </p>
        </div>
        <div class="border-top pt-2 d-flex justify-content-end">${accion}</div>
      </div>
    </div>`;
  }).join("") || `<div class="col-12 text-center text-muted py-4">No hay cuentas para mostrar.</div>`;
}

async function CambiarEstadoCuenta(id, habilitar) {
  const resultado = await Swal.fire({
    title: habilitar ? "¿Desea habilitar esta cuenta?" : "¿Desea deshabilitar esta cuenta?",
    html: habilitar
      ? "<p class='swal2-content-center'>La empresa podrá ingresar y administrar nuevamente su información.</p>"
      : "<p class='swal2-content-center'>La empresa no podrá ingresar hasta que vuelva a ser habilitada.</p>",
    showCancelButton: true,
    confirmButtonText: habilitar ? "Sí, habilitar" : "Sí, deshabilitar",
    cancelButtonText: "Cancelar",
    customClass: {
      popup: "swal2-custom-popup",
      confirmButton: habilitar ? "swal2-btn-activar" : "swal2-btn-desactivar",
      cancelButton: "swal2-btn-cancelar",
      title: "swal2-title-custom"
    }
  });
  if (!resultado.isConfirmed) return;

  const respuesta = await authFetch(`Cuentas/${id}/Estado/${habilitar}`, { method: "PUT" });
  const datos = await respuesta.json();
  if (!respuesta.ok)
    return Swal.fire({ title: datos.mensaje || "No se pudo modificar la cuenta.", icon: "error" });
  await ObtenerCuentas(false);
  ToastCuenta(habilitar ? "¡Cuenta Habilitada!" : "¡Cuenta Deshabilitada!");
}

function ToastCuenta(titulo) {
  Swal.fire({
    title: titulo, toast: true, position: "bottom-end", showConfirmButton: false,
    timer: 2200, timerProgressBar: true, background: "#f4fff7", color: "#1c3d26",
    icon: "success", iconColor: "#28a746d8",
    customClass: { popup: "swal2-toast-success", title: "swal2-toast-success-title", icon: "swal2-toast-success-icon" }
  });
}

$("#buscarCuenta").on("input", MostrarCuentas);
$("#estadoCuentaBuscar").on("change", MostrarCuentas);
ObtenerCuentas();
