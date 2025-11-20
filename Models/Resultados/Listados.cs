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