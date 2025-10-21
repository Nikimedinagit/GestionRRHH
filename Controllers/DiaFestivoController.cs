using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using API_RRHH_TESIS2025.Models.General;

[ApiController]
[Route("api/[controller]")]
public class DiasFestivosController : ControllerBase
{
[HttpGet("proximos-festivos")]
public async Task<IActionResult> ObtenerProximosFestivos()
{
        var año = DateTime.Today.Year;
        var pais = "AR";
        var url = $"https://date.nager.at/api/v3/PublicHolidays/{año}/{pais}";

        using var client = new HttpClient();
        var response = await client.GetStringAsync(url);

        var datosApi = JsonSerializer.Deserialize<List<JsonElement>>(response);

        var proximos = datosApi
            .Select(f =>
            {
                var fecha = f.TryGetProperty("date", out var fechaProp) ? fechaProp.GetString() : null;
                var nombre = f.TryGetProperty("localName", out var nombreProp) ? nombreProp.GetString() : "Sin nombre";

                if (fecha == null) return null;

                return new DiaFestivo
                {
                    Fecha = fecha,
                    NombreFestivo = nombre
                };
            })
            .Where(f => f != null && DateTime.Parse(f.Fecha) >= DateTime.Today)
            .OrderBy(f => DateTime.Parse(f.Fecha))
            .Take(5)
            .ToList();

        return Ok(proximos);
    }
}

