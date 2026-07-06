using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionRRHH.Migrations
{
    /// <inheritdoc />
    public partial class EmpleadoDiasVacacionesAnuales : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DiasVacacionesAnuales",
                table: "Empleado",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiasVacacionesAnuales",
                table: "Empleado");
        }
    }
}
