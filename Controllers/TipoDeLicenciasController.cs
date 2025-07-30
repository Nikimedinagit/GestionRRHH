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

        // GET: api/TipoDeLicencias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoDeLicencia>>> GetTipoDeLicencia()
        {
            return await _context.TipoDeLicencia
            .OrderBy(t => t.Nombre)
            .ToListAsync();
        }

        [HttpGet("Activos")]
        public async Task<ActionResult<IEnumerable<TipoDeLicencia>>> GetTipoDeLicenciasActivos()
        {
            var tipoDeLicenciasActivos = await _context.TipoDeLicencia
                .Where(t => !t.Eliminado)
                .OrderBy(t => t.Nombre)
                .ToListAsync();
            return tipoDeLicenciasActivos;
        }

        // GET: api/TipoDeLicencias/5
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

        [HttpPost("Filtrar")]
        public async Task<ActionResult<IEnumerable<TipoDeLicencia>>> FiltrarTipoDeLicencia(TipoDeLicenciaFiltrar filtro)
        {
            var tipoDeLicenciasFiltro = _context.TipoDeLicencia.AsQueryable();

            if (filtro.Eliminado.HasValue)
            {
                tipoDeLicenciasFiltro = tipoDeLicenciasFiltro.Where(c => c.Eliminado == (filtro.Eliminado.Value == 1));
            }
            var resultado = await tipoDeLicenciasFiltro.OrderBy(c => c.Nombre).ToListAsync();
            return resultado;
        }

        // PUT: api/TipoDeLicencias/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoDeLicencia(int id, TipoDeLicencia tipoDeLicencia)
        {



            if (id != tipoDeLicencia.Id)
            {
                return BadRequest();
            }

            // Convertimos a mayuscula
            tipoDeLicencia.Nombre = tipoDeLicencia.Nombre.ToUpper();

            var tipoDeLicenciaExistente = await _context.TipoDeLicencia.FirstOrDefaultAsync(t => t.Nombre.ToLower() == tipoDeLicencia.Nombre.ToLower() && t.Id != id);

            if (tipoDeLicenciaExistente != null)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            }


            _context.Entry(tipoDeLicencia).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoDeLicenciaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(tipoDeLicencia);
        }

        // POST: api/TipoDeLicencias
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TipoDeLicencia>> PostTipoDeLicencia(TipoDeLicencia tipoDeLicencia)
        {
            // Convertimos a mayuscula
            tipoDeLicencia.Nombre = tipoDeLicencia.Nombre.ToUpper();

            // Comprobamos si la tipo de licencia ya existe
            var tipoDeLicenciaExistente = await _context.TipoDeLicencia
                .AnyAsync(x => x.Nombre.ToLower() == tipoDeLicencia.Nombre.ToLower());

            if (tipoDeLicenciaExistente)
            {
                return BadRequest(new { codigo = 0, mensaje = "Ya existe." });
            }
            _context.TipoDeLicencia.Add(tipoDeLicencia);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoDeLicencia", new { id = tipoDeLicencia.Id }, tipoDeLicencia);
        }

        // DELETE: api/TipoDeLicencias/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoDeLicencia(int id)
        {
            var tipoDeLicencia = await _context.TipoDeLicencia
            .Include(t => t.Licencias)
            .FirstOrDefaultAsync(t => t.Id == id);
            if (tipoDeLicencia == null)
            {
                return NotFound();
            }

            // Si está activo y tiene licencias asociadas, NO permitir desactivarlo, pero si estan expiradas si pueden borrarse
            if (!tipoDeLicencia.Eliminado &&
                tipoDeLicencia.Licencias != null &&
                tipoDeLicencia.Licencias.Any(l =>
                (l.Estado == EstadoLicencia.PENDIENTE || l.Estado == EstadoLicencia.APROBADA) &&
                l.FechaFin > DateTime.Now))
            {
                return BadRequest(new { mensaje = "No se puede desactivar el tipo de licencia porque tiene licencias activas o pendientes vigentes asociadas." });
            }


            tipoDeLicencia.Eliminado = !tipoDeLicencia.Eliminado;
            var mensaje = tipoDeLicencia.Eliminado ?
            "Licencia Desactivada" :
            "Licencia Activada";

            _context.TipoDeLicencia.Update(tipoDeLicencia);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje });
        }

        private bool TipoDeLicenciaExists(int id)
        {
            return _context.TipoDeLicencia.Any(e => e.Id == id);
        }
    }
}
