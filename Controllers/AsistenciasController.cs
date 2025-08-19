using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using API_RRHH_TESIS2025.Models.Dto;
using API_RRHH_TESIS2025.Services;

namespace API_NET_CORE8_RRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AsistenciasController : ControllerBase
    {
        private readonly IAsistenciaService _asistenciaService;
        public AsistenciasController(IAsistenciaService asistenciaService) => _asistenciaService = asistenciaService;

        // POST: api/Asistencias/RegistrarRostro
        [HttpPost("RegistrarRostro")]
        public async Task<IActionResult> RegistrarRostro([FromBody] RegistrarRostroDto dto)
        {
            var result = await _asistenciaService.RegistrarRostroAsync(dto.Dni, dto.FaceDescriptor);
            if (!result.ok) return BadRequest(result.payload);
            return Ok(result.payload);
        }

        // POST: api/Asistencias/Fichar
        [HttpPost("Fichar")]
        public async Task<IActionResult> Fichar([FromBody] FicharDto dto)
        {
            var result = await _asistenciaService.FicharAsync(dto.FaceDescriptor);
            if (!result.ok) return BadRequest(result.payload);
            return Ok(result.payload);
        }
    }
}
