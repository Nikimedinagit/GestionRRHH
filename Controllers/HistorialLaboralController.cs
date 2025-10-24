using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkSync.Models.General;

namespace API_NET_CORE8_RRHH.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HistorialLaboralController : ControllerBase
    {
        private readonly Context _context;

        public HistorialLaboralController(Context context)
        {
            _context = context;
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA OBTEENR LOS DATOS DEL HISTORIAL DE LABORAL POR EMPLEADO //////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR")]
        [HttpGet("empleado/{empleadoId}")]
        public async Task<ActionResult<IEnumerable<VistaHistorialLaboral>>> GetHistorialPorEmpleado(int empleadoId)
        {
            var historial = await _context.HistorialLaboral
                .Where(h => h.EmpleadoId == empleadoId)
                .OrderByDescending(h => h.FechaModificacion)
                .Select(h => new
                {
                    h.Id,
                    h.FechaModificacion,
                    h.EmpleadoId,
                    EmpleadoNombre = h.Empleado.NombreCompleto,
                    h.PuestoAnterior,
                    h.PuestoActual,
                    h.UsuarioModificador
                })
                .ToListAsync();

            var usuarioIds = historial
                .Select(h => h.UsuarioModificador)
                .Distinct()
                .ToList();

            var usuarios = await _context.Users
                .Where(u => usuarioIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => new { u.NombreCompleto, u.Email });

            var puestos = await _context.Puesto
                .Include(p => p.Sector)
                .ToListAsync();

            var lista = historial.Select(h => new VistaHistorialLaboral
            {
                Id = h.Id,
                FechaModificacionString = h.FechaModificacion.ToString("dd/MM/yyyy"),
                EmpleadoId = h.EmpleadoId,
                EmpleadoIdString = h.EmpleadoNombre,
                PuestoAnterior = h.PuestoAnterior,
                PuestoActual = h.PuestoActual,
                UsuarioModificador = h.UsuarioModificador,
                UsuarioModificadorNombre = usuarios.ContainsKey(h.UsuarioModificador) ? usuarios[h.UsuarioModificador].NombreCompleto : "N/D",
                UsuarioModificadorEmail = usuarios.ContainsKey(h.UsuarioModificador) ? usuarios[h.UsuarioModificador].Email : "N/D",
                SectorActual = puestos.FirstOrDefault(p => p.Descripcion == h.PuestoActual)?.Sector?.Nombre ?? "N/D",
                SectorAnterior = puestos.FirstOrDefault(p => p.Descripcion == h.PuestoAnterior)?.Sector?.Nombre ?? "N/D"
            }).ToList();

            return lista;
        }


        private bool HistorialLaboralExists(int id)
        {
            return _context.HistorialLaboral.Any(e => e.Id == id);
        }
    }
}
