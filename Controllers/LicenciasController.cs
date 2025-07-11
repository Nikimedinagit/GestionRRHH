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
    [Authorize(Roles = "ADMINISTRADOR")]
    [Route("api/[controller]")]
    [ApiController]
    public class LicenciasController : ControllerBase
    {
        private readonly Context _context;

        public LicenciasController(Context context)
        {
            _context = context;
        }



        // GET: api/Licencias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Licencia>>> GetLicencia()
        {
            return await _context.Licencia
            .Include(l => l.TipoDeLicencia)
            .Include(l => l.Empleado)
            .ToListAsync();
        }

        // GET: api/Licencias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Licencia>> GetLicencia(int id)
        {
            var licencia = await _context.Licencia.FindAsync(id);

            if (licencia == null)
            {
                return NotFound();
            }

            return licencia;
        }

        // PUT: api/Licencias/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLicencia(int id, Licencia licencia)
        {
            if (id != licencia.Id)
            {
                return BadRequest();
            }

            // Buscar la licencia original
            var licenciaOriginal = await _context.Licencia.FindAsync(id);
            if (licenciaOriginal == null)
            {
                return NotFound();
            }

            // Validar solapamiento de fechas (igual que antes)
            var licenciasExistentes = await _context.Licencia
                .Where(l => l.EmpleadoId == licencia.EmpleadoId &&
                    l.Id != id && 
                    (l.Estado == EstadoLicencia.PENDIENTE || l.Estado == EstadoLicencia.APROBADA) &&
                    l.FechaInicio <= licencia.FechaFin &&
                    l.FechaFin >= licencia.FechaInicio
                )
                .ToListAsync();

            if (licenciasExistentes.Count > 0)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya tiene licencia aplicada." });
            }

            // Solo actualizar los campos permitidos
            licenciaOriginal.TipoDeLicenciaId = licencia.TipoDeLicenciaId;
            licenciaOriginal.EmpleadoId = licencia.EmpleadoId;
            licenciaOriginal.FechaInicio = licencia.FechaInicio;
            licenciaOriginal.FechaFin = licencia.FechaFin;
            licenciaOriginal.DocumentoAdjunto = licencia.DocumentoAdjunto;


            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LicenciaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(licenciaOriginal);
        }

        // POST: api/Licencias
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Licencia>> PostLicencia(Licencia licencia)
        {
            var licenciasExistentes = await _context.Licencia
            .Where(l => l.EmpleadoId == licencia.EmpleadoId &&
                (l.Estado == EstadoLicencia.PENDIENTE || l.Estado == EstadoLicencia.APROBADA) &&

                // Validar solapamiento de fechas
                l.FechaInicio <= licencia.FechaFin &&
                l.FechaFin >= licencia.FechaInicio
          )
            .ToListAsync();

            if (licenciasExistentes.Count > 0)
            {
                return BadRequest(new
                {
                    codigo = 0,
                    mensaje =
                "Ya tiene licencia aplicada."
                });
            }

            // Estado de la licencia por defecto
            licencia.Estado = EstadoLicencia.PENDIENTE;

            _context.Licencia.Add(licencia);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetLicencia", new { id = licencia.Id }, licencia);
        }

        // DELETE: api/Licencias/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLicencia(int id)
        {
            var licencia = await _context.Licencia.FindAsync(id);
            if (licencia == null)
            {
                return NotFound();
            }

            _context.Licencia.Remove(licencia);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool LicenciaExists(int id)
        {
            return _context.Licencia.Any(e => e.Id == id);
        }
    }
}
