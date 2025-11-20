using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.Graficos;
using System.Globalization;
using NuGet.Versioning;

[ApiController]
[Route("api/[controller]")]
public class ResultadosController : ControllerBase
{

    private readonly Context _context;

    public ResultadosController(Context context)
    {
        _context = context;
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///INICIO DE LOS METODOS PARA OBTENEER RESULTADOS DE GESTION DE PERSONAL - GRAFICOS Y LISTADOS ///
    /// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LA EVOLUCION DE EMPLEADOS ACTIVOS EN LOS ULTIMOS 12 MESES (GRAFICO) ///
    /////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("EvolucionPersonal")]
    public async Task<IActionResult> EvolucionEmpleados()
    {
        var hoy = DateTime.Today;
        var resultado = new List<EvolucionEmpleadoGrafico>();

        for (int i = 11; i >= 0; i--)
        {
            var mes = hoy.AddMonths(-i);

            var inicioMes = new DateTime(mes.Year, mes.Month, 1);
            var finMes = inicioMes.AddMonths(1).AddDays(-1);

            int activacionesMes = await _context.ActivacionEmpleado
                .Where(a =>
                    a.Activo == true &&
                    a.FechaActivacion != null &&
                    a.FechaActivacion >= inicioMes &&
                    a.FechaActivacion <= finMes)
                .CountAsync();

            string nombreMes = mes.ToString("MMM", new CultureInfo("es-ES"));
            nombreMes = char.ToUpper(nombreMes[0]) + nombreMes.Substring(1);


            resultado.Add(new EvolucionEmpleadoGrafico
            {
                Mes = nombreMes,
                Cantidad = activacionesMes,
            });
        }

        return Ok(resultado);
    }



    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LA ASISTENCIA MENSUAL EN LOS ULTIMOS 6 MESES (GRAFICO) //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("AsistenciaMensual")]
    public async Task<IActionResult> AsistenciaMensual()
    {
        var hoy = DateTime.Today;
        var resultado = new List<AsistenciaMensualGrafico>();

        for (int i = 5; i >= 0; i--)
        {
            var mes = hoy.AddMonths(-i);
            var asistencias = await _context.Asistencia
                .Where(a => a.Fecha.Month == mes.Month && a.Fecha.Year == mes.Year)
                .ToListAsync();

            string nombreMes = mes.ToString("MMM", new CultureInfo("es-ES"));
            nombreMes = char.ToUpper(nombreMes[0]) + nombreMes.Substring(1);

            resultado.Add(new AsistenciaMensualGrafico
            {
                Mes = nombreMes,
                AsistenciasCompletas = asistencias.Count(a => a.Estado == EstadoAsistencia.COMPLETA),
                Ausencias = asistencias.Count(a => a.Estado == EstadoAsistencia.AUSENTE)
            });
        }

        return Ok(resultado);
    }


    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LA JUSTIFICACION COMPARATIVA POR DIA DE LA SEMANA (GRAFICO) //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("JustificacionPorDia")]
    public async Task<IActionResult> JustificacionPorDia()
    {
        var hoy = DateTime.Today;
        var resultado = new List<JustificacionComparativaPorDiaGrafico>();
        var cultura = new CultureInfo("es-ES");

        for (int i = 6; i >= 0; i--)
        {
            var dia = hoy.AddDays(-i);

            int totalJustificaciones = await _context.Justificacion
                .Where(a => a.Fecha.Date == dia)
                .CountAsync();

            int totalAprobadas = await _context.Justificacion
                .Where(j => j.Estados == EstadoJustificacion.APROBADA && j.Fecha.Date == dia)
                .CountAsync();

            int totalRechazadas = await _context.Justificacion
                .Where(j => j.Estados == EstadoJustificacion.RECHAZADA && j.Fecha.Date == dia)
                .CountAsync();

            string diaSemana = cultura.DateTimeFormat.GetDayName(dia.DayOfWeek);
            diaSemana = char.ToUpper(diaSemana[0]) + diaSemana.Substring(1);

            resultado.Add(new JustificacionComparativaPorDiaGrafico
            {
                Dia = dia.ToString("dd/MM"),
                DiaSemana = diaSemana,
                TotalJustificaciones = totalJustificaciones,
                TotalAprobadas = totalAprobadas,
                TotalRechazadas = totalRechazadas
            });
        }

        return Ok(resultado);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBETENER EL LISTADOD DE ASISTENCIA POR EMPLEADO (N2) ////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("AsistenciaPorEmpleadoN2")]
    public async Task<ActionResult<List<EmpleadoAsistenciaListadoN2>>> ObtenerInformeAsistencias([FromBody] FiltrarListadoAsistenciaEmpleado filtro)
    {
        var Asistencias = _context.Asistencia
            .Include(e => e.Empleado)
            .Include(a => a.Empleado.Puesto)
            .AsQueryable();

        if (filtro.FechaDesde.HasValue)
            Asistencias = Asistencias.Where(a => a.Fecha >= filtro.FechaDesde.Value);

        if (filtro.FechaHasta.HasValue)
            Asistencias = Asistencias.Where(a => a.Fecha <= filtro.FechaHasta.Value);

        var ObtenerAsistencias = await Asistencias.ToListAsync();

        var AgruparPorEmpleado = ObtenerAsistencias
            .GroupBy(a => a.Empleado.NroLegajo)
            .OrderBy(grupo => grupo.Key)
            .Select(grupo => new EmpleadoAsistenciaListadoN2
            {
                NroLegajo = grupo.First().Empleado.NroLegajo,
                Nombre = grupo.First().Empleado.NombreCompleto,
                Puesto = grupo.First().Empleado.Puesto.Descripcion,
                Asistencias = grupo
                    .OrderByDescending(a => a.Fecha)
                    .Take(5)
                    .Select(a => new AsistenciaListadoN2
                    {
                        Fecha = a.Fecha.ToString("dd/MM/yyyy"),
                        Estado = a.Estado.ToString(),
                        PrimerEntrada = string.IsNullOrEmpty(a.PrimerEntradaString) ? (TimeSpan?)null : TimeSpan.Parse(a.PrimerEntradaString),
                        PrimeraSalida = string.IsNullOrEmpty(a.PrimerSalidaString) ? (TimeSpan?)null : TimeSpan.Parse(a.PrimerSalidaString),
                        SegundaEntrada = string.IsNullOrEmpty(a.SegundaEntradaString) ? (TimeSpan?)null : TimeSpan.Parse(a.SegundaEntradaString),
                        SegundaSalida = string.IsNullOrEmpty(a.SegundaSalidaString) ? (TimeSpan?)null : TimeSpan.Parse(a.SegundaSalidaString),
                    }).ToList()
            }).ToList();

        return Ok(AgruparPorEmpleado);
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER EL LISTADO DE JUSTIFICACION POR EMPLEADO - NIVEL 3 ///////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("SectorEmpeladoJustificacionN3")]
    public async Task<ActionResult<List<SectorEmpleadoJustificacionListadoN3>>> ObtenerInformeSector([FromBody] FiltrarListadoSectorEmpeladoJustificacion filtro)
    {
        var Justificacion = _context.Justificacion
        .Include(j => j.Empleado)
        .ThenInclude(j => j.Puesto)
        .ThenInclude(j => j.Sector)
        .AsQueryable();

        if (filtro.FechaDesde.HasValue)
            Justificacion = Justificacion.Where(a => a.Fecha >= filtro.FechaDesde.Value);

        if (filtro.FechaHasta.HasValue)
            Justificacion = Justificacion.Where(a => a.Fecha <= filtro.FechaHasta.Value);

        if (filtro.Estado.HasValue)
            Justificacion = Justificacion.Where(a => (int)a.Estados == filtro.Estado.Value);

        var ObtenerJustificaciones = await Justificacion.ToListAsync();

        var AgruparPorSector = ObtenerJustificaciones
            .GroupBy(j => j.Empleado.Puesto.Sector.Nombre)
            .OrderBy(g => g.Key)
            .Select(sectorGrupo => new SectorEmpleadoJustificacionListadoN3
            {
                Nombre = sectorGrupo.Key,
                Empleado = sectorGrupo
                .GroupBy(j => j.Empleado.NroLegajo)
                .Select(empeladoGrupo => new EmpleadoJustificacionListadoN3
                {
                    Nombre = empeladoGrupo.First().Empleado.NombreCompleto,
                    NroLegajo = empeladoGrupo.Key,
                    Justificaciones = empeladoGrupo
                    .OrderByDescending(j => j.Fecha)
                    .Select(justificacionGrupo => new JustificacionListadoN3
                    {
                        Fecha = justificacionGrupo.Fecha,
                        Motivo = justificacionGrupo.Motivo,
                        Estado = justificacionGrupo.Estados.ToString()
                    }).ToList(),
                }).ToList(),
            }).ToList();

        return Ok(AgruparPorSector);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LISATDO DE EMEPLADO POR SECTOR - NIVEL 2 /////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("SectorEmpleadoN2")]
    public async Task<ActionResult<List<SectorEmpeladoListadoN2>>> ObtenerInformeEmpleado([FromBody] FiltrarListadoSectorEmpelado filtro)
    {
        var Empleados = _context.Empleado
            .Include(e => e.Puesto)
            .ThenInclude(e => e.Sector)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filtro.Nombre))
            Empleados = Empleados.Where(e => e.NombreCompleto.Contains(filtro.Nombre));

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            Empleados = Empleados.Where(e => e.NroLegajo.Contains(filtro.NroLegajo));

        if (filtro.Sector.HasValue)
            Empleados = Empleados.Where(e => e.Puesto.SectorId == filtro.Sector.Value);

        var ObtenerEmpleados = await Empleados.ToListAsync();

        var AgruparPorSector = ObtenerEmpleados
            .GroupBy(e => e.Puesto.Sector.Nombre)
            .OrderBy(g => g.Key)
            .Select(sectorGrupo => new SectorEmpeladoListadoN2
            {
                Nombre = sectorGrupo.Key,
                Empleados = sectorGrupo
                .OrderBy(e => e.NroLegajo)
                .Select(empleadoGrupo => new EmpleadoListadoN2
                {
                    Nombre = empleadoGrupo.NombreCompleto,
                    NroLegajo = empleadoGrupo.NroLegajo,
                    Puesto = empleadoGrupo.Puesto.Descripcion
                }).ToList(),
            }).ToList();

        return Ok(AgruparPorSector);

    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LISATDO DE HISTORIAL LABORAL POR EMEPLADO - NIVEL 2 /////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("EmpleadoHistorialLaboralN2")]
    public async Task<ActionResult<List<EmpleadoHistorialLaboralListadoN2>>> ObtenerHistorialLaboral([FromBody] FiltrarEmpleadoHistorialLaboral filtro)
    {
        var Historial = _context.HistorialLaboral
            .Include(h => h.Empleado)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filtro.Nombre))
            Historial = Historial.Where(h => h.Empleado.NombreCompleto.Contains(filtro.Nombre));

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            Historial = Historial.Where(h => h.Empleado.NroLegajo.Contains(filtro.NroLegajo));

        var ObtenerHistorial = await Historial
        .OrderBy(o => o.Empleado.NroLegajo)
        .ThenBy(o => o.FechaModificacion)
        .ToListAsync();

        var Puesto = await _context.Puesto.Include(p => p.Sector).ToListAsync();

        var AgruparPorEmpelado = ObtenerHistorial
            .GroupBy(h => h.Empleado)
            .Select(empleadoGrupo => new EmpleadoHistorialLaboralListadoN2
            {
                Nombre = empleadoGrupo.Key.NombreCompleto,
                NroLegajo = empleadoGrupo.Key.NroLegajo,
                Historial = empleadoGrupo
                .Select(historialGrupo => new HistorialLaboralListadoN2
                {
                    Periodo = historialGrupo.FechaModificacion.ToString("dd/MM/yyyy"),
                    PuestoAnterior = historialGrupo.PuestoAnterior,
                    PuestoActual = historialGrupo.PuestoActual,
                    SectorAnterior = Puesto.FirstOrDefault(p => p.Descripcion == historialGrupo.PuestoAnterior)?.Sector.Nombre,
                    SectorActual = Puesto.FirstOrDefault(p => p.Descripcion == historialGrupo.PuestoActual)?.Sector.Nombre
                }).ToList(),
            }).ToList();

        return Ok(AgruparPorEmpelado);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER ESTADITICO GENERAL DE EMPELADO, ASISTENCIA Y JUSTIFICACION DE LOS ULTIMO 12 MESES /////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("GlobalN1")]
    public async Task<ActionResult<List<GlobalEstadisticoN1>>> ObtenerEstadisticaGlobal()
    {
        var Hoy = DateTime.Today;
        var Desde = Hoy.AddMonths(-11);

        var ListaActivaciones = await _context.ActivacionEmpleado.ToListAsync();
        var ObtenerAsistencia = await _context.Asistencia.Where(a => a.Fecha >= Desde).ToListAsync();
        var ObtenerJustificaicon = await _context.Justificacion.Where(a => a.Fecha >= Desde).ToListAsync();

        var TotalResultado = new List<GlobalEstadisticoN1>();

        for (int i = 0; i < 12; i++)
        {
            var FechaDelMes = Desde.AddMonths(i);
            var NombreDelMes = FechaDelMes.ToString("MMMM yyyy", new CultureInfo("es-AR")).ToUpper();

            var fechaFinMes = new DateTime(FechaDelMes.Year, FechaDelMes.Month, DateTime.DaysInMonth(FechaDelMes.Year, FechaDelMes.Month));

            var ObtenerEmpleado = ListaActivaciones
                .Where(a => a.FechaActivacion <= fechaFinMes)
                .GroupBy(a => a.EmpleadoId)
                .Select(g => g.OrderByDescending(a => a.FechaActivacion).FirstOrDefault())
                .Where(a => a != null && a.Activo)
                .Count();

            var AsistenciaDelmes = ObtenerAsistencia
                .Where(a => a.Fecha.Month == FechaDelMes.Month && a.Fecha.Year == FechaDelMes.Year)
                .ToList();

            var JustificacionDelmes = ObtenerJustificaicon
                .Where(j => j.Fecha.Month == FechaDelMes.Month && j.Fecha.Year == FechaDelMes.Year)
                .Count();

            int Presente = AsistenciaDelmes.Count(a => a.Estado == EstadoAsistencia.COMPLETA);
            int Ausente = AsistenciaDelmes.Count(a => a.Estado == EstadoAsistencia.AUSENTE);
            int Tarde = AsistenciaDelmes.Count(a => a.Estado == EstadoAsistencia.TARDE);
            int Incompleta = AsistenciaDelmes.Count(a => a.Estado == EstadoAsistencia.INCOMPLETA);
            int FueraDeHorario = AsistenciaDelmes.Count(a => a.Estado == EstadoAsistencia.FUERADEHORARIO);

            decimal Presentismo = ObtenerEmpleado == 0 ? 0 : Math.Round((decimal)Presente / ObtenerEmpleado * 100, 2);
            decimal Ausentismo = ObtenerEmpleado == 0 ? 0 : Math.Round((decimal)Ausente / ObtenerEmpleado * 100, 2);

            TotalResultado.Add(new GlobalEstadisticoN1
            {
                Mes = NombreDelMes,
                Activos = ObtenerEmpleado,
                Presentes = Presente,
                Ausentes = Ausente,
                Tarde = Tarde,
                Incompletas = Incompleta,
                FueraDeHorario = FueraDeHorario,
                Justificaciones = JustificacionDelmes,
                PorcentajePresentismo = Presentismo,
                PorcentajeAusentismo = Ausentismo,
                FechaOrden = FechaDelMes
            });
        }

        return TotalResultado.OrderByDescending(x => x.FechaOrden).ToList();
    }





    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///FIN DE LOS METODOS PARA OBTENEER RESULTADOS DE GESTION DE PERSONAL - GRAFICOS Y LISTADOS ///
    /// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////




}





