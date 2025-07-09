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
    [Route("[controller]")]
    [ApiController]
    public class LocalidadesController : ControllerBase
    {
        private readonly Context _context;

        public LocalidadesController(Context context)
        {
            _context = context;
        }

        // GET: api/Localidades
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Localidad>>> GetLocalidad()
        {
            var localidades = await _context.Localidad
            .Include(x => x.Provincia)
            .Where(l => !l.Provincia.Eliminado)
            .OrderBy(l => l.Provincia.Nombre)
            .ThenBy(l => l.Nombre)
            .ToListAsync();
            return localidades;
        }

        // GET: api/Localidades/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Localidad>> GetLocalidad(int id)
        {
            var localidad = await _context.Localidad.FindAsync(id);

            if (localidad == null)
            {
                return NotFound();
            }

            return localidad;
        }

        // PUT: api/Localidades/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLocalidad(int id, Localidad localidad)
        {      

            // Guardamos en mayúsculas
            localidad.Nombre = localidad.Nombre.ToUpper();

            var localidadExistente = await _context.Localidad
                .AnyAsync(x => x.Nombre.ToLower() == localidad.Nombre.ToLower());
            if (localidadExistente)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            }



            if (id != localidad.Id)
            {
                return BadRequest();
            }

            _context.Entry(localidad).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LocalidadExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(localidad);
        }

        // POST: api/Localidades
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Localidad>> PostLocalidad(Localidad localidad)
        {

            // Guardamos en mayúsculas
            localidad.Nombre = localidad.Nombre.ToUpper();

            var localidadExistente = await _context.Localidad
                .AnyAsync(x => x.Nombre.ToLower() == localidad.Nombre.ToLower());
            if (localidadExistente)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            }

            _context.Localidad.Add(localidad);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetLocalidad", new { id = localidad.Id }, localidad);
        }

        // DELETE: api/Localidades/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLocalidad(int id)
        {
            var localidad = await _context.Localidad.FindAsync(id);
            if (localidad == null)
            {
                return NotFound();
            }

            localidad.Eliminado = !localidad.Eliminado;
            var mensaje = localidad.Eliminado ?
                "Localidad Desactivada" :
                "Localidad Activada";

            _context.Localidad.Update(localidad);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje });
        }

        private bool LocalidadExists(int id)
        {
            return _context.Localidad.Any(e => e.Id == id);
        }
    }
}