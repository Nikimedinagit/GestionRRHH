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


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ACTUALIZAR LOS CURSOS FINALIZADOS ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        private async Task ActualizarCursosFinalizados()
        {
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


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS DATOS DE LA API DE CURSOS ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<CursoVista>>> FiltroCurso([FromBody] FiltroCurso filtro)
        {
            await ActualizarCursosFinalizados();

            var obtenerCursos = _context.Curso.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.NombreCurso))
            {
                string nombre = filtro.NombreCurso.Trim();
                obtenerCursos = obtenerCursos.Where(c => EF.Functions.Like(c.Nombre, $"%{nombre}%"));
            }

            if (filtro.Modalidad.HasValue && filtro.Modalidad.Value != 0)
            {
                obtenerCursos = obtenerCursos.Where(c => (int)c.Modalidad == filtro.Modalidad.Value);
            }

            if (filtro.Fecha.HasValue)
            {
                var fecha = filtro.Fecha.Value.Date;
                obtenerCursos = obtenerCursos.Where(c => c.FechaInicio.Date == fecha);
            }

            var listaFiltrada = await obtenerCursos
                .OrderBy(c => c.Finalizado)                 
                .ThenBy(c => c.FechaInicio)                 
                .ThenBy(c => c.Modalidad)                   
                .ThenBy(c => c.Nombre)                    
                .Select(c => new CursoVista
                {
                    Id = c.Id,
                    FechaInicio = c.FechaInicio,
                    Modalidad = c.Modalidad,
                    Nombre = c.Nombre,
                    Descripcion = c.Descripcion,
                    FechaFinalizacion = c.FechaFinalizacion,
                    Finalizado = c.Finalizado
                })
                .ToListAsync();

            return Ok(listaFiltrada);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CREAR UN NUEVO CURSO //////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost]
        public async Task<ActionResult<Curso>> PostCurso(Curso curso)
        {
            curso.FechaInicio = new DateTime(curso.FechaInicio.Year, curso.FechaInicio.Month, curso.FechaInicio.Day,
                                             curso.FechaInicio.Hour, curso.FechaInicio.Minute, 0);
            curso.FechaFinalizacion = new DateTime(curso.FechaFinalizacion.Year, curso.FechaFinalizacion.Month, curso.FechaFinalizacion.Day,
                                                   curso.FechaFinalizacion.Hour, curso.FechaFinalizacion.Minute, 0);

            curso.Nombre = curso.Nombre.ToUpper();

            bool fechasCoinciden = await _context.Curso.AnyAsync(c =>
                c.Nombre == curso.Nombre &&
                c.Modalidad == curso.Modalidad &&
                c.FechaInicio < curso.FechaFinalizacion &&
                curso.FechaInicio < c.FechaFinalizacion
            );

            if (fechasCoinciden)
                return BadRequest(new { codigo = 0, mensaje = "No se puede crear el mismo curso en le mismo horario." });

            if (curso.Modalidad == Modalidades.MIXTO)
            {
                bool fechasMixto = await _context.Curso.AnyAsync(c =>
                    c.Nombre == curso.Nombre &&
                    c.FechaInicio < curso.FechaFinalizacion &&
                    curso.FechaInicio < c.FechaFinalizacion
                );

                if (fechasMixto)
                    return BadRequest(new { codigo = 0, mensaje = "No se puede crear un curso mixto que coincida en fechas con otro curso del mismo nombre" });
            }

            _context.Curso.Add(curso);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCurso), new { id = curso.Id }, curso);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UN CURSO ///////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCurso(int id, Curso curso)
        {
            var cursoOriginal = await _context.Curso.FindAsync(id);

            curso.FechaInicio = new DateTime(curso.FechaInicio.Year, curso.FechaInicio.Month, curso.FechaInicio.Day,
                                             curso.FechaInicio.Hour, curso.FechaInicio.Minute, 0);
            curso.FechaFinalizacion = new DateTime(curso.FechaFinalizacion.Year, curso.FechaFinalizacion.Month, curso.FechaFinalizacion.Day,
                                                   curso.FechaFinalizacion.Hour, curso.FechaFinalizacion.Minute, 0);

            curso.Nombre = curso.Nombre.ToUpper();

            bool fechasCoinciden = await _context.Curso.AnyAsync(c =>
                c.Id != id &&
                c.Nombre == curso.Nombre &&
                c.Modalidad == curso.Modalidad &&
                c.FechaInicio < curso.FechaFinalizacion &&
                curso.FechaInicio < c.FechaFinalizacion
            );

            if (fechasCoinciden)
                return BadRequest(new { codigo = 0, mensaje = "No se puede crear el mismo curso en el mismo horario." });

            if (curso.Modalidad == Modalidades.MIXTO)
            {
                bool fechasMixto = await _context.Curso.AnyAsync(c =>
                    c.Id != id &&
                    c.Nombre == curso.Nombre &&
                    c.FechaInicio < curso.FechaFinalizacion &&
                    curso.FechaInicio < c.FechaFinalizacion
                );

                if (fechasMixto)
                    return BadRequest(new { codigo = 0, mensaje = "No se puede crear un curso mixto que coincida en fechas con otro curso del mismo nombre" });
            }

            cursoOriginal.Nombre = curso.Nombre;
            cursoOriginal.FechaInicio = curso.FechaInicio;
            cursoOriginal.FechaFinalizacion = curso.FechaFinalizacion;
            cursoOriginal.Modalidad = curso.Modalidad;
            cursoOriginal.Descripcion = curso.Descripcion;

            await _context.SaveChangesAsync();

            return Ok(cursoOriginal);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UN CURSO POR ID /////////////////////////////////////////////////////// 
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpGet("{id}")]
        public async Task<ActionResult<Curso>> GetCurso(int id)
        {
            await ActualizarCursosFinalizados();
            var curso = await _context.Curso.FindAsync(id);

            return curso;
        }


        private bool CursoExists(int id)
        {
            return _context.Curso.Any(e => e.Id == id);
        }
    }
}
