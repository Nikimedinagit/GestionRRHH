using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;
using WorkSync.Models.General;
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
    public DbSet<Evaluacion> Evaluacion { get; set; }
    public DbSet<Licencia> Licencia { get; set; }
    public DbSet<AprobacionDeLicencia> AprobacionDeLicencia { get; set; }
    public DbSet<TipoDeLicencia> TipoDeLicencia { get; set; }
    public DbSet<TipoDeCriterio> TipoDeCriterio { get; set; }
    public DbSet<CriterioDeEvaluacion> CriterioDeEvaluacion { get; set; }
    public DbSet<Curso> Curso { get; set; }
    public DbSet<AsistenciaCapacitacion> AsistenciaCapacitacion { get; set; }
    public DbSet<HistorialLaboral> HistorialLaboral { get; set; }
    public DbSet<Certificado> Certificado { get; set; }
    public DbSet<Horario> Horario { get; set; }
    public DbSet<ActivacionEmpleado> ActivacionEmpleado { get; set; }
    public DbSet<Justificacion> Justificacion { get; set; }
    public DbSet<Asistencia> Asistencia { get; set; }
    public DbSet<Feriado> Feriados { get; set; }
    public DbSet<Notificaciones> Notificaciones { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Asistencia>()
        .HasOne(a => a.Empleado)
        .WithMany()
        .HasForeignKey(a => a.EmpleadoId)
        .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<Asistencia>()
        .HasOne(a => a.Horario)
        .WithMany()
        .HasForeignKey(a => a.HorarioId)
        .OnDelete(DeleteBehavior.Restrict);
}

}
