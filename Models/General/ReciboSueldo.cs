using System.ComponentModel.DataAnnotations;

namespace GestionRRHH.Models.General
{
    public class ReciboSueldo
    {
        [Key]
        public int Id { get; set; }

        public int EmpleadoId { get; set; }
        public Empleado Empleado { get; set; }

        public DateTime Periodo { get; set; }
        public DateTime FechaCarga { get; set; } = DateTime.Now;

        [MaxLength(500)]
        public string Observaciones { get; set; }

        [Required]
        public byte[] Documento { get; set; }

        [Required, MaxLength(255)]
        public string DocumentoNombre { get; set; }

        [Required, MaxLength(150)]
        public string DocumentoMimeType { get; set; }
    }
}
