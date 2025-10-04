using System.ComponentModel.DataAnnotations.Schema;

namespace API_RRHH_TESIS2025.Models.General
{   
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// TABLA PARA ACTIVACION DE EMPLEADOS //////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class ActivacionEmpleado
    {
        public int Id { get; set; }
        public DateTime? FechaActivacion { get; set; }
        public bool Activo { get; set; }
        public int EmpleadoId { get; set; }
        public virtual Empleado Empleado { get; set; }

        [NotMapped]
        public string EmpleadoNombreString => Empleado?.NombreCompleto ?? "";

        [NotMapped]
        public string EmpleadoEmailString => Empleado?.Email ?? "";

        [NotMapped]
        public string EmpleadoDNIString => Empleado?.DNI.ToString() ?? "";

        [NotMapped]
        public string FechaActivacionString => FechaActivacion?.ToString("yyyy-MM-dd") ?? "";
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// VISTA DE TABLA PARA ACTIVACION DE EMPLEADOS ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class VistaActivacionEmpleado
    {
        public int Id { get; set; }
        public string EmpleadoNombreString { get; set; }
        public string EmpleadoEmailString { get; set; }
        public string EmpleadoDNIString { get; set; }
        public string FechaActivacionString { get; set; }
        public bool Activo { get; set; }
        public int EmpleadoId { get; set; }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// FILTRAR ACTIVACION DE EMPELADOS EN LAVISTA ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class FiltrarActivacionEmpleado
    {
        public string Nombre { get; set; }
        public string Email { get; set; }
        public long? DNI { get; set; }
        public int? Activo { get; set; }
    }

}


