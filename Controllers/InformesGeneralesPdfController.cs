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



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA GENERAR EL INFORME DE ASISTENCIAS SEGUN SUS FILTROS /////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("GenerarInformeAsistencias")]
        public async Task<IActionResult> GenerarInformeAsistencias([FromBody] FiltrarAsistencia filtro)
        {
            var obtenerAsistencias = _context.Asistencia
                .Include(a => a.Empleado)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.NombreCompleto))
                obtenerAsistencias = obtenerAsistencias
                    .Where(a => a.Empleado.NombreCompleto.ToLower()
                    .Contains(filtro.NombreCompleto.ToLower()));

            if (filtro.DNI.HasValue)
                obtenerAsistencias = obtenerAsistencias
                    .Where(a => a.Empleado.DNI.ToString()
                    .StartsWith(filtro.DNI.Value.ToString()));

            if (!string.IsNullOrEmpty(filtro.NroLegajo))
                obtenerAsistencias = obtenerAsistencias
                    .Where(a => a.Empleado.NroLegajo.StartsWith(filtro.NroLegajo));

            if (filtro.EstadoAsistencia.HasValue)
                obtenerAsistencias = obtenerAsistencias
                    .Where(a => (int)a.Estado == filtro.EstadoAsistencia.Value);

            var fechaSeleccionada = filtro.Fecha ?? DateTime.Today;
            var fechaSiguiente = fechaSeleccionada.AddDays(1);
            obtenerAsistencias = obtenerAsistencias
                .Where(a => a.Fecha >= fechaSeleccionada && a.Fecha < fechaSiguiente);

            var asistencias = await obtenerAsistencias
                .Select(a => new
                {
                    a.Id,
                    EmpleadoNombre = a.Empleado.NombreCompleto,
                    Estado = a.Estado.ToString(),

                    PrimerEntrada = a.PrimerEntrada,
                    PrimerSalida = a.PrimerSalida,
                    SegundaEntrada = a.SegundaEntrada,
                    SegundaSalida = a.SegundaSalida
                })
                .ToListAsync();

            double totalHorasTrabajadas = asistencias.Sum(a =>
            {
                double h1 = (a.PrimerEntrada != null && a.PrimerSalida != null)
                    ? (a.PrimerSalida.Value - a.PrimerEntrada.Value).TotalHours
                    : 0;

                double h2 = (a.SegundaEntrada != null && a.SegundaSalida != null)
                    ? (a.SegundaSalida.Value - a.SegundaEntrada.Value).TotalHours
                    : 0;

                return h1 + h2;
            });

            var resumen = new
            {
                Total = asistencias.Count,
                Ausentes = asistencias.Count(a => a.Estado == "AUSENTE"),
                LlegadasTarde = asistencias.Count(a => a.Estado == "TARDE"),
                TotalHorasTrabajadas = totalHorasTrabajadas,
                FechaGeneracion = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss"),
                Filtros = filtro
            };

            return Ok(new { Asistencias = asistencias, Resumen = resumen });
        }




    }
}
