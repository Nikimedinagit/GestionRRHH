using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionRRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "DESARROLLADOR")]
    public class CuentasController : ControllerBase
    {
        private readonly Context _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public CuentasController(Context context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetCuentas()
        {
            var rolAdministradorId = await _context.Roles
                .Where(r => r.NormalizedName == "ADMINISTRADOR")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();
            var administradoresIds = _context.UserRoles
                .Where(ur => ur.RoleId == rolAdministradorId)
                .Select(ur => ur.UserId);
            var rolDesarrolladorId = await _context.Roles
                .Where(r => r.NormalizedName == "DESARROLLADOR")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();
            var desarrolladoresIds = _context.UserRoles
                .Where(ur => ur.RoleId == rolDesarrolladorId)
                .Select(ur => ur.UserId);

            var usuarios = await _userManager.Users
                .Where(u => administradoresIds.Contains(u.Id))
                .OrderByDescending(u => u.Id)
                .Select(u => new
                {
                    u.Id, u.NombreCompleto, u.Email, u.Habilitado, u.EmpresaId,
                    Empresa = u.EmpresaId == null
                        ? "SISTEMA GLOBAL"
                        : _context.Empresa.Where(e => e.Id == u.EmpresaId).Select(e => e.Nombre).FirstOrDefault(),
                    EmpresaHabilitada = u.EmpresaId == null ||
                        _context.Empresa.Where(e => e.Id == u.EmpresaId).Select(e => e.Habilitada).FirstOrDefault(),
                    EsDesarrollador = desarrolladoresIds.Contains(u.Id)
                }).ToListAsync();
            return Ok(usuarios);
        }

        [HttpPut("{id}/Estado/{habilitar:bool}")]
        public async Task<IActionResult> CambiarEstado(string id, bool habilitar)
        {
            var usuario = await _userManager.FindByIdAsync(id);
            if (usuario == null) return NotFound();
            if (await _userManager.IsInRoleAsync(usuario, "DESARROLLADOR"))
                return BadRequest(new { mensaje = "La cuenta desarrolladora Loguisoft está protegida y no puede deshabilitarse." });
            if (!usuario.EmpresaId.HasValue) return BadRequest(new { mensaje = "La cuenta no tiene una empresa asociada." });
            usuario.Habilitado = habilitar;
            var empresa = await _context.Empresa.FindAsync(usuario.EmpresaId.Value);
            if (empresa != null) empresa.Habilitada = habilitar;
            await _userManager.UpdateAsync(usuario);
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = habilitar ? "Cuenta habilitada correctamente." : "Cuenta deshabilitada correctamente." });
        }
    }
}
