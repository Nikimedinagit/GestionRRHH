using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;

namespace API_NET_CORE8_RRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HorariosController : ControllerBase
    {
        private readonly Context _context;

        public HorariosController(Context context)
        {
            _context = context;
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
                obtenerHorarios = obtenerHorarios.Where(h => (int)h.TipoHorario == filtro.TipoHorario.Value);

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
                    TipoHorario = h.TipoHorario,
                    TipoHorarioString = h.TipoHorarioString,
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

            if (horario.TipoHorario == TipoHorario.CONTINUO)
            {
                if (horario.HorarioInicio == TimeSpan.Zero || horario.HorarioFin == TimeSpan.Zero)
                    return BadRequest("Debe completar el horario de inicio y fin.");
            }
            else if (horario.TipoHorario == TipoHorario.ALTERNO)
            {
                if (horario.HorarioInicio == TimeSpan.Zero || horario.HorarioFin == TimeSpan.Zero ||
                    horario.SegundoHorarioInicio == TimeSpan.Zero || horario.SegundoHorarioFin == TimeSpan.Zero)
                    return BadRequest("Debe completar ambos horarios.");
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

            if (horarioDb.TipoHorario == TipoHorario.CONTINUO)
            {
                if (horario.HorarioInicio == TimeSpan.Zero || horario.HorarioFin == TimeSpan.Zero)
                    return BadRequest("Debe completar el horario de inicio y fin.");
            }
            else if (horarioDb.TipoHorario == TipoHorario.ALTERNO)
            {
                if (horario.HorarioInicio == TimeSpan.Zero || horario.HorarioFin == TimeSpan.Zero ||
                    horario.SegundoHorarioInicio == TimeSpan.Zero || horario.SegundoHorarioFin == TimeSpan.Zero)
                    return BadRequest("Debe completar ambos horarios.");
            }

            horarioDb.HorarioInicio = horario.HorarioInicio;
            horarioDb.HorarioFin = horario.HorarioFin;
            horarioDb.SegundoHorarioInicio = horario.SegundoHorarioInicio;
            horarioDb.SegundoHorarioFin = horario.SegundoHorarioFin;
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
