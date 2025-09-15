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


        [HttpGet]
        public async Task<ActionResult<IEnumerable<VistaAsistencia>>> GetAsistencia()
        {
            var asistencias = await _context.Asistencia
                .Include(a => a.Empleado)
                .Include(a => a.Horario)
                .ToListAsync();

            var vista = asistencias.Select(a => new VistaAsistencia
            {
                Id = a.Id,
                EmpleadoString = a.Empleado != null ? a.Empleado.NombreCompleto : "Sin empleado",
                FechaString = a.Fecha.ToString("dd/MM/yyyy"),
                EstadoString = a.Estado.ToString(),
                PrimerEntradaString = a.PrimerEntrada.HasValue ? a.PrimerEntrada.Value.ToString(@"hh\:mm") : null,
                PrimerSalidaString = a.PrimerSalida.HasValue ? a.PrimerSalida.Value.ToString(@"hh\:mm") : null,
                SegundaEntradaString = a.SegundaEntrada.HasValue ? a.SegundaEntrada.Value.ToString(@"hh\:mm") : null,
                SegundaSalidaString = a.SegundaSalida.HasValue ? a.SegundaSalida.Value.ToString(@"hh\:mm") : null,
                FotoUrl = a.FotoRuta != null ? $"http://localhost:5106/{a.FotoRuta}" : null
            }).ToList();

            return Ok(vista);
        }

        // [HttpGet("Hoy")]
        // public async Task<ActionResult<IEnumerable<VistaAsistencia>>> GetAsistenciaHoy()
        // {
        //     var hoy = DateTime.Today;

        //     var asistencias = await _context.Asistencia
        //         .Include(a => a.Empleado)
        //         .Include(a => a.Horario)
        //         .Where(a => a.Fecha.Date == hoy)
        //         .ToListAsync();

        //     var vista = asistencias.Select(a => new VistaAsistencia
        //     {
        //         Id = a.Id,
        //         EmpleadoString = a.Empleado != null ? a.Empleado.NombreCompleto : "Sin empleado",
        //         NroLegajo = a.Empleado != null ? a.Empleado.NroLegajo.ToString() : "-",
        //         TipoHorario = a.Horario != null ? a.Horario.TipoHorarioString : "CONTINUO",
        //         FechaString = a.Fecha.ToString("dd/MM/yyyy"),
        //         EstadoString = a.Estado.ToString(),
        //         PrimerEntradaString = a.PrimerEntrada.HasValue ? a.PrimerEntrada.Value.ToString(@"hh\:mm") : null,
        //         PrimerSalidaString = a.PrimerSalida.HasValue ? a.PrimerSalida.Value.ToString(@"hh\:mm") : null,
        //         SegundaEntradaString = a.SegundaEntrada.HasValue ? a.SegundaEntrada.Value.ToString(@"hh\:mm") : null,
        //         SegundaSalidaString = a.SegundaSalida.HasValue ? a.SegundaSalida.Value.ToString(@"hh\:mm") : null,
        //         FotoUrl = a.FotoRuta != null ? $"http://localhost:5106/{a.FotoRuta}" : null
        //     }).ToList();

        //     return Ok(vista);
        // }


        // [HttpGet("Semana")]
        // public async Task<ActionResult<IEnumerable<VistaAsistencia>>> GetAsistenciasSemana()
        // {
        //     var hoy = DateTime.Today;

        //     // Calcular lunes y domingo de la semana actual
        //     int diff = (7 + (hoy.DayOfWeek - DayOfWeek.Monday)) % 7;
        //     var lunes = hoy.AddDays(-1 * diff);
        //     var domingo = lunes.AddDays(6);

        //     // Traer todas las asistencias de la semana
        //     var asistencias = await _context.Asistencia
        //         .Include(a => a.Empleado)
        //         .Include(a => a.Horario)
        //         .Where(a => a.Fecha.Date >= lunes && a.Fecha.Date <= domingo)
        //         .ToListAsync();

        //     var empleados = asistencias.GroupBy(a => a.EmpleadoId);
        //     var vistaSemana = new List<VistaAsistencia>();

        //     foreach (var grupo in empleados)
        //     {
        //         var primeraAsistencia = grupo.FirstOrDefault();
        //         if (primeraAsistencia == null) continue;

        //         var empleado = primeraAsistencia.Empleado;

        //         // Calcular estado semanal
        //         EstadoAsistencia estadoSemana;
        //         var estadosDias = grupo.Select(a => a.Estado).ToList();

        //         if (estadosDias.All(e => e == EstadoAsistencia.COMPLETA))
        //             estadoSemana = EstadoAsistencia.COMPLETA;
        //         else if (estadosDias.All(e => e == EstadoAsistencia.TARDE))
        //             estadoSemana = EstadoAsistencia.TARDE;
        //         else if (estadosDias.All(e => e == EstadoAsistencia.AUSENTE))
        //             estadoSemana = EstadoAsistencia.AUSENTE;
        //         else if (estadosDias.Any(e => e == EstadoAsistencia.FUERADEHORARIO))
        //             estadoSemana = EstadoAsistencia.FUERADEHORARIO;
        //         else
        //             estadoSemana = EstadoAsistencia.INCOMPLETA;

        //         vistaSemana.Add(new VistaAsistencia
        //         {
        //             Id = primeraAsistencia.Id,
        //             EmpleadoString = empleado?.NombreCompleto ?? "Sin empleado",
        //             NroLegajo = empleado?.NroLegajo.ToString() ?? "-",
        //             TipoHorario = primeraAsistencia.Horario?.TipoHorarioString ?? "CONTINUO",
        //             FechaString = $"{lunes:dd/MM/yyyy} - {domingo:dd/MM/yyyy}",
        //             DiaSemana = "Semana",
        //             EstadoString = estadoSemana.ToString(),
        //             PrimerEntradaString = primeraAsistencia.PrimerEntrada?.ToString(@"hh\:mm"),
        //             PrimerSalidaString = primeraAsistencia.PrimerSalida?.ToString(@"hh\:mm"),
        //             SegundaEntradaString = primeraAsistencia.SegundaEntrada?.ToString(@"hh\:mm"),
        //             SegundaSalidaString = primeraAsistencia.SegundaSalida?.ToString(@"hh\:mm"),
        //             FotoUrl = primeraAsistencia.FotoRuta != null
        //                 ? $"http://localhost:5106/{primeraAsistencia.FotoRuta}"
        //                 : null
        //         });
        //     }

        //     return Ok(vistaSemana);
        // }


        // POST: metodo obtener y mostrar todas las asistencias por dia con filtros
        [HttpPost("FiltrarHoy")]
        public async Task<ActionResult<IEnumerable<VistaAsistencia>>> FiltrarAsistencia([FromBody] FiltrarAsistencia filtro)
        {
            var asistenciasFiltradosHoy = _context.Asistencia
                .Include(a => a.Empleado)
                .Include(a => a.Horario)
                .Where(a => a.Fecha.Date == DateTime.Today)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filtro.NombreCompleto))
            {
                asistenciasFiltradosHoy = asistenciasFiltradosHoy
                    .Where(e => e.Empleado.NombreCompleto.ToLower().Contains(filtro.NombreCompleto.ToLower()));
            }

            if (filtro.DNI.HasValue)
            {
                string dniFiltro = filtro.DNI.Value.ToString();
                asistenciasFiltradosHoy = asistenciasFiltradosHoy
                    .Where(e => e.Empleado.DNI.ToString().StartsWith(dniFiltro));
            }

            if (filtro.NroLegajo.HasValue)
            {
                string legajoFiltro = filtro.NroLegajo.Value.ToString();
                asistenciasFiltradosHoy = asistenciasFiltradosHoy
                    .Where(e => e.Empleado.NroLegajo.ToString().StartsWith(legajoFiltro));
            }

            if (filtro.EstadoAsistencia.HasValue)
            {
                asistenciasFiltradosHoy = asistenciasFiltradosHoy
                    .Where(e => (int)e.Estado == filtro.EstadoAsistencia.Value);
            }

            var listaFiltradaHoy = await asistenciasFiltradosHoy.ToListAsync();

            var vista = listaFiltradaHoy.Select(a => new VistaAsistencia
            {
                Id = a.Id,
                EmpleadoString = a.Empleado?.NombreCompleto ?? "Sin empleado",
                NroLegajo = a.Empleado?.NroLegajo.ToString() ?? "-",
                TipoHorario = a.Horario?.TipoHorarioString ?? "CONTINUO",
                FechaString = a.Fecha.ToString("dd/MM/yyyy"),
                EstadoString = a.Estado.ToString(),
                PrimerEntradaString = a.PrimerEntrada?.ToString(@"hh\:mm"),
                PrimerSalidaString = a.PrimerSalida?.ToString(@"hh\:mm"),
                SegundaEntradaString = a.SegundaEntrada?.ToString(@"hh\:mm"),
                SegundaSalidaString = a.SegundaSalida?.ToString(@"hh\:mm"),
                FotoUrl = a.FotoRuta != null ? $"http://localhost:5106/{a.FotoRuta}" : null
            }).ToList();

            return Ok(vista);
        }


        // POST: para obtener y mostrar la asitencia de la semana con filtros
        [HttpPost("FiltrarSemana")]
        public async Task<ActionResult<IEnumerable<VistaAsistencia>>> FiltrarAsistenciaSemana([FromBody] FiltrarAsistencia filtro)
        {
            var hoy = DateTime.Today;

            // Calcular lunes y domingo de la semana actual
            int diff = (7 + (hoy.DayOfWeek - DayOfWeek.Monday)) % 7;
            var lunes = hoy.AddDays(-1 * diff);
            var domingo = lunes.AddDays(6);

            // Traer asistencias de la semana
            var asistenciasFiltradas = _context.Asistencia
                .Include(a => a.Empleado)
                .Include(a => a.Horario)
                .Where(a => a.Fecha.Date >= lunes && a.Fecha.Date <= domingo)
                .AsQueryable();

           if (!string.IsNullOrEmpty(filtro.NombreCompleto))
            {
                asistenciasFiltradas = asistenciasFiltradas
                    .Where(e => e.Empleado.NombreCompleto.ToLower().Contains(filtro.NombreCompleto.ToLower()));
            }

            if (filtro.DNI.HasValue)
            {
                string dniFiltro = filtro.DNI.Value.ToString();
                asistenciasFiltradas = asistenciasFiltradas
                    .Where(e => e.Empleado.DNI.ToString().StartsWith(dniFiltro));
            }

            if (filtro.NroLegajo.HasValue)
            {
                string legajoFiltro = filtro.NroLegajo.Value.ToString();
                asistenciasFiltradas = asistenciasFiltradas
                    .Where(e => e.Empleado.NroLegajo.ToString().StartsWith(legajoFiltro));
            }

            if (filtro.EstadoAsistencia.HasValue)
            {
                asistenciasFiltradas = asistenciasFiltradas
                    .Where(e => (int)e.Estado == filtro.EstadoAsistencia.Value);
            }
            var listaSemana = await asistenciasFiltradas.ToListAsync();

            // Agrupar por empleado para calcular estado semanal
            var empleados = listaSemana.GroupBy(a => a.EmpleadoId);
            var vistaSemana = new List<VistaAsistencia>();

           foreach (var grupo in empleados)
            {
                var primeraAsistencia = grupo.FirstOrDefault();
                if (primeraAsistencia == null) continue;

                var empleado = primeraAsistencia.Empleado;

                // Calcular estado semanal
                EstadoAsistencia estadoSemana;
                var estadosDias = grupo.Select(a => a.Estado).ToList();

                if (estadosDias.All(e => e == EstadoAsistencia.COMPLETA))
                    estadoSemana = EstadoAsistencia.COMPLETA;
                else if (estadosDias.All(e => e == EstadoAsistencia.TARDE))
                    estadoSemana = EstadoAsistencia.TARDE;
                else if (estadosDias.All(e => e == EstadoAsistencia.AUSENTE))
                    estadoSemana = EstadoAsistencia.AUSENTE;
                else if (estadosDias.Any(e => e == EstadoAsistencia.FUERADEHORARIO))
                    estadoSemana = EstadoAsistencia.FUERADEHORARIO;
                else
                    estadoSemana = EstadoAsistencia.INCOMPLETA;

                vistaSemana.Add(new VistaAsistencia
                {
                    Id = primeraAsistencia.Id,
                    EmpleadoString = empleado?.NombreCompleto ?? "Sin empleado",
                    NroLegajo = empleado?.NroLegajo.ToString() ?? "-",
                    TipoHorario = primeraAsistencia.Horario?.TipoHorarioString ?? "CONTINUO",
                    FechaString = $"{lunes:dd/MM/yyyy} - {domingo:dd/MM/yyyy}",
                    DiaSemana = "Semana",
                    EstadoString = estadoSemana.ToString(),
                    PrimerEntradaString = primeraAsistencia.PrimerEntrada?.ToString(@"hh\:mm"),
                    PrimerSalidaString = primeraAsistencia.PrimerSalida?.ToString(@"hh\:mm"),
                    SegundaEntradaString = primeraAsistencia.SegundaEntrada?.ToString(@"hh\:mm"),
                    SegundaSalidaString = primeraAsistencia.SegundaSalida?.ToString(@"hh\:mm"),
                    FotoUrl = primeraAsistencia.FotoRuta != null
                        ? $"http://localhost:5106/{primeraAsistencia.FotoRuta}"
                        : null
                });
        

            }

            return Ok(vistaSemana);
        }








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
            var result = await _asistenciaService.FicharAsync(dto);
            if (!result.ok) return BadRequest(result.payload);
            return Ok(result.payload);
        }
    }
}
