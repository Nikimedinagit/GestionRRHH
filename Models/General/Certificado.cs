using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API_RRHH_TESIS2025.Models.General
{
    public class Certificado
    {
        [Key]
        public int Id { get; set; }       
        public int CursoId { get; set; }
        public int EmpleadoId { get; set; }
        public string DocumentoDescargable { get; set; }
        public DateTime FechaEmision { get; set; }
        public virtual Empleado Empleado { get; set; }
        public virtual Curso Curso { get; set; }

    }
}
        