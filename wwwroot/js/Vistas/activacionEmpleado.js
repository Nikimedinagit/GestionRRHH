// funcion para obtener los datos
async function ObtenerEmpleadosActivacion() {
    const res = await authFetch("ActivacionEmpleados")
    .then(response => response.json())
    .then(data => {
        MostrarEmpleadosActivacion(data);
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}

// funcion para mostar los datos en la tabala 
function MostrarEmpleadosActivacion(data) {
  const tbody = $("#tablaActivacionEmpleadosBody");
  tbody.empty();

  if (data.length === 0) {
    tbody.append(
      `<tr><td colspan="5" class="text-center text-muted">No hay usuarios para mostrar.</td></tr>`
    );
    return;
  }

  $.each(data, function (index, item) {
    const filaClass = item.activo ? "" : "fila-desactivada";
    const btnStyle = "background: none; border: none; cursor: pointer;";
    let iconClass, iconColor, tooltip;

    if (item.activo) {
      iconClass = "bi-person-x fs-4";
      iconColor = "text-danger";
      tooltip = "Desactivar";
    } else {
      iconClass = "bi-person-check fs-4";
      iconColor = "text-success";
      tooltip = "Activar";
    }

    tbody.append(`
      <tr>
        <td class="text-center ${filaClass}">${item.fechaActivacion ? new Date(item.fechaActivacion).toLocaleDateString() : "No Activo"}</td>
        <td class="text-start ${filaClass}">${item.nombreCompleto}</td>
        <td class="text-start ${filaClass}">${item.email}</td>
        <td class="text-center ${filaClass}">${item.dni}</td>
        <td class="text-center">
          <button type="button" class="btn-sm" data-tippy-content="${tooltip}" 
            onclick="MostrarVentanaToggleEmpleado(${item.empleadoId}, ${item.id}, ${item.activo})"
 style="${btnStyle}">
            <i class="bi ${iconClass} ${iconColor}"></i>
          </button>
        </td>
      </tr>
    `);
  });

  // Inicializar tooltips
  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}



function MostrarVentanaToggleEmpleado(empleadoId, activacionId, activo) {
  if (activo) {
    // Si está activo, mostrar ventana para desactivar
    Swal.fire({
      title: "¿Desactivar empleado?",
      text: "Esta acción desactivará al empleado en el sistema.",
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-custom-popup",
        confirmButton: "swal2-btn-desactivar",
        cancelButton: "swal2-btn-cancelar",
        title: "swal2-title-custom",
        htmlContainer: "swal2-content-center",
      },
      background: "#ffffff",
      color: "#1a1a1a",
    }).then((result) => {
      if (result.isConfirmed) {
        DesactivarEmpleado(empleadoId, activacionId);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Acción Cancelada",
          text: "Permanece activo.",
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 2200,
          timerProgressBar: true,
          background: "#fef8f4",
          color: "#5f4339",
          icon: "info",
          iconColor: "#ff914d",
          customClass: {
            popup: "swal2-toast-status",
            title: "swal2-toast-title",
            content: "swal2-toast-content",
          },
        });
      }
    });
  } else {
    // Si está desactivado, mostrar ventana para activar con selección de rol
    MostrarVentanaActivarEmpleado(empleadoId, activacionId, activo);
  }
}


let activacionIdGlobal = 0; // variable para guardar id activacion

