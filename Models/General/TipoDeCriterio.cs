namespace API_RRHH_TESIS2025.Models.General
{
    public class TipoDeCriterio
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public bool Eliminado { get; set; }

        public virtual ICollection<CriterioDeEvaluacion> CriterioDeEvaluacion { get; set; }

    }
    public class TipoDeCriterioFiltrar
    {
        public int? Eliminado { get; set; }
    }
}