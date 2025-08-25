using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using NuGet.Common;

namespace API_RRHH_TESIS2025.Models.General
{
    public class Curso
    {
        [Key]

        public int Id { get; set; }
        public string Nombre { get; set; }
        public Modalidades Modalidad { get; set; }
        public string Descripcion { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaInicio { get; set; }
        public virtual ICollection<AsistenciaCapacitacion> AsistenciaCapacitacion { get; set; }
        public virtual ICollection<Certificado> Certificado { get; set; }
    }

    public enum Modalidades
    {
        PRESENCIAL = 1,
        VIRTUAL = 2,
        MIXTO = 3
    }

    public class CursoVista
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public DateTime FechaInicio { get; set; }
        public  Modalidades Modalidad { get; set; }
    }

    public class FiltroCurso
    {
        public string NombreCurso { get; set; }
        public int? Modalidad { get; set; }
        public DateTime? Fecha { get; set; }
    }
}