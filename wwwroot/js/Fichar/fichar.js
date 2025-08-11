document.getElementById("formFichar").addEventListener("submit", function(event) {
  event.preventDefault(); // evita recarga
  const dni = document.getElementById("dniInput").value;
  ficharEmpleado(dni);
});



// funcion para crear el fichaje automatico
async function ficharEmpleado() {
  const dniInput = document.getElementById('dniInput').value.trim();

  if (!dniInput) {
    mostrarError("Por favor ingrese un DNI válido.");
    return;
  }

  try {
    const response = await authFetch("Asistencias/Fichar", {
      method: "POST",
      body: JSON.stringify({ dni: dniInput })
    });

    if (!response.ok) {
      const errorData = await response.json();
      mostrarError(errorData.mensaje || "Error al fichar.");
      return;
    }

    const mensaje = await response.text();

    Swal.fire({
      title: "¡Fichaje Exitoso!",
      text: mensaje,
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      background: "#f4fff7",
      color: "#1c3d26",
      icon: "success",
      iconColor: "#28a746d8",
      customClass: {
        popup: "swal2-toast-success",
        title: "swal2-toast-success-title",
        icon: "swal2-toast-success-icon",
      },
    });

  } catch (error) {
    console.error("Error de conexión:", error);
    mostrarError("Error de conexión, intente nuevamente.");
  }
}

function mostrarError(mensaje) {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: mensaje,
    toast: true,
    position: "bottom-end",
    timer: 3000,
    showConfirmButton: false,
  });
}


function mostrarError(mensaje) {
  // Aquí muestra el error en UI o con alertas
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: mensaje,
    toast: true,
    position: "bottom-end",
    timer: 3000,
    showConfirmButton: false,
  });
}
