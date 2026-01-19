document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.hash) {
    window.location.hash = '#inicio';
  }
  CargarVistaPorHash();
});

window.addEventListener('hashchange', CargarVistaPorHash);

// Función para cargar una vista HTML
function CargarVista(view) {
  // Separar hash y parámetro context si existe
  let [vista, query] = view.split('?');
  const params = new URLSearchParams(query);
  const contexto = params.get('context');

  fetch(`../views/${vista}.html`)
    .then(res => {
      if (!res.ok) throw new Error(`No se encontró la vista: ${vista}`);
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


      ActualizarLinkActivo();
      window.scrollTo(0, 0);
    })
    .catch(err => {
      console.error(err);
      document.getElementById('app').innerHTML = `<p>Error cargando la vista: ${vista}</p>`;
      ActualizarLinkActivo();
    });
}

// Función para cargar la vista actual según el hash
function CargarVistaPorHash() {
  const vista = window.location.hash.replace('#', '') || 'inicio';
  CargarVista(vista);
  
}

// Función para actualizar la clase "active" en el menú
function ActualizarLinkActivo() {
  const vistaActual = window.location.hash.replace('#', '') || 'inicio';

  document.querySelectorAll('.pc-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const hrefVista = link.getAttribute('href').replace('#', '');
    if (hrefVista === vistaActual) {
      link.classList.add('active');
      const itemNavPadre = link.closest('.pc-item.pc-hasmenu');
      if (itemNavPadre) itemNavPadre.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

