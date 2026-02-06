using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionRRHH.Models.General;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace GestionRRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LicenciasController : ControllerBase
    {
        private readonly Context _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public LicenciasController(Context context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS DATOS DE LA API DE LICENCIAS ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaLicencia>>> LicenciaFiltrar([FromBody] LicenciaFiltrar filtro)
        {
            var hoy = DateTime.Today;

            var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var obtenerLicencias = _context.Licencia
                .Include(l => l.TipoDeLicencia)
                .Include(l => l.Empleado)
                .Where(l => l.Empleado != null && !l.Empleado.Eliminado)
                .AsQueryable();

            if (rol == "SUPERVISOR" || rol == "EMPLEADO")
            {
                var usuario = await _context.Users.FindAsync(userId);
                var emailUsuario = usuario?.Email?.Trim().ToLower();

                var empleado = await _context.Empleado
                    .Where(e => e.Email.Trim().ToLower() == emailUsuario)
                    .FirstOrDefaultAsync();

                if (empleado != null)
                {
                    var empleadoId = empleado.Id;
                    obtenerLicencias = obtenerLicencias.Where(l => l.EmpleadoId == empleadoId);
                }
                else
                {
                    return new List<VistaLicencia>();
                }
            }

            if (filtro.Estado.HasValue)
                obtenerLicencias = obtenerLicencias.Where(l => (int)l.Estado == filtro.Estado);

            if (filtro.TipoDeLicenciaId.HasValue)
                obtenerLicencias = obtenerLicencias.Where(l => l.TipoDeLicenciaId == filtro.TipoDeLicenciaId);

            if (filtro.FechaInicio.HasValue && filtro.FechaFin.HasValue)
            {
                var fechaInicio = filtro.FechaInicio.Value.Date;
                var fechaFin = filtro.FechaFin.Value.Date;
                obtenerLicencias = obtenerLicencias.Where(l => l.FechaInicio >= fechaInicio && l.FechaFin <= fechaFin);
            }

            if (!string.IsNullOrEmpty(filtro.EmpleadoTexto))
                obtenerLicencias = obtenerLicencias.Where(l => l.Empleado.NombreCompleto.Contains(filtro.EmpleadoTexto));

            var listaLicencias = await obtenerLicencias
                .OrderBy(l => l.Estado == EstadoLicencia.PENDIENTE ? 0 :
                              l.Estado == EstadoLicencia.APROBADA ? 1 :
                              l.Estado == EstadoLicencia.RECHAZADA ? 2 :
                              l.Estado == EstadoLicencia.EXPIRADA ? 3 : 4)
                .ThenByDescending(l => l.FechaInicio)
                .ToListAsync();

            var licenciasExpiradas = listaLicencias
                .Where(l => l.Estado == EstadoLicencia.APROBADA && l.FechaFin < hoy)
                .ToList();

            if (licenciasExpiradas.Any())
            {
                foreach (var lic in licenciasExpiradas)
                    lic.Estado = EstadoLicencia.EXPIRADA;

                _context.Licencia.UpdateRange(licenciasExpiradas);
                await _context.SaveChangesAsync();
            }

            var vista = listaLicencias.Select(l => new VistaLicencia
            {
                Id = l.Id,
                TipoDeLicenciaString = l.TipoDeLicenciaString,
                TipoDeLicenciaId = l.TipoDeLicenciaId,
                FechaInicioString = l.FechaInicioString,
                FechaFinString = l.FechaFinString,
                EstadoString = l.Estado.ToString(),
                DocumentoAdjunto = l.DocumentoAdjunto,
                EmpleadoString = l.EmpleadoString,
                EmpleadoId = l.EmpleadoId,
                DocumentoNombre = l.DocumentoNombre,
                DocumentoMimeType = l.DocumentoMimeType
            }).ToList();

            return vista;
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METTODO APRA CREAR LICENCIA //////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpPost]
        public async Task<ActionResult<Licencia>> PostLicencia([FromForm] Licencia licencia, IFormFile DocumentoAdjunto)
        {
            var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value?.ToUpper();
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (rol == "EMPLEADO" || rol == "SUPERVISOR")
            {
                var usuario = await _context.Users.FindAsync(userId);
                var emailUsuario = usuario?.Email?.Trim().ToLower();

                var empleado = await _context.Empleado
                    .Where(e => e.Email.Trim().ToLower() == emailUsuario)
                    .FirstOrDefaultAsync();

                licencia.EmpleadoId = empleado.Id;
            }

            bool existeLicencia = await _context.Licencia
                .AnyAsync(l =>
                    l.EmpleadoId == licencia.EmpleadoId &&
                    (l.Estado == EstadoLicencia.PENDIENTE || l.Estado == EstadoLicencia.APROBADA) &&
                    l.FechaInicio <= licencia.FechaFin &&
                    l.FechaFin >= licencia.FechaInicio
                );

            if (existeLicencia)
                return BadRequest(new { codigo = 0, mensaje = "Ya tiene licencia aplicada." });

            licencia.Estado = EstadoLicencia.PENDIENTE;

            if (DocumentoAdjunto != null && DocumentoAdjunto.Length > 0)
            {
                using var ms = new MemoryStream();
                await DocumentoAdjunto.CopyToAsync(ms);
                licencia.DocumentoAdjunto = ms.ToArray();
                licencia.DocumentoNombre = DocumentoAdjunto.FileName;
                licencia.DocumentoMimeType = DocumentoAdjunto.ContentType;
            }

            _context.Licencia.Add(licencia);
            await _context.SaveChangesAsync();

            var empleadoDueño = await _context.Empleado.FindAsync(licencia.EmpleadoId);

            _context.Notificaciones.Add(new Notificaciones
            {
                Titulo = "Nueva Solicitud de Licencia",
                Mensaje = $"El empleado {empleadoDueño.NombreCompleto} ha solicitado una nueva licencia.",
                FechaCreacion = DateTime.Now,
                UsuarioId = null,
                DestinatarioRol = "ADMINISTRADOR,RRHH",
                Leida = false
            });

            if (empleadoDueño.Puesto?.Descripcion.ToUpper() == "RRHH")
            {
                _context.Notificaciones.Add(new Notificaciones
                {
                    Titulo = "Nueva Solicitud de Licencia",
                    Mensaje = $"El empleado {empleadoDueño.NombreCompleto} ha solicitado una nueva licencia.",
                    FechaCreacion = DateTime.Now,
                    UsuarioId = licencia.EmpleadoId.ToString(),
                    Leida = false
                });
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLicencia), new { id = licencia.Id }, licencia);
        }




        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UNA LICENCIA ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLicencia(int id, [FromForm] IFormFile DocumentoAdjunto)
        {
            var licencia = await _context.Licencia.FindAsync(id);

            var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (rol == "SUPERVISOR" || rol == "EMPLEADO")
            {
                var usuario = await _context.Users.FindAsync(userId);
                var emailUsuario = usuario?.Email?.Trim().ToLower();

                var empleado = await _context.Empleado
                    .Where(e => e.Email.Trim().ToLower() == emailUsuario)
                    .FirstOrDefaultAsync();

                licencia.EmpleadoId = empleado.Id;
            }

            if (DocumentoAdjunto != null && DocumentoAdjunto.Length > 0)
            {
                using var ms = new MemoryStream();
                await DocumentoAdjunto.CopyToAsync(ms);
                licencia.DocumentoAdjunto = ms.ToArray();
                licencia.DocumentoNombre = DocumentoAdjunto.FileName;
                licencia.DocumentoMimeType = DocumentoAdjunto.ContentType;
            }

            await _context.SaveChangesAsync();

            return Ok(licencia);
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UNA LICENCIA POR ID ///////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Licencia>> GetLicencia(int id)
        {
            var licencia = await _context.Licencia.FindAsync(id);

            if (licencia == null)
            {
                return NotFound();
            }

            return licencia;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA DESCARGAR DOCUMENTO //////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("Documento/{id}")]
        public async Task<IActionResult> DescargarDocumento(int id)
        {
            var licencia = await _context.Licencia.FindAsync(id);

            var nombreArchivo = licencia.DocumentoNombre ?? $"Licencia_{id}";
            var mimeType = licencia.DocumentoMimeType ?? "application/octet-stream";

            return File(licencia.DocumentoAdjunto, mimeType, nombreArchivo);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA APROBAR UNA LICENCIA //////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost("{id}/Aprobar")]
        public async Task<IActionResult> AprobarLicencia(int id)
        {
            var licencia = await _context.Licencia
                .Include(l => l.Empleado)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (licencia == null)
                return NotFound();

            if (licencia.Estado != EstadoLicencia.PENDIENTE)
                return BadRequest("Solo se pueden aprobar licencias pendientes.");

            bool tieneSolapamiento = await _context.Licencia
                .AnyAsync(l =>
                    l.EmpleadoId == licencia.EmpleadoId &&
                    l.Id != id &&
                    (l.Estado == EstadoLicencia.PENDIENTE || l.Estado == EstadoLicencia.APROBADA) &&
                    l.FechaInicio <= licencia.FechaFin &&
                    l.FechaFin >= licencia.FechaInicio
                );

            if (tieneSolapamiento)
                return BadRequest(new { codigo = 0, mensaje = "Ya tiene licencia aplicada que solapa fechas." });

            licencia.Estado = EstadoLicencia.APROBADA;

            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            _context.AprobacionDeLicencia.Add(new AprobacionDeLicencia
            {
                Estado = EstadoLicencia.APROBADA,
                LicenciaId = id,
                FechDeAprobacion = DateTime.UtcNow,
                UsuarioAprobador = userId
            });

            var empleadoDueño = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Id == licencia.EmpleadoId);

            if (empleadoDueño != null)
            {
                _context.Notificaciones.Add(new Notificaciones
                {
                    Titulo = "Licencia Aprobada",
                    Mensaje = $"{empleadoDueño.NombreCompleto}, tu solicitud de licencia fue aprobada.",
                    FechaCreacion = DateTime.Now,
                    UsuarioId = licencia.EmpleadoId.ToString(),
                    Leida = false
                });
            }

            await _context.SaveChangesAsync();

            return Ok(licencia);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA RECHAZAR UNA LICENCIA //////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost("{id}/Rechazar")]
        public async Task<IActionResult> RechazarLicencia(int id)
        {
            var licencia = await _context.Licencia
                .Include(l => l.Empleado)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (licencia == null)
                return NotFound();

            licencia.Estado = EstadoLicencia.RECHAZADA;
            await _context.SaveChangesAsync();

            var empleadoDueño = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Id == licencia.EmpleadoId);

            if (empleadoDueño != null)
            {
                _context.Notificaciones.Add(new Notificaciones
                {
                    Titulo = "Licencia Rechazada",
                    Mensaje = $"{empleadoDueño.NombreCompleto}, tu solicitud de licencia fue rechazada.",
                    FechaCreacion = DateTime.Now,
                    UsuarioId = licencia.EmpleadoId.ToString(),
                    Leida = false
                });

            }

            await _context.SaveChangesAsync();
            return Ok(licencia);
        }




        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ELIMINAR UNA LICENCIA //////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLicencia(int id)
        {
            var licencia = await _context.Licencia.FindAsync(id);

            _context.Licencia.Remove(licencia);

            await _context.SaveChangesAsync();

            return Ok(licencia);
        }


        private bool LicenciaExists(int id)
        {
            return _context.Licencia.Any(e => e.Id == id);
        }
    }
}
