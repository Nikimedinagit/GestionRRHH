using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API_RRHH_TESIS2025.Controllers
{   
    [Authorize(Roles = "ADMINISTRADOR")]
    [Route("api/[controller]")]
    [ApiController]
    public class EmpleadosController : ControllerBase
    {
        private readonly Context _context;

        public EmpleadosController(Context context)
        {
            _context = context;
        }

        // GET: api/Empleados
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Empleado>>> GetEmpleado()
        {
            var empleado = await _context.Empleado
                .Include(e => e.Localidad)
                .Include(e => e.Puesto)
                .ToListAsync();

            return empleado;
        }

        // GET: api/Empleados/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Empleado>> GetEmpleado(int id)
        {
            var empleado = await _context.Empleado.FindAsync(id);

            if (empleado == null)
            {
                return NotFound();
            }

            return empleado;
        }

        // PUT: api/Empleados/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpleado(int id, Empleado empleado)
        {
            if (id != empleado.Id)
            {
                return BadRequest();
            }

            //Guarmamos en mayuscula
            empleado.NombreCompleto = empleado.NombreCompleto.ToUpper();
            empleado.Direccion = empleado.Direccion.ToUpper();

            _context.Entry(empleado).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpleadoExists(id))
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

        // POST: api/Empleados
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Empleado>> PostEmpleado(Empleado empleado)
        {   
            //Guarmamos en mayuscula
            empleado.NombreCompleto = empleado.NombreCompleto.ToUpper();
            empleado.Direccion = empleado.Direccion.ToUpper();

            // Validamos si existe el dni, cuil, emial y telefono
            var errroresExistentes = new List<string>();

            var dniExistente = await _context.Empleado
                .FirstOrDefaultAsync(e => e.DNI == empleado.DNI && e.Id != empleado.Id);
            if (dniExistente != null)
                errroresExistentes.Add("El DNI ya existe.");

            var cuilExistente = await _context.Empleado
                .FirstOrDefaultAsync(e => e.Cuil == empleado.Cuil && e.Id != empleado.Id);
            if (cuilExistente != null)
                errroresExistentes.Add("El CUIL ya existe.");

            var emailExistente = await _context.Empleado
                .FirstOrDefaultAsync(e => e.Email.ToLower() == empleado.Email.ToLower() && e.Id != empleado.Id);
            if (emailExistente != null)
                errroresExistentes.Add("El Email ya existe.");

            var telefonoExistente = await _context.Empleado
                .FirstOrDefaultAsync(e => e.Telefono.ToLower() == empleado.Telefono.ToLower() && e.Id != empleado.Id);
            if (telefonoExistente != null)
                errroresExistentes.Add("El Telefono ya existe.");

            if (errroresExistentes.Any())
                return BadRequest(new { codigo = 0, mensaje = errroresExistentes });
                
            _context.Empleado.Add(empleado);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEmpleado", new { id = empleado.Id }, empleado);
        }

        // DELETE: api/Empleados/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpleado(int id)
        {
            var empleado = await _context.Empleado.FindAsync(id);
            if (empleado == null)
            {
                return NotFound();
            }

            _context.Empleado.Remove(empleado);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EmpleadoExists(int id)
        {
            return _context.Empleado.Any(e => e.Id == id);
        }
    }
}
