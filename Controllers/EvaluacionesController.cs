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

        // GET: api/Evaluaciones
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Evaluacion>>> GetEvaluacion()
        {
            return await _context.Evaluacion
                .Include(e => e.Empleado)
                .Include(e => e.Empleado.Puesto)
                .Include(e => e.CriterioDeEvaluacion)
                    .ThenInclude(ce => ce.TipoDeCriterio)
                .Where(e => e.Empleado != null && !e.Empleado.Eliminado)
                .OrderByDescending(e => e.Fecha)
                .ThenBy(e => e.Calificacion)
                .ToListAsync();

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

        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<EvaluacionVista>>> EvaluacionFiltro([FromBody] EvaluacionFiltro filtro)
        {

            List<EvaluacionVista> vista = new List<EvaluacionVista>();

            var evaluacionFiltrar = _context.Evaluacion.AsQueryable();

            if (!string.IsNullOrEmpty(filtro.NombreEmpleado))
            {
                evaluacionFiltrar = evaluacionFiltrar
                .Where(e => e.Empleado.NombreCompleto.ToLower().Contains(filtro.NombreEmpleado.ToLower()));
            }

            if (filtro.Fecha.HasValue)
            {
                var fechaEvaluacion = filtro.Fecha.Value.Date;
                var fechaLimite = fechaEvaluacion.AddDays(1);

                evaluacionFiltrar = evaluacionFiltrar
                .Where(t => t.Fecha >= fechaEvaluacion && t.Fecha < fechaLimite);
                // .Where(t => t.FechaInicio <= fechaFin && t.FechaFin >= fechaInicio);    
            }

            if (filtro.Calificacion.HasValue)
            {
                if (filtro.Calificacion.Value == 1)
                {
                    evaluacionFiltrar = evaluacionFiltrar.Where(t => t.Calificacion < 5);
                }
                if (filtro.Calificacion.Value == 2)
                {
                    evaluacionFiltrar = evaluacionFiltrar.Where(t => t.Calificacion >= 5 && t.Calificacion < 7);
                }
                if (filtro.Calificacion.Value == 3)
                {
                    evaluacionFiltrar = evaluacionFiltrar.Where(t => t.Calificacion >= 7 && t.Calificacion < 9);
                }
                if (filtro.Calificacion.Value == 4)
                {
                    evaluacionFiltrar = evaluacionFiltrar.Where(t => t.Calificacion >= 9);
                }

            }

            var listaFiltrada = await evaluacionFiltrar
                .Include(e => e.Empleado)
                .Include(e => e.Empleado.Puesto)
                .Include(e => e.CriterioDeEvaluacion)
                    .ThenInclude(ce => ce.TipoDeCriterio)
                .Where(e => e.Empleado != null && !e.Empleado.Eliminado)
                .OrderByDescending(e => e.Fecha)
                .ThenBy(e => e.Calificacion)
                .ToListAsync();

            foreach (var evaluacion in listaFiltrada)
            {
                var vistaEvaluacion = new EvaluacionVista
                {
                    Id = evaluacion.Id,
                    Fecha = evaluacion.Fecha,
                    Calificacion = evaluacion.Calificacion,
                    EmpleadoId = evaluacion.EmpleadoId.ToString(),
                    EmpleadoNombre = evaluacion.Empleado.NombreCompleto,
                    EmpleadoPuesto = evaluacion.Empleado.Puesto.Descripcion
                };
                vista.Add(vistaEvaluacion);
            }
            return vista;
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

            //Fecha de evaluacion valor fijo
            evaluacion.Fecha = DateTime.Now;

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
                return BadRequest(new { codigo = 0, mensaje = "No puede volver a evaluar a este empleado en este mes" });
            }


            //Fecha de evaluacion valor fijo
            evaluacion.Fecha = DateTime.Now;
            _context.Evaluacion.Add(evaluacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEvaluacion", new { id = evaluacion.Id }, evaluacion);
        }






        //METODOS PARA FILTRAR EN LAS CARD DE ESTADISTICAS
        //Total de evaluaciones
        [HttpGet("Total")]
        public async Task<ActionResult<int>> GetTotalEvaluaciones()
        {
            // Obtener el rol del usuario autenticado
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _context.Users.FindAsync(userId);

            var roles = await _userManager.GetRolesAsync(user);
            var rol = roles.FirstOrDefault();

            // Permitir solo si es ADMINISTRADOR
            if (rol != "ADMINISTRADOR")
            {
                return Forbid(); // O return Unauthorized();
            }

            // Consultar todas las evaluaciones de empleados no eliminados
            var total = await _context.Evaluacion
                .Include(e => e.Empleado)
                .Where(e => !e.Empleado.Eliminado)
                .CountAsync();

            return Ok(new { total });
        }


        //Evaluacion promedio general
        [HttpGet("PromedioGeneral")]
        public async Task<ActionResult<double>> GetPromedioGeneral()
        {
            // Obtener el rol del usuario autenticado
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _context.Users.FindAsync(userId);

            var roles = await _userManager.GetRolesAsync(user);
            var rol = roles.FirstOrDefault();

            // Permitir solo si es ADMINISTRADOR
            if (rol != "ADMINISTRADOR")
            {
                return Forbid(); // O return Unauthorized();
            }

            // Consultar todas las evaluaciones de empleados no eliminados
            var promedio = await _context.Evaluacion
                .Include(e => e.Empleado)
                .Where(e => !e.Empleado.Eliminado)
                .Select(e => e.Calificacion)
                .AverageAsync();

            return Ok(new { promedio });
        }


        //Empleados evaluados
        [HttpGet("Empleados")]
        public async Task<ActionResult<int>> GetEmpleadosEvaluados()
        {
            // Validar rol ADMINISTRADOR directamente de claims (optimización, si lo tienes)
            var roles = HttpContext.User.FindAll(ClaimTypes.Role).Select(r => r.Value);
            if (!roles.Contains("ADMINISTRADOR"))
            {
                return Forbid();
            }

            // Obtener el total de empleados distintos evaluados que no están eliminados
            var totalEmpleadosEvaluados = await _context.Evaluacion
                .Where(e => !e.Empleado.Eliminado)
                .Select(e => e.EmpleadoId)
                .Distinct()
                .CountAsync();

            return Ok(new { totalEmpleadosEvaluados });
        }





        private bool EvaluacionExists(int id)
        {
            return _context.Evaluacion.Any(e => e.Id == id);
        }
    }
}
