using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionRRHH.Models.General
{
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// TABLA PARA ASISTENCIA /////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class Asistencia
    {
        [Key]
        public int Id { get; set; }

        public int EmpleadoId { get; set; }
        public virtual Empleado Empleado { get; set; }

        public int? HorarioId { get; set; }
        public virtual Horario Horario { get; set; }

        public DateTime Fecha { get; set; }

        public TimeSpan? PrimerEntrada { get; set; }
        public TimeSpan? PrimerSalida { get; set; }
        public TimeSpan? SegundaEntrada { get; set; }
        public TimeSpan? SegundaSalida { get; set; }

        public EstadoAsistencia Estado { get; set; }

        public string FotoRuta { get; set; }

        [NotMapped] public string EmpleadoString => Empleado?.NombreCompleto;
        [NotMapped] public string FechaString => Fecha.ToString("dd/MM/yyyy");
        [NotMapped] public string EstadoString => Estado.ToString();
        [NotMapped] public string PrimerEntradaString => PrimerEntrada.HasValue ? PrimerEntrada.Value.ToString(@"hh\:mm") : null;
        [NotMapped] public string PrimerSalidaString => PrimerSalida.HasValue ? PrimerSalida.Value.ToString(@"hh\:mm") : null;
        [NotMapped] public string SegundaEntradaString => SegundaEntrada.HasValue ? SegundaEntrada.Value.ToString(@"hh\:mm") : null;
        [NotMapped] public string SegundaSalidaString => SegundaSalida.HasValue ? SegundaSalida.Value.ToString(@"hh\:mm") : null;
    }

    public enum EstadoAsistencia
    {
        COMPLETA = 1,
        INCOMPLETA,
        AUSENTE,
        TARDE,
        FUERADEHORARIO
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// VISTA DE TABLA PARA ASISTENCIA //////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class VistaAsistencia
    {
        public int Id { get; set; }
        public string EmpleadoString { get; set; }
        public string NroLegajo { get; set; }
        public string TipoHorario { get; set; }
        public string FechaString { get; set; }
        public string DiaSemana { get; set; }
        public string EstadoString { get; set; }
        public string PrimerEntradaString { get; set; }
        public string PrimerSalidaString { get; set; }
        public string SegundaEntradaString { get; set; }
        public string SegundaSalidaString { get; set; }
        public string FotoUrl { get; set; }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// FILTRO DE TABLA PARA ASISTENCIA //////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class FiltrarAsistencia
    {
        public string NombreCompleto { get; set; }
        public long? DNI { get; set; }
        public string NroLegajo { get; set; }
        public DateTime? Fecha { get; set; }
        public int? EstadoAsistencia { get; set; }
    }

    public class FiltrarAsistenciaCalendario
    {
        public string NombreCompleto { get; set; }
        public long? DNI { get; set; }
        public string NroLegajo { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public int? EstadoAsistencia { get; set; }
    }




}
