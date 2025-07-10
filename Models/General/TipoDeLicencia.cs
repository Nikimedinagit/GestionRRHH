namespace API_RRHH_TESIS2025.Models.General;

public class TipoDeLicencia
{
    public int Id { get; set; }
    public string Nombre { get; set; }

    public ICollection<Licencia> Licencias { get; set; }

}