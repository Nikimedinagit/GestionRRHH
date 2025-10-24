
////////////////////////////////////////////////////////////////////////////////////////////////////////
// INICIO DE VARIABLES PARA LOS DATOS DE LA API /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
var asistenciasData = [];


/////////////////////////////////////////////////////////////
//INICIO ONCHANGE DE FILTROS ////////////////////////////////
/////////////////////////////////////////////////////////////
$(document).ready(function () {
    $("#EmpleadoIdBuscar, #DniBuscar, #NroLegajoBuscar, #EstadoAsistenciaBuscar, #FechaBuscar").on("input", ObtenerAsistencias);
});


/////////////////////////////////////////////////////////////
// OBTENER DATOS DE LA API /////////////////////////////////////
/////////////////////////////////////////////////////////////
async function ObtenerAsistencias() {
    try {
        let estadoAsistencia = document.getElementById("EstadoAsistenciaBuscar").value;
        if (estadoAsistencia === "0") estadoAsistencia = null;
        else estadoAsistencia = Number(estadoAsistencia);

        let dniEmpleado = document.getElementById("DniBuscar").value;
        let nroLegajo = document.getElementById("NroLegajoBuscar").value;
        let fechaFiltro = document.getElementById("FechaBuscar").value;

        const asistenciasFiltradas = {
            nombreCompleto: document.getElementById("EmpleadoIdBuscar").value,
            DNI: dniEmpleado ? Number(dniEmpleado) : null,
            nroLegajo: nroLegajo,
            fecha: fechaFiltro ? fechaFiltro : null,
            estadoAsistencia: estadoAsistencia
        };

        const response = await authFetch("Asistencias/FiltrarDia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(asistenciasFiltradas)
        });

        const data = await response.json();

        let fechaMostrar;
        if (fechaFiltro) {
            const partes = fechaFiltro.split("-");
            fechaMostrar = new Date(partes[0], partes[1] - 1, partes[2]);
        } else {
            fechaMostrar = new Date();
        }

        const opcionesFecha = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        const fechaFormateada = fechaMostrar.toLocaleDateString("es-AR", opcionesFecha);
        const fechaCap = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

        $("#tituloAsistencias").html(`
            <i class="bi bi-calendar3"></i>
            <span class="fw-bold">Asistencias del Día:</span>
            <small class="text-muted">"${fechaCap}"</small>
        `);

        MostrarAsistencias(data);

    } catch (error) {
        MostrarErrorCatch();
    }
}


/////////////////////////////////////////////////////////////
/// MOSTRAR DATOS DE LA API /////////////////////////////////////
/////////////////////////////////////////////////////////////
function MostrarAsistencias(data) {
    const contenedor = $("#asistenciasContainer");
    contenedor.empty();

    asistenciasData = data;

    if (!data || data.length === 0) {
        contenedor.append(`<div class="col-12 text-center text-muted">No hay asistencias para mostrar.</div>`);
        return;
    }

    const EstadoAsistenciaEstilo = {
        COMPLETA: {
            backgroundColor: "#a3dc9a72",
            color: "#06923E"
        },
        INCOMPLETA: {
            backgroundColor: "#fff3cd",
            color: "#856404"
        },
        AUSENTE: {
            backgroundColor: "#f8d7da",
            color: "#c62828"
        },
        TARDE: {
            backgroundColor: "#ffe5d0",
            color: "#d35400"
        },
        "FUERA DE HORARIO": {
            backgroundColor: "#e2e3e5",
            color: "#495057"
        }
    };

    const badgeBaseClass = "badge fw-bold fs-6 mb-2";

    data.forEach((item) => {
        let estadoRaw = item.estadoString || "";
        let estado = estadoRaw.trim().toUpperCase();

        if (estado.replace(/\s+/g, "") === "FUERADEHORARIO") estado = "FUERA DE HORARIO";

        const estilo = EstadoAsistenciaEstilo[estado] || {
            backgroundColor: "#e2e3e5",
            color: "#495057"
        };

        const nombre = item.empleadoString || "Sin nombre";
        const foto = item.fotoUrl || "img/default.png";

        contenedor.append(`
            <div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex">
                <div class="card shadow-sm p-2 rounded-3 text-center w-100" 
                     style="min-height: 260px; border-bottom: 4px solid ${estilo.color};">
                    <img src="${foto}" alt="Foto" class="card-img-top" 
                         style="height: 180px; object-fit: cover; border-radius: 12px 12px 0 0;">
                    <div class="card-body py-2 d-flex flex-column justify-content-center">
                        <h5 class="card-title mb-1" 
                            style="font-size: 1rem; font-weight:bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" 
                            title="${nombre}">${nombre}</h5>
                        <span class="${badgeBaseClass}" style="background-color: ${estilo.backgroundColor}; color: ${estilo.color};">
                            ${estado}
                        </span>
                        <button class="btn-ver" 
                                style="background: none; border: none; cursor: pointer;" 
                                onclick="MostrarDetalleAsistencia(${item.id})" 
                                data-tippy-content="Ver más">
                            <i class="bi bi-info-circle btn-sm iocno-ver-asistencia"></i>
                        </button>
                    </div>
                </div>
            </div>
        `);
    });

    tippy("[data-tippy-content]", { animation: "scale", theme: "mi-tema", delay: [100, 0] });
}



