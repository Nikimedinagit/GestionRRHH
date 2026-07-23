using System.Security.Claims;
using System.Text.Json;
using GestionRRHH.Models.General;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionRRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HorasExtrasController : ControllerBase
    {
        private const int ToleranciaMinutos = 15;
        private readonly Context _context;

        private class SemanaRotativaDto
        {
            public int Semana { get; set; }
            public int TipoHorario { get; set; }
            public string HorarioInicio { get; set; }
            public string HorarioFin { get; set; }
            public string SegundoHorarioInicio { get; set; }
            public string SegundoHorarioFin { get; set; }
        }

        public HorasExtrasController(Context context)
        {
            _context = context;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA FILTRAR LAS HORAS EXTRAS //////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost("Filtrar")]
        public async Task<IActionResult> Filtrar([FromBody] HoraExtraFiltrar filtro)
        {
            var query = _context.HoraExtraEmpleado
                .AsNoTracking()
                .Include(h => h.Empleado)
                .Where(h => h.Empleado != null && !h.Empleado.Eliminado);

            if (!string.IsNullOrWhiteSpace(filtro?.Empleado))
            {
                var empleado = filtro.Empleado.Trim().ToLower();
                query = query.Where(h => h.Empleado.NombreCompleto.ToLower().Contains(empleado));
            }
            if (filtro?.Desde != null) query = query.Where(h => h.Fecha >= filtro.Desde.Value.Date);
            if (filtro?.Hasta != null) query = query.Where(h => h.Fecha < filtro.Hasta.Value.Date.AddDays(1));
            if (filtro?.Estado != null) query = query.Where(h => (int)h.Estado == filtro.Estado.Value);
            if (filtro?.Origen != null) query = query.Where(h => (int)h.Origen == filtro.Origen.Value);

            return Ok(await Proyectar(query).ToListAsync());
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA REGISTRAR HORAS EXTRAS MANUALMENTE ////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost]
        public async Task<IActionResult> PostHoraExtra([FromBody] HoraExtraManualDto dto)
        {
            var validacion = await ValidarManual(dto);
            if (validacion != null) return BadRequest(validacion);

            TimeSpan.TryParse(dto.HoraInicio, out var inicio);
            TimeSpan.TryParse(dto.HoraFin, out var fin);
            var minutos = CalcularMinutos(inicio, fin);

            var horaExtra = new HoraExtraEmpleado
            {
                EmpleadoId = dto.EmpleadoId,
                Fecha = dto.Fecha.Date,
                HoraInicio = inicio,
                HoraFin = fin,
                Minutos = minutos,
                Origen = OrigenHoraExtra.MANUAL,
                Estado = EstadoHoraExtra.PENDIENTE,
                Motivo = dto.Motivo.Trim().ToUpperInvariant(),
                Observaciones = dto.Observaciones?.Trim().ToUpperInvariant(),
                FechaRegistro = DateTime.Now
            };

            _context.HoraExtraEmpleado.Add(horaExtra);
            AgregarNotificacionHoraExtra(
                horaExtra,
                "Nueva Hora Extra",
                $"Se registró una hora extra para el día {horaExtra.Fecha:dd/MM/yyyy}, de {horaExtra.HoraInicio:hh\\:mm} a {horaExtra.HoraFin:hh\\:mm}.");
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Hora extra creada correctamente." });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UNA HORA EXTRA MANUAL ///////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutHoraExtra(int id, [FromBody] HoraExtraManualDto dto)
        {
            var horaExtra = await _context.HoraExtraEmpleado.FindAsync(id);
            if (horaExtra == null) return NotFound(new { mensaje = "La hora extra no existe." });
            if (horaExtra.Origen != OrigenHoraExtra.MANUAL)
                return BadRequest(new { campo = "general", mensaje = "Las horas automáticas no se editan manualmente." });
            if (horaExtra.Estado != EstadoHoraExtra.PENDIENTE)
                return BadRequest(new { campo = "general", mensaje = "Solo se pueden editar horas pendientes." });

            var validacion = await ValidarManual(dto, id);
            if (validacion != null) return BadRequest(validacion);

            TimeSpan.TryParse(dto.HoraInicio, out var inicio);
            TimeSpan.TryParse(dto.HoraFin, out var fin);
            horaExtra.EmpleadoId = dto.EmpleadoId;
            horaExtra.Fecha = dto.Fecha.Date;
            horaExtra.HoraInicio = inicio;
            horaExtra.HoraFin = fin;
            horaExtra.Minutos = CalcularMinutos(inicio, fin);
            horaExtra.Motivo = dto.Motivo.Trim().ToUpperInvariant();
            horaExtra.Observaciones = dto.Observaciones?.Trim().ToUpperInvariant();
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Hora extra modificada correctamente." });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CALCULAR HORAS EXTRAS DESDE LAS ASISTENCIAS //////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost("CalcularAutomatico")]
        public async Task<IActionResult> CalcularAutomatico([FromBody] CalcularHorasExtrasDto dto)
        {
            if (dto == null || dto.Desde == default || dto.Hasta == default || dto.Hasta.Date < dto.Desde.Date)
                return BadRequest(new { mensaje = "El rango de fechas no es válido." });

            var desde = dto.Desde.Date;
            var hasta = dto.Hasta.Date.AddDays(1);
            var asistencias = await _context.Asistencia
                .AsNoTracking()
                .Include(a => a.Horario)
                .Where(a => a.Fecha >= desde && a.Fecha < hasta)
                .ToListAsync();

            var asistenciaIds = asistencias.Select(a => a.Id).ToList();
            var yaGeneradas = await _context.HoraExtraEmpleado
                .Where(h => h.AsistenciaId.HasValue && asistenciaIds.Contains(h.AsistenciaId.Value))
                .Select(h => h.AsistenciaId.Value)
                .ToListAsync();

            var horariosPorEmpleado = await _context.Horario.AsNoTracking().ToListAsync();
            var nuevas = new List<HoraExtraEmpleado>();

            foreach (var asistencia in asistencias.Where(a => !yaGeneradas.Contains(a.Id)))
            {
                var horario = asistencia.Horario ??
                    horariosPorEmpleado.FirstOrDefault(h => h.EmpleadoId == asistencia.EmpleadoId && DiaHabilitado(h, asistencia.Fecha.DayOfWeek));
                if (horario == null) continue;

                AplicarRotacion(horario, asistencia.Fecha);
                var esAlterno = horario.TipoHorario == TipoHorario.ALTERNO;
                var salida = esAlterno ? asistencia.SegundaSalida : asistencia.PrimerSalida;
                var finProgramado = esAlterno ? horario.SegundoHorarioFin : horario.HorarioFin;
                if (!salida.HasValue) continue;

                var minutosExtras = CalcularDiferenciaSalida(finProgramado, salida.Value);
                if (minutosExtras <= ToleranciaMinutos) continue;

                nuevas.Add(new HoraExtraEmpleado
                {
                    EmpleadoId = asistencia.EmpleadoId,
                    AsistenciaId = asistencia.Id,
                    Fecha = asistencia.Fecha.Date,
                    HoraInicio = finProgramado,
                    HoraFin = salida.Value,
                    Minutos = minutosExtras,
                    Origen = OrigenHoraExtra.AUTOMATICO,
                    Estado = EstadoHoraExtra.PENDIENTE,
                    Motivo = "EXCESO SOBRE EL HORARIO PROGRAMADO",
                    FechaRegistro = DateTime.Now
                });
            }

            _context.HoraExtraEmpleado.AddRange(nuevas);
            foreach (var horaExtra in nuevas)
            {
                AgregarNotificacionHoraExtra(
                    horaExtra,
                    "Nueva Hora Extra",
                    $"Se generó una hora extra para el día {horaExtra.Fecha:dd/MM/yyyy}, de {horaExtra.HoraInicio:hh\\:mm} a {horaExtra.HoraFin:hh\\:mm}.");
            }
            await _context.SaveChangesAsync();
            return Ok(new { cantidad = nuevas.Count, mensaje = $"Se generaron {nuevas.Count} horas extras pendientes." });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA APROBAR, RECHAZAR O ANULAR ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPut("{id:int}/Estado/{estado:int}")]
        public async Task<IActionResult> CambiarEstado(int id, int estado)
        {
            var horaExtra = await _context.HoraExtraEmpleado.FindAsync(id);
            if (horaExtra == null) return NotFound();
            if (!Enum.IsDefined(typeof(EstadoHoraExtra), estado))
                return BadRequest(new { mensaje = "El estado no es válido." });

            horaExtra.Estado = (EstadoHoraExtra)estado;

            var estadoNotificacion = horaExtra.Estado switch
            {
                EstadoHoraExtra.APROBADA => ("Hora Extra Aprobada", $"Tu hora extra del día {horaExtra.Fecha:dd/MM/yyyy} fue aprobada."),
                EstadoHoraExtra.RECHAZADA => ("Hora Extra Rechazada", $"Tu hora extra del día {horaExtra.Fecha:dd/MM/yyyy} fue rechazada."),
                EstadoHoraExtra.ANULADA => ("Hora Extra Anulada", $"Tu hora extra del día {horaExtra.Fecha:dd/MM/yyyy} fue anulada."),
                _ => (null, null)
            };

            if (estadoNotificacion.Item1 != null)
                AgregarNotificacionHoraExtra(horaExtra, estadoNotificacion.Item1, estadoNotificacion.Item2);

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = $"Hora extra {horaExtra.Estado.ToString().ToLower()} correctamente." });
        }

        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteHoraExtra(int id)
        {
            var horaExtra = await _context.HoraExtraEmpleado.FindAsync(id);
            if (horaExtra == null) return NotFound();
            _context.HoraExtraEmpleado.Remove(horaExtra);
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Hora extra eliminada correctamente." });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CONSULTAR LAS HORAS EXTRAS DEL USUARIO ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "EMPLEADO, SUPERVISOR")]
        [HttpGet("MisHorasExtras")]
        public async Task<IActionResult> MisHorasExtras([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = await _context.Users.Where(u => u.Id == userId).Select(u => u.Email).FirstOrDefaultAsync();
            if (string.IsNullOrWhiteSpace(email)) return Ok(Array.Empty<object>());

            var query = _context.HoraExtraEmpleado.AsNoTracking().Include(h => h.Empleado)
                .Where(h => h.Empleado.Email != null && h.Empleado.Email.ToLower() == email.ToLower());
            if (desde.HasValue) query = query.Where(h => h.Fecha >= desde.Value.Date);
            if (hasta.HasValue) query = query.Where(h => h.Fecha < hasta.Value.Date.AddDays(1));
            return Ok(await Proyectar(query).ToListAsync());
        }

        private IQueryable<object> Proyectar(IQueryable<HoraExtraEmpleado> query)
        {
            return query.OrderByDescending(h => h.Fecha).ThenByDescending(h => h.Id).Select(h => new
            {
                h.Id, h.EmpleadoId, EmpleadoString = h.Empleado.NombreCompleto,
                h.Fecha, h.HoraInicio, h.HoraFin, h.Minutos,
                HorasString = $"{h.Minutos / 60:00}:{h.Minutos % 60:00}",
                Origen = h.Origen.ToString(), Estado = h.Estado.ToString(),
                h.Motivo, h.Observaciones, h.AsistenciaId
            });
        }

        private async Task<object> ValidarManual(HoraExtraManualDto dto, int idExcluir = 0)
        {
            if (dto == null || !await _context.Empleado.AnyAsync(e => e.Id == dto.EmpleadoId && !e.Eliminado))
                return new { campo = "empleado", mensaje = "Seleccione un empleado válido." };
            if (dto.Fecha == default) return new { campo = "fecha", mensaje = "Ingrese la fecha." };
            if (!TimeSpan.TryParse(dto.HoraInicio, out var inicio) || !TimeSpan.TryParse(dto.HoraFin, out var fin) || inicio == fin)
                return new { campo = "horario", mensaje = "Ingrese un horario válido." };
            if (string.IsNullOrWhiteSpace(dto.Motivo))
                return new { campo = "motivo", mensaje = "Ingrese el motivo." };

            var existe = await _context.HoraExtraEmpleado.AnyAsync(h =>
                h.Id != idExcluir && h.EmpleadoId == dto.EmpleadoId && h.Fecha.Date == dto.Fecha.Date &&
                h.HoraInicio == inicio && h.HoraFin == fin);
            if (existe) return new { campo = "empleado", mensaje = "Esta hora extra ya se encuentra registrada." };
            return null;
        }

        private void AgregarNotificacionHoraExtra(HoraExtraEmpleado horaExtra, string titulo, string mensaje)
        {
            _context.Notificaciones.Add(new Notificaciones
            {
                Titulo = titulo,
                Mensaje = mensaje,
                FechaCreacion = DateTime.Now,
                UsuarioId = horaExtra.EmpleadoId.ToString(),
                DestinatarioRol = "EMPLEADO,SUPERVISOR",
                Leida = false
            });
        }

        private static int CalcularMinutos(TimeSpan inicio, TimeSpan fin)
        {
            var diferencia = fin - inicio;
            if (diferencia <= TimeSpan.Zero) diferencia = diferencia.Add(TimeSpan.FromDays(1));
            return (int)diferencia.TotalMinutes;
        }

        private static int CalcularDiferenciaSalida(TimeSpan programada, TimeSpan real)
        {
            var diferencia = real - programada;
            if (diferencia < TimeSpan.FromHours(-12)) diferencia = diferencia.Add(TimeSpan.FromDays(1));
            return Math.Max(0, (int)diferencia.TotalMinutes);
        }

        private static bool DiaHabilitado(Horario h, DayOfWeek dia) => dia switch
        {
            DayOfWeek.Monday => h.Lunes, DayOfWeek.Tuesday => h.Martes,
            DayOfWeek.Wednesday => h.Miercoles, DayOfWeek.Thursday => h.Jueves,
            DayOfWeek.Friday => h.Viernes, DayOfWeek.Saturday => h.Sabado,
            DayOfWeek.Sunday => h.Domingo, _ => false
        };

        private static void AplicarRotacion(Horario horario, DateTime fecha)
        {
            if ((horario.TipoHorario != TipoHorario.ROTATIVO && !horario.EsRotativo) || !horario.FechaInicioRotacion.HasValue)
                return;
            try
            {
                var semanas = JsonSerializer.Deserialize<List<SemanaRotativaDto>>(horario.RotacionSemanasJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true })?.OrderBy(s => s.Semana).ToList();
                if (semanas == null || semanas.Count == 0) return;
                var dias = Math.Max(0, (fecha.Date - horario.FechaInicioRotacion.Value.Date).Days);
                var semana = semanas[(dias / 7) % semanas.Count];
                horario.TipoHorario = (TipoHorario)semana.TipoHorario;
                if (TimeSpan.TryParse(semana.HorarioFin, out var fin)) horario.HorarioFin = fin;
                if (TimeSpan.TryParse(semana.SegundoHorarioFin, out var segundoFin)) horario.SegundoHorarioFin = segundoFin;
            }
            catch { }
        }
    }
}
