
////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR LOS ONCHANGE DE FILTROS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
  $("#FiltroNombre, #FiltroEmail, #FiltroDNI").on("input", ObtenerEmpleadosActivacion);
  $("#FiltroActivo").on("change", ObtenerEmpleadosActivacion);
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
// OBTENER LOS DATOS DE LA API DE ACTIVACIONES ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ObtenerEmpleadosActivacion() {
  const nombre = document.getElementById("FiltroNombre").value || "";
  const email = document.getElementById("FiltroEmail").value || "";
  const dniValue = document.getElementById("FiltroDNI").value;
  const activoValue = document.getElementById("FiltroActivo").value;

  const filtro = {
    Nombre: nombre,
    Email: email,
    DNI: dniValue ? Number(dniValue) : null,
    Activo: activoValue !== "" ? parseInt(activoValue) : null
  };

  try {
    const res = await authFetch("ActivacionEmpleados/Filtrar", {
      method: "POST",
      body: JSON.stringify(filtro)
    });
    const data = await res.json();
    MostrarEmpleadosActivacion(data);
  } catch (error) {
    MostrarErrorCatch();
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// IICIALIZQMAOS LA VARIABLE GLOBAL ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
let empleadosActivacionGlobal = [];


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LOS DATOS EN LA TABALA ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarEmpleadosActivacion(data) {
  empleadosActivacionGlobal = data; 
  const tbody = $("#tablaActivacionEmpleadosBody");
  tbody.empty();

  if (data.length === 0) {
    tbody.append(
      `<tr><td colspan="6" class="text-center text-muted">No hay usuarios para mostrar.</td></tr>`
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
        <td class="text-center ${filaClass} columna-fecha-activacion">
          ${item.fechaActivacionString ? new Date(item.fechaActivacionString).toLocaleDateString() : "No Activo"}
        </td>
        <td class="text-start ${filaClass}">${item.empleadoNombreString}</td>
        <td class="text-start ${filaClass} columna-email-activacion">${item.empleadoEmailString}</td>
        <td class="text-center ${filaClass} columna-dni-activacion">${item.empleadoDNIString}</td>
        <td class="text-center">
          <button class="btn-editar icono-ver-detalle-empleado-activacion d-md-none" style="background: none; border: none;" 
              onclick="MostrarDetalleEmpleadoActivacion(${index})" data-tippy-content="Ver más">
              <i class="bi bi-info-circle"></i>
          </button>

          <button type="button" class="btn-sm" data-tippy-content="${tooltip}" 
            onclick="MostrarVentanaToggleEmpleado(${item.empleadoId}, ${item.id}, ${item.activo})"
            style="${btnStyle}">
            <i class="bi ${iconClass} ${iconColor}" style="font-size: 1.6rem !important;"></i>
          </button>
        </td>
      </tr>
    `);
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR EL DETALLE DE UN EMPLEADO //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarDetalleEmpleadoActivacion(index) {
  const item = empleadosActivacionGlobal[index];

  document.getElementById("detalleEmpleadoFecha").textContent = item.fechaActivacionString ? new Date(item.fechaActivacionString).toLocaleDateString() : "No Activo";
  document.getElementById("detalleEmpleadoNombre").textContent = item.empleadoNombreString || "-";
  document.getElementById("detalleEmpleadoEmail").textContent = item.empleadoEmailString || "-";
  document.getElementById("detalleEmpleadoDNI").textContent = item.empleadoDNIString || "-";
  document.getElementById("detalleEmpleadoEstado").textContent = item.activo ? "Activo" : "Inactivo";

  const offcanvasElement = document.getElementById("offcanvasDetalleEmpleadoActivacion");
  const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
  offcanvas.show();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LA VENTANA DE TOGGLE DEL EMPLEADO /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarVentanaToggleEmpleado(empleadoId, activacionId, activo) {
  if (activo) {
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
    MostrarVentanaActivarEmpleado(empleadoId, activacionId, activo);
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR LA VARIABLE GLOBAL ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
let activacionIdGlobal = 0; 


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LA VENTANA DE TOGGLE DEL EMPLEADO /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA ACTIVAR UN EMPLEADO ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function ActivarEmpleado(empleadoId, activacionId, rolSeleccionado) {
  const body = {
    id: Number(activacionId),
    empleadoId: Number(empleadoId),
    rol: rolSeleccionado
  };

  try {
    const response = await authFetch('ActivacionEmpleados/Activar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en backend:', errorData);
      throw new Error(errorData.title || 'Error al activar empleado');
    }

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
    });

    ObtenerEmpleadosActivacion();

  } catch (error) {
    console.error('Error en catch:', error);
    MostrarErrorCatch();
  }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA DESACTIVAR UN EMPLEADO ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function DesactivarEmpleado(empleadoId, activacionId) {
  const body = {
    id: activacionId,
    empleadoId: empleadoId
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
    });

    ObtenerEmpleadosActivacion();

  } catch (error) {
    MostrarErrorCatch();
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR AL CARGAR LA VISTA ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
ObtenerEmpleadosActivacion();