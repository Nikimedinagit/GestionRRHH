namespace API_RRHH_TESIS2025.Models.Usuario
{
    // Creamos una clase para el registro
    public class RegisterModel
    {
        public string NombreCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}