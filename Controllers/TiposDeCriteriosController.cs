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
    public class TiposDeCriteriosController : ControllerBase
    {
        private readonly Context _context;

        public TiposDeCriteriosController(Context context)
        {
            _context = context;
        }

        // GET: api/TiposDeCriterios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoDeCriterio>>> GetTipoDeCriterio()
        {
            return await _context.TipoDeCriterio.ToListAsync();
        }

        // GET: api/TiposDeCriterios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoDeCriterio>> GetTipoDeCriterio(int id)
        {
            var tipoDeCriterio = await _context.TipoDeCriterio.FindAsync(id);

            if (tipoDeCriterio == null)
            {
                return NotFound();
            }

            return tipoDeCriterio;
        }

        // PUT: api/TiposDeCriterios/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoDeCriterio(int id, TipoDeCriterio tipoDeCriterio)
        {
            if (id != tipoDeCriterio.Id)
            {
                return BadRequest();
            }

            _context.Entry(tipoDeCriterio).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoDeCriterioExists(id))
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

        // POST: api/TiposDeCriterios
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TipoDeCriterio>> PostTipoDeCriterio(TipoDeCriterio tipoDeCriterio)
        {
            _context.TipoDeCriterio.Add(tipoDeCriterio);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoDeCriterio", new { id = tipoDeCriterio.Id }, tipoDeCriterio);
        }

        // DELETE: api/TiposDeCriterios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoDeCriterio(int id)
        {
            var tipoDeCriterio = await _context.TipoDeCriterio.FindAsync(id);
            if (tipoDeCriterio == null)
            {
                return NotFound();
            }

            _context.TipoDeCriterio.Remove(tipoDeCriterio);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoDeCriterioExists(int id)
        {
            return _context.TipoDeCriterio.Any(e => e.Id == id);
        }
    }
}
