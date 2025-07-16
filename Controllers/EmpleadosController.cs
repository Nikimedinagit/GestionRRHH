using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkSync.Models.General;

namespace API_RRHH_TESIS2025.Controllers
{
    [Authorize(Roles = "ADMINISTRADOR")]
    [Route("api/[controller]")]
    [ApiController]
    public class EmpleadosController : ControllerBase
    {
        private readonly Context _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public EmpleadosController(Context context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/Empleados
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VistaEmpleado>>> GetEmpleado()
        {
            var empleados = await _context.Empleado
                .Include(e => e.Localidad)
                .Include(e => e.Puesto)
                .ToListAsync();

            var usuarioIds = empleados
                .Where(e => e.UsuarioId != null)
                .Select(e => e.UsuarioId)
                .Distinct()
                .ToList();

            var usuarios = await _context.Users
                .Where(u => usuarioIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id);

            var vista = empleados.Select(e => new VistaEmpleado
            {
                Id = e.Id,
                NombreCompleto = e.NombreCompleto,
                DNI = e.DNI,
                Direccion = e.Direccion,
                FechaNacimientoString = e.FechaNacimientoString,
                EstadoCivilesString = e.EstadoCivilesString,
                Email = e.Email,
                Telefono = e.Telefono,
                Cuil = e.Cuil,
                CantidadHijos = e.CantidadHijos,
                TipoSexoString = e.TipoSexoString,
                LocalidadIdString = e.LocalidadIdString,
                PuestoIdString = e.PuestoIdString,
                UsuarioId = e.UsuarioId,
                UsuarioNombreCreador = usuarios.ContainsKey(e.UsuarioId) ? usuarios[e.UsuarioId].NombreCompleto : null,
                UsuarioEmailCreador = usuarios.ContainsKey(e.UsuarioId) ? usuarios[e.UsuarioId].Email : null,
                Eliminado = e.Eliminado
            }).ToList();

            return vista;
        }


        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaEmpleado>>> FiltrarEmpleado([FromBody] FiltrarEmpleado filtro)
        {
            List<VistaEmpleado> vista = new List<VistaEmpleado>();
            var empleadosFiltrados = _context.Empleado.AsQueryable();

            if (!string.IsNullOrEmpty(filtro.NombreCompleto))
            {
                empleadosFiltrados = empleadosFiltrados.Where(e => e.NombreCompleto.ToLower().Contains(filtro.NombreCompleto.ToLower()));
            }
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
                int localidadId = filtro.LocalidadId.Value;
                empleadosFiltrados = empleadosFiltrados.Where(e => e.LocalidadId == localidadId);
            }

            if (filtro.PuestoId.HasValue)
            {
                int puestoId = filtro.PuestoId.Value;
                empleadosFiltrados = empleadosFiltrados.Where(e => e.PuestoId == puestoId);
            }

            var listaFiltrada = await empleadosFiltrados
                .Include(e => e.Localidad)
                .Include(e => e.Puesto)
                .ToListAsync();

            var usuarios = await _context.Users
                .Where(u => empleadosFiltrados.Select(t => t.UsuarioId).Contains(u.Id))
                .ToDictionaryAsync(u => u.Id);

            foreach (var empleado in listaFiltrada)
            {
                var usuarioId = empleado.UsuarioId;

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
                    UsuarioId = usuarioId,
                    UsuarioNombreCreador = !string.IsNullOrEmpty(usuarioId) && usuarios.ContainsKey(usuarioId) ? usuarios[usuarioId].NombreCompleto : null,
                    UsuarioEmailCreador = !string.IsNullOrEmpty(usuarioId) && usuarios.ContainsKey(usuarioId) ? usuarios[usuarioId].Email : null,
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
                return BadRequest();

            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Sistema";

            // Obtener empleado original con puesto incluido para comparar
            var empleadoOriginal = await _context.Empleado
                .Include(e => e.Puesto)
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            if (empleadoOriginal == null)
                return NotFound();

            // Pasar a mayúsculas/minúsculas según necesidad
            empleado.NombreCompleto = empleado.NombreCompleto.ToUpper();
            empleado.Direccion = empleado.Direccion.ToUpper();
            empleado.Email = empleado.Email.ToLower();
            empleado.UsuarioId = userId;

            // Validaciones (DNI, CUIL, Email, Teléfono)
            var erroresExistentes = new List<string>();

            if (!string.IsNullOrWhiteSpace(empleado.DNI.ToString()))
            {
                var dniExistente = await _context.Empleado
                    .FirstOrDefaultAsync(e => e.DNI == empleado.DNI && e.Id != empleado.Id);
                if (dniExistente != null)
                    erroresExistentes.Add("El DNI ya existe.");
            }

            if (empleado.Cuil != 0)
            {
                var cuilExistente = await _context.Empleado
                    .FirstOrDefaultAsync(e => e.Cuil == empleado.Cuil && e.Id != empleado.Id);
                if (cuilExistente != null)
                    erroresExistentes.Add("El CUIL ya existe.");
            }

            if (!string.IsNullOrWhiteSpace(empleado.Email))
            {
                var emailExistente = await _context.Empleado
                    .FirstOrDefaultAsync(e => e.Email.ToLower() == empleado.Email.ToLower() && e.Id != empleado.Id);
                if (emailExistente != null)
                    erroresExistentes.Add("El Email ya existe.");
            }

            if (!string.IsNullOrWhiteSpace(empleado.Telefono))
            {
                var telefonoExistente = await _context.Empleado
                    .FirstOrDefaultAsync(e => e.Telefono.ToLower() == empleado.Telefono.ToLower() && e.Id != empleado.Id);
                if (telefonoExistente != null)
                    erroresExistentes.Add("El Teléfono ya existe.");
            }

            if (erroresExistentes.Any())
                return BadRequest(new { codigo = 0, mensaje = erroresExistentes });

            // Obtener descripción del nuevo puesto
            var puestoNuevo = await _context.Puesto.FindAsync(empleado.PuestoId);

            var puestoAnterior = empleadoOriginal.Puesto?.Descripcion ?? "Desconocido";
            var puestoActual = puestoNuevo?.Descripcion ?? "Desconocido";

            if (puestoAnterior != puestoActual)
            {
                var historial = new HistorialLaboral
                {
                    FechaModificacion = DateTime.Now,
                    EmpleadoId = empleado.Id,
                    PuestoAnterior = puestoAnterior,
                    PuestoActual = puestoActual,
                    UsuarioModificador = userId
                };
                _context.HistorialLaboral.Add(historial);
            }

            _context.Entry(empleado).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpleadoExists(id))
                    return NotFound();
                else
                    throw;
            }

