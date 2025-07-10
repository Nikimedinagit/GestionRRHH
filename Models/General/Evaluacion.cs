using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace API_RRHH_TESIS2025.Models.General
{
    public class Evaluacion
    {
        [Key]
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public int Calificacion { get; set; }
        public string EmpleadoId { get; set; }

    }
}