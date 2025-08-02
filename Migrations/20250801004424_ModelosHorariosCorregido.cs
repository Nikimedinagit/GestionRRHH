using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_NET_CORE8_RRHH.Migrations
{
    /// <inheritdoc />
    public partial class ModelosHorariosCorregido : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Dias",
                table: "Horario",
                newName: "Viernes");

            migrationBuilder.AddColumn<string>(
                name: "Domingo",
                table: "Horario",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Jueves",
                table: "Horario",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Lunes",
                table: "Horario",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Martes",
                table: "Horario",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Miercoles",
                table: "Horario",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Sabado",
                table: "Horario",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SegundoHorarioFin",
                table: "Horario",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "SegundoHorarioInicio",
                table: "Horario",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "TipoHorario",
                table: "Horario",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Domingo",
                table: "Horario");

            migrationBuilder.DropColumn(
                name: "Jueves",
                table: "Horario");

            migrationBuilder.DropColumn(
                name: "Lunes",
                table: "Horario");

            migrationBuilder.DropColumn(
                name: "Martes",
                table: "Horario");

            migrationBuilder.DropColumn(
                name: "Miercoles",
                table: "Horario");

            migrationBuilder.DropColumn(
                name: "Sabado",
                table: "Horario");

            migrationBuilder.DropColumn(
                name: "SegundoHorarioFin",
                table: "Horario");

            migrationBuilder.DropColumn(
                name: "SegundoHorarioInicio",
                table: "Horario");

            migrationBuilder.DropColumn(
                name: "TipoHorario",
                table: "Horario");

            migrationBuilder.RenameColumn(
                name: "Viernes",
                table: "Horario",
                newName: "Dias");
        }
    }
}
