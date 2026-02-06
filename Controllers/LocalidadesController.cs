using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionRRHH.Models.General;
using Microsoft.AspNetCore.Authorization;
using System.Globalization;
using System.Text;

namespace GestionRRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocalidadesController : ControllerBase
    {
        private readonly Context _context;

        public LocalidadesController(Context context)
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
        /// METODO PARA OBTENER LOS DATOS DE LA API DE LOCALIDADES ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<LocalidadVista>>> FiltrarLocalidades([FromBody] FiltrarLocalidades filtro)
        {
            var obtenerLocaldiades = _context.Localidad
                .Include(x => x.Provincia)
                .Where(x => !x.Provincia.Eliminado)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filtro.Nombre))
                obtenerLocaldiades = obtenerLocaldiades.Where(c => c.Nombre.Contains(filtro.Nombre));

            if (filtro.Eliminado.HasValue)
                obtenerLocaldiades = obtenerLocaldiades.Where(c => c.Eliminado == (filtro.Eliminado.Value == 1));

            if (filtro.ProvinciaId > 0)
                obtenerLocaldiades = obtenerLocaldiades.Where(t => t.ProvinciaId == filtro.ProvinciaId);

            var listaFiltrada = await obtenerLocaldiades
                .OrderBy(l => l.Eliminado)
                .ThenBy(l => l.Provincia.Nombre)
                .ThenBy(l => l.Nombre)
                .Select(localidad => new LocalidadVista
                {
                    Id = localidad.Id,
                    Nombre = localidad.Nombre,
                    ProvinciaString = localidad.Provincia.Nombre,
                    ProvinciaId = localidad.ProvinciaId,
                    Eliminado = localidad.Eliminado
                })
                .ToListAsync();

            return listaFiltrada;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CREAR UN LOCALIDAD ////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost]
        public async Task<ActionResult<Localidad>> PostLocalidad(Localidad localidad)
        {
            string nombreNormalizado = NormalizarTexto(localidad.Nombre);

            var localidades = await _context.Localidad
                .Where(x => x.ProvinciaId == localidad.ProvinciaId)
                .ToListAsync();

            bool localidadExistente = localidades
                .Any(x => NormalizarTexto(x.Nombre) == nombreNormalizado);

            if (localidadExistente)
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });

            localidad.Nombre = nombreNormalizado;
            _context.Localidad.Add(localidad);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetLocalidad", new { id = localidad.Id }, localidad);
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UN LOCALIDAD ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLocalidad(int id, Localidad localidad)
        {
            string nombreNormalizado = NormalizarTexto(localidad.Nombre);

            var localidades = await _context.Localidad
                .AsNoTracking()
                .Where(x => x.Id != id && x.ProvinciaId == localidad.ProvinciaId)
                .ToListAsync();

            bool existe = localidades.Any(x => NormalizarTexto(x.Nombre) == nombreNormalizado);

            if (existe)
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });

            var localidadOriginal = await _context.Localidad.FindAsync(id);
           
            localidadOriginal.Nombre = nombreNormalizado;
            localidadOriginal.ProvinciaId = localidad.ProvinciaId;

            await _context.SaveChangesAsync();

            return Ok(localidadOriginal);
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ALTERNAR EL ELIMINADO DE UN LOCALIDAD ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLocalidad(int id)
        {
            var localidad = await _context.Localidad
                .Include(l => l.Empleados)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (!localidad.Eliminado && localidad.Empleados.Any())
            {
                return BadRequest(new { mensaje = "No se puede desactivar la localidad porque tiene empleados asociados." });
            }

            localidad.Eliminado = !localidad.Eliminado;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = localidad.Eliminado ? "Localidad Desactivada" : "Localidad Activada" });
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER TODOS LOS DATOS DE LA API DE LOCALIDADES ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("Activos")]
        public async Task<ActionResult<IEnumerable<Localidad>>> GetLocalidadesActivos()
        {
            var localidadesActivos = await _context.Localidad
                .Where(l => !l.Eliminado)
                .OrderBy(l => l.Nombre)
                .ToListAsync();
            return localidadesActivos;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UN LOCALIDAD POR ID /////////////////////////////////////////////////////// 
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Localidad>> GetLocalidad(int id)
        {
            var localidad = await _context.Localidad.FindAsync(id);

            if (localidad == null)
            {
                return NotFound();
            }

            return localidad;
        }

        private bool LocalidadExists(int id)
        {
            return _context.Localidad.Any(e => e.Id == id);
        }
    }
}