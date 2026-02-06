namespace GestionRRHH.Models.General
{
    public class Notificaciones
    {
        public int Id { get; set; }
        public string UsuarioId { get; set; }
        public string Titulo { get; set; }
        public string Mensaje { get; set; }
        public DateTime FechaCreacion { get; set; }
        public string DestinatarioRol { get; set; }
        public bool Leida { get; set; } = false;
    }
}