using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_NET_CORE8_RRHH.Migrations
{
    /// <inheritdoc />
    public partial class ModeloLicencias : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExcelAdjunto",
                table: "Licencia",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImagenAdjunta",
                table: "Licencia",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PdfAdjunto",
                table: "Licencia",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WordAdjunto",
                table: "Licencia",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExcelAdjunto",
                table: "Licencia");

            migrationBuilder.DropColumn(
                name: "ImagenAdjunta",
                table: "Licencia");

            migrationBuilder.DropColumn(
                name: "PdfAdjunto",
                table: "Licencia");

            migrationBuilder.DropColumn(
                name: "WordAdjunto",
                table: "Licencia");
        }
    }
}
