using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;
using API_RRHH_TESIS2025.Models.Dto;

namespace API_NET_CORE8_RRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AsistenciasController : ControllerBase
    {
        private readonly Context _context;

        public AsistenciasController(Context context)
        {
            _context = context;
        }

        

        // POST: api/Asistencias
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("Fichar")]
        public async Task<IActionResult> Fichar([FromBody] FicharDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Dni))
                return BadRequest("El DNI es obligatorio.");

            string dni = dto.Dni;

            // Buscar empleado incluyendo horario
            var empleado = await _context.Empleado
                .Include(e => e.Horario)
                .FirstOrDefaultAsync(e => e.DNI.ToString() == dni && !e.Eliminado);

            if (empleado == null)
                return NotFound("Empleado no encontrado o inactivo.");

            var fechaHoy = DateTime.Today;

            var asistenciaHoy = await _context.Asistencia
                .FirstOrDefaultAsync(a => a.EmpleadoId == empleado.Id && a.Fecha == fechaHoy);

            var ahora = DateTime.Now.TimeOfDay;
            string horaFormateada = DateTime.Now.ToString("HH:mm");

            if (asistenciaHoy == null)
            {
                asistenciaHoy = new Asistencia
                {
                    Fecha = fechaHoy,
                    EmpleadoId = empleado.Id,
                    PrimerEntrada = ahora,
                    Estado = EstadoAsistencia.Incompleta
                };

                var primerHorarioInicio = empleado.Horario.FirstOrDefault()?.HorarioInicio;

                if (primerHorarioInicio != null && ahora > primerHorarioInicio)
                    asistenciaHoy.Estado = EstadoAsistencia.Tarde;

                _context.Asistencia.Add(asistenciaHoy);
                await _context.SaveChangesAsync();

                return Ok($"Primer entrada registrada para {empleado.NombreCompleto} a las {horaFormateada}");
            }
            else if (asistenciaHoy.PrimerSalida == null)
            {
                asistenciaHoy.PrimerSalida = ahora;
                asistenciaHoy.Estado = EstadoAsistencia.Incompleta;
                await _context.SaveChangesAsync();

                return Ok($"Primer salida registrada para {empleado.NombreCompleto} a las {horaFormateada}");
            }
            else if (asistenciaHoy.SegundaEntrada == null)
            {
                asistenciaHoy.SegundaEntrada = ahora;
                asistenciaHoy.Estado = EstadoAsistencia.Incompleta;
                await _context.SaveChangesAsync();

                return Ok($"Segunda entrada registrada para {empleado.NombreCompleto} a las {horaFormateada}");
            }
            else if (asistenciaHoy.SegundaSalida == null)
            {
                asistenciaHoy.SegundaSalida = ahora;
                asistenciaHoy.Estado = EstadoAsistencia.Completa;
                await _context.SaveChangesAsync();

                return Ok($"Segunda salida registrada para {empleado.NombreCompleto} a las {horaFormateada}");
            }
            else
            {
                return BadRequest("El empleado ya registró todas las entradas y salidas de hoy.");
            }
        }




        private bool AsistenciaExists(int id)
        {
            return _context.Asistencia.Any(e => e.Id == id);
        }
    }
}
