using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using GestionRRHH.Models.General;
using WorkSync.Models.General;
using System.Linq.Expressions;
using System.Security.Claims;
public class Context : IdentityDbContext<ApplicationUser>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public Context(DbContextOptions<Context> options, IHttpContextAccessor httpContextAccessor)
        : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int EmpresaActualId =>
        int.TryParse(_httpContextAccessor.HttpContext?.User.FindFirst("EmpresaId")?.Value, out var empresaId)
            ? empresaId : 1;

    public bool EsDesarrollador =>
        _httpContextAccessor.HttpContext?.User.IsInRole("DESARROLLADOR") == true;

    public DbSet<Empresa> Empresa { get; set; }
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
    public DbSet<PeriodoSolicitudVacaciones> PeriodoSolicitudVacaciones { get; set; }
    public DbSet<AsignacionResponsabilidadTarea> AsignacionResponsabilidadTarea { get; set; }
    public DbSet<Curriculum> Curriculum { get; set; }
    public DbSet<ReciboSueldo> ReciboSueldo { get; set; }
    public DbSet<HoraExtraEmpleado> HoraExtraEmpleado { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Asistencia>()
        .HasOne(a => a.Empleado)
        .WithMany(e => e.Asistencia)
        .HasForeignKey(a => a.EmpleadoId)
        .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<Asistencia>()
        .HasOne(a => a.Horario)
        .WithMany(h => h.Asistencias)
        .HasForeignKey(a => a.HorarioId)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<ReciboSueldo>()
        .HasOne(r => r.Empleado)
        .WithMany()
        .HasForeignKey(r => r.EmpleadoId)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<HoraExtraEmpleado>()
        .HasOne(h => h.Empleado)
        .WithMany()
        .HasForeignKey(h => h.EmpleadoId)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<HoraExtraEmpleado>()
        .HasOne(h => h.Asistencia)
        .WithMany()
        .HasForeignKey(h => h.AsistenciaId)
        .OnDelete(DeleteBehavior.SetNull);

    modelBuilder.Entity<Empresa>().HasData(new Empresa
    {
        Id = 1,
        Nombre = "EMPRESA PRINCIPAL",
        Habilitada = true,
        FechaRegistro = new DateTime(2026, 1, 1)
    });

    var entidadesEmpresa = modelBuilder.Model.GetEntityTypes()
        .Where(e => e.ClrType != typeof(Empresa) &&
            (e.ClrType.Namespace?.StartsWith("GestionRRHH.Models.General") == true ||
             e.ClrType.Namespace?.StartsWith("WorkSync.Models.General") == true))
        .ToList();

    foreach (var entidad in entidadesEmpresa)
    {
        entidad.AddProperty("EmpresaId", typeof(int)).SetDefaultValue(1);
        modelBuilder.Entity(entidad.ClrType)
            .HasOne(typeof(Empresa))
            .WithMany()
            .HasForeignKey("EmpresaId")
            .OnDelete(DeleteBehavior.Restrict);

        var parametro = Expression.Parameter(entidad.ClrType, "entidad");
        var empresaPropiedad = Expression.Call(
            typeof(EF),
            nameof(EF.Property),
            new[] { typeof(int) },
            parametro,
            Expression.Constant("EmpresaId"));
        var empresaActual = Expression.Property(Expression.Constant(this), nameof(EmpresaActualId));
        var esDesarrollador = Expression.Property(Expression.Constant(this), nameof(EsDesarrollador));
        var filtro = Expression.OrElse(esDesarrollador, Expression.Equal(empresaPropiedad, empresaActual));
        modelBuilder.Entity(entidad.ClrType).HasQueryFilter(Expression.Lambda(filtro, parametro));
    }
}

    public override int SaveChanges()
    {
        AsignarEmpresa();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        AsignarEmpresa();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void AsignarEmpresa()
    {
        foreach (var entrada in ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added && e.Metadata.FindProperty("EmpresaId") != null))
        {
            entrada.Property("EmpresaId").CurrentValue = EmpresaActualId;
        }
    }

}
