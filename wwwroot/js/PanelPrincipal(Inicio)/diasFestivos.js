
//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA OBTENER LOS DATOS DE LA API DE DIAS FESTIVOS /////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function cargarProximoFestivo() {
    const response = await fetch('/api/PanelPrincipal/proximos-festivos');
    const festivos = await response.json();

    if (festivos.length > 0) {
        const proximo = festivos[0];

        const [year, month, day] = proximo.fecha.split('-');
        const fecha = new Date(year, month - 1, day);
        const dia = fecha.getDate();
        const mes = fecha.toLocaleString('es-ES', { month: 'long' });

        document.getElementById('dia-festivo').textContent = dia;
        document.getElementById('mes-festivo').textContent = mes.charAt(0).toUpperCase() + mes.slice(1);
        document.getElementById('feriado-nombre').textContent = proximo.nombreFestivo;
        document.getElementById('feriado-nombre').title = proximo.nombreFestivo;
    }
}


//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA OBTENER NOMBRE DE USUARIO Y MOSTRARLO EN LA CARD /////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function mostrarNombreUsuario() {
    const nombreUsuario = localStorage.getItem("usuarioNombre") || "Usuario";
    const nombreFormateado = capitalizarNombre(nombreUsuario);
    document.getElementById('userName').textContent = nombreFormateado;
}


//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA OBTENER LA AISTENCIA Y MOSTRARLA EN LA CARD /////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function mostrarAsistenciaUsuario() {
    try {
        const response = await authFetch('PanelPrincipal/AsistenciaUsuario');
        const asistencia = await response.json();

        document.getElementById('entrada1').textContent = asistencia.primerEntrada;
        document.getElementById('salida1').textContent = asistencia.primerSalida;

        if (asistencia.segundaEntrada && asistencia.segundaSalida) {
            document.getElementById('entrada2').textContent = asistencia.segundaEntrada;
            document.getElementById('salida2').textContent = asistencia.segundaSalida;
            document.getElementById('entrada2').parentElement.style.display = 'block';
            document.getElementById('salida2').parentElement.style.display = 'block';
        } else {
            document.getElementById('entrada2').parentElement.style.display = 'none';
            document.getElementById('salida2').parentElement.style.display = 'none';
        }

        document.getElementById('horas').textContent = asistencia.horasTrabajadas.toFixed(2);

        const progreso = document.getElementById('progreso');
        const horasJornada = 8;
        const porcentaje = Math.min((asistencia.horasTrabajadas / horasJornada) * 100, 100);
        progreso.style.width = `${porcentaje}%`;
        progreso.style.transition = "width 1s ease";

        if (porcentaje < 50) {
            progreso.className = "h-2 rounded bg-yellow-400";
        } else if (porcentaje < 100) {
            progreso.className = "h-2 rounded bg-green-400";
        } else {
            progreso.className = "h-2 rounded bg-blue-500";
        }

    } catch (error) {
        MostrarErrorCatch();
    }
}


//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA OBTENER LOS DATOS DEL TIEMPO TRABAJADO/////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function mostrarTiempoUsuario() {
    try {
        const response = await authFetch('PanelPrincipal/TiempoUsuario');
        const data = await response.json();

        document.getElementById('horasHoy').textContent = data.hoy.toFixed(2);
        document.getElementById('horasSemana').textContent = data.semana.toFixed(2);
        document.getElementById('horasMes').textContent = data.mes.toFixed(2);
        document.getElementById('horasAnio').textContent = data.anio.toFixed(2);

        const horasJornada = 8;
        const calcularPorcentaje = (h) => Math.min((h / horasJornada) * 100, 100);

        document.getElementById('progresoHoy').style.width = `${calcularPorcentaje(data.hoy)}%`;
        document.getElementById('progresoSemana').style.width = `${calcularPorcentaje(data.semana)}%`;
        document.getElementById('progresoMes').style.width = `${calcularPorcentaje(data.mes)}%`;
        document.getElementById('horasAnio').style.width = `${calcularPorcentaje(data.anio)}%`;

        function actualizarHora() {
            const ahora = new Date();
            const horas = ahora.getHours().toString().padStart(2, '0');
            const minutos = ahora.getMinutes().toString().padStart(2, '0');
            document.getElementById('currentTime').textContent = `${horas}:${minutos}`;
        }
        actualizarHora();
        setInterval(actualizarHora, 60000);

    } catch (error) {
        MostrarErrorCatch();
    }
}


//////////////////////////////////////////////////////////////////////////////////////
// ALMACENAMOS LAS FUNCIONES EN UNA SOLA PARA LLAMARLAS EN INICIO.HTML /////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function cargarLasFuncionesInicio() {
    cargarProximoFestivo();
    mostrarNombreUsuario();
    mostrarAsistenciaUsuario();
    mostrarTiempoUsuario();

}

//////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAMOS LAS FUNCIONES /////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
cargarLasFuncionesInicio();