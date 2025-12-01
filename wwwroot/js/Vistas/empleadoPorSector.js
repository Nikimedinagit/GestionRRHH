
/////////////////////////////////////////////////////////////
//INICIO ONCHANGE DE FILTROS ////////////////////////////////
/////////////////////////////////////////////////////////////
$(document).ready(function () {
  ObtenerEmpleadosSupervisor();

  $("#EmpleadoIdBuscar").on("input", function () {
    ObtenerEmpleadosSupervisor();
  });

  $("#DniEmpleadoFiltro").on("input", function () {
    ObtenerEmpleadosSupervisor();
  });

  $("#EstadoCivilEmpleadoFiltro").on("change", function () {
    ObtenerEmpleadosSupervisor();
  });

  $("#TipoSexoEmpleadoFiltro").on("change", function () {
    ObtenerEmpleadosSupervisor();
  });

  $("#IdLocalidadFiltro").on("change", function () {
    ObtenerEmpleadosSupervisor();
  });

  $("#IdPuestoFiltro").on("change", function () {
    ObtenerEmpleadosSupervisor();
  });

  $("#NroLegajoFiltro").on("input", function () {
    ObtenerEmpleadosSupervisor();
  });
});


/////////////////////////////////////////////////////////////
// COMPLETAR SELECT LOCALDIADES Y PUESTOS //////////////////
/////////////////////////////////////////////////////////////
async function ComboParaFiltrarLocalidadPuesto() {
  const resLocalidades = await authFetch("Localidades/Activos", {
    method: "GET",
  });
  const localidades = await resLocalidades.json();

  const $comboLocalidad = $("#IdLocalidadFiltro");
  $comboLocalidad.empty();

  let opciones = `<option value="0">[Todas]</option>`;
  localidades.forEach((item) => {
    opciones += `<option value="${item.id}">${item.nombre}</option>`;
  });
  $comboLocalidad.html(opciones);

  const resPuestos = await authFetch("Puestos/Activos", {
    method: "GET",
  });
  const puestos = await resPuestos.json();

  const $comboPuesto = $("#IdPuestoFiltro");
  $comboPuesto.empty();

  let opcionesPuesto = `<option value="0">[Todas]</option>`;
  puestos.forEach((item) => {
    opcionesPuesto += `<option value="${item.id}">${item.descripcion}</option>`;
  });
  $comboPuesto.html(opcionesPuesto);

  ObtenerEmpleadosSupervisor();
}


/////////////////////////////////////////////////////////////
// OBTENER DATOS DE LA API /////////////////////////////////////
/////////////////////////////////////////////////////////////
async function ObtenerEmpleadosSupervisor() {
  let dniEmpleado = document.getElementById("DniEmpleadoFiltro").value;

  let nroLegajo = document.getElementById("NroLegajoFiltro").value;

  let estadoCivilEmpleado = document.getElementById(
    "EstadoCivilEmpleadoFiltro"
  ).value;
  let estadoCivil =
    estadoCivilEmpleado !== "0" && estadoCivilEmpleado !== ""
      ? parseInt(estadoCivilEmpleado)
      : null;

  let tipoSexoEmpleado = document.getElementById(
    "TipoSexoEmpleadoFiltro"
  ).value;
  let tipoSexo =
    tipoSexoEmpleado !== "0" && tipoSexoEmpleado !== ""
      ? parseInt(tipoSexoEmpleado)
      : null;

  let localidadFiltro = document.getElementById("IdLocalidadFiltro").value;
  let puestoFiltro = document.getElementById("IdPuestoFiltro").value;

  let filtro = {
    nombreCompleto: document.getElementById("EmpleadoIdBuscar").value,
    dNI: dniEmpleado ? Number(dniEmpleado) : null,
    nroLegajo: nroLegajo,
    estadoCiviles: estadoCivil,
    tipoSexo: tipoSexo,
    localidadId: localidadFiltro === "0" ? null : Number(localidadFiltro),
    puestoId: puestoFiltro === "0" ? null : Number(puestoFiltro),
  };

  const res = await authFetch("Empleados/FiltrarPorSectorYHorario", {
    method: "POST",
    body: JSON.stringify(filtro),
  })
    .then((response) => response.json())
    .then((data) => {
      MostrarEmpleadosSupervisor(data);
      ObtenerTotalEmpleados();
    })
    .catch((error) => {
      MostrarErrorCatch();
    });
}


