using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;

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

        // GET: api/Certificados
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Certificado>>> GetCertificado()
        {
            return await _context.Certificado
            .Include(c => c.Empleado)
            .Include(c => c.Curso)
            .ToListAsync();
        }

        // GET: api/Certificados/5
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

        // PUT: api/Certificados/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCertificado(int id, Certificado certificado)
        {
            if (id != certificado.Id)
            {
                return BadRequest();
            }
            var empleadoExistente = await _context.Certificado
            .Where(c => c.EmpleadoId == certificado.EmpleadoId)
            .AnyAsync();

            if (empleadoExistente)
            {
                return BadRequest(new {codigo = 0, mensaje = "Este empleado ya tiene un certificado registrado para este curso"});
            }

            certificado.FechaEmision = DateTime.Now;
            _context.Entry(certificado).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CertificadoExists(id))
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

        // POST: api/Certificados
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Certificado>> PostCertificado(Certificado certificado)
        {

            //No se puede registrar dos veces el mismo empleado 
            var empleadoExistente = await _context.Certificado
            .Where(c => c.EmpleadoId == certificado.EmpleadoId && c.CursoId == certificado.CursoId)
            .FirstOrDefaultAsync();

            if (empleadoExistente != null)
            {
                return BadRequest(new {codigo = 0, mensaje = "Este empleado ya tiene un certificado registrado para este curso"});
            }
            certificado.FechaEmision = DateTime.Now;
            _context.Certificado.Add(certificado);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCertificado", new { id = certificado.Id }, certificado);
        }

        // DELETE: api/Certificados/5
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

            return NoContent();
        }

        private bool CertificadoExists(int id)
        {
            return _context.Certificado.Any(e => e.Id == id);
        }
    }
}
