using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_NET_CORE8_RRHH.Migrations
{
    /// <inheritdoc />
    public partial class ModeloLicenciasCompletoPordos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocumentosAdjuntosJson",
                table: "Licencia");

            migrationBuilder.AddColumn<byte[]>(
                name: "DocumentoAdjunto",
                table: "Licencia",
                type: "varbinary(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocumentoAdjunto",
                table: "Licencia");

            migrationBuilder.AddColumn<string>(
                name: "DocumentosAdjuntosJson",
                table: "Licencia",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
