    using System.ComponentModel.DataAnnotations;
    using System.Security.Cryptography.X509Certificates;

    namespace API_RRHH_TESIS2025.Models.General;


public class Empleado
{
    [Key]
    public int Id { get; set; }

    public string NombreCompleto { get; set; }

    public long DNI { get; set; }

    public string Direccion { get; set; }

    public DateTime FechaNacimiento { get; set; }

    public EstadoCivil EstadoCiviles { get; set; }
    public string Email { get; set; }

    public string Telefono { get; set; }

    public long Cuil { get; set; }

    public int CantidadHijos { get; set; }

    public TipoSexo TipoSexo { get; set; }


    public int LocalidadId { get; set; }
    public virtual Localidad Localidad { get; set; }


    public int PuestoId { get; set; }
    public virtual Puesto Puesto { get; set; }


    public virtual ICollection<Evaluacion> Evaluacion { get; set; }
    public virtual ICollection<Licencia> Licencia { get; set; }

    

    }


    public enum EstadoCivil
    {
        SOLTERO,
        CASADO,
        DIVORCIADO,
        VIUDO
    }


    public enum TipoSexo
    {
        MASCULINO,
        FEMENINO,
        NO_BINARIO,
        OTRO
    }