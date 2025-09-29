using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;
using System.Security.Claims;

namespace API_NET_CORE8_RRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JustificacionesController : ControllerBase
    {
        private readonly Context _context;

        public JustificacionesController(Context context)
        {
            _context = context;
        }

        // GET: api/Justificaciones
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Justificacion>>> GetJustificacion()
        {
            return await _context.Justificacion
            .Include(j => j.Empleado)
            .Include(j => j.Empleado.Puesto)
            .ToListAsync();
        }

        // GET: api/Justificaciones/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Justificacion>> GetJustificacion(int id)
        {
            var justificacion = await _context.Justificacion.FindAsync(id);

            if (justificacion == null)
            {
                return NotFound();
            }

            return justificacion;
        }

        [HttpGet("Documento/{id}")]
        public async Task<IActionResult> DescargarDocumento(int id)
        {
            var justificacion = await _context.Justificacion.FindAsync(id);
            if (justificacion == null || justificacion.DocumentoAdjunto == null)
                return NotFound();

            // Usar nombre y tipo original
            var nombreArchivo = justificacion.DocumentoNombre ?? $"Justificacion_{id}";
            var mimeType = justificacion.DocumentoMimeType ?? "application/octet-stream";

            return File(justificacion.DocumentoAdjunto, mimeType, nombreArchivo);
        }


        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaJustificacion>>> JustificacionFiltrar([FromBody] JustificacionFiltrar filtro)
        {
            List<VistaJustificacion> vista = new List<VistaJustificacion>();

            var justificacionesFiltradas = _context.Justificacion.AsQueryable();

            if (filtro.TipoJustificacion.HasValue)
                justificacionesFiltradas = justificacionesFiltradas.Where(t => (int)t.TipoJustificacion == filtro.TipoJustificacion);

            if (filtro.FechaJustificacion.HasValue)
            {
                var fechaJustificacion = filtro.FechaJustificacion.Value.Date;
                justificacionesFiltradas = justificacionesFiltradas.Where(t => t.Fecha.Date == fechaJustificacion);

            }

            if (!string.IsNullOrEmpty(filtro.EmpleadoTexto))
            {
                justificacionesFiltradas = justificacionesFiltradas.Where(t =>
                t.Empleado.NombreCompleto.Contains(filtro.EmpleadoTexto));
            }

            //Armar lista de respuesta
            foreach (var justificacion in justificacionesFiltradas)
            {
                var vistaJustificacion = new VistaJustificacion
                {
                    Id = justificacion.Id,
                    Motivo = justificacion.Motivo,
                    FechaString = justificacion.Fecha.ToString("dd/MM/yyyy"),
                    TipoJustificacionString = justificacion.TipoJustificacion.ToString(),
                    EmpleadoString = justificacion.Empleado.NombreCompleto,
                    EmpleadoId = justificacion.EmpleadoId,
                    DocumentoAdjunto = justificacion.DocumentoAdjunto,
                    DocumentoNombre = justificacion.DocumentoNombre,
                    DocumentoMimeType = justificacion.DocumentoMimeType
                };
                vista.Add(vistaJustificacion);
            }
            return vista;
        }


        // PUT: api/Justificaciones/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutJustificacion(int id, [FromForm] Justificacion justificacion, [FromForm] IFormFile DocumentoAdjunto)
        {
            if (id != justificacion.Id)
            {
                return BadRequest();
            }

            // Buscar la justificacion original
            var justificacionOriginal = await _context.Justificacion.FindAsync(id);
            if (justificacionOriginal == null)
            {
                return NotFound();
            }

            //Actualizar los campos permitidos
            justificacionOriginal.Motivo = justificacion.Motivo;
            justificacionOriginal.Fecha = justificacion.Fecha;
            justificacionOriginal.TipoJustificacion = justificacion.TipoJustificacion;
            justificacionOriginal.EmpleadoId = justificacion.EmpleadoId;

            // Actualizar archivo si se proporciona uno nuevo
            if (DocumentoAdjunto != null && DocumentoAdjunto.Length > 0)
            {
                using (var ms = new MemoryStream())
                {
                    await DocumentoAdjunto.CopyToAsync(ms);
                    justificacionOriginal.DocumentoAdjunto = ms.ToArray();
                }
                justificacionOriginal.DocumentoNombre = DocumentoAdjunto.FileName;
                justificacionOriginal.DocumentoMimeType = DocumentoAdjunto.ContentType;
            }
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!JustificacionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Justificaciones
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Justificacion>> PostJustificacion([FromForm] Justificacion justificacion, [FromForm] IFormFile DocumentoAdjunto)
        {
            justificacion.TipoJustificacion = TipoJustificacion.PENDIENTE; //Guarda el estado de la justificacion como pendiente

            //Que no haya justificacion pendiente para el mismo empleado
            var justificacionPendieente = await _context.Justificacion
                .AnyAsync(t => t.EmpleadoId == justificacion.EmpleadoId &&
                     t.TipoJustificacion == TipoJustificacion.PENDIENTE);
            if (justificacionPendieente)
                return BadRequest("Ya hay una justificacion pendiente para este empleado.");

            //Que no pueda crear una justificacion para el mismo dia 
            var fecha = justificacion.Fecha.Date;

            var justificacionExistente = await _context.Justificacion
                .AnyAsync(t => t.Fecha.Date == fecha &&
                            t.TipoJustificacion == TipoJustificacion.PENDIENTE &&
                            t.EmpleadoId == justificacion.EmpleadoId);
            if (justificacionExistente)
                return BadRequest("Ya hay una justificacion pendiente para este día.");

            //Que la fecha no sea una fecha futura
            if (justificacion.Fecha > DateTime.Now.Date)
                return BadRequest("La fecha no puede ser una fecha futura.");

            //Guardar archivo en la base de datos
            if (DocumentoAdjunto != null && DocumentoAdjunto.Length > 0)
            {
                using (var ms = new MemoryStream())
                {
                    await DocumentoAdjunto.CopyToAsync(ms);
                    justificacion.DocumentoAdjunto = ms.ToArray();
                }
                justificacion.DocumentoNombre = DocumentoAdjunto.FileName;
                justificacion.DocumentoMimeType = DocumentoAdjunto.ContentType;
            }

            _context.Justificacion.Add(justificacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetJustificacion", new { id = justificacion.Id }, justificacion);
        }

        // DELETE: api/Justificaciones/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJustificacion(int id)
        {
            var justificacion = await _context.Justificacion.FindAsync(id);
            if (justificacion == null)
            {
                return NotFound();
            }

            _context.Justificacion.Remove(justificacion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool JustificacionExists(int id)
        {
            return _context.Justificacion.Any(e => e.Id == id);
        }



        //APROBAR Y RECHAZAR JUSTIFICACIONES
        
        [HttpPost("{id}/Aprobar")]
        public async Task<IActionResult> AprobarJustificacion(int id)
        {
            var justificacion = await _context.Justificacion.FindAsync(id);
            if (justificacion == null)
                return NotFound();

            if (justificacion.TipoJustificacion != TipoJustificacion.PENDIENTE)
                return BadRequest("Solo se pueden aprobar justificaciones pendientes.");

            // Solo se pueden aprobar justificaciones pendientes.
            if (justificacion.TipoJustificacion != TipoJustificacion.PENDIENTE)
            {
                    return BadRequest("Solo se pueden aprobar justificaciones pendientes.");
                }

            justificacion.TipoJustificacion = TipoJustificacion.APROBADA;
            _context.Justificacion.Update(justificacion);

            var usuarioId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Crear historial en LicenciasAprobadas
            // var licenciaAprobada = new AprobacionDeLicencia
            // {
            //     Estado = EstadoLicencia.APROBADA,
            //     LicenciaId = licencia.Id,
            //     FechDeAprobacion = DateTime.UtcNow,
            //     UsuarioAprobador = usuarioId

            // };
            // _context.AprobacionDeLicencia.Add(licenciaAprobada);

            await _context.SaveChangesAsync();

            return Ok(justificacion);
        }
    }
}
