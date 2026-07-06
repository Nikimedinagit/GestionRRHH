using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using GestionRRHH.Models.Dto;
using GestionRRHH.Services;
using GestionRRHH.Models.General;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;

namespace GestionRRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AsistenciasHorariosController : ControllerBase
    {
        private readonly Context _context;

        private class SemanaRotativaDto
        {
            public int Semana { get; set; }
            public string Turno { get; set; }
            public int TipoHorario { get; set; }
            public string HorarioInicio { get; set; }
            public string HorarioFin { get; set; }
            public string SegundoHorarioInicio { get; set; }
            public string SegundoHorarioFin { get; set; }
        }

        public AsistenciasHorariosController(Context context)
        {
            _context = context;

        }

        private static bool DiaHabilitado(Horario h, DayOfWeek d) => d switch
        {
            DayOfWeek.Monday => h.Lunes,
            DayOfWeek.Tuesday => h.Martes,
            DayOfWeek.Wednesday => h.Miercoles,
            DayOfWeek.Thursday => h.Jueves,
            DayOfWeek.Friday => h.Viernes,
            DayOfWeek.Saturday => h.Sabado,
            DayOfWeek.Sunday => h.Domingo,
            _ => false
        };

        private static List<SemanaRotativaDto> ObtenerSemanasRotativas(string rotacionSemanasJson)
        {
            if (string.IsNullOrWhiteSpace(rotacionSemanasJson))
                return new List<SemanaRotativaDto>();

            try
            {
                return JsonSerializer.Deserialize<List<SemanaRotativaDto>>(
                    rotacionSemanasJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                ) ?? new List<SemanaRotativaDto>();
            }
            catch
            {
                return new List<SemanaRotativaDto>();
            }
        }

        private static SemanaRotativaDto? ObtenerSemanaRotativaActiva(Horario horario, DateTime fecha)
        {
            if ((horario.TipoHorario != TipoHorario.ROTATIVO && !horario.EsRotativo) ||
                !horario.FechaInicioRotacion.HasValue)
                return null;

            var semanas = ObtenerSemanasRotativas(horario.RotacionSemanasJson)
                .OrderBy(s => s.Semana)
                .ToList();

            if (!semanas.Any())
                return null;

            var diasDesdeInicio = Math.Max(0, (fecha.Date - horario.FechaInicioRotacion.Value.Date).Days);
            var indiceSemana = (diasDesdeInicio / 7) % semanas.Count;
            return semanas.ElementAt(indiceSemana);
        }

        private static string FormatearHora(TimeSpan hora)
        {
            return DateTime.Today.Add(hora).ToString("hh:mm tt");
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// OBTENER ASISTENCIAS Y HORARIOS POR USUARIOS //////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "RRHH, SUPERVISOR, EMPLEADO")]
        [HttpPost("AsistenciaHorario")]
        public async Task<IActionResult> ObtenerAsistenciaHorario()
        {
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var usuario = await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => new { u.Email })
                .FirstOrDefaultAsync();


            var emailUsuario = usuario.Email.Trim().ToLower();

            var empleado = await _context.Empleado
                .AsNoTracking()
                .Where(e => e.Email.ToLower() == emailUsuario)
                .Select(e => new { e.Id, e.NombreCompleto })
                .FirstOrDefaultAsync();

            var hoy = DateTime.Today;

            var horariosEmpleado = await _context.Horario
                .AsNoTracking()
                .Where(h => h.EmpleadoId == empleado.Id)
                .OrderByDescending(h => h.Id)
                .ToListAsync();

            var horarioDb = horariosEmpleado.FirstOrDefault(h => DiaHabilitado(h, hoy.DayOfWeek))
                ?? horariosEmpleado.FirstOrDefault();

            var semanaActiva = horarioDb != null ? ObtenerSemanaRotativaActiva(horarioDb, hoy) : null;
            var esRotativo = horarioDb != null && (horarioDb.TipoHorario == TipoHorario.ROTATIVO || horarioDb.EsRotativo);
            var tipoHorarioDia = horarioDb?.TipoHorario ?? TipoHorario.CONTINUO;
            var horarioInicio = horarioDb?.HorarioInicio ?? TimeSpan.Zero;
            var horarioFin = horarioDb?.HorarioFin ?? TimeSpan.Zero;
            var segundoHorarioInicio = horarioDb?.SegundoHorarioInicio ?? TimeSpan.Zero;
            var segundoHorarioFin = horarioDb?.SegundoHorarioFin ?? TimeSpan.Zero;

            if (semanaActiva != null &&
                TimeSpan.TryParse(semanaActiva.HorarioInicio, out var inicioRotativo) &&
                TimeSpan.TryParse(semanaActiva.HorarioFin, out var finRotativo))
            {
                tipoHorarioDia = (TipoHorario)semanaActiva.TipoHorario;
                horarioInicio = inicioRotativo;
                horarioFin = finRotativo;

                if (tipoHorarioDia == TipoHorario.ALTERNO &&
                    TimeSpan.TryParse(semanaActiva.SegundoHorarioInicio, out var segundoInicioRotativo) &&
                    TimeSpan.TryParse(semanaActiva.SegundoHorarioFin, out var segundoFinRotativo))
                {
                    segundoHorarioInicio = segundoInicioRotativo;
                    segundoHorarioFin = segundoFinRotativo;
                }
                else
                {
                    segundoHorarioInicio = TimeSpan.Zero;
                    segundoHorarioFin = TimeSpan.Zero;
                }
            }

            var horario = horarioDb == null ? null : new
            {
                TipoHorarioString = esRotativo ? TipoHorario.ROTATIVO.ToString() : horarioDb.TipoHorarioString,
                TipoHorarioDiaString = tipoHorarioDia.ToString(),
                TurnoRotativo = semanaActiva?.Turno,
                SemanaRotativa = semanaActiva?.Semana,
                HorarioInicioString = FormatearHora(horarioInicio),
                HorarioFinString = FormatearHora(horarioFin),
                SegundoHorarioInicioString = tipoHorarioDia == TipoHorario.ALTERNO ? FormatearHora(segundoHorarioInicio) : null,
                SegundoHorarioFinString = tipoHorarioDia == TipoHorario.ALTERNO ? FormatearHora(segundoHorarioFin) : null,
                horarioDb.Lunes,
                horarioDb.Martes,
                horarioDb.Miercoles,
                horarioDb.Jueves,
                horarioDb.Viernes,
                horarioDb.Sabado,
                horarioDb.Domingo
            };

            var asistenciaHoy = await _context.Asistencia
                .AsNoTracking()
                .Where(a => a.EmpleadoId == empleado.Id && a.Fecha.Date == hoy)
                .Select(a => new
                {
                    a.EstadoString,
                    a.PrimerEntradaString,
                    a.PrimerSalidaString,
                    a.SegundaEntradaString,
                    a.SegundaSalidaString,
                    a.FotoRuta,
                    FechaString = a.Fecha.ToString("dd/MM/yyyy")
                })
                .FirstOrDefaultAsync();

            var inicioSemana = hoy.AddDays(-(int)(hoy.DayOfWeek == DayOfWeek.Sunday ? 6 : hoy.DayOfWeek - DayOfWeek.Monday));
            var finSemana = inicioSemana.AddDays(6);

            var resumenSemanal = _context.Asistencia
                .AsNoTracking()
                .Where(a => a.EmpleadoId == empleado.Id && a.Fecha >= inicioSemana && a.Fecha <= finSemana)
                .AsEnumerable() 
                .GroupBy(a => a.EstadoString ?? "SIN REGISTRO")
                .Select(g => new { Estado = g.Key, Cantidad = g.Count() })
                .ToList();

            var historialReciente = await _context.Asistencia
                .AsNoTracking()
                .Where(a => a.EmpleadoId == empleado.Id)
                .OrderByDescending(a => a.Fecha)
                .Take(5)
                .Select(a => new
                {
                    a.Fecha,
                    FechaString = a.Fecha.ToString("dd/MM/yyyy"),
                    a.EstadoString,
                    a.PrimerEntradaString,
                    a.PrimerSalidaString,
                    a.SegundaEntradaString,
                    a.SegundaSalidaString
                })
                .ToListAsync();

            return Ok(new
            {
                Empleado = empleado.NombreCompleto,
                Horario = horario,
                AsistenciaHoy = asistenciaHoy,
                ResumenSemanal = resumenSemanal,
                HistorialReciente = historialReciente
            });
        }

    }
}
