using GestionRRHH.Models.General;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GestionRRHH.Controllers
{
    [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
    [Route("api/[controller]")]
    [ApiController]
    public class PeriodosVacacionesController : ControllerBase
    {
        private readonly Context _context;

        public PeriodosVacacionesController(Context context)
        {
            _context = context;
        }

        [HttpGet("Activo")]
        public async Task<ActionResult<VistaPeriodoSolicitudVacaciones>> GetPeriodoActivo()
        {
            var periodo = await ObtenerUltimoPeriodoActivoAsync();

            if (periodo == null)
            {
                return Ok(new
                {
                    habilitado = false,
                    fechaInicioString = "",
                    fechaFinString = ""
                });
            }

            return Ok(ArmarVista(periodo));
        }

        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost]
        public async Task<ActionResult<VistaPeriodoSolicitudVacaciones>> GuardarPeriodo(PeriodoSolicitudVacacionesDto periodoDto)
        {
            var fechaInicio = periodoDto.FechaInicio.Date;
            var fechaFin = periodoDto.FechaFin.Date;

            if (fechaInicio == default || fechaFin == default)
                return BadRequest(new { mensaje = "Debe seleccionar fecha desde y fecha hasta." });

            if (fechaFin < fechaInicio)
                return BadRequest(new { mensaje = "La fecha hasta no puede ser anterior a la fecha desde." });

            var periodosActivos = await _context.PeriodoSolicitudVacaciones
                .Where(p => p.Activo)
                .ToListAsync();

            foreach (var periodoActivo in periodosActivos)
                periodoActivo.Activo = false;

            var nuevoPeriodo = new PeriodoSolicitudVacaciones
            {
                FechaInicio = fechaInicio,
                FechaFin = fechaFin,
                FechaCreacion = DateTime.Now,
                UsuarioCreadorId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                Activo = true
            };

            _context.PeriodoSolicitudVacaciones.Add(nuevoPeriodo);

            _context.Notificaciones.Add(new Notificaciones
            {
                Titulo = "Periodo de Vacaciones Habilitado",
                Mensaje = $"Se habilito la solicitud de VACACIONES desde el {fechaInicio:dd/MM/yyyy} hasta el {fechaFin:dd/MM/yyyy}.",
                FechaCreacion = DateTime.Now,
                UsuarioId = null,
                DestinatarioRol = "ADMINISTRADOR,RRHH,SUPERVISOR,EMPLEADO",
                Leida = false
            });

            await _context.SaveChangesAsync();

            return Ok(ArmarVista(nuevoPeriodo));
        }

        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost("Cancelar")]
        public async Task<IActionResult> CancelarPeriodo()
        {
            var periodo = await ObtenerUltimoPeriodoActivoAsync();

            if (periodo == null)
                return BadRequest(new { mensaje = "No hay fechas de vacaciones activas para cancelar." });

            periodo.Activo = false;

            _context.Notificaciones.Add(new Notificaciones
            {
                Titulo = "Periodo de Vacaciones Cancelado",
                Mensaje = $"Se cancelo la ventana para solicitar VACACIONES del {periodo.FechaInicio:dd/MM/yyyy} al {periodo.FechaFin:dd/MM/yyyy}.",
                FechaCreacion = DateTime.Now,
                UsuarioId = null,
                DestinatarioRol = "ADMINISTRADOR,RRHH,SUPERVISOR,EMPLEADO",
                Leida = false
            });

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Fechas de vacaciones canceladas." });
        }

        private async Task<PeriodoSolicitudVacaciones> ObtenerUltimoPeriodoActivoAsync()
        {
            return await _context.PeriodoSolicitudVacaciones
                .Where(p => p.Activo)
                .OrderByDescending(p => p.FechaCreacion)
                .FirstOrDefaultAsync();
        }

        private static VistaPeriodoSolicitudVacaciones ArmarVista(PeriodoSolicitudVacaciones periodo)
        {
            var hoy = DateTime.Today;

            return new VistaPeriodoSolicitudVacaciones
            {
                Id = periodo.Id,
                FechaInicio = periodo.FechaInicio,
                FechaFin = periodo.FechaFin,
                FechaInicioString = periodo.FechaInicio.ToString("dd/MM/yyyy"),
                FechaFinString = periodo.FechaFin.ToString("dd/MM/yyyy"),
                Habilitado = periodo.FechaInicio.Date <= hoy && periodo.FechaFin.Date >= hoy
            };
        }
    }
}
