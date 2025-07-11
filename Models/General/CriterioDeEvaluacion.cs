namespace API_RRHH_TESIS2025.Models.General;

public class CriterioDeEvaluacion
{
    public int Id { get; set; }
    public int TipoDeCriterioId { get; set; }
    public string Descripcion { get; set; }
    public int EvaluacionId { get; set; }
    public virtual TipoDeCriterio TipoDeCriterio { get; set; }
    public virtual Evaluacion Evaluacion { get; set; }
}