/////////////////////////////////////////////////////////////
// FUNCIÓN PARA MOSTRAR EMPLEADOS DEL SUPERVISOR ////////////
/////////////////////////////////////////////////////////////
function MostrarEmpleadosSupervisor(data) {
  const contenedor = $("#empleadosContainer");
  contenedor.empty();

  if (!data.length) {
    contenedor.append(`
      <div class="col-12 text-center text-muted">No hay empleados asignados a tu sector.</div>
    `);
    return;
  }

  window.empleadosData = data;


  data.forEach((item) => {
    const nombre = item.nombreCompleto || "-";
    const puesto = item.puesto || "-";
    const email = item.email || "-";
    const telefono = item.telefono || "-";
    const dni = item.dni || "-";
    const estadoCivil = item.estadoCivil || "-";

    const activo = item.eliminado == false;
    const textoEstado = activo ? "A" : "D";
    const tooltipEstadoBadge = activo ? "Activo" : "Desactivado";
    const claseEstado = activo ? "bg-success text-white" : "bg-danger text-white";

    contenedor.append(`
      <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex">
        <div class="card shadow-sm p-2 rounded-3 position-relative d-flex flex-column w-100"
             style="border-bottom: 4px solid ${activo ? "#198754" : "#DC3545"}; min-height: 260px;">

          <div class="flex-grow-1 d-flex flex-column">

            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="fw-bold mb-0" style="font-size: 1rem;">${nombre}</h5>
              <span class="badge ${claseEstado}" style="font-size: 0.65rem; padding: 0.2em 0.45em;"
                    data-tippy-content="${tooltipEstadoBadge}">
                ${textoEstado}
              </span>
            </div>

            <p class="mb-1 text-muted d-flex align-items-center" style="font-size: 0.9rem;">
              <i class="bi bi-briefcase me-2" style="font-size: 1rem;"></i>
              <span>${puesto}</span>
            </p>

            <p class="mb-1 text-muted d-flex align-items-center" style="font-size: 0.9rem;">
              <i class="bi bi-envelope me-2" style="font-size: 1rem;"></i>
              <span>${email}</span>
            </p>

            <p class="mb-1 text-muted d-flex align-items-center" style="font-size: 0.9rem;">
              <i class="bi bi-telephone me-2" style="font-size: 1rem;"></i>
              <span>${telefono}</span>
            </p>

            <hr class="m-0 mb-2"/>

            <div class="d-flex gap-2 flex-wrap">
              <span class="badge text-dark" style="background-color: #d0e7ff; font-size: 0.75rem;">DNI: ${dni}</span>
              <span class="badge text-dark" style="background-color: #d4edda; font-size: 0.75rem;">${estadoCivil}</span>
            </div>
          </div>

          <div class="d-flex justify-content-center mt-2 align-items-center">
            <button class="btn-ver" style="background: none; border: none; cursor: pointer;"
                    onclick="MostrarDetalleEmpleado(${item.id})" data-tippy-content="Ver más">
              <i class="bi bi-info-circle btn-sm iocno-ver-empleado"></i>
            </button>
            <button class="btn-ver" style="background: none; border: none; cursor: pointer;"
                    onclick="MostrarDetalleHorario(${item.id})" data-tippy-content="Ver horario">
              <i class="bi bi-clock btn-sm icono-historial-empleado"></i>
            </button>
          </div>

        </div>
      </div>
    `);
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}



/////////////////////////////////////////////////////////////
// MOSTRAR DETALLE DE LOS EMPLEADO POR ID ////////////////////
/////////////////////////////////////////////////////////////
function MostrarDetalleEmpleado(id) {
  const empleado = empleadosData.find((e) => e.id === id);
  if (!empleado) return;

  document.getElementById("detalleNombre").textContent = empleado.nombreCompleto || "";
  document.getElementById("detalleDni").textContent = empleado.dni || "";
  document.getElementById("detalleCuil").textContent = empleado.cuil || "";
  document.getElementById("detalleTelefono").textContent = empleado.telefono || "";
  document.getElementById("detalleEmail").textContent = empleado.email || "";
  document.getElementById("detalleFechaNacimiento").textContent = empleado.fechaNacimiento || "";
  document.getElementById("detalleDireccion").textContent = empleado.direccion || "";
  document.getElementById("detalleEstadoCivil").textContent = empleado.estadoCivil || "";
  document.getElementById("detalleCantidadHijos").textContent = empleado.cantidadHijos || 0;
  document.getElementById("detallePuesto").textContent = empleado.puesto || "";
  document.getElementById("detalleLegajo").textContent = empleado.nroLegajo || "";
  document.getElementById("detalleEdad").textContent = empleado.edad + " AÑOS" || "";
  document.getElementById("detalleLocalidad").textContent = empleado.localidad || "";
  document.getElementById("detalleSexo").textContent = empleado.tipoSexo || "";


  const offcanvasEmpleado = new bootstrap.Offcanvas("#offcanvasDetalleEmpleado");
  offcanvasEmpleado.show();

}


///////////////////////////////////////////////////////////////////////////////////////////////////////
/// MOSTRAR DETALLE DE HORARIO //////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function MostrarDetalleHorario(id) {
  const empleado = empleadosData.find((e) => e.id === id);
  if (!empleado || !empleado.horario) return;

  const horario = empleado.horario;
  const esSeparado = horario.tipoHorarioString?.toLowerCase() === "alterno";

  const dias = [
    "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"
  ];

  dias.forEach((dia) => {
    const activo = horario[dia.toLowerCase()];
    const fila = document.querySelector(`.detalle-horario-fila:has(#detalleInicio${dia})`);
    const inicio1Elem = document.getElementById(`detalleInicio${dia}`);
    const fin1Elem = document.getElementById(`detalleFin${dia}`);
    const inicio2Elem = document.getElementById(`detalleInicio${dia}2`);
    const fin2Elem = document.getElementById(`detalleFin${dia}2`);
    const turno2Div = document.getElementById(`turno${dia}2`);

    if (!fila) return;

    if (activo) {
      fila.style.display = "block";
      inicio1Elem.textContent = horario.horarioInicioString || "-";
      fin1Elem.textContent = horario.horarioFinString || "-";

      if (esSeparado && horario.segundoHorarioInicioString && horario.segundoHorarioFinString) {
        turno2Div.style.display = "block";
        inicio2Elem.textContent = horario.segundoHorarioInicioString;
        fin2Elem.textContent = horario.segundoHorarioFinString;
      } else {
        turno2Div.style.display = "none";
        inicio2Elem.textContent = "-";
        fin2Elem.textContent = "-";
      }
    } else {
      fila.style.display = "none";
    }
  });

  const offcanvasElement = document.getElementById("offcanvasDetalleHorario");
  const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
  offcanvas.show();
}


///////////////////////////////////////////////////////////////////////////////////////////////////////
/// GENERAR PDF //////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function GenerarInformeEmpleadoPorSector() {

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  let nombreCompleto = document.getElementById("EmpleadoIdBuscar").value;
  let dniEmpleado = document.getElementById("DniEmpleadoFiltro").value;
  let nroLegajo = document.getElementById("NroLegajoFiltro").value;
  let estadoCivilEmpleado = document.getElementById("EstadoCivilEmpleadoFiltro").value;
  let estadoCivil = estadoCivilEmpleado !== "0" && estadoCivilEmpleado !== "" ? parseInt(estadoCivilEmpleado) : null;
  let tipoSexoEmpleado = document.getElementById("TipoSexoEmpleadoFiltro").value;
  let tipoSexo = tipoSexoEmpleado !== "0" && tipoSexoEmpleado !== "" ? parseInt(tipoSexoEmpleado) : null;
  let localidadFiltro = document.getElementById("IdLocalidadFiltro").value;
  let localidadNombre = document.getElementById("IdLocalidadFiltro").selectedOptions[0]?.text || "";
  let puestoFiltro = document.getElementById("IdPuestoFiltro").value;
  let puestoNombre = document.getElementById("IdPuestoFiltro").selectedOptions[0]?.text || "";

  let filtro = {
    nombreCompleto: nombreCompleto,
    dNI: dniEmpleado ? Number(dniEmpleado) : null,
    nroLegajo: nroLegajo,
    estadoCiviles: estadoCivil,
    tipoSexo: tipoSexo,
    localidadId: localidadFiltro === "0" ? null : Number(localidadFiltro),
    puestoId: puestoFiltro === "0" ? null : Number(puestoFiltro),
  };

  const res = await authFetch("InformesGeneralesPdf/GenerarInformeEmpleados", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filtro)
  });

  const { empleados, resumen } = await res.json();

  if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
    ErrorGeneralInformePdf();
    return;
  }

  let filtrosAplicadosArray = [];

  if (filtro.dNI) filtrosAplicadosArray.push(`[DNI: ${filtro.dNI}]`);
  if (filtro.nombreCompleto) filtrosAplicadosArray.push(`[Nombre: ${filtro.nombreCompleto}]`);
  if (filtro.nroLegajo) filtrosAplicadosArray.push(`[Legajo: ${filtro.nroLegajo}]`);

  if (filtro.estadoCiviles !== null) {
    const estadoCivilTexto =
      filtro.estadoCiviles === 1
        ? "Soltero"
        : filtro.estadoCiviles === 2
          ? "Casado"
          : filtro.estadoCiviles === 3
            ? "Divorciado"
            : filtro.estadoCiviles === 4
              ? "Viudo"
              : "Otro";
    filtrosAplicadosArray.push(`[Estado Civil: ${estadoCivilTexto}]`);
  }

  if (filtro.tipoSexo !== null) {
    const sexoTexto =
      filtro.tipoSexo === 1
        ? "Masculino"
        : filtro.tipoSexo === 2
          ? "Femenino"
          : filtro.tipoSexo === 3
            ? "No Binario"
            : "Otro";
    filtrosAplicadosArray.push(`[Sexo: ${sexoTexto}]`);
  }

  if (filtro.localidadId) filtrosAplicadosArray.push(`[Localidad: ${localidadNombre}]`);
  if (filtro.puestoId) filtrosAplicadosArray.push(`[Puesto: ${puestoNombre}]`);

  const filtrosAplicados =
    filtrosAplicadosArray.length > 0 ? filtrosAplicadosArray.join("  |  ") : "No se aplicaron";


  doc.setTextColor(19, 115, 204);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`Informe de Empleados (Sector: ${resumen.sectorSupervisor})`, doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

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
  doc.text("| Hombres:", 49, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.hombres}`, 69, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Mujeres:", 73, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.mujeres}`, 91, y);

  doc.setFont("helvetica", "normal");
  doc.text("| No Binario:", 95, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.noBinario}`, 117, y);

  doc.setFont("helvetica", "normal");
  doc.text("| Otros:", 121, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${resumen.otros}`, 135, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text("Filtros Aplicados:", 14, y);
  doc.setFont("helvetica", "bold");

  const filtrosText = doc.splitTextToSize(filtrosAplicados, 260);
  doc.text(filtrosText, 45, y);
  y += filtrosText.length * 6 + 0;


  doc.setDrawColor(180);
  doc.line(10, y, doc.internal.pageSize.getWidth() - 10, y);
  y += 7;


  doc.setTextColor(0, 0, 0);
  const anchoPagina = doc.internal.pageSize.getWidth() - 30;
  empleados.forEach((e) => {
    if (y > 180) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.text(e.nombreCompleto.toUpperCase(), 14, y);
    y += 6;

    const datosEmpleado = [
      ["DNI", e.dni],
      ["Legajo", e.nroLegajo],
      ["Edad", e.edad],
      ["CUIL", e.cuil],
      ["Dirección", e.direccion],
      ["Localidad", e.localidadIdString],
      ["Puesto", e.puestoIdString],
      ["Estado Civil", e.estadoCivilesString],
      ["Sexo", e.tipoSexoString],
      ["Email", e.email],
      ["Teléfono", e.telefono],
      ["Hijos", e.cantidadHijos]
    ];

    let xPos = 20;
    const margenDerecho = doc.internal.pageSize.getWidth() - 20;
    const espacioEntre = 8;

    datosEmpleado.forEach(([label, valor], idx) => {
      const textoLabel = `${label}:`;
      const textoValor = `${valor}`;
      const textoCompleto = idx < datosEmpleado.length - 1
        ? `${textoLabel} ${textoValor} |`
        : `${textoLabel} ${textoValor}`;

      const anchoTexto = doc.getTextWidth(textoCompleto);

      if (xPos + anchoTexto > margenDerecho) {
        xPos = 20;
        y += 6;
      }

      doc.setFont("helvetica", "bold");
      doc.text(textoLabel, xPos, y);

      const anchoLabel = doc.getTextWidth(textoLabel + " ");
      doc.setFont("helvetica", "normal");
      doc.text(textoValor, xPos + anchoLabel, y);

      if (idx < datosEmpleado.length - 1) {
        const anchoValor = doc.getTextWidth(textoValor + " ");
        doc.text("|", xPos + anchoLabel + anchoValor, y);
      }

      xPos += anchoTexto + espacioEntre;
    });

    y += 10;
  });


  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10, { align: "left" });
    doc.text("www.WorkSync.com", doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: "right" });
  }

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  const html = `<html><head><title>Informe de Empleados</title></head>
  <body class="pdf-body">
  <iframe class="pdf-frame" width="100%" height="100%" src="${url}"></iframe>
  </body></html>`;

  const w = window.open();
  w.document.open();
  w.document.write(html);
  w.document.close();

}


/////////////////////////////////////////////////////////////
// INICIALIZAR AL CARGAR LA VISTA /////////////////////////////////////////////
/////////////////////////////////////////////////////////////
ComboParaFiltrarLocalidadPuesto();