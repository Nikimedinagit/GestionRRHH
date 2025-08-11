using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_NET_CORE8_RRHH.Migrations
{
    /// <inheritdoc />
    public partial class ConfigurarRelacionesAsistencia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Asistencia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    HorarioId = table.Column<int>(type: "int", nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PrimerEntrada = table.Column<TimeSpan>(type: "time", nullable: true),
                    PrimerSalida = table.Column<TimeSpan>(type: "time", nullable: true),
                    SegundaEntrada = table.Column<TimeSpan>(type: "time", nullable: true),
                    SegundaSalida = table.Column<TimeSpan>(type: "time", nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    EmpleadoId1 = table.Column<int>(type: "int", nullable: true),
                    HorarioId1 = table.Column<int>(type: "int", nullable: true)
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
                        name: "FK_Asistencia_Empleado_EmpleadoId1",
                        column: x => x.EmpleadoId1,
                        principalTable: "Empleado",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Asistencia_Horario_HorarioId",
                        column: x => x.HorarioId,
                        principalTable: "Horario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Asistencia_Horario_HorarioId1",
                        column: x => x.HorarioId1,
                        principalTable: "Horario",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Asistencia_EmpleadoId",
                table: "Asistencia",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Asistencia_EmpleadoId1",
                table: "Asistencia",
                column: "EmpleadoId1");

            migrationBuilder.CreateIndex(
                name: "IX_Asistencia_HorarioId",
                table: "Asistencia",
                column: "HorarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Asistencia_HorarioId1",
                table: "Asistencia",
                column: "HorarioId1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Asistencia");
        }
    }
}
