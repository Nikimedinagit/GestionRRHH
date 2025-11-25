using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkSync.Models.General;

namespace API_RRHH_TESIS2025.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpleadosController : ControllerBase
    {
        private readonly Context _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public EmpleadosController(Context context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
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
        /// METODO PARA OBTENER LA INFO DEL USUARIO LOGUEADO /////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("MiInformacion")]
        public async Task<ActionResult<VistaEmpleado>> MiInformacion()
        {
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var usuario = await _context.Users.FindAsync(userId);
            var emailUsuario = usuario?.Email?.Trim().ToLower();

            var empleado = await _context.Empleado
                .Include(e => e.Localidad)
                .Include(e => e.Puesto)
                .Where(e => e.Email.Trim().ToLower() == emailUsuario)
                .Select(e => new VistaEmpleado
                {
                    Id = e.Id,
                    NombreCompleto = e.NombreCompleto,
                    DNI = e.DNI,
                    Direccion = e.Direccion,
                    FechaNacimientoString = e.FechaNacimiento.ToString("dd/MM/yyyy"),
                    EstadoCivilesString = e.EstadoCiviles.ToString(),
                    Email = e.Email,
                    Telefono = e.Telefono,
                    Cuil = e.Cuil,
                    CantidadHijos = e.CantidadHijos,
                    TipoSexoString = e.TipoSexo.ToString(),
                    Edad = DateTime.Now.Year - e.FechaNacimiento.Year,
                    LocalidadIdString = e.Localidad.Nombre,
                    PuestoIdString = e.Puesto.Descripcion,
                    NroLegajo = e.NroLegajo
                }).FirstOrDefaultAsync();

            if (empleado == null) return NotFound();
            return empleado;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS EMPLEADOS POR SECTOR CON HORARIO ///////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "SUPERVISOR")]
        [HttpPost("FiltrarPorSectorYHorario")]
        public async Task<ActionResult<IEnumerable<object>>> FiltrarEmpleadoPorSectorYHorario([FromBody] FiltrarEmpleado filtro)
        {
            var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var emailActual = (await _context.Users.FindAsync(userId))?.Email.Trim().ToLower();

            var empleadosObtener = _context.Empleado
                .Include(e => e.Puesto)
                .Include(e => e.Localidad)
                .Include(e => e.Horario)
                .AsQueryable();

            if (rolActual == "SUPERVISOR")
            {
                var supervisor = await _context.Empleado
                    .Include(e => e.Puesto)
                    .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

                if (supervisor == null)
                    return Ok(new List<object>());

                var sectorId = supervisor.Puesto.SectorId;
                empleadosObtener = empleadosObtener.Where(e => e.Puesto.SectorId == sectorId);
            }

            if (!string.IsNullOrEmpty(filtro.NombreCompleto))
                empleadosObtener = empleadosObtener.Where(e => e.NombreCompleto.ToLower().Contains(filtro.NombreCompleto.ToLower()));

            if (filtro.DNI.HasValue)
                empleadosObtener = empleadosObtener.Where(e => e.DNI.ToString().StartsWith(filtro.DNI.Value.ToString()));

            if (!string.IsNullOrEmpty(filtro.NroLegajo))
                empleadosObtener = empleadosObtener.Where(e => e.NroLegajo.StartsWith(filtro.NroLegajo));

            if (filtro.EstadoCiviles.HasValue)
                empleadosObtener = empleadosObtener.Where(e => (int)e.EstadoCiviles == filtro.EstadoCiviles);

            if (filtro.TipoSexo.HasValue)
                empleadosObtener = empleadosObtener.Where(e => (int)e.TipoSexo == filtro.TipoSexo);

            if (filtro.LocalidadId.HasValue)
                empleadosObtener = empleadosObtener.Where(e => e.LocalidadId == filtro.LocalidadId.Value);

            if (filtro.PuestoId.HasValue)
                empleadosObtener = empleadosObtener.Where(e => e.PuestoId == filtro.PuestoId.Value);

            var empleados = await empleadosObtener
                .OrderBy(e => e.Eliminado)
                .ThenBy(e => e.NombreCompleto)
                .Select(e => new
                {
                    e.Id,
                    e.NombreCompleto,
                    e.DNI,
                    e.NroLegajo,
                    e.Email,
                    e.Telefono,
                    e.Direccion,
                    e.Cuil,
                    e.CantidadHijos,
                    FechaNacimiento = e.FechaNacimiento.ToString("dd/MM/yyyy"),
                    e.Eliminado,
                    EstadoCivil = e.EstadoCiviles.ToString(),
                    TipoSexo = e.TipoSexo.ToString(),
                    Edad = e.Edad,
                    Puesto = e.Puesto.Descripcion,
                    Localidad = e.Localidad.Nombre,
                    Horario = e.Horario
                        .OrderByDescending(h => h.Id)
                        .Select(h => new
                        {
                            h.TipoHorario,
                            TipoHorarioString = h.TipoHorario.ToString(),
                            h.HorarioInicioString,
                            h.HorarioFinString,
                            h.SegundoHorarioInicioString,
                            h.SegundoHorarioFinString,
                            h.Lunes,
                            h.Martes,
                            h.Miercoles,
                            h.Jueves,
                            h.Viernes,
                            h.Sabado,
                            h.Domingo
                        })
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(empleados);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA BTENER LOS EMPELADOS SEGUN SU FILTRO Y MOSTRAR EN LAS VISTAS /////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaEmpleado>>> FiltrarEmpleado([FromBody] FiltrarEmpleado filtro)
        {
            var obtenerEmpleados = _context.Empleado
                .Include(e => e.Localidad)
                .Include(e => e.Puesto)
                .AsQueryable();

            var rol = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;


            if (!string.IsNullOrWhiteSpace(filtro.NombreCompleto))
            {
                var nombreFiltro = filtro.NombreCompleto.ToLower();
                obtenerEmpleados = obtenerEmpleados.Where(e => e.NombreCompleto.ToLower().Contains(nombreFiltro));
            }


            if (filtro.DNI.HasValue)
                obtenerEmpleados = obtenerEmpleados.Where(e => e.DNI.ToString().StartsWith(filtro.DNI.Value.ToString()));

            if (!string.IsNullOrEmpty(filtro.NroLegajo))
            {
                obtenerEmpleados = obtenerEmpleados.Where(e => e.NroLegajo.StartsWith(filtro.NroLegajo));
            }

            if (filtro.EstadoCiviles.HasValue)
                obtenerEmpleados = obtenerEmpleados.Where(e => (int)e.EstadoCiviles == filtro.EstadoCiviles);

            if (filtro.TipoSexo.HasValue)
                obtenerEmpleados = obtenerEmpleados.Where(e => (int)e.TipoSexo == filtro.TipoSexo);

            if (filtro.LocalidadId.HasValue)
                obtenerEmpleados = obtenerEmpleados.Where(e => e.LocalidadId == filtro.LocalidadId.Value);

            if (filtro.PuestoId.HasValue)
                obtenerEmpleados = obtenerEmpleados.Where(e => e.PuestoId == filtro.PuestoId.Value);

            var empleados = await obtenerEmpleados
                .OrderBy(e => e.Eliminado)
                .ThenBy(e => e.NombreCompleto)
                .Select(e => new VistaEmpleado
                {
                    Id = e.Id,
                    NombreCompleto = e.NombreCompleto,
                    DNI = e.DNI,
                    NroLegajo = e.NroLegajo,
                    Direccion = e.Direccion,
                    FechaNacimientoString = e.FechaNacimiento.ToString("dd/MM/yyyy"),
                    EstadoCivilesString = e.EstadoCiviles.ToString(),
                    EstadoCiviles = e.EstadoCiviles,
                    Email = e.Email,
                    Telefono = e.Telefono,
                    Cuil = e.Cuil,
                    Edad = e.Edad,
                    CantidadHijos = e.CantidadHijos,
                    TipoSexoString = e.TipoSexo.ToString(),
                    TipoSexo = e.TipoSexo,
                    LocalidadIdString = e.Localidad.Nombre,
                    LocalidadId = e.LocalidadId,
                    PuestoIdString = e.Puesto.Descripcion,
                    PuestoId = e.PuestoId,
                    UsuarioNombreCreador = _context.Users.FirstOrDefault(u => u.Id == e.UsuarioId).NombreCompleto,
                    UsuarioEmailCreador = _context.Users.FirstOrDefault(u => u.Id == e.UsuarioId).Email,
                    Eliminado = e.Eliminado
                })
                .ToListAsync();

            return empleados;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UN EMPLEADO POR ID ///////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Empleado>> GetEmpleado(int id)
        {
            var empleado = await _context.Empleado.FindAsync(id);

            if (empleado == null)
            {
                return NotFound();
            }

            return empleado;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CREAR UN EMPLEADO ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost]
        public async Task<ActionResult<Empleado>> PostEmpleado(Empleado empleado)
        {
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            empleado.NombreCompleto = empleado.NombreCompleto?.ToUpper();
            empleado.Direccion = empleado.Direccion?.ToUpper();
            empleado.Email = empleado.Email?.ToLower();
            empleado.Telefono = empleado.Telefono?.ToLower();
            empleado.Edad = DateTime.Now.Year - empleado.FechaNacimiento.Year - (DateTime.Now.DayOfYear < empleado.FechaNacimiento.DayOfYear ? 1 : 0);
            empleado.UsuarioId = userId;
            empleado.Eliminado = true;

            var duplicado = await _context.Empleado.FirstOrDefaultAsync(e =>
                e.Id != empleado.Id &&
                (e.DNI == empleado.DNI ||
                 e.Cuil == empleado.Cuil ||
                 e.Email.ToLower() == empleado.Email.ToLower() ||
                 e.Telefono.ToLower() == empleado.Telefono.ToLower())
            );

            var errores = new List<string>();
            if (duplicado != null)
            {
                if (duplicado.DNI == empleado.DNI) errores.Add("El DNI ya existe.");
                if (duplicado.Cuil == empleado.Cuil) errores.Add("El CUIL ya existe.");
                if (duplicado.Email.ToLower() == empleado.Email.ToLower()) errores.Add("El Email ya existe.");
                if (duplicado.Telefono.ToLower() == empleado.Telefono.ToLower()) errores.Add("El Teléfono ya existe.");
            }

            if (errores.Any())
                return BadRequest(new { codigo = 0, mensaje = errores });

            int ultimoLegajo = await _context.Empleado
                .MaxAsync(e => (int?)Convert.ToInt32(e.NroLegajo)) ?? 0;

            int nuevoLegajo = ultimoLegajo + 1;
            empleado.NroLegajo = nuevoLegajo.ToString("D6");

            _context.Empleado.Add(empleado);
            await _context.SaveChangesAsync();

            var activacion = new ActivacionEmpleado
            {
                FechaActivacion = null,
                Activo = false,
                EmpleadoId = empleado.Id,
            };

            _context.ActivacionEmpleado.Add(activacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEmpleado", new { id = empleado.Id }, empleado);
        }




        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UN EMPLEADO ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpleado(int id, Empleado empleado)
        {
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Sistema";

            var empelados = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Id == id);

            empleado.NombreCompleto = empleado.NombreCompleto?.ToUpper();
            empleado.Direccion = empleado.Direccion?.ToUpper();
            empleado.Email = empleado.Email?.ToLower();
            empleado.Telefono = empleado.Telefono?.ToLower();

            var errores = new List<string>();

            if (!string.IsNullOrWhiteSpace(empleado.Telefono) &&
                await _context.Empleado.AnyAsync(e => e.Id != id && e.Telefono.ToLower() == empleado.Telefono.ToLower()))
                errores.Add("El Teléfono ya existe.");

            if (await _context.Empleado.AnyAsync(e => e.Id != id && e.Cuil == empleado.Cuil))
                errores.Add("El CUIL ya existe.");

            if (errores.Any())
                return BadRequest(new { codigo = 0, mensaje = errores });

            var puestoAnterior = empelados.Puesto?.Descripcion ?? "Desconocido";
            var puestoNuevo = (await _context.Puesto.FindAsync(empleado.PuestoId))?.Descripcion ?? "Desconocido";

            if (puestoAnterior != puestoNuevo)
            {
                _context.HistorialLaboral.Add(new HistorialLaboral
                {
                    FechaModificacion = DateTime.Now,
                    EmpleadoId = empelados.Id,
                    PuestoAnterior = puestoAnterior,
                    PuestoActual = puestoNuevo,
                    UsuarioModificador = userId
                });
            }

            empelados.FechaNacimiento = empleado.FechaNacimiento;
            empelados.Direccion = empleado.Direccion;
            empelados.Telefono = empleado.Telefono;
            empelados.EstadoCiviles = empleado.EstadoCiviles;
            empelados.CantidadHijos = empleado.CantidadHijos;
            empelados.TipoSexo = empleado.TipoSexo;
            empelados.LocalidadId = empleado.LocalidadId;
            empelados.PuestoId = empleado.PuestoId;

            await _context.SaveChangesAsync();

            return Ok(empelados);
        }




        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///  METDO APRA ALTERNAR EL ELIMINADO DE UN EMPLEADO /////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpleado(int id)
        {
            var empleado = await _context.Empleado.FindAsync(id);
            empleado.Eliminado = !empleado.Eliminado;
            var mensaje = empleado.Eliminado ?
                "Empleado Desactivado" :
                "Empleado Activado";

            _context.Empleado.Update(empleado);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje });
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER TODOS LOS EMPLEADOS ACTIVOS ///////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("Activos")]
        public async Task<ActionResult<IEnumerable<Empleado>>> GetEmpleadosActivos()
        {
            var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var obtenerEmpelados = _context.Empleado
                .Where(e => !e.Eliminado)
                .Include(e => e.Puesto)
                .AsQueryable();

            if (rolActual == "SUPERVISOR")
            {
                var usuario = await _context.Users.FindAsync(userId);
                var email = usuario?.Email?.Trim().ToLower();

                var supervisor = await _context.Empleado
                    .Include(e => e.Puesto)
                    .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == email);

                if (supervisor == null || supervisor.Puesto == null)
                {
                    return Ok(new List<Empleado>());
                }

                var sectorId = supervisor.Puesto.SectorId;

                obtenerEmpelados = obtenerEmpelados.Where(e => e.Puesto.SectorId == sectorId);
            }

            var empleados = await obtenerEmpelados
                .OrderBy(e => e.NombreCompleto)
                .ToListAsync();

            return Ok(empleados);
        }




        [HttpGet("Buscar")]
        public async Task<ActionResult<VistaEmpleado>> BuscarEmpleado([FromQuery] long dni)
        {
            var empleado = await _context.Empleado
                .Include(e => e.Localidad)
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.DNI == dni && !e.Eliminado);


            var vista = new VistaEmpleado
            {
                Id = empleado.Id,
                NombreCompleto = empleado.NombreCompleto,
                DNI = empleado.DNI,
                NroLegajo = empleado.NroLegajo,
                Direccion = empleado.Direccion,
                FechaNacimientoString = empleado.FechaNacimientoString,
                EstadoCivilesString = empleado.EstadoCivilesString,
                Email = empleado.Email,
                Telefono = empleado.Telefono,
                Cuil = empleado.Cuil,
                CantidadHijos = empleado.CantidadHijos,
                TipoSexoString = empleado.TipoSexoString,
                LocalidadIdString = empleado.LocalidadIdString,
                PuestoIdString = empleado.PuestoIdString,
                Edad = empleado.Edad,
                UsuarioId = empleado.UsuarioId,
                Eliminado = empleado.Eliminado
            };

            return Ok(vista);
        }




        




        private bool EmpleadoExists(int id)
        {
            return _context.Empleado.Any(e => e.Id == id);
        }
    }
}
