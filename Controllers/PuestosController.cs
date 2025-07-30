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
    [Authorize (Roles = "ADMINISTRADOR")]
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

        [HttpGet("Activos")]
        public async Task<ActionResult<IEnumerable<Puesto>>> GetPuestosActivos()
        {
            var puestosActivos = await _context.Puesto
                .Where(p => !p.Eliminado)
                .OrderBy(p => p.Descripcion)
                .ToListAsync();
            return puestosActivos;
        }

        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaPuesto>>> PuestoFiltrar([FromBody] PuestoFiltrar filtro)
        {
            List<VistaPuesto> vista = new List<VistaPuesto>();
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


            var listaFiltrada = await puestosFiltro
                .OrderBy(p => p.Sector.Nombre)
                .ThenBy(p => p.Descripcion)
                .ToListAsync();
            foreach (var puesto in listaFiltrada)
                {
                    var vistaPuesto = new VistaPuesto
                    {
                        Id = puesto.Id,
                        Descripcion = puesto.Descripcion,
                        SectorString = puesto.SectorString,
                        SectorId = puesto.SectorId,
                        Eliminado = puesto.Eliminado
                    };
                    vista.Add(vistaPuesto);
                }
            return vista;
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
            var puesto = await _context.Puesto
            .Include(p => p.Empleados)
            .FirstOrDefaultAsync(p => p.Id == id);
            if (puesto == null)
            {
                return NotFound();
            }
            // Si está activo y tiene empleados asociados, NO permitir desactivarlo
            if (!puesto.Eliminado &&
                puesto.Empleados != null &&
                puesto.Empleados.Any())
            {
                return BadRequest(new { mensaje = "No se puede desactivar el puesto porque tiene empleados asociados." });
            }

            puesto.Eliminado = !puesto.Eliminado;
            var mensaje = puesto.Eliminado ?
                "Puesto Desactivado" :
                "Puesto Activado";

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
