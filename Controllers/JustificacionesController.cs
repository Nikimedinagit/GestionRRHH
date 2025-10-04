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


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER Y MOSTARR LOS DATOS DE LA JUSTIFICACION SEGUN SUS FILTROS /////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaJustificacion>>> JustificacionFiltrar([FromBody] JustificacionFiltrar filtro)
        {
            var obtenerJustificaciones = _context.Justificacion.Include(j => j.Empleado).AsQueryable();

            if (filtro.EstadoJustificacion.HasValue)
                obtenerJustificaciones = obtenerJustificaciones.Where(j => (int)j.Estados == filtro.EstadoJustificacion.Value);

            if (filtro.FechaJustificacion.HasValue)
            {
                var fecha = filtro.FechaJustificacion.Value.Date;
                obtenerJustificaciones = obtenerJustificaciones.Where(j => j.Fecha.Date == fecha);
            }

            if (!string.IsNullOrEmpty(filtro.EmpleadoTexto))
            {
                var texto = filtro.EmpleadoTexto.ToLower();
                obtenerJustificaciones = obtenerJustificaciones.Where(j => j.Empleado.NombreCompleto.ToLower().Contains(texto));
            }

            var vista = await obtenerJustificaciones.OrderBy(J => J.Estados).ThenBy(J => J.Fecha)
                .Select(j => new VistaJustificacion
                {
                    Id = j.Id,
                    Motivo = j.Motivo,
                    FechaString = j.Fecha.ToString("dd/MM/yyyy"),
                    EstadoString = j.EstadoString.ToString(),
                    EmpleadoString = j.Empleado.NombreCompleto,
                    EmpleadoId = j.EmpleadoId,
                    DocumentoAdjunto = j.DocumentoAdjunto,
                    DocumentoNombre = j.DocumentoNombre,
                    DocumentoMimeType = j.DocumentoMimeType
                })
                .ToListAsync();

            return Ok(vista);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UN JUSTIFICACION POR ID ///////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
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


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA DESCARGAR DOCUMENTO //////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpGet("Documento/{id}")]
        public async Task<IActionResult> DescargarDocumento(int id)
        {
            var justificacion = await _context.Justificacion.FindAsync(id);
            if (justificacion == null || justificacion.DocumentoAdjunto == null)
                return NotFound();

            var nombreArchivo = justificacion.DocumentoNombre ?? $"Justificacion_{id}";
            var mimeType = justificacion.DocumentoMimeType ?? "application/octet-stream";

            return File(justificacion.DocumentoAdjunto, mimeType, nombreArchivo);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CREAR UNA NUEVA JUSTIFICACION ////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost]
        public async Task<ActionResult<Justificacion>> PostJustificacion([FromForm] Justificacion justificacion, [FromForm] IFormFile DocumentoAdjunto)
        {
            justificacion.Estados = EstadoJustificacion.PENDIENTE;

            var fecha = justificacion.Fecha.Date;

            bool existe = await _context.Justificacion
                .AnyAsync(j => j.EmpleadoId == justificacion.EmpleadoId &&
                               j.Fecha.Date == fecha &&
                               j.Estados == EstadoJustificacion.PENDIENTE);

            if (existe)
            {
                return BadRequest(new
                {
                    codigo = 0,
                    mensaje = "Ya hay una justificación pendiente para este empleado en este día."
                });
            }

            if (DocumentoAdjunto?.Length > 0)
            {
                using var ms = new MemoryStream();
                await DocumentoAdjunto.CopyToAsync(ms);
                justificacion.DocumentoAdjunto = ms.ToArray();
                justificacion.DocumentoNombre = DocumentoAdjunto.FileName;
                justificacion.DocumentoMimeType = DocumentoAdjunto.ContentType;
            }

            _context.Justificacion.Add(justificacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetJustificacion), new { id = justificacion.Id }, justificacion);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UNA JUSTIFICACION ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPut("{id}")]
        public async Task<IActionResult> PutJustificacion(int id, [FromForm] Justificacion justificacion, [FromForm] IFormFile DocumentoAdjunto)
        {
            var justificacionOriginal = await _context.Justificacion.FindAsync(id);

            justificacionOriginal.Motivo = justificacion.Motivo;
            justificacionOriginal.DocumentoAdjunto = justificacion.DocumentoAdjunto;

            if (DocumentoAdjunto?.Length > 0)
            {
                using var ms = new MemoryStream();
                await DocumentoAdjunto.CopyToAsync(ms);
                justificacionOriginal.DocumentoAdjunto = ms.ToArray();
                justificacionOriginal.DocumentoNombre = DocumentoAdjunto.FileName;
                justificacionOriginal.DocumentoMimeType = DocumentoAdjunto.ContentType;
            }

            await _context.SaveChangesAsync();

            return Ok(justificacionOriginal);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ELIMINAR UNA JUSTIFICACION ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJustificacion(int id)
        {
            var justificacion = await _context.Justificacion.FindAsync(id);
            
            _context.Justificacion.Remove(justificacion);
            await _context.SaveChangesAsync();

            return Ok(justificacion);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA APROBAR UNA JUSTIFICACION /////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("{id}/Aprobar")]
        public async Task<IActionResult> AprobarJustificacion(int id)
        {
            var justificacion = await _context.Justificacion.FindAsync(id);
            
            if (justificacion.Estados != EstadoJustificacion.PENDIENTE)
                return BadRequest("Solo se pueden aprobar justificaciones pendientes.");

            justificacion.Estados = EstadoJustificacion.APROBADA;
            _context.Justificacion.Update(justificacion);

            await _context.SaveChangesAsync();

            return Ok(justificacion);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA RECHAZAR UNA JUSTIFICACION ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("{id}/Rechazar")]
        public async Task<IActionResult> RechazarJustificacion(int id)
        {
            var justificacion = await _context.Justificacion.FindAsync(id);
           
            if (justificacion.Estados != EstadoJustificacion.PENDIENTE)
                return BadRequest("Solo se pueden rechazar justificaciones pendientes.");

            justificacion.Estados = EstadoJustificacion.RECHAZADA;
            _context.Justificacion.Update(justificacion);

            await _context.SaveChangesAsync();

            return Ok(justificacion);
        }


        private bool JustificacionExists(int id)
        {
            return _context.Justificacion.Any(e => e.Id == id);
        }

    }
}
