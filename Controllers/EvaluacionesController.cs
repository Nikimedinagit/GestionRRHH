using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionRRHH.Models.General;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;

namespace GestionRRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EvaluacionesController : ControllerBase
    {
        private readonly Context _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public EvaluacionesController(Context context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS DATOS DE LA EVALUACIONES SEGUN SUS FILTROS /////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<EvaluacionVista>>> EvaluacionFiltro([FromBody] EvaluacionFiltro filtro)
        {
            var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var usuarioActual = await _context.Users.FindAsync(userId);
            var emailActual = usuarioActual?.Email?.Trim().ToLower();

            var empleadoActual = await _context.Empleado.Include(e => e.Puesto)
                                                        .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

            var obtenerEvaluaciones = _context.Evaluacion
                .Where(h => h.Empleado != null && !h.Empleado.Eliminado)
                .Include(e => e.Empleado)
                    .ThenInclude(emp => emp.Puesto)
                .Include(e => e.CriterioDeEvaluacion)
                    .ThenInclude(ce => ce.TipoDeCriterio)
                .AsQueryable();

            if (rolActual == "EMPLEADO")
            {
                if (empleadoActual != null)
                    obtenerEvaluaciones = obtenerEvaluaciones.Where(e => e.EmpleadoId == empleadoActual.Id);
                else
                    return Ok(new List<EvaluacionVista>());
            }

            if (rolActual == "SUPERVISOR")
            {
                if (empleadoActual != null)
                {
                    var sectorId = empleadoActual.Puesto.SectorId;
                    obtenerEvaluaciones = obtenerEvaluaciones
                        .Where(e => e.Empleado.Puesto.SectorId == sectorId || e.Empleado.Email.Trim().ToLower() == emailActual);
                }
                else return Ok(new List<EvaluacionVista>());
            }

            if (!string.IsNullOrEmpty(filtro.NombreEmpleado))
                obtenerEvaluaciones = obtenerEvaluaciones
                    .Where(e => e.Empleado.NombreCompleto.ToLower().Contains(filtro.NombreEmpleado.ToLower()));

            if (filtro.Fecha.HasValue)
            {
                var fecha = filtro.Fecha.Value.Date;
                var fechaSiguiente = fecha.AddDays(1);
                obtenerEvaluaciones = obtenerEvaluaciones
                    .Where(e => e.Fecha >= fecha && e.Fecha < fechaSiguiente);
            }

            if (filtro.Calificacion.HasValue)
            {
                obtenerEvaluaciones = filtro.Calificacion.Value switch
                {
                    1 => obtenerEvaluaciones.Where(e => e.Calificacion < 5),
                    2 => obtenerEvaluaciones.Where(e => e.Calificacion >= 5 && e.Calificacion < 7),
                    3 => obtenerEvaluaciones.Where(e => e.Calificacion >= 7 && e.Calificacion < 9),
                    4 => obtenerEvaluaciones.Where(e => e.Calificacion >= 9),
                    _ => obtenerEvaluaciones
                };
            }

            var evaluaciones = await obtenerEvaluaciones
                    .OrderByDescending(e => e.Fecha)
                    .ThenByDescending(e => e.Calificacion)
                    .ThenBy(e => e.Empleado.NombreCompleto)
                    .ToListAsync();


            var listaVista = new List<EvaluacionVista>();

            foreach (var e in evaluaciones)
            {
                var usuarioEvaluador = await _context.Users.FindAsync(e.UsuarioId);
                var rolesEvaluador = usuarioEvaluador != null
                    ? await _userManager.GetRolesAsync(usuarioEvaluador)
                    : new List<string>();
                var rolEvaluador = rolesEvaluador.FirstOrDefault() ?? "Sin rol";

                bool esEditable = false;
                string claseBorde = "";
                bool esPropia = false;
                bool esParaEl = false;

                switch (rolActual)
                {
                    case "ADMINISTRADOR":
                        esEditable = true;
                        claseBorde = "";
                        esPropia = true;
                        break;

                    case "RRHH":
                        if (e.UsuarioId == userId)
                        {
                            esEditable = true;
                            claseBorde = "green";
                            esPropia = true;
                        }
                        else if (empleadoActual != null && e.EmpleadoId == empleadoActual.Id)
                        {
                            esEditable = false;
                            claseBorde = "blue";
                            esParaEl = true;
                        }
                        else
                        {
                            esEditable = false;
                            claseBorde = "yellow";
                            esPropia = false;
                        }
                        break;

                    case "SUPERVISOR":

                        if (e.UsuarioId == userId)
                        {
                            esEditable = true;
                            claseBorde = "green";
                            esPropia = true;
                        }
                        else if (empleadoActual != null && e.EmpleadoId == empleadoActual.Id)
                        {
                            esEditable = false;
                            claseBorde = "blue";
                            esParaEl = true;
                        }
                        else
                        {
                            esEditable = false;
                            claseBorde = "yellow";
                            esPropia = false;
                        }
                        break;


                    case "EMPLEADO":
                        esEditable = false;
                        claseBorde = "";
                        esPropia = false;
                        break;
                }

                listaVista.Add(new EvaluacionVista
                {
                    Id = e.Id,
                    Fecha = e.Fecha,
                    Calificacion = e.Calificacion,
                    EmpleadoId = e.EmpleadoId.ToString(),
                    EmpleadoNombre = e.Empleado.NombreCompleto,
                    EmpleadoPuesto = e.Empleado.Puesto.Descripcion,
                    UsuarioNombreEvaluador = usuarioEvaluador?.NombreCompleto ?? "Sin evaluador",
                    UsuarioRolEvaluador = rolEvaluador,
                    EsEditable = esEditable,
                    ClaseBorde = claseBorde,
                    EsPropia = esPropia,
                    EsParaEl = esParaEl,
                    UsuarioId = e.UsuarioId
                });
            }

            return Ok(listaVista);
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CREAR UNA NUEVA EVALUACION ////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
        [HttpPost]
        public async Task<ActionResult<Evaluacion>> PostEvaluacion(Evaluacion evaluacion)
        {
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;

            if (rolActual == "EMPLEADO")
            {
                return Forbid("Los empleados no pueden crear evaluaciones.");
            }

            var usuario = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (usuario == null)
                return Unauthorized("Usuario no encontrado.");

            var fechaActual = DateTime.Now;
            bool evaluacionExistente = false;

            if (rolActual == "RRHH")
            {
                evaluacionExistente = await _context.Evaluacion.AnyAsync(e =>
                    e.EmpleadoId == evaluacion.EmpleadoId &&
                    e.UsuarioId == userId &&
                    e.Fecha.Month == fechaActual.Month &&
                    e.Fecha.Year == fechaActual.Year);
            }
            else if (rolActual == "SUPERVISOR")
            {
                var calendario = System.Globalization.CultureInfo.CurrentCulture.Calendar;
                int semanaActual = calendario.GetWeekOfYear(fechaActual,
                    System.Globalization.CalendarWeekRule.FirstFourDayWeek,
                    DayOfWeek.Monday);

                var evaluacionesSupervisor = await _context.Evaluacion
                    .Where(e => e.EmpleadoId == evaluacion.EmpleadoId && e.UsuarioId == userId)
                    .ToListAsync();

                evaluacionExistente = evaluacionesSupervisor.Any(e =>
                {
                    int semanaEvaluacion = calendario.GetWeekOfYear(e.Fecha,
                        System.Globalization.CalendarWeekRule.FirstFourDayWeek,
                        DayOfWeek.Monday);
                    return semanaEvaluacion == semanaActual && e.Fecha.Year == fechaActual.Year;
                });
            }

            if (evaluacionExistente)
            {
                string mensaje = rolActual == "RRHH"
                    ? "No puede volver a evaluar a este empleado en este mes."
                    : "No puede volver a evaluar a este empleado en esta semana.";

                return BadRequest(new { codigo = 0, mensaje });
            }

            evaluacion.Fecha = fechaActual;
            evaluacion.UsuarioId = userId;

            _context.Evaluacion.Add(evaluacion);
            await _context.SaveChangesAsync();

            var empleadoEvaluado = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Id == evaluacion.EmpleadoId);

            if (empleadoEvaluado == null)
                return BadRequest(new { codigo = 0, mensaje = "Empleado no encontrado." });

            var usuarioEvaluador = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            _context.Notificaciones.Add(new Notificaciones
            {
                Titulo = "Nueva Evaluación",
                Mensaje = $"Has recibido una nueva evaluación realizada por {usuarioEvaluador?.NombreCompleto ?? "un evaluador"}.",
                FechaCreacion = DateTime.Now,
                UsuarioId = empleadoEvaluado.Id.ToString(),
                Leida = false
            });

            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEvaluacion", new { id = evaluacion.Id }, evaluacion);
        }




        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UNA EVALUACION ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEvaluacion(int id, Evaluacion evaluacion)
        {
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;

            var evaluacionOriginal = await _context.Evaluacion.FindAsync(id);
            if (evaluacionOriginal == null)
                return NotFound(new { codigo = 0, mensaje = "Evaluación no encontrada." });

            var fechaActual = DateTime.Now;
            bool evaluacionExistente = false;

            if (rolActual == "RRHH")
            {
                evaluacionExistente = await _context.Evaluacion.AnyAsync(e =>
                    e.EmpleadoId == evaluacion.EmpleadoId &&
                    e.UsuarioId == userId &&
                    e.Fecha.Month == fechaActual.Month &&
                    e.Fecha.Year == fechaActual.Year &&
                    e.Id != id);
            }
            else if (rolActual == "SUPERVISOR")
            {
                var calendario = System.Globalization.CultureInfo.CurrentCulture.Calendar;
                int semanaActual = calendario.GetWeekOfYear(fechaActual,
                    System.Globalization.CalendarWeekRule.FirstFourDayWeek,
                    DayOfWeek.Monday);

                var evaluacionesSupervisor = await _context.Evaluacion
                    .Where(e => e.EmpleadoId == evaluacion.EmpleadoId &&
                                e.UsuarioId == userId &&
                                e.Id != id)
                    .ToListAsync();

                evaluacionExistente = evaluacionesSupervisor.Any(e =>
                {
                    int semanaEvaluacion = calendario.GetWeekOfYear(e.Fecha,
                        System.Globalization.CalendarWeekRule.FirstFourDayWeek,
                        DayOfWeek.Monday);
                    return semanaEvaluacion == semanaActual && e.Fecha.Year == fechaActual.Year;
                });
            }

            if (evaluacionExistente)
            {
                string mensaje = rolActual == "RRHH"
                    ? "No puede volver a evaluar a este empleado en este mes."
                    : "No puede volver a evaluar a este empleado en esta semana.";

                return BadRequest(new { codigo = 0, mensaje });
            }

            evaluacionOriginal.Calificacion = evaluacion.Calificacion;
            evaluacionOriginal.EmpleadoId = evaluacion.EmpleadoId;
            evaluacionOriginal.Fecha = DateTime.Now;
            evaluacionOriginal.UsuarioId = userId;

            await _context.SaveChangesAsync();

            return Ok(evaluacionOriginal);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UNA EVALUACION POR ID ///////////////////////////////////////////////////////   
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Evaluacion>> GetEvaluacion(int id)
        {
            var evaluacion = await _context.Evaluacion.FindAsync(id);

            if (evaluacion == null)
            {
                return NotFound();
            }

            return evaluacion;
        }





















        private bool EvaluacionExists(int id)
        {
            return _context.Evaluacion.Any(e => e.Id == id);
        }
    }
}
