
//INICIO PANEL FORMUALRIO//
//Función para abrir el formulario lateral
function abrirPanelProvincia() {
  document.getElementById("panelProvincia").classList.add("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.add("visible");

  setTimeout(() => {
    const inputNombre = document.getElementById("NombreProvincia");
    if (inputNombre) inputNombre.focus();
  }, 400);
}

//Funcion para cerrar el formulario lateral
function cerrarPanelProvincia() {
  document.getElementById("panelProvincia").classList.remove("abierto");
  const fondo = document.getElementById("fondoOscuro");
  fondo.classList.remove("visible");

  LimpiarModalProvincia();
}
//FIN PANEL FORMULARIO//

//PANEL FILTROS//
//Funcion para abrir panel de filtros
function AbrilPanelFiltros(idPanel) {
  const panel = document.getElementById(idPanel);
  if (!panel) return;

  if (panel.classList.contains("activo")) {
    panel.classList.remove("activo");
    setTimeout(() => panel.classList.add("d-none"), 300);
    document.removeEventListener("mousedown", DetectarClickFueraDeFiltro);
  } else {
    panel.classList.remove("d-none");
    setTimeout(() => panel.classList.add("activo"), 10);
    // Agrega el listener para cerrar al hacer clic fuera
    setTimeout(() => {
      document.addEventListener("mousedown", DetectarClickFueraDeFiltro);
    }, 20);
  }

  // Funcion sid etecta un clcik fuera del contenedir del filtro lo cierra
  function DetectarClickFueraDeFiltro(event) {
    if (
      !panel.contains(event.target) &&
      event.target.id !== "btnMostrarFiltros"
    ) {
      panel.classList.remove("activo");
      setTimeout(() => panel.classList.add("d-none"), 300);
      document.removeEventListener("mousedown", DetectarClickFueraDeFiltro);
    }
  }
}
//FIN PANEL FILTROS//



//INICIO PANEL GENERAR//
//Funcion para abrir panel de genera
function AbrilPanelGenerar(idPanel) {
  const panel = document.getElementById(idPanel);
  if (!panel) return;

  if (panel.classList.contains("activo")) {
    panel.classList.remove("activo");
    setTimeout(() => panel.classList.add("d-none"), 300);
    document.removeEventListener("mousedown", DetectarClickFueraDeGenerar);
  } else {
    panel.classList.remove("d-none");
    setTimeout(() => panel.classList.add("activo"), 10);
    // Agrega el listener para cerrar al hacer clic fuera
    setTimeout(() => {
      document.addEventListener("mousedown", DetectarClickFueraDeGenerar);
    }, 20);
  }

  // Funcion sid etecta un clcik fuera del contenedir de generar lo cierra
  function DetectarClickFueraDeGenerar(event) {
    if (
      !panel.contains(event.target) &&
      event.target.id !== "btnMostrarGenerar"
    ) {
      panel.classList.remove("activo");
      setTimeout(() => panel.classList.add("d-none"), 300);
      document.removeEventListener("mousedown", DetectarClickFueraDeGenerar);
    }
  }
}
//FIN PANEL GENERAR//

// INICIO ONCHANGE DE FILTROS//
$(document).ready(function () {
  ObtenerProvincias();

  $("#EstadoIdBuscar").on("change", function () {
    ObtenerProvincias();
  });
});
//FIN ONCHANGE DE FILTROS//

// Funcion Para Obtener las Provincias
async function ObtenerProvincias() {

  let estado = document.getElementById("EstadoIdBuscar").value;
  let filtro = {
    eliminado: estado !== "" ? parseInt(estado) : null,
  };

const res = await authFetch("Provincias/Filtrar", {
        method: "POST",
        body: JSON.stringify(filtro),
    })
    .then(response => response.json())
    .then((data) => {
      MostrarProvincias(data);
      LimpiarModalProvincia();
      cerrarPanelProvincia();
    })
    .catch((error) => console.log("No se pudo obtener las provincias", error));
}

  let filtro = {
    eliminado: eliminado,
  };      
// Funcion Para Mostrar Las Provincias
function MostrarProvincias(data) {
    window.listaProvincias = data;

  $("#tablaProvinciasBody").empty();

  if (data.length === 0) {
    $("#tablaProvinciasBody").append(
      "<tr><td colspan='2' class='text-center text-muted'>No hay provincias para mostrar.</td></tr>"
    );
    return;
  }

  $.each(data, function (index, item) {
    let filaClass = item.eliminado ? "fila-desactivada" : "";
    let visibleBotones = item.eliminado ? "display: none;" : "";
    let iconColor = item.eliminado ? "text-success" : "text-danger";

    $("#tablaProvinciasBody").append(
      "<tr>" +
        // Columna Activo (toggle)
        "<td class='text-center align-middle'>" +
        "<button class='btn-editar' type='button' class='btn btn-sm " +
        (item.eliminado ? "btn-outline-success" : "btn-outline-danger") +
        "' data-tippy-content='" +
        (item.eliminado ? "Activar" : "Desactivar") +
        "' onclick='EliminarProvinciaId(" +
        item.id +
        ", " +
        item.eliminado +
        ")' style='background: none; border: none;'>" +
        "<i class='icon-desactivar bi " +
        (item.eliminado ? "bi-toggle-off" : "bi-toggle-on") +
        " " +
        iconColor +
        "'></i>" +
        "</button>" +
        "</td>" +
        // Columna Provincia (nombre)
        "<td class='align-middle " +
        filaClass +
        "'>" +
        item.nombre +
        "</td>" +
        // Columna Acciones (editar)
        "<td class='d-flex justify-content-center align-items-center'>" +
        "<button class='btn-editar' data-action='edit' style='" +
        visibleBotones +
        " background: none; border: none;' onclick='MostrarModalEditar(" +
        item.id +  ")' data-tippy-content='Editar'>" +
        "<i class='bi bi-pencil-square icono-editar'></i>" +
        "</button>" +
        "</td>" +
        "</tr>"
    );
  });

  // Inicializar tooltips de Tippy
  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

// Funcion para mostrar el modal de edición de la provincia
async function MostrarModalEditar(id) {
  const res = await authFetch(`Provincias/${id}`);
  const provincia = await res.json();
  const nombre = provincia.nombre ? provincia.nombre.trim() : "";
  document.getElementById("IdProvincia").value = provincia.id;
  document.getElementById("NombreProvincia").value = nombre;

  abrirPanelProvincia();
}

// Funcion para buscar el id de la provincia y llamar a la función de edición o creación
function BuscarProvinciaId() {
  const id = parseInt(document.getElementById("IdProvincia").value);

  if (!id || id === 0) {
    CrearProvincia();
  } else {
    EditarProvincia(id);
  }
}

// Funcion para limpiar el modal de edición de la provincia
function LimpiarModalProvincia() {
  // Limpia el formulario
  document.getElementById("IdProvincia").value = "";
  const inputNombre = document.getElementById("NombreProvincia");
  inputNombre.value = "";

  // Limpia los estilos de validación
  inputNombre.classList.remove("is-invalid");
  inputNombre.classList.remove("is-valid");

  // Limpia el mensaje de error
  const inputErrorNombre = document.getElementById("errorNombreProvincia");
  inputErrorNombre.textContent = "";
  inputErrorNombre.style.display = "none";
}

// Función para validar el formulario de provincia
function ValidarFormularioProvincia() {
  const inputNombre = document.getElementById("NombreProvincia");
  const inputErrorNombre = document.getElementById("errorNombreProvincia");
  const nombre = inputNombre.value.trim();

  // Limpiar errores previos
  inputErrorNombre.style.display = "none";
  inputErrorNombre.textContent = "";
  inputNombre.classList.remove("is-invalid", "is-valid");

  if (nombre.length === 0) {
    inputNombre.classList.add("is-invalid");
    inputErrorNombre.style.display = "block";
    inputErrorNombre.textContent = "Campo obligatorio.";
    return false;
  }

  if (nombre.length < 3) {
    inputNombre.classList.add("is-invalid");
    inputErrorNombre.style.display = "block";
    inputErrorNombre.textContent = "Mínimo 3 caracteres.";
    return false;
  }

  inputNombre.classList.add("is-valid"); // Aplica color verde cuando es válido
  inputErrorNombre.style.display = "none";
  return true;
}

// 🎨 Validación en vivo: cambia el color mientras el usuario escribe
document.getElementById("NombreProvincia").addEventListener("input", () => {
  const inputNombre = document.getElementById("NombreProvincia");
  const errorNombre = document.getElementById("errorNombreProvincia");
  const nombre = inputNombre.value.trim();

  // Limpiar cualquier estado previo
  inputNombre.classList.remove("is-invalid", "is-valid");

  if (nombre.length === 0) {
    inputNombre.classList.add("is-invalid");
    errorNombre.style.display = "block";
    errorNombre.textContent = "Campo obligatorio.";
  } else if (nombre.length < 3) {
    inputNombre.classList.add("is-invalid");
    errorNombre.style.display = "block";
    errorNombre.textContent = "Mínimo 3 caracteres.";
  } else {
    inputNombre.classList.add("is-valid"); // Color verde cuando cumple
    errorNombre.style.display = "none";
  }
});

function MostrarErrorProvinciaExistente(mensaje) {
  const errorProvincia = document.getElementById("errorNombreProvincia");
  const inputNombreProvincia = document.getElementById("NombreProvincia");

  errorProvincia.textContent = mensaje;
  errorProvincia.style.display = "block";
  inputNombreProvincia.classList.add("is-invalid");
}

// Funcion para crear una provincia
async function CrearProvincia() {
  if (!ValidarFormularioProvincia()) return;

  const provincia = {
    nombre: document.getElementById("NombreProvincia").value.trim(),
  };
  const res = await authFetch("Provincias", {
    method: "POST",
    body: JSON.stringify(provincia),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        MostrarErrorProvinciaExistente(response.mensaje);
      } else {
        cerrarPanelProvincia();
        ObtenerProvincias(); 
        // Mostrar alerta de éxito
        Swal.fire({
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "¡Provincia Creada!",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#f0f0f0",
          color: "#000",
        });
      }
    });
}

// Funcion para editar una provincia
async function EditarProvincia(id) {

  if (!ValidarFormularioProvincia()) return;
  
  let provincia = {
    id: document.getElementById("IdProvincia").value,
    nombre: document.getElementById("NombreProvincia").value.trim(),
  };
  const res = await authFetch(`Provincias/${id}`, {
    method: "PUT",
    body: JSON.stringify(provincia),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.mensaje) {
        MostrarErrorProvinciaExistente(response.mensaje);
      } else {
        ObtenerProvincias(); 
        // Mostrar alerta de éxito
        Swal.fire({
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "¡Provincia Modificada!",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#f0f0f0",
          color: "#000",
        });
      }
    });
}



