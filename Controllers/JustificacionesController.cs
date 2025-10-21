using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

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
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaJustificacion>>> JustificacionFiltrar([FromBody] JustificacionFiltrar filtro)
        {
            var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var usuarioActual = await _context.Users.FindAsync(userId);
            var emailActual = usuarioActual?.Email?.Trim().ToLower();

            var obtenerJustificaciones = _context.Justificacion
                .Include(j => j.Empleado)
                    .ThenInclude(e => e.Puesto)
                .AsQueryable();

            if (rolActual == "EMPLEADO")
            {
                var empleado = await _context.Empleado.FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);
                if (empleado != null)
                    obtenerJustificaciones = obtenerJustificaciones.Where(j => j.EmpleadoId == empleado.Id);
                else
                    return Ok(new List<VistaJustificacion>());
            }

            if (rolActual == "SUPERVISOR")
            {
                var empleado = await _context.Empleado.FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);
                if (empleado != null)
                {
                    obtenerJustificaciones = obtenerJustificaciones
                        .Where(j => j.Empleado.Email.Trim().ToLower() == emailActual);
                }
                else return Ok(new List<VistaJustificacion>());
            }

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

            var listaVista = new List<VistaJustificacion>();

            var justificaciones = await obtenerJustificaciones
                .OrderBy(j => j.Estados)
                .ThenBy(j => j.Fecha)
                .ToListAsync();

            foreach (var j in justificaciones)
            {
                bool esEditable = false;
                bool esPropia = false;
                string claseBorde = "";

                switch (rolActual)
                {
                    case "ADMINISTRADOR":
                        esEditable = true;
                        esPropia = true;
                        claseBorde = "";
                        break;
                    case "RRHH":
                        if (j.Empleado.Email.Trim().ToLower() == emailActual)
                        {
                            esEditable = true;
                            esPropia = true;
                            claseBorde = "green";
                        }
                        else
                        {
                            esEditable = false;
                            esPropia = false;
                            claseBorde = "yellow";
                        }
                        break;
                    case "SUPERVISOR":
                        if (j.Empleado.Email.Trim().ToLower() == emailActual)
                        {
                            esEditable = true;
                            esPropia = true;
                        }
                        else
                        {
                            esEditable = false;
                            esPropia = false;
                        }
                        break;

                    case "EMPLEADO":
                        esEditable = true;
                        esPropia = true;
                        claseBorde = "";
                        break;
                }

                listaVista.Add(new VistaJustificacion
                {
                    Id = j.Id,
                    Motivo = j.Motivo,
                    FechaString = j.Fecha.ToString("dd/MM/yyyy"),
                    EstadoString = j.Estados.ToString(),
                    EmpleadoString = j.Empleado.NombreCompleto,
                    EmpleadoId = j.EmpleadoId,
                    DocumentoAdjunto = j.DocumentoAdjunto,
                    DocumentoNombre = j.DocumentoNombre,
                    DocumentoMimeType = j.DocumentoMimeType,
                    EsEditable = esEditable,
                    EsPropia = esPropia,
                    ClaseBorde = claseBorde
                });
            }

            return Ok(listaVista);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UN JUSTIFICACION POR ID ///////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
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
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
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
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpPost]
        public async Task<ActionResult<Justificacion>> PostJustificacion([FromForm] Justificacion justificacion, [FromForm] IFormFile DocumentoAdjunto)
        {
            var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (rol == "SUPERVISOR" || rol == "EMPLEADO")
            {
                var usuario = await _context.Users.FindAsync(userId);
                var emailUsuario = usuario?.Email?.Trim().ToLower();

                var empleado = await _context.Empleado
                    .Where(e => e.Email.Trim().ToLower() == emailUsuario)
                    .FirstOrDefaultAsync();

                justificacion.EmpleadoId = empleado.Id;
            }

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
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
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
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
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
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
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
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
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
