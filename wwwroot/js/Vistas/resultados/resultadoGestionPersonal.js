
// ===================================== Detecta si está en móvil ==================
function esMobile() {
    return window.innerWidth < 767;
}


//============ Guarda instancias de los gráficos para poder destruirlos =========================
var chartEvolucion = null;
var chartAsistencia = null;
var chartJustificaciones = null;



// ===================================== Grafico Evolucion Del Personal ========================
async function cargarEvolucionPersonal() {
    const res = await authFetch('Resultados/EvolucionPersonal');
    const data = await res.json();

        if (!data || data.length === 0) {
        $('#contenedorEvolucionPersonal').html(`
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                color: #777;
                font-size: 16px;
                font-family: 'Segoe UI', Arial, sans-serif;
                text-align: center;
            ">
                No hay resultados para mostrar.
            </div>
        `);
        return;
    }

    $('#contenedorEvolucionPersonal').html('<canvas id="graficoEvolucionPersonal"></canvas>');

    const meses = data.map(x => x.mes);
    const cantidad = data.map(x => x.cantidad);

    if (chartEvolucion) chartEvolucion.destroy();

    chartEvolucion = new Chart(document.getElementById("graficoEvolucionPersonal"), {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Personal Activo',
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
            maintainAspectRatio: false,
        }
    });
}


// ===================================== Grafico Asistencia mensual ===================================
async function cargarAsistenciaMensual() {
    const res = await authFetch('Resultados/AsistenciaMensual');
    const data = await res.json();

     if (!data || data.length === 0) {
        $('#contenedorAsistenciaMensual').html(`
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                color: #777;
                font-size: 16px;
                font-family: 'Segoe UI', Arial, sans-serif;
                text-align: center;
            ">
                No hay resultados para mostrar.
            </div>
        `);
        return;
    }

    $('#contenedorAsistenciaMensual').html('<canvas id="graficoAsistenciaMensual"></canvas>');

    const meses = data.map(x => x.mes);
    const asistencias = data.map(x => x.asistenciasCompletas);
    const ausencias = data.map(x => x.ausencias);

    if (chartAsistencia) chartAsistencia.destroy();

    chartAsistencia = new Chart(document.getElementById("graficoAsistenciaMensual"), {
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
            maintainAspectRatio: false,
            indexAxis: esMobile() ? 'y' : 'x',
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, precision: 0 }
                }
            }
        }
    });
}



// ===================================== Grafico Justificacion Por Dia ======================
async function cargarJustificacionesPorDia() {
    const res = await authFetch('Resultados/JustificacionPorDia');
    const data = await res.json();

    if (!data || data.length === 0) {
        $('#contenedorJustificacionesPorDia').html(`
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                color: #777;
                font-size: 16px;
                font-family: 'Segoe UI', Arial, sans-serif;
                text-align: center;
            ">
                No hay resultados para mostrar.
            </div>
        `);
        return;
    }

    $('#contenedorJustificacionesPorDia').html('<canvas id="graficoJustificacionesPorDia"></canvas>');


    const dias = data.map(x => x.diaSemana);
    const justificaciones = data.map(x => x.totalJustificaciones);
    const aprobadas = data.map(x => x.totalAprobadas);
    const rechazadas = data.map(x => x.totalRechazadas);

    const colores = ["#A8DADC", "#F1FAEE", "#FFE5D9"];

    if (chartJustificaciones) chartJustificaciones.destroy();

    chartJustificaciones = new Chart(document.getElementById("graficoJustificacionesPorDia"), {
        type: 'bar',
        data: {
            labels: dias,
            datasets: [
                { label: 'Aprobadas', data: aprobadas, backgroundColor: colores[1] },
                { label: 'Justificaciones', data: justificaciones, backgroundColor: colores[0] },
                { label: 'Rechazadas', data: rechazadas, backgroundColor: colores[2] }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: esMobile() ? 'y' : 'x',
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}


// ===================================== Inicialziar Los Graficos ====================
async function cargarTodo() {
    await cargarEvolucionPersonal();
    await cargarAsistenciaMensual();
    await cargarJustificacionesPorDia();
}

cargarTodo();



// ===================================== Redibujar Si Cambia El Tamaño de la Pantalla ================
var timeoutResize;
window.addEventListener("resize", () => {
    clearTimeout(timeoutResize);
    timeoutResize = setTimeout(() => {
        cargarTodo(); 
    }, 300);
});



// ===================================== Mostrar Listados  Por Rol  ==========
function MostrarOpcionesResultadosPorRol() {
  const rol = getRol()?.toUpperCase();
  if (!rol) return;

  if (rol === "SUPERVISOR") {
    $("#resultadoJustificacionPorSector, #resultadoEmpleadosPorSector, #resultadoAsistenciaPorSector").addClass("d-none");

  }
}

MostrarOpcionesResultadosPorRol();