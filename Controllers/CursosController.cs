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

        //Metodo privado para actualizar la finalizacin de un curso 
        private async Task ActualizarCursosFinalizados()
        {
            //raemos todos los cursos que no estan finalizazos y cuya fecha y hora ya paso
            var cursosActivos = await _context.Curso
            .Where(c => c.Finalizado == false && c.FechaFinalizacion < DateTime.Now)
            .ToListAsync();

            if (cursosActivos.Any())
            {

                foreach (var curso in cursosActivos)
                {
                    curso.Finalizado = true;
                }
                await _context.SaveChangesAsync();
            }
        }
        

        // GET: api/Cursos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Curso>>> GetCurso()
        {
                await ActualizarCursosFinalizados();

                var cursos = await _context.Curso
                    .Select(c => new CursoVista
                    {
                        Id = c.Id,
                        Nombre = c.Nombre,
                        Descripcion = c.Descripcion,
                        Modalidad = c.Modalidad,
                        FechaInicio = c.FechaInicio,
                        FechaFinalizacion = c.FechaFinalizacion,
                        Finalizado = c.Finalizado
                    })
                    .ToListAsync();

                return Ok(cursos);
        }

        // GET: api/Cursos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Curso>> GetCurso(int id)
        {
            await ActualizarCursosFinalizados();
            var curso = await _context.Curso.FindAsync(id);

            return curso;
        }

        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<CursoVista>>> FiltroCurso([FromBody] FiltroCurso filtro)
        {
            await ActualizarCursosFinalizados();
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
                    Descripcion = curso.Descripcion,
                    FechaFinalizacion = curso.FechaFinalizacion,
                    Finalizado = curso.Finalizado
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

            //No se puede modificar un curso finalizado 
            if (curso.Finalizado)
            {
                return Forbid("No se puede modificar un curso finalizado");
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
            curso.FechaInicio = new DateTime(
                curso.FechaInicio.Year,
                curso.FechaInicio.Month,
                curso.FechaInicio.Day,
                curso.FechaInicio.Hour,
                curso.FechaInicio.Minute,
                0
            );

            curso.FechaFinalizacion = new DateTime(
                curso.FechaFinalizacion.Year,
                curso.FechaFinalizacion.Month,
                curso.FechaFinalizacion.Day,
                curso.FechaFinalizacion.Hour,
                curso.FechaFinalizacion.Minute,
                0
            );
            //Convertir a mayusculas las letras
            curso.Nombre = curso.Nombre.ToUpper();

            //Verificar si ya existe un curso con mismo nombre en el mismo mes y año
            var cursoExistenteMesAnio = await _context.Curso
            .Where(C => C.Nombre == curso.Nombre
            && C.FechaInicio.Month == curso.FechaInicio.Month
            && C.FechaInicio.Year == curso.FechaInicio.Year)
            .FirstOrDefaultAsync();

            if (cursoExistenteMesAnio != null)
            {
                return BadRequest(new { codigo = 0, mensaje = "No se puede crear el mismo curso en el mismo mes" });
            }

            //Verificar si ya existe un curso con mismo nombre, fecha y hora exacta
            var cursoExacto = await _context.Curso
            .Where(c => c.Nombre == curso.Nombre
            && c.FechaInicio == curso.FechaInicio)
            .FirstOrDefaultAsync();

            if (cursoExacto != null)
            {
                return BadRequest(new { codigo = 1, mensaje = "No se puede crear el mismo curso con fecha y hora exacta" });
            }

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
