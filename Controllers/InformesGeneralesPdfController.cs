using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.EntityFrameworkCore;

namespace API_NET_CORE8_RRHH.Controllers
{
    [Authorize(Roles = "ADMINISTRADOR, RRHH")]
    [Route("api/[controller]")]
    [ApiController]
    public class InformesGeneralesPdfController : ControllerBase
    {
        private readonly Context _context;

        public InformesGeneralesPdfController(Context context)
        {
            _context = context;

        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA GENERAR EL INFORME PDF DE EMPLEADOS SEGUN FILTRO /////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("GenerarInformeEmpleados")]
        public IActionResult FiltrarEmpleados([FromBody] FiltrarEmpleado filtro)
        {
            var obtenerEmpleados = _context.Empleado
                .Include(e => e.Localidad)
                .Include(e => e.Puesto)
                .Where(e => !e.Eliminado)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.NombreCompleto))
            {
                var nombreFiltro = filtro.NombreCompleto.ToLower();
                obtenerEmpleados = obtenerEmpleados.Where(e => e.NombreCompleto.ToLower().Contains(nombreFiltro));
            }

            if (filtro.DNI.HasValue)
                obtenerEmpleados = obtenerEmpleados.Where(e => e.DNI.ToString().StartsWith(filtro.DNI.Value.ToString()));

            if (!string.IsNullOrEmpty(filtro.NroLegajo))
                obtenerEmpleados = obtenerEmpleados.Where(e => e.NroLegajo.StartsWith(filtro.NroLegajo));

            if (filtro.EstadoCiviles.HasValue)
                obtenerEmpleados = obtenerEmpleados.Where(e => (int)e.EstadoCiviles == filtro.EstadoCiviles);

            if (filtro.TipoSexo.HasValue)
                obtenerEmpleados = obtenerEmpleados.Where(e => (int)e.TipoSexo == filtro.TipoSexo);

            if (filtro.LocalidadId.HasValue)
                obtenerEmpleados = obtenerEmpleados.Where(e => e.LocalidadId == filtro.LocalidadId.Value);

            if (filtro.PuestoId.HasValue)
                obtenerEmpleados = obtenerEmpleados.Where(e => e.PuestoId == filtro.PuestoId.Value);

            var empleados = obtenerEmpleados.ToList();

            var resumen = new
            {
                Total = empleados.Count,
                Hombres = empleados.Count(e => e.TipoSexo == TipoSexo.MASCULINO),
                Mujeres = empleados.Count(e => e.TipoSexo == TipoSexo.FEMENINO),
                NoBinario = empleados.Count(e => e.TipoSexo == TipoSexo.NO_BINARIO),
                Otros = empleados.Count(e => e.TipoSexo == TipoSexo.OTRO),
                Filtros = filtro,
                FechaGeneracion = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")
            };

            return Ok(new { Empleados = empleados, Resumen = resumen });
        }








    }
}
