using GestionRRHH.Models.General;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionRRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMINISTRADOR, RRHH")]
    public class CurriculumsController : ControllerBase
    {
        private const long MaximoArchivo = 10 * 1024 * 1024;
        private static readonly HashSet<string> ExtensionesPermitidas =
            new(StringComparer.OrdinalIgnoreCase) { ".pdf", ".doc", ".docx", ".odt" };
        private readonly Context _context;

        public CurriculumsController(Context context)
        {
            _context = context;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER Y FILTRAR EL HISTORIAL DE CURRICULUM //////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpGet]
        public async Task<IActionResult> GetCurriculums([FromQuery] string nombre, [FromQuery] DateTime? desde, [FromQuery] DateTime? hasta)
        {
            var query = _context.Curriculum.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(nombre))
            {
                var nombreBuscar = nombre.Trim().ToLower();
                query = query.Where(c => c.NombreCompleto.ToLower().Contains(nombreBuscar));
            }

            if (desde.HasValue) query = query.Where(c => c.FechaRecepcion >= desde.Value.Date);
            if (hasta.HasValue) query = query.Where(c => c.FechaRecepcion < hasta.Value.Date.AddDays(1));

            var resultado = await query
                .OrderByDescending(c => c.FechaRecepcion)
                .ThenByDescending(c => c.Id)
                .Select(c => new
                {
                    c.Id,
                    c.NombreCompleto,
                    c.Email,
                    c.Telefono,
                    c.FechaRecepcion,
                    c.Observaciones,
                    c.DocumentoNombre,
                    c.DocumentoMimeType
                })
                .ToListAsync();

            return Ok(resultado);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA REGISTRAR UN CURRICULUM ///////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost]
        public async Task<IActionResult> PostCurriculum(
            [FromForm] string nombreCompleto,
            [FromForm] string email,
            [FromForm] string telefono,
            [FromForm] DateTime fechaRecepcion,
            [FromForm] string observaciones,
            [FromForm] IFormFile documento)
        {
            if (string.IsNullOrWhiteSpace(nombreCompleto))
                return BadRequest(new { campo = "nombre", mensaje = "Debe ingresar el nombre del postulante." });

            var errorArchivo = ValidarArchivo(documento);
            if (errorArchivo != null) return BadRequest(new { campo = "archivo", mensaje = errorArchivo });

            using var memoria = new MemoryStream();
            await documento.CopyToAsync(memoria);

            var curriculum = new Curriculum
            {
                NombreCompleto = nombreCompleto.Trim().ToUpperInvariant(),
                Email = email?.Trim().ToLowerInvariant(),
                Telefono = telefono?.Trim(),
                FechaRecepcion = fechaRecepcion == default ? DateTime.Today : fechaRecepcion.Date,
                Observaciones = observaciones?.Trim().ToUpperInvariant(),
                Documento = memoria.ToArray(),
                DocumentoNombre = Path.GetFileName(documento.FileName),
                DocumentoMimeType = documento.ContentType ?? "application/octet-stream"
            };

            _context.Curriculum.Add(curriculum);
            await _context.SaveChangesAsync();
            return Ok(new { curriculum.Id, mensaje = "CV registrado correctamente." });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA DESCARGAR EL ARCHIVO DEL CURRICULUM ///////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpGet("{id:int}/documento")]
        public async Task<IActionResult> DescargarDocumentoCurriculum(int id)
        {
            var curriculum = await _context.Curriculum.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
            if (curriculum == null) return NotFound();
            return File(curriculum.Documento, curriculum.DocumentoMimeType, curriculum.DocumentoNombre);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UN CURRICULUM //////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutCurriculum(
            int id,
            [FromForm] string nombreCompleto,
            [FromForm] string email,
            [FromForm] string telefono,
            [FromForm] DateTime fechaRecepcion,
            [FromForm] string observaciones,
            [FromForm] IFormFile documento)
        {
            var curriculum = await _context.Curriculum.FindAsync(id);
            if (curriculum == null) return NotFound(new { mensaje = "El curriculum no existe." });
            if (string.IsNullOrWhiteSpace(nombreCompleto))
                return BadRequest(new { campo = "nombre", mensaje = "Debe ingresar el nombre del postulante." });

            if (documento != null)
            {
                var errorArchivo = ValidarArchivo(documento);
                if (errorArchivo != null) return BadRequest(new { campo = "archivo", mensaje = errorArchivo });
                using var memoria = new MemoryStream();
                await documento.CopyToAsync(memoria);
                curriculum.Documento = memoria.ToArray();
                curriculum.DocumentoNombre = Path.GetFileName(documento.FileName);
                curriculum.DocumentoMimeType = documento.ContentType ?? "application/octet-stream";
            }

            curriculum.NombreCompleto = nombreCompleto.Trim().ToUpperInvariant();
            curriculum.Email = email?.Trim().ToLowerInvariant();
            curriculum.Telefono = telefono?.Trim();
            curriculum.FechaRecepcion = fechaRecepcion == default ? curriculum.FechaRecepcion : fechaRecepcion.Date;
            curriculum.Observaciones = observaciones?.Trim().ToUpperInvariant();

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Curriculum modificado correctamente." });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ELIMINAR UN CURRICULUM ///////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteCurriculum(int id)
        {
            var curriculum = await _context.Curriculum.FindAsync(id);
            if (curriculum == null) return NotFound(new { mensaje = "El CV no existe." });

            _context.Curriculum.Remove(curriculum);
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "CV eliminado correctamente." });
        }

        private static string ValidarArchivo(IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0) return "Debe seleccionar un archivo.";
            if (archivo.Length > MaximoArchivo) return "El archivo no puede superar los 10 MB.";
            if (!ExtensionesPermitidas.Contains(Path.GetExtension(archivo.FileName)))
                return "El archivo debe ser PDF, DOC, DOCX u ODT.";
            return null;
        }
    }
}
