function EsRolConsultaMisTareas() {
  const rol = getRol()?.toUpperCase();
  return rol === "EMPLEADO" || rol === "SUPERVISOR";
}

function ConfigurarTituloMisTareas() {
  const rol = getRol()?.toUpperCase();

  if (rol === "SUPERVISOR") {
    $("#tituloMisTareas").text("Tareas del Equipo");
    $("#subtituloMisTareas").text("Consultá las responsabilidades y tareas asignadas al personal de tu sector.");
    return;
  }

  $("#tituloMisTareas").text("Mis Tareas");
  $("#subtituloMisTareas").text("Consultá tus responsabilidades y tareas asignadas.");
}

async function ObtenerMisResponsabilidadesTareas(mostrarSpinner = true) {
  if (!EsRolConsultaMisTareas()) return;
  if (mostrarSpinner) mostrarPantallaCarga();

  try {
    const filtro = {
      eliminado: 0,
    };

    const response = await authFetch("AsignacionResponsabilidadesTareas/Filtrar", {
      method: "POST",
      body: JSON.stringify(filtro),
    });

    const asignaciones = await response.json();
    MostrarMisResponsabilidadesTareas(asignaciones);
  } catch (error) {
    MostrarErrorCatch();
  } finally {
    if (mostrarSpinner) setTimeout(() => ocultarPantallaCarga(), 700);
  }
}

function MostrarMisResponsabilidadesTareas(asignaciones) {
  const contenedor = $("#contenedorMisTareas");
  contenedor.empty();
  window.misResponsabilidadesTareasData = asignaciones;

  if (!asignaciones.length) {
    contenedor.append(`
      <div class="col-12">
        <div class="bg-white shadow-sm rounded p-3 text-center text-muted">
          No hay responsabilidades ni tareas asignadas para mostrar.
        </div>
      </div>
    `);
    return;
  }

  asignaciones.forEach((item) => {
    const card = `
      <div class="col-12">
        <div class="card shadow-sm rounded position-relative w-100 card-mis-tareas">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
            <div style="min-width: 0;">
              <h5 class="fw-bold mb-1" style="font-size: 1.05rem; word-break: break-word;">${item.empleadoString || "Sin empleado asignado"}</h5>
              <p class="mb-0 text-muted d-flex align-items-center" style="font-size: 0.9rem;">
                <i class="bi bi-briefcase me-2" style="font-size: 0.95rem;"></i>
                <span>${item.puestoString || "Sin puesto"}</span>
              </p>
            </div>
              <span class="badge badge-empleado-activo" style="font-size: 0.65rem; font-weight: 700; padding: 0.2em 0.45em;" data-tippy-content="Activo">A</span>
          </div>

          <div class="mis-tareas-grid">
            <div class="mis-tareas-bloque mis-tareas-bloque-tareas">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge badge-asignacion-tarea">
                  <i class="bi bi-list-check me-1"></i>Tareas
                </span>
              </div>
              <div class="text-muted mb-0 contenido-mis-tareas">${SanitizarHtmlMisTareas(item.tareas) || "Sin tareas"}</div>
            </div>

            <div class="mis-tareas-bloque mis-tareas-bloque-responsabilidades">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge badge-asignacion-responsabilidad">
                  <i class="bi bi-person-check me-1"></i>Responsabilidades
                </span>
              </div>
              <div class="text-muted mb-0 contenido-mis-tareas">${SanitizarHtmlMisTareas(item.responsabilidades) || "Sin responsabilidades"}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    contenedor.append(card);
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    theme: "mi-tema",
    delay: [100, 0],
  });
}

function SanitizarHtmlMisTareas(html) {
  const contenedor = document.createElement("div");
  contenedor.innerHTML = html || "";
  const etiquetasPermitidas = ["B", "STRONG", "I", "EM", "U", "BR", "UL", "OL", "LI", "DIV", "P"];

  contenedor.querySelectorAll("*").forEach((elemento) => {
    if (!etiquetasPermitidas.includes(elemento.tagName)) {
      elemento.replaceWith(document.createTextNode(elemento.textContent || ""));
      return;
    }

    [...elemento.attributes].forEach((atributo) => elemento.removeAttribute(atributo.name));
  });

  return contenedor.innerHTML.trim();
}

function TextoPlanoMisTareas(html) {
  const contenedor = document.createElement("div");
  contenedor.innerHTML = SanitizarHtmlMisTareas(html);
  return (contenedor.textContent || "").trim();
}

ConfigurarTituloMisTareas();
ObtenerMisResponsabilidadesTareas();
