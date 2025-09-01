using API_RRHH_TESIS2025.Services;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading;
using System.Threading.Tasks;

public class RegistrarAusentesBackgroundService : IHostedService, IDisposable
{
    private Timer _timer;
    private readonly IServiceScopeFactory _scopeFactory;

    public RegistrarAusentesBackgroundService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        // Ejecutar todos los días a las 23:45
        var ahora = DateTime.Now;
        var proximo = new DateTime(ahora.Year, ahora.Month, ahora.Day, 20, 30, 0);
        if (ahora > proximo) proximo = proximo.AddDays(1);

        var tiempoInicial = proximo - ahora;
        _timer = new Timer(DoWork, null, tiempoInicial, TimeSpan.FromDays(1));

        return Task.CompletedTask;
    }

    private void DoWork(object state)
    {
        using var scope = _scopeFactory.CreateScope();
        var servicioAsistencia = scope.ServiceProvider.GetRequiredService<IAsistenciaService>();
        servicioAsistencia.RegistrarAusentesAutomaticamenteAsync().Wait();
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _timer?.Change(Timeout.Infinite, 0);
        return Task.CompletedTask;
    }

    public void Dispose() => _timer?.Dispose();
}
