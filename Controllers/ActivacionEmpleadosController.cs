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
using Microsoft.AspNetCore.Authorization;

namespace API_NET_CORE8_RRHH.Controllers
{   
    [Authorize(Roles = "ADMINISTRADOR, RRHH")]
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


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS DATOS DE LA API DE ACTIVACIONES ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaActivacionEmpleado>>> FiltrarActivacionEmpleado([FromBody] FiltrarActivacionEmpleado filtro)
        {
            var obtenerActivacionEmpleado = _context.ActivacionEmpleado
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.Nombre))
            {
                obtenerActivacionEmpleado = obtenerActivacionEmpleado.Where(x =>
                    EF.Functions.Like(x.Empleado.NombreCompleto, $"%{filtro.Nombre.Trim()}%"));
            }

            if (!string.IsNullOrWhiteSpace(filtro.Email))
            {
                obtenerActivacionEmpleado = obtenerActivacionEmpleado.Where(x =>
                    EF.Functions.Like(x.Empleado.Email, $"%{filtro.Email.Trim()}%"));
            }

            if (filtro.DNI.HasValue)
            {
                string dniFiltro = filtro.DNI.Value.ToString();
                obtenerActivacionEmpleado = obtenerActivacionEmpleado.Where(e => e.Empleado.DNI.ToString().StartsWith(dniFiltro));
            }

            if (filtro.Activo.HasValue)
            {
                bool activo = filtro.Activo.Value == 1;
                obtenerActivacionEmpleado = obtenerActivacionEmpleado.Where(c => c.Activo == activo);
            }

            var resultado = await obtenerActivacionEmpleado
                .Include(x => x.Empleado)
                .OrderBy(x => !x.Activo)
                .ThenBy(x => x.Empleado.NombreCompleto)
                .ThenBy(x => x.FechaActivacion)
                .Select(x => new VistaActivacionEmpleado
                {
                    Id = x.Id,
                    EmpleadoNombreString = x.Empleado.NombreCompleto,
                    EmpleadoEmailString = x.Empleado.Email,
                    EmpleadoDNIString = x.Empleado.DNI.ToString(),
                    FechaActivacionString = x.FechaActivacion.HasValue
                        ? x.FechaActivacion.Value.ToString("yyyy-MM-dd")
                        : "",
                    EmpleadoId = x.EmpleadoId,
                    Activo = x.Activo
                })
                .ToListAsync();

            return Ok(resultado);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ACTIVAR UN EMPLEADO ////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("Activar")]
        public async Task<IActionResult> ActivarEmpleado([FromBody] ActivacionEmpleadoDto dto)
        {
            var empleado = await _context.Empleado.FindAsync(dto.EmpleadoId);
            if (empleado == null)
                return NotFound("Empleado no encontrado.");

            var activacion = await _context.ActivacionEmpleado.FindAsync(dto.Id);
            if (activacion == null)
                return NotFound("Activación no encontrada.");

            activacion.Activo = true;
            activacion.FechaActivacion = DateTime.UtcNow;
            empleado.Eliminado = false;

            await _context.SaveChangesAsync();

            var rolesNecesarios = new[] { "RRHH", "SUPERVISOR", "EMPLEADO" };
            foreach (var rol in rolesNecesarios)
                if (!await _rolManager.RoleExistsAsync(rol))
                    await _rolManager.CreateAsync(new IdentityRole(rol));

            var usuario = await _userManager.FindByEmailAsync(empleado.Email);

            if (usuario != null)
            {
                if (!await _userManager.IsInRoleAsync(usuario, dto.Rol))
                {
                    var resultadoRolUsuario = await _userManager.AddToRoleAsync(usuario, dto.Rol);
                    if (!resultadoRolUsuario.Succeeded)
                        return BadRequest(resultadoRolUsuario.Errors);
                }
            }
            else
            {
                var nuevoUsuario = new ApplicationUser
                {
                    UserName = empleado.Email,
                    Email = empleado.Email,
                    NombreCompleto = empleado.NombreCompleto
                };

                var resultado = await _userManager.CreateAsync(nuevoUsuario, empleado.DNI.ToString());
                if (!resultado.Succeeded)
                    return BadRequest(resultado.Errors);

                var resultadoRol = await _userManager.AddToRoleAsync(nuevoUsuario, dto.Rol);
                if (!resultadoRol.Succeeded)
                    return BadRequest(resultadoRol.Errors);
            }

            return Ok(new { mensaje = "Empleado activado correctamente.", activacion.Id });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA DESACTIVAR UN EMPLEADO ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("Desactivar")]
        public async Task<IActionResult> DesactivarEmpleado([FromBody] ActivacionEmpleadoDto dto)
        {
            var activacion = await _context.ActivacionEmpleado
                .Include(a => a.Empleado)
                .FirstOrDefaultAsync(a => a.Id == dto.Id && a.EmpleadoId == dto.EmpleadoId);

            if (activacion == null)
                return NotFound("Activación no encontrada.");

            activacion.Activo = false;
            activacion.Empleado.Eliminado = true;

            await _context.SaveChangesAsync();

            var usuario = await _userManager.FindByEmailAsync(activacion.Empleado.Email);
            if (usuario != null)
            {
                var rolesUsuario = await _userManager.GetRolesAsync(usuario);
                foreach (var rol in rolesUsuario)
                {
                    await _userManager.RemoveFromRoleAsync(usuario, rol);
                }
            }

            return Ok(new { mensaje = "Empleado desactivado correctamente." });
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UN EMPLEADO POR ID /////////////////////////////////////////////////////// 
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
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




        private bool ActivacionEmpleadoExists(int id)
        {
            return _context.ActivacionEmpleado.Any(e => e.Id == id);
        }
    }
}
