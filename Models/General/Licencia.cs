namespace API_RRHH_TESIS2025.Models.General;

public class Licencia
{
    public int Id { get; set; }
    public int TipoDeLicenciaId { get; set; }
    public TipoDeLicencia TipoDeLicencia { get; set; }

    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }

    public EstadoLicencia Estado { get; set; }
    public string DocumentoAdjunto { get; set; }

    public int EmpleadoId { get; set; }
    public Empleado Empleado { get; set; }

    public AprobacionDeLicencia Aprobacion { get; set; }
}


public enum EstadoLicencia
{
    Pendiente = 1,
    Aprobada = 2,
    Rechazada = 3
}