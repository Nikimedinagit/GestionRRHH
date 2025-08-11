using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_RRHH_TESIS2025.Models.General
{
    public class Asistencia
    {
        [Key]
        public int Id { get; set; }

      
        public int EmpleadoId { get; set; }
        public virtual Empleado Empleado { get; set; }

       
        public int? HorarioId { get; set; }
        public virtual Horario Horario { get; set; }

        public DateTime Fecha { get; set; }

        // Fichadas
        public TimeSpan? PrimerEntrada { get; set; }
        public TimeSpan? PrimerSalida { get; set; }
        public TimeSpan? SegundaEntrada { get; set; }
        public TimeSpan? SegundaSalida { get; set; }

        public EstadoAsistencia Estado { get; set; }

       
        [NotMapped] public string EmpleadoString => Empleado?.NombreCompleto;
        [NotMapped] public string FechaString => Fecha.ToString("dd/MM/yyyy");
        [NotMapped] public string EstadoString => Estado.ToString();
    }

    public enum EstadoAsistencia
    {
        Completa = 1,
        Incompleta,
        Ausente,
        Tarde,
        FueraDeHorario
    }

}
