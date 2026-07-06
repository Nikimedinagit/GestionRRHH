using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionRRHH.Models.General;
using System.Security.Claims;

namespace GestionRRHH.Controllers
{
    [Authorize(Roles = "ADMINISTRADOR,RRHH,SUPERVISOR,EMPLEADO")]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificacionesController : ControllerBase
    {
        private readonly Context _context;

        public NotificacionesController(Context context)
        {
            _context = context;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER NOTIFICACIONES SEGUN ROL DEL USUARIO LOGUEADO //////////////7
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpGet("PorRol")]
        public async Task<ActionResult<IEnumerable<Notificaciones>>> GetNotificacionesPorRol()
        {
            var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value?.ToUpper();
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            IQueryable<Notificaciones> ObtenerNotificaciones = _context.Notificaciones;

            if (rol == "EMPLEADO" || rol == "SUPERVISOR" || rol == "RRHH")
            {
                var usuarioActual = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (usuarioActual == null)
                    return Unauthorized("Usuario no encontrado.");

                var emailActual = usuarioActual.Email.Trim().ToLower();

                var empleadoActual = await _context.Empleado
                    .Include(e => e.Puesto)
                    .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

                if (empleadoActual == null)
                    return Ok(new List<Notificaciones>());

                var empleadoIdStr = empleadoActual.Id.ToString();

                if (rol == "EMPLEADO")
                {
                    ObtenerNotificaciones = ObtenerNotificaciones.Where(n =>
                        n.UsuarioId == empleadoIdStr ||
                        (string.IsNullOrEmpty(n.UsuarioId) &&
                         (n.DestinatarioRol ?? "").ToUpper().Contains("EMPLEADO")));
                }
                else if (rol == "SUPERVISOR")
                {
                    var sectorId = empleadoActual.Puesto?.SectorId;
                    var empleadosSector = await _context.Empleado
                        .Where(e => e.Puesto.SectorId == sectorId)
                        .Select(e => e.Id.ToString())
                        .ToListAsync();

                    ObtenerNotificaciones = ObtenerNotificaciones.Where(n =>
                        empleadosSector.Contains(n.UsuarioId) ||
                        n.UsuarioId == empleadoIdStr ||
                        (string.IsNullOrEmpty(n.UsuarioId) &&
                         (n.DestinatarioRol ?? "").ToUpper().Contains("SUPERVISOR")));
                }
                else if (rol == "RRHH")
                {
                    ObtenerNotificaciones = ObtenerNotificaciones.Where(n =>
                        n.UsuarioId == empleadoIdStr ||
                        (string.IsNullOrEmpty(n.UsuarioId) &&
                         (n.DestinatarioRol ?? "").ToUpper().Contains("RRHH"))
                    );
                }
            }
            else if (rol == "ADMINISTRADOR")
            {
                ObtenerNotificaciones = ObtenerNotificaciones.Where(n =>
                    string.IsNullOrEmpty(n.UsuarioId) &&
                    (n.DestinatarioRol ?? "").ToUpper().Contains("ADMINISTRADOR")
                );
            }

            var notificaciones = await ObtenerNotificaciones
                .OrderByDescending(n => n.FechaCreacion)
                .ToListAsync();

            return Ok(notificaciones);
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MARCAR NOTIFICACION COMO LEIDA //////////////
        /// //////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPut("{id}/Leer")]
        public async Task<IActionResult> MarcarComoLeida(int id)
        {
            var notificacion = await _context.Notificaciones.FindAsync(id);
            if (notificacion == null)
                return NotFound();

            notificacion.Leida = true;
            await _context.SaveChangesAsync();

            return Ok(notificacion);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MARCAR TODAS LAS NOTIFICACIONES COMO LEIDAS //////////////
        /// //////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPut("LeerTodas")]
        public async Task<IActionResult> LeerTodas()
        {
            var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value?.ToUpper();
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var usuarioActual = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (usuarioActual == null)
                return Unauthorized();

            var emailActual = usuarioActual.Email.Trim().ToLower();

            Empleado empleadoActual = null;

            if (rol != "ADMINISTRADOR")
            {
                empleadoActual = await _context.Empleado
                    .Include(e => e.Puesto)
                    .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

                if (empleadoActual == null)
                    return Ok(new { cantidad = 0 });
            }

            IQueryable<Notificaciones> query = _context.Notificaciones
                .Where(n => !n.Leida);

            if (rol == "EMPLEADO")
            {
                var empleadoIdStr = empleadoActual.Id.ToString();
                query = query.Where(n =>
                    n.UsuarioId == empleadoIdStr ||
                    (string.IsNullOrEmpty(n.UsuarioId) &&
                     (n.DestinatarioRol ?? "").ToUpper().Contains("EMPLEADO")));
            }
            else if (rol == "SUPERVISOR")
            {
                var sectorId = empleadoActual.Puesto?.SectorId;
                var empleadosSector = await _context.Empleado
                    .Where(e => e.Puesto.SectorId == sectorId)
                    .Select(e => e.Id.ToString())
                    .ToListAsync();

                var empleadoIdStr = empleadoActual.Id.ToString();

                query = query.Where(n =>
                    empleadosSector.Contains(n.UsuarioId) ||
                    n.UsuarioId == empleadoIdStr ||
                    (string.IsNullOrEmpty(n.UsuarioId) &&
                     (n.DestinatarioRol ?? "").ToUpper().Contains("SUPERVISOR")));
            }
            else if (rol == "RRHH")
            {
                var empleadoIdStr = empleadoActual.Id.ToString();

                query = query.Where(n =>
                    n.UsuarioId == empleadoIdStr ||
                    (string.IsNullOrEmpty(n.UsuarioId) &&
                     (n.DestinatarioRol ?? "").ToUpper().Contains("RRHH")));
            }
            else if (rol == "ADMINISTRADOR")
            {
                query = query.Where(n =>
                    string.IsNullOrEmpty(n.UsuarioId) &&
                    (n.DestinatarioRol ?? "").ToUpper().Contains("ADMINISTRADOR"));
            }

            var notificaciones = await query.ToListAsync();

            foreach (var n in notificaciones)
                n.Leida = true;

            await _context.SaveChangesAsync();

            return Ok(new { cantidad = notificaciones.Count });
        }


    }
}
