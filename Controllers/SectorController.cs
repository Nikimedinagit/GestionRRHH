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
    public class SectorController : ControllerBase
    {
        private readonly Context _context;

        public SectorController(Context context)
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
        /// METODO PARA OBTENER LOS DATOS DE LA API DE SECTORES ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<Sector>>> GetSector([FromBody] FiltrarSectores filtro)
        {
            IQueryable<Sector> obtenerSectores = _context.Sector.AsNoTracking().AsQueryable();

            if (!string.IsNullOrEmpty(filtro.Nombre))
                obtenerSectores = obtenerSectores.Where(c => c.Nombre.Contains(filtro.Nombre));

            if (filtro.Eliminado.HasValue)
            {
                bool eliminado = filtro.Eliminado.Value == 1;
                obtenerSectores = obtenerSectores.Where(c => c.Eliminado == eliminado);
            }

            var sectores = await obtenerSectores
                .OrderBy(c => c.Eliminado)
                .ThenBy(c => c.Nombre)
                .ToListAsync();

            return Ok(sectores);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO  PARA CREAR UN NUEVO SECTOR ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost]
        public async Task<ActionResult<Sector>> PostSector(Sector sector)
        {
            string nombreNormalizado = NormalizarTexto(sector.Nombre);

            var sectores = await _context.Sector
                .AsNoTracking()
                .ToListAsync();

            bool existe = sectores.Any(x => NormalizarTexto(x.Nombre) == nombreNormalizado);

            if (existe)
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });

            sector.Nombre = nombreNormalizado;
            _context.Sector.Add(sector);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction("GetSector", new { id = sector.Id }, sector);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UN SECTOR ///////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSector(int id, Sector sector)
        {
            string nombreNormalizado = NormalizarTexto(sector.Nombre);

            var sectorOriginal = await _context.Sector.FindAsync(id);

            var sectorExistente = await _context.Sector
                .AsNoTracking()
                .Where(p => p.Id != id)
                .ToListAsync();
             
            bool existe = sectorExistente.Any(x => NormalizarTexto(x.Nombre) == nombreNormalizado);

            if (existe)
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });

            sectorOriginal.Nombre = nombreNormalizado;

            await _context.SaveChangesAsync();

            return Ok(sector);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA ALTERNAR EL ELIMINADO DE UN SECTOR ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSector(int id)
        {
            var sector = await _context.Sector.FindAsync(id);

            if (!sector.Eliminado)
            {
                bool tienePuestos = await _context.Puesto
                    .AsNoTracking()
                    .AnyAsync(p => p.SectorId == id);

                if (tienePuestos)
                    return BadRequest(new { mensaje = "No se puede desactivar el sector porque tiene puestos asociados." });
            }

            sector.Eliminado = !sector.Eliminado;

            _context.Sector.Update(sector);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = sector.Eliminado ? "Sector Desactivado" : "Sector Activado" });
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER TODOS LOS DATOS DE LA API DE SECTORES ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("Activos")]
        public async Task<ActionResult<IEnumerable<Sector>>> GetSectorsActivos()
        {
            var sectoresActivos = await _context.Sector
                .Where(s => !s.Eliminado)
                .OrderBy(s => s.Nombre)
                .ToListAsync();
            return sectoresActivos;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UN SECTOR POR ID /////////////////////////////////////////////////////// 
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Sector>> GetSector(int id)
        {
            var sector = await _context.Sector.FindAsync(id);

            if (sector == null)
            {
                return NotFound();
            }

            return sector;
        }


        private bool SectorExists(int id)
        {
            return _context.Sector.Any(e => e.Id == id);
        }
    }
}
