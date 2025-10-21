
async function cargarProximoFestivo() {
        const response = await fetch('/api/diasfestivos/proximos-festivos');
        const festivos = await response.json();

        if (festivos.length > 0) {
            const proximo = festivos[0];

        const [year, month, day] = proximo.fecha.split('-');
        const fecha = new Date(year, month - 1, day); // Mes base 0
        const dia = fecha.getDate();
        const mes = fecha.toLocaleString('es-ES', { month: 'long' });

            // Actualizamos la card
            document.getElementById('dia-festivo').textContent = dia;
            document.getElementById('mes-festivo').textContent = mes.charAt(0).toUpperCase() + mes.slice(1);
            document.getElementById('feriado-nombre').textContent = proximo.nombreFestivo;
            document.getElementById('feriado-nombre').title = proximo.nombreFestivo;
        } 
}

cargarProximoFestivo();