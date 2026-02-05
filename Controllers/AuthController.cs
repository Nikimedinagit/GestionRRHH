using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using API_RRHH_TESIS2025.Models.Usuario;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly Context _context;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _rolManager;
    private readonly IConfiguration _configuration;

    public AuthController(
        Context context,
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> rolManager,
        IConfiguration configuration
    )
    {
        _context = context;
        _signInManager = signInManager;
        _userManager = userManager;
        _rolManager = rolManager;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterModel model)
    {
        if (!await _rolManager.RoleExistsAsync("ADMINISTRADOR"))
            await _rolManager.CreateAsync(new IdentityRole("ADMINISTRADOR"));

        var existingUser = await _userManager.FindByEmailAsync(model.Email);
        if (existingUser != null)
            return Conflict(new { message = "El correo ya está registrado" });

        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            NombreCompleto = model.NombreCompleto
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(user, "ADMINISTRADOR");
            return Ok("Usuario administrador registrado");
        }

        return BadRequest(result.Errors);
    }



    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
        {
            var empleado = await _context.Empleado.FirstOrDefaultAsync(e => e.Email == user.Email);

            if (empleado != null && empleado.Eliminado)
            {
                return Unauthorized("Credenciales inválidas");
            }

            var roles = await _userManager.GetRolesAsync(user);

            var rolesPermitidos = new[] { "ADMINISTRADOR", "RRHH", "SUPERVISOR", "EMPLEADO" };

            if (!roles.Any(r => rolesPermitidos.Contains(r)))
            {
                return Unauthorized("Acceso restringido.");
            }

            string rolNombre = roles.First(r => rolesPermitidos.Contains(r));

            var claims = new[]
            {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Role, rolNombre),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(15),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            var refreshToken = GenerarRefreshToken();
            await _userManager.SetAuthenticationTokenAsync(user, "MyApp", "RefreshToken", refreshToken);

            return Ok(new
            {
                token = jwt,
                refreshToken = refreshToken,
                email = user.Email,
                nombreCompleto = user.NombreCompleto,
                rol = rolNombre
            });
        }

        return Unauthorized("Credenciales inválidas");
    }




    private string GenerarRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }




    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
            return Unauthorized();

        var savedToken = await _userManager.GetAuthenticationTokenAsync(user, "MyApp", "RefreshToken");
        if (savedToken != model.RefreshToken)
            return Unauthorized("Refresh token inválido");

        var roles = await _userManager.GetRolesAsync(user);
        var rolNombre = roles.FirstOrDefault() ?? "CLIENTE";

        var claims = new[]
        {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim(ClaimTypes.Role, rolNombre),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var newToken = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Issuer"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(60),
            signingCredentials: creds
        );

        var jwt = new JwtSecurityTokenHandler().WriteToken(newToken);

        var newRefreshToken = GenerarRefreshToken();
        await _userManager.SetAuthenticationTokenAsync(user, "MyApp", "RefreshToken", newRefreshToken);

        return Ok(new
        {
            token = jwt,
            refreshToken = newRefreshToken
        });
    }



    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
            return BadRequest();

        await _userManager.RemoveAuthenticationTokenAsync(user, "MyApp", "RefreshToken");
        return Ok("Sesión cerrada correctamente");
    }
}


