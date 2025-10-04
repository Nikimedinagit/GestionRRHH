using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API_RRHH_TESIS2025.Models.General
{   
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// TABLA PARA ASISTENCIAS /////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class AsistenciaCapacitacion
    {
        [Key]
        public int Id { get; set; }
        public int Resultado { get; set; }
        public int EmpleadoId { get; set; }
        public int CursoId { get; set; }
        public bool Asistencia { get; set; }

        public virtual Empleado Empleado { get; set; }
        public virtual Curso Curso { get; set; }

    }
}
        