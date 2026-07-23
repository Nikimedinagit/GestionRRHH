using System.ComponentModel.DataAnnotations;

namespace GestionRRHH.Models.General
{
    public class Curriculum
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(150)]
        public string NombreCompleto { get; set; }

        [MaxLength(150)]
        public string Email { get; set; }

        [MaxLength(50)]
        public string Telefono { get; set; }

        public DateTime FechaRecepcion { get; set; } = DateTime.Today;

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
