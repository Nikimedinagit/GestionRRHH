using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionRRHH.Models.General;
using Microsoft.AspNetCore.Authorization;
using System.Text;
using System.Globalization;

namespace GestionRRHH.Controllers
{
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
        /// METODO PARA OBTENER LOS DATOS DE LA API DE TIPOS DE LICENCIAS ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
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
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost]
        public async Task<ActionResult<TipoDeLicencia>> PostTipoDeLicencia(TipoDeLicencia tipoDeLicencia)
        {
            string nombreNormalizado = NormalizarTexto(tipoDeLicencia.Nombre);

            var tipos = await _context.TipoDeLicencia
                .AsNoTracking()
                .ToListAsync();

            bool existe = tipos.Any(x => NormalizarTexto(x.Nombre) == nombreNormalizado);

            if (existe)
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });

            tipoDeLicencia.Nombre = nombreNormalizado;

            _context.TipoDeLicencia.Add(tipoDeLicencia);
            await _context.SaveChangesAsync();

            return Ok(tipoDeLicencia);
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UN TIPO DE LICENCIA ///////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoDeLicencia(int id, TipoDeLicencia tipoDeLicencia)
        {
            string nombreNormalizado = NormalizarTexto(tipoDeLicencia.Nombre);

            var tipoDeLicencias = await _context.TipoDeLicencia.FindAsync(id);
           
            var tipos = await _context.TipoDeLicencia
                .AsNoTracking()
                .Where(t => t.Id != id)
                .ToListAsync();

            bool existe = tipos.Any(t => NormalizarTexto(t.Nombre) == nombreNormalizado);

            if (existe)
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });

            tipoDeLicencias.Nombre = nombreNormalizado;

            await _context.SaveChangesAsync();

            return Ok(tipoDeLicencias);
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ALTERNAR EL ELIMINADO DE UN TIPO DE LICENCIA ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
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
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
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
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
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
