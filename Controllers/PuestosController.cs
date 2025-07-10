using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;

namespace API_RRHH_TESIS2025.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PuestosController : ControllerBase
    {
        private readonly Context _context;

        public PuestosController(Context context)
        {
            _context = context;
        }

        // GET: api/Puestos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Puesto>>> GetPuesto()
        {
            var puestos = await _context.Puesto
            .Include(x => x.Sector)
            .Where(x => !x.Sector.Eliminado)
            .OrderBy(p => p.Sector.Nombre)
            .ThenBy(p => p.Descripcion)
            .ToListAsync();
            return puestos;
        }

        // GET: api/Puestos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Puesto>> GetPuesto(int id)
        {
            var puesto = await _context.Puesto.FindAsync(id);

            if (puesto == null)
            {
                return NotFound();
            }

            return puesto;
        }

        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<Puesto>>> GetPuesto([FromBody] PuestoFiltrar filtro)
        {
            var puestosFiltro = _context.Puesto
             .Where(x => !x.Sector.Eliminado)
                .Include(x => x.Sector)
                .AsQueryable();

            if (filtro.Eliminado.HasValue)
            {
                puestosFiltro = puestosFiltro.Where(c => c.Eliminado == (filtro.Eliminado.Value == 1));
            }

            if (filtro.SectorId > 0)
            {
                puestosFiltro = puestosFiltro.Where(t => t.SectorId == filtro.SectorId);
            }

            var resultado = await puestosFiltro
                .OrderBy(p => p.Sector.Nombre)
                .ThenBy(p => p.Descripcion)
                .ToListAsync();

            return resultado;
        }

        // PUT: api/Puestos/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPuesto(int id, Puesto puesto)
        {
            if (id != puesto.Id)
            {
                return BadRequest();
            }

            // Convertimos el nombre a minúsculas
            puesto.Descripcion = puesto.Descripcion.ToUpper();

            var puestoExistente = await _context.Puesto
                .AnyAsync(x => x.Descripcion.ToLower() == puesto.Descripcion.ToLower() &&
                x.SectorId == puesto.SectorId);
            if (puestoExistente)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe en este sector." });
            }

            _context.Entry(puesto).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PuestoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(puesto);
        }

        // POST: api/Puestos
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Puesto>> PostPuesto(Puesto puesto)
        {
            // Convertimos el nombre a minúsculas
            puesto.Descripcion = puesto.Descripcion.ToUpper();

            // Comprobamos si la puesto ya existe

            var puestoExistente = await _context.Puesto
                .AnyAsync(x => x.Descripcion.ToLower() == puesto.Descripcion.ToLower() &&
                x.SectorId == puesto.SectorId);

            if (puestoExistente)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe en este sector." });
            }


            _context.Puesto.Add(puesto);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPuesto", new { id = puesto.Id }, puesto);
        }

        // DELETE: api/Puestos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePuesto(int id)
        {
            var puesto = await _context.Puesto.FindAsync(id);
            if (puesto == null)
            {
                return NotFound();
            }

            puesto.Eliminado = !puesto.Eliminado;
            var mensaje = puesto.Eliminado ?
                "Puesto Desactivado" :
                "Puesto Activad0";

            _context.Puesto.Update(puesto);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje });
        }

        private bool PuestoExists(int id)
        {
            return _context.Puesto.Any(e => e.Id == id);
        }
    }
}
