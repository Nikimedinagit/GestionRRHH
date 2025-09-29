using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_NET_CORE8_RRHH.Migrations
{
    /// <inheritdoc />
    public partial class CamposDocuementoJustificacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DocumentoDescargable",
                table: "Certificado",
                newName: "DocumentoNombre");

            migrationBuilder.AlterColumn<byte[]>(
                name: "DocumentoAdjunto",
                table: "Justificacion",
                type: "varbinary(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DocumentoMimeType",
                table: "Justificacion",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DocumentoNombre",
                table: "Justificacion",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "DocumentoAdjunto",
                table: "Certificado",
                type: "varbinary(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DocumentoMimeType",
                table: "Certificado",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocumentoMimeType",
                table: "Justificacion");

            migrationBuilder.DropColumn(
                name: "DocumentoNombre",
                table: "Justificacion");

            migrationBuilder.DropColumn(
                name: "DocumentoAdjunto",
                table: "Certificado");

            migrationBuilder.DropColumn(
                name: "DocumentoMimeType",
                table: "Certificado");

            migrationBuilder.RenameColumn(
                name: "DocumentoNombre",
                table: "Certificado",
                newName: "DocumentoDescargable");

            migrationBuilder.AlterColumn<string>(
                name: "DocumentoAdjunto",
                table: "Justificacion",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(byte[]),
                oldType: "varbinary(max)",
                oldNullable: true);
        }
    }
}
