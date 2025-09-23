using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_NET_CORE8_RRHH.Migrations
{
    /// <inheritdoc />
    public partial class NuevosModelosCursos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FechaCreacion",
                table: "Curso",
                newName: "FechaFinalizacion");

            migrationBuilder.AddColumn<bool>(
                name: "Finalizado",
                table: "Curso",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Finalizado",
                table: "Curso");

            migrationBuilder.RenameColumn(
                name: "FechaFinalizacion",
                table: "Curso",
                newName: "FechaCreacion");
        }
    }
}
