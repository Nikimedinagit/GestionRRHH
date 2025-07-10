using System.ComponentModel.DataAnnotations;

namespace API_RRHH_TESIS2025.Models.General
{
    public class Puesto
    {
        [Key]
        public int Id { get; set; }
        public string Descripcion { get; set; }


        public int SectorId { get; set; }
        public virtual Sector Sector { get; set; }


        public bool Eliminado { get; set; }

        public virtual ICollection<Empleado> Empleados { get; set; }


    }

    public class PuestoFiltrar
    {
        public int? Eliminado { get; set; }
        public int? SectorId { get; set; }
    }
}