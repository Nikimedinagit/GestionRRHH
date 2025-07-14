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

        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaEmpleado>>> FiltrarEmpleado([FromBody] FiltrarEmpleado filtro)
        {
            List<VistaEmpleado> vista = new List<VistaEmpleado>();
            var empleadosFiltrados = _context.Empleado.AsQueryable();

            if(!string.IsNullOrEmpty(filtro.NombreCompleto))
            {
                empleadosFiltrados = empleadosFiltrados.Where(e => e.NombreCompleto.ToLower().Contains(filtro.NombreCompleto.ToLower()));
            }
            // var resultado = await empleadosFiltrados.OrderBy(e => e.NombreCompleto).ToListAsync();
            if (filtro.DNI.HasValue)
            {
                string dniFiltro = filtro.DNI.Value.ToString();
                empleadosFiltrados = empleadosFiltrados.Where(e => e.DNI.ToString().StartsWith(dniFiltro));
            }

            if (filtro.EstadoCiviles.HasValue)
            {
                empleadosFiltrados = empleadosFiltrados.Where(e => (int)e.EstadoCiviles == filtro.EstadoCiviles);
            }

             if (filtro.TipoSexo.HasValue)
                empleadosFiltrados = empleadosFiltrados.Where(t => (int)t.TipoSexo == filtro.TipoSexo);

            if (filtro.LocalidadId.HasValue)
            {
                int localidadId = int.Parse(filtro.LocalidadId.Value.ToString());
                empleadosFiltrados = empleadosFiltrados.Where(e => e.LocalidadId == localidadId);
            }

            if (filtro.PuestoId.HasValue)
            {
                int puestoId = int.Parse(filtro.PuestoId.Value.ToString());
                empleadosFiltrados = empleadosFiltrados.Where(e => e.PuestoId == puestoId);
            }

            var listaFiltrada = await empleadosFiltrados
                .Include(e => e.Localidad)
                .Include(e => e.Puesto)
                .ToListAsync();
            foreach (var empleado in listaFiltrada)
            {
                var vistaEmpleado = new VistaEmpleado
                {
                    Id = empleado.Id,
                    NombreCompleto = empleado.NombreCompleto,
                    DNI = empleado.DNI,
                    Direccion = empleado.Direccion,
                    FechaNacimientoString = empleado.FechaNacimientoString,
                    EstadoCivilesString = empleado.EstadoCivilesString,
                    Email = empleado.Email,
                    Telefono = empleado.Telefono,
                    Cuil = empleado.Cuil,
                    CantidadHijos = empleado.CantidadHijos,
                    TipoSexoString = empleado.TipoSexoString,
                    LocalidadIdString = empleado.LocalidadIdString,
                    PuestoIdString = empleado.PuestoIdString,
                    Eliminado = empleado.Eliminado
                };
                vista.Add(vistaEmpleado);
            }
            return vista;
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

            //Guardamos el email en minúsculas
            empleado.Email = empleado.Email.ToLower();

            // Validamos si existe el dni, cuil, email y telefono
            var erroresExistentes = new List<string>();

            // DNI (obligatorio)
            if (!string.IsNullOrWhiteSpace(empleado.DNI.ToString()))
            {
                var dniExistente = await _context.Empleado
                    .FirstOrDefaultAsync(e => e.DNI == empleado.DNI && e.Id != empleado.Id);
                if (dniExistente != null)
                    erroresExistentes.Add("El DNI ya existe.");
            }

            // CUIL (opcional)
            if (empleado.Cuil != null && empleado.Cuil != 0)
            {
                var cuilExistente = await _context.Empleado
                    .FirstOrDefaultAsync(e => e.Cuil == empleado.Cuil && e.Id != empleado.Id);
                if (cuilExistente != null)
                    erroresExistentes.Add("El CUIL ya existe.");
            }

            // Email (solo si está presente)
            if (!string.IsNullOrWhiteSpace(empleado.Email))
            {
                var emailExistente = await _context.Empleado
                    .FirstOrDefaultAsync(e => e.Email.ToLower() == empleado.Email.ToLower() && e.Id != empleado.Id);
                if (emailExistente != null)
                    erroresExistentes.Add("El Email ya existe.");
            }

            // Teléfono (solo si está presente)
            if (!string.IsNullOrWhiteSpace(empleado.Telefono))
            {
                var telefonoExistente = await _context.Empleado
                    .FirstOrDefaultAsync(e => e.Telefono.ToLower() == empleado.Telefono.ToLower() && e.Id != empleado.Id);
                if (telefonoExistente != null)
                    erroresExistentes.Add("El Teléfono ya existe.");
            }

            // Devolver errores si existen
            if (erroresExistentes.Any())
                return BadRequest(new { codigo = 0, mensaje = erroresExistentes });

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

            return Ok(empleado);
        }

        // POST: api/Empleados
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Empleado>> PostEmpleado(Empleado empleado)
        {
            //Guarmamos en mayuscula
            empleado.NombreCompleto = empleado.NombreCompleto.ToUpper();
            empleado.Direccion = empleado.Direccion.ToUpper();

            //Guardamos el email en minúsculas
            empleado.Email = empleado.Email.ToLower();

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


            empleado.Eliminado = !empleado.Eliminado;
            var mensaje = empleado.Eliminado ?
                "Empleado Desactivado" :
                "Empleado Activado";

            _context.Empleado.Update(empleado);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje });
        }

        private bool EmpleadoExists(int id)
        {
            return _context.Empleado.Any(e => e.Id == id);
        }
    }
}
