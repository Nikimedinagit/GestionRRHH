using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Identity;
using API_RRHH_TESIS2025.Models.Dto;

namespace API_NET_CORE8_RRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ActivacionEmpleadosController : ControllerBase
    {
        private readonly Context _context;
        private readonly RoleManager<IdentityRole> _rolManager;

        private readonly UserManager<ApplicationUser> _userManager;

        public ActivacionEmpleadosController(Context context, RoleManager<IdentityRole> rolManager, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _rolManager = rolManager;
            _userManager = userManager;
        }

        // GET: api/ActivacionEmpleados
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ActivacionEmpleado>>> GetActivacionEmpleado()
        {
            var activacionEmpleados = await _context.ActivacionEmpleado
            .Include(x => x.Empleado)
            .ToListAsync(); 
            return activacionEmpleados;
        }

        // GET: api/ActivacionEmpleados/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ActivacionEmpleado>> GetActivacionEmpleado(int id)
        {
            var activacionEmpleado = await _context.ActivacionEmpleado.FindAsync(id);

            if (activacionEmpleado == null)
            {
                return NotFound();
            }

            return activacionEmpleado;
        }

        // metodo post para activar un empleado
        [HttpPost("Activar")]
        public async Task<IActionResult> ActivarEmpleado([FromBody] ActivacionEmpleadoDto activacionEmpleadoDto)
        {
            // Buscar empleado y activación
            var empleado = await _context.Empleado.FindAsync(activacionEmpleadoDto.EmpleadoId);
            if (empleado == null) return NotFound("Empleado no encontrado.");

            var activacion = await _context.ActivacionEmpleado.FindAsync(activacionEmpleadoDto.Id);
            if (activacion == null) return NotFound("Activación no encontrada.");

            // Actualizar estado
            activacion.Activo = true;
            activacion.FechaActivacion = DateTime.Now;
            empleado.Eliminado = false;

            await _context.SaveChangesAsync();

            // Crear roles si no existen
            var rolesNecesarios = new[] { "RRHH", "SUPERVISOR", "EMPLEADO" };
            foreach (var rol in rolesNecesarios)
            {
                if (!await _rolManager.RoleExistsAsync(rol))
                    await _rolManager.CreateAsync(new IdentityRole(rol));
            }

            // Verificar si el usuario ya existe
            var usuarioExistente = await _userManager.FindByEmailAsync(empleado.Email);
            if (usuarioExistente != null)
            {
                // Usuario existe, actualizar rol si no lo tiene
                var rolesUsuario = await _userManager.GetRolesAsync(usuarioExistente);
                if (!rolesUsuario.Contains(activacionEmpleadoDto.Rol))
                {
                    var resultadoRolUsuario = await _userManager.AddToRoleAsync(usuarioExistente, activacionEmpleadoDto.Rol);
                    if (!resultadoRolUsuario.Succeeded)
                    {
                        return BadRequest(resultadoRolUsuario.Errors);
                    }
                }
            }
            else
            {
                // Crear usuario con contraseña DNI
                var nuevoUsuario = new ApplicationUser
                {
                    UserName = empleado.Email,
                    Email = empleado.Email,
                    NombreCompleto = empleado.NombreCompleto
                };

                var resultado = await _userManager.CreateAsync(nuevoUsuario, empleado.DNI.ToString());
                if (!resultado.Succeeded)
                {
                    return BadRequest(resultado.Errors);
                }

                // Asignar rol seleccionado
                var resultadoRol = await _userManager.AddToRoleAsync(nuevoUsuario, activacionEmpleadoDto.Rol);
                if (!resultadoRol.Succeeded)
                {
                    return BadRequest(resultadoRol.Errors);
                }
            }

            return CreatedAtAction(nameof(GetActivacionEmpleado), new { id = activacion.Id }, activacion);
        }



        [HttpPost("Desactivar")]
        public async Task<IActionResult> DesactivarEmpleado([FromBody] ActivacionEmpleadoDto dto)
        {
            var empleado = await _context.Empleado.FindAsync(dto.EmpleadoId);
            if (empleado == null) return NotFound("Empleado no encontrado.");

            var activacion = await _context.ActivacionEmpleado.FindAsync(dto.Id);
            if (activacion == null) return NotFound("Activación no encontrada.");

            activacion.Activo = false;
            empleado.Eliminado = true;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Empleado desactivado correctamente." });
        }





        private bool ActivacionEmpleadoExists(int id)
        {
            return _context.ActivacionEmpleado.Any(e => e.Id == id);
        }
    }
}
