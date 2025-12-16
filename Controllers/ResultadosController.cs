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

            var obtenerPersonal = _context.ActivacionEmpleado
                .Where(a =>
                    a.Activo &&
                    a.FechaActivacion != null &&
                    a.FechaActivacion >= inicioMes &&
                    a.FechaActivacion <= finMes
                )
                .AsQueryable();

            if (sectorIdSupervisor.HasValue)
            {
                obtenerPersonal = obtenerPersonal.Where(a => _context.Empleado
                                            .Any(e => e.Id == a.EmpleadoId && e.Puesto.SectorId == sectorIdSupervisor.Value));
            }

            int activacionesMes = await obtenerPersonal.CountAsync();

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

            var justificacionesObetener = _context.Justificacion
                .Include(j => j.Empleado)
                .ThenInclude(e => e.Puesto)
                .Where(j => j.Fecha.Date == dia);

            if (sectorIdSupervisor.HasValue)
            {
                justificacionesObetener = justificacionesObetener
                    .Where(j => j.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
            }

            int totalJustificaciones = await justificacionesObetener.CountAsync();
            int totalAprobadas = await justificacionesObetener
                .Where(j => j.Estados == EstadoJustificacion.APROBADA)
                .CountAsync();
            int totalRechazadas = await justificacionesObetener
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

        if (!string.IsNullOrEmpty(filtro.Nombre))
            Asistencias = Asistencias.Where(h => h.Empleado.NombreCompleto.Contains(filtro.Nombre));

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            Asistencias = Asistencias.Where(h => h.Empleado.NroLegajo.Contains(filtro.NroLegajo));

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

        if (!string.IsNullOrEmpty(filtro.Nombre))
            Asistencias = Asistencias.Where(h => h.Empleado.NombreCompleto.Contains(filtro.Nombre));

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            Asistencias = Asistencias.Where(h => h.Empleado.NroLegajo.Contains(filtro.NroLegajo));

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

        var JustificacionesObtener = _context.Justificacion
            .Include(j => j.Empleado)
            .ThenInclude(e => e.Puesto)
            .Where(j => j.Fecha >= InicioPeriodo)
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            JustificacionesObtener = JustificacionesObtener
                .Where(j => j.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        var Justificaciones = await JustificacionesObtener.ToListAsync();

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
    /// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////




    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///INICIO DE LOS METODOS PARA OBTENEER RESULTADOS DE GESTION DE DESEMPEÑO - GRAFICOS Y LISTADOS ///
    /// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER DESEMPEÑO POR SECTOR (GRAFICO) //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("DesempenoPorPuesto")]
    public async Task<ActionResult<IEnumerable<DesempenoPorPuestoGrafico>>> GetDesempenoPorPuesto()
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

            if (supervisor == null || supervisor.Puesto == null)
                return Ok(new List<DesempenoPorPuestoGrafico>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var hoy = DateTime.Now;
        var meses = new List<DateTime>();
        for (int i = 5; i >= 0; i--)
            meses.Add(new DateTime(hoy.Year, hoy.Month, 1).AddMonths(-i));

        var empleadosObtener = _context.Empleado
            .Where(e => !e.Eliminado && e.Puesto != null)
            .Include(e => e.Puesto)
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            empleadosObtener = empleadosObtener.Where(e => e.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        var evaluaciones = await empleadosObtener
            .SelectMany(e => e.Evaluacion, (empleado, eval) => new
            {
                Puesto = empleado.Puesto.Descripcion,
                eval.Calificacion,
                eval.Fecha
            })
            .Where(x => x.Fecha >= meses.First())
            .ToListAsync();

        var puestos = await empleadosObtener
            .Select(e => e.Puesto.Descripcion)
            .Distinct()
            .ToListAsync();

        var resultado = new List<DesempenoPorPuestoGrafico>();

        foreach (var mes in meses)
        {
            var mesStr = mes.ToString("MMM", System.Globalization.CultureInfo.CurrentCulture);

            var promediosMes = puestos.Select(puesto =>
            {
                var registros = evaluaciones
                    .Where(e => e.Puesto == puesto && e.Fecha.Month == mes.Month && e.Fecha.Year == mes.Year)
                    .ToList();

                var promedio = registros.Any() ? registros.Average(r => r.Calificacion) : 0;
                var cantidad = registros.Count;

                var puestoCapitalizado = System.Globalization.CultureInfo
                    .CurrentCulture
                    .TextInfo
                    .ToTitleCase(puesto.ToLower());

                return new DesempenoPorPuestoGrafico
                {
                    Puesto = puestoCapitalizado,
                    Mes = mesStr,
                    PromedioCalificacion = promedio,
                    CantidadEvaluaciones = cantidad
                };
            })
            .OrderByDescending(x => x.PromedioCalificacion)
            .FirstOrDefault();

            if (promediosMes != null)
                resultado.Add(promediosMes);
        }

        return Ok(resultado);
    }



    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER DISTRIBUCION DE CALIFICACIONES (GRAFICO) //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("DistribucionCalificaciones")]
    public async Task<ActionResult<IEnumerable<DistribucionCalificacionesGrafico>>> GetDistribucionCalificaciones()
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

            if (supervisor == null || supervisor.Puesto == null)
                return Ok(new List<DistribucionCalificacionesGrafico>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var evaluacionesObtener = _context.Evaluacion
            .Include(e => e.Empleado)
            .Where(e => !e.Empleado.Eliminado)
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            evaluacionesObtener = evaluacionesObtener.Where(e => e.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        var calificaciones = await evaluacionesObtener
            .Select(e => e.Calificacion)
            .ToListAsync();

        var resultado = Enumerable.Range(1, 10)
            .Select(n => new DistribucionCalificacionesGrafico
            {
                Calificacion = n,
                Cantidad = calificaciones.Count(c => c == n)
            })
            .ToList();

        return Ok(resultado);
    }



    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LOS MEJORES CRITERIOS DE MAYOR PROMEDIO A 7 (GRAFICO) //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("MejoresCriterios")]
    public async Task<ActionResult<IEnumerable<CriterioDesempenoGrafico>>> GetMejoresCriterios()
    {
        double umbralMejores = 7;

        var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var emailActual = (await _context.Users.FindAsync(userId))?.Email.Trim().ToLower();

        int? sectorIdSupervisor = null;

        if (rolActual == "SUPERVISOR")
        {
            var supervisor = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

            if (supervisor == null || supervisor.Puesto == null)
                return Ok(new List<CriterioDesempenoGrafico>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var criteriosObtener = _context.CriterioDeEvaluacion
            .Include(c => c.Evaluacion)
                .ThenInclude(ev => ev.Empleado)
                    .ThenInclude(emp => emp.Puesto)
            .Where(c => !c.TipoDeCriterio.Eliminado)
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            criteriosObtener = criteriosObtener.Where(c => c.Evaluacion.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        var datos = await criteriosObtener
            .Select(c => new
            {
                Criterio = c.TipoDeCriterio.Nombre,
                Calificacion = c.Evaluacion.Calificacion
            })
            .ToListAsync();

        var resultado = datos
            .GroupBy(x => x.Criterio)
            .Select(g => new CriterioDesempenoGrafico
            {
                Criterio = CultureInfo.CurrentCulture.TextInfo
                            .ToTitleCase(g.Key.ToLower()),
                Promedio = g.Average(x => x.Calificacion)
            })
            .Where(x => x.Promedio >= umbralMejores)
            .OrderByDescending(x => x.Promedio)
            .ToList();

        return Ok(resultado);
    }


    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LOS PEORES CRITERIOS MENOR A 4 (GRAFICO) //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("PeoresCriterios")]
    public async Task<ActionResult<IEnumerable<CriterioDesempenoGrafico>>> GetPeoresCriterios()
    {
        double umbralPeores = 4;

        var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var emailActual = (await _context.Users.FindAsync(userId))?.Email.Trim().ToLower();

        int? sectorIdSupervisor = null;

        if (rolActual == "SUPERVISOR")
        {
            var supervisor = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

            if (supervisor == null || supervisor.Puesto == null)
                return Ok(new List<CriterioDesempenoGrafico>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var criteriosObtener = _context.CriterioDeEvaluacion
            .Include(c => c.Evaluacion)
                .ThenInclude(ev => ev.Empleado)
                    .ThenInclude(emp => emp.Puesto)
            .Where(c => !c.TipoDeCriterio.Eliminado)
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            criteriosObtener = criteriosObtener.Where(c => c.Evaluacion.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        var datos = await criteriosObtener
            .Select(c => new
            {
                Criterio = c.TipoDeCriterio.Nombre,
                Calificacion = c.Evaluacion.Calificacion
            })
            .ToListAsync();

        var resultado = datos
            .GroupBy(x => x.Criterio)
            .Select(g => new CriterioDesempenoGrafico
            {
                Criterio = CultureInfo.CurrentCulture.TextInfo
                            .ToTitleCase(g.Key.ToLower()),
                Promedio = g.Average(x => x.Calificacion)
            })
            .Where(x => x.Promedio <= umbralPeores)
            .OrderBy(x => x.Promedio)
            .ToList();

        return Ok(resultado);
    }


    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LA EVOLUCION DE DESEMPEÑO DE LOS ULTIMOS 12 MESES (GRAFICO) //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("EvolucionDesempenoUltimos6Meses")]
    public async Task<ActionResult<IEnumerable<EvolucionDesempenoGrafico>>> GetEvolucionDesempenoUltimos6Meses()
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

            if (supervisor == null || supervisor.Puesto == null)
                return Ok(new List<EvolucionDesempenoGrafico>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        DateTime hoy = DateTime.Today;

        var meses = Enumerable.Range(0, 6)
            .Select(i => hoy.AddMonths(-i))
            .Select(f => new { f.Year, f.Month })
            .Reverse()
            .ToList();

        var evaluacionesObtener = _context.Evaluacion
            .Include(e => e.Empleado)
                .ThenInclude(emp => emp.Puesto)
            .Where(e => e.Fecha >= new DateTime(meses.First().Year, meses.First().Month, 1))
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            evaluacionesObtener = evaluacionesObtener.Where(e => e.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        var datos = await evaluacionesObtener
            .Select(e => new
            {
                Anio = e.Fecha.Year,
                Mes = e.Fecha.Month,
                Calificacion = e.Calificacion
            })
            .ToListAsync();

        var agrupado = datos
            .GroupBy(x => new { x.Anio, x.Mes })
            .ToDictionary(
                g => $"{g.Key.Anio}-{g.Key.Mes}",
                g => g.Average(x => x.Calificacion)
            );

        var resultado = meses.Select(m => new EvolucionDesempenoGrafico
        {
            Anio = m.Year,
            Mes = m.Month,
            Promedio = agrupado.ContainsKey($"{m.Year}-{m.Month}") ? agrupado[$"{m.Year}-{m.Month}"] : 0
        })
        .ToList();

        return Ok(resultado);
    }






    //////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LISTADO DE EVALUACION POR EMPELADO - NIVEL 2
    //////////////////////////////////////////////////////////////////////////////
    [HttpPost("EmpleadoEvaluacionesN2")]
    public async Task<ActionResult<List<EmpleadoEvaluacionesListadoN2>>> ObtenerEvaluacionesPorEmpleado([FromBody] FiltrarEmpleadoEvaluaciones filtro)
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
                return Ok(new List<EmpleadoEvaluacionesListadoN2>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var evaluaciones = _context.Evaluacion
            .Include(e => e.Empleado)
            .ThenInclude(emp => emp.Puesto)
            .Where(e => !e.Empleado.Eliminado)
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            evaluaciones = evaluaciones.Where(e => e.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        if (filtro.FechaDesde.HasValue)
            evaluaciones = evaluaciones.Where(e => e.Fecha >= filtro.FechaDesde.Value);

        if (filtro.FechaHasta.HasValue)
            evaluaciones = evaluaciones.Where(e => e.Fecha <= filtro.FechaHasta.Value);

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            evaluaciones = evaluaciones.Where(h => h.Empleado.NroLegajo.Contains(filtro.NroLegajo));

        if (!string.IsNullOrEmpty(filtro.Nombre))
            evaluaciones = evaluaciones.Where(e => e.Empleado.NombreCompleto.Contains(filtro.Nombre));

        var listaEvaluaciones = await evaluaciones.ToListAsync();

        var resultado = listaEvaluaciones
            .GroupBy(e => e.Empleado)
            .OrderBy(g => g.Key.NroLegajo)
            .Select(grupoEmpleado => new EmpleadoEvaluacionesListadoN2
            {
                NroLegajo = grupoEmpleado.Key.NroLegajo,
                Nombre = grupoEmpleado.Key.NombreCompleto,

                Evaluaciones = grupoEmpleado
                    .OrderBy(ev => ev.Fecha)
                    .Select(ev => new EvaluacionListadoN2
                    {
                        Fecha = ev.Fecha,
                        Periodo = $"{ev.Fecha.ToString("MMMM").ToUpper()} {ev.Fecha.Year}",
                        Calificacion = ev.Calificacion
                    })
                    .ToList()
            })
            .ToList();

        return Ok(resultado);
    }



    //////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LISTADO DE EVALUACION POR EMPELADO Y SU CRITERIO - NIVEL 3
    //////////////////////////////////////////////////////////////////////////////
    [HttpPost("EmpleadoEvaluacionesCriteriosN3")]
    public async Task<ActionResult<List<EmpleadoEvaluacionesListadoN3>>> ObtenerEvaluacionesConCriterios([FromBody] FiltrarEmpleadoEvaluacionesCriterios filtro)
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
                return Ok(new List<EmpleadoEvaluacionesListadoN3>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var evaluaciones = _context.Evaluacion
            .Include(e => e.Empleado)
                .ThenInclude(emp => emp.Puesto)
            .Include(e => e.CriterioDeEvaluacion)
                .ThenInclude(c => c.TipoDeCriterio)
            .Where(e => !e.Empleado.Eliminado)
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            evaluaciones = evaluaciones.Where(e => e.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        if (!string.IsNullOrEmpty(filtro.Nombre))
            evaluaciones = evaluaciones.Where(e => e.Empleado.NombreCompleto.Contains(filtro.Nombre));

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            evaluaciones = evaluaciones.Where(h => h.Empleado.NroLegajo.Contains(filtro.NroLegajo));

        if (filtro.FechaDesde.HasValue)
            evaluaciones = evaluaciones.Where(e => e.Fecha >= filtro.FechaDesde.Value);

        if (filtro.FechaHasta.HasValue)
            evaluaciones = evaluaciones.Where(e => e.Fecha <= filtro.FechaHasta.Value);

        var lista = await evaluaciones.ToListAsync();

        var resultado = lista
            .GroupBy(e => e.Empleado)
            .OrderBy(g => g.Key.NroLegajo)
            .Select(grupoEmpleado => new EmpleadoEvaluacionesListadoN3
            {
                NroLegajo = grupoEmpleado.Key.NroLegajo,
                Nombre = grupoEmpleado.Key.NombreCompleto,

                Evaluaciones = grupoEmpleado
                    .OrderBy(e => e.Fecha)
                    .Select(ev => new EvaluacionCriteriosListadoN3
                    {
                        Fecha = ev.Fecha,
                        Periodo = $"{ev.Fecha.ToString("MMMM").ToUpper()} {ev.Fecha.Year}",
                        Calificacion = ev.Calificacion,

                        Criterios = ev.CriterioDeEvaluacion
                            .Select(c => new CriterioListadoN3
                            {
                                Nombre = c.TipoDeCriterio.Nombre,
                                Descripcion = c.Descripcion
                            })
                            .ToList()
                    })
                    .ToList()
            })
            .ToList();

        return Ok(resultado);
    }



    //////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LISTADO DE EVALUACION POR SECTOR Y EMPELADO - NIVEL 3
    //////////////////////////////////////////////////////////////////////////////
    [HttpPost("PuestoEmpleadosEvaluacionesN3")]
    public async Task<ActionResult<List<PuestoEmpleadosEvaluacionesListadoN3>>> ObtenerPuestoEmpleadosEvaluaciones([FromBody] FiltrarPuestoEmpleadosEvaluaciones filtro)
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
                return Ok(new List<PuestoEmpleadosEvaluacionesListadoN3>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var evaluaciones = _context.Evaluacion
            .Include(e => e.Empleado)
                .ThenInclude(emp => emp.Puesto)
            .Where(e => !e.Empleado.Eliminado)
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            evaluaciones = evaluaciones.Where(e => e.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        if (filtro.Puesto.HasValue)
            evaluaciones = evaluaciones.Where(e => e.Empleado.PuestoId == filtro.Puesto.Value);

        if (!string.IsNullOrEmpty(filtro.Nombre))
            evaluaciones = evaluaciones.Where(h => h.Empleado.NombreCompleto.Contains(filtro.Nombre));

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            evaluaciones = evaluaciones.Where(h => h.Empleado.NroLegajo.Contains(filtro.NroLegajo));

        if (filtro.FechaDesde.HasValue)
            evaluaciones = evaluaciones.Where(e => e.Fecha >= filtro.FechaDesde.Value);

        if (filtro.FechaHasta.HasValue)
            evaluaciones = evaluaciones.Where(e => e.Fecha <= filtro.FechaHasta.Value);

        var lista = await evaluaciones.ToListAsync();

        var resultado = lista
            .GroupBy(e => e.Empleado.Puesto)
            .OrderBy(g => g.Key.Descripcion)
            .Select(grupoPuesto => new PuestoEmpleadosEvaluacionesListadoN3
            {
                Nombre = grupoPuesto.Key.Descripcion,

                Empleados = grupoPuesto
                    .GroupBy(e => e.Empleado)
                    .OrderBy(g => g.Key.NroLegajo)
                    .Select(grupoEmpleado => new EmpleadoEvaluacionListadoN3
                    {
                        Nombre = grupoEmpleado.Key.NombreCompleto,
                        NroLegajo = grupoEmpleado.Key.NroLegajo,

                        Evaluaciones = grupoEmpleado
                            .OrderBy(e => e.Fecha)
                            .Select(ev => new EvaluacionListadoN3B
                            {
                                Fecha = ev.Fecha,
                                Periodo = $"{ev.Fecha.ToString("MMMM").ToUpper()} {ev.Fecha.Year}",
                                Calificacion = ev.Calificacion
                            })
                            .ToList()
                    })
                    .ToList()
            })
            .ToList();

        return Ok(resultado);
    }


    //////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER PROMEDIO DE CALIFICACIONES POR EMPLEADO - NIVEL 2
    //////////////////////////////////////////////////////////////////////////////
    [HttpPost("PromedioCalificacionesEmpleadoN2")]
    public async Task<ActionResult<List<PromedioCalificacionEmpleadoN2>>> ObtenerPromedioCalificacionesEmpleadoN2([FromBody] FiltrarPromedioCalificacionEmpleado filtro)
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
                return Ok(new List<PromedioCalificacionEmpleadoN2>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var empleados = _context.Empleado
            .Include(e => e.Evaluacion)
            .Include(e => e.Puesto)
            .Where(e => !e.Eliminado)
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            empleados = empleados.Where(e => e.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        if (!string.IsNullOrEmpty(filtro.Nombre))
            empleados = empleados.Where(e => e.NombreCompleto.Contains(filtro.Nombre));

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            empleados = empleados.Where(e => e.NroLegajo.Contains(filtro.NroLegajo));

        var lista = await empleados.ToListAsync();

        var resultado = lista
            .Select(e =>
            {
                var evaluaciones = e.Evaluacion
                    .Where(ev => (!filtro.FechaDesde.HasValue || ev.Fecha >= filtro.FechaDesde)
                              && (!filtro.FechaHasta.HasValue || ev.Fecha <= filtro.FechaHasta))
                    .OrderBy(ev => ev.Fecha)
                    .ToList();
                    if (!evaluaciones.Any())
            return null;

                var promedios = new List<PromedioCalificacionN2>();

                if (evaluaciones.Any())
                {
                    var promedio = (int)Math.Round(evaluaciones.Average(ev => ev.Calificacion));
                    var cantidad = evaluaciones.Count;
                    var mejor = evaluaciones.Max(ev => ev.Calificacion);
                    var peor = evaluaciones.Min(ev => ev.Calificacion);
                    var variacion = cantidad >= 2 ? evaluaciones.Last().Calificacion - evaluaciones.First().Calificacion : 0;
                    var ultima = evaluaciones.Last().Fecha;

                    promedios.Add(new PromedioCalificacionN2
                    {
                        Promedio = promedio,
                        CantidadEvaluaciones = cantidad,
                        MejorCalificacion = mejor,
                        PeorCalificacion = peor,
                        Variacion = variacion,
                        UltimaEvaluacion = ultima
                    });
                }

                return new PromedioCalificacionEmpleadoN2
                {
                    Nombre = e.NombreCompleto,
                    NroLegajo = e.NroLegajo,
                    Promedios = promedios
                };
            })
            .Where(r => r != null) 
            .OrderBy(r => r.NroLegajo)
            .ToList();

        return Ok(resultado);
    }





    //////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER PROMEDIO DE CALIFICACIONES POR PUESTO - NIVEL 2
    //////////////////////////////////////////////////////////////////////////////
    [HttpPost("PromedioCalificacionesPuestoN2")]
    public async Task<ActionResult<List<PromedioCalificacionPuestoN2>>> ObtenerPromedioCalificacionesPuesto([FromBody] FiltrarPromedioCalificacionPuestoN2 filtro)
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
                return Ok(new List<PromedioCalificacionPuestoN2>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var empleados = _context.Empleado
            .Include(e => e.Evaluacion)
            .Include(e => e.Puesto)
            .Where(e => !e.Eliminado)
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            empleados = empleados.Where(e => e.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        if (filtro.Puesto.HasValue)
            empleados = empleados.Where(e => e.PuestoId == filtro.Puesto.Value);

        var lista = await empleados.ToListAsync();

        var resultado = lista
            .GroupBy(e => e.Puesto)
            .Select(grupoPuesto =>
            {
                var todasEvaluaciones = grupoPuesto.SelectMany(e => e.Evaluacion
                    .Where(ev => (!filtro.FechaDesde.HasValue || ev.Fecha >= filtro.FechaDesde)
                              && (!filtro.FechaHasta.HasValue || ev.Fecha <= filtro.FechaHasta)));

                var promediosEmpleados = grupoPuesto
                    .Select(e => e.Evaluacion.Any() ? e.Evaluacion.Average(ev => ev.Calificacion) : 0)
                    .ToList();

                var promedioPuesto = new PromedioCalificacionPN2
                {
                    Promedio = todasEvaluaciones.Any() ? (int)Math.Round(todasEvaluaciones.Average(ev => ev.Calificacion)) : 0,
                    CantidadEmpleados = grupoPuesto.Count(),
                    CantidadEvaluaciones = todasEvaluaciones.Count(),
                    MejorPromedioEmpleado = promediosEmpleados.Any() ? (int)Math.Round(promediosEmpleados.Max()) : 0,
                    PeorPromedioEmpleado = promediosEmpleados.Any() ? (int)Math.Round(promediosEmpleados.Min()) : 0
                };

                return new PromedioCalificacionPuestoN2
                {
                    Puesto = grupoPuesto.Key.Descripcion,
                    Promedios = new List<PromedioCalificacionPN2> { promedioPuesto }
                };
            })
            .OrderBy(r => r.Puesto)
            .ToList();

        return Ok(resultado);
    }





    //////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER EVOLUCION DEL DESEMPEÑO POR AÑO/TRIMESTRE - NIVEL 3
    //////////////////////////////////////////////////////////////////////////////
    [HttpPost("EvolucionDesempenoN3")]
    public async Task<ActionResult<List<EvolucionDesempenoPeriodoN3>>> ObtenerEvolucionDesempeno([FromBody] FiltrarEvolucionDesempenoN3 filtro)
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
                return Ok(new List<EvolucionDesempenoPeriodoN3>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var evaluaciones = _context.Evaluacion
            .Include(e => e.Empleado)
                .ThenInclude(emp => emp.Puesto)
            .Where(e => !e.Empleado.Eliminado)
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            evaluaciones = evaluaciones.Where(e => e.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        if (filtro.Puesto.HasValue)
            evaluaciones = evaluaciones.Where(e => e.Empleado.PuestoId == filtro.Puesto);

        if (filtro.Empleado.HasValue)
            evaluaciones = evaluaciones.Where(e => e.EmpleadoId == filtro.Empleado);

        if (filtro.Año.HasValue)
            evaluaciones = evaluaciones.Where(e => e.Fecha.Year == filtro.Año.Value);

        if (filtro.Trimestre.HasValue)
        {
            evaluaciones = evaluaciones.Where(e => ((e.Fecha.Month - 1) / 3 + 1) == filtro.Trimestre.Value);
        }

        var lista = await evaluaciones.ToListAsync();

        var grupos = lista
            .GroupBy(ev => new { Año = ev.Fecha.Year, Trimestre = (ev.Fecha.Month - 1) / 3 + 1 })
            .OrderBy(g => g.Key.Año).ThenBy(g => g.Key.Trimestre)
            .ToList();

        var resultado = grupos
            .Select((grupo, index) =>
            {
                var promedio = (int)Math.Round(grupo.Average(ev => ev.Calificacion));
                var anterior = index > 0 ? (int)Math.Round(grupos[index - 1].Average(ev => ev.Calificacion)) : 0;

                return new EvolucionDesempenoPeriodoN3
                {
                    Año = grupo.Key.Año,
                    Trimestre = grupo.Key.Trimestre,
                    Promedio = promedio,
                    CantidadEvaluaciones = grupo.Count(),
                    MaxCalificacion = grupo.Max(ev => ev.Calificacion),
                    MinCalificacion = grupo.Min(ev => ev.Calificacion),
                    VariacionRespectoAnterior = promedio - anterior,
                    FechaOrden = grupo.Min(ev => ev.Fecha)
                };
            })
            .ToList();

        return Ok(resultado);
    }


    //////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER VARIACION DE DESEMPEÑO POR EMPLEADO - NIVEL 4
    //////////////////////////////////////////////////////////////////////////////
    [HttpPost("VariacionDesempenoEmpleadoN4")]
    public async Task<ActionResult<List<VariacionDesempenoEmpleadoN4>>> ObtenerVariacionDesempenoEmpleado([FromBody] FiltrarVariacionDesempenoEmpleadoN4 filtro)
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
                return Ok(new List<VariacionDesempenoEmpleadoN4>());

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var empleados = _context.Empleado
            .Include(e => e.Evaluacion)
            .Include(e => e.Puesto)
            .Where(e => !e.Eliminado)
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            empleados = empleados.Where(e => e.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        if (!string.IsNullOrEmpty(filtro.Nombre))
            empleados = empleados.Where(e => e.NombreCompleto.Contains(filtro.Nombre));

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            empleados = empleados.Where(e => e.NroLegajo.Contains(filtro.NroLegajo));

        if (filtro.Puesto.HasValue)
            empleados = empleados.Where(e => e.PuestoId == filtro.Puesto);

        var lista = await empleados.ToListAsync();

        var resultado = lista
            .Select(e =>
            {
                var evaluaciones = e.Evaluacion
                    .Where(ev => (!filtro.FechaDesde.HasValue || ev.Fecha >= filtro.FechaDesde)
                              && (!filtro.FechaHasta.HasValue || ev.Fecha <= filtro.FechaHasta))
                    .OrderBy(ev => ev.Fecha)
                    .ToList();

                if (evaluaciones.Count < 2)
                {
                    return new VariacionDesempenoEmpleadoN4
                    {
                        Nombre = e.NombreCompleto,
                        NroLegajo = e.NroLegajo,
                        Varacion = new List<VariacionDesempenoN4>()
                    };
                }

                var variaciones = new List<VariacionDesempenoN4>();
                for (int i = 1; i < evaluaciones.Count; i++)
                {
                    var anterior = evaluaciones[i - 1];
                    var actual = evaluaciones[i];

                    var estado = actual.Calificacion > anterior.Calificacion ? "SUBIO"
                               : actual.Calificacion < anterior.Calificacion ? "BAJO"
                               : "SE MANTUVO";

                    if (string.IsNullOrEmpty(filtro.Estado) || filtro.Estado == estado)
                    {
                        variaciones.Add(new VariacionDesempenoN4
                        {
                            Estado = estado,
                            CalificacionAnterior = anterior.Calificacion,
                            CalificacionActual = actual.Calificacion,
                            Diferencia = actual.Calificacion - anterior.Calificacion,
                            FechaAnterior = anterior.Fecha,
                            FechaActual = actual.Fecha
                        });
                    }
                }

                return new VariacionDesempenoEmpleadoN4
                {
                    Nombre = e.NombreCompleto,
                    NroLegajo = e.NroLegajo,
                    Varacion = variaciones
                };
            })
            .OrderBy(r => r.NroLegajo)
            .ToList();

        return Ok(resultado);
    }



    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///FIN DE LOS METODOS PARA OBTENEER RESULTADOS DE GESTION DE DESEMPEÑO - GRAFICOS Y LISTADOS ///
    /// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////




    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///INICIO DE LOS METODOS PARA OBTENEER RESULTADOS DE GESTION DE LICENCIAS - GRAFICOS Y LISTADOS ///
    /// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LA LCIENCIAS COMPARATIVA POR MES (GRAFICO) //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("LicenciasMensualesGrafico6Meses")]
    public async Task<ActionResult<IEnumerable<LicenciasMensualesGrafico>>> LicenciasMensualesGrafico6Meses()
    {
        DateTime hoy = DateTime.Today;

        var meses = Enumerable.Range(0, 6)
            .Select(i => hoy.AddMonths(-i))
            .Select(f => new { f.Year, f.Month })
            .Reverse()
            .ToList();

        var fechaInicio = new DateTime(meses.First().Year, meses.First().Month, 1);
        var fechaFin = fechaInicio.AddMonths(6).AddDays(-1);

        var datos = await _context.Licencia
        .Where(l =>
            l.FechaInicio <= fechaFin &&
            l.FechaFin >= fechaInicio
        )
        .Select(l => new
        {
            Anio = l.FechaInicio.Year,
            Mes = l.FechaInicio.Month,
            Estado = l.Estado
        })
        .ToListAsync();

        var agrupado = datos
            .GroupBy(x => new { x.Anio, x.Mes })
            .ToDictionary(
        g => $"{g.Key.Anio}-{g.Key.Mes}",
        g => new LicenciasMensualesGrafico
        {
            Anio = g.Key.Anio,
            Mes = g.Key.Mes,
            TotalLicencias = g.Count(),
            TotalAprobadas = g.Count(x => x.Estado == EstadoLicencia.APROBADA),
            TotalRechazadas = g.Count(x => x.Estado == EstadoLicencia.RECHAZADA)
        }
        );

        var resultado = meses.Select(m => new LicenciasMensualesGrafico
        {
            Anio = m.Year,
            Mes = m.Month,
            TotalLicencias = agrupado.ContainsKey($"{m.Year}-{m.Month}") ? agrupado[$"{m.Year}-{m.Month}"].TotalLicencias : 0,
            TotalAprobadas = agrupado.ContainsKey($"{m.Year}-{m.Month}") ? agrupado[$"{m.Year}-{m.Month}"].TotalAprobadas : 0,
            TotalRechazadas = agrupado.ContainsKey($"{m.Year}-{m.Month}") ? agrupado[$"{m.Year}-{m.Month}"].TotalRechazadas : 0
        })
        .ToList();

        return Ok(resultado);
    }


    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LAS LICENCIAS POR TIPO (GRAFICO) //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("LicenciasPorTipo")]
    public async Task<ActionResult<IEnumerable<TipoLicenciaGrafico>>> LicenciasPorTipo()
    {
        var datos = await _context.Licencia
            .Include(l => l.TipoDeLicencia)
            .Where(l => !l.TipoDeLicencia.Eliminado && l.Estado == EstadoLicencia.APROBADA)
            .ToListAsync();

        var resultado = datos
            .GroupBy(l => l.TipoDeLicencia.Nombre)
            .Select(g => new TipoLicenciaGrafico
            {
                Tipo = CultureInfo.CurrentCulture.TextInfo
                    .ToTitleCase(g.Key.ToLower()),
                TotalLicencias = g.Count(),
                PromedioDias = g.Average(l => (l.FechaFin - l.FechaInicio).TotalDays)
            })
            .OrderByDescending(x => x.TotalLicencias)
            .ToList();

        return Ok(resultado);
    }


    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LA CANTIDAD DE LICENCIAS POR SECTOR (GRAFICO)  //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("LicenciasPorSector")]
    public async Task<ActionResult<IEnumerable<LicenciasPorSector>>> LicenciasPorSector()
    {
        var datos = await _context.Licencia
            .Include(l => l.Empleado)
            .ThenInclude(e => e.Puesto)
            .ThenInclude(p => p.Sector)
            .Where(l => l.Estado == EstadoLicencia.APROBADA)
            .ToListAsync();

        var resultado = datos
            .Where(l => l.Empleado?.Puesto?.Sector != null)
            .GroupBy(l => l.Empleado.Puesto.Sector.Nombre)
            .Select(g => new LicenciasPorSector
            {
                Sector = CultureInfo.CurrentCulture.TextInfo
                        .ToTitleCase(g.Key.ToLower()),
                TotalLicencias = g.Count(),
                PromedioDias = g.Average(l =>
                    (l.FechaFin - l.FechaInicio).TotalDays
            )
            })
            .OrderByDescending(x => x.TotalLicencias)
            .ToList();

        return Ok(resultado);
    }


    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LA CANTIDAD DE LICENCIAS POR PUESTO (GRAFICO)  //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("LicenciasPorPuesto")]
    public async Task<ActionResult<IEnumerable<LicenciasPorPuesto>>> LicenciasPorPuesto()
    {
        var datos = await _context.Licencia
            .Include(l => l.Empleado)
            .ThenInclude(l => l.Puesto)
            .Where(l => l.Estado == EstadoLicencia.APROBADA)
            .ToListAsync();

        var resultado = datos
            .Where(l => l.Empleado?.Puesto != null)
            .GroupBy(l => l.Empleado.Puesto.Descripcion)
            .Select(g => new LicenciasPorPuesto
            {
                Puesto = CultureInfo.CurrentCulture.TextInfo
                        .ToTitleCase(g.Key.ToLower()),
                TotalLicencias = g.Count(),
                PromedioDias = g.Average(l =>
                    (l.FechaFin - l.FechaInicio).TotalDays
            )
            })
            .OrderByDescending(x => x.TotalLicencias)
            .ToList();

        return Ok(resultado);
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    /// MÉTODO PARA OBTENER LISTADO DE LICENCIAS POR EMPLEADO Y ESTADO - NIVEL 3
    //////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("LicenciasPorEmpleadoEstadoN3")]
    public async Task<ActionResult<IEnumerable<LicenciaEmpleadoEstadoListadoN3>>> GetLicenciasPorEmpleadoEstadoN3([FromBody] FiltrarLicenciaEmpleadoEstado filtro)
    {
        var licencias = _context.Licencia
            .Include(l => l.Empleado)
            .Include(l => l.TipoDeLicencia)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filtro.Nombre))
            licencias = licencias.Where(e => e.Empleado.NombreCompleto.Contains(filtro.Nombre));

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            licencias = licencias.Where(e => e.Empleado.NroLegajo.Contains(filtro.NroLegajo));

        if (filtro.FechaDesde.HasValue)
            licencias = licencias.Where(l => l.FechaInicio >= filtro.FechaDesde.Value);

        if (filtro.FechaHasta.HasValue)
            licencias = licencias.Where(l => l.FechaFin <= filtro.FechaHasta.Value);

        var obetenerLicencias = await licencias.ToListAsync();

        var resultado = obetenerLicencias
            .GroupBy(l => new { l.Empleado.NombreCompleto, l.Empleado.NroLegajo })
            .OrderBy(l => l.Key.NroLegajo)
            .Select(g => new LicenciaEmpleadoEstadoListadoN3
            {
                Nombre = g.Key.NombreCompleto,
                NroLegajo = g.Key.NroLegajo,
                Estado = g.GroupBy(x => x.Estado.ToString())
                          .OrderBy(x => x.Key)
                          .Select(est => new LicenciaEstadoListadoN3
                          {
                              Nombre = est.Key,
                              Licencia = est.Select(l => new LicenciaListadoN3
                              {
                                  TipoDeLicencia = l.TipoDeLicencia.Nombre,
                                  Periodo = $"{l.FechaInicio:dd/MM/yyyy} - {l.FechaFin:dd/MM/yyyy}"
                              }).ToList()
                          }).ToList()
            }).ToList();

        return Ok(resultado);
    }



    //////////////////////////////////////////////////////////////////////////////////////////////
    /// MÉTODO PARA OBTENER LISTADO DE LICENCIAS POR TIPO - NIVEL 3
    //////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("LicenciasPorTipoN3")]
    public async Task<ActionResult<IEnumerable<LicenciaTipoListadoN3>>> GetLicenciasPorTipoN3([FromBody] FiltrarLicenciaPorTipo filtro)
    {
        var licencias = _context.Licencia
            .Include(l => l.Empleado)
            .Include(l => l.TipoDeLicencia)
            .AsQueryable();

        if (filtro.TipoDeLicenciaId.HasValue)
            licencias = licencias.Where(l => l.TipoDeLicenciaId == filtro.TipoDeLicenciaId.Value);

        if (!string.IsNullOrEmpty(filtro.Nombre))
            licencias = licencias.Where(l => l.Empleado.NombreCompleto.Contains(filtro.Nombre));

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            licencias = licencias.Where(l => l.Empleado.NroLegajo.Contains(filtro.NroLegajo));

        if (filtro.FechaDesde.HasValue)
            licencias = licencias.Where(l => l.FechaInicio >= filtro.FechaDesde.Value);

        if (filtro.FechaHasta.HasValue)
            licencias = licencias.Where(l => l.FechaFin <= filtro.FechaHasta.Value);

        if (filtro.Estado.HasValue)
            licencias = licencias.Where(l => (int)l.Estado == filtro.Estado.Value);

        var obtenerlicencias = await licencias.ToListAsync();

        var resultado = obtenerlicencias
            .GroupBy(l => l.TipoDeLicencia.Nombre)
            .OrderBy(l => l.Key)
            .Select(g => new LicenciaTipoListadoN3
            {
                TipoDeLicencia = g.Key,
                Empleados = g.GroupBy(x => new { x.Empleado.NombreCompleto, x.Empleado.NroLegajo })
                             .OrderBy(x => x.Key.NroLegajo)
                             .Select(emp => new LicenciaTipoEmpleadoListadoN3
                             {
                                 Nombre = emp.Key.NombreCompleto,
                                 NroLegajo = emp.Key.NroLegajo,
                                 Licencias = emp.Select(l => new LicenciaTipoDetalleListadoN3
                                 {
                                     Periodo = $"{l.FechaInicio:dd/MM/yyyy} - {l.FechaFin:dd/MM/yyyy}",
                                     Estado = l.Estado.ToString()
                                 }).ToList()
                             }).ToList()
            }).ToList();

        return Ok(resultado);
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    /// MÉTODO PARA OBTENER LISTADO DE LICENCIAS POR SECTOR - NIVEL 4
    //////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("LicenciasPorSectorN4")]
    public async Task<ActionResult<IEnumerable<LicenciaSectorListadoN3>>> GetLicenciasPorSectorN4([FromBody] FiltrarLicenciaPorSector filtro)
    {
        var licencias = _context.Licencia
            .Include(l => l.Empleado)
                .ThenInclude(e => e.Puesto)
                    .ThenInclude(p => p.Sector)
            .Include(l => l.TipoDeLicencia)
            .AsQueryable();

        if (filtro.Sector.HasValue)
            licencias = licencias.Where(l => l.Empleado.Puesto.SectorId == filtro.Sector.Value);

        if (filtro.Puesto.HasValue)
            licencias = licencias.Where(l => l.Empleado.PuestoId == filtro.Puesto.Value);

        if (!string.IsNullOrEmpty(filtro.Nombre))
            licencias = licencias.Where(l => l.Empleado.NombreCompleto.Contains(filtro.Nombre));

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            licencias = licencias.Where(l => l.Empleado.NroLegajo.Contains(filtro.NroLegajo));

        if (filtro.FechaDesde.HasValue)
            licencias = licencias.Where(l => l.FechaInicio >= filtro.FechaDesde.Value);

        if (filtro.FechaHasta.HasValue)
            licencias = licencias.Where(l => l.FechaFin <= filtro.FechaHasta.Value);

        if (filtro.Estado.HasValue)
            licencias = licencias.Where(l => (int)l.Estado == filtro.Estado.Value);

        var obetenerLicencias = await licencias.ToListAsync();

        var resultado = obetenerLicencias
            .GroupBy(l => l.Empleado.Puesto.Sector.Nombre)
            .OrderBy(l => l.Key)
            .Select(sector => new LicenciaSectorListadoN3
            {
                Sector = sector.Key,
                Puestos = sector.GroupBy(p => p.Empleado.Puesto.Descripcion)
                                .OrderBy(p => p.Key)
                                .Select(puesto => new LicenciaPuestoListadoN3
                                {
                                    Puesto = puesto.Key,
                                    Empleados = puesto.GroupBy(e => new { e.Empleado.NombreCompleto, e.Empleado.NroLegajo })
                                                      .OrderBy(e => e.Key.NroLegajo)
                                                      .Select(emp => new LicenciaEmpleadoListadoN3
                                                      {
                                                          Nombre = emp.Key.NombreCompleto,
                                                          NroLegajo = emp.Key.NroLegajo,
                                                          Licencias = emp.Select(l => new LicenciaDetalleListadoN3
                                                          {
                                                              TipoDeLicencia = l.TipoDeLicencia.Nombre,
                                                              Periodo = $"{l.FechaInicio:dd/MM/yyyy} - {l.FechaFin:dd/MM/yyyy}",
                                                              Estado = l.Estado.ToString()
                                                          }).ToList()
                                                      }).ToList()
                                }).ToList()
            }).ToList();

        return Ok(resultado);
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    /// MÉTODO PARA OBTENER INFORME DE CANTIDAD DE LICENCIAS POR TIPO - NIVEL 1
    //////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("CantidadLicenciasPorTipoN1")]
    public async Task<ActionResult<IEnumerable<CantidadLicenciaPorTipoN1>>> GetCantidadLicenciasPorTipoN1(
        [FromBody] FiltrarCantidadLicenciaPorTipo filtro)
    {
        var licencias = _context.Licencia
            .Include(l => l.TipoDeLicencia)
            .AsQueryable();

        if (filtro.TipoDeLicencia.HasValue)
            licencias = licencias.Where(l => l.TipoDeLicenciaId == filtro.TipoDeLicencia.Value);

        var lista = await licencias.ToListAsync();
        var total = lista.Count;

        var resultado = lista
            .GroupBy(l => l.TipoDeLicencia.Nombre)
            .OrderBy(g => g.Key)
            .Select(g => new CantidadLicenciaPorTipoN1
            {
                TipoLicencia = g.Key,
                Cantidad = g.Count(),
                PorcentajeTotal = total > 0
                    ? Math.Round((decimal)g.Count() * 100 / total, 2)
                    : 0,
                PromedioDias = g.Any()
                    ? Math.Round(
                        g.Average(x => (decimal)(x.FechaFin - x.FechaInicio).TotalDays),
                        2)
                    : 0
            })
            .ToList();

        return Ok(resultado);
    }



    //////////////////////////////////////////////////////////////////////////////////////////////
    /// MÉTODO PARA OBTENER INFORME DE PROMEDIO DE DÍAS POR SECTOR Y PUESTO - NIVEL 3
    //////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("PromedioDiasPorSectorPuestoN3")]
    public async Task<ActionResult<IEnumerable<PromedioPorDiasSectorPuestoN3>>>
     GetPromedioDiasPorSectorPuestoN3([FromBody] FiltrarPromediosPorDias filtro)
    {
        var licencias = _context.Licencia
            .Include(l => l.Empleado)
                .ThenInclude(e => e.Puesto)
                    .ThenInclude(p => p.Sector)
            .AsQueryable();

        if (filtro.Puesto.HasValue)
            licencias = licencias.Where(l => l.Empleado.PuestoId == filtro.Puesto.Value);

        var lista = await licencias.ToListAsync();

        var resultado = lista
            .GroupBy(l => l.Empleado.Puesto.Sector.Nombre)
            .OrderBy(g => g.Key)
            .Select(sector => new PromedioPorDiasSectorPuestoN3
            {
                NombreSector = sector.Key,
                Puestos = sector
                    .GroupBy(p => p.Empleado.Puesto.Descripcion)
                    .OrderBy(p => p.Key)
                    .Select(puesto => new PromedioPorDiasPuestoN3
                    {
                        NombrePuesto = puesto.Key,
                        Promedios = new List<PromedioPorDiasN3>
                        {
                        new PromedioPorDiasN3
                        {
                            CantidadLicencia = puesto.Count(),
                            PorcentajeDias = puesto.Any()
                                ? Math.Round(
                                    (decimal)puesto.Average(x => (x.FechaFin - x.FechaInicio).TotalDays),
                                    2)
                                : 0,
                            MaxDias = puesto.Any()
                                ? (decimal)puesto.Max(x => (x.FechaFin - x.FechaInicio).TotalDays)
                                : 0,
                            MinDias = puesto.Any()
                                ? (decimal)puesto.Min(x => (x.FechaFin - x.FechaInicio).TotalDays)
                                : 0
                        }
                        }
                    }).ToList()
            }).ToList();

        return Ok(resultado);
    }




    //////////////////////////////////////////////////////////////////////////////////////////////
    /// MÉTODO PARA OBTENER INFORME DE DISTRIBUCIÓN DE ESTADOS DE LICENCIA - NIVEL 1
    //////////////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("DistribucionEstadosN1")]
    public async Task<ActionResult<IEnumerable<DistribuccionEstadosN1>>> GetDistribucionEstadosN1()
    {
        var licencias = await _context.Licencia.ToListAsync();
        var total = licencias.Count;

        var resultado = licencias
            .GroupBy(l => l.Estado.ToString())
            .OrderBy(g => g.Key)
            .Select(g => new DistribuccionEstadosN1
            {
                NombreEstado = g.Key,
                Cantidad = g.Count(),
                PorcentajeTotal = total > 0 ? Math.Round((decimal)g.Count() * 100 / total, 2) : 0,
                Ultima = g.Max(x => x.FechaFin)
            }).ToList();

        return Ok(resultado);
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///FIN DE LOS METODOS PARA OBTENEER RESULTADOS DE GESTION DE LICENCIAS - GRAFICOS Y LISTADOS ///
    /// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////<D




    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///INICIO DE LOS METODOS PARA OBTENEER RESULTADOS DE GESTION DE CURSOS - GRAFICOS Y LISTADOS ///
    /// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LA CANTIDAD DE CURSOS SEGUN LA MODADLIDAD //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("CursosPorModalidad")]
    public async Task<IActionResult> GetCursosPorModalidad()
    {
        var cursosPorModalidad = await _context.Curso
            .GroupBy(c => c.Modalidad)
            .Select(g => new CursosPorModalidadDTO
            {
                Modalidad = g.Key.ToString(),
                Cantidad = g.Count()
            })
            .Take(3)
            .ToListAsync();

        return Ok(cursosPorModalidad);
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LA CANTIDAD DE ASISTENCIAS E INASISTENCIAS DE CAD CURSO //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("AsistenciasPorCurso")]
    public async Task<IActionResult> GetAsistenciasPorCurso()
    {
        var datos = await _context.Curso
            .Select(c => new AsistenciaPorCursoDTO
            {
                Curso = c.Nombre,
                Asistencias = c.AsistenciaCapacitacion.Count(a => a.Asistencia),
                Inasistencias = c.AsistenciaCapacitacion.Count(a => !a.Asistencia)
            })
            .Take(5)
            .ToListAsync();

        return Ok(datos);
    }


    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LA CANTIDAD DE CERTIFICADOS OBTENIDOS DE CAD CURSO //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("CertificadosPorCurso")]
    public async Task<IActionResult> GetCertificadosPorCurso()
    {
        var datos = await _context.Curso
            .Select(c => new CertificadosPorCursoDTO
            {
                Curso = c.Nombre,
                CantidadCertificados = _context.Certificado.Count(cert => cert.CursoId == c.Id)
            })
            .Take(5)
            .ToListAsync();

        return Ok(datos);
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER PROMEDIO DE ASISTENCIA Y RESULTADO POR MODALIDAD DE CURSO //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("ComparacionPorModalidad")]
    public async Task<IActionResult> GetComparacionPorModalidad()
    {
        var cursos = await _context.Curso
            .Include(c => c.AsistenciaCapacitacion)
            .ToListAsync();

        var datos = cursos
            .GroupBy(c => c.Modalidad)
            .Select(g => new ComparacionPorModalidadDto
            {
                Modalidad = g.Key.ToString(),
                PromedioAsistencia = g.Average(c =>
                    c.AsistenciaCapacitacion.Count() > 0
                        ? (double)c.AsistenciaCapacitacion.Count(a => a.Asistencia) / c.AsistenciaCapacitacion.Count()
                        : 0),
                PromedioResultado = g.Average(c =>
                    c.AsistenciaCapacitacion.Any()
                        ? c.AsistenciaCapacitacion.Average(a => (double)a.Resultado)
                        : 0)
            })
            .Take(3)
            .ToList();

        return Ok(datos);
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER EL CURSO CON MAS ASISTENCIA //////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("RankingCursos")]
    public async Task<IActionResult> GetRankingCursos()
    {
        var ranking = await _context.Curso
            .Select(c => new RankingCursosDto
            {
                Curso = c.Nombre,
                CantidadAsistentes = c.AsistenciaCapacitacion.Count(a => a.Asistencia)
            })
            .Take(5)
            .OrderByDescending(r => r.CantidadAsistentes)
            .ToListAsync();

        return Ok(ranking);
    }



    //////////////////////////////////////////////////////////////////////////////////////////////
    /// MÉTODO PARA OBTENER LISTADO DE CURSOS POR EMPLEADO - NIVEL 3
    //////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("CursosPorEmpleadoN3")]
    public async Task<ActionResult<IEnumerable<CursoInformeN3>>> CursosPorEmpleadoN3([FromBody] FiltrarCursoEmpleado filtro)
    {
        var certificados = await _context.Certificado.ToListAsync();
        var cursos = await _context.Curso
            .Include(c => c.AsistenciaCapacitacion)
                .ThenInclude(a => a.Empleado)
                .ThenInclude(e => e.Puesto)
            .Where(c => c.AsistenciaCapacitacion.Any(a => a.Asistencia))
            .ToListAsync();

        if (!string.IsNullOrWhiteSpace(filtro.NombreCurso))
        {
            var nombreCurso = filtro.NombreCurso.Trim().ToLower();
            cursos = cursos
                .Where(c => c.Nombre.ToLower().Contains(nombreCurso))
                .ToList();
        }
        var informe = cursos
            .Select(c => new CursoInformeN3
            {
                CursoId = c.Id,
                NombreCurso = c.Nombre,
                Empleados = c.AsistenciaCapacitacion
                    .Where(a =>
                        a.Asistencia &&
                        (string.IsNullOrWhiteSpace(filtro.Nombre) ||
                         a.Empleado.NombreCompleto
                            .ToLower()
                            .Contains(filtro.Nombre.Trim().ToLower())) &&
                        (string.IsNullOrWhiteSpace(filtro.Resultado) ||
                         (filtro.Resultado == "Aprobado" && a.Resultado >= 6) ||
                         (filtro.Resultado == "Reprobado" && a.Resultado < 6))
                    )
                    .Select(a => new CursoEmpleadoN3
                    {
                        EmpleadoId = a.EmpleadoId,
                        NombreEmpleado = a.Empleado.NombreCompleto,
                        NombrePuesto = a.Empleado.Puesto.Descripcion,
                        Asistio = true,
                        CalificacionTexto = a.Resultado >= 6 ? "Aprobado" : "Reprobado",
                        TieneCertificado = certificados.Any(cert =>
                            cert.CursoId == c.Id &&
                            cert.EmpleadoId == a.EmpleadoId)
                    })
                    .ToList()
            })
            .Where(c => c.Empleados.Any())
            .ToList();

        return Ok(informe);
    }



    //////////////////////////////////////////////////////////////////////////////////////////////
    /// MÉTODO PARA OBTENER LISTADO DE CURSOS POR MODALIDAD - NIVEL 2
    //////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("CursosPorModalidadN2")]
    public async Task<ActionResult<List<ModalidadCursos>>> CursosPorModalidadN2([FromBody] FiltroCursoModalidad filtro)
    {
        var cursos = await _context.Curso
            .Include(c => c.AsistenciaCapacitacion)
                .ThenInclude(a => a.Empleado)
            .ToListAsync();

        if (!string.IsNullOrWhiteSpace(filtro.NombreCurso))
        {
            cursos = cursos.Where(c =>
                c.Nombre.ToLower().Contains(filtro.NombreCurso.ToLower()))
                .ToList();
        }
        if (filtro.Modalidad.HasValue && filtro.Modalidad.Value != 0)
            cursos = cursos.Where(c => (int)c.Modalidad == filtro.Modalidad.Value).ToList();

        var resultado = cursos
            .GroupBy(c => c.Modalidad)
            .Select(modalidad => new ModalidadCursos
            {
                Modalidad = modalidad.Key.ToString(),
                Cursos = modalidad.Select(curso => new CursoPorModalidad
                {
                    CursoId = curso.Id,
                    NombreCurso = curso.Nombre,
                }).ToList()
            })
            .Where(m => m.Cursos.Any())
            .ToList();

        return Ok(resultado);
    }



    //////////////////////////////////////////////////////////////////////////////////////////////
    /// MÉTODO PARA OBTENER LISTADO DE CURSOS POR ESTADO - NIVEL 2
    //////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("CursosPorEmpleadoYResultadoN3")]
    public async Task<ActionResult<List<EmpleadoCursos>>> CursosPorEmpleadoYResultadoN3([FromBody] FiltroCursoEmpleado filtro)
    {
        var asistencias = await _context.AsistenciaCapacitacion
            .Include(a => a.Empleado)
            .ThenInclude(e => e.Puesto)
            .Include(a => a.Curso)
            .ToListAsync();

        if (!string.IsNullOrEmpty(filtro.NombreCurso))
        {
            asistencias = asistencias
                .Where(a => a.Curso.Nombre.Contains(filtro.NombreCurso, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        if (!string.IsNullOrEmpty(filtro.Estado))
        {
            asistencias = asistencias
                .Where(a =>
                    (filtro.Estado.Equals("Aprobado", StringComparison.OrdinalIgnoreCase) && a.Resultado >= 6) ||
                    (filtro.Estado.Equals("Reprobado", StringComparison.OrdinalIgnoreCase) && a.Resultado < 6)
                )
                .ToList();
        }

        if (!string.IsNullOrWhiteSpace(filtro.NombreEmpleado))
        {
            asistencias = asistencias
                .Where(a =>
                    a.Empleado.NombreCompleto.ToLower().Contains(filtro.NombreEmpleado.Trim().ToLower())
                )
                .ToList();
        }

        if (filtro.FechaDesde.HasValue)
            asistencias = asistencias
                .Where(a => a.Curso.FechaInicio >= filtro.FechaDesde.Value)
                .ToList();

        if (filtro.FechaHasta.HasValue)
            asistencias = asistencias
                .Where(a => a.Curso.FechaFinalizacion <= filtro.FechaHasta.Value)
                .ToList();

        var resultado = asistencias
            .GroupBy(a => a.EmpleadoId)
            .Select(emp => new EmpleadoCursos
            {
                EmpleadoId = emp.Key,
                NombreEmpleado = emp.First().Empleado.NombreCompleto,
                NombrePuesto = emp.First().Empleado.Puesto.Descripcion,
                Resultados = emp
                    .GroupBy(a => a.Resultado >= 6 ? "Aprobado" : "Reprobado")
                    .Select(r => new ResultadoCursos
                    {
                        Estado = r.Key,
                        Cursos = r.Select(c => new CursoDetalle
                        {
                            CursoId = c.CursoId,
                            NombreCurso = c.Curso.Nombre,
                            Modalidad = c.Curso.Modalidad.ToString(),
                            FechaInicio = c.Curso.FechaInicio,
                            FechaFin = c.Curso.FechaFinalizacion,
                            Nota = c.Resultado
                        }).ToList()
                    }).ToList()
            }).ToList();

        return Ok(resultado);
    }



    //////////////////////////////////////////////////////////////////////////////////////////////
    /// MÉTODO PARA OBTENER UN IINFORME DE RESULTADOS DE CURSOS POR EMPLEADO
    //////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("ResultadoCursoPorEmpleado")]
    public async Task<ActionResult<List<ResultadoCursoPorEmpleado>>> ResultadoCursoPorEmpleado([FromBody] FiltroResultadoCursoPorEmpleado filtro)
    {
        var asistencias = await _context.AsistenciaCapacitacion
            .Include(a => a.Empleado)
            .ThenInclude(e => e.Puesto)
            .Include(a => a.Curso)
            .ToListAsync();

        if (!string.IsNullOrWhiteSpace(filtro.NombreEmpleado))
        {
            asistencias = asistencias
                .Where(a => a.Empleado.NombreCompleto.Contains(filtro.NombreEmpleado.Trim(), StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        if (filtro.FechaDesde.HasValue)
            asistencias = asistencias.Where(a => a.Curso.FechaInicio >= filtro.FechaDesde.Value).ToList();

        if (filtro.FechaHasta.HasValue)
            asistencias = asistencias.Where(a => a.Curso.FechaFinalizacion <= filtro.FechaHasta.Value).ToList();

        if (!string.IsNullOrWhiteSpace(filtro.Estado))
        {
            asistencias = asistencias
                .Where(a =>
                    (filtro.Estado.Equals("Aprobado", StringComparison.OrdinalIgnoreCase) && a.Resultado >= 6) ||
                    (filtro.Estado.Equals("Reprobado", StringComparison.OrdinalIgnoreCase) && a.Resultado < 6)
                )
                .ToList();
        }

        var resultado = asistencias
            .GroupBy(a => a.EmpleadoId)
            .Select(emp => new ResultadoCursoPorEmpleado
            {
                NombreEmpleado = emp.First().Empleado.NombreCompleto,
                NroLegajo = emp.First().Empleado.NroLegajo,
                NombrePuesto = emp.First().Empleado.Puesto.Descripcion,
                TotalCursos = emp.Count(),
                TotalAprobados = emp.Count(a => a.Resultado >= 6),
                TotalReprobados = emp.Count(a => a.Resultado < 6),
                PorcentajeAprobacion = emp.Count(a => a.Resultado >= 6) * 100m / emp.Count(),
                NotaPromedio = emp.Average(a => a.Resultado)
            })
            .ToList();

        return Ok(resultado);
    }



    //////////////////////////////////////////////////////////////////////////////////////////////
    /// MÉTODO PARA OBTENER UN IINFORME ESTADISTICO DE APROBACION Y REPROBACION DE EMPLEADOS 
    //////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("ParticipacionPorCurso")]
    public async Task<ActionResult<List<ParticipacionCursoEstadistico>>> ParticipacionPorCurso([FromBody] FiltroParticipacionCurso filtro)
    {
        var cursos = await _context.Curso
            .Include(c => c.AsistenciaCapacitacion)
                .ThenInclude(a => a.Empleado)
            .Include(c => c.Certificado)
            .AsNoTracking()
            .ToListAsync();

        if (!string.IsNullOrWhiteSpace(filtro.NombreCurso))
            cursos = cursos
                .Where(c => c.Nombre.Contains(filtro.NombreCurso, StringComparison.OrdinalIgnoreCase))
                .ToList();

        if (filtro.FechaDesde.HasValue)
            cursos = cursos.Where(c => c.FechaInicio >= filtro.FechaDesde.Value).ToList();

        if (filtro.FechaHasta.HasValue)
            cursos = cursos.Where(c => c.FechaFinalizacion <= filtro.FechaHasta.Value).ToList();

        if (filtro.Modalidad.HasValue)
            cursos = cursos.Where(c => (int)c.Modalidad == filtro.Modalidad.Value).ToList();

        var resultado = cursos.Select(c => new ParticipacionCursoEstadistico
        {
            NombreCurso = c.Nombre,
            Modalidad = c.Modalidad.ToString(),
            TotalParticipantes = c.AsistenciaCapacitacion.Count,
            TotalAsistentes = c.AsistenciaCapacitacion.Count(a => a.Asistencia),
            TotalAusentes = c.AsistenciaCapacitacion.Count(a => !a.Asistencia),
            PorcentajeAsistencia = c.AsistenciaCapacitacion.Count == 0 ? 0 :
                (decimal)c.AsistenciaCapacitacion.Count(a => a.Asistencia) / c.AsistenciaCapacitacion.Count * 100,
            TotalCertificadosEmitidos = c.Certificado.Count
        }).ToList();

        return Ok(resultado);
    }



    //////////////////////////////////////////////////////////////////////////////////////////////
    /// MÉTODO PARA OBTENER UN IINFORME ESTADISTICO DEL DESEMPEAÑO DE EMPLEADOS EN LOS CURSOS
    //////////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("PromedioCalificacionPorEmpleado")]
    public async Task<ActionResult<List<PromedioCalificacionEmpleadoEstadistico>>> PromedioCalificacionPorEmpleado([FromBody] FiltroPromedioCalificacionEmpleado filtro)
    {
        var asistencias = await _context.AsistenciaCapacitacion
            .Include(a => a.Empleado)
            .ThenInclude(e => e.Puesto)
            .Include(a => a.Curso)
            .AsNoTracking()
            .ToListAsync();

        if (!string.IsNullOrWhiteSpace(filtro.NombreEmpleado))
        {
            asistencias = asistencias
                .Where(a => a.Empleado.NombreCompleto.Contains(filtro.NombreEmpleado, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }
        if (filtro.Modalidad.HasValue)
        {
            asistencias = asistencias
                .Where(a => (int)a.Curso.Modalidad == filtro.Modalidad.Value)
                .ToList();
        }
        if (filtro.FechaDesde.HasValue)
            asistencias = asistencias.Where(a => a.Curso.FechaInicio >= filtro.FechaDesde.Value).ToList();

        if (filtro.FechaHasta.HasValue)
            asistencias = asistencias.Where(a => a.Curso.FechaFinalizacion <= filtro.FechaHasta.Value).ToList();

        var resultado = asistencias
            .GroupBy(a => a.EmpleadoId)
            .Select(emp => new PromedioCalificacionEmpleadoEstadistico
            {
                NombreEmpleado = emp.First().Empleado.NombreCompleto,
                NombrePuesto = emp.First().Empleado.Puesto.Descripcion,
                NroLegajo = emp.First().Empleado.NroLegajo,
                TotalCursosRealizados = emp.Count(),
                NotaPromedio = emp.Any() ? emp.Average(a => a.Resultado) : 0,
                MejorCalificacion = emp.Any() ? emp.Max(a => a.Resultado) : 0,
                PeorCalificacion = emp.Any() ? emp.Min(a => a.Resultado) : 0
            })
            .ToList();

        return Ok(resultado);
    }



    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///FIN DE LOS METODOS PARA OBTENEER RESULTADOS DE GESTION DE CURSOS - GRAFICOS Y LISTADOS ///
    /// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}





