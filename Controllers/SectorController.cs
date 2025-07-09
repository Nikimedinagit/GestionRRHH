using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;

namespace API_RRHH_TESIS2025.Controllers
{   

    // [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SectorController : ControllerBase
    {
        private readonly Context _context;

        public SectorController(Context context)
        {
            _context = context;
        }

        // GET: api/Sector
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sector>>> GetSector()
        {
            return await _context.Sector
            .OrderBy(s => s.Nombre)
            .ToListAsync();
        }

        // GET: api/Sector/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Sector>> GetSector(int id)
        {
            var sector = await _context.Sector.FindAsync(id);

            if (sector == null)
            {
                return NotFound();
            }

            return sector;
        }

        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<Sector>>> GetSector([FromBody] FiltrarSectores filtro)
        {   
            var sectorFiltro = _context.Sector.AsQueryable();
            if (filtro.Eliminado.HasValue)
            {
                sectorFiltro = sectorFiltro.Where(c => c.Eliminado == (filtro.Eliminado.Value == 1));
            }
            var resultado = await sectorFiltro.OrderBy(c => c.Nombre).ToListAsync();
            return resultado;
        }

        // PUT: api/Sector/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSector(int id, Sector sector)
        {
            if (id != sector.Id)
            {
                return BadRequest();
            }

                // Guardamos en mayúsculas
            sector.Nombre = sector.Nombre.ToUpper();

            var sectorExistente = await _context.Sector
                .AnyAsync(x => x.Nombre.ToLower() == sector.Nombre.ToLower());
            if (sectorExistente)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            }



            _context.Entry(sector).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SectorExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(sector);
        }

        // POST: api/Sector
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Sector>> PostSector(Sector sector)
        {

            // Guardamos en mayúsculas
            sector.Nombre = sector.Nombre.ToUpper();

            var sectorExistente = await _context.Sector
                .AnyAsync(x => x.Nombre.ToLower() == sector.Nombre.ToLower());
            if (sectorExistente)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            }
            _context.Sector.Add(sector);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSector", new { id = sector.Id }, sector);
        }

        // DELETE: api/Sector/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSector(int id)
        {
            var sector = await _context.Sector.FindAsync(id);
            if (sector == null)
            {
                return NotFound();
            }

                sector.Eliminado = !sector.Eliminado;
            var mensaje = sector.Eliminado ?
                "Sector Desactivado" :
                "Sector Activado";

            _context.Sector.Update(sector);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje });
        }

            
        private bool SectorExists(int id)
        {
            return _context.Sector.Any(e => e.Id == id);
        }
    }
}
