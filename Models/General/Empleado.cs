    using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Cryptography.X509Certificates;
using WorkSync.Models.General;

namespace API_RRHH_TESIS2025.Models.General
{


    public class Empleado
    {
        [Key]
        public int Id { get; set; }

        public string NombreCompleto { get; set; }

        public long DNI { get; set; }

        public string Direccion { get; set; }

        [NotMapped]
        public string FechaNacimientoString { get { return FechaNacimiento.ToString("dd/MM/yyyy"); } }
        public DateTime FechaNacimiento { get; set; }

        [NotMapped]
        public string EstadoCivilesString { get { return EstadoCiviles.ToString(); } }
        public EstadoCivil EstadoCiviles { get; set; }

        public string Email { get; set; }

        public string Telefono { get; set; }

        public long Cuil { get; set; }

        public int CantidadHijos { get; set; }


        [NotMapped]
        public string TipoSexoString { get { return TipoSexo.ToString(); } }
        public TipoSexo TipoSexo { get; set; }

        [NotMapped]
        public string LocalidadIdString { get { return Localidad?.Nombre; } }
        public int LocalidadId { get; set; }
        public virtual Localidad Localidad { get; set; }



        [NotMapped]
        public string PuestoIdString { get { return Puesto?.Descripcion; } }
        public int PuestoId { get; set; }
        public virtual Puesto Puesto { get; set; }

        public string UsuarioId { get; set; }

        public bool Eliminado { get; set; }


        public virtual ICollection<Evaluacion> Evaluacion { get; set; }
        public virtual ICollection<Licencia> Licencia { get; set; }
        public virtual ICollection<AsistenciaCapacitacion> AsistenciaCapacitacion { get; set; }
        public virtual ICollection<HistorialLaboral> HistorialLaboral { get; set; }
        public virtual ICollection<Certificado> Certificado { get; set; }
        public virtual ICollection<Horario> Horario { get; set; }
        public virtual ICollection<Justificacion> Justificacion { get; set; }

    }


    public enum EstadoCivil
    {
        SOLTERO = 1,
        CASADO,
        DIVORCIADO,
        VIUDO
    }


    public enum TipoSexo
    {
        MASCULINO = 1,
        FEMENINO,
        NO_BINARIO,
        OTRO
    }

    public class VistaEmpleado
    {
        public int Id { get; set; }
        public string NombreCompleto { get; set; }
        public long DNI { get; set; }
        public string Direccion { get; set; }
        public string FechaNacimientoString { get; set; }
        public string EstadoCivilesString { get; set; }
        public EstadoCivil EstadoCiviles { get; set; }
        public string Email { get; set; }
        public string Telefono { get; set; }
        public long Cuil { get; set; }
        public int CantidadHijos { get; set; }
        public string TipoSexoString { get; set; }
        public TipoSexo TipoSexo { get; set; }
        public string LocalidadIdString { get; set; }
        public int LocalidadId { get; set; }
        public string PuestoIdString { get; set; }
        public int PuestoId { get; set; }
        public string UsuarioId { get; set; }
        public string UsuarioNombreCreador { get; set; }
        public string UsuarioEmailCreador { get; set; }
        public bool Eliminado { get; set; }

    }


    public class FiltrarEmpleado
    {
        public string NombreCompleto { get; set; }
        public long? DNI { get; set; }
        public int? EstadoCiviles { get; set; }

        public int? TipoSexo { get; set; }

        public int? LocalidadId { get; set; }
        public int? PuestoId { get; set; }
    }
        

 } 