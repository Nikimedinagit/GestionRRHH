using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionRRHH.Migrations
{
    /// <inheritdoc />
    public partial class HorarioRotativo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EsRotativo",
                table: "Horario",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaInicioRotacion",
                table: "Horario",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RotacionSemanasJson",
                table: "Horario",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EsRotativo",
                table: "Horario");

            migrationBuilder.DropColumn(
                name: "FechaInicioRotacion",
                table: "Horario");

            migrationBuilder.DropColumn(
                name: "RotacionSemanasJson",
                table: "Horario");
        }
    }
}
