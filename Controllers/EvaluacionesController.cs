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
    public class EvaluacionesController : ControllerBase
    {
        private readonly Context _context;

        public EvaluacionesController(Context context)
        {
            _context = context;
        }

        // GET: api/Evaluaciones
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Evaluacion>>> GetEvaluacion()
        {
            return await _context.Evaluacion
            .Include(e => e.Empleado)
            .Include(e => e.Empleado.Puesto)
            .Include(e => e.CriterioDeEvaluacion)
                .ThenInclude(ce => ce.TipoDeCriterio)
            .OrderBy(e => e.Calificacion)
            .ThenByDescending(e => e.Fecha)
            .ToListAsync();
            ;
        }

        // GET: api/Evaluaciones/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Evaluacion>> GetEvaluacion(int id)
        {
            var evaluacion = await _context.Evaluacion.FindAsync(id);

            if (evaluacion == null)
            {
                return NotFound();
            }

            return evaluacion;
        }

        // PUT: api/Evaluaciones/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEvaluacion(int id, Evaluacion evaluacion)
        {
            if (id != evaluacion.Id)
            {
                return BadRequest();
            }

            //Campos que pueden editarse
            evaluacion.Calificacion = evaluacion.Calificacion;
            evaluacion.EmpleadoId = evaluacion.EmpleadoId;

            _context.Entry(evaluacion).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EvaluacionExists(id))
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

        // POST: api/Evaluaciones
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Evaluacion>> PostEvaluacion(Evaluacion evaluacion)
        {

            //Por empleado se puede evaluar solo una vez al mes
            var evaluacionExistente = await _context.Evaluacion
            .Where(e => e.EmpleadoId == evaluacion.EmpleadoId
            && e.Fecha.Month == DateTime.Now.Month 
            && e.Fecha.Year == DateTime.Now.Year)
            .FirstOrDefaultAsync();

            if (evaluacionExistente != null)
            {
                return BadRequest(new {codigo = 0, mensaje = "No puede volver a evaluar a este empleado en este mes"});
            }


            //Fecha de evaluacion valor fijo
                evaluacion.Fecha = DateTime.Now;
            _context.Evaluacion.Add(evaluacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEvaluacion", new { id = evaluacion.Id }, evaluacion);
        }

        // DELETE: api/Evaluaciones/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvaluacion(int id)
        {
            var evaluacion = await _context.Evaluacion.FindAsync(id);
            if (evaluacion == null)
            {
                return NotFound();
            }

            _context.Evaluacion.Remove(evaluacion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EvaluacionExists(int id)
        {
            return _context.Evaluacion.Any(e => e.Id == id);
        }
    }
}
