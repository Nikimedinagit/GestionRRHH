////////////////////////////////////////////////////////////////////////////////////////
/// FUNCIONES PARA CARGAR NOTIFICACIONES /////////////////////////////////////////////

async function CargarNotificaciones(mostrarSpinner = true) {

  if (mostrarSpinner) mostrarPantallaCarga();

  try {
    const response = await authFetch("Notificaciones/PorRol", {
      method: "GET",
    });
    const notificaciones = await response.json();

    const lista = document.getElementById("listaNotificaciones");
    const vista = document.getElementById("vistaNotificaciones");

    if (lista) lista.innerHTML = "";
    if (vista) vista.innerHTML = "";

    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    const notisMostrar = notificaciones.filter((n) => {
      const fecha = new Date(n.fechaCreacion);
      return (
        fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual
      );
    });

    const btnMarcar = document.getElementById("marcarTodas");
    if (notisMostrar.length === 0) {
        if (btnMarcar) btnMarcar.style.display = "none";
      if (vista) {
        vista.innerHTML = `
          <div class="text-center text-muted py-3">
            No hay notificaciones para mostrar.
          </div>`;
      }
      if (lista) {
        lista.innerHTML = `
          <div class="text-center text-muted py-3">
            No hay notificaciones para mostrar.
          </div>`;
      }
      return;
    }
    if (btnMarcar) btnMarcar.style.display = "inline-flex";

    notisMostrar.forEach((n) => {
      const item = document.createElement("a");
      item.className = "list-group-item list-group-item-action py-2";

      const badgeStyle = n.leida
        ? "background-color:#e9ecef; color:#6c757d; font-size:0.75rem; padding:2px 6px; border-radius:12px;"
        : "background-color:#d4edda; color:#155724; font-size:0.75rem; padding:2px 6px; border-radius:12px;";

      item.innerHTML = `
        <div class="d-flex">
          <div class="flex-shrink-0">
            <i class="ti ti-bell ${
              n.leida ? "text-secondary" : "text-primary"
            }"></i>
          </div>
          <div class="flex-grow-1 ms-2">
            <div class="d-flex justify-content-between">
              <strong class="text-body" style="font-size: 0.85rem;">${
                n.titulo
              }</strong>
              <small class="text-muted" style="font-size: 0.7rem;">
                ${new Date(n.fechaCreacion).toLocaleString("es-AR", {
                  hour12: false,
                })}
              </small>
            </div>
            <small class="text-muted" style="font-size: 0.75rem;">${
              n.mensaje
            }</small>
            <div class="d-flex justify-content-end">
              <span style="${badgeStyle}">
                ${n.leida ? "Leído" : "No leído"}
              </span>
            </div>
          </div>
        </div>
      `;

      item.addEventListener("click", () => MarcarComoLeida(n.id));
      if (lista) lista.appendChild(item);
      if (vista) {
          const clon = item.cloneNode(true);
          clon.addEventListener("dblclick", () => MarcarComoLeida(n.id));
          vista.appendChild(clon);
      }
    });

    document.getElementById("badgeNotificaciones").textContent =
      notificaciones.filter((n) => !n.leida).length;
  } catch (error) {
    MostrarErrorCatch(error);
  }

  finally { if (mostrarSpinner) { setTimeout(() => ocultarPantallaCarga(), 1200); } };
}

async function MarcarComoLeida(id) {
  try {
    const response = await authFetch(`Notificaciones/${id}/Leer`, {
      method: "PUT",
    });

    if (response.ok) {
      CargarNotificaciones(false);
    }
  } catch (error) {
    MostrarErrorCatch(error);
  }
}

async function MarcarTodasLeidas() {
  try {
    const response = await authFetch(`Notificaciones/LeerTodas`, {
      method: "PUT",
    });

    if (response.ok) {
      CargarNotificaciones(false);
    }
  } catch (error) {
    MostrarErrorCatch(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setInterval(() => CargarNotificaciones(false), 2000);
});

  CargarNotificaciones();
