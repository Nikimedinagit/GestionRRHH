using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.Identity.Client;
using NuGet.Common;

namespace API_RRHH_TESIS2025.Models.General
{
    public class Justificacion
    {
        [Key]

        public int Id { get; set; }
        public string Motivo { get; set; }
        public DateTime Fecha { get; set; }
        public string DocumentoAdjunto { get; set; }
        public TipoJustificacion TipoJustificacion { get; set; }
        public int EmpleadoId { get; set; }
        public virtual Empleado Empleado { get; set; }

    }
    
    public enum TipoJustificacion
    {
        PENDIENTE = 1,
        APROBADA = 2,
        RECHAZADA = 3,
    }

}