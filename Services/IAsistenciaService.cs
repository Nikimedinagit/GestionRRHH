using API_RRHH_TESIS2025.Models.Dto;
using API_RRHH_TESIS2025.Models.General;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API_RRHH_TESIS2025.Services
{
    public interface IAsistenciaService
    {
        Task<(bool ok, object payload)> RegistrarRostroAsync(string dni, float[] faceDescriptor);
        Task<(bool ok, object payload)> FicharAsync(FicharDto dto);
        Task RegistrarAusentesAutomaticamenteAsync();

    }
}
