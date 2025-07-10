using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_NET_CORE8_RRHH.Migrations
{
    /// <inheritdoc />
    public partial class CambioModeloEvaluacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Evaluacion_Empleado_EmpleadoId",
                table: "Evaluacion");

            migrationBuilder.DropIndex(
                name: "IX_Evaluacion_EmpleadoId",
                table: "Evaluacion");

            migrationBuilder.AlterColumn<string>(
                name: "EmpleadoId",
                table: "Evaluacion",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "EmpleadoId",
                table: "Evaluacion",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Evaluacion_EmpleadoId",
                table: "Evaluacion",
                column: "EmpleadoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Evaluacion_Empleado_EmpleadoId",
                table: "Evaluacion",
                column: "EmpleadoId",
                principalTable: "Empleado",
                principalColumn: "Id");
        }
    }
}
