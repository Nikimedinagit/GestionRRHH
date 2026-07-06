namespace GestionRRHH.Models.General
{
    public class PeriodoSolicitudVacaciones
    {
        public int Id { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public DateTime FechaCreacion { get; set; }
        public string UsuarioCreadorId { get; set; }
        public bool Activo { get; set; } = true;
    }

    public class PeriodoSolicitudVacacionesDto
    {
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
    }

    public class VistaPeriodoSolicitudVacaciones
    {
        public int Id { get; set; }
        public string FechaInicioString { get; set; }
        public string FechaFinString { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public bool Habilitado { get; set; }
    }
}
