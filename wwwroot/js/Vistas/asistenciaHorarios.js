//////////////////////////////////////////////////////////////////////////////////////
/// FUNCIONES PARA OBTEENR DATOS DE LA API/////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function ObtenerAsistenciaHorario() {
    try {
        const resp = await authFetch(`AsistenciasHorarios/AsistenciaHorario`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        });
        const data = await resp.json();
        MostrarAsistenciaHorario(data);

    } catch (error) {
        MostrarErrorCatch();
    }
}


//////////////////////////////////////////////////////////////////////////////////////
/// FUNCIONES PARA MOSTRAR LOS DATOS DE LA API////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function MostrarAsistenciaHorario(data) {
    const contenedor = $("#contenedorAsistenciaHorario");
    contenedor.empty();

    const asistencia = data.asistenciaHoy || {};
    const horario = data.horario || {};
    const resumenSemanal = data.resumenSemanal || [];
    const historial = data.historialReciente || [];

    const EstadoAsistenciaBadge = {
        COMPLETA: { clase: "bg-success text-white fw-bold fs-6", borde: "#198754" },
        INCOMPLETA: { clase: "bg-warning text-white fw-bold fs-6", borde: "#ffc107" },
        AUSENTE: { clase: "bg-danger text-white fw-bold fs-6", borde: "#dc3545" },
        TARDE: { clase: "bg-warning text-white fw-bold fs-6", borde: "#ffc107" },
        FUERADEHORARIO: { clase: "bg-secondary text-white fw-bold fs-6", borde: "#6c757d" },
    };

    const estado = (asistencia.estadoString || "SIN REGISTRO").toUpperCase();
    const claseEstado = EstadoAsistenciaBadge[estado]?.clase || "bg-secondary text-white fw-bold fs-6";
    const bordeEstado = EstadoAsistenciaBadge[estado]?.borde || "#6c757d";

    const tipoColor = {
        ALTERNO: { clase: "bg-alterno", borde: "#a33a44" },
        CONTINUO: { clase: "bg-continuo", borde: "#1a4a8a" },
    };
    const tipoClase = tipoColor[horario.tipoHorarioString]?.clase || "bg-secondary";
    const bordeTipo = tipoColor[horario.tipoHorarioString]?.borde || "#6c757d";

    const dias = [
        { dia: "Lun", activo: horario.lunes },
        { dia: "Mar", activo: horario.martes },
        { dia: "Mié", activo: horario.miercoles },
        { dia: "Jue", activo: horario.jueves },
        { dia: "Vie", activo: horario.viernes },
        { dia: "Sáb", activo: horario.sabado },
        { dia: "Dom", activo: horario.domingo },
    ];

    const generarTurnos = () => {
        if (!asistencia) return "-";
        if (horario.tipoHorarioString === "ALTERNO") {
            return `
                <div class="d-flex justify-content-between mb-1 fs-6 flex-wrap">
                    <span><strong>Primera Entrada:</strong> ${asistencia.primerEntradaString || "-"}</span>
                    <span><strong>Primera Salida:</strong> ${asistencia.primerSalidaString || "-"}</span>
                </div>
                <div class="d-flex justify-content-between mb-1 fs-6 flex-wrap">
                    <span><strong>Segunda Entrada:</strong> ${asistencia.segundaEntradaString || "-"}</span>
                    <span><strong>Segunda Salida:</strong> ${asistencia.segundaSalidaString || "-"}</span>
                </div>
            `;
        } else {
            return `
                <div class="d-flex justify-content-between mb-1 fs-6 flex-wrap">
                    <span><strong>Entrada:</strong> ${asistencia.primerEntradaString || "-"}</span>
                    <span><strong>Salida:</strong> ${asistencia.primerSalidaString || "-"}</span>
                </div>
            `;
        }
    };

    const cardAsistencia = `
        <div class="col-12 col-md-6 d-flex">
            <div class="card shadow-sm rounded-3 flex-fill p-3" style="border-bottom: 3px solid ${bordeEstado};">
                <h5 class="fw-bold mb-2 fs-6">Asistencia de Hoy</h5>
                <div class="d-flex align-items-center mb-2 flex-wrap">
                    <img src="${asistencia.fotoRuta || "No hay foto"}" alt="Foto" class="rounded-circle me-3 mb-2" style="width: 80px; height: 80px; object-fit: cover;">
                    <div>
                        <h5 class="mb-1 fw-bold fs-6">${data.empleado || "Sin Registro"}</h5>
                        <span class="badge ${claseEstado} px-2 py-1 fs-7">${estado}</span>
                        <p class="mb-0 text-muted fs-7">${asistencia.fechaString || "Sin Registro"}</p>
                    </div>
                </div>
                ${generarTurnos()}
            </div>
        </div>
    `;

    const cardHorario = `
        <div class="col-12 col-md-6 d-flex">
            <div class="card shadow-sm rounded-3 flex-fill p-3" style="border-bottom: 3px solid ${bordeTipo};">
                <h5 class="fw-bold mb-2 fs-6">Horario</h5>
                <div class="d-flex flex-column justify-content-between h-100">
                    <div class="d-flex flex-column align-items-center text-center">
                        <h5 class="fw-bold mb-2 fs-6">${data.empleado || "Empleado"}</h5>
                        <span class="badge ${tipoClase} px-2 py-1 fs-7">${horario.tipoHorarioString || "SIN HORARIO"}</span>
                        ${
                            horario.tipoHorarioString === "ALTERNO"
                            ? `<p class="mb-1 fs-7"><strong>Primer Turno:</strong> ${horario.horarioInicioString || "-"} - ${horario.horarioFinString || "-"}</p>
                               <p class="mb-1 fs-7"><strong>Segundo Turno:</strong> ${horario.segundoHorarioInicioString || "-"} - ${horario.segundoHorarioFinString || "-"}</p>`
                            : `<p class="mb-1 fs-7"><strong>Horario:</strong> ${horario.horarioInicioString || "-"} - ${horario.horarioFinString || "-"}</p>`
                        }
                    </div>
                    <div class="d-flex justify-content-center gap-1 flex-wrap mt-2">
                        ${dias.map(d => `
                            <span class="badge rounded-pill px-2 py-1 fs-7" 
                                  style="background-color: ${d.activo ? '#d1f7d1' : '#f0f0f0'}; 
                                         color: ${d.activo ? '#0a8c0a' : '#999'};">
                                ${d.dia}
                            </span>`).join("")}
                    </div>
                </div>
            </div>
        </div>
    `;

    const cardResumen = `
        <div class="col-12 col-lg-4 d-flex">
            <div class="card shadow-sm rounded-3 flex-fill p-0" style="border-bottom: 3px solid #1a73e8;">
                <div class="d-flex flex-column justify-content-between h-100 w-100">
                    <h5 class="fw-bold fs-6 text-center py-2">Resumen de Puntualidad</h5>
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                        <canvas id="chartPuntualidad" style="width: 100%; height: 100%; display: block;"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    const cardHistorial = `
    <div class="col-12 col-lg-8">
        <div class="card shadow-sm rounded-3 flex-fill p-3" style="border-bottom: 3px solid #34a853;">
            <h5 class="fw-bold mb-2 fs-6">Historial Reciente de Asistencia</h5>
            <div class="d-flex flex-column gap-2">
                ${historial.map(h => {
                    const estadoBadge = EstadoAsistenciaBadge[h.estadoString?.toUpperCase()] || { clase: "bg-secondary text-white fw-bold fs-7" };
                    return `
                    <div class="d-flex flex-wrap justify-content-between align-items-center p-2 border rounded-2 shadow-sm" style="font-size: 0.85rem;">
                        <div class="flex-fill mb-1 mb-md-0"><strong>Fecha:</strong> ${h.fechaString || "-"}</div>
                        <div class="flex-fill mb-1 mb-md-0"><strong>Estado:</strong> <span class="badge ${estadoBadge.clase}" style="font-size:0.8rem !important;">${h.estadoString || "-"}</span></div>
                        <div class="flex-fill mb-1 mb-md-0"><strong>E1:</strong> ${h.primerEntradaString || "-"}</div>
                        <div class="flex-fill mb-1 mb-md-0"><strong>S1:</strong> ${h.primerSalidaString || "-"}</div>
                        ${horario.tipoHorarioString === "ALTERNO" ? `
                        <div class="flex-fill mb-1 mb-md-0"><strong>E2:</strong> ${h.segundaEntradaString || "-"}</div>
                        <div class="flex-fill mb-1 mb-md-0"><strong>S2:</strong> ${h.segundaSalidaString || "-"}</div>
                        ` : ""}
                    </div>
                    `;
                }).join("")}
            </div>
        </div>
    </div>
    `;

    contenedor.append(`
        <div class="row g-3 align-items-stretch">
            ${cardAsistencia}
            ${cardHorario}
            ${cardResumen}
            ${cardHistorial}
        </div>
    `);

    const ctx = document.getElementById('chartPuntualidad').getContext('2d');
    const labels = resumenSemanal.map(r => r.estado);
    const valores = resumenSemanal.map(r => r.cantidad);
    const colores = labels.map(l => {
        if(l === "COMPLETA") return "#198754";
        if(l === "TARDE" || l === "INCOMPLETA") return "#ffc107";
        if(l === "AUSENTE") return "#dc3545";
        return "#6c757d";
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: colores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 12 } } },
                tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}` } }
            }
        }
    });
}


//////////////////////////////////////////////////////////////////////////////////////
/// INICIALIZAR AL CARGAR LA VISTA /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
ObtenerAsistenciaHorario();
