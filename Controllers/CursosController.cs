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
    public class CursosController : ControllerBase
    {
        private readonly Context _context;

        public CursosController(Context context)
        {
            _context = context;
        }

        // GET: api/Cursos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Curso>>> GetCurso()
        {
            return await _context.Curso.ToListAsync();
        }

        // GET: api/Cursos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Curso>> GetCurso(int id)
        {
            var curso = await _context.Curso.FindAsync(id);

            if (curso == null)
            {
                return NotFound();
            }

            return curso;
        }

        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<CursoVista>>> FiltroCurso([FromBody] FiltroCurso filtro)
        {
            List<CursoVista> vista = new List<CursoVista>();
            var cursosFiltrados = _context.Curso.AsQueryable();

            if (!string.IsNullOrEmpty(filtro.NombreCurso))
            {
                cursosFiltrados = cursosFiltrados.Where(c => c.Nombre.ToLower().Contains(filtro.NombreCurso.ToLower()));
            }

            if (filtro.Modalidad.HasValue && filtro.Modalidad.Value != 0)
            {
                cursosFiltrados = cursosFiltrados.Where(c => (int)c.Modalidad == filtro.Modalidad);
            }

            if (filtro.Fecha.HasValue)
            {
                var fecha = filtro.Fecha.Value.Date;
                cursosFiltrados = cursosFiltrados.Where(c => c.FechaInicio.Date == fecha);
            }

            var listaFiltrada = await cursosFiltrados.ToListAsync();
                // .Include(c => c.AsistenciaCapacitacion)
                // .Include(c => c.Certificado)
                // .Where(c => c.AsistenciaCapacitacion != null && !c.AsistenciaCapacitacion.Any(a => a.Asistencia == false))
                // .Where(c => c.Certificado != null && !c.Certificado.Any(c => c.DocumentoDescargable != null))
                

            foreach (var curso in listaFiltrada)
            {
                var vistaCurso = new CursoVista
                {
                    Id = curso.Id,
                    FechaInicio = curso.FechaInicio,
                    Modalidad = curso.Modalidad,
                    Nombre = curso.Nombre,
                    Descripcion = curso.Descripcion
                };
                vista.Add(vistaCurso);
            }
            
            Console.WriteLine($"Nombre: {filtro.NombreCurso}, Modalidad: {filtro.Modalidad}, Fecha: {filtro.Fecha}");

            return Ok(vista);

        }

        // PUT: api/Cursos/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCurso(int id, Curso curso)
        {
            if (id != curso.Id)
            {
                return BadRequest();
            }
            //Convertir a mayusculas las letras
            curso.Nombre = curso.Nombre.ToUpper();

            //Veificar si el curso ya existe
            var cursoExistente = await _context.Curso
            .FirstOrDefaultAsync(c => c.Nombre.ToLower() == curso.Nombre.ToLower() && c.Id != id);

            if (cursoExistente != null)
            {
                return Ok(new { codigo = 0, mensaje = "No se puede crear el mismo curso en el mismo mes" });
            }


            _context.Entry(curso).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CursoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(curso);
        }

        // POST: api/Cursos
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Curso>> PostCurso(Curso curso)
        {
            //Convertir a mayusculas las letras
            curso.Nombre = curso.Nombre.ToUpper();

            //Veificar si el curso ya existe
            var cursoExistente = await _context.Curso
            .Where(C => C.Nombre.ToLower() == curso.Nombre.ToLower()
            && C.FechaCreacion.Month == DateTime.Now.Month
            && C.FechaCreacion.Year == DateTime.Now.Year)
            .FirstOrDefaultAsync();

            if (cursoExistente != null)
            {
                return BadRequest(new { codigo = 0, mensaje = "No se puede crear el mismo curso en el mismo mes" });
            }

            
            curso.FechaInicio = new DateTime(
                curso.FechaInicio.Year,
                curso.FechaInicio.Month,
                curso.FechaInicio.Day,
                curso.FechaInicio.Hour,
                curso.FechaInicio.Minute,
                0
            );

            curso.FechaCreacion = DateTime.Now;
            _context.Curso.Add(curso);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCurso", new { id = curso.Id }, curso);
        }

        // DELETE: api/Cursos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCurso(int id)
        {
            var curso = await _context.Curso.FindAsync(id);
            if (curso == null)
            {
                return NotFound();
            }

            _context.Curso.Remove(curso);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CursoExists(int id)
        {
            return _context.Curso.Any(e => e.Id == id);
        }
    }
}
