using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_NET_CORE8_RRHH.Migrations
{
    /// <inheritdoc />
    public partial class ModelosCorregidos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Dni",
                table: "ActivacionEmpleado");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "ActivacionEmpleado");

            migrationBuilder.DropColumn(
                name: "NombreCompleto",
                table: "ActivacionEmpleado");

            migrationBuilder.DropColumn(
                name: "PrimeraActivacion",
                table: "ActivacionEmpleado");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "Dni",
                table: "ActivacionEmpleado",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "ActivacionEmpleado",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NombreCompleto",
                table: "ActivacionEmpleado",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PrimeraActivacion",
                table: "ActivacionEmpleado",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
