////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES APRA EL ESTADISTICO GLOBAL DENTRO D ELOS ULTIMOS 12 MESES - NIVEL 1
///////////////////////////////////////////////////////////////////////////////////////////////
// ========================== Armamos Primer Grupo Global  ============================ //
public class GlobalEstadisticoN1
{
    public string Mes { get; set; }         
    public int Activos { get; set; }
    public int Presentes { get; set; }
    public int Ausentes { get; set; }
    public int Tarde { get; set; }
    public int Incompletas { get; set; }
    public int FueraDeHorario { get; set; }
    public int Justificaciones { get; set; } 
    public decimal PorcentajePresentismo { get; set; }
    public decimal PorcentajeAusentismo { get; set; }
    public DateTime FechaOrden { get; set; }
}
////////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES APRA EL ESTADISTICO GLOBAL DENTRO D ELOS ULTIMOS 12 MESES - NIVEL 1
///////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES APRA EL ESTADISTICO ASISTENCOIA DE EMPLEADOS POR SECTOR - NIVEL 2
///////////////////////////////////////////////////////////////////////////////////////////////
// ========================== Armamos Primer Grupo Sectror  ============================ //
public class EmpleadoAsistenciaSectorN2
{
    public string Nombre { get; set; }
    public List<EmpleadoAsistenciaN2> EmpeladoAsistencia { get; set; }
}

// ========================== Armamos Segundo Grupo EnmpleadoAsistencia  ============================ //
public class EmpleadoAsistenciaN2
{
    public string Nombre { get; set; }
    public string NroLegajo { get; set; }
    public int Presente { get; set; }
    public int Ausentes { get; set; }
    public int Tarde { get; set; }
    public int Incompletas { get; set; }
    public int FueraDeHorario { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarEstadisticaAsistenciaEmpeladoSector
{
    public int? Sector { get; set; }
}
////////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES APRA EL ESTADISTICO ASISTENCOIA DE EMPLEADOS POR SECTOR - NIVEL 2
///////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES APRA EL ESTADISTICO JUSTIFICACIONES POR 12 MESES - NIVEL 1
///////////////////////////////////////////////////////////////////////////////////////////////
// ========================== Armamos Primer Grupo Justificacion  ============================ //
public class EstadisticaJustificacionMes
{
    public string Mes { get; set; }          
    public int Pendientes { get; set; }
    public int Aprobadas { get; set; }
    public int Rechazadas { get; set; }
    public int Total { get; set; }
    public DateTime FechaOrden { get; set; }

}
////////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES APRA EL ESTADISTICO JUSTIFICACIONES POR 12 MESES - NIVEL 1
///////////////////////////////////////////////////////////////////////////////////////////////