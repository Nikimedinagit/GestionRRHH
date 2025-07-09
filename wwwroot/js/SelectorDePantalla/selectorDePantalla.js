document.addEventListener("DOMContentLoaded", () => {
  
  // Cargar la vista correspondiente al hash actual (o por defecto)
  CargarVistaPorHash();
});

function CargarVista(view) {
  fetch(`../views/${view}.html`)
    .then(res => {
      if (!res.ok) throw new Error(`No se encontró la vista: ${view}`);
      return res.text();
    })
    .then(html => {
      const app = document.getElementById('app');
      app.innerHTML = html;

      // Ejecutar scripts de la vista si los hay
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const scripts = tempDiv.querySelectorAll('script');

      scripts.forEach(script => {
        const nuevoScript = document.createElement('script');
        if (script.src) {
          nuevoScript.src = script.src;
        } else {
          nuevoScript.textContent = script.textContent;
        }
        document.body.appendChild(nuevoScript);
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById('app').innerHTML = `<p>Error cargando la vista: ${view}</p>`;
    });
}

function CargarVistaPorHash() {
    let vista = window.location.hash.replace('#', '') || 'inicio';

    // Si el hash cambia, cargar la vista correspondiente
    if (!window.location.hash) {
        window.location.hash = 'inicio';
    }

    CargarVista(vista);
}




function ActualizarLinkActivo() {
  const vistaActual = window.location.hash.replace('#', '') || 'inicio';

  // Quitar clases active
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const hrefVista = link.getAttribute('href').replace('#', '');
    if (hrefVista === vistaActual) {
      link.classList.add('active');
      const itemNavPadre = link.closest('.nav-item');
      if (itemNavPadre) itemNavPadre.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Eventos para cargar la vista y actualizar menú activo
window.addEventListener('hashchange', CargarVistaPorHash);
window.addEventListener('load', CargarVistaPorHash);
