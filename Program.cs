using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;


// Creamos la aplicación web
var builder = WebApplication.CreateBuilder(args);




//Configuramos el formato de respuesta JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });


// Configuracion de EF Core con SQL Server
builder.Services.AddDbContext<Context>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("API-NET-CORE8-RRHH")));

// Configuración de Identity para usuarios y roles
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequiredLength = 6;        // mínimo 6 caracteres
    options.Password.RequireDigit = false;      // no requiere números
    options.Password.RequireLowercase = false;  // no exige minúsculas
    options.Password.RequireUppercase = false;  // no exige mayúsculas
    options.Password.RequireNonAlphanumeric = false; // no exige símbolos
})
.AddEntityFrameworkStores<Context>() // Usa EF para almacenar los usuarios/roles
.AddDefaultTokenProviders();         // Activa generación de tokens


// Configuración de autenticación JWT
var jwtKey = builder.Configuration["Jwt:Key"]; // Obtiene la clave secreta del archivo de configuración
var jwtIssuer = builder.Configuration["Jwt:Issuer"]; // Obtiene el emisor del token

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme; // Esquema por defecto
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, // Verifica que el token venga del emisor correcto
        ValidateAudience = true, // Verifica que el token sea para el destinatario correcto
        ValidateLifetime = true, // Verifica que el token no esté expirado
        ValidateIssuerSigningKey = true, // Verifica la firma con la clave secreta
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)) // Firma del token
        
    };
});

// Habilita la autorización (para roles, políticas, etc.)
builder.Services.AddAuthorization();


// Swagger: para documentación y prueba de endpoints
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS: permite llamadas desde cualquier dominio (útil para frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin() // Permite cualquier origen (React, Angular, etc.)
              .AllowAnyMethod() // Permite GET, POST, PUT, DELETE, etc.
              .AllowAnyHeader(); // Permite cualquier cabecera (Authorization, Content-Type, etc.)
    });
});

// Construye la aplicación con todo lo anterior configurado
var app = builder.Build();

// Activa Swagger para probar la API desde el navegador
app.UseSwagger();
app.UseSwaggerUI();

app.UseDefaultFiles(new DefaultFilesOptions
{
    DefaultFileNames = new List<string> { "login.html" }
});
app.UseStaticFiles();

// Redirección automática de HTTP a HTTPS
// app.UseHttpsRedirection();

// Habilita CORS con la política que permite todo
app.UseCors("AllowAll");

// Activa autenticación y autorización
app.UseAuthentication();
app.UseAuthorization();

// Mapea todos los endpoints de los controladores
app.MapControllers();

// Inicia la aplicación
app.Run();




