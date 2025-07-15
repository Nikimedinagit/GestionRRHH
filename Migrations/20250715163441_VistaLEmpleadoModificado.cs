using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_NET_CORE8_RRHH.Migrations
{
    /// <inheritdoc />
    public partial class VistaLEmpleadoModificado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UsuarioId",
                table: "Empleado",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UsuarioId",
                table: "Empleado");
        }
    }
}
