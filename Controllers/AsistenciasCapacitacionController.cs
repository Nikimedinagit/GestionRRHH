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
    [Route("api/[controller]")]
    [ApiController]
    public class AsistenciasCapacitacionController : ControllerBase
    {
        private readonly Context _context;

        public AsistenciasCapacitacionController(Context context)
        {
            _context = context;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS DATOS DE LA API DE ASISTENCIA CURSO ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize (Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AsistenciaCapacitacion>>> GetAsistenciaCapacitacion()
        {
            return await _context.AsistenciaCapacitacion
                .Include(a => a.Curso)
                .Include(a => a.Empleado)
                .Where(a => a.Empleado != null && !a.Empleado.Eliminado)
                .ToListAsync();
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS DATOS DE LA API DE ASISTENCIA CURSO POR ID ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize (Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
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


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CREAR UNA NUEVA ASISTENCIA ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize (Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost]
        public async Task<ActionResult<AsistenciaCapacitacion>> PostAsistenciaCapacitacion(AsistenciaCapacitacion asistenciaCapacitacion)
        {
            var empleadoExistente = await _context.AsistenciaCapacitacion
            .Where(c => c.EmpleadoId == asistenciaCapacitacion.EmpleadoId && c.CursoId == asistenciaCapacitacion.CursoId)
            .FirstOrDefaultAsync();

            if (empleadoExistente != null)
            {
                return BadRequest(new { codigo = 0, campo = "empleado", mensaje = "Este empleado ya tiene una asistencia." });
            }

            var curso = await _context.Curso.FindAsync(asistenciaCapacitacion.CursoId);

            _context.AsistenciaCapacitacion.Add(asistenciaCapacitacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAsistenciaCapacitacion", new { id = asistenciaCapacitacion.Id }, asistenciaCapacitacion);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ELIMINAR UNA ASISTENCIA //////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize (Roles = "ADMINISTRADOR, RRHH")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsistenciaCapacitacion(int id)
        {
            var asistenciaCapacitacion = await _context.AsistenciaCapacitacion.FindAsync(id);

            var certificadoExistente = await _context.Certificado
                .AnyAsync(c => c.EmpleadoId == asistenciaCapacitacion.EmpleadoId
                            && c.CursoId == asistenciaCapacitacion.CursoId);

            if (certificadoExistente)
                return BadRequest(new { mensaje = "No se puede elimianr la asistencia porque tiene certificado asociados." });

            _context.AsistenciaCapacitacion.Remove(asistenciaCapacitacion);
            await _context.SaveChangesAsync();

            return Ok(asistenciaCapacitacion);
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CAMBIAR EL ESTADO DE LA ASISTENCIA ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize (Roles = "ADMINISTRADOR, RRHH")]
        [HttpPatch("CambiarEstado/{id}")]
        public async Task<IActionResult> CambiarEstado(int id, [FromBody] bool nuevoEstado)
        {
            var asistencia = await _context.AsistenciaCapacitacion.FindAsync(id);

            asistencia.Asistencia = nuevoEstado;

            await _context.SaveChangesAsync();

            return Ok(asistencia);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER ASISTENCIAS POR CURSO (LAZY LOADING) //////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("PorCurso/{cursoId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetAsistenciaCapacitacionPorCurso(int cursoId)
        {
            var asistencias = await _context.AsistenciaCapacitacion
                .AsNoTracking()
                .Include(a => a.Empleado)
                .Where(a => a.CursoId == cursoId && a.Empleado != null && !a.Empleado.Eliminado)
                .Select(a => new 
                { 
                    a.Id,
                    a.EmpleadoId,
                    a.CursoId,
                    a.Resultado,
                    a.Asistencia,
                    Empleado = new { a.Empleado.NombreCompleto }
                })
                .ToListAsync();

            return Ok(asistencias);
        }

        private bool AsistenciaCapacitacionExists(int id)
        {
            return _context.AsistenciaCapacitacion.Any(e => e.Id == id);
        }
    }
}
