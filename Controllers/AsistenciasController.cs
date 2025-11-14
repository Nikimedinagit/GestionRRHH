using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using API_RRHH_TESIS2025.Models.Dto;
using API_RRHH_TESIS2025.Services;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.EntityFrameworkCore;

namespace API_NET_CORE8_RRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AsistenciasController : ControllerBase
    {
        private readonly Context _context;
        private readonly IAsistenciaService _asistenciaService;
        public AsistenciasController(Context context, IAsistenciaService asistenciaService)
        {
            _context = context;
            _asistenciaService = asistenciaService;

        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER Y MOSTARR LOS DATOSDE LA ASITENCIA SEGUN SUS FILTROS /////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("FiltrarDia")]
        public async Task<ActionResult<IEnumerable<VistaAsistencia>>> FiltrarAsistenciaDia([FromBody] FiltrarAsistencia filtro)
        {
            var fechaSeleccionada = filtro.Fecha ?? DateTime.Today;
            var fechaSiguiente = fechaSeleccionada.AddDays(1);

            var obtenerAsistencias = _context.Asistencia
                    .Include(a => a.Empleado)
                    .Include(a => a.Horario)
                    .Where(a =>
                        a.Fecha >= fechaSeleccionada &&
                        a.Fecha < fechaSiguiente &&
                        a.Empleado != null &&
                        !a.Empleado.Eliminado
                    )
                    .AsQueryable();


            if (!string.IsNullOrWhiteSpace(filtro.NombreCompleto))
            {
                var nombreFiltro = filtro.NombreCompleto.ToLower();
                obtenerAsistencias = obtenerAsistencias.Where(a => a.Empleado.NombreCompleto.ToLower().Contains(nombreFiltro));
            }

            if (filtro.DNI.HasValue)
            {
                var dniFiltro = filtro.DNI.Value.ToString();
                obtenerAsistencias = obtenerAsistencias.Where(a => a.Empleado.DNI.ToString().StartsWith(dniFiltro));
            }

            if (!string.IsNullOrEmpty(filtro.NroLegajo))
            {
                var legajoFiltro = filtro.NroLegajo.ToString();
                obtenerAsistencias = obtenerAsistencias.Where(a => a.Empleado.NroLegajo.ToString().StartsWith(legajoFiltro));
            }

            if (filtro.EstadoAsistencia.HasValue)
            {
                obtenerAsistencias = obtenerAsistencias
                    .Where(a => (int)a.Estado == filtro.EstadoAsistencia.Value);
            }


            var vista = await obtenerAsistencias
                .Select(a => new VistaAsistencia
                {
                    Id = a.Id,
                    EmpleadoString = a.Empleado != null ? a.Empleado.NombreCompleto : "Sin empleado",
                    NroLegajo = a.Empleado != null ? a.Empleado.NroLegajo.ToString() : "-",
                    TipoHorario = a.Horario != null ? a.Horario.TipoHorarioString : "CONTINUO",
                    FechaString = a.Fecha.ToString("dd/MM/yyyy"),
                    EstadoString = a.Estado.ToString(),
                    PrimerEntradaString = a.PrimerEntrada.HasValue ? a.PrimerEntrada.Value.ToString(@"hh\:mm") : null,
                    PrimerSalidaString = a.PrimerSalida.HasValue ? a.PrimerSalida.Value.ToString(@"hh\:mm") : null,
                    SegundaEntradaString = a.SegundaEntrada.HasValue ? a.SegundaEntrada.Value.ToString(@"hh\:mm") : null,
                    SegundaSalidaString = a.SegundaSalida.HasValue ? a.SegundaSalida.Value.ToString(@"hh\:mm") : null,
                    FotoUrl = a.FotoRuta != null ? $"http://localhost:5106/{a.FotoRuta}" : null
                })
                .ToListAsync();

            return Ok(vista);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA REGISTRAR UN ROSTRO //////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("RegistrarRostro")]
        public async Task<IActionResult> RegistrarRostro([FromBody] RegistrarRostroDto dto)
        {
            var result = await _asistenciaService.RegistrarRostroAsync(dto.Dni, dto.FaceDescriptor);
            if (!result.ok) return BadRequest(result.payload);
            return Ok(result.payload);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA FICHAR UN ROSTRO //////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("Fichar")]
        public async Task<IActionResult> Fichar([FromBody] FicharDto dto)
        {
            var result = await _asistenciaService.FicharAsync(dto);
            if (!result.ok) return BadRequest(result.payload);
            return Ok(result.payload);
        }





    }
}
