using GestionRRHH.Models.General;

////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES APRA EL LISTADO DE ASISTENCIA POR EMPLEADO - NIVEL 2
///////////////////////////////////////////////////////////////////////////////////////////////
// ========================== Armamos Primer Grupo Empleado ============================ //
public class EmpleadoAsistenciaListadoN2
{
    public string NroLegajo { get; set; }
    public string Nombre { get; set; }
    public string Puesto { get; set; }

    public List<AsistenciaListadoN2> Asistencias { get; set; }
}

// ========================== Armamos Segundo Grupo Asistencias ============================ //
public class AsistenciaListadoN2
{
    public string Fecha { get; set; }
    public string Estado { get; set; }
    public TimeSpan? PrimerEntrada { get; set; }
    public TimeSpan? PrimeraSalida { get; set; }
    public TimeSpan? SegundaEntrada { get; set; }
    public TimeSpan? SegundaSalida { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarListadoAsistenciaEmpleado
{
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
    public string? NroLegajo { get; set; }
    public string? Nombre { get; set; }



}
//////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES APRA EL LISTADO DE ASISTENCIA POR EMPLEADO - NIVEL 2
///////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES APRA EL LISTADO DE SECTOR POR EMPELADO Y POR JUSTIFICACION - NIVEL 3
///////////////////////////////////////////////////////////////////////////////////////////////
// ========================== Armamos Primer Grupo Sector ============================ //
public class SectorEmpleadoJustificacionListadoN3
{
    public string Nombre { get; set; }
    public List<EmpleadoJustificacionListadoN3> Empleado { get; set; }
}

// ========================== Armamos Segundo Grupo Empleado ============================ //
public class EmpleadoJustificacionListadoN3
{
    public string Nombre { get; set; }
    public string NroLegajo { get; set; }
    public List<JustificacionListadoN3> Justificaciones { get; set; }

}

// ========================== Armamos Tercer Grupo Justificacion ============================ //
public class JustificacionListadoN3
{
    public DateTime? Fecha { get; set; }
    public string Motivo { get; set; }
    public string Estado { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarListadoSectorEmpeladoJustificacion
{
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
    public int? Estado { get; set; }

}

////////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES APRA EL LISTADO DE SECTOR POR EMPELADO Y POR JUSTIFICACION - NIVEL 3
///////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA EL LISTADO DE EMPLEADO POR SECTOR - NIVEL 2
///////////////////////////////////////////////////////////////////////////////////////////////
// ========================== Armamos primer Grupo Sector ============================ //
public class SectorEmpeladoListadoN2
{
    public string Nombre { get; set; }
    public List<EmpleadoListadoN2> Empleados { get; set; }
}

// ========================== Armamos Segundo Grupo Empleado ============================ //
public class EmpleadoListadoN2
{
    public string Nombre { get; set; }
    public string NroLegajo { get; set; }
    public string Puesto { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarListadoSectorEmpelado
{
    public string? Nombre { get; set; }
    public int? Sector { get; set; }
    public string NroLegajo { get; set; }
}

////////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES PARA EL LISTADO DE EMPLEADO POR SECTOR - NIVEL 2
///////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA EL LISTADO DE HISTORIAL LABORAL POR EMPELADO - NIVEL2
///////////////////////////////////////////////////////////////////////////////////////////////
// ========================== Armamos primer Grupo Empelado ============================ //
public class EmpleadoHistorialLaboralListadoN2
{
    public string Nombre { get; set; }
    public string NroLegajo { get; set; }
    public List<HistorialLaboralListadoN2> Historial { get; set; }
}

// ========================== Armamos Segundo Grupo Historial ============================ //
public class HistorialLaboralListadoN2
{
    public string Periodo { get; set; }
    public string PuestoAnterior { get; set; }
    public string PuestoActual { get; set; }
    public string SectorAnterior { get; set; }
    public string SectorActual { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarEmpleadoHistorialLaboral
{
    public string? Nombre { get; set; }
    public string? NroLegajo { get; set; }
}
////////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES PARA EL LISTADO DE HISTORIAL LABORAL POR EMPELADO - NIVEL2
///////////////////////////////////////////////////////////////////////////////////////////////





////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA EL LISTADO DE EVALAUCIONES POR EMPELADO - NIVEL2
/////////////////////////////////////////////////////////////////////////////////////////////// 
// ========================== Armamos primer Grupo Empelado ============================ //
public class EmpleadoEvaluacionesListadoN2
{
    public string NroLegajo { get; set; }
    public string Nombre { get; set; }
    public List<EvaluacionListadoN2> Evaluaciones { get; set; }
}

// ========================== Armamos Segundo Grupo Evaluaciones ============================ //
public class EvaluacionListadoN2
{
    public DateTime Fecha { get; set; }
    public string Periodo { get; set; }
    public int Calificacion { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarEmpleadoEvaluaciones
{
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
    public string? NroLegajo { get; set; }
    public string? Nombre { get; set; }
}

////////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES PARA EL LISTADO DE EVALAUCIONES POR EMPELADO - NIVEL2
/////////////////////////////////////////////////////////////////////////////////////////////// 



//////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA LISTADO DE EVALUACIONES POR EMEPALDOS Y SUS CRITERIOS - NIVEL 3
//////////////////////////////////////////////////////////////////////////////////////////////////
// ========================== Armamos Primer Grupo Empleado ============================ //
public class EmpleadoEvaluacionesListadoN3
{
    public string NroLegajo { get; set; }
    public string Nombre { get; set; }
    public List<EvaluacionCriteriosListadoN3> Evaluaciones { get; set; }
}

// ========================== Armamos Segundo Grupo Evaluacion ============================ //
public class EvaluacionCriteriosListadoN3
{
    public DateTime Fecha { get; set; }
    public string Periodo { get; set; }
    public int Calificacion { get; set; }

    public List<CriterioListadoN3> Criterios { get; set; }
}

// ========================== Armamos Tercer Grupo Criterio ============================ //
public class CriterioListadoN3
{
    public string Nombre { get; set; }
    public string Descripcion { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarEmpleadoEvaluacionesCriterios
{
    public string? Nombre { get; set; }
    public string? NroLegajo { get; set; }
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
}
//////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES PARA LISTADO DE EVALUACIONES POR EMEPALDOS Y SUS CRITERIOS - NIVEL 3
//////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA LISTADO DE PUESTO POR EVUALCIONES Y CRITERIOS - NIVEL 3
///////////////////////////////////////////////////////////////////////////////////////////////////////

// ========================== Armamos Primer Grupo Puesto ============================ //
public class PuestoEmpleadosEvaluacionesListadoN3
{
    public string Nombre { get; set; }
    public List<EmpleadoEvaluacionListadoN3> Empleados { get; set; }
}

// ========================== Armamos Segundo Grupo Empleado ============================ //
public class EmpleadoEvaluacionListadoN3
{
    public string Nombre { get; set; }
    public string NroLegajo { get; set; }
    public List<EvaluacionListadoN3B> Evaluaciones { get; set; }
}

// ========================== Armamos Tercer Grupo Evaluacion ============================ //
public class EvaluacionListadoN3B
{
    public DateTime Fecha { get; set; }
    public string Periodo { get; set; }
    public int Calificacion { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarPuestoEmpleadosEvaluaciones
{
    public int? Puesto { get; set; }
    public string? NroLegajo { get; set; }
    public string? Nombre { get; set; }
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES PARA LISTADO DE PUESTO POR EVUALCIONES Y CRITERIOS - NIVEL 3
///////////////////////////////////////////////////////////////////////////////////////////////////////






////NUEVOS

//////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA LISTADO DE LICENCIA POR EMPELADO Y ESTADO - NIVEL 3
//////////////////////////////////////////////////////////////////////////////////////////////////
// ========================== Armamos Primer Grupo Empleado ============================ //
public class LicenciaEmpleadoEstadoListadoN3
{
    public string Nombre { get; set; }
    public string NroLegajo { get; set; }
    public List<LicenciaEstadoListadoN3> Estado { get; set; }
}

// ========================== Armamos Segundo Grupo Estado ============================ //
public class LicenciaEstadoListadoN3
{
    public string Nombre { get; set; }
    public List<LicenciaListadoN3> Licencia { get; set; }

}

// ========================== Armamos Tercer Grupo Licencia ============================ //
public class LicenciaListadoN3
{
    public string TipoDeLicencia { get; set; }
    public string Periodo { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarLicenciaEmpleadoEstado
{
    public string? NroLegajo { get; set; }
    public string? Nombre { get; set; }
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
}

//////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES PARA LISTADO DE LICENCIA POR EMPELADO Y ESTADO - NIVEL 3
//////////////////////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA LISTADO DE LICENCIA POR TIPO - NIVEL 3
//////////////////////////////////////////////////////////////////////////////////////////////////

// ========================== Primer Grupo Tipo de Licencia ============================ //
public class LicenciaTipoListadoN3
{
    public string TipoDeLicencia { get; set; }
    public List<LicenciaTipoEmpleadoListadoN3> Empleados { get; set; }
}

// ========================== Segundo Grupo Empleado ============================ //
public class LicenciaTipoEmpleadoListadoN3
{
    public string Nombre { get; set; }
    public string NroLegajo { get; set; }
    public List<LicenciaTipoDetalleListadoN3> Licencias { get; set; }
}

// ========================== Tercer Grupo Detalle de Licencia ============================ //
public class LicenciaTipoDetalleListadoN3
{
    public string Periodo { get; set; }
    public string Estado { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarLicenciaPorTipo
{
    public int? TipoDeLicenciaId { get; set; }
    public string? Nombre { get; set; }
    public string? NroLegajo { get; set; }
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
    public int? Estado { get; set; }
}

//////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES PARA LISTADO DE LICENCIA POR TIPO - NIVEL 3
//////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA LISTADO DE LICENCIA POR SECTOR - NIVEL 4
//////////////////////////////////////////////////////////////////////////////////////////////////

// ========================== Primer Grupo Sector ============================ //
public class LicenciaSectorListadoN3
{
    public string Sector { get; set; }
    public List<LicenciaPuestoListadoN3> Puestos { get; set; }
}

// ========================== Segundo Grupo Puesto ============================ //
public class LicenciaPuestoListadoN3
{
    public string Puesto { get; set; }
    public List<LicenciaEmpleadoListadoN3> Empleados { get; set; }
}

// ========================== Tercer Grupo Empleado ============================ //
public class LicenciaEmpleadoListadoN3
{
    public string Nombre { get; set; }
    public string NroLegajo { get; set; }
    public List<LicenciaDetalleListadoN3> Licencias { get; set; }
}

// ========================== Cuarto Grupo Detalle de Licencia ============================ //
public class LicenciaDetalleListadoN3
{
    public string TipoDeLicencia { get; set; }
    public string Periodo { get; set; }
    public string Estado { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarLicenciaPorSector
{
    public int? Sector { get; set; }
    public int? Puesto { get; set; }
    public string? Nombre { get; set; }
    public string? NroLegajo { get; set; }
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
    public int? Estado { get; set; }
}

//////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES PARA LISTADO DE LICENCIA POR SECTOR - NIVEL 4
//////////////////////////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA LISTADO DE CURSOS POR EMPLEADO - NIVEL 3
//////////////////////////////////////////////////////////////////////////////////////////////////

// ========================== Primer Grupo Curso ============================ //
public class CursoInformeN3
{
    public int CursoId { get; set; }
    public string NombreCurso { get; set; }
    public List<CursoEmpleadoN3> Empleados { get; set; }
}

public class CursoEmpleadoN3
{
    public int EmpleadoId { get; set; }
    public string NombreEmpleado { get; set; }
    public bool Asistio { get; set; }
    public string CalificacionTexto { get; set; } 
    public bool TieneCertificado { get; set; }
    public string NombrePuesto { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltrarCursoEmpleado
{
    public string? NombreCurso { get; set; }
    public string? Nombre { get; set; }
    public string? Resultado { get; set; }
}
//////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES PARA LISTADO DE CURSOS POR EMPLEADO - NIVEL 3
//////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA LISTADO DE CURSOS POR MODALIDAD - NIVEL 2
//////////////////////////////////////////////////////////////////////////////////////////////////
public class CursoPorModalidad
{
    public int CursoId { get; set; }
    public string NombreCurso { get; set; }
    public Modalidades Modalidad { get; set; } 
}

public class ModalidadCursos
{
    public string Modalidad { get; set; } 
    public List<CursoPorModalidad> Cursos { get; set; }
}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltroCursoModalidad
{
    public int? Modalidad { get; set; }
    public string? NombreCurso { get; set; }
}
//////////////////////////////////////////////////////////////////////////////////////////////
/// FIN DE CLASES PARA LISTADO DE CURSOS POR MODALIDAD - NIVEL 2
//////////////////////////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA LISTADO DE CURSOS POR ESTADO (APROBADO - DESAPROBADO) - NIVEL 2
//////////////////////////////////////////////////////////////////////////////////////////////////
public class EmpleadoCursos
{
    public int EmpleadoId { get; set; }
    public string NombreEmpleado { get; set; }
    public string NombrePuesto { get; set; }
    public List<ResultadoCursos> Resultados { get; set; } 
}

public class ResultadoCursos
{
    public string Estado { get; set; } 
    public List<CursoDetalle> Cursos { get; set; }       
}

public class CursoDetalle
{
    public int CursoId { get; set; }
    public string NombreCurso { get; set; }
    public string Modalidad { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public int Nota { get; set; }

}

// ========================== Para Filtrar en el Listado ============================ //
public class FiltroCursoEmpleado
{
    public string? NombreCurso { get; set; }        
    public string? Estado { get; set; }      
    public string? NombreEmpleado { get; set; } 
    public DateTime? FechaDesde { get; set; } 
    public DateTime? FechaHasta { get; set; }
}
//////////////////////////////////////////////////////////////////////////////////////////////
/// INICIO DE CLASES PARA LISTADO DE CURSOS POR ESTADO (APROBADO - DESAPROBADO) - NIVEL 2
//////////////////////////////////////////////////////////////////////////////////////////////////