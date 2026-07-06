using System.Text;
using System.Text.Json.Serialization;
using GestionRRHH.Services;
using GestionRRHH.Services.Hosted;
using GestionRRHH.Models.General;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

// Creamos la aplicación web
var builder = WebApplication.CreateBuilder(args);

// Configuración de EF Core con SQL Server
builder.Services.AddDbContext<Context>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("GestionRRHH")));

// Configuración de Identity para usuarios y roles
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequiredLength = 6;
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
})
.AddEntityFrameworkStores<Context>()
.AddDefaultTokenProviders();

// Inyección del servicio de asistencia
builder.Services.AddScoped<IAsistenciaService, AsistenciaService>();
builder.Services.AddHostedService<RegistrarAusentesBackgroundService>();
builder.Services.AddHostedService<LimpiezaFotosService>();


// Configuración del formato de respuesta JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// Configuración de autenticación JWT
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// Habilita autorización
builder.Services.AddAuthorization();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<Context>();
    var vacaciones = context.TipoDeLicencia
        .AsEnumerable()
        .FirstOrDefault(t => string.Equals(t.Nombre?.Trim(), "VACACIONES", StringComparison.OrdinalIgnoreCase));

    if (vacaciones == null)
    {
        context.TipoDeLicencia.Add(new TipoDeLicencia
        {
            Nombre = "VACACIONES",
            Eliminado = false
        });
        context.SaveChanges();
    }
    else if (vacaciones.Eliminado || vacaciones.Nombre != "VACACIONES")
    {
        vacaciones.Nombre = "VACACIONES";
        vacaciones.Eliminado = false;
        context.SaveChanges();
    }
}

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

// Archivos estáticos desde wwwroot
app.UseDefaultFiles(new DefaultFilesOptions
{
    DefaultFileNames = new List<string> { "login.html" }
});
app.UseStaticFiles(new StaticFileOptions
{
    ServeUnknownFileTypes = true 
});

// CORS
app.UseCors("AllowAll");

// Autenticación y autorización
app.UseAuthentication();
app.UseAuthorization();

// Controladores
app.MapControllers();

app.Run();
