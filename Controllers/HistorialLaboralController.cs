using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        // GET: api/HistorialLaboral
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HistorialLaboral>>> GetHistorialLaboral()
        {
            return await _context.HistorialLaboral.ToListAsync();
        }

        // GET: api/HistorialLaboral/5
        [HttpGet("{id}")]
        public async Task<ActionResult<HistorialLaboral>> GetHistorialLaboral(int id)
        {
            var historialLaboral = await _context.HistorialLaboral.FindAsync(id);

            if (historialLaboral == null)
            {
                return NotFound();
            }

            return historialLaboral;
        }

        

        private bool HistorialLaboralExists(int id)
        {
            return _context.HistorialLaboral.Any(e => e.Id == id);
        }
    }
}