function MostrarVentanaActivarEmpleado(empleadoId, activacionId, activo) {
  activacionIdGlobal = activacionId;

  Swal.fire({
    title: "Activar empleado",
    html: `
      <p class='swal2-content-center'>Para activar este empleado, seleccione un rol:</p>
      <div id="rolesContainer" style="display:flex; gap:10px; justify-content:center; margin:15px 0;">
        <button type="button" class="btn-rol" data-rol="RRHH">RRHH</button>
        <button type="button" class="btn-rol" data-rol="SUPERVISOR">SUPERVISOR</button>
        <button type="button" class="btn-rol" data-rol="EMPLEADO">EMPLEADO</button>
      </div>
      <p style="margin-top:15px;">Una vez seleccionado, procesará la activación del empleado.</p>
      <style>
        .btn-rol {
          padding: 8px 18px;
          font-size: 16px;
          border: 2px solid #3697E1;
          border-radius: 6px;
          background-color: white;
          color: #3697E1;
          cursor: pointer;
          transition: all 0.3s ease;
          user-select: none;
        }
        .btn-rol:hover {
          background-color: #e0f0ff;
        }
        .btn-rol.selected {
          background-color: #3697E1;
          color: white;
          border-color: #1f5dbf;
          font-weight: bold;
        }
      </style>
    `,
    showCancelButton: true,
    confirmButtonText: "Si, activar",
    cancelButtonText: "Cancelar",
    customClass: {
      popup: "swal2-custom-popup",
      confirmButton: "swal2-btn-activar",   
      cancelButton: "swal2-btn-cancelar",    
      title: "swal2-title-custom",
      htmlContainer: "swal2-content-center",
    },
    background: "#ffffff",
    color: "#1a1a1a",
    didOpen: () => {
      const buttons = Swal.getHtmlContainer().querySelectorAll('.btn-rol');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });
    },
    preConfirm: () => {
      const selectedBtn = Swal.getHtmlContainer().querySelector('.btn-rol.selected');
      if (!selectedBtn) {
        Swal.showValidationMessage("Debe seleccionar un rol.");
        return false;
      }
      return selectedBtn.getAttribute('data-rol');
    },
  }).then((result) => {
    if (result.isConfirmed) {
      ActivarEmpleado(empleadoId, activacionIdGlobal, result.value);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Acción Cancelada",
        text: "Permanece desactivado.",
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
        background: "#fef8f4",
        color: "#5f4339",
        icon: "info",
        iconColor: "#ff914d",
        customClass: {
          popup: "swal2-toast-status",
          title: "swal2-toast-title",
          content: "swal2-toast-content",
        },
      });
    }
  });
}



async function ActivarEmpleado(empleadoId, activacionId, rolSeleccionado) {
  const body = {
    id: Number(activacionId),
    empleadoId: Number(empleadoId),
    rol: rolSeleccionado
  };

  try {
    const response = await authFetch('ActivacionEmpleados/Activar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },  // <--- Aquí
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en backend:', errorData);
      throw new Error(errorData.title || 'Error al activar empleado');
    }

    // Toast éxito personalizado
    Swal.fire({
      title: "¡Activado Correctamente!",
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 2200,
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

    // Actualizar tabla
    ObtenerEmpleadosActivacion();

  } catch (error) {
    console.error('Error en catch:', error);
    MostrarErrorCatch();
  }
}



async function DesactivarEmpleado(empleadoId, activacionId) {
  const body = {
    id: activacionId,
    empleadoId: empleadoId,
    activo: false  // o el campo que uses para marcar desactivado
  };

  try {
    const response = await authFetch('ActivacionEmpleados/Desactivar', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.title || 'Error al desactivar empleado');
    }

    Swal.fire({
      title: "¡Empleado desactivado!",
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true,
      background: "#fff5f5",
      color: "#842029",
      icon: "success",
      iconColor: "#dc3545",
      customClass: {
        popup: "swal2-toast-success",
        title: "swal2-toast-success-title",
        icon: "swal2-toast-success-icon",
      },
    });

    // Refrescar la tabla
    ObtenerEmpleadosActivacion();

  } catch (error) {
    MostrarErrorCatch();
  }
}



function MostrarErrorCatch() {
  Swal.fire({
    title: "¡Error!",
    html: `
      <div class="text-center">
        <p>No se pudo acceder al servidor. Por favor, inténtalo de nuevo.</p>
      </div>
    `,
    confirmButtonText: "Entendido",
    customClass: {
      popup: "shadow rounded-3 p-3",
      confirmButton: "btn btn-danger",
      title: "fs-5 text-dark mb-2",
      htmlContainer: "text-muted fs-6",
    },
    buttonsStyling: false,
  });
}

 



ObtenerEmpleadosActivacion();