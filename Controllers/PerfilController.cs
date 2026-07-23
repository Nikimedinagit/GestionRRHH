using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GestionRRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PerfilController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _entorno;

        public PerfilController(UserManager<ApplicationUser> userManager, IWebHostEnvironment entorno)
        {
            _userManager = userManager;
            _entorno = entorno;
        }

        [HttpGet]
        public async Task<IActionResult> GetPerfil()
        {
            var usuario = await UsuarioActual();
            if (usuario == null) return Unauthorized();
            return Ok(new { usuario.NombreCompleto, usuario.Email, tieneAvatar = usuario.Avatar != null });
        }

        [HttpGet("Avatar")]
        public async Task<IActionResult> GetAvatar()
        {
            var usuario = await UsuarioActual();
            if (usuario?.Avatar == null) return NotFound();
            return File(usuario.Avatar, usuario.AvatarMimeType ?? "image/jpeg");
        }

        [HttpPut("Avatar")]
        public async Task<IActionResult> CambiarAvatar(IFormFile avatar)
        {
            var usuario = await UsuarioActual();
            if (usuario == null) return Unauthorized();
            if (avatar == null || avatar.Length == 0)
                return BadRequest(new { mensaje = "Seleccione uno de los avatares disponibles." });
            using var memoria = new MemoryStream();
            await avatar.CopyToAsync(memoria);
            var contenido = memoria.ToArray();
            var permitido = false;
            for (var numero = 1; numero <= 16; numero++)
            {
                var ruta = Path.Combine(_entorno.WebRootPath, "img", "avatars", $"av-{numero}.png");
                if (System.IO.File.Exists(ruta) &&
                    contenido.SequenceEqual(await System.IO.File.ReadAllBytesAsync(ruta)))
                {
                    permitido = true;
                    break;
                }
            }
            if (!permitido)
                return BadRequest(new { mensaje = "Solo puede seleccionar uno de los avatares disponibles." });

            usuario.Avatar = contenido;
            usuario.AvatarMimeType = "image/png";
            await _userManager.UpdateAsync(usuario);
            return Ok(new { mensaje = "Avatar modificado correctamente." });
        }

        [HttpPut("Contrasena")]
        public async Task<IActionResult> CambiarContrasena([FromBody] CambiarContrasenaDto dto)
        {
            var usuario = await UsuarioActual();
            if (usuario == null) return Unauthorized();
            if (dto == null || string.IsNullOrWhiteSpace(dto.Actual) || string.IsNullOrWhiteSpace(dto.Nueva))
                return BadRequest(new { mensaje = "Complete ambas contraseñas." });
            var resultado = await _userManager.ChangePasswordAsync(usuario, dto.Actual, dto.Nueva);
            if (!resultado.Succeeded)
                return BadRequest(new { mensaje = resultado.Errors.FirstOrDefault()?.Description ?? "No se pudo cambiar la contraseña." });
            return Ok(new { mensaje = "Contraseña modificada correctamente." });
        }

        private Task<ApplicationUser> UsuarioActual() =>
            _userManager.FindByIdAsync(User.FindFirstValue(ClaimTypes.NameIdentifier));
    }

    public class CambiarContrasenaDto
    {
        public string Actual { get; set; }
        public string Nueva { get; set; }
    }
}
