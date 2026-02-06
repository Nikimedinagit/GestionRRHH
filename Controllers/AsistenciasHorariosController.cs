using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using GestionRRHH.Models.Dto;
using GestionRRHH.Services;
using GestionRRHH.Models.General;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace GestionRRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AsistenciasHorariosController : ControllerBase
    {
        private readonly Context _context;
        public AsistenciasHorariosController(Context context)
        {
            _context = context;

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

            var horario = await _context.Horario
                .AsNoTracking()
                .Where(h => h.EmpleadoId == empleado.Id)
                .OrderByDescending(h => h.Id)
                .Select(h => new
                {
                    h.TipoHorarioString,
                    h.HorarioInicioString,
                    h.HorarioFinString,
                    h.SegundoHorarioInicioString,
                    h.SegundoHorarioFinString,
                    h.Lunes,
                    h.Martes,
                    h.Miercoles,
                    h.Jueves,
                    h.Viernes,
                    h.Sabado,
                    h.Domingo
                })
                .FirstOrDefaultAsync();

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
                    a.PrimerSalidaString
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
