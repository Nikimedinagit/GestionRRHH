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
    public string? NroLegajo { get; set; }
    public string? Nombre { get; set; }
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








/// ESTOS SON NUEVOS



////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA EL PROMEDIO DE CALIFICACIONES POR EMPLEADO - NIVEL 2
///////////////////////////////////////////////////////////////////////////////////////////////
// ========================== Agrupamos Primero Empleado ============================ //
public class PromedioCalificacionEmpleadoN2
{
    public string Nombre { get; set; }
    public string NroLegajo { get; set; }
    public List<PromedioCalificacionN2> Promedios { get; set; }
}

// ========================== Agrupamos Segundo Promedio ============================ //
public class PromedioCalificacionN2
{
    public int Promedio { get; set; }
    public int CantidadEvaluaciones { get; set; }
    public int MejorCalificacion { get; set; }
    public int PeorCalificacion { get; set; }
    public int Variacion { get; set; }
    public DateTime UltimaEvaluacion { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarPromedioCalificacionEmpleado
{
    public string? NroLegajo { get; set; }
    public string? Nombre { get; set; }
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
}
////////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES PARA EL PROMEDIO DE CALIFICACIONES POR EMPLEADO - NIVEL 2
///////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA EL PROMEDIO DE CALIFICACIONES POR PUESTO - NIVEL 2
/////////////////////////////////////////////////////////////////////////////////////////////// 
// ========================== Agrupamos Primero Puesto ============================ //
public class PromedioCalificacionPuestoN2
{
    public string Puesto { get; set; }
    public List<PromedioCalificacionPN2> Promedios { get; set; }
}

// ========================== Agrupamos Segundo Promedio ============================ //
public class PromedioCalificacionPN2
{
    public int Promedio { get; set; }
    public int CantidadEmpleados { get; set; }
    public int CantidadEvaluaciones { get; set; }
    public int MejorPromedioEmpleado { get; set; }
    public int PeorPromedioEmpleado { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarPromedioCalificacionPuestoN2
{
    public int? Puesto { get; set; }
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
}
////////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES PARA EL PROMEDIO DE CALIFICACIONES POR PUESTO - NIVEL 2
///////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA LA EVOLUCIÓN DEL DESEMPEÑO POR AÑO / TRIMESTRE - NIVEL 3
///////////////////////////////////////////////////////////////////////////////////////////////
public class EvolucionDesempenoPeriodoN3
{
    public int Año { get; set; }
    public int Trimestre { get; set; }
    public int Promedio { get; set; }
    public int CantidadEvaluaciones { get; set; }
    public int MaxCalificacion { get; set; }
    public int MinCalificacion { get; set; }
    public int VariacionRespectoAnterior { get; set; }
    public DateTime FechaOrden { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarEvolucionDesempenoN3
{
    public int? Año { get; set; }
    public int? Trimestre { get; set; }
    public int? Puesto { get; set; }
    public int? Empleado { get; set; }
}
////////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES PARA LA EVOLUCIÓN DEL DESEMPEÑO POR AÑO / TRIMESTRE - NIVEL 3
///////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA LA VARIACIÓN DE DESEMPEÑO POR EMPLEADO - NIVEL 4
///////////////////////////////////////////////////////////////////////////////////////////////
// ========================== Agrupamos Primero Empleado ============================ //
public class VariacionDesempenoEmpleadoN4
{
    public string Nombre { get; set; }
    public string NroLegajo { get; set; }
    public List<VariacionDesempenoN4> Varacion { get; set; }

}

// ========================== Agrupamos Segundo Varariacion ============================ //
public class VariacionDesempenoN4
{
    public string Estado { get; set; }
    public int CalificacionAnterior { get; set; }
    public int CalificacionActual { get; set; }
    public int Diferencia { get; set; }
    public DateTime FechaAnterior { get; set; }
    public DateTime FechaActual { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarVariacionDesempenoEmpleadoN4
{
    public string? NroLegajo { get; set; }
    public string? Nombre { get; set; }
    public int? Puesto { get; set; }
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
    public string? Estado { get; set; } // Filtrar por "Subió", "Bajó", "Se mantuvo"
}
////////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES PARA LA VARIACIÓN DE DESEMPEÑO POR EMPLEADO - NIVEL 4
///////////////////////////////////////////////////////////////////////////////////////////////






////////////////////////////////////////////////////////////////////////////////////////////////
//// INICIO DE CLASES PARA EL INFORME DE APROBACIÓN Y REPROBACIÓN POR EMPLEADO 
///////////////////////////////////////////////////////////////////////////////////////////////

// ========================== Agrupa los resultados de cursos por empleado ============================ //
public class ResultadoCursoPorEmpleado
{
    public string NombreEmpleado { get; set; }
    public int TotalCursos { get; set; }
    public int TotalAprobados { get; set; }
    public int TotalReprobados { get; set; }
    public decimal PorcentajeAprobacion { get; set; }
    public double NotaPromedio { get; set; }
    public string NroLegajo { get; set; }
    public string NombrePuesto { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltroResultadoCursoPorEmpleado
{
    public string? NombreEmpleado { get; set; }
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
    public string? Estado { get; set; }
}

////////////////////////////////////////////////////////////////////////////////////////////////
//// FIN DE CLASES PARA EL INFORME DE APROBACIÓN Y REPROBACIÓN POR EMPLEADO 
///////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////
//// INICIO DE CLASES PARA EL INFORME DE PARTICIPACIÓN Y ASISTENCIA POR CURSO 
///////////////////////////////////////////////////////////////////////////////////////////////

// ========================== Agrupa la participación de empleados por curso ============================ //
public class ParticipacionCursoEstadistico
{
    public string NombreCurso { get; set; }
    public string Modalidad { get; set; }
    public int TotalParticipantes { get; set; }
    public int TotalAsistentes { get; set; }
    public int TotalAusentes { get; set; }
    public decimal PorcentajeAsistencia { get; set; }
    public int TotalCertificadosEmitidos { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltroParticipacionCurso
{
    public string? NombreCurso { get; set; }
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
    public int? Modalidad { get; set; }
}

////////////////////////////////////////////////////////////////////////////////////////////////
//// FIN DE CLASES PARA EL INFORME DE PARTICIPACIÓN Y ASISTENCIA POR CURSO 
///////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////
//// INICIO DE CLASES PARA EL INFORME DE PROMEDIO DE CALIFICACIÓN POR EMPLEADO
///////////////////////////////////////////////////////////////////////////////////////////////

// ========================== Resumen de promedio de calificaciones por empleado ============================ //
public class PromedioCalificacionEmpleadoEstadistico
{
    public string NombreEmpleado { get; set; }
    public int TotalCursosRealizados { get; set; }
    public double NotaPromedio { get; set; }
    public int MejorCalificacion { get; set; }
    public int PeorCalificacion { get; set; }
    public string NombrePuesto { get; set; }
    public string NroLegajo { get; set; }
}

// ========================== Para filtrar en el listado ============================ //
public class FiltroPromedioCalificacionEmpleado
{
    public string? NombreEmpleado { get; set; }
    public int? Modalidad { get; set; }
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
}

////////////////////////////////////////////////////////////////////////////////////////////////
//// FIN DE CLASES PARA EL INFORME DE PROMEDIO DE CALIFICACIÓN POR EMPLEADO
///////////////////////////////////////////////////////////////////////////////////////////////























////////////////////////////////////////////////////////////////////////////////////////////////
//// INICIO DE CLASES PARA EL INFORME DE CANTIDAD DE LICENCIA POR TIPO - NIVEL 1
///////////////////////////////////////////////////////////////////////////////////////////////

public class CantidadLicenciaPorTipoN1
{
    public string TipoLicencia { get; set; }
    public int Cantidad { get; set; }
    public decimal PorcentajeTotal { get; set; }
    public decimal PromedioDias { get; set; }
}

public class FiltrarCantidadLicenciaPorTipo
{
    public int? TipoDeLicencia { get; set; }
}
////////////////////////////////////////////////////////////////////////////////////////////////
//// FIN DE CLASES PARA EL INFORME DE CANTIDAD DE LICENCIA POR TIPO - NIVEL 1
///////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////
//// INICIO DE CLASES PARA EL INFORME DE PROMEDIO POR DIAS DE LICENCIA POR SECTOR Y PUESTO - NIVEL 3
///////////////////////////////////////////////////////////////////////////////////////////////

public class PromedioPorDiasSectorPuestoN3
{
    public string NombreSector { get; set; }
    public List<PromedioPorDiasPuestoN3> Puestos { get; set; }
}


public class PromedioPorDiasPuestoN3
{
    public string NombrePuesto { get; set; }
    public List<PromedioPorDiasN3> Promedios { get; set; }
}

public class PromedioPorDiasN3
{
    public int CantidadLicencia { get; set; }
    public decimal PorcentajeDias { get; set; }
    public decimal MaxDias { get; set; }
    public decimal MinDias { get; set; }

}

public class FiltrarPromediosPorDias
{
    public int? Puesto { get; set; }
    
}

////////////////////////////////////////////////////////////////////////////////////////////////
//// FIN DE CLASES PARA EL INFORME DE PROMEDIO POR DIAS DE LICENCIA POR SECTOR Y PUESTO - NIVEL 3
///////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////
//// INICIO DE CLASES PARA EL INFORME DE DISTRIBUCION DE ESTADSOS - NIVEL 1
///////////////////////////////////////////////////////////////////////////////////////////////


public class DistribuccionEstadosN1
{
    public string NombreEstado { get; set; }
    public int Cantidad { get; set; }
    public decimal PorcentajeTotal { get; set; }
    public DateTime Ultima { get; set; }
}

////////////////////////////////////////////////////////////////////////////////////////////////
//// FIN DE CLASES PARA EL INFORME DE DISTRIBUCION DE ESTADSOS - NIVEL 1
///////////////////////////////////////////////////////////////////////////////////////////////