using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionRRHH.Models.General;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text;
using System.Globalization;

namespace GestionRRHH.Controllers
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
        /// FUNCION PARA NORMALIZAR EL TEXTO //////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        private string NormalizarTexto(string texto)
        {
            if (string.IsNullOrWhiteSpace(texto)) return string.Empty;

            texto = string.Join(" ", texto.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));

            texto = texto.ToUpperInvariant();

            texto = new string(texto
                .Normalize(NormalizationForm.FormD)
                .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                .ToArray());

            return texto;
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
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<CursoVista>>> FiltroCurso([FromBody] FiltroCurso filtro)
        {
            await ActualizarCursosFinalizados();

            var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var obtenerCursos = _context.Curso
                .Include(c => c.AsistenciaCapacitacion)
                .Include(c => c.Certificado)
                .AsNoTracking()
                .AsQueryable();

            Empleado empleado = null;

            if (rol == "SUPERVISOR" || rol == "EMPLEADO")
            {
                var usuario = await _context.Users.FindAsync(userId);
                var emailUsuario = usuario?.Email?.Trim().ToLower();

                empleado = await _context.Empleado
                    .Where(e => e.Email.Trim().ToLower() == emailUsuario)
                    .FirstOrDefaultAsync();

                if (empleado == null)
                    return Ok(new List<CursoVista>());

                var cursosConAsistencia = await _context.AsistenciaCapacitacion
                    .Where(a => a.EmpleadoId == empleado.Id && a.Asistencia)
                    .Select(a => a.CursoId)
                    .ToListAsync();

                obtenerCursos = obtenerCursos.Where(c => cursosConAsistencia.Contains(c.Id));
            }

            if (!string.IsNullOrWhiteSpace(filtro.NombreCurso))
                obtenerCursos = obtenerCursos.Where(c => EF.Functions.Like(c.Nombre, $"%{filtro.NombreCurso.Trim()}%"));

            if (filtro.Modalidad.HasValue && filtro.Modalidad.Value != 0)
                obtenerCursos = obtenerCursos.Where(c => (int)c.Modalidad == filtro.Modalidad.Value);

            if (filtro.Fecha.HasValue)
                obtenerCursos = obtenerCursos.Where(c => c.FechaInicio.Date == filtro.Fecha.Value.Date);

            var listaFiltrada = await obtenerCursos
                .OrderBy(c => c.Finalizado)
                .ThenBy(c => c.FechaInicio)
                .ThenBy(c => c.Modalidad)
                .ThenBy(c => c.Nombre)
                .Select(c => new CursoVista
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    Descripcion = c.Descripcion,
                    FechaInicio = c.FechaInicio,
                    FechaFinalizacion = c.FechaFinalizacion,
                    Modalidad = c.Modalidad,
                    Finalizado = c.Finalizado,

                    Resultado = empleado != null
                        ? c.AsistenciaCapacitacion
                            .Where(a => a.EmpleadoId == empleado.Id)
                            .Select(a => a.Resultado)
                            .FirstOrDefault()
                        : (int?)null,

                    CertificadoId = empleado != null
                        ? c.Certificado
                            .Where(cert => cert.EmpleadoId == empleado.Id)
                            .Select(cert => cert.Id)
                            .FirstOrDefault()
                        : (int?)null
                })
                .ToListAsync();

            return Ok(listaFiltrada);
        }


        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost]
        public async Task<ActionResult<Curso>> PostCurso(Curso curso)
        {
            curso.FechaInicio = new DateTime(curso.FechaInicio.Year, curso.FechaInicio.Month, curso.FechaInicio.Day,
                                             curso.FechaInicio.Hour, curso.FechaInicio.Minute, 0);

            curso.FechaFinalizacion = new DateTime(curso.FechaFinalizacion.Year, curso.FechaFinalizacion.Month, curso.FechaFinalizacion.Day,
                                                   curso.FechaFinalizacion.Hour, curso.FechaFinalizacion.Minute, 0);

            string nombreNormalizado = NormalizarTexto(curso.Nombre);

            var cursos = await _context.Curso
                .AsNoTracking()
                .Where(c => c.Modalidad == curso.Modalidad || curso.Modalidad == Modalidades.MIXTO)
                .ToListAsync();

            bool fechasCoinciden = cursos.Any(c =>
                NormalizarTexto(c.Nombre) == nombreNormalizado &&
                c.FechaInicio < curso.FechaFinalizacion &&
                curso.FechaInicio < c.FechaFinalizacion &&
                (curso.Modalidad != Modalidades.MIXTO || c.Modalidad == curso.Modalidad)
            );

            if (fechasCoinciden)
            {
                string mensaje = curso.Modalidad == Modalidades.MIXTO
                    ? "No se puede crear un curso mixto que coincida en fechas con otro curso del mismo nombre"
                    : "No se puede crear el mismo curso en el mismo horario.";

                return BadRequest(new { codigo = 0, mensaje });
            }

            curso.Nombre = nombreNormalizado;

            _context.Curso.Add(curso);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCurso), new { id = curso.Id }, curso);
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UN CURSO ///////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCurso(int id, Curso curso)
        {
            var cursoOriginal = await _context.Curso.FindAsync(id);

            curso.FechaInicio = new DateTime(curso.FechaInicio.Year, curso.FechaInicio.Month, curso.FechaInicio.Day,
                                             curso.FechaInicio.Hour, curso.FechaInicio.Minute, 0);

            curso.FechaFinalizacion = new DateTime(curso.FechaFinalizacion.Year, curso.FechaFinalizacion.Month, curso.FechaFinalizacion.Day,
                                                   curso.FechaFinalizacion.Hour, curso.FechaFinalizacion.Minute, 0);

            string nombreNormalizado = NormalizarTexto(curso.Nombre);

            var cursos = await _context.Curso
                .AsNoTracking()
                .Where(c => c.Id != id && (c.Modalidad == curso.Modalidad || curso.Modalidad == Modalidades.MIXTO))
                .ToListAsync();

            bool fechasCoinciden = cursos.Any(c =>
                NormalizarTexto(c.Nombre) == nombreNormalizado &&
                c.FechaInicio < curso.FechaFinalizacion &&
                curso.FechaInicio < c.FechaFinalizacion &&
                (curso.Modalidad != Modalidades.MIXTO || c.Modalidad == curso.Modalidad)
            );

            if (fechasCoinciden)
            {
                string mensaje = curso.Modalidad == Modalidades.MIXTO
                    ? "No se puede crear un curso mixto que coincida en fechas con otro curso del mismo nombre"
                    : "No se puede crear el mismo curso en el mismo horario.";

                return BadRequest(new { codigo = 0, mensaje });
            }

            cursoOriginal.Nombre = nombreNormalizado;
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
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
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
