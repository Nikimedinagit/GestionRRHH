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
    public class TipoDeLicenciasController : ControllerBase
    {
        private readonly Context _context;

        public TipoDeLicenciasController(Context context)
        {
            _context = context;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS DATOS DE LA API DE TIPOS DE LICENCIAS ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<TipoDeLicencia>>> FiltrarTipoDeLicencia(TipoDeLicenciaFiltrar filtro)
        {
            var tipoDeLicenciasFiltro = _context.TipoDeLicencia.AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.Nombre))
            {
                tipoDeLicenciasFiltro = tipoDeLicenciasFiltro.Where(c => EF.Functions.Like(c.Nombre, $"%{filtro.Nombre}%"));
            }

            if (filtro.Eliminado.HasValue)
            {
                tipoDeLicenciasFiltro = tipoDeLicenciasFiltro.Where(c => c.Eliminado == (filtro.Eliminado.Value == 1));
            }

            var resultado = await tipoDeLicenciasFiltro
            .OrderBy(c => c.Eliminado)
            .ThenBy(c => c.Nombre)
            .ToListAsync();

            return resultado;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CREAR UN TIPO DE LICENCIA ///////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost]
        public async Task<ActionResult<TipoDeLicencia>> PostTipoDeLicencia(TipoDeLicencia tipoDeLicencia)
        {
            var tipoDeLicenciaExistente = await _context.TipoDeLicencia
                .AnyAsync(x => x.Nombre.ToLower() == tipoDeLicencia.Nombre.ToLower());

            if (tipoDeLicenciaExistente)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            }

            tipoDeLicencia.Nombre = tipoDeLicencia.Nombre.ToUpper();

            _context.TipoDeLicencia.Add(tipoDeLicencia);

            await _context.SaveChangesAsync();

            return Ok(tipoDeLicencia);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UN TIPO DE LICENCIA ///////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoDeLicencia(int id, TipoDeLicencia tipoDeLicencia)
        {
            var tipoDeLicencias = await _context.TipoDeLicencia.FindAsync(id);

            var tipoDeLicenciaExistente = await _context.TipoDeLicencia.FirstOrDefaultAsync(t => t.Nombre.ToLower() == tipoDeLicencia.Nombre.ToLower() && t.Id != id);

            if (tipoDeLicenciaExistente != null)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            }

            tipoDeLicencias.Nombre = tipoDeLicencia.Nombre.ToUpper();

            await _context.SaveChangesAsync();

            return Ok(tipoDeLicencia);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ALTERNAR EL ELIMINADO DE UN TIPO DE LICENCIA ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoDeLicencia(int id)
        {
            var tipoDeLicencia = await _context.TipoDeLicencia.FindAsync(id);

            if (!tipoDeLicencia.Eliminado)
            {
                bool tieneLicenciasActivas = await _context.Licencia
                    .AnyAsync(l => l.TipoDeLicenciaId == id &&
                                   (l.Estado == EstadoLicencia.PENDIENTE || l.Estado == EstadoLicencia.APROBADA) &&
                                   l.FechaFin > DateTime.Now);

                if (tieneLicenciasActivas)
                    return BadRequest(new { mensaje = "No se puede desactivar el tipo de licencia porque tiene licencias activas o pendientes vigentes asociadas." });
            }

            tipoDeLicencia.Eliminado = !tipoDeLicencia.Eliminado;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = tipoDeLicencia.Eliminado ? "Licencia Desactivada" : "Licencia Activada" });
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER TODOS LOS DATOS DE LA API DE TIPOS DE LICENCIAS ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpGet("Activos")]
        public async Task<ActionResult<IEnumerable<TipoDeLicencia>>> GetTipoDeLicenciasActivos()
        {
            var tipoDeLicenciasActivos = await _context.TipoDeLicencia
                .Where(t => !t.Eliminado)
                .OrderBy(t => t.Nombre)
                .ToListAsync();
            return tipoDeLicenciasActivos;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UN TIPO DE LICENCIA POR ID ///////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoDeLicencia>> GetTipoDeLicencia(int id)
        {
            var tipoDeLicencia = await _context.TipoDeLicencia.FindAsync(id);

            if (tipoDeLicencia == null)
            {
                return NotFound();
            }

            return tipoDeLicencia;
        }


        private bool TipoDeLicenciaExists(int id)
        {
            return _context.TipoDeLicencia.Any(e => e.Id == id);
        }
    }
}
