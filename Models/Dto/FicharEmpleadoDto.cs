namespace API_RRHH_TESIS2025.Models.Dto
{
    public class FicharDto
    {
        public float[] FaceDescriptor { get; set; }
    }

    public class RegistrarRostroDto
    {
        public string Dni { get; set; }
        public float[] FaceDescriptor { get; set; }
    }
}
