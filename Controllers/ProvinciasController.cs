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
    public class ProvinciasController : ControllerBase
    {
        private readonly Context _context;

        public ProvinciasController(Context context)
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
        /// METODO PARA OBTENER LOS DATOS DE LA API DE PROVINCIAS ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<Provincia>>> GetProvincia([FromBody] FiltrarProvincias filtro)
        {
            var obtenerProvincias = _context.Provincia.AsNoTracking().AsQueryable();

            if (!string.IsNullOrEmpty(filtro.Nombre))
                obtenerProvincias = obtenerProvincias.Where(c => c.Nombre.Contains(filtro.Nombre));

            if (filtro.Eliminado.HasValue)
            {
                bool eliminado = filtro.Eliminado.Value == 1;
                obtenerProvincias = obtenerProvincias.Where(c => c.Eliminado == eliminado);
            }

            var resultado = await obtenerProvincias
                .OrderBy(c => c.Eliminado)
                .ThenBy(c => c.Nombre)
                .ToListAsync();

            return resultado;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CREAR UNA PROVINCIA ////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost]
        public async Task<ActionResult<Provincia>> PostProvincia(Provincia provincia)
        {

            string nombreNormalizado = NormalizarTexto(provincia.Nombre);

            var provincias = await _context.Provincia
                .AsNoTracking()
                .ToListAsync();

            bool existe = provincias.Any(x => NormalizarTexto(x.Nombre) == nombreNormalizado);

            if (existe)
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });

            provincia.Nombre = nombreNormalizado;
            _context.Provincia.Add(provincia);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProvincia), new { id = provincia.Id }, provincia);
        }




        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UNA PROVINCIA ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProvincia(int id, Provincia provincia)
        {
            string nombreNormalizado = NormalizarTexto(provincia.Nombre);

            var provinciaOriginal = await _context.Provincia.FindAsync(id);

            var provincias = await _context.Provincia
                .AsNoTracking()
                .Where(p => p.Id != id)
                .ToListAsync();

            bool provinciaExistente = provincias
                .Any(p => NormalizarTexto(p.Nombre) == nombreNormalizado);

            if (provinciaExistente)
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });

            provinciaOriginal.Nombre = nombreNormalizado;

            await _context.SaveChangesAsync();

            return Ok(provinciaOriginal);
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ALTERNAR EL ELIMINADO DE UNA PROVINCIA ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProvincia(int id)
        {
            var provincia = await _context.Provincia.FindAsync(id);

            if (!provincia.Eliminado)
            {
                bool tieneLocalidades = await _context.Localidad
                    .AsNoTracking()
                    .AnyAsync(l => l.ProvinciaId == id);

                if (tieneLocalidades)
                    return BadRequest(new { mensaje = "No se puede desactivar la provincia porque tiene localidades asociadas." });
            }

            provincia.Eliminado = !provincia.Eliminado;

            _context.Provincia.Update(provincia);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = provincia.Eliminado ? "Provincia Desactivada" : "Provincia Activada" });
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER TODOS LOS DATOS DE LA API DE PROVINCIAS ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("Activos")]
        public async Task<ActionResult<IEnumerable<Provincia>>> GetProvinciasActivos()
        {
            var provinciasActivos = await _context.Provincia
                .Where(p => !p.Eliminado)
                .OrderBy(p => p.Nombre)
                .ToListAsync();
            return provinciasActivos;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UN PROVINCIA POR ID /////////////////////////////////////////////////////// 
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Provincia>> GetProvincia(int id)
        {
            var provincia = await _context.Provincia.FindAsync(id);

            if (provincia == null)
            {
                return NotFound();
            }

            return provincia;
        }


        private bool ProvinciaExists(int id)
        {
            return _context.Provincia.Any(e => e.Id == id);
        }
    }
}
