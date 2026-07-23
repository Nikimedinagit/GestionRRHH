using System.ComponentModel.DataAnnotations;

namespace GestionRRHH.Models.General
{
    public class Empresa
    {
        public int Id { get; set; }

        [Required, MaxLength(150)]
        public string Nombre { get; set; }

        public bool Habilitada { get; set; } = false;
        public DateTime FechaRegistro { get; set; } = DateTime.Now;
    }
}
