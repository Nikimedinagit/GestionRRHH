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
            return await _context.TipoDeCriterio
            .OrderBy(t => t.Nombre)
            .ToListAsync();
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

        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<TipoDeCriterio>>> FiltrarTipoDeCriterio(TipoDeCriterioFiltrar filtro)
        {
            var tipoDeCriteriosFiltro = _context.TipoDeCriterio.AsQueryable();

            if (filtro.Eliminado.HasValue)
            {
                tipoDeCriteriosFiltro = tipoDeCriteriosFiltro.Where(c => c.Eliminado == (filtro.Eliminado.Value == 1));
            }
            var resultado = await tipoDeCriteriosFiltro.OrderBy(c => c.Nombre).ToListAsync();
            return resultado;

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

            // Convertimos a mayuscula
            tipoDeCriterio.Nombre = tipoDeCriterio.Nombre.ToUpper();


            //Se verifica si el tipo de criterio ya existe
            var existeTipoDeCriterio = await _context.TipoDeCriterio
            .FirstOrDefaultAsync(tc => tc.Nombre.ToLower() == tipoDeCriterio.Nombre.ToLower() && tc.Id != id);

            if (existeTipoDeCriterio != null)
            {
                return Ok(new { codigo = 0, mensaje = "Ya existe." });
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

            return Ok(tipoDeCriterio);
        }

        // POST: api/TiposDeCriterios
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TipoDeCriterio>> PostTipoDeCriterio(TipoDeCriterio tipoDeCriterio)
        {

            // Convertimos a mayuscula
            tipoDeCriterio.Nombre = tipoDeCriterio.Nombre.ToUpper();


            //Se verifica si el tipo de criterio ya existe
            var existeTipoDeCriterio = await _context.TipoDeCriterio
            .AnyAsync(tc => tc.Nombre.ToLower() == tipoDeCriterio.Nombre.ToLower());

            if (existeTipoDeCriterio)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            }

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

            tipoDeCriterio.Eliminado = !tipoDeCriterio.Eliminado;
            var mensaje = tipoDeCriterio.Eliminado ?
            "Tipo de Criterio Desactivado" :
            "Tipo de Criterio Activado";

            _context.TipoDeCriterio.Update(tipoDeCriterio);
            await _context.SaveChangesAsync();

            return Ok(new {mensaje});
        }

        private bool TipoDeCriterioExists(int id)
        {
            return _context.TipoDeCriterio.Any(e => e.Id == id);
        }
    }
}
