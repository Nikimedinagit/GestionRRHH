using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace API_RRHH_TESIS2025.Models.General
{
    public class Localidad
    {
        [Key]
        public int Id { get; set; }
        public string Nombre { get; set; }


        public bool Eliminado { get; set; }


        public int ProvinciaId { get; set; }

        public virtual Provincia Provincia { get; set; }


        public virtual ICollection<Empleado> Empleados { get; set; }

    }
    
    public class FiltrarLocalidades
    {
        public int? Eliminado { get; set; }
        public int? ProvinciaId { get; set; }
    }
}