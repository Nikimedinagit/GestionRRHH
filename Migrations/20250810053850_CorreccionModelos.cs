using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_NET_CORE8_RRHH.Migrations
{
    /// <inheritdoc />
    public partial class CorreccionModelos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Horario_Empleado_EmpleadoId",
                table: "Horario");

            migrationBuilder.DropIndex(
                name: "IX_Horario_EmpleadoId",
                table: "Horario");

            migrationBuilder.DropColumn(
                name: "EmpleadoId",
                table: "Horario");

            migrationBuilder.AddColumn<int>(
                name: "HorarioId",
                table: "Empleado",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Empleado_HorarioId",
                table: "Empleado",
                column: "HorarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Empleado_Horario_HorarioId",
                table: "Empleado",
                column: "HorarioId",
                principalTable: "Horario",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Empleado_Horario_HorarioId",
                table: "Empleado");

            migrationBuilder.DropIndex(
                name: "IX_Empleado_HorarioId",
                table: "Empleado");

            migrationBuilder.DropColumn(
                name: "HorarioId",
                table: "Empleado");

            migrationBuilder.AddColumn<int>(
                name: "EmpleadoId",
                table: "Horario",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Horario_EmpleadoId",
                table: "Horario",
                column: "EmpleadoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Horario_Empleado_EmpleadoId",
                table: "Horario",
                column: "EmpleadoId",
                principalTable: "Empleado",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
