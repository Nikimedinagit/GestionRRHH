using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace API_RRHH_TESIS2025.Services.Hosted
{
    public class LimpiezaFotosService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<LimpiezaFotosService> _logger;
        private readonly string _rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "fichadas");

        public LimpiezaFotosService(IServiceProvider serviceProvider, ILogger<LimpiezaFotosService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            int horaEjecucion = 17;
            int minutoEjecucion = 10;
            int segundoEjecucion = 0;

            _logger.LogInformation($"Servicio de Limpieza programado para las {horaEjecucion}:{minutoEjecucion}:{segundoEjecucion}");

            while (!stoppingToken.IsCancellationRequested)
            {
                var ahora = DateTime.Now;
                var proximaEjecucion = new DateTime(ahora.Year, ahora.Month, ahora.Day, horaEjecucion, minutoEjecucion, segundoEjecucion);

                if (ahora > proximaEjecucion)
                {
                    proximaEjecucion = proximaEjecucion.AddDays(1);
                }

                var tiempoEspera = proximaEjecucion - ahora;

                _logger.LogInformation($"Faltan {tiempoEspera.Hours}h {tiempoEspera.Minutes}m {tiempoEspera.Seconds}s para la limpieza.");

                // El servicio espera hasta llegar a la hora exacta definida
                await Task.Delay(tiempoEspera, stoppingToken);

                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        _logger.LogInformation("Ejecutando limpieza programada de fotos...");
                        LimpiarCarpetasAntiguas();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error en la limpieza programada: {ex.Message}");
                }


                await Task.Delay(1000, stoppingToken);
            }
        }

        private void LimpiarCarpetasAntiguas()
        {
            if (!Directory.Exists(_rootPath)) return;

            DateTime fechaLimite = DateTime.Now.AddDays(-30);
            var carpetas = Directory.GetDirectories(_rootPath);

            foreach (var rutaCarpeta in carpetas)
            {
                string nombreCarpeta = Path.GetFileName(rutaCarpeta);

                if (DateTime.TryParse(nombreCarpeta, out DateTime fechaCarpeta))
                {
                    if (fechaCarpeta < fechaLimite)
                    {
                        _logger.LogWarning($"Borrando carpeta antigua: {nombreCarpeta}");
                        Directory.Delete(rutaCarpeta, true);
                    }
                }
            }
        }
    }
}