            return Ok(empleado);
        }




        // POST: api/Empleados
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Empleado>> PostEmpleado(Empleado empleado)
        {
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            //Guarmamos en mayuscula
            empleado.NombreCompleto = empleado.NombreCompleto.ToUpper();
            empleado.Direccion = empleado.Direccion.ToUpper();

            //Guardamos el email en minúsculas
            empleado.Email = empleado.Email.ToLower();

            // Asignar valores predeterminados a los campos
            empleado.UsuarioId = userId;

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


        //METODOS PARA FILTRAR EN LAS CARD DE ESTADISTICAS
        //Total de empleados
        [HttpGet("Total")]
        public async Task<ActionResult<int>> GetTotalEmpleados()
        {
            // Obtener el rol del usuario autenticado
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _context.Users.FindAsync(userId);

            var roles = await _userManager.GetRolesAsync(user);
            var rol = roles.FirstOrDefault();

            // Permitir solo si es ADMINISTRADOR
            if (rol != "ADMINISTRADOR")
            {
                return Forbid(); // O return Unauthorized();
            }

            // Consultar todas las licencias de empleados no eliminados
            var total = await _context.Empleado
                .Where(e => !e.Eliminado)
                .CountAsync();

            return Ok(new { total });
        }

        //Empleados Masculinos
        [HttpGet("Masculinos")]
        public async Task<ActionResult<int>> GetMasculinosEmpleados()
        {
            // Validar rol ADMINISTRADOR directamente de claims (optimización, si lo tienes)
            var roles = HttpContext.User.FindAll(ClaimTypes.Role).Select(r => r.Value);
            if (!roles.Contains("ADMINISTRADOR"))
            {
                return Forbid();
            }

            // Obtener el total de empleados masculinos
            var total = await _context.Empleado
                .Where(e => !e.Eliminado && e.TipoSexo == TipoSexo.MASCULINO)
                .CountAsync();

            return Ok(new { total });
        }

        //Empleados Femeninos
        [HttpGet("Femeninos")]
        public async Task<ActionResult<int>> GetFemeninosEmpleados()
        {
            // Validar rol ADMINISTRADOR directamente de claims (optimización, si lo tienes)
            var roles = HttpContext.User.FindAll(ClaimTypes.Role).Select(r => r.Value);
            if (!roles.Contains("ADMINISTRADOR"))
            {
                return Forbid();
            }

            // Obtener el total de empleados femeninos
            var total = await _context.Empleado
                .Where(e => !e.Eliminado && e.TipoSexo == TipoSexo.FEMENINO)
                .CountAsync();

            return Ok(new { total });
        }

        //Empleados Otros/No binarios
        [HttpGet("Otros")]
        public async Task<ActionResult<int>> GetOtrosEmpleados()
        {
            var roles = HttpContext.User.FindAll(ClaimTypes.Role).Select(r => r.Value);
            if (!roles.Contains("ADMINISTRADOR"))
            {
                return Forbid();
            }

            var total = await _context.Empleado
                .Where(e => !e.Eliminado &&
                       (e.TipoSexo == TipoSexo.OTRO || e.TipoSexo == TipoSexo.NO_BINARIO))
                .CountAsync();

            return Ok(new { total });
        }


        private bool EmpleadoExists(int id)
        {
            return _context.Empleado.Any(e => e.Id == id);
        }
    }
}
