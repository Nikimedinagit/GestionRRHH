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
    public class PuestosController : ControllerBase
    {
        private readonly Context _context;

        public PuestosController(Context context)
        {
            _context = context;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER LOS DATOS DE LA API DE PUESTOS ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<VistaPuesto>>> PuestoFiltrar([FromBody] PuestoFiltrar filtro)
        {
            var query = _context.Puesto
                .AsNoTracking()
                .Include(p => p.Sector)
                .Where(p => !p.Sector.Eliminado) 
                .AsQueryable();

            if (!string.IsNullOrEmpty(filtro.Descripcion))
                query = query.Where(p => p.Descripcion.Contains(filtro.Descripcion));

            if (filtro.Eliminado.HasValue)
            {
                bool eliminado = filtro.Eliminado.Value == 1;
                query = query.Where(p => p.Eliminado == eliminado);
            }

            if (filtro.SectorId > 0)
            {
                query = query.Where(p => p.SectorId == filtro.SectorId);
            }

            var vista = await query
                .OrderBy(p => p.Eliminado)
                .ThenBy(p => p.Sector.Nombre)
                .ThenBy(p => p.Descripcion)
                .Select(p => new VistaPuesto
                {
                    Id = p.Id,
                    Descripcion = p.Descripcion,
                    SectorString = p.SectorString,
                    SectorId = p.SectorId,
                    Eliminado = p.Eliminado
                })
                .ToListAsync();

            return Ok(vista);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA CREAR UN NUEVO PUESTO //////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPost]
        public async Task<ActionResult<Puesto>> PostPuesto([FromBody] Puesto puesto)
        {
            string descripcionNormalizada = puesto.Descripcion.Trim().ToUpper();

            bool existe = await _context.Puesto
                .AsNoTracking()
                .AnyAsync(x => x.Descripcion == descripcionNormalizada &&
                               x.SectorId == puesto.SectorId);

            if (existe)
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });

            puesto.Descripcion = descripcionNormalizada;

            _context.Puesto.Add(puesto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(PostPuesto), new { id = puesto.Id }, puesto);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA MODIFICAR UN PUESTO ///////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPuesto(int id, [FromBody] Puesto puesto)
        {
            var puestoOriginal = await _context.Puesto.FindAsync(id);

            string descripcionNormalizada = puesto.Descripcion.Trim().ToUpper();

            bool existe = await _context.Puesto
                .AsNoTracking()
                .AnyAsync(x => x.Descripcion == descripcionNormalizada &&
                               x.SectorId == puesto.SectorId &&
                               x.Id != id);

            if (existe)
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });

            puestoOriginal.Descripcion = descripcionNormalizada;
            puestoOriginal.SectorId = puesto.SectorId;
            puestoOriginal.Eliminado = puesto.Eliminado;

            await _context.SaveChangesAsync();

            return Ok(puestoOriginal);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO APRA ALTERNAR EL ELIMINADO DE UN PUESTO ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePuesto(int id)
        {
            var puesto = await _context.Puesto.FirstOrDefaultAsync(p => p.Id == id);

            if (!puesto.Eliminado)
            {
                bool tieneEmpleados = await _context.Empleado
                    .AsNoTracking()
                    .AnyAsync(e => e.PuestoId == id);

                if (tieneEmpleados)
                    return BadRequest(new { mensaje = "No se puede desactivar el puesto porque tiene empleados asociados." });
            }

            puesto.Eliminado = !puesto.Eliminado;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = puesto.Eliminado ? "Puesto Desactivado" : "Puesto Activado" });
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER TODOS LOS DATOS DE LA API DE PUESTOS ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("Activos")]
        public async Task<ActionResult<IEnumerable<Puesto>>> GetPuestosActivos()
        {
            var puestosActivos = await _context.Puesto
                .Where(p => !p.Eliminado)
                .OrderBy(p => p.Descripcion)
                .ToListAsync();
            return puestosActivos;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTENER UN PUESTO POR ID /////////////////////////////////////////////////////// 
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Puesto>> GetPuesto(int id)
        {
            var puesto = await _context.Puesto.FindAsync(id);

            if (puesto == null)
            {
                return NotFound();
            }

            return puesto;
        }

  
        private bool PuestoExists(int id)
        {
            return _context.Puesto.Any(e => e.Id == id);
        }
    }
}
