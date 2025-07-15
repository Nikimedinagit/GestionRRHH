using System.ComponentModel.DataAnnotations.Schema;

namespace API_RRHH_TESIS2025.Models.General
{
    public class AprobacionDeLicencia
    {
        public int Id { get; set; }

        [NotMapped]
        public string EstadoString { get { return Estado.ToString(); } }
        public EstadoLicencia Estado { get; set; }

        [NotMapped]
        public string FechaDeAprobacionString { get { return FechDeAprobacion.ToString("dd/MM/yyyy"); } }
        public DateTime FechDeAprobacion { get; set; }
        public string UsuarioAprobador { get; set; }

        [NotMapped]
        public string LicenciaString { get { return Licencia?.TipoDeLicencia?.Nombre; } }
        public int LicenciaId { get; set; }
        public virtual Licencia Licencia { get; set; }
    }

    public class VistaAprobacionDeLicencia
    {
        public int Id { get; set; }
        public string LicenciaString { get; set; }
        public int LicenciaId { get; set; }
        public string FechaDeAprobacion { get; set; }
        public string EstadoString { get; set; }
        public EstadoLicencia Estado { get; set; }

    }

    public class FiltrarAprobacionDeLicencia
    {
        public DateTime? FechaAprobacion { get; set; }

        public int? LicenciaId { get; set; }
        
        public int? TipoDeLicenciaId { get; set; }
    }

}