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
    public class ProvinciasController : ControllerBase
    {
        private readonly Context _context;

        public ProvinciasController(Context context)
        {
            _context = context;
        }

        // GET: api/Provincias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Provincia>>> GetProvincia()
        {
            return await _context.Provincia
            .Where(p => !p.Eliminado) 
            .OrderBy(p => p.Nombre)
            .ToListAsync();
        }

        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<Provincia>>> GetProvincia([FromBody] FiltrarProvincias filtro)
        {
        
            var provinciasFiltro = _context.Provincia.AsQueryable();
            if (filtro.Eliminado.HasValue)
            {
                provinciasFiltro = provinciasFiltro.Where(c => c.Eliminado == (filtro.Eliminado.Value == 1));
            }
            var resultado = await provinciasFiltro.OrderBy(c => c.Nombre).ToListAsync();
            return resultado;
        }

        // GET: api/Provincias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Provincia>> GetProvincia(int id)
        {
            var provincia = await _context.Provincia.FindAsync(id);

            if (provincia == null)
            {
                return NotFound();
            }

            return provincia;
        }

        // PUT: api/Provincias/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProvincia(int id, Provincia provincia)
        {
            if (id != provincia.Id)
            {
                return BadRequest();
            }
            
            // Convertimos el nombre a minúsculas
            provincia.Nombre = provincia.Nombre.ToUpper();

            var provinciaExistente = await _context.Provincia.FirstOrDefaultAsync(p => p.Nombre.ToLower() == provincia.Nombre.ToLower() && p.Id != id);

            if (provinciaExistente != null)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            }

            
            _context.Entry(provincia).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProvinciaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(provincia);
        }

        // POST: api/Provincias
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Provincia>> PostProvincia(Provincia provincia)
        {
            // Convertimos el nombre a minúsculas
            provincia.Nombre = provincia.Nombre.ToUpper();

            // Comprobamos si la provincia ya existe
            var provinciaExistente = await _context.Provincia
                .AnyAsync(x => x.Nombre.ToLower() == provincia.Nombre.ToLower());

            if (provinciaExistente)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            }

            _context.Provincia.Add(provincia);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProvincia", new { id = provincia.Id }, provincia);
        }

        // DELETE: api/Provincias/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProvincia(int id)
        {
            var provincia = await _context.Provincia.FindAsync(id);
            if (provincia == null)
            {
                return NotFound();
            }

             provincia.Eliminado = !provincia.Eliminado; 
             var mensaje = provincia.Eliminado ? 
             "Provincia Desactivada" :
             "Provincia Activada";
             
             
            _context.Provincia.Update(provincia);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje });	
        }

        private bool ProvinciaExists(int id)
        {
            return _context.Provincia.Any(e => e.Id == id);
        }
    }
}
