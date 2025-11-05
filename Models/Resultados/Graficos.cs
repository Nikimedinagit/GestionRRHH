namespace API_RRHH_TESIS2025.Models.Graficos;

public class EvolucionEmpleadoGrafico
{
    public string Mes { get; set; }
    public int Cantidad { get; set; }
}

public class AsistenciaMensualGrafico
{
    public string Mes { get; set; }
    public int AsistenciasCompletas { get; set; }
    public int Ausencias { get; set; }
}

public class JustificacionComparativaPorDiaGrafico
{
    public string Dia { get; set; }         
    public string DiaSemana { get; set; }   
    public int TotalJustificaciones { get; set; }
    public int TotalAprobadas { get; set; }
    public int TotalRechazadas { get; set; }
}


