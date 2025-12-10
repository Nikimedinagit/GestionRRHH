
//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA OBTENER LOS DATOS DE LA API DE DIAS FESTIVOS /////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function cargarProximoFeriado() {
    try {
        const response = await authFetch('PanelPrincipal/proximo-festivo');
        const feriado = await response.json();

        const fecha = new Date(feriado.fecha);

        const dia = fecha.getDate();

        let mesTexto = fecha.toLocaleString('es-AR', { month: 'long' });
        mesTexto = mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1).toLowerCase();

        const fechaFestivo = document.getElementById('fecha-festivo');
        fechaFestivo.textContent = `${dia} de ${mesTexto}`;

        const nombreFestivo = document.getElementById('feriado-nombre');
        nombreFestivo.textContent = feriado.descripcion;

        const tipoFestivo = document.getElementById('feriado-tipo');
        tipoFestivo.textContent = feriado.tipoNombre;

    } catch (error) {
        MostrarErrorCatch();
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
// FUNCION PARA OBTENER LOS DATOS DE VACACIONES/////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function mostrarVacacionesUsuario() {
    try {
        const response = await authFetch('PanelPrincipal/VacacionesUsuario');
        const data = await response.json();

        document.getElementById('vacacionesAnio').textContent = data.anio;

        document.getElementById('vacacionesRestantes').textContent = data.restantes;
        document.getElementById('vacacionesTomadas').textContent = data.tomados;

        const historialContainer = document.getElementById('vacacionesHistorial');
        historialContainer.innerHTML = '';

        data.historial.forEach(h => {
            const div = document.createElement('div');
            div.classList.add('flex', 'justify-between');
            div.innerHTML = `<span>${h.mes}</span><span class="font-semibold">${h.dias} días</span>`;
            historialContainer.appendChild(div);
        });

    } catch (error) {
        MostrarErrorCatch();
    }
}



//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA OBTENER LOS DATOS DE MI EQUIPO/////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function mostrarMiEquipo() {
    try {
        const response = await authFetch('PanelPrincipal/MiEquipo');
        const data = await response.json();

        const container = document.getElementById('miEquipoContainer');
        container.innerHTML = '';

        data.forEach(comp => {
            const div = document.createElement('div');
            div.classList.add('flex', 'flex-col', 'md:flex-1', 'gap-1', 'justify-center');

            const color = comp.estado === 'Presente' ? 'bg-green-500' : 'bg-blue-500';
            const textoColor = comp.estado === 'Presente' ? 'text-green-600' : 'text-blue-600';

            div.innerHTML = `
                <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full ${color} ${comp.estado === 'Presente' ? 'animate-pulse' : ''}"></span>
                <div>
                    <div class="font-semibold text-gray-900">${comp.nombreCompleto}</div>
                    <div class="text-gray-500 text-sm">${comp.puesto}</div>
                    <span class="${textoColor} italic text-sm">${comp.estado}</span>
                </div>
                </div>
            `;

            container.appendChild(div);
        });

    } catch (error) {
        MostrarErrorCatch();
    }
}



//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA OBTENER LOS DATOS DEL ESTADO DE OFICINA/////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function mostrarEstadoOficina() {
    try {
        const response = await authFetch('PanelPrincipal/EstadoOficina');
        const data = await response.json();

        document.getElementById('presenteEmpleados').textContent = data.presentes;
        document.getElementById('licenciaEmpleados').textContent = data.conLicencia;
        document.getElementById('estadoAnio').textContent = data.anio;

    } catch (error) {
        MostrarErrorCatch();
    }
}



//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA OBTENER LOS DATOS DEL RESUMEN GENERAL/////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
async function mostrarResumenAdministrador() {
    try {
        const response = await authFetch('PanelPrincipal/PanelAdministrador');
        const data = await response.json();

        document.getElementById('empleadosActivos').textContent = data.empleadosActivos ?? 0;
        document.getElementById('empleadosConLicencia').textContent = data.empleadosConLicencia ?? 0;
        document.getElementById('ausenciasHoy').textContent = data.ausenciasHoy ?? 0;
        document.getElementById('evaluacionesRecientes').textContent = data.evaluacionesRecientes ?? 0;
        document.getElementById('cursosActivos').textContent = data.cursosActivos ?? 0;

        const movimientosList = document.getElementById('movimientosList');
        movimientosList.innerHTML = '';

        if (data.movimientosRecientes && data.movimientosRecientes.length > 0) {
            movimientosList.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full";

            data.movimientosRecientes.forEach(mov => {
                const li = document.createElement('li');
                li.className = "bg-gray-50 p-3 rounded text-gray-700 text-left shadow-sm";
                li.innerHTML = `
            <div class="flex flex-col">
                <span class="font-semibold text-base">${mov.empleado}</span>
                <span class="text-gray-600">${mov.puestoAnterior}</span>
                <span class="text-blue-600">→ ${mov.puestoActual}</span>
                <span class="text-gray-400 text-sm mt-1">${mov.fecha}</span>
            </div>
        `;
                movimientosList.appendChild(li);
            });
        } else {
            movimientosList.className = "";
            movimientosList.innerHTML = `
        <li class="bg-gray-50 p-2 rounded text-gray-500 text-left">
            No hay movimientos recientes
        </li>`;
        }


    } catch (error) {
        MostrarErrorCatch();
    }
}



////////////////////////////////////////////////////////////////////////////
// FUNCION MOSTRAR CARD SEGUN ROL /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
function mostrarCardSegunRol() {
    const rol = getRol()?.toUpperCase();
    if (!rol) return;

    if (rol === "RRHH" || rol === "SUPERVISOR" || rol === "EMPLEADO") {
        $("#CardAsitencia, #CardTiempo, #CardVacaciones, #CardMiEquipo, #CardEstadoOficina").removeClass("d-none");
    }

    if (rol === "ADMINISTRADOR") {
        $("#CardResumenGeneral").removeClass("d-none");
    }
}



//////////////////////////////////////////////////////////////////////////////////////
// ALMACENAMOS LAS FUNCIONES EN UNA SOLA PARA LLAMARLAS EN INICIO.HTML /////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function cargarLasFuncionesInicio() {
    mostrarCardSegunRol()
    cargarProximoFeriado();
    mostrarNombreUsuario();

    const rol = getRol()?.toUpperCase();
    if (!rol) return;

    if (rol === "RRHH" || rol === "SUPERVISOR" || rol === "EMPLEADO") {
        mostrarAsistenciaUsuario();
        mostrarTiempoUsuario();
        mostrarVacacionesUsuario();
        mostrarMiEquipo();
        mostrarEstadoOficina();
    }

    if (rol === "ADMINISTRADOR") {
        mostrarResumenAdministrador();
    }
}



//////////////////////////////////////////////////////////////////////////////////////
// INICIALIZAMOS LAS FUNCIONES /////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
cargarLasFuncionesInicio();

