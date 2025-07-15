using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API_RRHH_TESIS2025.Models.General
{
    public class Curso
    {
        [Key]

        public int Id { get; set; }
        public string Nombre { get; set; }
        public Modalidades Modalidad { get; set; }
        public string Descripcion { get; set; }
    }

    public enum Modalidades
    {
        PRESENCIAL = 1,
        VIRTUAL = 2,
        MIXTO = 3
    }
}