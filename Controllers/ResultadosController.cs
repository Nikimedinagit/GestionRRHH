using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.Graficos;
using System.Globalization;
using NuGet.Versioning;
using System.Security.Claims;

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
    [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
    [HttpGet("EvolucionPersonal")]
    public async Task<IActionResult> EvolucionEmpleados()
    {
        var hoy = DateTime.Today;
        var resultado = new List<EvolucionEmpleadoGrafico>();

        var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var emailActual = (await _context.Users.FindAsync(userId))?.Email.Trim().ToLower();

        int? sectorIdSupervisor = null;

        if (rolActual == "SUPERVISOR")
        {
            var supervisor = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

            if (supervisor == null)
                return Ok(new List<EvolucionEmpleadoGrafico>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        for (int i = 11; i >= 0; i--)
        {
            var mes = hoy.AddMonths(-i);
            var inicioMes = new DateTime(mes.Year, mes.Month, 1);
            var finMes = inicioMes.AddMonths(1).AddDays(-1);

            var query = _context.ActivacionEmpleado
                .Where(a =>
                    a.Activo &&
                    a.FechaActivacion != null &&
                    a.FechaActivacion >= inicioMes &&
                    a.FechaActivacion <= finMes
                )
                .AsQueryable();

            if (sectorIdSupervisor.HasValue)
            {
                query = query.Where(a => _context.Empleado
                                            .Any(e => e.Id == a.EmpleadoId && e.Puesto.SectorId == sectorIdSupervisor.Value));
            }

            int activacionesMes = await query.CountAsync();

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
    [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
    [HttpGet("AsistenciaMensual")]
    public async Task<IActionResult> AsistenciaMensual()
    {
        var hoy = DateTime.Today;
        var resultado = new List<AsistenciaMensualGrafico>();

        var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var emailActual = (await _context.Users.FindAsync(userId))?.Email.Trim().ToLower();

        int? sectorIdSupervisor = null;

        if (rolActual == "SUPERVISOR")
        {
            var supervisor = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

            if (supervisor == null)
                return Ok(new List<AsistenciaMensualGrafico>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        for (int i = 5; i >= 0; i--)
        {
            var mes = hoy.AddMonths(-i);

            var asistencias = await _context.Asistencia
                .Include(a => a.Empleado)
                .ThenInclude(e => e.Puesto)
                .Where(a => a.Fecha.Month == mes.Month && a.Fecha.Year == mes.Year)
                .ToListAsync();

            if (sectorIdSupervisor.HasValue)
            {
                asistencias = asistencias
                    .Where(a => a.Empleado.Puesto.SectorId == sectorIdSupervisor.Value)
                    .ToList();
            }

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
    [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
    [HttpGet("JustificacionPorDia")]
    public async Task<IActionResult> JustificacionPorDia()
    {
        var hoy = DateTime.Today;
        var resultado = new List<JustificacionComparativaPorDiaGrafico>();
        var cultura = new CultureInfo("es-ES");

        var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var emailActual = (await _context.Users.FindAsync(userId))?.Email.Trim().ToLower();

        int? sectorIdSupervisor = null;

        if (rolActual == "SUPERVISOR")
        {
            var supervisor = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

            if (supervisor == null)
                return Ok(new List<JustificacionComparativaPorDiaGrafico>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        for (int i = 6; i >= 0; i--)
        {
            var dia = hoy.AddDays(-i);

            var justificacionesQuery = _context.Justificacion
                .Include(j => j.Empleado)
                .ThenInclude(e => e.Puesto)
                .Where(j => j.Fecha.Date == dia);

            if (sectorIdSupervisor.HasValue)
            {
                justificacionesQuery = justificacionesQuery
                    .Where(j => j.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
            }

            int totalJustificaciones = await justificacionesQuery.CountAsync();
            int totalAprobadas = await justificacionesQuery
                .Where(j => j.Estados == EstadoJustificacion.APROBADA)
                .CountAsync();
            int totalRechazadas = await justificacionesQuery
                .Where(j => j.Estados == EstadoJustificacion.RECHAZADA)
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
    [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
    [HttpPost("AsistenciaPorEmpleadoN2")]
    public async Task<ActionResult<List<EmpleadoAsistenciaListadoN2>>> ObtenerInformeAsistencias([FromBody] FiltrarListadoAsistenciaEmpleado filtro)
    {
        var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var emailActual = (await _context.Users.FindAsync(userId))?.Email.Trim().ToLower();

        int? sectorIdSupervisor = null;

        if (rolActual == "SUPERVISOR")
        {
            var supervisor = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

            if (supervisor == null)
                return Ok(new List<EmpleadoAsistenciaListadoN2>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var Asistencias = _context.Asistencia
            .Include(a => a.Empleado)
            .ThenInclude(e => e.Puesto)
            .AsQueryable();

        if (filtro.FechaDesde.HasValue)
            Asistencias = Asistencias.Where(a => a.Fecha >= filtro.FechaDesde.Value);

        if (filtro.FechaHasta.HasValue)
            Asistencias = Asistencias.Where(a => a.Fecha <= filtro.FechaHasta.Value);

        if (sectorIdSupervisor.HasValue)
        {
            Asistencias = Asistencias.Where(a => a.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
        }

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
    [Authorize(Roles = "ADMINISTRADOR, RRHH")]
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
    [Authorize(Roles = "ADMINISTRADOR, RRHH")]
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
    [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
    [HttpPost("EmpleadoHistorialLaboralN2")]
    public async Task<ActionResult<List<EmpleadoHistorialLaboralListadoN2>>> ObtenerHistorialLaboral([FromBody] FiltrarEmpleadoHistorialLaboral filtro)
    {
        var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var emailActual = (await _context.Users.FindAsync(userId))?.Email.Trim().ToLower();

        int? sectorIdSupervisor = null;

        if (rolActual == "SUPERVISOR")
        {
            var supervisor = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

            if (supervisor == null)
                return Ok(new List<EmpleadoHistorialLaboralListadoN2>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var Historial = _context.HistorialLaboral
            .Include(h => h.Empleado)
            .ThenInclude(e => e.Puesto)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filtro.Nombre))
            Historial = Historial.Where(h => h.Empleado.NombreCompleto.Contains(filtro.Nombre));

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            Historial = Historial.Where(h => h.Empleado.NroLegajo.Contains(filtro.NroLegajo));

        if (sectorIdSupervisor.HasValue)
        {
            Historial = Historial.Where(h => h.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        var ObtenerHistorial = await Historial
            .OrderBy(o => o.Empleado.NroLegajo)
            .ThenBy(o => o.FechaModificacion)
            .ToListAsync();

        var Puestos = await _context.Puesto.Include(p => p.Sector).ToListAsync();

        var AgruparPorEmpleado = ObtenerHistorial
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
                        SectorAnterior = Puestos.FirstOrDefault(p => p.Descripcion == historialGrupo.PuestoAnterior)?.Sector.Nombre,
                        SectorActual = Puestos.FirstOrDefault(p => p.Descripcion == historialGrupo.PuestoActual)?.Sector.Nombre
                    }).ToList(),
            }).ToList();

        return Ok(AgruparPorEmpleado);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER ESTADITICO GENERAL DE EMPELADO, ASISTENCIA Y JUSTIFICACION DE LOS ULTIMO 12 MESES /////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
    [HttpPost("GlobalN1")]
    public async Task<ActionResult<List<GlobalEstadisticoN1>>> ObtenerEstadisticaGlobal()
    {
        var Hoy = DateTime.Today;
        var Desde = Hoy.AddMonths(-11);

        var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var emailActual = (await _context.Users.FindAsync(userId))?.Email.Trim().ToLower();

        int? sectorIdSupervisor = null;

        if (rolActual == "SUPERVISOR")
        {
            var supervisor = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

            if (supervisor == null)
                return Ok(new List<GlobalEstadisticoN1>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var ListaActivaciones = await _context.ActivacionEmpleado
            .Include(a => a.Empleado)
            .ThenInclude(e => e.Puesto)
            .ToListAsync();

        var ObtenerAsistencia = await _context.Asistencia
            .Include(a => a.Empleado)
            .ThenInclude(e => e.Puesto)
            .Where(a => a.Fecha >= Desde)
            .ToListAsync();

        var ObtenerJustificacion = await _context.Justificacion
            .Include(j => j.Empleado)
            .ThenInclude(e => e.Puesto)
            .Where(a => a.Fecha >= Desde)
            .ToListAsync();

        if (sectorIdSupervisor.HasValue)
        {
            ListaActivaciones = ListaActivaciones
                .Where(a => a.Empleado.Puesto.SectorId == sectorIdSupervisor.Value)
                .ToList();

            ObtenerAsistencia = ObtenerAsistencia
                .Where(a => a.Empleado.Puesto.SectorId == sectorIdSupervisor.Value)
                .ToList();

            ObtenerJustificacion = ObtenerJustificacion
                .Where(j => j.Empleado.Puesto.SectorId == sectorIdSupervisor.Value)
                .ToList();
        }

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

            var AsistenciaDelMes = ObtenerAsistencia
                .Where(a => a.Fecha.Month == FechaDelMes.Month && a.Fecha.Year == FechaDelMes.Year)
                .ToList();

            var JustificacionDelMes = ObtenerJustificacion
                .Where(j => j.Fecha.Month == FechaDelMes.Month && j.Fecha.Year == FechaDelMes.Year)
                .Count();

            int Presente = AsistenciaDelMes.Count(a => a.Estado == EstadoAsistencia.COMPLETA);
            int Ausente = AsistenciaDelMes.Count(a => a.Estado == EstadoAsistencia.AUSENTE);
            int Tarde = AsistenciaDelMes.Count(a => a.Estado == EstadoAsistencia.TARDE);
            int Incompleta = AsistenciaDelMes.Count(a => a.Estado == EstadoAsistencia.INCOMPLETA);
            int FueraDeHorario = AsistenciaDelMes.Count(a => a.Estado == EstadoAsistencia.FUERADEHORARIO);

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
                Justificaciones = JustificacionDelMes,
                PorcentajePresentismo = Presentismo,
                PorcentajeAusentismo = Ausentismo,
                FechaOrden = FechaDelMes
            });
        }

        return TotalResultado.OrderByDescending(x => x.FechaOrden).ToList();
    }





    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER ESTADITICO DE LA ASIOTENCIA DE EMEPALDOS POR SECTOR - NIVEL 2/////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    [Authorize(Roles = "ADMINISTRADOR, RRHH")]
    [HttpPost("EmpleadoAsistenciaSectorN2")]
    public async Task<ActionResult<List<EmpleadoAsistenciaSectorN2>>> ObtenerAsistenciaSector([FromBody] FiltrarEstadisticaAsistenciaEmpeladoSector filtro)
    {
        var Asistencias = _context.Asistencia
            .Include(a => a.Empleado)
                .ThenInclude(e => e.Puesto)
                    .ThenInclude(p => p.Sector)
            .Where(a => !a.Empleado.Eliminado)
            .AsQueryable();

        if (filtro.Sector.HasValue)
            Asistencias = Asistencias.Where(a => a.Empleado.Puesto.SectorId == filtro.Sector.Value);

        var ObtenerAsistencias = await Asistencias.ToListAsync();

        var AgruparPorSector = ObtenerAsistencias
            .GroupBy(a => a.Empleado.Puesto.Sector)
            .OrderBy(g => g.Key.Nombre)
            .Select(grupoSector => new EmpleadoAsistenciaSectorN2
            {
                Nombre = grupoSector.Key.Nombre,

                EmpeladoAsistencia = grupoSector
                    .GroupBy(a => a.Empleado)
                    .OrderBy(g => g.Key.NroLegajo)
                    .Select(grupoEmpleado => new EmpleadoAsistenciaN2
                    {
                        Nombre = grupoEmpleado.Key.NombreCompleto,
                        NroLegajo = grupoEmpleado.Key.NroLegajo,

                        Presente = grupoEmpleado.Count(a => a.Estado == EstadoAsistencia.COMPLETA),
                        Ausentes = grupoEmpleado.Count(a => a.Estado == EstadoAsistencia.AUSENTE),
                        Incompletas = grupoEmpleado.Count(a => a.Estado == EstadoAsistencia.INCOMPLETA),
                        Tarde = grupoEmpleado.Count(a => a.Estado == EstadoAsistencia.TARDE),
                        FueraDeHorario = grupoEmpleado.Count(a => a.Estado == EstadoAsistencia.FUERADEHORARIO)
                    })
                    .ToList()
            })
            .ToList();

        return Ok(AgruparPorSector);
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER ESTADITICO DE JUSTIFICACION DURANTE UTIMOS 12 MESES - NIVEL 1/////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
    [HttpPost("EstadisticaJustificaciones12Meses")]
    public async Task<ActionResult<List<EstadisticaJustificacionMes>>> ObtenerEstadisticaJustificaciones()
    {
        DateTime Hoy = DateTime.Now;
        DateTime InicioPeriodo = Hoy.AddMonths(-11);

        var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var emailActual = (await _context.Users.FindAsync(userId))?.Email.Trim().ToLower();

        int? sectorIdSupervisor = null;

        if (rolActual == "SUPERVISOR")
        {
            var supervisor = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

            if (supervisor == null)
                return Ok(new List<EstadisticaJustificacionMes>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var JustificacionesQuery = _context.Justificacion
            .Include(j => j.Empleado)
            .ThenInclude(e => e.Puesto)
            .Where(j => j.Fecha >= InicioPeriodo)
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            JustificacionesQuery = JustificacionesQuery
                .Where(j => j.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        var Justificaciones = await JustificacionesQuery.ToListAsync();

        var TotalEstadistica = new List<EstadisticaJustificacionMes>();

        for (int i = 0; i < 12; i++)
        {
            DateTime MesActual = new DateTime(InicioPeriodo.Year, InicioPeriodo.Month, 1).AddMonths(i);
            var NombreDelMes = MesActual.ToString("MMMM yyyy", new CultureInfo("es-AR")).ToUpper();

            var DatosDelMes = Justificaciones
                .Where(j => j.Fecha.Year == MesActual.Year && j.Fecha.Month == MesActual.Month)
                .ToList();

            TotalEstadistica.Add(new EstadisticaJustificacionMes
            {
                Mes = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(NombreDelMes),
                Pendientes = DatosDelMes.Count(j => j.Estados == EstadoJustificacion.PENDIENTE),
                Aprobadas = DatosDelMes.Count(j => j.Estados == EstadoJustificacion.APROBADA),
                Rechazadas = DatosDelMes.Count(j => j.Estados == EstadoJustificacion.RECHAZADA),
                Total = DatosDelMes.Count(),
                FechaOrden = MesActual
            });
        }

        return TotalEstadistica.OrderByDescending(x => x.FechaOrden).ToList();
    }




    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///FIN DE LOS METODOS PARA OBTENEER RESULTADOS DE GESTION DE PERSONAL - GRAFICOS Y LISTADOS ///
    /// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////




}





