// ===================================== Detecta si está en móvil ==================
function esMobile() {
  return window.innerWidth < 767;
}

//============ Guarda instancias de los gráficos para poder destruirlos =========================
var chartLicencia = null;
var charTipoLicencias = null;
var charLicenciasXSector = null;
var charLicenciasXPuesto = null;

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
  "rgba(178, 255, 218, 0.7)",
];

// ===================================== Grafico Licencia mensual ===================================
async function cargarLicenciasMensuales() {
  const res = await authFetch("Resultados/LicenciasMensualesGrafico6Meses");
  const data = await res.json();

  if (!data || data.length === 0) {
    $("#contenedorLicenciasMensuales").html(`
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

  $("#contenedorLicenciasMensuales").html(
    '<canvas id="graficoLicenciasMensual"></canvas>'
  );

  const formatter = new Intl.DateTimeFormat("es-AR", { month: "short" });
  const meses = data.map((x) => {
    const fecha = new Date(2025, x.mes - 1, 1);
    let mesNombre = formatter.format(fecha);
    return mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1);
  });

  const totalLicencias = data.map((x) => x.totalLicencias);
  const totalAprobadas = data.map((x) => x.totalAprobadas);
  const totalRechazadas = data.map((x) => x.totalRechazadas);

  if (chartLicencia) chartLicencia.destroy();

  chartLicencia = new Chart(
    document.getElementById("graficoLicenciasMensual"),
    {
      type: "bar",
      data: {
        labels: meses,
        datasets: [
          {
            label: "Licencias Aprobadas",
            data: totalAprobadas,
            backgroundColor: "rgba(168, 218, 220, 0.7)",
          },
          {
            label: "Licencias Totales",
            data: totalLicencias,
            backgroundColor: "rgba(255, 219, 172, 0.7)",
          },
          {
            label: "Licencias Rechazadas",
            data: totalRechazadas,
            backgroundColor: "rgba(255, 183, 178, 0.7)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: esMobile() ? "y" : "x",
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0 },
          },
        },
      },
    }
  );
}

// ===================================== Gráfico Licencias Por Tipo(Torta) =========================
async function cargarLicenciasPorTipo() {
  const res = await authFetch("Resultados/LicenciasPorTipo");
  const data = await res.json();

  if (!data || data.length === 0) {
    $("#contenedorTortaTipos").html(`
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

  $("#contenedorTortaTipos").html('<canvas id="graficoTortaTipos"></canvas>');

  const labels = data.map((x) => x.tipo);
  const valores = data.map((x) => x.totalLicencias);
  const promedios = data.map((x) => x.promedioDias.toFixed(1));

  if (charTipoLicencias) charTipoLicencias.destroy();

  charTipoLicencias = new Chart(document.getElementById("graficoTortaTipos"), {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Licencias por Tipo",
          data: valores,
          backgroundColor: coloresPastel,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const i = ctx.dataIndex;
              return [
                `Tipo: ${labels[i]}`,
                `Cantidad: ${valores[i]} licencias`,
                `Promedio: ${promedios[i]} días`,
              ];
            },
          },
        },
      },
    },
  });
}

// ===================================== Gráfico de Licencias por Sector =========================
async function cargarLicenciasPorSector() {
  const res = await authFetch("Resultados/LicenciasPorSector");
  if (!res.ok) {
    console.error("Error HTTP:", res.status);
    return;
  }
  const data = await res.json();

  if (!data || data.length === 0) {
    $("#contenedorTortaLicenciasSector").html(`
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

  $("#contenedorTortaLicenciasSector").html(
    '<canvas id="graficoTortaLicenciaSector"></canvas>'
  );

  const labels = data.map((x) => x.sector);
  const valores = data.map((x) => x.totalLicencias);
  const promedios = data.map((x) => x.promedioDias.toFixed(1));

  if (charLicenciasXSector) charLicenciasXSector.destroy();

  charLicenciasXSector = new Chart(
    document.getElementById("graficoTortaLicenciaSector"),
    {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Licencias por Sector",
            data: valores,
            backgroundColor: coloresPastel,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const i = ctx.dataIndex;
                return [
                  `Sector: ${labels[i]}`,
                  `Licencias: ${valores[i]}`,
                  `Promedio: ${promedios[i]} días`
                ];
              },
            },
          },
        },
      },
    }
  );
}

// ===================================== Gráfico de Licencias por Puesto =========================
async function cargarLicenciasPorPuesto() {
  const res = await authFetch("Resultados/LicenciasPorPuesto");
  if (!res.ok) {
    console.error("Error HTTP:", res.status);
    return;
  }
  const data = await res.json();

  if (!data || data.length === 0) {
    $("#contenedorTortaLicenciasPuesto").html(`
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

  $("#contenedorTortaLicenciasPuesto").html(
    '<canvas id="graficoTortaLicenciaPuesto"></canvas>'
  );

  const labels = data.map((x) => x.puesto);
  const valores = data.map((x) => x.totalLicencias);
  const promedios = data.map((x) => x.promedioDias.toFixed(1));

  if (charLicenciasXPuesto) charLicenciasXPuesto.destroy();

  charLicenciasXPuesto = new Chart(
    document.getElementById("graficoTortaLicenciaPuesto"),
    {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Licencias por Puesto",
            data: valores,
            backgroundColor: coloresPastel,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const i = ctx.dataIndex;
                return [
                  `Puesto: ${labels[i]}`,
                  `Licencias: ${valores[i]}`,
                  `Promedio: ${promedios[i]} días`
                ];
              },
            },
          },
        },
      },
    }
  );
}

// ===================================== Inicialziar Los Graficos ====================
async function cargarTodo(mostrarSpinner = true) {
  if (mostrarSpinner) mostrarPantallaCarga();
  try {
    await cargarLicenciasMensuales();
    await cargarLicenciasPorTipo();
    await cargarLicenciasPorSector();
    await cargarLicenciasPorPuesto();
  }
  finally { if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1200); } };
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