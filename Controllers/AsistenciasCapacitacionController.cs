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
    [Authorize(Roles = "ADMINISTRADOR")]
    [Route("api/[controller]")]
    [ApiController]
    public class AsistenciasCapacitacionController : ControllerBase
    {
        private readonly Context _context;

        public AsistenciasCapacitacionController(Context context)
        {
            _context = context;
        }

        // GET: api/AsistenciasCapacitacion
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AsistenciaCapacitacion>>> GetAsistenciaCapacitacion()
        {
            return await _context.AsistenciaCapacitacion
            .Include(a => a.Curso)
            .Include(a => a.Empleado)
            .Where(a => a.Empleado != null && !a.Empleado.Eliminado)
            .ToListAsync();
        }

        // GET: api/AsistenciasCapacitacion/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AsistenciaCapacitacion>> GetAsistenciaCapacitacion(int id)
        {
            var asistenciaCapacitacion = await _context.AsistenciaCapacitacion.FindAsync(id);

            if (asistenciaCapacitacion == null)
            {
                return NotFound();
            }

            return asistenciaCapacitacion;
        }

        // PUT: api/AsistenciasCapacitacion/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAsistenciaCapacitacion(int id, AsistenciaCapacitacion asistenciaCapacitacion)
        {
            if (id != asistenciaCapacitacion.Id)
            {
                return BadRequest();
            }

            _context.Entry(asistenciaCapacitacion).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AsistenciaCapacitacionExists(id))
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

        // POST: api/AsistenciasCapacitacion
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<AsistenciaCapacitacion>> PostAsistenciaCapacitacion(AsistenciaCapacitacion asistenciaCapacitacion)
        {
            //No se puede registrar dos veces el mismo empleado 
            var empleadoExistente = await _context.AsistenciaCapacitacion
            .Where(c => c.EmpleadoId == asistenciaCapacitacion.EmpleadoId && c.CursoId == asistenciaCapacitacion.CursoId)
            .FirstOrDefaultAsync();

            if (empleadoExistente != null)
            {
                return BadRequest(new {codigo = 0, campo = "empleado", mensaje = "Este empleado ya tiene una asistencia registrada para este curso"});
            }

            var curso = await _context.Curso.FindAsync(asistenciaCapacitacion.CursoId);


            if (curso == null)
            {
                return BadRequest(new { codigo = 0, mensaje = "Seleccione un curso" });
            }

            //La fecha de asistencia no puede ser menor a la fecha de inicio del curso.
            if (asistenciaCapacitacion.Fecha.Date < curso.FechaInicio.Date)
            {
                return BadRequest(new { codigo = 0, campo = "fecha", mensaje = "La fecha de asistencia no puede ser menor a la fecha de inicio del curso" });
            }
            _context.AsistenciaCapacitacion.Add(asistenciaCapacitacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAsistenciaCapacitacion", new { id = asistenciaCapacitacion.Id }, asistenciaCapacitacion);
        }

        // DELETE: api/AsistenciasCapacitacion/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsistenciaCapacitacion(int id)
        {
            var asistenciaCapacitacion = await _context.AsistenciaCapacitacion.FindAsync(id);
            if (asistenciaCapacitacion == null)
            {
                return NotFound();
            }

            _context.AsistenciaCapacitacion.Remove(asistenciaCapacitacion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        //PATCH: Vehiculos/Alquilar/{id}
        [HttpPatch("CambiarEstado/{id}")]
        public async Task<IActionResult> CambiarEstado (int id, [FromBody] bool nuevoEstado)
        {
            var asistencia = await _context.AsistenciaCapacitacion.FindAsync(id);
            if(asistencia == null)
            {
                return NotFound();
            }

            //CAMBIAR EL ESTADO DELL VEHICULO
            asistencia.Asistencia = nuevoEstado;
            
            try 
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,"Hubo un error al actualizar el estado de la asistencia");
            }

            return Ok(asistencia);
        }


        private bool AsistenciaCapacitacionExists(int id)
        {
            return _context.AsistenciaCapacitacion.Any(e => e.Id == id);
        }
    }
}
