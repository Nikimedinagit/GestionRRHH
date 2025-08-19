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
using Microsoft.AspNetCore.Identity;

namespace API_NET_CORE8_RRHH.Controllers
{
    [Authorize(Roles = "ADMINISTRADOR")]
    [Route("api/[controller]")]
    [ApiController]
    public class LicenciasController : ControllerBase
    {
        private readonly Context _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public LicenciasController(Context context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }



        // GET: api/Licencias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Licencia>>> GetLicencia()
        {
            return await _context.Licencia
                .Include(l => l.TipoDeLicencia)
                .Include(l => l.Empleado)
                .Where(l => l.Empleado != null && !l.Empleado.Eliminado)
                .OrderBy(l =>
                    l.Estado == EstadoLicencia.PENDIENTE ? 0 :
                    l.Estado == EstadoLicencia.APROBADA ? 1 :
                    l.Estado == EstadoLicencia.RECHAZADA ? 2 :
                    l.Estado == EstadoLicencia.EXPIRADA ? 3 : 4)
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


        [HttpGet("Documento/{id}")]
        public async Task<IActionResult> DescargarDocumento(int id)
        {
            var licencia = await _context.Licencia.FindAsync(id);
            if (licencia == null || licencia.DocumentoAdjunto == null)
                return NotFound();

            // Usar nombre y tipo original
            var nombreArchivo = licencia.DocumentoNombre ?? $"Licencia_{id}";
            var mimeType = licencia.DocumentoMimeType ?? "application/octet-stream";

            return File(licencia.DocumentoAdjunto, mimeType, nombreArchivo);
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
                .Where(l => l.Empleado != null && !l.Empleado.Eliminado)
                .OrderBy(l =>
                    l.Estado == EstadoLicencia.PENDIENTE ? 0 :
                    l.Estado == EstadoLicencia.APROBADA ? 1 :
                    l.Estado == EstadoLicencia.RECHAZADA ? 2 :
                    l.Estado == EstadoLicencia.EXPIRADA ? 3 : 4)
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
                    EmpleadoId = licencia.EmpleadoId,
                    DocumentoNombre = licencia.DocumentoNombre,
                    DocumentoMimeType = licencia.DocumentoMimeType
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
        public async Task<ActionResult<Licencia>> PostLicencia([FromForm] Licencia licencia, IFormFile DocumentoAdjunto)

        {
            // Validación de licencias existentes
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
                return BadRequest(new { codigo = 0, mensaje = "Ya tiene licencia aplicada." });
            }

            licencia.Estado = EstadoLicencia.PENDIENTE;

            // Guardar archivo en la base de datos
            if (DocumentoAdjunto != null && DocumentoAdjunto.Length > 0)
            {
                using (var ms = new MemoryStream())
                {
                    await DocumentoAdjunto.CopyToAsync(ms);
                    licencia.DocumentoAdjunto = ms.ToArray();
                }
                licencia.DocumentoNombre = DocumentoAdjunto.FileName;
                licencia.DocumentoMimeType = DocumentoAdjunto.ContentType;
            }

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





        //METODOS PARA FILTRAR EN LAS CARD DE ESTADISTICAS
        //Total de licencias
        [HttpGet("Total")]
        public async Task<ActionResult<int>> GetTotalLicencias()
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

            // Consultar todas las licencias de empleados no eliminados
            var total = await _context.Licencia
                .Include(l => l.Empleado)
                .Where(l => !l.Empleado.Eliminado)
                .CountAsync();

            return Ok(new { total });
        }

        //Licencias aprobadas
        [HttpGet("Aprobadas")]
        public async Task<ActionResult<int>> GetAprobadasLicencias()
        {
            // Validar rol ADMINISTRADOR directamente de claims (optimización, si lo tienes)
            var roles = HttpContext.User.FindAll(ClaimTypes.Role).Select(r => r.Value);
            if (!roles.Contains("ADMINISTRADOR"))
            {
                return Forbid();
            }

            // Obtener el total de licencias aprobadas
            var total = await _context.Licencia
                .Include(l => l.TipoDeLicencia)
                .Where(l => l.Estado == EstadoLicencia.APROBADA)
                .CountAsync();

            return Ok(new { total });
        }

        //Licencias rechazadas
        [HttpGet("Rechazadas")]
        public async Task<ActionResult<int>> GetRechazadasLicencias()
        {
            // Validar rol ADMINISTRADOR directamente de claims (optimización, si lo tienes)
            var roles = HttpContext.User.FindAll(ClaimTypes.Role).Select(r => r.Value);
            if (!roles.Contains("ADMINISTRADOR"))
            {
                return Forbid();
            }

            // Obtener el total de licencias rechazadas
            var total = await _context.Licencia
                .Include(l => l.TipoDeLicencia)
                .Where(l => l.Estado == EstadoLicencia.RECHAZADA)
                .CountAsync();

            return Ok(new { total });
        }

        //Licencias expiradas
        [HttpGet("Expiradas")]
        public async Task<ActionResult<int>> GetExpiradasLicencias()
        {
            // Validar rol ADMINISTRADOR directamente de claims (optimización, si lo tienes)
            var roles = HttpContext.User.FindAll(ClaimTypes.Role).Select(r => r.Value);
            if (!roles.Contains("ADMINISTRADOR"))
            {
                return Forbid();
            }

            // Obtener el total de licencias expiradas
            var total = await _context.Licencia
                .Include(l => l.TipoDeLicencia)
                .Where(l => l.Estado == EstadoLicencia.EXPIRADA)
                .CountAsync();

            return Ok(new { total });
        }

        //Licencias pendientes
        [HttpGet("Pendientes")]
        public async Task<ActionResult<int>> GetPendientesLicencias()
        {
            // Validar rol ADMINISTRADOR directamente de claims (optimización, si lo tienes)
            var roles = HttpContext.User.FindAll(ClaimTypes.Role).Select(r => r.Value);
            if (!roles.Contains("ADMINISTRADOR"))
            {
                return Forbid();
            }

            // Obtener el total de licencias pendientes
            var total = await _context.Licencia
                .Include(l => l.TipoDeLicencia)
                .Where(l => l.Estado == EstadoLicencia.PENDIENTE)
                .CountAsync();

            return Ok(new { total });
        }

        private bool LicenciaExists(int id)
        {
            return _context.Licencia.Any(e => e.Id == id);
        }
    }
}
