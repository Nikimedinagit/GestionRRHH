using Microsoft.AspNetCore.Identity;
public class ApplicationUser : IdentityUser
{
    public string NombreCompleto { get; set; } = string.Empty;
    public int? EmpresaId { get; set; }
    public bool Habilitado { get; set; } = true;
    public byte[] Avatar { get; set; }
    public string AvatarMimeType { get; set; }
}
