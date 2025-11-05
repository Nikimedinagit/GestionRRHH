using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using API_RRHH_TESIS2025.Models.Graficos;
using System.Globalization;

[ApiController]
[Route("api/[controller]")]
public class ResultadosController : ControllerBase
{

    private readonly Context _context;

    public ResultadosController(Context context)
    {
        _context = context;
    }

    [HttpGet("EvolucionEmpleados")]
    public async Task<IActionResult> EvolucionEmpleados()
    {
        var hoy = DateTime.Today;
        var resultado = new List<EvolucionEmpleadoGrafico>();

        for (int i = 11; i >= 0; i--)
        {
            var mes = hoy.AddMonths(-i);
            int cantidadActivos = await _context.Empleado
                .Where(e => !e.Eliminado && e.HistorialLaboral
                    .Any(h => h.FechaModificacion <= mes.AddMonths(1).AddDays(-1)))
                .CountAsync();

            string nombreMes = mes.ToString("MMM", new CultureInfo("es-ES"));
            nombreMes = char.ToUpper(nombreMes[0]) + nombreMes.Substring(1);

            resultado.Add(new EvolucionEmpleadoGrafico
            {
                Mes = nombreMes,
                Cantidad = cantidadActivos
            });
        }

        return Ok(resultado);
    }

    [HttpGet("AsistenciaMensual")]
    public async Task<IActionResult> AsistenciaMensual()
    {
        var hoy = DateTime.Today;
        var resultado = new List<AsistenciaMensualGrafico>();

        for (int i = 11; i >= 0; i--)
        {
            var mes = hoy.AddMonths(-i);
            var asistencias = await _context.Asistencia
                .Where(a => a.Fecha.Month == mes.Month && a.Fecha.Year == mes.Year)
                .ToListAsync();

            string nombreMes = mes.ToString("MMM", new CultureInfo("es-ES"));
            nombreMes = char.ToUpper(nombreMes[0]) + nombreMes.Substring(1);

            resultado.Add(new AsistenciaMensualGrafico
            {
                Mes = nombreMes,
                AsistenciasCompletas = asistencias.Count(a => a.Estado == EstadoAsistencia.COMPLETA),
                Ausencias = asistencias.Count(a => a.Estado == EstadoAsistencia.AUSENTE)
            });
        }

        return Ok(resultado);
    }

    [HttpGet("JustificacionPorDia")]
    public async Task<IActionResult> JustificacionPorDia()
    {
        var hoy = DateTime.Today;
        var resultado = new List<JustificacionComparativaPorDiaGrafico>();
        var cultura = new CultureInfo("es-ES");

        for (int i = 6; i >= 0; i--)
        {
            var dia = hoy.AddDays(-i);

            int totalJustificaciones = await _context.Justificacion
                .Where(a => a.Fecha.Date == dia)
                .CountAsync();

            int totalAprobadas = await _context.Justificacion
                .Where(j => j.Estados == EstadoJustificacion.APROBADA && j.Fecha.Date == dia)
                .CountAsync();

            int totalRechazadas = await _context.Justificacion
                .Where(j => j.Estados == EstadoJustificacion.RECHAZADA && j.Fecha.Date == dia)
                .CountAsync();

            string diaSemana = cultura.DateTimeFormat.GetDayName(dia.DayOfWeek);
            diaSemana = char.ToUpper(diaSemana[0]) + diaSemana.Substring(1); 

            resultado.Add(new JustificacionComparativaPorDiaGrafico
            {
                Dia = dia.ToString("dd/MM"),
                DiaSemana = diaSemana,
                TotalJustificaciones = totalJustificaciones,
                TotalAprobadas = totalAprobadas,
                TotalRechazadas = totalRechazadas
            });
        }

        return Ok(resultado);
    }







}





