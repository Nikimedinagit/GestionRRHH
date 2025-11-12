

const coloresPasteles = ["#A8DADC", "#F1FAEE", "#FFE5D9", "#FFCAD4", "#B5EAEA", "#FFEE93", "#CDB4DB"];

// =================================== Evolución de empleados ===================================
async function cargarEvolucionEmpleados() {
    const res = await authFetch('Resultados/EvolucionEmpleados');
    const data = await res.json();

    const meses = data.map(x => x.mes);
    const cantidad = data.map(x => x.cantidad);

    new Chart(document.getElementById("graficoEvolucionEmpleados"), {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Empleados Activos',
                data: cantidad,
                backgroundColor: "rgba(168, 218, 220, 0.3)",
                borderColor: "#A8DADC",
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: "#1D3557"
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
           scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    precision: 0
                }
            }
        }
        }
    });
}

// =================================== Asistencia mensual ===================================
async function cargarAsistenciaMensual() {
    const res = await authFetch('Resultados/AsistenciaMensual');
    const data = await res.json();

    const meses = data.map(x => x.mes);
    const asistencias = data.map(x => x.asistenciasCompletas);
    const ausencias = data.map(x => x.ausencias);

    new Chart(document.getElementById("graficoAsistenciaMensual"), {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [
                { label: 'Asistencias Completas', data: asistencias, backgroundColor: "rgba(168, 218, 220, 0.7)" },
                { label: 'Ausencias', data: ausencias, backgroundColor: "rgba(255, 202, 212, 0.7)" }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    precision: 0
                }
            }
        }
        }
    });
}

// =================================== Ausencias por motivo ===================================
async function cargarJustificacionesPorDia() {
    const res = await authFetch('Resultados/JustificacionPorDia');
    const data = await res.json();

    const dias = data.map(x => x.diaSemana); 

    const justificaciones = data.map(x => x.totalJustificaciones);
    const aprobadas = data.map(x => x.totalAprobadas);
    const rechazadas = data.map(x => x.totalRechazadas);

    const canvas = document.getElementById("graficoJustificacionesPorDia");
    if (!canvas) return;

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: dias,
            datasets: [
                {
                    label: 'Aprobadas',
                    data: aprobadas,
                    backgroundColor: coloresPasteles[1]
                },
                 {
                    label: 'Justificaciones',
                    data: justificaciones,
                    backgroundColor: coloresPasteles[0]
                },
                {
                    label: 'Rechazadas',
                    data: rechazadas,
                    backgroundColor: coloresPasteles[2]
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Comparativa Diaria de Justificaciones' }
            },
            
            scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    precision: 0
                }
            },
                x: { stacked: false },

        }
        }
    });
}


cargarEvolucionEmpleados();
cargarAsistenciaMensual();
cargarJustificacionesPorDia();



