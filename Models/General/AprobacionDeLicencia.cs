namespace API_RRHH_TESIS2025.Models.General;
public class AprobacionDeLicencia
{
    public int Id { get; set; }
    public EstadoLicencia Estado { get; set; }
    public DateTime FechDeAprobacion { get; set; }
    public string UsuarioAprobador { get; set; }
    
    public int LicenciaId { get; set; }
    public Licencia Licencia { get; set; }
}