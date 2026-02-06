using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using NuGet.Common;

namespace GestionRRHH.Models.General
{
    public class Curso
    {
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// TABLA DE CURSOS //////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Key]
        public int Id { get; set; }
        public string Nombre { get; set; }
        public Modalidades Modalidad { get; set; }
        public string Descripcion { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFinalizacion { get; set; }
        public bool Finalizado { get; set; }
        public virtual ICollection<AsistenciaCapacitacion> AsistenciaCapacitacion { get; set; }
        public virtual ICollection<Certificado> Certificado { get; set; }
    }

    public enum Modalidades
    {
        PRESENCIAL = 1,
        VIRTUAL = 2,
        MIXTO = 3
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// VISTA DE TABLA DE CURSOS //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class CursoVista
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFinalizacion { get; set; }
        public Modalidades Modalidad { get; set; }
        public bool Finalizado { get; set; }
        public int? Resultado { get; set; }
        public string CertificadoUrl { get; set; }
        public int? CertificadoId { get; set; }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// FILTRO DE CURSOS /////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class FiltroCurso
    {
        public string NombreCurso { get; set; }
        public int? Modalidad { get; set; }
        public DateTime? Fecha { get; set; }
    }
}