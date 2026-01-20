// ===================================== Detecta si está en móvil ==================
function esMobile() {
  return window.innerWidth < 767;
}

//============ Guarda instancias de los gráficos para poder destruirlos =========================
var chartCursosModalidad = null;
var chartAsistenciasCurso = null;
var chartCertificadosCurso = null;
var chartComparacionModalidad = null;
var chartRankingCursos = null;


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

// ===================================== Gráfico: Evolución de Asistencia y Participación en Capacitaciones ===================================
async function cargarCursosPorModalidad() {
  const res = await authFetch("Resultados/CursosPorModalidad");
  const data = await res.json();

  if (!data || data.length === 0) {
    $("#contenedorCursosPorModalidad").html(`
      <div style="display:flex;align-items:center;justify-content:center;color:#777;font-size:16px;font-family:'Segoe UI', Arial, sans-serif;text-align:center;">
        No hay resultados para mostrar.
      </div>
    `);
    return;
  }

  $("#contenedorCursosPorModalidad").html('<canvas id="graficoCursosPorModalidad"></canvas>');

  const modalidades = [
    { id: "PRESENCIAL", nombre: "Presencial" },
    { id: "VIRTUAL", nombre: "Virtual" },
    { id: "MIXTO", nombre: "Mixto" }
  ];

  const datasets = modalidades.map((m, i) => {
    const curso = data.find(d => d.modalidad === m.id);
    const cantidad = curso ? curso.cantidad : 0;

    return {
      label: `${m.nombre}`, 
      data: [cantidad],
      backgroundColor: coloresPastel[i],
      borderColor: coloresPastel[i].replace("0.7", "1"),
      borderWidth: 1,
      barPercentage: 0.7,
      categoryPercentage: 0.5
    };
  });

  const labels = [""]; 

  if (chartCursosModalidad) chartCursosModalidad.destroy();

  chartCursosModalidad = new Chart(
    document.getElementById("graficoCursosPorModalidad"),
    {
      type: "bar",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: esMobile() ? "y" : "x",
        scales: {
          x: { beginAtZero: true, ticks: { display: false } },
          y: { beginAtZero: true, ticks: { display: true } }
        },
        plugins: {
          legend: { position: "top" }
        }
      }
    }
  );
}


// ===================================== Gráfico: Asistencias e Inasistencias por Curso ===================================
async function cargarAsistenciasPorCurso() {
  const res = await authFetch("Resultados/AsistenciasPorCurso");
  const data = await res.json();

  if (!data || data.length === 0) {
    $("#contenedorAsistenciasPorCurso").html(`
      <div style="display:flex;align-items:center;justify-content:center;color:#777;font-size:16px;font-family:'Segoe UI', Arial, sans-serif;text-align:center;">
        No hay resultados para mostrar.
      </div>
    `);
    return;
  }

  $("#contenedorAsistenciasPorCurso").html('<canvas id="graficoAsistenciasPorCurso"></canvas>');

  const cursos = data.map(x => x.curso);
  const asistencias = data.map(x => x.asistencias);
  const inasistencias = data.map(x => x.inasistencias);

  if (chartAsistenciasCurso) chartAsistenciasCurso.destroy();

  chartAsistenciasCurso = new Chart(
    document.getElementById("graficoAsistenciasPorCurso"),
    {
      type: "bar",
      data: {
        labels: cursos,
        datasets: [
          {
            label: "Asistencias",
            data: asistencias,
            backgroundColor: "rgba(168, 218, 220, 0.7)",
            borderColor: "rgba(168, 218, 220, 0.7)",
            borderWidth: 1,
            barPercentage: 1,
            categoryPercentage: 0.5
          },
          {
            label: "Inasistencias",
            data: inasistencias,
            backgroundColor: "rgba(255, 183, 178, 0.7)",
            borderColor: "rgba(255, 183, 178, 0.7)",
            borderWidth: 1,
            barPercentage: 1,
            categoryPercentage: 0.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: esMobile() ? "y" : "x",
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0, display: false }
          },
          y: {
            ticks: { display: !esMobile() }
          }
        },
        plugins: {
          legend: { position: "top" }
        }
      }
    }
  );
}



