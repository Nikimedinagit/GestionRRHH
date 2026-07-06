using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using GestionRRHH.Models.Dto;
using GestionRRHH.Services;
using GestionRRHH.Models.General;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace GestionRRHH.Controllers
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

        public class AsistenciaManualDto
        {
            public int EmpleadoId { get; set; }
            public DateTime Fecha { get; set; }
            public string TipoMarcacion { get; set; }
            public string Hora { get; set; }
        }

        private class SemanaRotativaDto
        {
            public int Semana { get; set; }
            public string Turno { get; set; }
            public int TipoHorario { get; set; }
            public string HorarioInicio { get; set; }
            public string HorarioFin { get; set; }
            public string SegundoHorarioInicio { get; set; }
            public string SegundoHorarioFin { get; set; }
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

        [HttpPost("FiltrarCalendario")]
        public async Task<ActionResult<IEnumerable<VistaAsistencia>>> FiltrarAsistenciaCalendario([FromBody] FiltrarAsistenciaCalendario filtro)
        {
            var fechaInicio = filtro.FechaInicio.Date;
            var fechaFin = filtro.FechaFin.Date.AddDays(1);

            var obtenerAsistencias = _context.Asistencia
                .Include(a => a.Empleado)
                .Include(a => a.Horario)
                .Where(a =>
                    a.Fecha >= fechaInicio &&
                    a.Fecha < fechaFin &&
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
                .OrderBy(a => a.Fecha)
                .ThenBy(a => a.Empleado.NombreCompleto)
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
        /// METODO PARA REGISTRAR MANUALMENTE UNA ASISTENCIA /////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("Manual")]
        public async Task<IActionResult> RegistrarManual([FromBody] AsistenciaManualDto dto)
        {
            if (dto == null)
                return BadRequest(new { mensaje = "Los datos de asistencia son obligatorios." });

            var marcacionesValidas = new[] { "PrimerEntrada", "PrimerSalida", "SegundaEntrada", "SegundaSalida" };
            if (!marcacionesValidas.Contains(dto.TipoMarcacion))
                return BadRequest(new { mensaje = "La marcación seleccionada no es válida." });

            var horaMarcacion = ParseHora(dto.Hora);
            if (!horaMarcacion.HasValue)
                return BadRequest(new { mensaje = "La hora ingresada no es válida." });

            var empleadoExiste = await _context.Empleado
                .AnyAsync(e => e.Id == dto.EmpleadoId && !e.Eliminado);

            if (!empleadoExiste)
                return BadRequest(new { mensaje = "El empleado seleccionado no existe o está eliminado." });

            var fecha = dto.Fecha.Date;
            var fechaSiguiente = fecha.AddDays(1);

            var horarios = await _context.Horario
                .AsNoTracking()
                .Where(h => h.EmpleadoId == dto.EmpleadoId)
                .ToListAsync();

            var horario = horarios.FirstOrDefault(h => DiaHabilitado(h, fecha.DayOfWeek))
                ?? horarios.FirstOrDefault();

            if (horario == null)
                return BadRequest(new { mensaje = "El empleado no tiene horario asignado." });

            AplicarHorarioRotativoDelDia(horario, fecha);

            var asistencia = await _context.Asistencia
                .FirstOrDefaultAsync(a =>
                    a.EmpleadoId == dto.EmpleadoId &&
                    a.Fecha >= fecha &&
                    a.Fecha < fechaSiguiente);

            if (asistencia == null)
            {
                asistencia = new Asistencia
                {
                    EmpleadoId = dto.EmpleadoId,
                    Fecha = fecha,
                    Estado = EstadoAsistencia.INCOMPLETA,
                    FotoRuta = null
                };
                _context.Asistencia.Add(asistencia);
            }

            asistencia.HorarioId = horario?.Id;

            switch (dto.TipoMarcacion)
            {
                case "PrimerEntrada":
                    asistencia.PrimerEntrada = horaMarcacion.Value;
                    break;
                case "PrimerSalida":
                    asistencia.PrimerSalida = horaMarcacion.Value;
                    break;
                case "SegundaEntrada":
                    asistencia.SegundaEntrada = horaMarcacion.Value;
                    break;
                case "SegundaSalida":
                    asistencia.SegundaSalida = horaMarcacion.Value;
                    break;
            }

            asistencia.Estado = CalcularEstadoAutomatico(asistencia, horario, dto.TipoMarcacion, horaMarcacion.Value);

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Asistencia registrada correctamente." });
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


        private static TimeSpan? ParseHora(string hora)
        {
            if (string.IsNullOrWhiteSpace(hora)) return null;
            return TimeSpan.TryParse(hora, out var horaParseada) ? horaParseada : null;
        }

        private static bool DiaHabilitado(Horario horario, DayOfWeek dia)
        {
            return dia switch
            {
                DayOfWeek.Monday => horario.Lunes,
                DayOfWeek.Tuesday => horario.Martes,
                DayOfWeek.Wednesday => horario.Miercoles,
                DayOfWeek.Thursday => horario.Jueves,
                DayOfWeek.Friday => horario.Viernes,
                DayOfWeek.Saturday => horario.Sabado,
                DayOfWeek.Sunday => horario.Domingo,
                _ => false
            };
        }

        private static EstadoAsistencia CalcularEstadoAutomatico(Asistencia asistencia, Horario horario, string tipoMarcacion, TimeSpan hora)
        {
            var tolerancia = TimeSpan.FromMinutes(15);
            var esperado = HoraEsperada(tipoMarcacion, horario);
            var fuera = false;
            var tarde = false;

            if (tipoMarcacion.Contains("Entrada"))
            {
                if (hora < esperado - tolerancia) fuera = true;
                if (hora > esperado + tolerancia) tarde = true;
            }
            else
            {
                if (hora < esperado - tolerancia) fuera = true;
            }

            if (fuera) return EstadoAsistencia.FUERADEHORARIO;
            if (tarde && tipoMarcacion.Contains("Entrada")) return EstadoAsistencia.TARDE;

            return CompletaSegunTipo(asistencia, horario)
                ? EstadoAsistencia.COMPLETA
                : EstadoAsistencia.INCOMPLETA;
        }

        private static bool CompletaSegunTipo(Asistencia asistencia, Horario horario)
        {
            if (horario.TipoHorario == TipoHorario.CONTINUO)
                return asistencia.PrimerEntrada.HasValue && asistencia.PrimerSalida.HasValue;

            return asistencia.PrimerEntrada.HasValue &&
                asistencia.PrimerSalida.HasValue &&
                asistencia.SegundaEntrada.HasValue &&
                asistencia.SegundaSalida.HasValue;
        }

        private static TimeSpan HoraEsperada(string tipoMarcacion, Horario horario)
        {
            return tipoMarcacion switch
            {
                "PrimerEntrada" => horario.HorarioInicio,
                "PrimerSalida" => horario.HorarioFin,
                "SegundaEntrada" => horario.SegundoHorarioInicio,
                "SegundaSalida" => horario.SegundoHorarioFin,
                _ => TimeSpan.Zero
            };
        }

        private static void AplicarHorarioRotativoDelDia(Horario horario, DateTime fecha)
        {
            if ((horario.TipoHorario != TipoHorario.ROTATIVO && !horario.EsRotativo) || !horario.FechaInicioRotacion.HasValue)
                return;

            var semanas = ObtenerSemanasRotativas(horario.RotacionSemanasJson);
            if (!semanas.Any()) return;

            var diasDesdeInicio = Math.Max(0, (fecha.Date - horario.FechaInicioRotacion.Value.Date).Days);
            var indiceSemana = (diasDesdeInicio / 7) % semanas.Count;
            var semanaActiva = semanas.OrderBy(s => s.Semana).ElementAt(indiceSemana);

            if (!TimeSpan.TryParse(semanaActiva.HorarioInicio, out var horarioInicio) ||
                !TimeSpan.TryParse(semanaActiva.HorarioFin, out var horarioFin))
                return;

            horario.TipoHorario = (TipoHorario)semanaActiva.TipoHorario;
            horario.HorarioInicio = horarioInicio;
            horario.HorarioFin = horarioFin;

            if (horario.TipoHorario == TipoHorario.ALTERNO &&
                TimeSpan.TryParse(semanaActiva.SegundoHorarioInicio, out var segundoInicio) &&
                TimeSpan.TryParse(semanaActiva.SegundoHorarioFin, out var segundoFin))
            {
                horario.SegundoHorarioInicio = segundoInicio;
                horario.SegundoHorarioFin = segundoFin;
            }
            else
            {
                horario.SegundoHorarioInicio = TimeSpan.Zero;
                horario.SegundoHorarioFin = TimeSpan.Zero;
            }
        }

        private static List<SemanaRotativaDto> ObtenerSemanasRotativas(string rotacionSemanasJson)
        {
            if (string.IsNullOrWhiteSpace(rotacionSemanasJson))
                return new List<SemanaRotativaDto>();

            try
            {
                return JsonSerializer.Deserialize<List<SemanaRotativaDto>>(
                    rotacionSemanasJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                ) ?? new List<SemanaRotativaDto>();
            }
            catch
            {
                return new List<SemanaRotativaDto>();
            }
        }




    }
}
