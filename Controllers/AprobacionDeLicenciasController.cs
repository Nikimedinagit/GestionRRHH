using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;

namespace API_NET_CORE8_RRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AprobacionDeLicenciasController : ControllerBase
    {
        private readonly Context _context;

        public AprobacionDeLicenciasController(Context context)
        {
            _context = context;
        }

        // GET: api/AprobacionDeLicencias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AprobacionDeLicencia>>> GetAprobacionDeLicencia()
        {
            return await _context.AprobacionDeLicencia
            .Include(a => a.Licencia)
            .ThenInclude(l => l.TipoDeLicencia)
            .ToListAsync();
        }

        // GET: api/AprobacionDeLicencias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AprobacionDeLicencia>> GetAprobacionDeLicencia(int id)
        {
            var aprobacionDeLicencia = await _context.AprobacionDeLicencia.FindAsync(id);

            if (aprobacionDeLicencia == null)
            {
                return NotFound();
            }

            return aprobacionDeLicencia;
        }

        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaAprobacionDeLicencia>>> FiltrarAprobacionDeLicencia([FromBody] FiltrarAprobacionDeLicencia filtro)
        {
            var aprobacionDeLicenciasFiltradas = _context.AprobacionDeLicencia
                .Include(a => a.Licencia)
                .ThenInclude(l => l.TipoDeLicencia)
                .AsQueryable();

            if (filtro.FechaAprobacion.HasValue)
            {
                var fechaInicio = filtro.FechaAprobacion.Value.Date;
                var fechaFin = fechaInicio.AddDays(1);

                aprobacionDeLicenciasFiltradas = aprobacionDeLicenciasFiltradas.Where(a => a.FechDeAprobacion >= fechaInicio && a.FechDeAprobacion < fechaFin);
            }

           if (filtro.TipoDeLicenciaId.HasValue)
{
    aprobacionDeLicenciasFiltradas = aprobacionDeLicenciasFiltradas
        .Where(a => a.Licencia.TipoDeLicenciaId == filtro.TipoDeLicenciaId.Value);
}


            var listaFiltrada = await aprobacionDeLicenciasFiltradas.ToListAsync();

            var vista = listaFiltrada.Select(a => new VistaAprobacionDeLicencia
            {
                Id = a.Id,
                LicenciaString = a.Licencia?.TipoDeLicencia?.Nombre,
                LicenciaId = a.LicenciaId,
                FechaDeAprobacion = a.FechDeAprobacion.ToString("dd/MM/yyyy"),
                EstadoString = a.Estado.ToString(),
                Estado = a.Estado
            }).ToList();

            return vista;
        }



        private bool AprobacionDeLicenciaExists(int id)
        {
            return _context.AprobacionDeLicencia.Any(e => e.Id == id);
        }
    }
}
