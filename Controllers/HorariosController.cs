using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;

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

        // GET: api/Horarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VistaHorario>>> GetHorario()
        {
            var horarios = await _context.Horario
                .Include(h => h.Empleado)
                    .ThenInclude(e => e.Puesto) 
                .ToListAsync();

            var vista = horarios.Select(h => new VistaHorario
            {
                Id = h.Id,
                HorarioInicioString = h.HorarioInicio.ToString(@"hh\:mm"),
                HorarioFinString = h.HorarioFin.ToString(@"hh\:mm"),
                SegundoHorarioInicioString = h.SegundoHorarioInicio.ToString(@"hh\:mm"),
                SegundoHorarioFinString = h.SegundoHorarioFin.ToString(@"hh\:mm"),
                TipoHorario = h.TipoHorario,
                TipoHorarioString = h.TipoHorario.ToString(),
                Lunes = h.Lunes,
                Martes = h.Martes,
                Miercoles = h.Miercoles,
                Jueves = h.Jueves,
                Viernes = h.Viernes,
                Sabado = h.Sabado,
                Domingo = h.Domingo,
                EmpleadoString = h.Empleado != null ? h.Empleado.NombreCompleto : "",
                EmpleadoId = h.EmpleadoId,
                PuestoEmpleado = h.Empleado?.Puesto?.Descripcion ?? "Sin puesto"
            }).ToList();

            return Ok(vista);
        }


        // GET: api/Horarios/5
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

            if (horario == null)
                return NotFound();

            return Ok(horario);
        }



        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaHorario>>> FiltrarHorario([FromBody] FiltrarHorario filtro)
        {
            var query = _context.Horario
                .Include(h => h.Empleado)
                    .ThenInclude(e => e.Puesto)
                .Where(h => h.Empleado != null && !h.Empleado.Eliminado)
                .AsQueryable();

            if (filtro.TipoHorario.HasValue)
                query = query.Where(h => (int)h.TipoHorario == filtro.TipoHorario.Value);

            if (!string.IsNullOrEmpty(filtro.HorarioInicio) && TimeSpan.TryParse(filtro.HorarioInicio, out var horarioInicioTs))
                query = query.Where(h => h.HorarioInicio >= horarioInicioTs);

            if (!string.IsNullOrEmpty(filtro.HorarioFin) && TimeSpan.TryParse(filtro.HorarioFin, out var horarioFinTs))
                query = query.Where(h => h.HorarioFin <= horarioFinTs);

            if (!string.IsNullOrEmpty(filtro.EmpleadoTexto))
            {
                query = query.Where(x =>
                    x.Empleado.NombreCompleto.Contains(filtro.EmpleadoTexto));
            }

            var lista = await query.OrderBy(h => h.HorarioInicio).ToListAsync();

            var vista = lista.Select(h => new VistaHorario
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
                PuestoEmpleado = h.Empleado?.Puesto?.Descripcion ?? "Sin puesto"
            }).ToList();


            return Ok(vista);
        }





        // PUT: api/Horarios/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHorario(int id, Horario horario)
        {
            if (id != horario.Id)
            {
                return BadRequest();
            }

            _context.Entry(horario).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HorarioExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Horarios
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754

        [HttpPost]
        public async Task<ActionResult<Horario>> PostHorario([FromBody] Horario horario)
        {
            if (horario.TipoHorario == TipoHorario.RECORRIDO)
            {
                if (horario.HorarioInicio == TimeSpan.Zero || horario.HorarioFin == TimeSpan.Zero)
                    return BadRequest("Debe completar el horario de inicio y fin.");
            }
            else if (horario.TipoHorario == TipoHorario.SEPARADO)
            {
                if (horario.HorarioInicio == TimeSpan.Zero || horario.HorarioFin == TimeSpan.Zero ||
                    horario.SegundoHorarioInicio == TimeSpan.Zero || horario.SegundoHorarioFin == TimeSpan.Zero)
                    return BadRequest("Debe completar ambos horarios.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            _context.Horario.Add(horario);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetHorario", new { id = horario.Id }, horario);
        }


        // DELETE: api/Horarios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHorario(int id)
        {
            var horario = await _context.Horario.FindAsync(id);
            if (horario == null)
            {
                return NotFound();
            }

            _context.Horario.Remove(horario);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool HorarioExists(int id)
        {
            return _context.Horario.Any(e => e.Id == id);
        }
    }
}
