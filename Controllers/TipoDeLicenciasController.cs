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
    public class TipoDeLicenciasController : ControllerBase
    {
        private readonly Context _context;

        public TipoDeLicenciasController(Context context)
        {
            _context = context;
        }

        // GET: api/TipoDeLicencias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoDeLicencia>>> GetTipoDeLicencia()
        {
            return await _context.TipoDeLicencia.ToListAsync();
        }

        // GET: api/TipoDeLicencias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoDeLicencia>> GetTipoDeLicencia(int id)
        {
            var tipoDeLicencia = await _context.TipoDeLicencia.FindAsync(id);

            if (tipoDeLicencia == null)
            {
                return NotFound();
            }

            return tipoDeLicencia;
        }

        // PUT: api/TipoDeLicencias/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoDeLicencia(int id, TipoDeLicencia tipoDeLicencia)
        {
            if (id != tipoDeLicencia.Id)
            {
                return BadRequest();
            }

            _context.Entry(tipoDeLicencia).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoDeLicenciaExists(id))
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

        // POST: api/TipoDeLicencias
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TipoDeLicencia>> PostTipoDeLicencia(TipoDeLicencia tipoDeLicencia)
        {
            _context.TipoDeLicencia.Add(tipoDeLicencia);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoDeLicencia", new { id = tipoDeLicencia.Id }, tipoDeLicencia);
        }

        // DELETE: api/TipoDeLicencias/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoDeLicencia(int id)
        {
            var tipoDeLicencia = await _context.TipoDeLicencia.FindAsync(id);
            if (tipoDeLicencia == null)
            {
                return NotFound();
            }

            _context.TipoDeLicencia.Remove(tipoDeLicencia);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoDeLicenciaExists(int id)
        {
            return _context.TipoDeLicencia.Any(e => e.Id == id);
        }
    }
}
