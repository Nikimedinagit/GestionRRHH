using System.ComponentModel.DataAnnotations;

namespace API_RRHH_TESIS2025.Models.General
{
    public class Provincia
    {
        [Key]
        public int Id { get; set; }
        public string Nombre { get; set; }

        public bool Eliminado { get; set; }
        public virtual ICollection<Localidad> Localidades { get; set; }
    }

    public class FiltrarProvincias
    {
        public int? Eliminado { get; set; }
    }
}