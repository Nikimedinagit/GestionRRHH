using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionRRHH.Models.General;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;

namespace GestionRRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HorariosController : ControllerBase
    {
        private readonly Context _context;

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

        public HorariosController(Context context)
        {
            _context = context;
        }

        private static bool TieneSegundoTramo(TipoHorario tipoHorario)
        {
            return tipoHorario == TipoHorario.ALTERNO;
        }

        private static bool EsHorarioRotativo(Horario horario)
        {
            return horario.TipoHorario == TipoHorario.ROTATIVO || horario.EsRotativo;
        }

        private static List<SemanaRotativaDto> ObtenerRotacionSemanas(string rotacionSemanasJson)
        {
            if (string.IsNullOrWhiteSpace(rotacionSemanasJson))
                return new List<SemanaRotativaDto>();

            return JsonSerializer.Deserialize<List<SemanaRotativaDto>>(
                rotacionSemanasJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? new List<SemanaRotativaDto>();
        }

        private static bool ValidarRotacion(Horario horario, out string mensaje)
        {
            mensaje = string.Empty;

            var esRotativo = EsHorarioRotativo(horario);
            horario.EsRotativo = esRotativo;

            if (!esRotativo)
            {
                horario.FechaInicioRotacion = null;
                horario.RotacionSemanasJson = "[]";
                return true;
            }

            if (!horario.FechaInicioRotacion.HasValue)
            {
                mensaje = "Debe indicar la fecha de inicio de la rotación.";
                return false;
            }

            List<SemanaRotativaDto> semanas;
            try
            {
                semanas = ObtenerRotacionSemanas(horario.RotacionSemanasJson);
            }
            catch
            {
                mensaje = "La configuración rotativa no es válida.";
                return false;
            }

            if (!semanas.Any())
            {
                mensaje = "Debe configurar al menos una semana rotativa.";
                return false;
            }

            foreach (var semana in semanas)
            {
                var turnosPermitidos = new[] { "MAÑANA", "TARDE", "NOCHE" };

                if (semana.Semana <= 0)
                {
                    mensaje = "Las semanas rotativas deben estar numeradas.";
                    return false;
                }

                semana.Turno = (semana.Turno ?? string.Empty).Trim().ToUpperInvariant();

                if (string.IsNullOrWhiteSpace(semana.Turno) || !turnosPermitidos.Contains(semana.Turno))
                {
                    mensaje = "Cada semana rotativa debe indicar un turno válido.";
                    return false;
                }

                if (semana.TipoHorario != (int)TipoHorario.CONTINUO && semana.TipoHorario != (int)TipoHorario.ALTERNO)
                {
                    mensaje = "Cada semana rotativa debe ser continua o alterna.";
                    return false;
                }

                if (!TimeSpan.TryParse(semana.HorarioInicio, out var inicio) ||
                    !TimeSpan.TryParse(semana.HorarioFin, out var fin) ||
                    inicio == fin)
                {
                    mensaje = "Cada semana rotativa debe tener inicio y fin válidos.";
                    return false;
                }

                if (semana.TipoHorario == (int)TipoHorario.ALTERNO)
                {
                    if (!TimeSpan.TryParse(semana.SegundoHorarioInicio, out var segundoInicio) ||
                        !TimeSpan.TryParse(semana.SegundoHorarioFin, out var segundoFin) ||
                        segundoInicio == segundoFin)
                    {
                        mensaje = "Cada semana alterna debe tener ambos tramos completos.";
                        return false;
                    }
                }
            }

            var semanasOrdenadas = semanas.OrderBy(s => s.Semana).ToList();
            var primeraSemana = semanasOrdenadas.First();

            if (TimeSpan.TryParse(primeraSemana.HorarioInicio, out var horarioInicio))
                horario.HorarioInicio = horarioInicio;

            if (TimeSpan.TryParse(primeraSemana.HorarioFin, out var horarioFin))
                horario.HorarioFin = horarioFin;

            if (primeraSemana.TipoHorario == (int)TipoHorario.ALTERNO)
            {
                if (TimeSpan.TryParse(primeraSemana.SegundoHorarioInicio, out var segundoHorarioInicio))
                    horario.SegundoHorarioInicio = segundoHorarioInicio;

                if (TimeSpan.TryParse(primeraSemana.SegundoHorarioFin, out var segundoHorarioFin))
                    horario.SegundoHorarioFin = segundoHorarioFin;
            }
            else
            {
                horario.SegundoHorarioInicio = TimeSpan.Zero;
                horario.SegundoHorarioFin = TimeSpan.Zero;
            }

            horario.RotacionSemanasJson = JsonSerializer.Serialize(
                semanasOrdenadas,
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }
            );
            return true;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS DATOS DEL HORARIO SEGUN SUS FILTROS //////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaHorario>>> FiltrarHorario([FromBody] FiltrarHorario filtro)
        {
            var obtenerHorarios = _context.Horario
                .Where(h => h.Empleado != null && !h.Empleado.Eliminado)
                .AsQueryable();

            if (filtro.TipoHorario.HasValue)
            {
                if (filtro.TipoHorario.Value == (int)TipoHorario.ROTATIVO)
                    obtenerHorarios = obtenerHorarios.Where(h => h.TipoHorario == TipoHorario.ROTATIVO || h.EsRotativo);
                else
                    obtenerHorarios = obtenerHorarios.Where(h => (int)h.TipoHorario == filtro.TipoHorario.Value && !h.EsRotativo);
            }

            if (filtro.EsRotativo.HasValue)
            {
                bool esRotativo = filtro.EsRotativo.Value == 1;
                obtenerHorarios = obtenerHorarios.Where(h => h.EsRotativo == esRotativo);
            }

            if (!string.IsNullOrEmpty(filtro.HorarioInicio) && TimeSpan.TryParse(filtro.HorarioInicio, out var horarioInicioTs))
                obtenerHorarios = obtenerHorarios.Where(h => h.HorarioInicio >= horarioInicioTs);

            if (!string.IsNullOrEmpty(filtro.HorarioFin) && TimeSpan.TryParse(filtro.HorarioFin, out var horarioFinTs))
                obtenerHorarios = obtenerHorarios.Where(h => h.HorarioFin <= horarioFinTs);

            if (!string.IsNullOrEmpty(filtro.EmpleadoTexto))
            {
                var texto = filtro.EmpleadoTexto.ToLower();
                obtenerHorarios = obtenerHorarios.Where(h => h.Empleado.NombreCompleto.ToLower().Contains(texto));
            }

            var vista = await obtenerHorarios
                .OrderBy(h => h.Empleado.NombreCompleto)
                .ThenBy(h => h.HorarioInicio)
                .Select(h => new VistaHorario
                {
                    Id = h.Id,
                    HorarioInicioString = h.HorarioInicioString,
                    HorarioFinString = h.HorarioFinString,
                    SegundoHorarioInicioString = h.SegundoHorarioInicioString,
                    SegundoHorarioFinString = h.SegundoHorarioFinString,
                    TipoHorario = h.EsRotativo ? TipoHorario.ROTATIVO : h.TipoHorario,
                    TipoHorarioString = h.EsRotativo ? TipoHorario.ROTATIVO.ToString() : h.TipoHorarioString,
                    EsRotativo = h.EsRotativo,
                    FechaInicioRotacion = h.FechaInicioRotacion,
                    RotacionSemanasJson = h.RotacionSemanasJson,
                    Lunes = h.Lunes,
                    Martes = h.Martes,
                    Miercoles = h.Miercoles,
                    Jueves = h.Jueves,
                    Viernes = h.Viernes,
                    Sabado = h.Sabado,
                    Domingo = h.Domingo,
                    EmpleadoString = h.Empleado.NombreCompleto,
                    EmpleadoId = h.EmpleadoId,
                    PuestoEmpleado = h.Empleado.Puesto != null ? h.Empleado.Puesto.Descripcion : "Sin puesto"
                })
                .ToListAsync();

            return Ok(vista);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UN HORARIO POR ID ///////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("{id}")]
        public async Task<ActionResult> GetHorario(int id)
        {
            var horario = await _context.Horario
                .Include(h => h.Empleado)
                .Where(h => h.Id == id)
                .Select(h => new
                {
                    h.Id,
                    HorarioInicio = h.HorarioInicio.ToString(@"hh\:mm"),
                    HorarioFin = h.HorarioFin.ToString(@"hh\:mm"),
                    h.TipoHorario,
                    TipoHorarioString = h.TipoHorario.ToString(),
                    h.EsRotativo,
                    FechaInicioRotacion = h.FechaInicioRotacion.HasValue ? h.FechaInicioRotacion.Value.ToString("yyyy-MM-dd") : null,
                    h.RotacionSemanasJson,
                    h.Lunes,
                    h.Martes,
                    h.Miercoles,
                    h.Jueves,
                    h.Viernes,
                    h.Sabado,
                    h.Domingo,
                    SegundoHorarioInicio = h.SegundoHorarioInicio.ToString(@"hh\:mm"),
                    SegundoHorarioFin = h.SegundoHorarioFin.ToString(@"hh\:mm"),
                    h.EmpleadoId,
                    EmpleadoNombre = h.Empleado != null ? h.Empleado.NombreCompleto : null
                })
                .FirstOrDefaultAsync();

            return Ok(horario);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CREAR UN HORARIO ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost]
        public async Task<ActionResult<Horario>> PostHorario([FromBody] Horario horario)
        {
            bool existe = await _context.Horario
                .AnyAsync(h => h.EmpleadoId == horario.EmpleadoId && h.TipoHorario == horario.TipoHorario);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe." });

            if (!ValidarRotacion(horario, out var mensajeRotacion))
                return BadRequest(new { mensaje = mensajeRotacion });

            if (horario.TipoHorario == TipoHorario.CONTINUO)
            {
                if (horario.HorarioInicio == null || horario.HorarioFin == null)
                    return BadRequest("Debe completar el horario de inicio y fin.");

                if (horario.HorarioInicio == horario.HorarioFin)
                    return BadRequest("El horario de inicio y fin no pueden ser iguales.");
            }
            else if (TieneSegundoTramo(horario.TipoHorario))
            {
                if (horario.HorarioInicio == null || horario.HorarioFin == null ||
                    horario.SegundoHorarioInicio == null || horario.SegundoHorarioFin == null)
                    return BadRequest("Debe completar ambos horarios.");

                if (horario.HorarioInicio == horario.HorarioFin &&
                    horario.SegundoHorarioInicio == horario.SegundoHorarioFin)
                    return BadRequest("Los horarios no pueden ser iguales.");
            }

            _context.Horario.Add(horario);
            await _context.SaveChangesAsync();

            var notificacion = new Notificaciones
            {
                Titulo = "Nuevo Horario Asignado",
                Mensaje = $"Se te ha asignado un nuevo horario. Por favor, verifique los detalles en su perfil.",
                FechaCreacion = DateTime.Now,
                UsuarioId = horario.EmpleadoId.ToString(),
                Leida = false
            };

            _context.Notificaciones.Add(notificacion);
            await _context.SaveChangesAsync();


            return CreatedAtAction("GetHorario", new { id = horario.Id }, horario);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// MODIFICACION DE HORARIO ///////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHorario(int id, Horario horario)
        {
            var horarioDb = await _context.Horario.FindAsync(id);

            if (horarioDb == null)
                return NotFound();

            bool existe = await _context.Horario
                .AnyAsync(h => h.Id != id && h.EmpleadoId == horario.EmpleadoId && h.TipoHorario == horario.TipoHorario);

            if (existe)
                return BadRequest(new { mensaje = "Ya existe." });

            if (!ValidarRotacion(horario, out var mensajeRotacion))
                return BadRequest(new { mensaje = mensajeRotacion });

            if (horario.TipoHorario == TipoHorario.CONTINUO)
            {
                if (horario.HorarioInicio == null || horario.HorarioFin == null)
                    return BadRequest("Debe completar el horario de inicio y fin.");

                if (horario.HorarioInicio == horario.HorarioFin)
                    return BadRequest("El horario de inicio y fin no pueden ser iguales.");
            }
            else if (TieneSegundoTramo(horario.TipoHorario))
            {
                if (horario.HorarioInicio == null || horario.HorarioFin == null ||
                    horario.SegundoHorarioInicio == null || horario.SegundoHorarioFin == null)
                    return BadRequest("Debe completar ambos horarios.");

                if (horario.HorarioInicio == horario.HorarioFin &&
                    horario.SegundoHorarioInicio == horario.SegundoHorarioFin)
                    return BadRequest("Los horarios no pueden ser iguales.");
            }

            horarioDb.HorarioInicio = horario.HorarioInicio;
            horarioDb.HorarioFin = horario.HorarioFin;
            horarioDb.SegundoHorarioInicio = horario.SegundoHorarioInicio;
            horarioDb.SegundoHorarioFin = horario.SegundoHorarioFin;
            horarioDb.TipoHorario = horario.TipoHorario;
            horarioDb.EmpleadoId = horario.EmpleadoId;
            horarioDb.EsRotativo = horario.EsRotativo;
            horarioDb.FechaInicioRotacion = horario.FechaInicioRotacion;
            horarioDb.RotacionSemanasJson = horario.RotacionSemanasJson;
            horarioDb.Lunes = horario.Lunes;
            horarioDb.Martes = horario.Martes;
            horarioDb.Miercoles = horario.Miercoles;
            horarioDb.Jueves = horario.Jueves;
            horarioDb.Viernes = horario.Viernes;
            horarioDb.Sabado = horario.Sabado;
            horarioDb.Domingo = horario.Domingo;

            await _context.SaveChangesAsync();

            var notificacion = new Notificaciones
            {
                Titulo = "Horario Modificado",
                Mensaje = $"Tu horario ha sido modificado. Por favor, verifica los nuevos detalles en tu perfil.",
                FechaCreacion = DateTime.Now,
                UsuarioId = horarioDb.EmpleadoId.ToString(),
                Leida = false
            };

            _context.Notificaciones.Add(notificacion);
            await _context.SaveChangesAsync();

            return Ok(horarioDb);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METOD PAR AELIMIANR UN HORARIO ////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHorario(int id)
        {
            var horario = await _context.Horario.FindAsync(id);

            _context.Horario.Remove(horario);
            await _context.SaveChangesAsync();

            return Ok(horario);
        }




        private bool HorarioExists(int id)
        {
            return _context.Horario.Any(e => e.Id == id);
        }
    }
}
