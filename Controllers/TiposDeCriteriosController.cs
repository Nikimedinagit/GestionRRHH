using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;
using System.Text;
using System.Globalization;

namespace API_NET_CORE8_RRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TiposDeCriteriosController : ControllerBase
    {
        private readonly Context _context;

        public TiposDeCriteriosController(Context context)
        {
            _context = context;
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
        /// METODO PARA OBTENER LOS DATOS DE LA API DE TIPOS DE CRITERIOS ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<TipoDeCriterio>>> FiltrarTipoDeCriterio(TipoDeCriterioFiltrar filtro)
        {
            IQueryable<TipoDeCriterio> obtenerTipoCriterio = _context.TipoDeCriterio.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(filtro.Nombre))
            {
                obtenerTipoCriterio = obtenerTipoCriterio.Where(c => EF.Functions.Like(c.Nombre, $"%{filtro.Nombre}%"));
            }

            if (filtro.Eliminado.HasValue)
            {
                obtenerTipoCriterio = obtenerTipoCriterio.Where(c => c.Eliminado == (filtro.Eliminado.Value == 1));
            }

            var resultado = await obtenerTipoCriterio
                .OrderBy(c => c.Eliminado)
                .ThenBy(c => c.Nombre)
                .ToListAsync();

            return resultado;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CREAR UN TIPO DE CRITERIO ///////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost]
        public async Task<ActionResult<TipoDeCriterio>> PostTipoDeCriterio(TipoDeCriterio tipoDeCriterio)
        {
            string nombreNormalizado = NormalizarTexto(tipoDeCriterio.Nombre);

            var existeTipoDeCriterio = await _context.TipoDeCriterio
                .AsNoTracking()
                .ToListAsync();

            bool existe = existeTipoDeCriterio.Any(x => NormalizarTexto(x.Nombre) == nombreNormalizado);
            if (existe)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            }

            tipoDeCriterio.Nombre = nombreNormalizado;

            _context.TipoDeCriterio.Add(tipoDeCriterio);
            await _context.SaveChangesAsync();

            return Ok(tipoDeCriterio);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA EDITAR UN TIPO DE CRITERIO //////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoDeCriterio(int id, TipoDeCriterio tipoDeCriterio)
        {
            string nombreNormalizado = NormalizarTexto(tipoDeCriterio.Nombre);

            var tipoDeCriterios = await _context.TipoDeCriterio.FindAsync(id);

            var existeTipoDeCriterio = await _context.TipoDeCriterio
                .AsNoTracking()
                .Where(t => t.Id != id)
                .ToListAsync();

            bool existe = existeTipoDeCriterio.Any(x => NormalizarTexto(x.Nombre) == nombreNormalizado);

            if (existe)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            }

            tipoDeCriterios.Nombre = nombreNormalizado;

            await _context.SaveChangesAsync();

            return Ok(tipoDeCriterio);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ALTENAR EL ELIMINADO DE UN TIPO DE CRITERIO ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoDeCriterio(int id)
        {
            var tipoDeCriterio = await _context.TipoDeCriterio.FindAsync(id);

            if (!tipoDeCriterio.Eliminado)
            {
                bool tieneCriterios = await _context.CriterioDeEvaluacion
                    .AnyAsync(c => c.TipoDeCriterioId == id);
                if (tieneCriterios)
                    return BadRequest(new { mensaje = "No se puede desactivar el criterio porque tiene criterios de evaluación asociados." });
            }

            tipoDeCriterio.Eliminado = !tipoDeCriterio.Eliminado;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = tipoDeCriterio.Eliminado ? "Criterio Desactivado" : "Criterio Activado" });
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UN TIPO DE CRITERIO POR ID ///////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoDeCriterio>> GetTipoDeCriterio(int id)
        {
            var tipoDeCriterio = await _context.TipoDeCriterio.FindAsync(id);

            if (tipoDeCriterio == null)
            {
                return NotFound();
            }

            return tipoDeCriterio;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER TODOS LOS DATOS De LA API DE TIPOS DE CRITERIOS ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("Activos")]
        public async Task<ActionResult<IEnumerable<TipoDeCriterio>>> GetTipoDeCriteriosActivos()
        {
            var tipoDeCriteriosActivos = await _context.TipoDeCriterio
                .Where(t => !t.Eliminado)
                .OrderBy(t => t.Nombre)
                .ToListAsync();

            return tipoDeCriteriosActivos;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// TIPOS DE CRITERIO QUE TODAVIA NO FUERON USADOS EN LA EVALUACION //////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
        [HttpGet("TiposCriterioDisponibles")]
        public async Task<ActionResult<IEnumerable<TipoDeCriterio>>> GetTiposCriterioDisponibles(int? evaluacionId)
        {
            var criteriosDisponibles = await _context.TipoDeCriterio
                .Where(tc => !tc.Eliminado &&
                    !_context.CriterioDeEvaluacion
                        .Any(ce => ce.EvaluacionId == evaluacionId
                                && ce.TipoDeCriterioId == tc.Id))
                .OrderBy(tc => tc.Nombre)
                .ToListAsync();

            return Ok(criteriosDisponibles);
        }


        private bool TipoDeCriterioExists(int id)
        {
            return _context.TipoDeCriterio.Any(e => e.Id == id);
        }
    }
}
