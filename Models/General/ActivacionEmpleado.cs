namespace API_RRHH_TESIS2025.Models.General
{
    public class ActivacionEmpleado
    {
        public int Id { get; set; }
        public DateTime? FechaActivacion { get; set; }
        public string NombreCompleto { get; set; }
        public string Email { get; set; }
        public long Dni { get; set; }
        public bool Activo { get; set; }
        public bool PrimeraActivacion { get; set; }
        public int EmpleadoId { get; set; }
        public virtual Empleado Empleado { get; set; }
    }
}