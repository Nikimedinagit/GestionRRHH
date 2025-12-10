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

    const badgeBaseStyle = `
        display:inline-block;
        padding:0.35em 0.65em;
        font-size:0.72rem;
        font-weight:600;
        border-radius:0.25rem;
        line-height:1.2;
        text-align:center;
        white-space:nowrap;
    `;

    const contenedor = $("#contenedorAsistenciaHorario");
    contenedor.empty();

    const asistencia = data.asistenciaHoy || {};
    const horario = data.horario || {};
    const resumenSemanal = data.resumenSemanal || [];
    const historial = data.historialReciente || [];

    const EstadoAsistenciaEstilo = {
        COMPLETA: { backgroundColor: "#a3dc9a72", color: "#06923E" },
        INCOMPLETA: { backgroundColor: "#fff3cd", color: "#856404" },
        AUSENTE: { backgroundColor: "#f8d7da", color: "#c62828" },
        TARDE: { backgroundColor: "#ffe5d0", color: "#d35400" },
        "FUERA DE HORARIO": { backgroundColor: "#e2e3e5", color: "#495057" }
    };

    const estado = (asistencia.estadoString || "SIN REGISTRO").toUpperCase();
    const estiloEstado = EstadoAsistenciaEstilo[estado] || { backgroundColor: "#e2e3e5", color: "#495057" };

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
            <div class="card shadow-sm rounded-3 flex-fill p-3" style="border-bottom: 3px solid ${estiloEstado.color};">
                <h5 class="fw-bold mb-2 fs-6">Asistencia de Hoy</h5>
                <div class="d-flex align-items-center mb-2 flex-wrap">
                    <img src="${asistencia.fotoRuta || "./img/avatarAusente.png"}" alt="Foto" class="rounded-circle me-3 mb-2" style="width: 80px; height: 80px; object-fit: cover;">
                    <div>
                        <h5 class="mb-2 fw-bold fs-6">${data.empleado || "Sin Registro"}</h5>
                        <span style="${badgeBaseStyle} background-color:${estiloEstado.backgroundColor}; color:${estiloEstado.color};">
                            ${estado}
                        </span>
                        <p class="mb-0 mt-2 text-muted fs-7">${asistencia.fechaString || "00/00/0000"}</p>
                    </div>
                </div>
                ${generarTurnos()}
            </div>
        </div>
    `;

    const cardHorario = `
        <div class="col-12 col-md-6 d-flex">
            <div class="card shadow-sm rounded-3 flex-fill p-3" style="border-bottom: 3px solid ${horario.tipoHorarioString === "ALTERNO" ? "#1a4a8a" : "#0a8c0a"};">
                <h5 class="fw-bold mb-2 fs-6">Horario</h5>
                <div class="d-flex flex-column justify-content-between h-100">
                    <div class="d-flex flex-column align-items-center text-center">
                        <h5 class="fw-bold mb-2 fs-6">${data.empleado || "Empleado"}</h5>

                        <span class="mb-2" style="${badgeBaseStyle}
                                      background-color:${horario.tipoHorarioString === "ALTERNO" ? "#d0e3ff" : "#d1f7d1"};
                                      color:${horario.tipoHorarioString === "ALTERNO" ? "#1a4a8a" : "#0a8c0a"};">
                            ${horario.tipoHorarioString || "SIN HORARIO"}
                        </span>

                        ${horario.tipoHorarioString === "ALTERNO"
            ? `<p class="mb-1 fs-7"><strong>Primer Turno:</strong> ${horario.horarioInicioString || "-"} - ${horario.horarioFinString || "-"}</p>
                               <p class="mb-1 fs-7"><strong>Segundo Turno:</strong> ${horario.segundoHorarioInicioString || "-"} - ${horario.segundoHorarioFinString || "-"}</p>`
            : `<p class="mb-1 fs-7"><strong>Horario:</strong> ${horario.horarioInicioString || "-"} - ${horario.horarioFinString || "-"}</p>`
        }
                    </div>

                    <div class="d-flex justify-content-center gap-1 flex-wrap mt-1">
                        ${dias.map(d => `
                            <span style="${badgeBaseStyle}
                                         background-color: ${d.activo ? '#d1f7d1' : '#f0f0f0'};
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
        const estadoBadge = EstadoAsistenciaEstilo[h.estadoString?.toUpperCase()] || { backgroundColor: "#e2e3e5", color: "#495057" };
        return `
                        <div class="d-flex flex-wrap justify-content-between align-items-center p-2 border rounded-2 shadow-sm" style="font-size: 0.85rem;">
                            <div class="flex-fill mb-1 mb-md-0"><strong>Fecha:</strong> ${h.fechaString || "-"}</div>
                            <div class="flex-fill mb-1 mb-md-0">
                                <strong>Estado:</strong> 
                                <span style="${badgeBaseStyle} background-color:${estadoBadge.backgroundColor}; color:${estadoBadge.color};">
                                    ${h.estadoString || "-"}
                                </span>
                            </div>
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

    if (!resumenSemanal || resumenSemanal.length === 0) {
        document.getElementById("chartPuntualidad").parentElement.innerHTML = `
        <p class="text-center text-muted mb-0">Sin datos.</p>
    `;
        return;
    }


    const ctx = document.getElementById('chartPuntualidad').getContext('2d');
    const labels = resumenSemanal.map(r => r.estado);
    const valores = resumenSemanal.map(r => r.cantidad);
    const colores = labels.map(l => {
        const e = EstadoAsistenciaEstilo[l];
        return e ? e.backgroundColor : "#e2e3e5";
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
