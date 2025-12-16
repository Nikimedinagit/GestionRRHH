
////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR LOS ONCHANGE DE FILTROS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
ObtenerEmpleadosActivacion();


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
    nombre: nombre,
    email: email,
    dNI: dniValue ? Number(dniValue) : null,
    activo: activoValue !== "" ? parseInt(activoValue) : null
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
var empleadosActivacionGlobal = [];


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
    const fechaMostrar = item.fechaActivacionString
      ? (() => {
          const partes = item.fechaActivacionString.split("T")[0].split("-");
          return new Date(partes[0], partes[1] - 1, partes[2])
                .toLocaleDateString("es-AR");
        })()
      : "No Activo";
     tbody.append(`
      <tr>
        <td class="text-center ${filaClass} columna-fecha-activacion">
          ${fechaMostrar}
          
        </td>
        <td class="text-start ${filaClass}">${item.empleadoNombreString}</td>
        <td class="text-start ${filaClass} columna-email-activacion">${item.empleadoEmailString}</td>
        <td class="text-center ${filaClass} columna-dni-activacion">${item.empleadoDNIString}</td>
        <td class="text-center ${filaClass} columna-rol-activacion">${item.rol}</td>
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
  document.getElementById("detalleEmpleadoRol").textContent = item.rol || "-";
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
window.activacionIdGlobal = window.activacionIdGlobal || 0;


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


async function GenerarInformePdfActivaciones() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  let nombre = document.getElementById("FiltroNombre").value;
  let email = document.getElementById("FiltroEmail").value;
  let dni = document.getElementById("FiltroDNI").value;
  let estado = document.getElementById("FiltroActivo").value;

  let filtro = {
    nombre: nombre || null,
    email: email || null,
    dni: dni ? Number(dni) : null,
    activo: estado && estado !== "0" ? Number(estado) : null
  };

  const res = await authFetch("InformesGeneralesPdf/GenerarInformeActivacionEmpleados", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filtro)
  });

  const { activaciones, resumen } = await res.json();

  doc.setTextColor(19, 115, 204);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Informe de Activación de Empleados", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  let y = 29;
  const fechaHoy = new Date().toLocaleString("es-AR");

  doc.text("Generado:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(fechaHoy, 33, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text("Total Empleados:", 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.total}`, 45, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Activos:", 50, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.activos}`, 66, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Inactivos:", 70, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.inactivos}`, 89, y);
  y += 6;

  const filtrosAplicadosArray = [];
  if (filtro.nombre) filtrosAplicadosArray.push(`[Nombre: ${filtro.nombre}]`);
  if (filtro.email) filtrosAplicadosArray.push(`[Email: ${filtro.email}]`);
  if (filtro.dni) filtrosAplicadosArray.push(`[DNI: ${filtro.dni}]`);
  if (filtro.activo !== null) {
    filtrosAplicadosArray.push(`[Estado: ${filtro.activo === 1 ? "Activo" : "Inactivo"}]`);
  }

  const filtrosAplicados = filtrosAplicadosArray.length > 0
    ? filtrosAplicadosArray.join("  |  ")
    : "No se aplicaron";

  doc.setFont("helvetica", "normal");
  doc.text("Filtros Aplicados:", 14, y);
  doc.setFont("helvetica", "bold");

  const filtrosText = doc.splitTextToSize(filtrosAplicados, 260);
  doc.text(filtrosText, 45, y);

  y += filtrosText.length * 6 + 2;

  doc.setDrawColor(180);
  doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
  y += 7;

  if (activaciones.length > 0) {
    doc.autoTable({
      startY: y,
      head: [["Nombre", "Email", "DNI", "Rol", "Fecha Activación", "Estado"]],
      body: activaciones.map(a => [
        a.empleadoNombreString,
        a.empleadoEmailString,
        a.empleadoDNIString,
        a.rol,             
        a.fechaActivacionString,
        a.activo ? "Activo" : "Inactivo" 
      ]),
      styles: { font: "helvetica", fontSize: 10 },
      headStyles: { fillColor: [19, 115, 204], textColor: 255, fontStyle: "bold" },
      margin: { left: 14, right: 14 },
      tableWidth: "auto"
    });
  } else {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 0, 0);
    doc.text(
      "No hay resultados para los filtros aplicados.",
      doc.internal.pageSize.getWidth() / 2,
      y + 10,
      { align: "center" }
    );
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10);
    doc.text(
      "www.WorkSync.com",
      doc.internal.pageSize.getWidth() - 20,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  }

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  const html = `<html><head><title>Informe de Activación</title></head>
    <body class="pdf-body">
    <iframe class="pdf-frame" width="100%" height="100%" src="${url}"></iframe>
    </body></html>`;

  const w = window.open();
  w.document.open();
  w.document.write(html);
  w.document.close();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAR AL CARGAR LA VISTA ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
ObtenerEmpleadosActivacion();
