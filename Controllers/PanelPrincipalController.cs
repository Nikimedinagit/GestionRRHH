using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

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
    [HttpGet("proximos-festivos")]
    public async Task<IActionResult> ObtenerProximosFestivos()
    {
        var año = DateTime.Today.Year;
        var pais = "AR";
        var url = $"https://date.nager.at/api/v3/PublicHolidays/{año}/{pais}";

        using var client = new HttpClient();
        var response = await client.GetStringAsync(url);

        var datosApi = JsonSerializer.Deserialize<List<JsonElement>>(response);

        var proximos = datosApi
            .Select(f =>
            {
                var fecha = f.TryGetProperty("date", out var fechaProp) ? fechaProp.GetString() : null;
                var nombre = f.TryGetProperty("localName", out var nombreProp) ? nombreProp.GetString() : "Sin nombre";

                if (fecha == null) return null;

                return new DiaFestivo
                {
                    Fecha = fecha,
                    NombreFestivo = nombre
                };
            })
            .Where(f => f != null && DateTime.Parse(f.Fecha) >= DateTime.Today)
            .OrderBy(f => DateTime.Parse(f.Fecha))
            .Take(5)
            .ToList();

        return Ok(proximos);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// METODO PARA OBTENER LA ASISTENCIA DEL USUARIO /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
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

        var horario = empleado.Horario.FirstOrDefault(h =>
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
        if (asistencia != null)
        {
            if (asistencia.PrimerEntrada.HasValue && asistencia.PrimerSalida.HasValue)
                horasTrabajadas += (asistencia.PrimerSalida.Value - asistencia.PrimerEntrada.Value).TotalHours;

            if (horario.TipoHorario == TipoHorario.ALTERNO &&
                asistencia.SegundaEntrada.HasValue && asistencia.SegundaSalida.HasValue)
                horasTrabajadas += (asistencia.SegundaSalida.Value - asistencia.SegundaEntrada.Value).TotalHours;
        }

        var resultado = new
        {
            TipoHorario = horario.TipoHorario.ToString(),
            PrimerEntrada = asistencia?.PrimerEntrada?.ToString(@"hh\:mm") ?? "--:--",
            PrimerSalida = asistencia?.PrimerSalida?.ToString(@"hh\:mm") ?? "--:--",
            SegundaEntrada = horario.TipoHorario == TipoHorario.ALTERNO
                                ? asistencia?.SegundaEntrada?.ToString(@"hh\:mm") ?? "--:--"
                                : null,
            SegundaSalida = horario.TipoHorario == TipoHorario.ALTERNO
                                ? asistencia?.SegundaSalida?.ToString(@"hh\:mm") ?? "--:--"
                                : null,
            HorasTrabajadas = Math.Round(horasTrabajadas, 2)
        };

        return Ok(resultado);
    }



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





}

