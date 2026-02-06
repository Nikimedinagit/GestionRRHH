using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionRRHH.Models.General;
using Microsoft.AspNetCore.Authorization;

namespace GestionRRHH.Controllers
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
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
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
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
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


        ////////////////////////////////////////////////////////
        /// METODO PARA OBTENER EVALUACIONES SIN CRITERIOS /// 
        ////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("PorEvaluacion/{evaluacionId}")]
        public async Task<ActionResult<IEnumerable<CriterioDeEvaluacion>>> GetCriteriosPorEvaluacion(int evaluacionId)
        {
            var criterios = await _context.CriterioDeEvaluacion
                .Where(c => c.EvaluacionId == evaluacionId)
                .Include(c => c.TipoDeCriterio)          
                .ToListAsync();

            return Ok(criterios);
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ELIMIANR UN CRITERIO DE EVALUACION ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
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
