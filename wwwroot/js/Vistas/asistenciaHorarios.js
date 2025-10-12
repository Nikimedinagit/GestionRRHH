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


function MostrarAsistenciaHorario(data) {
    const contenedor = $("#contenedorAsistenciaHorario");
    contenedor.empty();

    const asistencia = data.asistencia || {};
    const horario = data.horario || {};

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
                <div class="d-flex justify-content-between mb-1">
                    <span><strong>Primera Entrada:</strong> ${asistencia.primerEntradaString || "Sin Registro"}</span>
                    <span><strong>Primera Salida:</strong> ${asistencia.primerSalidaString || "Sin Registro"}</span>
                </div>
                <div class="d-flex justify-content-between mb-1">
                    <span><strong>Segunda Entrada:</strong> ${asistencia.segundaEntradaString || "Sin Registro"}</span>
                    <span><strong>Segunda Salida:</strong> ${asistencia.segundaSalidaString || "Sin Registro"}</span>
                </div>
            `;
        } else {
            return `
                <div class="d-flex justify-content-between mb-1">
                    <span><strong>Entrada:</strong> ${asistencia.primerEntradaString || "Sin Registro"}</span>
                    <span><strong>Salida:</strong> ${asistencia.primerSalidaString || "Sin Registro"}</span>
                </div>
            `;
        }
    };

    const cardAsistencia = `
        <div class="col-12 col-lg-6 d-flex">
            <div class="card shadow-sm rounded-3 w-100 h-100" style="border-bottom: 3px solid ${bordeEstado};">
                <div class="d-flex align-items-center p-3">
                    <img src="${asistencia.fotoRuta || "No hay foto"}"
                         alt="Foto" class="rounded-circle me-3"
                         style="width: 80px; height: 80px; object-fit: cover;">
                    <div>
                        <h5 class="mb-1 fw-bold">${asistencia.empleadoString || "Sin Registro"}</h5>
                        <span class="badge ${claseEstado} px-2 py-1">${estado}</span>
                        <p class="mb-0 text-muted fs-7">${asistencia.fechaString || "Sin Registro"}</p>
                    </div>
                </div>
                <div class="px-3 pb-3">
                    ${generarTurnos()}
                </div>
            </div>
        </div>
    `;

    // Card de Horario
    const cardHorario = `
        <div class="col-12 col-lg-6 d-flex">
            <div class="card shadow-sm rounded-3 w-100 h-100" style="border-bottom: 3px solid ${bordeTipo};">
                <div class="p-3 text-center d-flex flex-column justify-content-between h-100">
                    <div>
                        <h5 class="fw-bold mb-1">${horario.empleadoString || "Empleado"}</h5>
                        <span class="badge ${tipoClase} px-2 py-1">${horario.tipoHorarioString || "SIN HORARIO"}</span>

                        ${
                            horario.tipoHorarioString === "ALTERNO"
                            ? `<p class="mb-1"><strong>Primer Turno:</strong> ${horario.horarioInicioString || "-"} - ${horario.horarioFinString || "-"}</p>
                               <p class="mb-1"><strong>Segundo Turno:</strong> ${horario.segundoHorarioInicioString || "-"} - ${horario.segundoHorarioFinString || "-"}</p>`
                            : `<p class="mb-1"><strong>Horario:</strong> ${horario.horarioInicioString || "-"} - ${horario.horarioFinString || "-"}</p>`
                        }
                    </div>

                    <div class="d-flex justify-content-center gap-1 flex-wrap mt-2">
                        ${dias.map(d => `
                            <span class="badge rounded-pill px-2 py-1" 
                                  style="background-color: ${d.activo ? '#d1f7d1' : '#f0f0f0'}; 
                                         color: ${d.activo ? '#0a8c0a' : '#999'}; 
                                         font-size: 0.8rem;">
                                ${d.dia}
                            </span>`).join("")}
                    </div>
                </div>
            </div>
        </div>
    `;

    contenedor.append(`
        <div class="row g-3 align-items-stretch">
            ${cardAsistencia}
            ${cardHorario}
        </div>
    `);
}


// Llamada inicial
ObtenerAsistenciaHorario();
