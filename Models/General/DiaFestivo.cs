using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace GestionRRHH.Models.General
{
    public class Feriado
    {
        [Key]
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public string Descripcion { get; set; } 
        public TiposFeriado Tipos { get; set; }
        [NotMapped]
        public string TiposString { get { return Tipos.ToString(); } }
    }

    public enum TiposFeriado
    {
        Inamovible = 0,
        NoLaborable = 1,
        Trasladable = 2

    }
}
