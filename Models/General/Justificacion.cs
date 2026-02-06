using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.Identity.Client;
using NuGet.Common;

namespace GestionRRHH.Models.General
{
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// TABLA PARA JUSTIFICACIONES ///////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class Justificacion
    {
        [Key]
        public int Id { get; set; }
        public string Motivo { get; set; }
        [NotMapped]
        public string FechaString { get { return Fecha.ToString("dd/MM/yyyy"); } }
        public DateTime Fecha { get; set; }
        public byte[] DocumentoAdjunto { get; set; }
        public string DocumentoNombre { get; set; }
        public string DocumentoMimeType { get; set; }
        [NotMapped]
        public string EstadoString { get { return Estados.ToString(); } }
        public EstadoJustificacion Estados { get; set; }
        [NotMapped]
        public string EmpleadoString { get { return Empleado?.NombreCompleto; } }
        public int EmpleadoId { get; set; }
        public virtual Empleado Empleado { get; set; }

    }

    public enum EstadoJustificacion
    {
        PENDIENTE = 1,
        APROBADA = 2,
        RECHAZADA = 3,
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// VISTA DE TABLA PARA JUSTIFICACIONES ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class VistaJustificacion
    {
        public int Id { get; set; }
        public string Motivo { get; set; }
        public string FechaString { get; set; }
        public string EstadoString { get; set; }
        public string EmpleadoString { get; set; }
        public int EmpleadoId { get; set; }
        public byte[] DocumentoAdjunto { get; set; }
        public string DocumentoNombre { get; set; }
        public string DocumentoMimeType { get; set; }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// TABLA PARA FILTRO ///////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    public class JustificacionFiltrar
    {
        public string EmpleadoTexto { get; set; }
        public int? EstadoJustificacion { get; set; }
        public DateTime? FechaJustificacion { get; set; }
    }

}