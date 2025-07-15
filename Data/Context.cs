using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;
public class Context : IdentityDbContext<ApplicationUser>
{
    public Context(DbContextOptions<Context> options)
        : base(options)
    {
    }

    public DbSet<Provincia> Provincia { get; set; }
    public DbSet<Localidad> Localidad { get; set; }
    public DbSet<Puesto> Puesto { get; set; }
    public DbSet<Sector> Sector { get; set; }
    public DbSet<Empleado> Empleado { get; set; }
    public DbSet<API_RRHH_TESIS2025.Models.General.Evaluacion> Evaluacion { get; set; }
    public DbSet<API_RRHH_TESIS2025.Models.General.Licencia> Licencia { get; set; }
    public DbSet<API_RRHH_TESIS2025.Models.General.AprobacionDeLicencia> AprobacionDeLicencia { get; set; }
    public DbSet<API_RRHH_TESIS2025.Models.General.TipoDeLicencia> TipoDeLicencia { get; set; }
    public DbSet<API_RRHH_TESIS2025.Models.General.TipoDeCriterio> TipoDeCriterio { get; set; }
    public DbSet<CriterioDeEvaluacion> CriterioDeEvaluacion { get; set; }
    public DbSet<API_RRHH_TESIS2025.Models.General.Curso> Curso { get; set; }
    public DbSet<API_RRHH_TESIS2025.Models.General.AsistenciaCapacitacion> AsistenciaCapacitacion { get; set; }
}
