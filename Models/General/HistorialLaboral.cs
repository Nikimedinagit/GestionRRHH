using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GestionRRHH.Models.General;

namespace WorkSync.Models.General
{   
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// TABLA PARA HISTORIAL DE LABORAL //////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class HistorialLaboral
    {
        [Key]
        public int Id { get; set; }

        [NotMapped]
        public string FechaFinString { get { return FechaModificacion.ToString("dd/MM/yyyy"); } }
        public DateTime FechaModificacion { get; set; }

        [NotMapped]
        public string EmpleadoIdString { get { return Empleado?.NombreCompleto; } }
        public int EmpleadoId { get; set; }
        public virtual Empleado Empleado { get; set; }
        public string PuestoActual { get; set; }
        public string PuestoAnterior { get; set; }
        public string UsuarioModificador { get; set; }

    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// VISTA DE TABLA PARA HISTORIAL DE LABORAL ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class VistaHistorialLaboral
    {
        public int Id { get; set; }
        public string FechaModificacionString { get; set; }
        public string EmpleadoIdString { get; set; }
        public int EmpleadoId { get; set; }
        public string PuestoActual { get; set; }
        public string PuestoAnterior { get; set; }
        public string SectorActual { get; set; }
        public string SectorAnterior { get; set; }
        public string UsuarioModificador { get; set; }
        public string UsuarioModificadorNombre { get; set; }
        public string UsuarioModificadorEmail { get; set; }
    }

}