// Función para eliminar una provincia
function EliminarProvinciaId(id, eliminado) {
  Swal.fire({
    title: eliminado ? "¿Reactivar provincia?" : "¿Desactivar provincia?",
    text: eliminado
      ? "Se reactivará esta provincia en el sistema."
      : "Esta provincia se desactivará y no estará disponible.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: eliminado ? "Reactivar" : "Desactivar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: "swal2-border-radius",
      confirmButton: eliminado ? "swal2-btn-reactivar" : "swal2-btn-desactivar",
      cancelButton: "swal2-btn-cancelar",
      title: "swal2-title-custom",
      content: "swal2-content-custom",
    },
    background: "#fff",
    color: "#22223b",
  })
  .then((result) => {
    if (result.isConfirmed) {
      EliminarSiProvincia(id);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Acción cancelada",
        text: eliminado
          ? "La provincia sigue desactivada."
          : "La provincia sigue activa.",
        icon: "info",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "bottom-end",
      });
    }
  });
}

// Función para eliminar una provincia
async function EliminarSiProvincia(id) {
  const res = await authFetch(`Provincias/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudo eliminar/reactivar la provincia");
      }
      return response.json();
    })
    .then((data) => {
      ObtenerProvincias();

      // Mostrar el mensaje que vino del backend
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: "¡" + data.mensaje + "!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#f0f0f0",
        color: "#000",
      });
    })
    .catch((error) => {
      console.error(error);
      Swal.fire("Error", "No se pudo actualizar la provincia.", "error");
    });
}







window.GenerarExcel = async function() {
  const nombreSistema = "WorkSync - Listado de Provincias";
  const fecha = new Date().toLocaleString();

  const estadoFiltro = document.getElementById("EstadoIdBuscar")?.value;
  let filtroTexto = "Todos los estados";
  if (estadoFiltro === "0") filtroTexto = "Solo activos";
  else if (estadoFiltro === "1") filtroTexto = "Solo inactivos";

  const tabla = document.getElementById("tablaProvinciasBody");
  const filas = tabla?.querySelectorAll("tr") || [];

  const datos = [];
  filas.forEach(fila => {
    if (fila.offsetParent !== null) {
      const celdas = fila.querySelectorAll("td");
      if (celdas.length >= 2) {
        const activo = celdas[0].innerText.trim();
        const provincia = celdas[1].innerText.trim();
        datos.push([activo, provincia]);
      }
    }
  });

  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Provincias");

  // Estilos
  const estiloTitulo = {
    font: { size: 18, bold: true, color: { argb: 'FF0D47A1' } }, // azul oscuro
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      bottom: { style: 'thick', color: { argb: 'FF0D47A1' } }
    }
  };

  const estiloSubtitulo = {
    font: { italic: true, color: { argb: 'FF555555' } },
    alignment: { horizontal: 'left' }
  };

  const estiloEncabezado = {
    font: { bold: true, color: { argb: 'FF000000' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } }, // gris claro
    border: {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    },
    alignment: { horizontal: 'center' }
  };

  const estiloCeldaNormal = {
    border: {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    },
    alignment: { vertical: 'middle' }
  };

  const estiloCeldaActivo = {
    ...estiloCeldaNormal,
    alignment: { horizontal: 'right', vertical: 'middle' }
  };

  // Título
  hoja.mergeCells('A1:B1');
  hoja.getCell('A1').value = nombreSistema;
  hoja.getCell('A1').style = estiloTitulo;
  hoja.getRow(1).height = 28;

  // Fecha y filtro (filas 2 y 3)
  hoja.getCell('A2').value = "Fecha de exportación:";
  hoja.getCell('A2').style = estiloSubtitulo;
  hoja.getCell('B2').value = fecha;

  hoja.getCell('A3').value = "Filtro aplicado:";
  hoja.getCell('A3').style = estiloSubtitulo;
  hoja.getCell('B3').value = filtroTexto;

  hoja.getRow(2).height = 18;
  hoja.getRow(3).height = 18;

  // Espacio vacío fila 4
  hoja.addRow([]);

  // Encabezados (fila 5)
  const filaEncabezado = hoja.addRow(["Activo", "Provincia"]);
  filaEncabezado.eachCell(cell => {
    Object.assign(cell.style, estiloEncabezado);
  });
  hoja.getRow(5).height = 22;

  // Datos, con colores alternados (zebra)
  datos.forEach((dato, i) => {
    const fila = hoja.addRow(dato);
    fila.height = 20;

    fila.getCell(1).style = estiloCeldaActivo;
    fila.getCell(2).style = estiloCeldaNormal;

    // Zebra striping
    if (i % 2 === 0) {
      fila.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' }
        };
      });
    }
  });

  // Ancho columnas: Activo más angosta, Provincia más ancha
  hoja.columns = [
    { width: 12 },
    { width: 40 }
  ];

  // Descargar archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Provincias_WorkSync.xlsx";
  link.click();
};



function GenerarGrafico() {
  const data = window.listaProvincias || [];
  let activas = 0;
  let inactivas = 0;

  data.forEach(item => {
    if (item.eliminado) inactivas++;
    else activas++;
  });

  const total = activas + inactivas;
  const porcentajeActivas = ((activas / total) * 100).toFixed(1);
  const porcentajeInactivas = ((inactivas / total) * 100).toFixed(1);

  const contenedor = document.getElementById("contenedorGrafico");
  contenedor.classList.remove("d-none");

  if (window.miGraficoProvincias) {
    window.miGraficoProvincias.destroy();
  }

  const ctx = document.getElementById('graficoProvincias').getContext('2d');

  window.miGraficoProvincias = new Chart(ctx, {
    data: {
      labels: ['Activas', 'Inactivas'],
      datasets: [
        {
          type: 'bar',
          label: 'Cantidad',
          data: [activas, inactivas],
          backgroundColor: ['#28a745', '#dc3545'],
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.6
        },
        {
          type: 'line',
          label: 'Porcentaje %',
          data: [porcentajeActivas, porcentajeInactivas],
          borderColor: '#3697E1',
          backgroundColor: 'rgba(54, 151, 225, 0.2)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 3,
          hoverBorderWidth: 4
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          position: 'left',
          title: { display: true, text: 'Cantidad' }
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          max: 100,
          ticks: {
            callback: val => val + '%'
          },
          grid: {
            drawOnChartArea: false
          },
          title: { display: true, text: 'Porcentaje' }
        }
      },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: function (context) {
              if (context.dataset.type === 'bar') {
                return `Cantidad: ${context.parsed.y}`;
              } else {
                return `Porcentaje: ${context.parsed.y}%`;
              }
            }
          }
        }
      }
    }
  });
  
}



ObtenerProvincias();
