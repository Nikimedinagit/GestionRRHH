using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_NET_CORE8_RRHH.Migrations
{
    /// <inheritdoc />
    public partial class ModeloJustificacionCorreccion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TipoJustificacion",
                table: "Justificacion",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TipoJustificacion",
                table: "Justificacion");
        }
    }
}
