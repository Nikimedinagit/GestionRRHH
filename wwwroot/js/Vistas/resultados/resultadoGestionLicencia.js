// ===================================== Detecta si está en móvil ==================
function esMobile() {
    return window.innerWidth < 767;
}


//============ Guarda instancias de los gráficos para poder destruirlos =========================
var chartLicencia = null;


// ===================================== Grafico Licencia mensual ===================================
async function cargarLicenciasMensuales() {
    const res = await authFetch('Resultados/LicenciasMensualesGrafico6Meses');
    const data = await res.json();

     if (!data || data.length === 0) {
        $('#contenedorLicenciasMensuales').html(`
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

    $('#contenedorLicenciasMensuales').html('<canvas id="graficoLicenciasMensual"></canvas>');

    const formatter = new Intl.DateTimeFormat('es-AR', { month: 'short' });
    const meses = data.map(x => {
        const fecha = new Date(2025, x.mes - 1, 1);
        let mesNombre = formatter.format(fecha);
        return mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1);
    });

    //const meses = data.map(x => x.mes);
    const totalLicencias = data.map(x => x.totalLicencias);
    const totalAprobadas = data.map(x => x.totalAprobadas);
    const totalRechazadas = data.map(x => x.totalRechazadas);

    if (chartLicencia) chartLicencia.destroy();

    chartLicencia = new Chart(document.getElementById("graficoLicenciasMensual"), {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [
                { label: 'Licencias Aprobadas', data: totalAprobadas, backgroundColor: "rgba(168, 218, 220, 0.7)" },
                { label: 'Licencias Totales', data: totalLicencias, backgroundColor: "rgba(255, 219, 172, 0.7)" },
                { label: 'Licencias Rechazadas', data: totalRechazadas, backgroundColor: "rgba(255, 183, 178, 0.7)" }
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

// ===================================== Inicialziar Los Graficos ====================
async function cargarTodo() {
    await cargarLicenciasMensuales();
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