using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using API_RRHH_TESIS2025.Models.Dto;
using API_RRHH_TESIS2025.Services;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace API_NET_CORE8_RRHH.Controllers
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


        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpPost("AsistenciaHorario")]
        public async Task<IActionResult> ObtenerAsistenciaHorario()
        {
            var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            Empleado empleado = null;

            if (rol == "SUPERVISOR" || rol == "EMPLEADO")
            {
                var usuario = await _context.Users.FindAsync(userId);
                var emailUsuario = usuario?.Email?.Trim().ToLower();

                empleado = await _context.Empleado
                    .Where(e => e.Email.Trim().ToLower() == emailUsuario)
                    .FirstOrDefaultAsync();

               
            }
            
            var horario = await _context.Horario
                .Where(h => h.EmpleadoId == empleado.Id)
                .OrderByDescending(h => h.Id)
                .Select(h => new
                {
                    h.Id,
                    h.EmpleadoId,
                    h.EmpleadoString,
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

            var hoy = DateTime.Today;
            var asistencia = await _context.Asistencia
                .Where(a => a.EmpleadoId == empleado.Id && a.Fecha.Date == hoy)
                .OrderByDescending(a => a.Id)
                .Select(a => new
                {
                    a.Id,
                    a.EmpleadoId,
                    a.EmpleadoString,
                    a.EstadoString,
                    a.FechaString,
                    a.PrimerEntradaString,
                    a.PrimerSalidaString,
                    a.SegundaEntradaString,
                    a.SegundaSalidaString,
                    a.FotoRuta
                })
                .FirstOrDefaultAsync();

            return Ok(new
            {
                Empleado = empleado.NombreCompleto,
                Horario = horario,
                Asistencia = asistencia
            });
        }



    }
}
