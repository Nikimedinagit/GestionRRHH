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
    public class CriteriosDeEvaluacionController : ControllerBase
    {
        private readonly Context _context;

        public CriteriosDeEvaluacionController(Context context)
        {
            _context = context;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS CRITERIOS DE EVALUACION ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CriterioDeEvaluacion>>> GetCriterioDeEvaluacion()
        {
            var criteriosDeEvaluacion = await _context.CriterioDeEvaluacion
            .Include(e => e.TipoDeCriterio)
            .ToListAsync();

            return Ok(criteriosDeEvaluacion);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// MERODO PARA CREAR UN CRITERIO DE EVALUACION //////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost]
        public async Task<ActionResult<CriterioDeEvaluacion>> PostCriterioDeEvaluacion(CriterioDeEvaluacion criterioDeEvaluacion)
        {
            criterioDeEvaluacion.Descripcion = criterioDeEvaluacion.Descripcion.ToUpper();

            var existeCriterio = await _context.CriterioDeEvaluacion
                .AnyAsync(c => c.TipoDeCriterioId == criterioDeEvaluacion.TipoDeCriterioId
                && c.EvaluacionId == criterioDeEvaluacion.EvaluacionId);

            if (existeCriterio)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            }

            _context.CriterioDeEvaluacion.Add(criterioDeEvaluacion);

            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCriterioDeEvaluacion", new { id = criterioDeEvaluacion.Id }, criterioDeEvaluacion);
        }

        
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ELIMIANR UN CRITERIO DE EVALUACION ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCriterioDeEvaluacion(int id)
        {
            var criterioDeEvaluacion = await _context.CriterioDeEvaluacion.FindAsync(id);
            
            _context.CriterioDeEvaluacion.Remove(criterioDeEvaluacion);
            await _context.SaveChangesAsync();

            return Ok(criterioDeEvaluacion);
        }


        private bool CriterioDeEvaluacionExists(int id)
        {
            return _context.CriterioDeEvaluacion.Any(e => e.Id == id);
        }
    }
}
