using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace API_NET_CORE8_RRHH.Controllers
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
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaLicencia>>> LicenciaFiltrar([FromBody] LicenciaFiltrar filtro)
        {
            var hoy = DateTime.Today;

            var obtenerLicencias = _context.Licencia
                .Include(l => l.TipoDeLicencia)
                .Include(l => l.Empleado)
                .Where(l => l.Empleado != null && !l.Empleado.Eliminado)
                .AsQueryable();

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
        [HttpPost]
        public async Task<ActionResult<Licencia>> PostLicencia([FromForm] Licencia licencia, IFormFile DocumentoAdjunto)
        {
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

            return CreatedAtAction(nameof(GetLicencia), new { id = licencia.Id }, licencia);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UNA LICENCIA ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLicencia(int id, [FromForm] IFormFile DocumentoAdjunto)
        {
            var licencia = await _context.Licencia.FindAsync(id);


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
        [HttpPost("{id}/Aprobar")]
        public async Task<IActionResult> AprobarLicencia(int id)
        {
            var informacionLicencia = await _context.Licencia
                .Where(l => l.Id == id)
                .Select(l => new { l.Id, l.EmpleadoId, l.Estado, l.FechaInicio, l.FechaFin })
                .FirstOrDefaultAsync();

            if (informacionLicencia.Estado != EstadoLicencia.PENDIENTE)
                return BadRequest("Solo se pueden aprobar licencias pendientes.");

            bool tieneSolapamiento = await _context.Licencia
                .AnyAsync(l =>
                    l.EmpleadoId == informacionLicencia.EmpleadoId &&
                    l.Id != id &&
                    (l.Estado == EstadoLicencia.PENDIENTE || l.Estado == EstadoLicencia.APROBADA) &&
                    l.FechaInicio <= informacionLicencia.FechaFin &&
                    l.FechaFin >= informacionLicencia.FechaInicio
                );

            if (tieneSolapamiento)
                return BadRequest(new { codigo = 0, mensaje = "Ya tiene licencia aplicada que solapa fechas." });

            var licencia = new Licencia { Id = id, Estado = EstadoLicencia.APROBADA };

            _context.Licencia.Attach(licencia);

            _context.Entry(licencia).Property(l => l.Estado).IsModified = true;

            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            _context.AprobacionDeLicencia.Add(new AprobacionDeLicencia
            {
                Estado = EstadoLicencia.APROBADA,
                LicenciaId = id,
                FechDeAprobacion = DateTime.UtcNow,
                UsuarioAprobador = userId
            });

            await _context.SaveChangesAsync();

            return Ok(licencia);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA RECHAZAR UNA LICENCIA //////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("{id}/Rechazar")]
        public async Task<IActionResult> RechazarLicencia(int id)
        {
            var licencia = new Licencia { Id = id, Estado = EstadoLicencia.RECHAZADA };

            _context.Licencia.Attach(licencia);

            _context.Entry(licencia).Property(l => l.Estado).IsModified = true;

            await _context.SaveChangesAsync();

            return Ok(licencia);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ELIMINAR UNA LICENCIA //////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
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
