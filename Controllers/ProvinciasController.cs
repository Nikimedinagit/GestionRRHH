using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;

namespace API_RRHH_TESIS2025.Controllers
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
        /// METODO PARA OBTENER LOS DATOS DE LA API DE PROVINCIAS ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
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
        [HttpPost]
        public async Task<ActionResult<Provincia>> PostProvincia(Provincia provincia)
        {
            provincia.Nombre = provincia.Nombre.ToUpper();

            bool existe = await _context.Provincia
                .AsNoTracking()
                .AnyAsync(x => x.Nombre == provincia.Nombre);

            if (existe)
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });

            _context.Provincia.Add(provincia);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProvincia), new { id = provincia.Id }, provincia);
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UNA PROVINCIA ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProvincia(int id, Provincia provincia)
        {
            var provinciaOriginal = await _context.Provincia.FindAsync(id);

            var provinciaExistente = await _context.Provincia
                .AsNoTracking()
                .AnyAsync(p => p.Nombre == provincia.Nombre && p.Id != id);

            if (provinciaExistente)
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            
            provinciaOriginal.Nombre = provincia.Nombre.ToUpper();


            await _context.SaveChangesAsync();

            return Ok(provincia);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ALTERNAR EL ELIMINADO DE UNA PROVINCIA ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
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
