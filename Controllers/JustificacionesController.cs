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
            return await _context.Justificacion.ToListAsync();
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

        // PUT: api/Justificaciones/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutJustificacion(int id, Justificacion justificacion)
        {
            if (id != justificacion.Id)
            {
                return BadRequest();
            }

            _context.Entry(justificacion).State = EntityState.Modified;

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
        public async Task<ActionResult<Justificacion>> PostJustificacion(Justificacion justificacion)
        {
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
    }
}
