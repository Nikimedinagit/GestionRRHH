using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using NuGet.Common;

namespace API_RRHH_TESIS2025.Models.General
{

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// TABLA PARA EVALUACIONES ///////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class Evaluacion
    {
        [Key]
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public int Calificacion { get; set; }
        public int EmpleadoId { get; set; }
        public Empleado Empleado { get; set; }
        public string UsuarioId { get; set; }
        public virtual ICollection<CriterioDeEvaluacion> CriterioDeEvaluacion { get; set; }

    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// VISTA DE TABLA PARA EVALUACIONES ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class EvaluacionVista
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public int Calificacion { get; set; }
        public string EmpleadoId { get; set; }
        public string EmpleadoNombre { get; set; }
        public string EmpleadoPuesto { get; set; }
        public string UsuarioId { get; set; }
        public string UsuarioNombreEvaluador { get; set; }
        public string UsuarioRolEvaluador { get; set; }
        public bool EsEditable { get; set; }
        public string ClaseBorde { get; set; }
        public bool EsPropia { get; set; }
    }

    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// FILTRO PARA EVALUACIONES ///////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class EvaluacionFiltro
    {
        public string NombreEmpleado { get; set; }
        public DateTime? Fecha { get; set; }
        public int? Calificacion { get; set; }

    }

} 