/////////////////////////////////////////////////////////////
// MOSTRAR DETALLE DE LOS ASISTENCIAS POR ID ////////////////////
/////////////////////////////////////////////////////////////
function MostrarDetalleAsistencia(id) {
    const asistencia = asistenciasData.find(a => a.id === id);
    if (!asistencia) return;

    $("#detalleNombre").text(asistencia.empleadoString || "Sin nombre");
    $("#detalleLegajoAsistencia").text(asistencia.nroLegajo || "-");

    $("#detallePrimerEntradaAsistencia").text(asistencia.primerEntradaString || "-");
    $("#detallePrimerSalidaAsistencia").text(asistencia.primerSalidaString || "-");

    const isAlterno = (asistencia.tipoHorario || "").toUpperCase() === "ALTERNO";
    if (isAlterno) {
        $("#detalleSegundaEntradaAsistencia").text(asistencia.segundaEntradaString || "-");
        $("#detalleSegundaSalidaAsistencia").text(asistencia.segundaSalidaString || "-");
        $("#filaSegundaEntrada, #filaSegundaSalida").show();
    } else {
        $("#filaSegundaEntrada, #filaSegundaSalida").hide();
    }

    const tipoColor = { CONTINUO: "bg-continuo", ALTERNO: "bg-alterno" };
    const tipoHorario = (asistencia.tipoHorario || "CONTINUO").toUpperCase();
    const badgeTipoHorario = `
        <div class="text-center mt-1 mb-1">
            <span class="badge ${tipoColor[tipoHorario] || 'bg-secondary'}">${tipoHorario}</span>
        </div>
    `;
    $("#detalleTipoHorarioAsistencia").empty().append(badgeTipoHorario);

    const EstadoAsistenciaEstilo = {
        COMPLETA: {
            backgroundColor: "#a3dc9a72",
            color: "#06923E"
        },
        INCOMPLETA: {
            backgroundColor: "#fff3cd",
            color: "#856404"
        },
        AUSENTE: {
            backgroundColor: "#f8d7da",
            color: "#c62828"
        },
        TARDE: {
            backgroundColor: "#ffe5d0",
            color: "#d35400"
        },
        "FUERA DE HORARIO": {
            backgroundColor: "#e2e3e5",
            color: "#495057"
        }
    };

    let estado = (asistencia.estadoString || "").toUpperCase().trim();
    if (estado.replace(/\s+/g, "") === "FUERADEHORARIO") estado = "FUERA DE HORARIO";

    const estiloEstado = EstadoAsistenciaEstilo[estado] || {
        backgroundColor: "#e2e3e5",
        color: "#495057"
    };

    $("#detalleEstadoAsistencia").empty().append(
        $("<span>", {
            class: "badge fw-bold fs-6",
            text: estado,
            style: `background-color:${estiloEstado.backgroundColor}; color:${estiloEstado.color}; display:inline-block; padding:4px 8px; border-radius:4px;`
        })
    );

    new bootstrap.Offcanvas(document.getElementById('offcanvasDetalleAsistencia')).show();
}




//////////////////////////////////////////////////////////////////////////////////////////
// INICILIAZMOS AL CARGAR LA VISTA /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
ObtenerAsistencias();





