using System.ComponentModel.DataAnnotations;

namespace API_RRHH_TESIS2025.Models.General
{
    public class Sector
    {
        [Key]
        public int Id { get; set; }
        public string Nombre { get; set; }


        public bool Eliminado { get; set; }

        public virtual ICollection<Puesto> Puestos { get; set; }
    }
    
    public class FiltrarSectores
    {
        public int? Eliminado { get; set; }
    }
}