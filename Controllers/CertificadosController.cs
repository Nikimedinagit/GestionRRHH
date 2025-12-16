using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;

namespace API_NET_CORE8_RRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CertificadosController : ControllerBase
    {
        private readonly Context _context;

        public CertificadosController(Context context)
        {
            _context = context;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS DATOS DE LA API DE ASISTENCIA CURSO ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        // [Authorize (Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Certificado>>> GetCertificado()
        {
            var certificados = await _context.Certificado
                .Include(c => c.Empleado)
                .Include(c => c.Curso)
                .Where(c => c.Empleado != null && !c.Empleado.Eliminado)
                .ToListAsync();

            return Ok(certificados); 
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UN CERTIFICADO //////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Certificado>> GetCertificado(int id)
        {
            var certificado = await _context.Certificado.FindAsync(id);

            if (certificado == null)
            {
                return NotFound();
            }

            return certificado;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA DESCARGAR UN CERTIFICADO ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("Documento/{id}")]
        public async Task<IActionResult> DescargarDocumento(int id)
        {
            var certificado = await _context.Certificado.FindAsync(id);

            var nombreArchivo = certificado.DocumentoNombre ?? $"Justificacion_{id}";
            var mimeType = certificado.DocumentoMimeType ?? "application/octet-stream";

            return File(certificado.DocumentoAdjunto, mimeType, nombreArchivo);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CREAR UN CERTIFICADO ////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost]
        public async Task<ActionResult> PostCertificado([FromForm] Certificado certificado, [FromForm] IFormFile DocumentoAdjunto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { codigo = -1, mensaje = "Datos inválidos en el modelo." });
            }

            Console.WriteLine($"EmpleadoId: {certificado.EmpleadoId}, CursoId: {certificado.CursoId}");

            var asistenciaAprobada = await _context.AsistenciaCapacitacion
                .AsNoTracking()
                .FirstOrDefaultAsync(a =>
                    a.EmpleadoId == certificado.EmpleadoId &&
                    a.CursoId == certificado.CursoId &&
                    a.Asistencia &&
                    a.Resultado >= 6);

            if (asistenciaAprobada == null)
                return BadRequest(new { codigo = 0, mensaje = "El empleado no aprobó o no asistió a este curso" });

            bool existeCertificado = await _context.Certificado
                .AsNoTracking()
                .AnyAsync(c => c.EmpleadoId == certificado.EmpleadoId && c.CursoId == certificado.CursoId);

            if (existeCertificado)
                return BadRequest(new { codigo = 0, mensaje = "Este empleado ya tiene un certificado registrado." });

            if (DocumentoAdjunto != null && DocumentoAdjunto.Length > 0)
            {
                using var ms = new MemoryStream();
                await DocumentoAdjunto.CopyToAsync(ms);

                certificado.DocumentoAdjunto = ms.ToArray();
                certificado.DocumentoNombre = DocumentoAdjunto.FileName;
                certificado.DocumentoMimeType = DocumentoAdjunto.ContentType;
            }

            _context.Certificado.Add(certificado);
            await _context.SaveChangesAsync();

            return Ok(certificado);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ELIMINAR UN CERTIFICADO ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCertificado(int id)
        {
            var certificado = await _context.Certificado.FindAsync(id);
            if (certificado == null)
            {
                return NotFound();
            }

            _context.Certificado.Remove(certificado);
            await _context.SaveChangesAsync();

            return Ok(certificado);
        }


        private bool CertificadoExists(int id)
        {
            return _context.Certificado.Any(e => e.Id == id);
        }
    }
}