// ===================================== Gráfico: Certificados por Curso ===================================
async function cargarCertificadosPorCurso() {
  const res = await authFetch("Resultados/CertificadosPorCurso");
  const data = await res.json();

  if (!data || data.length === 0) {
    $("#contenedorCertificadosPorCurso").html(`
      <div style="display:flex;align-items:center;justify-content:center;color:#777;font-size:16px;font-family:'Segoe UI', Arial, sans-serif;text-align:center;">
        No hay resultados para mostrar.
      </div>
    `);
    return;
  }

  $("#contenedorCertificadosPorCurso").html('<canvas id="graficoCertificadosPorCurso"></canvas>');

  const cursos = data.map(x => x.curso);
  const certificados = data.map(x => x.cantidadCertificados);

  if (chartCertificadosCurso) chartCertificadosCurso.destroy();

  chartCertificadosCurso = new Chart(
    document.getElementById("graficoCertificadosPorCurso"),
    {
      type: "bar",
      data: {
        labels: cursos,
        datasets: [{
          label: "Certificados",
          data: certificados,
          backgroundColor: "rgba(186, 220, 88, 0.7)",
          borderColor: "rgba(186, 220, 88, 0.7)",
          borderWidth: 1,
          barPercentage: 0.5,
          categoryPercentage: 0.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: esMobile() ? "y" : "x",
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0, display: false }
          },
          y: {
            ticks: { display: !esMobile() }
          }
        },
        plugins: {
          legend: { position: "top" }
        }
      }
    }
  );
}



// ===================================== Gráfico: Comparaciones por Mdalidad ===================================
async function cargarComparacionPorModalidad() {
  const res = await authFetch("Resultados/ComparacionPorModalidad");
  const data = await res.json();

  if (!data || data.length === 0) {
    $("#contenedorComparacionPorModalidad").html(`
      <div style="display:flex;align-items:center;justify-content:center;color:#777;font-size:16px;font-family:'Segoe UI', Arial, sans-serif;text-align:center;">
        No hay resultados para mostrar.
      </div>
    `);
    return;
  }

  $("#contenedorComparacionPorModalidad").html('<canvas id="graficoComparacionPorModalidad"></canvas>');

  const modalidades = data.map(x => x.modalidad);
  const promedioAsistencia = data.map(x => x.promedioAsistencia.toFixed(1));
  const promedioResultado = data.map(x => x.promedioResultado.toFixed(1));

  if (chartComparacionModalidad) chartComparacionModalidad.destroy();

  chartComparacionModalidad = new Chart(
    document.getElementById("graficoComparacionPorModalidad"),
    {
      type: "bar",
      data: {
        labels: modalidades,
        datasets: [
          {
            label: "Promedio Asistencia",
            data: promedioAsistencia,
            backgroundColor: "rgba(168, 218, 220, 0.7)",
            borderColor: "rgba(168, 218, 220, 0.7)",
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.5
          },
          {
            label: "Promedio Resultado",
            data: promedioResultado,
            backgroundColor: "rgba(255, 183, 178, 0.7)",
            borderColor: "rgba(255, 183, 178, 0.7)",
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: esMobile() ? "y" : "x",
        scales: {
          x: {
            beginAtZero: true,
            ticks: { precision: 0, display: false }
          },
          y: {
            ticks: { display: !esMobile() }
          }
        },
        plugins: {
          legend: { position: "top" }
        }
      }
    }
  );
}



// ===================================== Gráfico: Ranking de Cursos por Asistentes ===================================
async function cargarRankingCursos() {
  const res = await authFetch("Resultados/RankingCursos");
  const data = await res.json();

  if (!data || data.length === 0) {
    $("#contenedorRankingCursos").html(`
      <div style="display:flex;align-items:center;justify-content:center;color:#777;font-size:16px;font-family:'Segoe UI', Arial, sans-serif;text-align:center;">
        No hay resultados para mostrar.
      </div>
    `);
    return;
  }

  $("#contenedorRankingCursos").html('<canvas id="graficoRankingCursos"></canvas>');

  const cursos = data.map(x => x.curso);
  const asistentes = data.map(x => x.cantidadAsistentes);

  if (chartRankingCursos) chartRankingCursos.destroy();

  chartRankingCursos = new Chart(
    document.getElementById("graficoRankingCursos"),
    {
      type: "bar",
      data: {
        labels: cursos,
        datasets: [{
          label: "Cantidad de Asistentes",
          data: asistentes,
          backgroundColor: "rgba(168, 218, 220, 0.7)",
          borderColor: "rgba(168, 218, 220, 0.7)",
          borderWidth: 1,
          barPercentage: 0.5,
          categoryPercentage: 0.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: esMobile() ? "y" : "x",
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0, display: false }
          },
          y: {
            ticks: { display: !esMobile() }
          }
        },
        plugins: {
          legend: { position: "top" }
        }
      }
    }
  );
}



// ===================================== Inicialziar Los Graficos ====================
async function cargarTodo(mostrarSpinner = true) {

  if(mostrarSpinner) mostrarPantallaCarga();

  try {
    await cargarCursosPorModalidad();
    await cargarAsistenciasPorCurso();
    await cargarCertificadosPorCurso();
    await cargarComparacionPorModalidad();
    await cargarRankingCursos();
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
