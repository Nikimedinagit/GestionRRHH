using GestionRRHH.Models.General;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionRRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RecibosSueldoController : ControllerBase
    {
        private const long MaximoArchivo = 10 * 1024 * 1024;
        private static readonly HashSet<string> ExtensionesPermitidas =
            new(StringComparer.OrdinalIgnoreCase) { ".pdf", ".jpg", ".jpeg", ".png" };
        private readonly Context _context;

        public RecibosSueldoController(Context context)
        {
            _context = context;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER Y FILTRAR LOS RECIBOS DE SUELDO //////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpGet]
        public async Task<IActionResult> GetRecibosSueldo([FromQuery] string empleado, [FromQuery] DateTime? periodo)
        {
            var query = _context.ReciboSueldo
                .AsNoTracking()
                .Include(r => r.Empleado)
                .Where(r => r.Empleado != null && !r.Empleado.Eliminado);

            if (!string.IsNullOrWhiteSpace(empleado))
            {
                var empleadoBuscar = empleado.Trim().ToLower();
                query = query.Where(r => r.Empleado.NombreCompleto.ToLower().Contains(empleadoBuscar));
            }
            if (periodo.HasValue)
            {
                var inicio = new DateTime(periodo.Value.Year, periodo.Value.Month, 1);
                var fin = inicio.AddMonths(1);
                query = query.Where(r => r.Periodo >= inicio && r.Periodo < fin);
            }

            var resultado = await query
                .OrderByDescending(r => r.Periodo)
                .ThenByDescending(r => r.FechaCarga)
                .Select(r => new
                {
                    r.Id,
                    r.EmpleadoId,
                    EmpleadoString = r.Empleado.NombreCompleto,
                    r.Periodo,
                    r.FechaCarga,
                    r.Observaciones,
                    r.DocumentoNombre,
                    r.DocumentoMimeType
                })
                .ToListAsync();

            return Ok(resultado);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA REGISTRAR UN RECIBO DE SUELDO /////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost]
        public async Task<IActionResult> PostReciboSueldo(
            [FromForm] int empleadoId,
            [FromForm] string periodo,
            [FromForm] string observaciones,
            [FromForm] IFormFile documento)
        {
            var empleado = await _context.Empleado
                .FirstOrDefaultAsync(e => e.Id == empleadoId && !e.Eliminado);
            if (empleado == null) return BadRequest(new { campo = "empleado", mensaje = "Debe seleccionar un empleado válido." });

            if (!DateTime.TryParse($"{periodo}-01", out var periodoFecha))
                return BadRequest(new { campo = "periodo", mensaje = "Debe seleccionar el período del recibo." });

            if (documento == null || documento.Length == 0)
                return BadRequest(new { campo = "archivo", mensaje = "Debe seleccionar el recibo." });
            if (documento.Length > MaximoArchivo)
                return BadRequest(new { campo = "archivo", mensaje = "El archivo no puede superar los 10 MB." });
            if (!ExtensionesPermitidas.Contains(Path.GetExtension(documento.FileName)))
                return BadRequest(new { campo = "archivo", mensaje = "El recibo debe ser PDF, JPG, JPEG o PNG." });

            var duplicado = await _context.ReciboSueldo
                .AnyAsync(r => r.EmpleadoId == empleadoId &&
                    r.Periodo.Year == periodoFecha.Year &&
                    r.Periodo.Month == periodoFecha.Month);
            if (duplicado)
                return BadRequest(new
                {
                    campo = "empleado",
                    mensaje = "Este empleado ya tiene un recibo registrado para el período seleccionado."
                });

            using var memoria = new MemoryStream();
            await documento.CopyToAsync(memoria);

            var recibo = new ReciboSueldo
            {
                EmpleadoId = empleadoId,
                Periodo = new DateTime(periodoFecha.Year, periodoFecha.Month, 1),
                FechaCarga = DateTime.Now,
                Observaciones = observaciones?.Trim().ToUpperInvariant(),
                Documento = memoria.ToArray(),
                DocumentoNombre = Path.GetFileName(documento.FileName),
                DocumentoMimeType = documento.ContentType ?? "application/octet-stream"
            };

            _context.ReciboSueldo.Add(recibo);

            _context.Notificaciones.Add(new Notificaciones
            {
                Titulo = "Nuevo Recibo de Sueldo",
                Mensaje = $"{empleado.NombreCompleto}, se cargó tu recibo de sueldo correspondiente al período {periodoFecha:MM/yyyy}.",
                FechaCreacion = DateTime.Now,
                UsuarioId = empleado.Id.ToString(),
                DestinatarioRol = "EMPLEADO,SUPERVISOR",
                Leida = false
            });

            await _context.SaveChangesAsync();
            return Ok(new { recibo.Id, mensaje = "Recibo registrado correctamente." });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA DESCARGAR EL ARCHIVO DEL RECIBO ///////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpGet("{id:int}/documento")]
        public async Task<IActionResult> DescargarDocumentoRecibo(int id)
        {
            var recibo = await _context.ReciboSueldo.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);
            if (recibo == null) return NotFound();
            return File(recibo.Documento, recibo.DocumentoMimeType, recibo.DocumentoNombre);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UN RECIBO DE SUELDO /////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutReciboSueldo(
            int id,
            [FromForm] int empleadoId,
            [FromForm] string periodo,
            [FromForm] string observaciones,
            [FromForm] IFormFile documento)
        {
            var recibo = await _context.ReciboSueldo.FindAsync(id);
            if (recibo == null) return NotFound(new { mensaje = "El recibo no existe." });

            var empleadoExiste = await _context.Empleado.AnyAsync(e => e.Id == empleadoId && !e.Eliminado);
            if (!empleadoExiste)
                return BadRequest(new { campo = "empleado", mensaje = "Debe seleccionar un empleado válido." });
            if (!DateTime.TryParse($"{periodo}-01", out var periodoFecha))
                return BadRequest(new { campo = "periodo", mensaje = "Debe seleccionar el período del recibo." });

            var duplicado = await _context.ReciboSueldo.AnyAsync(r =>
                r.Id != id && r.EmpleadoId == empleadoId &&
                r.Periodo.Year == periodoFecha.Year && r.Periodo.Month == periodoFecha.Month);
            if (duplicado)
                return BadRequest(new
                {
                    campo = "empleado",
                    mensaje = "Este empleado ya tiene un recibo registrado para el período seleccionado."
                });

            if (documento != null)
            {
                if (documento.Length == 0)
                    return BadRequest(new { campo = "archivo", mensaje = "El archivo seleccionado está vacío." });
                if (documento.Length > MaximoArchivo)
                    return BadRequest(new { campo = "archivo", mensaje = "El archivo no puede superar los 10 MB." });
                if (!ExtensionesPermitidas.Contains(Path.GetExtension(documento.FileName)))
                    return BadRequest(new { campo = "archivo", mensaje = "El recibo debe ser PDF, JPG, JPEG o PNG." });

                using var memoria = new MemoryStream();
                await documento.CopyToAsync(memoria);
                recibo.Documento = memoria.ToArray();
                recibo.DocumentoNombre = Path.GetFileName(documento.FileName);
                recibo.DocumentoMimeType = documento.ContentType ?? "application/octet-stream";
            }

            recibo.EmpleadoId = empleadoId;
            recibo.Periodo = new DateTime(periodoFecha.Year, periodoFecha.Month, 1);
            recibo.Observaciones = observaciones?.Trim().ToUpperInvariant();
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Recibo de sueldo modificado correctamente." });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ELIMINAR UN RECIBO DE SUELDO //////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteReciboSueldo(int id)
        {
            var recibo = await _context.ReciboSueldo.FindAsync(id);
            if (recibo == null) return NotFound(new { mensaje = "El recibo no existe." });

            _context.ReciboSueldo.Remove(recibo);
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Recibo eliminado correctamente." });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS RECIBOS DEL USUARIO AUTENTICADO //////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "EMPLEADO, SUPERVISOR")]
        [HttpGet("MisRecibos")]
        public async Task<IActionResult> GetMisRecibos([FromQuery] DateTime? periodo)
        {
            var emailUsuario = await ObtenerEmailUsuarioActual();
            if (string.IsNullOrWhiteSpace(emailUsuario))
                return Ok(Array.Empty<object>());

            var query = _context.ReciboSueldo
                .AsNoTracking()
                .Include(r => r.Empleado)
                .Where(r => r.Empleado != null &&
                    !r.Empleado.Eliminado &&
                    r.Empleado.Email != null &&
                    r.Empleado.Email.Trim().ToLower() == emailUsuario.Trim().ToLower());

            if (periodo.HasValue)
            {
                var inicio = new DateTime(periodo.Value.Year, periodo.Value.Month, 1);
                var fin = inicio.AddMonths(1);
                query = query.Where(r => r.Periodo >= inicio && r.Periodo < fin);
            }

            var recibos = await query
                .OrderByDescending(r => r.Periodo)
                .Select(r => new
                {
                    r.Id,
                    r.Periodo,
                    r.FechaCarga,
                    r.Observaciones,
                    r.DocumentoNombre,
                    r.DocumentoMimeType
                })
                .ToListAsync();

            return Ok(recibos);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA DESCARGAR UN RECIBO DEL USUARIO AUTENTICADO //////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "EMPLEADO, SUPERVISOR")]
        [HttpGet("MisRecibos/{id:int}/documento")]
        public async Task<IActionResult> DescargarMiRecibo(int id)
        {
            var emailUsuario = await ObtenerEmailUsuarioActual();
            if (string.IsNullOrWhiteSpace(emailUsuario)) return Forbid();

            var recibo = await _context.ReciboSueldo
                .AsNoTracking()
                .Include(r => r.Empleado)
                .FirstOrDefaultAsync(r => r.Id == id &&
                    r.Empleado != null &&
                    r.Empleado.Email != null &&
                    r.Empleado.Email.Trim().ToLower() == emailUsuario.Trim().ToLower());

            if (recibo == null) return NotFound();
            return File(recibo.Documento, recibo.DocumentoMimeType, recibo.DocumentoNombre);
        }

        private async Task<string> ObtenerEmailUsuarioActual()
        {
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId)) return null;

            return await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => u.Email)
                .FirstOrDefaultAsync();
        }
    }
}
