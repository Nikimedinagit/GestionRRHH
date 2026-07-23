using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionRRHH.Models.General
{
    public class AsignacionResponsabilidadTarea
    {
        [Key]
        public int Id { get; set; }
        public string Responsabilidades { get; set; }
        public string Tareas { get; set; }
        public bool Eliminado { get; set; }

        [NotMapped]
        public string EmpleadoString { get { return Empleado?.NombreCompleto; } }

        public int EmpleadoId { get; set; }
        public virtual Empleado Empleado { get; set; }
    }

    public class VistaAsignacionResponsabilidadTarea
    {
        public int Id { get; set; }
        public string Responsabilidades { get; set; }
        public string Tareas { get; set; }
        public int EmpleadoId { get; set; }
        public string EmpleadoString { get; set; }
        public string PuestoString { get; set; }
        public bool Eliminado { get; set; }
    }

    public class AsignacionResponsabilidadTareaFiltrar
    {
        public string Busqueda { get; set; }
        public int? EmpleadoId { get; set; }
        public int? Eliminado { get; set; }
    }
}
