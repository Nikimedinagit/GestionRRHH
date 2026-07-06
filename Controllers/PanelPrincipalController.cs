using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using GestionRRHH.Models.General;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

[ApiController]
[Route("api/[controller]")]
public class PanelPrincipalController : ControllerBase
{
    private readonly Context _context;

    public PanelPrincipalController(Context context)
    {
        _context = context;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LOS DATOS DEL PROXIMOS FESTIVOS /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
    [HttpGet("proximo-festivo")]
    public async Task<IActionResult> ObtenerProximoFestivo()
    {
        var hoy = DateTime.Today;

        int diaHoy = hoy.Day;
        int mesHoy = hoy.Month;

        var proximo = await _context.Feriados
            .Where(f => f.Fecha.Month > mesHoy
                     || (f.Fecha.Month == mesHoy && f.Fecha.Day >= diaHoy))
            .OrderBy(f => f.Fecha.Month)
            .ThenBy(f => f.Fecha.Day)
            .Select(f => new
            {
                Fecha = new DateTime(hoy.Year, f.Fecha.Month, f.Fecha.Day),
                Descripcion = f.Descripcion,
                Tipo = f.Tipos,
                TipoNombre = f.TiposString
            })
            .FirstOrDefaultAsync();

        if (proximo == null)
        {
            proximo = await _context.Feriados
                .OrderBy(f => f.Fecha.Month)
                .ThenBy(f => f.Fecha.Day)
                .Select(f => new
                {
                    Fecha = new DateTime(hoy.Year + 1, f.Fecha.Month, f.Fecha.Day),
                    Descripcion = f.Descripcion,
                    Tipo = f.Tipos,
                    TipoNombre = f.TiposString
                })
                .FirstOrDefaultAsync();
        }

        return Ok(proximo);
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LA ASISTENCIA DEL USUARIO /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    [Authorize(Roles = "RRHH, SUPERVISOR, EMPLEADO")]
    [HttpGet("AsistenciaUsuario")]
    public async Task<IActionResult> ObtenerAsistenciaUsuario()
    {
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var usuario = await _context.Users.FindAsync(userId);
        var emailUsuario = usuario?.Email?.Trim().ToLower();

        var empleado = await _context.Empleado
            .Include(e => e.Horario)
            .Where(e => e.Email.Trim().ToLower() == emailUsuario)
            .FirstOrDefaultAsync();

        var hoy = DateTime.Today;
        var dia = hoy.DayOfWeek;

        // Si el empleado no tiene horarios cargados, devolvemos todo en cero
        var horario = empleado?.Horario?.FirstOrDefault(h =>
            (dia == DayOfWeek.Monday && h.Lunes) ||
            (dia == DayOfWeek.Tuesday && h.Martes) ||
            (dia == DayOfWeek.Wednesday && h.Miercoles) ||
            (dia == DayOfWeek.Thursday && h.Jueves) ||
            (dia == DayOfWeek.Friday && h.Viernes) ||
            (dia == DayOfWeek.Saturday && h.Sabado) ||
            (dia == DayOfWeek.Sunday && h.Domingo));

        var asistencia = await _context.Asistencia
            .Where(a => a.EmpleadoId == empleado.Id && a.Fecha.Date == hoy)
            .FirstOrDefaultAsync();

        double horasTrabajadas = 0;
        if (asistencia != null && horario != null)
        {
            if (asistencia.PrimerEntrada.HasValue && asistencia.PrimerSalida.HasValue)
                horasTrabajadas += (asistencia.PrimerSalida.Value - asistencia.PrimerEntrada.Value).TotalHours;

            if (horario.TipoHorario == TipoHorario.ALTERNO &&
                asistencia.SegundaEntrada.HasValue && asistencia.SegundaSalida.HasValue)
                horasTrabajadas += (asistencia.SegundaSalida.Value - asistencia.SegundaEntrada.Value).TotalHours;
        }

        var resultado = new
        {
            TipoHorario = horario?.TipoHorario.ToString() ?? "SIN HORARIO",
            PrimerEntrada = asistencia?.PrimerEntrada?.ToString(@"hh\:mm") ?? "--:--",
            PrimerSalida = asistencia?.PrimerSalida?.ToString(@"hh\:mm") ?? "--:--",
            SegundaEntrada = horario?.TipoHorario == TipoHorario.ALTERNO
                                ? asistencia?.SegundaEntrada?.ToString(@"hh\:mm") ?? "--:--"
                                : null,
            SegundaSalida = horario?.TipoHorario == TipoHorario.ALTERNO
                                ? asistencia?.SegundaSalida?.ToString(@"hh\:mm") ?? "--:--"
                                : null,
            HorasTrabajadas = Math.Round(horasTrabajadas, 2)
        };

        return Ok(resultado);
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER EL TIEMPO DEL USUARIO /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    [Authorize(Roles = "RRHH, SUPERVISOR, EMPLEADO")]
    [HttpGet("TiempoUsuario")]
    public async Task<IActionResult> ObtenerTiempoUsuario()
    {
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var usuario = await _context.Users.FindAsync(userId);
        var emailUsuario = usuario?.Email?.Trim().ToLower();

        var empleado = await _context.Empleado
            .Include(e => e.Horario)
            .Where(e => e.Email.Trim().ToLower() == emailUsuario)
            .FirstOrDefaultAsync();

        var hoy = DateTime.Today;

        var asistencias = await _context.Asistencia
            .Where(a => a.EmpleadoId == empleado.Id && a.Fecha.Year == hoy.Year)
            .ToListAsync();

        double horasHoy = 0;
        double horasSemana = 0;
        double horasMes = 0;
        double horasAnio = 0;

        foreach (var a in asistencias)
        {
            double horas = 0;

            var dia = a.Fecha.DayOfWeek;
            var horarioDelDia = empleado.Horario.FirstOrDefault(h =>
                (dia == DayOfWeek.Monday && h.Lunes) ||
                (dia == DayOfWeek.Tuesday && h.Martes) ||
                (dia == DayOfWeek.Wednesday && h.Miercoles) ||
                (dia == DayOfWeek.Thursday && h.Jueves) ||
                (dia == DayOfWeek.Friday && h.Viernes) ||
                (dia == DayOfWeek.Saturday && h.Sabado) ||
                (dia == DayOfWeek.Sunday && h.Domingo));

            if (a.PrimerEntrada.HasValue && a.PrimerSalida.HasValue)
                horas += (a.PrimerSalida.Value - a.PrimerEntrada.Value).TotalHours;

            if (horarioDelDia?.TipoHorario == TipoHorario.ALTERNO &&
                a.SegundaEntrada.HasValue && a.SegundaSalida.HasValue)
                horas += (a.SegundaSalida.Value - a.SegundaEntrada.Value).TotalHours;

            if (a.Fecha.Date == hoy) horasHoy += horas;
            if (GetWeekNumber(a.Fecha) == GetWeekNumber(hoy)) horasSemana += horas;
            if (a.Fecha.Month == hoy.Month) horasMes += horas;
            horasAnio += horas;
        }

        return Ok(new
        {
            Hoy = Math.Round(horasHoy, 2),
            Semana = Math.Round(horasSemana, 2),
            Mes = Math.Round(horasMes, 2),
            Anio = Math.Round(horasAnio, 2)
        });
    }

    private int GetWeekNumber(DateTime fecha)
    {
        var culture = System.Globalization.CultureInfo.CurrentCulture;
        return culture.Calendar.GetWeekOfYear(fecha, System.Globalization.CalendarWeekRule.FirstDay, DayOfWeek.Monday);
    }

    private static int ContarDiasLicencia(Licencia licencia)
    {
        return Math.Max(0, (licencia.FechaFin.Date - licencia.FechaInicio.Date).Days + 1);
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LA VACACIONES DEL USUARIO /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    [Authorize(Roles = "RRHH, SUPERVISOR, EMPLEADO")]
    [HttpGet("VacacionesUsuario")]
    public async Task<IActionResult> ObtenerVacacionesUsuario()
    {
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var usuario = await _context.Users.FindAsync(userId);
        var emailUsuario = usuario?.Email?.Trim().ToLower();


        var empleado = await _context.Empleado
            .Include(e => e.Licencia)
            .ThenInclude(l => l.TipoDeLicencia)
            .Where(e => e.Email.Trim().ToLower() == emailUsuario)
            .FirstOrDefaultAsync();

        if (empleado == null) return NotFound("Empleado no encontrado");

        int anioActual = DateTime.Now.Year;

        var fechaActivacion = await _context.ActivacionEmpleado
            .Where(a => a.EmpleadoId == empleado.Id && a.FechaActivacion.HasValue)
            .OrderBy(a => a.FechaActivacion)
            .Select(a => a.FechaActivacion)
            .FirstOrDefaultAsync();

        var anioInicio = fechaActivacion?.Year ?? anioActual;
        var aniosComputables = Math.Max(1, anioActual - anioInicio + 1);
        var diasTotales = Math.Max(0, empleado.DiasVacacionesAnuales) * aniosComputables;

        var vacaciones = empleado.Licencia
            .Where(l => l.TipoDeLicencia.Nombre.ToLower() == "vacaciones" &&
                        (l.Estado == EstadoLicencia.APROBADA || l.Estado == EstadoLicencia.EXPIRADA))
            .ToList();

        int diasTomadosTotales = vacaciones.Sum(ContarDiasLicencia);
        int diasTomadosAnio = vacaciones
            .Where(v => v.FechaInicio.Year == anioActual)
            .Sum(ContarDiasLicencia);
        int diasRestantes = Math.Max(diasTotales - diasTomadosTotales, 0);

        var historial = vacaciones
            .Where(v => v.FechaInicio.Year == anioActual)
            .GroupBy(v => v.FechaInicio.Month)
            .Select(g => new
            {
                Mes = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(
                          new DateTime(anioActual, g.Key, 1)
                              .ToString("MMMM", new CultureInfo("es-ES"))
                      ),
                Dias = g.Sum(ContarDiasLicencia)
            })
            .OrderBy(h => DateTime.ParseExact(h.Mes, "MMMM", new CultureInfo("es-ES")).Month)
            .ToList();

        return Ok(new
        {
            Anio = anioActual,
            Total = diasTotales,
            Anuales = empleado.DiasVacacionesAnuales,
            Restantes = diasRestantes,
            Tomados = diasTomadosAnio,
            TomadosTotales = diasTomadosTotales,
            Historial = historial
        });
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER EL EQUIPO DEL USUARIO /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    [Authorize(Roles = "RRHH, SUPERVISOR, EMPLEADO")]
    [HttpGet("MiEquipo")]
    public async Task<IActionResult> ObtenerMiEquipo()
    {
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var usuario = await _context.Users.FindAsync(userId);
        var emailUsuario = usuario?.Email?.Trim().ToLower();

        var empleado = await _context.Empleado
            .Include(e => e.Puesto)
            .ThenInclude(p => p.Sector)
            .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailUsuario);

        int sectorId = empleado.Puesto?.SectorId ?? 0;
        DateTime hoy = DateTime.Today;

        var companieros = await _context.Empleado
            .Include(e => e.Puesto)
            .ThenInclude(p => p.Sector)
            .Include(e => e.Licencia)
            .ThenInclude(l => l.TipoDeLicencia)
            .Where(e => e.Puesto.SectorId == sectorId && e.Id != empleado.Id)
            .Take(3)
            .Select(e => new
            {
                NombreCompleto = e.NombreCompleto,
                Puesto = e.Puesto.Descripcion,
                Estado = e.Licencia.Any(l =>
                    l.Estado == EstadoLicencia.APROBADA &&
                    l.FechaInicio <= hoy &&
                    l.FechaFin >= hoy)
                    ? "Licencia"
                    : "Presente"
            })
            .ToListAsync();

        return Ok(companieros);
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER EL ESTADOD DE OFICINA /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    [Authorize(Roles = "RRHH, SUPERVISOR, EMPLEADO")]
    [HttpGet("EstadoOficina")]
    public async Task<IActionResult> GetEstadoOficina()
    {
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var usuario = await _context.Users.FindAsync(userId);
        var emailUsuario = usuario?.Email?.Trim().ToLower();
        var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;

        var empleado = await _context.Empleado
            .Include(e => e.Puesto)
            .ThenInclude(p => p.Sector)
            .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailUsuario);

        if (empleado == null)
            return NotFound("Empleado no encontrado.");

        IQueryable<Empleado> empleadosQuery = _context.Empleado
            .Include(e => e.Puesto)
            .ThenInclude(p => p.Sector)
            .Where(e => !e.Eliminado);

        if (rolActual != "RRHH")
        {
            int sectorId = empleado.Puesto.SectorId;
            empleadosQuery = empleadosQuery.Where(e => e.Puesto.SectorId == sectorId);
        }

        var empleados = await empleadosQuery.ToListAsync();

        DateTime hoy = DateTime.Today;
        var licenciasAprobadas = await _context.Licencia
            .Where(l => l.Estado == EstadoLicencia.APROBADA &&
                        l.FechaInicio <= hoy && l.FechaFin >= hoy)
            .ToListAsync();

        int conLicencia = 0;
        int presentes = 0;

        foreach (var emp in empleados)
        {
            bool tieneLicencia = licenciasAprobadas.Any(l => l.EmpleadoId == emp.Id);
            if (tieneLicencia)
                conLicencia++;
            else
                presentes++;
        }

        var resultado = new
        {
            Anio = hoy.Year,
            Presentes = presentes,
            ConLicencia = conLicencia
        };

        return Ok(resultado);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER EL PANEL PERSONAL /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    [Authorize(Roles = "ADMINISTRADOR")]
    [HttpGet("PanelAdministrador")]
    public async Task<IActionResult> ObtenerResumenAdministrador()
    {
        var hoy = DateTime.Today;
        var mañana = hoy.AddDays(1);

        var ausenciasHoy = await _context.Asistencia
            .CountAsync(a => a.Estado == EstadoAsistencia.AUSENTE &&
                             a.Fecha >= hoy && a.Fecha < mañana);

        var empleadosActivos = await _context.Empleado
            .CountAsync(e => !e.Eliminado);

        var empleadosConLicencia = await _context.Licencia
            .Include(l => l.Empleado)
            .CountAsync(l => l.Estado == EstadoLicencia.APROBADA && l.FechaFin >= DateTime.Today);

        var evaluacionesRecientes = await _context.Evaluacion
            .CountAsync(e => e.Fecha >= DateTime.Today.AddDays(-30));

        var cursosActivos = await _context.Curso
            .CountAsync(c => !c.Finalizado);

        var movimientosRecientes = await _context.HistorialLaboral
            .Include(h => h.Empleado)
            .OrderByDescending(h => h.FechaModificacion)
            .Take(6)
            .Select(h => new
            {
                Empleado = h.Empleado.NombreCompleto,
                h.PuestoAnterior,
                h.PuestoActual,
                Fecha = h.FechaModificacion.ToString("dd/MM/yyyy")
            })
            .ToListAsync();

        return Ok(new
        {
            EmpleadosActivos = empleadosActivos,
            EmpleadosConLicencia = empleadosConLicencia,
            AusenciasHoy = ausenciasHoy,
            EvaluacionesRecientes = evaluacionesRecientes,
            CursosActivos = cursosActivos,
            MovimientosRecientes = movimientosRecientes
        });
    }



}

