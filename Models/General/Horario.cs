using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_RRHH_TESIS2025.Models.General
{
    public class Horario
    {
        [Key]
        public int Id { get; set; }

        [NotMapped]
        public string HorarioInicioString { get { return DateTime.Today.Add(HorarioInicio).ToString("hh:mm tt"); } }
        public TimeSpan HorarioInicio { get; set; }

        [NotMapped]
        public string HorarioFinString { get { return DateTime.Today.Add(HorarioFin).ToString("hh:mm tt"); } }
        public TimeSpan HorarioFin { get; set; }

        [NotMapped]
        public string SegundoHorarioInicioString { get { return DateTime.Today.Add(SegundoHorarioInicio).ToString("hh:mm tt"); } }
        public TimeSpan SegundoHorarioInicio { get; set; }

        [NotMapped]
        public string SegundoHorarioFinString { get { return DateTime.Today.Add(SegundoHorarioFin).ToString("hh:mm tt"); } }
        public TimeSpan SegundoHorarioFin { get; set; }

        [NotMapped]
        public string TipoHorarioString { get { return TipoHorario.ToString(); } }
        public TipoHorario TipoHorario { get; set; }

        public bool Lunes { get; set; }
        public bool Martes { get; set; }
        public bool Miercoles { get; set; }
        public bool Jueves { get; set; }
        public bool Viernes { get; set; }
        public bool Sabado { get; set; }
        public bool Domingo { get; set; }


        [NotMapped]
        public string EmpleadoString { get { return Empleado?.NombreCompleto; } }
        public int EmpleadoId { get; set; }

        public virtual Empleado Empleado { get; set; }
        public virtual ICollection<Asistencia> Asistencias { get; set; }
    }

    public enum TipoHorario
    {
        RECORRIDO = 1,
        SEPARADO
    }

    public class VistaHorario
    {
        public int Id { get; set; }
        public string HorarioInicioString { get; set; }
        public string HorarioFinString { get; set; }
        public string SegundoHorarioInicioString { get; set; }
        public string SegundoHorarioFinString { get; set; }
        public string TipoHorarioString { get; set; }
        public TipoHorario TipoHorario { get; set; }
        public bool Lunes { get; set; }
        public bool Martes { get; set; }
        public bool Miercoles { get; set; }
        public bool Jueves { get; set; }
        public bool Viernes { get; set; }
        public bool Sabado { get; set; }
        public bool Domingo { get; set; }
        public string EmpleadoString { get; set; }
        public int EmpleadoId { get; set; }
        public string PuestoEmpleado { get; set; }
    }

    public class FiltrarHorario
    {
        public string HorarioInicio { get; set; }
        public string HorarioFin { get; set; }
        public int? TipoHorario { get; set; }
        public string EmpleadoTexto { get; set; }
    }
}