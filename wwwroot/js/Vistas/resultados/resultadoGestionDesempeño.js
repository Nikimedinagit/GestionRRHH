// ===================================== Detecta si está en móvil ==================
function esMobile() {
    return window.innerWidth < 767;
}



//============ Guarda instancias de los gráficos para poder destruirlos =========================
var chartDesempeno = null;
var chartDistribucion = null;
var chartMejores = null;
var chartPeores = null;
var chartEvolucionDesempeno = null;



// ===================================== Colores pastel reutilizables ==================
var coloresPastel = [
    "rgba(168, 218, 220, 0.7)",
    "rgba(255, 183, 178, 0.7)",
    "rgba(255, 219, 172, 0.7)",
    "rgba(186, 220, 88, 0.7)",
    "rgba(255, 205, 178, 0.7)",
    "rgba(199, 206, 234, 0.7)",
    "rgba(160, 216, 239, 0.7)",
    "rgba(255, 198, 255, 0.7)",
    "rgba(255, 236, 179, 0.7)",
    "rgba(178, 255, 218, 0.7)"
];


function manejarSinDatos(data, canvasId, messageId) {
    const canvas = document.getElementById(canvasId);
    const msg = document.getElementById(messageId);

    if (!data || data.length === 0) {
        canvas.style.display = "none";
        msg.style.display = "block";
        return true; 
    } else {
        canvas.style.display = "block";
        msg.style.display = "none";
        return false;
    }
}




// ===================================== Gráfico Desempeño Por Puesto =========================
async function cargarDesempenoPorPuesto() {
    const res = await authFetch('Resultados/DesempenoPorPuesto');
    const data = await res.json();

    if (!data || data.length === 0) {
        $('#contenedorDesempenoPorPuesto').html(`
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

    $('#contenedorDesempenoPorPuesto').html('<canvas id="graficoDesempenoPorPuesto"></canvas>');

    const meses = data.map(x => {
        const mes = x.mes.toLowerCase();
        return mes.charAt(0).toUpperCase() + mes.slice(1);
    });

    const promedios = data.map(x => x.promedioCalificacion);
    const labels = data.map(x =>
        `${x.puesto}\nProm: ${x.promedioCalificacion}\nCant: ${x.cantidadEvaluaciones}`
    );

    if (chartDesempeno) chartDesempeno.destroy();

    chartDesempeno = new Chart(document.getElementById("graficoDesempenoPorPuesto"), {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [{
                label: 'Sector',
                data: promedios,
                backgroundColor: "rgba(168, 218, 220, 0.7)",
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        color: "#333",
                        font: { size: 12 },
                        generateLabels: function () {
                            return [{
                                text: "Sector",
                                fillStyle: "rgba(168, 218, 220, 0.7)"
                            }];
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return labels[context.dataIndex];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, precision: 0 }
                }
            }
        }
    });
}



// ===================================== Gráfico Distribución de Calificaciones (Torta) =========================
async function cargarDistribucionCalificaciones() {
    const res = await authFetch('Resultados/DistribucionCalificaciones');
    const data = await res.json();

     if (!data || data.length === 0) {
        $('#contenedorTortaDistribucion').html(`
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

    $('#contenedorTortaDistribucion').html('<canvas id="graficoTortaDistribucion"></canvas>');

    const labels = data.map(x => String(x.calificacion));
    const valores = data.map(x => x.cantidad);

    if (chartDistribucion) chartDistribucion.destroy();

    chartDistribucion = new Chart(document.getElementById("graficoTortaDistribucion"), {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: "Calificaciones",
                data: valores,
                backgroundColor: coloresPastel
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: ctx =>
                            `Calificación: ${ctx.label}\nCantidad: ${ctx.raw}`
                    }
                }
            }
        }
    });
}



// ===================================== Gráfico Mejores Criterios (Torta) =========================
async function cargarMejoresCriterios() {
    const res = await authFetch('Resultados/MejoresCriterios');
    const data = await res.json();

     if (!data || data.length === 0) {
        $('#contenedorTortaCriteriosBuenos').html(`
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

    $('#contenedorTortaCriteriosBuenos').html('<canvas id="graficoTortaCriteriosBuenos"></canvas>');

    const labels = data.map(x => x.criterio);
    const valores = data.map(x => Number(x.promedio.toFixed(1)));

    if (chartMejores) chartMejores.destroy();

    chartMejores = new Chart(document.getElementById("graficoTortaCriteriosBuenos"), {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: "Criterios Buenos",
                data: valores,
                backgroundColor: coloresPastel
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: ctx =>
                            `Criterio: ${ctx.label}\nPromedio: ${ctx.raw}`
                    }
                }
            }
        }
    });
}



// ===================================== Gráfico Peores Criterios (Torta) =========================
async function cargarPeoresCriterios() {
    const res = await authFetch('Resultados/PeoresCriterios');
    const data = await res.json();

     if (!data || data.length === 0) {
        $('#contenedorCriteriosMalos').html(`
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

    $('#contenedorCriteriosMalos').html('<canvas id="graficoTortaCriteriosMalos"></canvas>');

    const labels = data.map(x => x.criterio);
    const valores = data.map(x => x.promedio.toFixed(1));

    if (chartPeores) chartPeores.destroy();

    chartPeores = new Chart(document.getElementById("graficoTortaCriteriosMalos"), {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: coloresPastel
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: ctx =>
                            `${ctx.label}: ${ctx.raw}`
                    }
                }
            }
        }
    });
}



// ===================================== Gráfico Evolución del Desempeño (Línea) =========================
async function cargarEvolucionDesempeno() {
    const res = await authFetch('Resultados/EvolucionDesempenoUltimos6Meses');
    const data = await res.json();

    if (!data || data.length === 0) {
        $('#contenedorEvolucionDesempeno').html(`
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

    $('#contenedorEvolucionDesempeno').html('<canvas id="graficoEvolucionDesempeno"></canvas>');

    const formatter = new Intl.DateTimeFormat('es-AR', { month: 'short' });

    const meses = data.map(x => {
        const fecha = new Date(2025, x.mes - 1, 1);
        let mesNombre = formatter.format(fecha);
        return mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1);
    });

    const promedios = data.map(x => Number(x.promedio.toFixed(1)));

    if (chartEvolucionDesempeno) chartEvolucionDesempeno.destroy();

    chartEvolucionDesempeno = new Chart(document.getElementById("graficoEvolucionDesempeno"), {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Promedio de Desempeño',
                data: promedios,
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
            maintainAspectRatio: false
        }
    });
}



// ===================================== Inicializar Todos los Gráficos ====================
async function cargarTodoDesempeno(mostrarSpinner = true) {

    if(mostrarSpinner) mostrarPantallaCarga();

    try{
    await cargarDesempenoPorPuesto();
    await cargarDistribucionCalificaciones();
    await cargarMejoresCriterios();
    await cargarPeoresCriterios();
    await cargarEvolucionDesempeno();
    }
    finally { if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1500); } };
}

cargarTodoDesempeno();



// ===================================== Redibujar al cambiar tamaño de pantalla ================
var timeoutResize;
window.addEventListener("resize", () => {
    clearTimeout(timeoutResize);
    timeoutResize = setTimeout(() => {
        cargarTodoDesempeno();
    }, 300);
});
