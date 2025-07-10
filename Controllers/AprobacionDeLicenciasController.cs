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
    public class AprobacionDeLicenciasController : ControllerBase
    {
        private readonly Context _context;

        public AprobacionDeLicenciasController(Context context)
        {
            _context = context;
        }

        // GET: api/AprobacionDeLicencias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AprobacionDeLicencia>>> GetAprobacionDeLicencia()
        {
            return await _context.AprobacionDeLicencia.ToListAsync();
        }

        // GET: api/AprobacionDeLicencias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AprobacionDeLicencia>> GetAprobacionDeLicencia(int id)
        {
            var aprobacionDeLicencia = await _context.AprobacionDeLicencia.FindAsync(id);

            if (aprobacionDeLicencia == null)
            {
                return NotFound();
            }

            return aprobacionDeLicencia;
        }

        // PUT: api/AprobacionDeLicencias/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAprobacionDeLicencia(int id, AprobacionDeLicencia aprobacionDeLicencia)
        {
            if (id != aprobacionDeLicencia.Id)
            {
                return BadRequest();
            }

            _context.Entry(aprobacionDeLicencia).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AprobacionDeLicenciaExists(id))
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

        // POST: api/AprobacionDeLicencias
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<AprobacionDeLicencia>> PostAprobacionDeLicencia(AprobacionDeLicencia aprobacionDeLicencia)
        {
            _context.AprobacionDeLicencia.Add(aprobacionDeLicencia);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAprobacionDeLicencia", new { id = aprobacionDeLicencia.Id }, aprobacionDeLicencia);
        }

        // DELETE: api/AprobacionDeLicencias/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAprobacionDeLicencia(int id)
        {
            var aprobacionDeLicencia = await _context.AprobacionDeLicencia.FindAsync(id);
            if (aprobacionDeLicencia == null)
            {
                return NotFound();
            }

            _context.AprobacionDeLicencia.Remove(aprobacionDeLicencia);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AprobacionDeLicenciaExists(int id)
        {
            return _context.AprobacionDeLicencia.Any(e => e.Id == id);
        }
    }
}
