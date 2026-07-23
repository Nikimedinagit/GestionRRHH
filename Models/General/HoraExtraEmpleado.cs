using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionRRHH.Models.General
{
    public class HoraExtraEmpleado
    {
        [Key]
        public int Id { get; set; }
        public int EmpleadoId { get; set; }
        public Empleado Empleado { get; set; }
        public int? AsistenciaId { get; set; }
        public Asistencia Asistencia { get; set; }
        public DateTime Fecha { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
        public int Minutos { get; set; }
        public OrigenHoraExtra Origen { get; set; }
        public EstadoHoraExtra Estado { get; set; } = EstadoHoraExtra.PENDIENTE;
        [Required, MaxLength(300)]
        public string Motivo { get; set; }
        [MaxLength(500)]
        public string Observaciones { get; set; }
        public DateTime FechaRegistro { get; set; } = DateTime.Now;
        [NotMapped] public string EmpleadoString => Empleado?.NombreCompleto;
    }

    public enum OrigenHoraExtra
    {
        AUTOMATICO = 1,
        MANUAL
    }

    public enum EstadoHoraExtra
    {
        PENDIENTE = 1,
        APROBADA,
        RECHAZADA,
        ANULADA
    }

    public class HoraExtraFiltrar
    {
        public string Empleado { get; set; }
        public DateTime? Desde { get; set; }
        public DateTime? Hasta { get; set; }
        public int? Estado { get; set; }
        public int? Origen { get; set; }
    }

    public class HoraExtraManualDto
    {
        public int Id { get; set; }
        public int EmpleadoId { get; set; }
        public DateTime Fecha { get; set; }
        public string HoraInicio { get; set; }
        public string HoraFin { get; set; }
        public string Motivo { get; set; }
        public string Observaciones { get; set; }
    }

    public class CalcularHorasExtrasDto
    {
        public DateTime Desde { get; set; }
        public DateTime Hasta { get; set; }
    }
}
