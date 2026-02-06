using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GestionRRHH.Models.General
{   
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// TABLA PARA CERTIFICADOS /////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class Certificado
    {
        [Key]
        public int Id { get; set; }
        [NotMapped]
        public string CursoString { get { return Curso?.Nombre; } }
        public int CursoId { get; set; }
        public byte[] DocumentoAdjunto { get; set; }
        public string DocumentoNombre { get; set; }
        public string DocumentoMimeType { get; set; }
        [NotMapped]
        public string EmpleadoString { get { return Empleado?.NombreCompleto; } }
        public int EmpleadoId { get; set; }
        public Empleado Empleado { get; set; }
        public virtual Curso Curso { get; set; }
    }
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// VISTA DE TABLA PARA CERTIFICADOS /////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class VistaCertificado
    {
        public int Id { get; set; }
        public string CursoNombre { get; set; }
        public int CursoId { get; set; }
        public int EmpleadoId { get; set; }
        public string DocumentoNombre { get; set; }
        public string DocumentoMimeType { get; set; }
        public string EmpleadoString { get; set; }
    }

}
        