using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionRRHH.Migrations
{
    /// <inheritdoc />
    public partial class InicialMultiempresa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    NombreCompleto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmpresaId = table.Column<int>(type: "int", nullable: true),
                    Habilitado = table.Column<bool>(type: "bit", nullable: false),
                    Avatar = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    AvatarMimeType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Empresa",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Habilitada = table.Column<bool>(type: "bit", nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empresa", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Curriculum",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NombreCompleto = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FechaRecepcion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Documento = table.Column<byte[]>(type: "varbinary(max)", nullable: false),
                    DocumentoNombre = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DocumentoMimeType = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Curriculum", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Curriculum_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Curso",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Modalidad = table.Column<int>(type: "int", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFinalizacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Finalizado = table.Column<bool>(type: "bit", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Curso", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Curso_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Feriados",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Tipos = table.Column<int>(type: "int", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Feriados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Feriados_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notificaciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Titulo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Mensaje = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DestinatarioRol = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Leida = table.Column<bool>(type: "bit", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notificaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notificaciones_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PeriodoSolicitudVacaciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsuarioCreadorId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PeriodoSolicitudVacaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PeriodoSolicitudVacaciones_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Provincia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Eliminado = table.Column<bool>(type: "bit", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Provincia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Provincia_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Sector",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Eliminado = table.Column<bool>(type: "bit", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sector", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sector_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TipoDeCriterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Eliminado = table.Column<bool>(type: "bit", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoDeCriterio", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TipoDeCriterio_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TipoDeLicencia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Eliminado = table.Column<bool>(type: "bit", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoDeLicencia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TipoDeLicencia_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Localidad",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Eliminado = table.Column<bool>(type: "bit", nullable: false),
                    ProvinciaId = table.Column<int>(type: "int", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Localidad", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Localidad_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Localidad_Provincia_ProvinciaId",
                        column: x => x.ProvinciaId,
                        principalTable: "Provincia",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Puesto",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SectorId = table.Column<int>(type: "int", nullable: false),
                    Eliminado = table.Column<bool>(type: "bit", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Puesto", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Puesto_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Puesto_Sector_SectorId",
                        column: x => x.SectorId,
                        principalTable: "Sector",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Empleado",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NombreCompleto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DNI = table.Column<long>(type: "bigint", nullable: false),
                    NroLegajo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Direccion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaNacimiento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EstadoCiviles = table.Column<int>(type: "int", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Edad = table.Column<int>(type: "int", nullable: false),
                    Cuil = table.Column<long>(type: "bigint", nullable: false),
                    CantidadHijos = table.Column<int>(type: "int", nullable: true),
                    DiasVacacionesAnuales = table.Column<int>(type: "int", nullable: false),
                    FaceDescriptor = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    TipoSexo = table.Column<int>(type: "int", nullable: false),
                    LocalidadId = table.Column<int>(type: "int", nullable: false),
                    PuestoId = table.Column<int>(type: "int", nullable: false),
                    UsuarioId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Eliminado = table.Column<bool>(type: "bit", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empleado", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Empleado_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Empleado_Localidad_LocalidadId",
                        column: x => x.LocalidadId,
                        principalTable: "Localidad",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Empleado_Puesto_PuestoId",
                        column: x => x.PuestoId,
                        principalTable: "Puesto",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ActivacionEmpleado",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FechaActivacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivacionEmpleado", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActivacionEmpleado_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ActivacionEmpleado_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AsignacionResponsabilidadTarea",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Responsabilidades = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Tareas = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Eliminado = table.Column<bool>(type: "bit", nullable: false),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AsignacionResponsabilidadTarea", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AsignacionResponsabilidadTarea_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AsignacionResponsabilidadTarea_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AsistenciaCapacitacion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Resultado = table.Column<int>(type: "int", nullable: false),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    CursoId = table.Column<int>(type: "int", nullable: false),
                    Asistencia = table.Column<bool>(type: "bit", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AsistenciaCapacitacion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AsistenciaCapacitacion_Curso_CursoId",
                        column: x => x.CursoId,
                        principalTable: "Curso",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AsistenciaCapacitacion_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AsistenciaCapacitacion_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Certificado",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CursoId = table.Column<int>(type: "int", nullable: false),
                    DocumentoAdjunto = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    DocumentoNombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocumentoMimeType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Certificado", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Certificado_Curso_CursoId",
                        column: x => x.CursoId,
                        principalTable: "Curso",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Certificado_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Certificado_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Evaluacion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Calificacion = table.Column<int>(type: "int", nullable: false),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    UsuarioId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Evaluacion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Evaluacion_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Evaluacion_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HistorialLaboral",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    PuestoActual = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PuestoAnterior = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UsuarioModificador = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistorialLaboral", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistorialLaboral_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HistorialLaboral_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Horario",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HorarioInicio = table.Column<TimeSpan>(type: "time", nullable: false),
                    HorarioFin = table.Column<TimeSpan>(type: "time", nullable: false),
                    SegundoHorarioInicio = table.Column<TimeSpan>(type: "time", nullable: false),
                    SegundoHorarioFin = table.Column<TimeSpan>(type: "time", nullable: false),
                    TipoHorario = table.Column<int>(type: "int", nullable: false),
                    EsRotativo = table.Column<bool>(type: "bit", nullable: false),
                    FechaInicioRotacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RotacionSemanasJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Lunes = table.Column<bool>(type: "bit", nullable: false),
                    Martes = table.Column<bool>(type: "bit", nullable: false),
                    Miercoles = table.Column<bool>(type: "bit", nullable: false),
                    Jueves = table.Column<bool>(type: "bit", nullable: false),
                    Viernes = table.Column<bool>(type: "bit", nullable: false),
                    Sabado = table.Column<bool>(type: "bit", nullable: false),
                    Domingo = table.Column<bool>(type: "bit", nullable: false),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Horario", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Horario_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Horario_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Justificacion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Motivo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DocumentoAdjunto = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    DocumentoNombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocumentoMimeType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Estados = table.Column<int>(type: "int", nullable: false),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Justificacion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Justificacion_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Justificacion_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Licencia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TipoDeLicenciaId = table.Column<int>(type: "int", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    DocumentoAdjunto = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    DocumentoNombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocumentoMimeType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Licencia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Licencia_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Licencia_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Licencia_TipoDeLicencia_TipoDeLicenciaId",
                        column: x => x.TipoDeLicenciaId,
                        principalTable: "TipoDeLicencia",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReciboSueldo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    Periodo = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaCarga = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Documento = table.Column<byte[]>(type: "varbinary(max)", nullable: false),
                    DocumentoNombre = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DocumentoMimeType = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReciboSueldo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReciboSueldo_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReciboSueldo_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CriterioDeEvaluacion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TipoDeCriterioId = table.Column<int>(type: "int", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EvaluacionId = table.Column<int>(type: "int", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CriterioDeEvaluacion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CriterioDeEvaluacion_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CriterioDeEvaluacion_Evaluacion_EvaluacionId",
                        column: x => x.EvaluacionId,
                        principalTable: "Evaluacion",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CriterioDeEvaluacion_TipoDeCriterio_TipoDeCriterioId",
                        column: x => x.TipoDeCriterioId,
                        principalTable: "TipoDeCriterio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Asistencia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    HorarioId = table.Column<int>(type: "int", nullable: true),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PrimerEntrada = table.Column<TimeSpan>(type: "time", nullable: true),
                    PrimerSalida = table.Column<TimeSpan>(type: "time", nullable: true),
                    SegundaEntrada = table.Column<TimeSpan>(type: "time", nullable: true),
                    SegundaSalida = table.Column<TimeSpan>(type: "time", nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    FotoRuta = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Asistencia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Asistencia_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Asistencia_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Asistencia_Horario_HorarioId",
                        column: x => x.HorarioId,
                        principalTable: "Horario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AprobacionDeLicencia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    FechDeAprobacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsuarioAprobador = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LicenciaId = table.Column<int>(type: "int", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AprobacionDeLicencia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AprobacionDeLicencia_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AprobacionDeLicencia_Licencia_LicenciaId",
                        column: x => x.LicenciaId,
                        principalTable: "Licencia",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HoraExtraEmpleado",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    AsistenciaId = table.Column<int>(type: "int", nullable: true),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    HoraInicio = table.Column<TimeSpan>(type: "time", nullable: false),
                    HoraFin = table.Column<TimeSpan>(type: "time", nullable: false),
                    Minutos = table.Column<int>(type: "int", nullable: false),
                    Origen = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    Motivo = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HoraExtraEmpleado", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HoraExtraEmpleado_Asistencia_AsistenciaId",
                        column: x => x.AsistenciaId,
                        principalTable: "Asistencia",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_HoraExtraEmpleado_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HoraExtraEmpleado_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Empresa",
                columns: new[] { "Id", "FechaRegistro", "Habilitada", "Nombre" },
                values: new object[] { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "EMPRESA PRINCIPAL" });

            migrationBuilder.CreateIndex(
                name: "IX_ActivacionEmpleado_EmpleadoId",
                table: "ActivacionEmpleado",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivacionEmpleado_EmpresaId",
                table: "ActivacionEmpleado",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_AprobacionDeLicencia_EmpresaId",
                table: "AprobacionDeLicencia",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_AprobacionDeLicencia_LicenciaId",
                table: "AprobacionDeLicencia",
                column: "LicenciaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AsignacionResponsabilidadTarea_EmpleadoId",
                table: "AsignacionResponsabilidadTarea",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_AsignacionResponsabilidadTarea_EmpresaId",
                table: "AsignacionResponsabilidadTarea",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Asistencia_EmpleadoId",
                table: "Asistencia",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Asistencia_EmpresaId",
                table: "Asistencia",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Asistencia_HorarioId",
                table: "Asistencia",
                column: "HorarioId");

            migrationBuilder.CreateIndex(
                name: "IX_AsistenciaCapacitacion_CursoId",
                table: "AsistenciaCapacitacion",
                column: "CursoId");

            migrationBuilder.CreateIndex(
                name: "IX_AsistenciaCapacitacion_EmpleadoId",
                table: "AsistenciaCapacitacion",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_AsistenciaCapacitacion_EmpresaId",
                table: "AsistenciaCapacitacion",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Certificado_CursoId",
                table: "Certificado",
                column: "CursoId");

            migrationBuilder.CreateIndex(
                name: "IX_Certificado_EmpleadoId",
                table: "Certificado",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Certificado_EmpresaId",
                table: "Certificado",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_CriterioDeEvaluacion_EmpresaId",
                table: "CriterioDeEvaluacion",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_CriterioDeEvaluacion_EvaluacionId",
                table: "CriterioDeEvaluacion",
                column: "EvaluacionId");

            migrationBuilder.CreateIndex(
                name: "IX_CriterioDeEvaluacion_TipoDeCriterioId",
                table: "CriterioDeEvaluacion",
                column: "TipoDeCriterioId");

            migrationBuilder.CreateIndex(
                name: "IX_Curriculum_EmpresaId",
                table: "Curriculum",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Curso_EmpresaId",
                table: "Curso",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Empleado_EmpresaId",
                table: "Empleado",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Empleado_LocalidadId",
                table: "Empleado",
                column: "LocalidadId");

            migrationBuilder.CreateIndex(
                name: "IX_Empleado_PuestoId",
                table: "Empleado",
                column: "PuestoId");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluacion_EmpleadoId",
                table: "Evaluacion",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluacion_EmpresaId",
                table: "Evaluacion",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Feriados_EmpresaId",
                table: "Feriados",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_HistorialLaboral_EmpleadoId",
                table: "HistorialLaboral",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_HistorialLaboral_EmpresaId",
                table: "HistorialLaboral",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_HoraExtraEmpleado_AsistenciaId",
                table: "HoraExtraEmpleado",
                column: "AsistenciaId");

            migrationBuilder.CreateIndex(
                name: "IX_HoraExtraEmpleado_EmpleadoId",
                table: "HoraExtraEmpleado",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_HoraExtraEmpleado_EmpresaId",
                table: "HoraExtraEmpleado",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Horario_EmpleadoId",
                table: "Horario",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Horario_EmpresaId",
                table: "Horario",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Justificacion_EmpleadoId",
                table: "Justificacion",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Justificacion_EmpresaId",
                table: "Justificacion",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Licencia_EmpleadoId",
                table: "Licencia",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Licencia_EmpresaId",
                table: "Licencia",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Licencia_TipoDeLicenciaId",
                table: "Licencia",
                column: "TipoDeLicenciaId");

            migrationBuilder.CreateIndex(
                name: "IX_Localidad_EmpresaId",
                table: "Localidad",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Localidad_ProvinciaId",
                table: "Localidad",
                column: "ProvinciaId");

            migrationBuilder.CreateIndex(
                name: "IX_Notificaciones_EmpresaId",
                table: "Notificaciones",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_PeriodoSolicitudVacaciones_EmpresaId",
                table: "PeriodoSolicitudVacaciones",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Provincia_EmpresaId",
                table: "Provincia",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Puesto_EmpresaId",
                table: "Puesto",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Puesto_SectorId",
                table: "Puesto",
                column: "SectorId");

            migrationBuilder.CreateIndex(
                name: "IX_ReciboSueldo_EmpleadoId",
                table: "ReciboSueldo",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_ReciboSueldo_EmpresaId",
                table: "ReciboSueldo",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Sector_EmpresaId",
                table: "Sector",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_TipoDeCriterio_EmpresaId",
                table: "TipoDeCriterio",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_TipoDeLicencia_EmpresaId",
                table: "TipoDeLicencia",
                column: "EmpresaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActivacionEmpleado");

            migrationBuilder.DropTable(
                name: "AprobacionDeLicencia");

            migrationBuilder.DropTable(
                name: "AsignacionResponsabilidadTarea");

            migrationBuilder.DropTable(
                name: "AsistenciaCapacitacion");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "Certificado");

            migrationBuilder.DropTable(
                name: "CriterioDeEvaluacion");

            migrationBuilder.DropTable(
                name: "Curriculum");

            migrationBuilder.DropTable(
                name: "Feriados");

            migrationBuilder.DropTable(
                name: "HistorialLaboral");

            migrationBuilder.DropTable(
                name: "HoraExtraEmpleado");

            migrationBuilder.DropTable(
                name: "Justificacion");

            migrationBuilder.DropTable(
                name: "Notificaciones");

            migrationBuilder.DropTable(
                name: "PeriodoSolicitudVacaciones");

            migrationBuilder.DropTable(
                name: "ReciboSueldo");

            migrationBuilder.DropTable(
                name: "Licencia");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Curso");

            migrationBuilder.DropTable(
                name: "Evaluacion");

            migrationBuilder.DropTable(
                name: "TipoDeCriterio");

            migrationBuilder.DropTable(
                name: "Asistencia");

            migrationBuilder.DropTable(
                name: "TipoDeLicencia");

            migrationBuilder.DropTable(
                name: "Horario");

            migrationBuilder.DropTable(
                name: "Empleado");

            migrationBuilder.DropTable(
                name: "Localidad");

            migrationBuilder.DropTable(
                name: "Puesto");

            migrationBuilder.DropTable(
                name: "Provincia");

            migrationBuilder.DropTable(
                name: "Sector");

            migrationBuilder.DropTable(
                name: "Empresa");
        }
    }
}
