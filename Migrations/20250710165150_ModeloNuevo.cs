using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_NET_CORE8_RRHH.Migrations
{
    /// <inheritdoc />
    public partial class ModeloNuevo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TipoDeLicencia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoDeLicencia", x => x.Id);
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
                    DocumentoAdjunto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false)
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
                        name: "FK_Licencia_TipoDeLicencia_TipoDeLicenciaId",
                        column: x => x.TipoDeLicenciaId,
                        principalTable: "TipoDeLicencia",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                    LicenciaId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AprobacionDeLicencia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AprobacionDeLicencia_Licencia_LicenciaId",
                        column: x => x.LicenciaId,
                        principalTable: "Licencia",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AprobacionDeLicencia_LicenciaId",
                table: "AprobacionDeLicencia",
                column: "LicenciaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Licencia_EmpleadoId",
                table: "Licencia",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Licencia_TipoDeLicenciaId",
                table: "Licencia",
                column: "TipoDeLicenciaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AprobacionDeLicencia");

            migrationBuilder.DropTable(
                name: "Licencia");

            migrationBuilder.DropTable(
                name: "TipoDeLicencia");
        }
    }
}
