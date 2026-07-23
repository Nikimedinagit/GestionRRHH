using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionRRHH.Migrations
{
    /// <inheritdoc />
    public partial class OptimizacionMultiempresaIndices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Empleado",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notificaciones_EmpresaId_FechaCreacion",
                table: "Notificaciones",
                columns: new[] { "EmpresaId", "FechaCreacion" });

            migrationBuilder.CreateIndex(
                name: "IX_Empleado_Email",
                table: "Empleado",
                column: "Email");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notificaciones_EmpresaId_FechaCreacion",
                table: "Notificaciones");

            migrationBuilder.DropIndex(
                name: "IX_Empleado_Email",
                table: "Empleado");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Empleado",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);
        }
    }
}
