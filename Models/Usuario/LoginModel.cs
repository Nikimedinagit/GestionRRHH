namespace API_RRHH_TESIS2025.Models.Usuario
{
    // Creamos una clase para el login
    public class LoginModel
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    // Creamos una clase para el token de refresco
    public class RefreshTokenRequest
    {
        public string Email { get; set; }
        public string RefreshToken { get; set; }
    }

    // Creamos una clase para el logout
    public class LogoutRequest
    {
        public string Email { get; set; }

    }
}