using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;

namespace API_NET_CORE8_RRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EvaluacionesController : ControllerBase
    {
        private readonly Context _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public EvaluacionesController(Context context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS DATOS DE LA EVALUACIONES SEGUN SUS FILTROS /////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<EvaluacionVista>>> EvaluacionFiltro([FromBody] EvaluacionFiltro filtro)
        {
            var obtenerEvaluaciones = _context.Evaluacion
                .Include(e => e.Empleado)
                    .ThenInclude(emp => emp.Puesto)
                .Include(e => e.CriterioDeEvaluacion)
                    .ThenInclude(ce => ce.TipoDeCriterio)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filtro.NombreEmpleado))
                obtenerEvaluaciones = obtenerEvaluaciones.Where(e => e.Empleado.NombreCompleto.ToLower().Contains(filtro.NombreEmpleado.ToLower()));

            if (filtro.Fecha.HasValue)
            {
                var fecha = filtro.Fecha.Value.Date;
                var fechaSiguiente = fecha.AddDays(1);
                obtenerEvaluaciones = obtenerEvaluaciones.Where(e => e.Fecha >= fecha && e.Fecha < fechaSiguiente);
            }

            if (filtro.Calificacion.HasValue)
            {
                switch (filtro.Calificacion.Value)
                {
                    case 1: obtenerEvaluaciones = obtenerEvaluaciones.Where(e => e.Calificacion < 5); break;
                    case 2: obtenerEvaluaciones = obtenerEvaluaciones.Where(e => e.Calificacion >= 5 && e.Calificacion < 7); break;
                    case 3: obtenerEvaluaciones = obtenerEvaluaciones.Where(e => e.Calificacion >= 7 && e.Calificacion < 9); break;
                    case 4: obtenerEvaluaciones = obtenerEvaluaciones.Where(e => e.Calificacion >= 9); break;
                }
            }

            var listaVista = await obtenerEvaluaciones
                .OrderBy(e => e.Fecha)
                .ThenByDescending(e => e.Calificacion)
                .ThenByDescending(e => e.Empleado.NombreCompleto)
                .Select(e => new EvaluacionVista
                {
                    Id = e.Id,
                    Fecha = e.Fecha,
                    Calificacion = e.Calificacion,
                    EmpleadoId = e.EmpleadoId.ToString(),
                    EmpleadoNombre = e.Empleado.NombreCompleto,
                    EmpleadoPuesto = e.Empleado.Puesto.Descripcion
                })
                .ToListAsync();

            return Ok(listaVista);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CREAR UNA NUEVA EVALUACION ////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost]
        public async Task<ActionResult<Evaluacion>> PostEvaluacion(Evaluacion evaluacion)
        {
            bool evaluacionExistente = await _context.Evaluacion
                .AnyAsync(e => e.EmpleadoId == evaluacion.EmpleadoId
                            && e.Fecha.Month == DateTime.Now.Month
                            && e.Fecha.Year == DateTime.Now.Year);

            if (evaluacionExistente)
            {
                return BadRequest(new { codigo = 0, mensaje = "No puede volver a evaluar a este empleado en este mes" });
            }

            evaluacion.Fecha = DateTime.Now;

            _context.Evaluacion.Add(evaluacion);

            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEvaluacion", new { id = evaluacion.Id }, evaluacion);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UNA EVALUACION ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEvaluacion(int id, Evaluacion evaluacion)
        {
            var evaluacionOriginal = await _context.Evaluacion.FindAsync(id);

            var existeOtraEvaluacion = await _context.Evaluacion
                .AnyAsync(e => e.EmpleadoId == evaluacion.EmpleadoId
                               && e.Fecha.Month == DateTime.Now.Month
                               && e.Fecha.Year == DateTime.Now.Year
                               && e.Id != id);

            if (existeOtraEvaluacion)
            {
                return BadRequest(new { codigo = 0, mensaje = "No puede volver a evaluar a este empleado en este mes" });
            }

            evaluacionOriginal.Calificacion = evaluacion.Calificacion;
            evaluacionOriginal.EmpleadoId = evaluacion.EmpleadoId;

            await _context.SaveChangesAsync();

            return Ok(evaluacionOriginal);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UNA EVALUACION POR ID ///////////////////////////////////////////////////////   
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
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


        private bool EvaluacionExists(int id)
        {
            return _context.Evaluacion.Any(e => e.Id == id);
        }
    }
}
