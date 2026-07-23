using System.Globalization;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using GestionRRHH.Models.General;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionRRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AsignacionResponsabilidadesTareasController : ControllerBase
    {
        private readonly Context _context;

        public AsignacionResponsabilidadesTareasController(Context context)
        {
            _context = context;
        }

        private string NormalizarTextoBusqueda(string texto)
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

        private string SanitizarTextoConFormato(string texto)
        {
            if (string.IsNullOrWhiteSpace(texto)) return string.Empty;

            var limpio = Regex.Replace(texto, @"<\s*(script|style)[^>]*>.*?<\s*/\s*\1\s*>", string.Empty, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            limpio = Regex.Replace(limpio, @"</?\s*([a-zA-Z0-9]+)(?:\s+[^>]*)?>", match =>
            {
                var etiqueta = match.Groups[1].Value.ToLowerInvariant();
                var permitidas = new HashSet<string> { "b", "strong", "i", "em", "u", "br", "ul", "ol", "li", "div", "p" };

                if (!permitidas.Contains(etiqueta))
                    return string.Empty;

                if (etiqueta == "br")
                    return "<br>";

                return match.Value.StartsWith("</") ? $"</{etiqueta}>" : $"<{etiqueta}>";
            }, RegexOptions.IgnoreCase);

            return limpio.Trim();
        }

        private string TextoPlanoDesdeHtml(string texto)
        {
            if (string.IsNullOrWhiteSpace(texto)) return string.Empty;

            var sinTags = Regex.Replace(texto, "<.*?>", " ");
            return WebUtility.HtmlDecode(sinTags).Trim();
        }

        private IQueryable<AsignacionResponsabilidadTarea> AplicarAlcancePorRol(IQueryable<AsignacionResponsabilidadTarea> query)
        {
            var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (rolActual == "EMPLEADO")
            {
                var email = _context.Users
                    .Where(u => u.Id == userId)
                    .Select(u => u.Email)
                    .FirstOrDefault();

                if (string.IsNullOrWhiteSpace(email))
                    return query.Where(a => false);

                query = query.Where(a => a.Empleado.Email.Trim().ToLower() == email.Trim().ToLower());
            }

            if (rolActual == "SUPERVISOR")
            {
                var email = _context.Users
                    .Where(u => u.Id == userId)
                    .Select(u => u.Email)
                    .FirstOrDefault();

                var supervisor = _context.Empleado
                    .Include(e => e.Puesto)
                    .FirstOrDefault(e => e.Email.Trim().ToLower() == email.Trim().ToLower());

                if (supervisor == null || supervisor.Puesto == null)
                    return query.Where(a => false);

                query = query.Where(a => a.Empleado.Puesto.SectorId == supervisor.Puesto.SectorId);
            }

            return query;
        }

        private IQueryable<Empleado> AplicarAlcanceEmpleadosPorRol(IQueryable<Empleado> query)
        {
            var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (rolActual == "SUPERVISOR")
            {
                var email = _context.Users
                    .Where(u => u.Id == userId)
                    .Select(u => u.Email)
                    .FirstOrDefault();

                var supervisor = _context.Empleado
                    .Include(e => e.Puesto)
                    .FirstOrDefault(e => e.Email.Trim().ToLower() == email.Trim().ToLower());

                if (supervisor == null || supervisor.Puesto == null)
                    return query.Where(e => false);

                query = query.Where(e => e.Puesto.SectorId == supervisor.Puesto.SectorId);
            }

            return query;
        }

        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
        [HttpGet("EmpleadosDisponibles")]
        public async Task<ActionResult<IEnumerable<object>>> EmpleadosDisponibles([FromQuery] int? empleadoIdActual)
        {
            var empleadosAsignados = _context.AsignacionResponsabilidadTarea
                .Where(a => !a.Eliminado && (!empleadoIdActual.HasValue || a.EmpleadoId != empleadoIdActual.Value))
                .Select(a => a.EmpleadoId);

            var query = _context.Empleado
                .AsNoTracking()
                .Include(e => e.Puesto)
                .Where(e => !e.Eliminado && !empleadosAsignados.Contains(e.Id))
                .AsQueryable();

            query = AplicarAlcanceEmpleadosPorRol(query);

            var empleados = await query
                .OrderBy(e => e.NombreCompleto)
                .Select(e => new
                {
                    e.Id,
                    e.NombreCompleto,
                    Puesto = e.Puesto.Descripcion
                })
                .ToListAsync();

            return Ok(empleados);
        }

        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaAsignacionResponsabilidadTarea>>> Filtrar([FromBody] AsignacionResponsabilidadTareaFiltrar filtro)
        {
            var query = _context.AsignacionResponsabilidadTarea
                .AsNoTracking()
                .Include(a => a.Empleado)
                .ThenInclude(e => e.Puesto)
                .AsQueryable();

            query = AplicarAlcancePorRol(query);

            if (!string.IsNullOrWhiteSpace(filtro.Busqueda))
            {
                var busqueda = filtro.Busqueda.Trim().ToLower();
                query = query.Where(a =>
                    a.Responsabilidades.ToLower().Contains(busqueda) ||
                    a.Tareas.ToLower().Contains(busqueda));
            }

            if (filtro.EmpleadoId.HasValue && filtro.EmpleadoId.Value > 0)
                query = query.Where(a => a.EmpleadoId == filtro.EmpleadoId.Value);

            if (filtro.Eliminado.HasValue)
            {
                var eliminado = filtro.Eliminado.Value == 1;
                query = query.Where(a => a.Eliminado == eliminado);
            }

            var asignaciones = await query
                .OrderBy(a => a.Eliminado)
                .ThenBy(a => a.Empleado.NombreCompleto)
                .Select(a => new VistaAsignacionResponsabilidadTarea
                {
                    Id = a.Id,
                    Responsabilidades = a.Responsabilidades,
                    Tareas = a.Tareas,
                    EmpleadoId = a.EmpleadoId,
                    EmpleadoString = a.EmpleadoString,
                    PuestoString = a.Empleado.Puesto.Descripcion,
                    Eliminado = a.Eliminado
                })
                .ToListAsync();

            return Ok(asignaciones);
        }

        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
        [HttpPost]
        public async Task<ActionResult<AsignacionResponsabilidadTarea>> Post([FromBody] AsignacionResponsabilidadTarea asignacion)
        {
            asignacion.Responsabilidades = SanitizarTextoConFormato(asignacion.Responsabilidades);
            asignacion.Tareas = SanitizarTextoConFormato(asignacion.Tareas);

            if (string.IsNullOrWhiteSpace(TextoPlanoDesdeHtml(asignacion.Responsabilidades)))
                return BadRequest(new { codigo = 0, mensaje = "Debe ingresar responsabilidades." });

            if (string.IsNullOrWhiteSpace(TextoPlanoDesdeHtml(asignacion.Tareas)))
                return BadRequest(new { codigo = 0, mensaje = "Debe ingresar tareas." });

            var empleadoExiste = await _context.Empleado.AnyAsync(e => e.Id == asignacion.EmpleadoId && !e.Eliminado);
            if (!empleadoExiste)
                return BadRequest(new { codigo = 0, mensaje = "Debe seleccionar un empleado activo." });

            var existe = await _context.AsignacionResponsabilidadTarea.AnyAsync(a =>
                a.EmpleadoId == asignacion.EmpleadoId &&
                !a.Eliminado);

            if (existe)
                return BadRequest(new { codigo = 0, mensaje = "El empleado ya tiene una asignación activa." });

            _context.AsignacionResponsabilidadTarea.Add(asignacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = asignacion.Id }, asignacion);
        }

        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] AsignacionResponsabilidadTarea asignacion)
        {
            var original = await _context.AsignacionResponsabilidadTarea.FindAsync(id);
            if (original == null) return NotFound();

            var responsabilidadesNormalizadas = SanitizarTextoConFormato(asignacion.Responsabilidades);
            var tareasNormalizadas = SanitizarTextoConFormato(asignacion.Tareas);

            if (string.IsNullOrWhiteSpace(TextoPlanoDesdeHtml(responsabilidadesNormalizadas)))
                return BadRequest(new { codigo = 0, mensaje = "Debe ingresar responsabilidades." });

            if (string.IsNullOrWhiteSpace(TextoPlanoDesdeHtml(tareasNormalizadas)))
                return BadRequest(new { codigo = 0, mensaje = "Debe ingresar tareas." });

            var empleadoExiste = await _context.Empleado.AnyAsync(e => e.Id == asignacion.EmpleadoId && !e.Eliminado);
            if (!empleadoExiste)
                return BadRequest(new { codigo = 0, mensaje = "Debe seleccionar un empleado activo." });

            var existe = await _context.AsignacionResponsabilidadTarea.AnyAsync(a =>
                a.Id != id &&
                a.EmpleadoId == asignacion.EmpleadoId &&
                !a.Eliminado);

            if (existe)
                return BadRequest(new { codigo = 0, mensaje = "El empleado ya tiene una asignación activa." });

            original.Responsabilidades = responsabilidadesNormalizadas;
            original.Tareas = tareasNormalizadas;
            original.EmpleadoId = asignacion.EmpleadoId;
            original.Eliminado = asignacion.Eliminado;

            await _context.SaveChangesAsync();

            return Ok(original);
        }

        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var asignacion = await _context.AsignacionResponsabilidadTarea.FindAsync(id);
            if (asignacion == null) return NotFound();

            asignacion.Eliminado = !asignacion.Eliminado;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = asignacion.Eliminado ? "Asignación Desactivada" : "Asignación Activada" });
        }

        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("{id}")]
        public async Task<ActionResult<AsignacionResponsabilidadTarea>> Get(int id)
        {
            var asignacion = await _context.AsignacionResponsabilidadTarea
                .Include(a => a.Empleado)
                .ThenInclude(e => e.Puesto)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (asignacion == null) return NotFound();

            return asignacion;
        }
    }
}
