using System.ComponentModel.DataAnnotations.Schema;

namespace API_RRHH_TESIS2025.Models.General
{

    public class Licencia
    {
        public int Id { get; set; }

        [NotMapped]
        public string TipoDeLicenciaString { get { return TipoDeLicencia?.Nombre; } }
        public int TipoDeLicenciaId { get; set; }
        public TipoDeLicencia TipoDeLicencia { get; set; }

        [NotMapped]
        public string FechaInicioString { get { return FechaInicio.ToString("dd/MM/yyyy"); } }
        public DateTime FechaInicio { get; set; }

        [NotMapped]
        public string FechaFinString { get { return FechaFin.ToString("dd/MM/yyyy"); } }
        public DateTime FechaFin { get; set; }

        [NotMapped]
        public string EstadoString { get { return Estado.ToString(); } }
        public EstadoLicencia Estado { get; set; }


        public byte[] DocumentoAdjunto { get; set; }
        public string DocumentoNombre { get; set; }
        public string DocumentoMimeType { get; set; }

        [NotMapped]
        public string EmpleadoString { get { return Empleado?.NombreCompleto; } }
        public int EmpleadoId { get; set; }
        public Empleado Empleado { get; set; }

        public AprobacionDeLicencia Aprobacion { get; set; }

    }

    public class VistaLicencia
    {
        public int Id { get; set; }
        public string TipoDeLicenciaString { get; set; }
        public int TipoDeLicenciaId { get; set; }
        public string FechaInicioString { get; set; }
        public string FechaFinString { get; set; }
        public string EstadoString { get; set; }
        public byte[] DocumentoAdjunto { get; set; }
        public string DocumentoNombre { get; set; }
        public string DocumentoMimeType { get; set; }
        public string EmpleadoString { get; set; }
        public int EmpleadoId { get; set; }
    }

    public enum EstadoLicencia
    {
        PENDIENTE = 1,
        APROBADA = 2,
        RECHAZADA = 3,
        EXPIRADA = 4
    }

    public class LicenciaFiltrar
    {
        public string EmpleadoTexto { get; set; }
        public int? TipoDeLicenciaId { get; set; }
        public int? Estado { get; set; }
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
    }

}