using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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

        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaLicencia>>> LicenciaFiltrar([FromBody] LicenciaFiltrar filtro)
        {
            List<VistaLicencia> vista = new List<VistaLicencia>();

            var licenciasFiltradas = _context.Licencia.AsQueryable();

            if (filtro.Estado.HasValue)
                licenciasFiltradas = licenciasFiltradas.Where(t => (int)t.Estado == filtro.Estado);

            if (filtro.TipoDeLicenciaId.HasValue)
            {
                licenciasFiltradas = licenciasFiltradas.Where(t => t.TipoDeLicenciaId == filtro.TipoDeLicenciaId);
            }

            if (filtro.FechaInicio.HasValue && filtro.FechaFin.HasValue)
            {
                var fechaInicio = filtro.FechaInicio.Value.Date;
                var fechaFin = filtro.FechaFin.Value.Date;

                licenciasFiltradas = licenciasFiltradas
                    .Where(t => t.FechaInicio >= fechaInicio && t.FechaFin <= fechaFin);
            }

            if (!string.IsNullOrEmpty(filtro.EmpleadoTexto))
            {
                licenciasFiltradas = licenciasFiltradas.Where(x =>
                    x.Empleado.NombreCompleto.Contains(filtro.EmpleadoTexto));
            }

            var listaFiltrada = await licenciasFiltradas
                .Include(l => l.TipoDeLicencia)
                .Include(l => l.Empleado)
                .ToListAsync();

            // Actualizar licencias expiradas
            var hoy = DateTime.Today;
            foreach (var lic in listaFiltrada)
            {
                if (lic.Estado == EstadoLicencia.APROBADA && lic.FechaFin < hoy)
                {
                    lic.Estado = EstadoLicencia.EXPIRADA;
                    _context.Licencia.Update(lic);
                }
            }
            await _context.SaveChangesAsync();

            // Armar lista de respuesta
            foreach (var licencia in listaFiltrada)
            {
                var vistaLicencia = new VistaLicencia
                {
                    Id = licencia.Id,
                    TipoDeLicenciaString = licencia.TipoDeLicenciaString,
                    TipoDeLicenciaId = licencia.TipoDeLicenciaId,
                    FechaInicioString = licencia.FechaInicioString,
                    FechaFinString = licencia.FechaFinString,
                    EstadoString = licencia.Estado.ToString(),
                    DocumentoAdjunto = licencia.DocumentoAdjunto,
                    EmpleadoString = licencia.EmpleadoString,
                    EmpleadoId = licencia.EmpleadoId
                };
                vista.Add(vistaLicencia);
            }

            return vista;
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

        [HttpPost("{id}/Aprobar")]
        public async Task<IActionResult> AprobarLicencia(int id)
        {
            var licencia = await _context.Licencia.FindAsync(id);
            if (licencia == null)
                return NotFound();

            if (licencia.Estado != EstadoLicencia.PENDIENTE)
                return BadRequest("Solo se pueden aprobar licencias pendientes.");

            // Validar solapamiento de fechas para la aprobación (igual que en PutLicencia)
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
                return BadRequest(new { codigo = 0, mensaje = "Ya tiene licencia aplicada que solapa fechas." });
            }

            licencia.Estado = EstadoLicencia.APROBADA;
            _context.Licencia.Update(licencia);

            var usuarioId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Crear historial en LicenciasAprobadas
            var licenciaAprobada = new AprobacionDeLicencia
            {
                Estado = EstadoLicencia.APROBADA,
                LicenciaId = licencia.Id,
                FechDeAprobacion = DateTime.UtcNow,
                UsuarioAprobador = usuarioId

            };
            _context.AprobacionDeLicencia.Add(licenciaAprobada);

            await _context.SaveChangesAsync();

            return Ok(licencia);
        }

        [HttpPost("{id}/Rechazar")]
        public async Task<IActionResult> RechazarLicencia(int id)
        {
            var licencia = await _context.Licencia.FindAsync(id);
            if (licencia == null)
                return NotFound();

            if (licencia.Estado != EstadoLicencia.PENDIENTE)
                return BadRequest("Solo se pueden rechazar licencias pendientes.");

            licencia.Estado = EstadoLicencia.RECHAZADA;
            _context.Licencia.Update(licencia);
            await _context.SaveChangesAsync();

            return Ok(licencia);
        }


        // POST: api/Licencias
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Licencia>> PostLicencia(Licencia licencia)
        {
            var licenciasExistentes = await _context.Licencia
                .Where(l =>
                    l.EmpleadoId == licencia.EmpleadoId &&
                    (l.Estado == EstadoLicencia.PENDIENTE || l.Estado == EstadoLicencia.APROBADA) &&
                    l.FechaInicio <= licencia.FechaFin &&
                    l.FechaFin >= licencia.FechaInicio
                )
                .ToListAsync();

            if (licenciasExistentes.Any())
            {
                return BadRequest(new
                {
                    codigo = 0,
                    mensaje = "Ya tiene licencia aplicada."
                });
            }

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
