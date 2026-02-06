using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionRRHH.Models.General;
using Microsoft.AspNetCore.Authorization;

namespace GestionRRHH.Controllers
{   
    [Authorize(Roles = "ADMINISTRADOR, RRHH")]
    [Route("api/[controller]")]
    [ApiController]
    public class AprobacionDeLicenciasController : ControllerBase
    {
        private readonly Context _context;

        public AprobacionDeLicenciasController(Context context)
        {
            _context = context;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS DATOS DE LA API DE APROBACION DE LICENCIAS ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaAprobacionDeLicencia>>> FiltrarAprobacionDeLicencia([FromBody] FiltrarAprobacionDeLicencia filtro)
        {
            var obtenerLicenciasAprobadas = _context.AprobacionDeLicencia
                .Include(a => a.Licencia)
                .ThenInclude(l => l.TipoDeLicencia)
                .AsQueryable();

            if (filtro.FechaAprobacion.HasValue)
            {
                var fechaInicio = filtro.FechaAprobacion.Value.Date;
                var fechaFin = fechaInicio.AddDays(1);
                obtenerLicenciasAprobadas = obtenerLicenciasAprobadas.Where(a => a.FechDeAprobacion >= fechaInicio && a.FechDeAprobacion < fechaFin);
            }

            if (filtro.TipoDeLicenciaId.HasValue)
            {
                obtenerLicenciasAprobadas = obtenerLicenciasAprobadas.Where(a => a.Licencia.TipoDeLicenciaId == filtro.TipoDeLicenciaId.Value);
            }

            var vista = await obtenerLicenciasAprobadas
                .Select(a => new
                {
                    a.Id,
                    LicenciaString = a.Licencia.TipoDeLicencia.Nombre,
                    a.LicenciaId,
                    FechaDeAprobacion = a.FechDeAprobacion,
                    a.Estado,
                    a.UsuarioAprobador
                })
                .ToListAsync();

            var resultado = vista.Select(a => new VistaAprobacionDeLicencia
            {
                Id = a.Id,
                LicenciaString = a.LicenciaString,
                LicenciaId = a.LicenciaId,
                FechaDeAprobacion = a.FechaDeAprobacion.ToString("dd/MM/yyyy"),
                EstadoString = a.Estado.ToString(),
                Estado = a.Estado,
                NombreUsuarioAprobador = _context.Users.FirstOrDefault(u => u.Id == a.UsuarioAprobador).NombreCompleto,
                EmailUsuarioAprobador = _context.Users.FirstOrDefault(u => u.Id == a.UsuarioAprobador).Email
            }).ToList();

            return resultado;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UN APROBACION DE LICENCIA POR ID ///////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
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


        private bool AprobacionDeLicenciaExists(int id)
        {
            return _context.AprobacionDeLicencia.Any(e => e.Id == id);
        }
    }
}
