namespace GestionRRHH.Models.Dto
{
    public class FicharDto
    {
        public float[] FaceDescriptor { get; set; }
        public string FotoBase64 { get; set; }
    }

    public class RegistrarRostroDto
    {
        public string Dni { get; set; }
        public float[] FaceDescriptor { get; set; }
    }
}
