using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
[Authorize(Roles = "ADMINISTRADOR, RRHH, SUPERVISOR, EMPLEADO")]
[ApiController]
[Route("api/[controller]")]
public class CardsEstadisticasController : ControllerBase
{

    private readonly Context _context;

    public CardsEstadisticasController(Context context)
    {
        _context = context;
    }

    /////////////////////////////////////////////////////////////////////////////////////////
    /// METODOS PARA OBTENER DATOS PARA LAS CARD DE REGISTRO EMPLEADOS////
    /////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("EmpleadosEstadisticas")]
    public async Task<ActionResult<object>> GetEmpleadosEstadisticas([FromBody] FiltrarEmpleado filtro)
    {
        var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var emailActual = (await _context.Users.FindAsync(userId))?.Email.Trim().ToLower();

        int? sectorIdSupervisor = null;

        if (rolActual == "SUPERVISOR")
        {
            var supervisor = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

            if (supervisor == null)
            {
                return Ok(new
                {
                    TotalEmpleados = 0,
                    Masculinos = 0,
                    Femeninos = 0,
                    NoBinarios = 0,
                    Otros = 0
                });
            }

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        IQueryable<Empleado> obtenerEmpleados = _context.Empleado
            .Include(e => e.Puesto)
            .Where(e => !e.Eliminado);

        if (sectorIdSupervisor.HasValue)
        {
            obtenerEmpleados = obtenerEmpleados
                .Where(e => e.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        if (!string.IsNullOrEmpty(filtro.NombreCompleto))
            obtenerEmpleados = obtenerEmpleados.Where(e =>
                e.NombreCompleto.ToLower().Contains(filtro.NombreCompleto.ToLower()));

        if (filtro.DNI.HasValue)
            obtenerEmpleados = obtenerEmpleados.Where(e =>
                e.DNI.ToString().StartsWith(filtro.DNI.Value.ToString()));

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            obtenerEmpleados = obtenerEmpleados.Where(e =>
                e.NroLegajo.StartsWith(filtro.NroLegajo));

        if (filtro.EstadoCiviles.HasValue)
            obtenerEmpleados = obtenerEmpleados.Where(e =>
                (int)e.EstadoCiviles == filtro.EstadoCiviles);

        if (filtro.TipoSexo.HasValue)
            obtenerEmpleados = obtenerEmpleados.Where(e =>
                (int)e.TipoSexo == filtro.TipoSexo);

        if (filtro.LocalidadId.HasValue)
            obtenerEmpleados = obtenerEmpleados.Where(e =>
                e.LocalidadId == filtro.LocalidadId.Value);

        if (filtro.PuestoId.HasValue)
            obtenerEmpleados = obtenerEmpleados.Where(e =>
                e.PuestoId == filtro.PuestoId);

        var totalEmpleados = await obtenerEmpleados.CountAsync();
        var totalEmpleadosMasculinos = await obtenerEmpleados.Where(e => e.TipoSexo == TipoSexo.MASCULINO).CountAsync();
        var totalEmpleadosFemeninos = await obtenerEmpleados.Where(e => e.TipoSexo == TipoSexo.FEMENINO).CountAsync();
        var totalEmpleadosNoBinarios = await obtenerEmpleados.Where(e => e.TipoSexo == TipoSexo.NO_BINARIO).CountAsync();
        var totalEmpleadosOtro = await obtenerEmpleados.Where(e => e.TipoSexo == TipoSexo.OTRO).CountAsync();

        return Ok(new
        {
            TotalEmpleados = totalEmpleados,
            Masculinos = totalEmpleadosMasculinos,
            Femeninos = totalEmpleadosFemeninos,
            NoBinarios = totalEmpleadosNoBinarios,
            Otros = totalEmpleadosOtro
        });
    }



    /////////////////////////////////////////////////////////////////////////////////////////
    /// METODOS PARA OBTENER DATOS PARA LAS CARD DE CONTROL DE ASISTENCIA////
    /////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("AsistenciasEstadisticas")]
    public async Task<ActionResult<object>> GetAsistenciasEstadisticas([FromBody] FiltrarAsistencia filtro)
    {
        var obtenerAsistencias = _context.Asistencia
            .Include(a => a.Empleado)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filtro.NombreCompleto))
        {
            var nombreFiltro = filtro.NombreCompleto.ToLower();
            obtenerAsistencias = obtenerAsistencias.Where(a => a.Empleado.NombreCompleto.ToLower().Contains(nombreFiltro));
        }

        if (filtro.DNI.HasValue)
        {
            var dniFiltro = filtro.DNI.Value.ToString();
            obtenerAsistencias = obtenerAsistencias.Where(a => a.Empleado.DNI.ToString().StartsWith(dniFiltro));
        }

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
        {
            var legajoFiltro = filtro.NroLegajo.ToString();
            obtenerAsistencias = obtenerAsistencias.Where(a => a.Empleado.NroLegajo.ToString().StartsWith(legajoFiltro));
        }

        if (filtro.EstadoAsistencia.HasValue)
        {
            obtenerAsistencias = obtenerAsistencias.Where(a => (int)a.Estado == filtro.EstadoAsistencia.Value);
        }

        var fechaSeleccionada = filtro.Fecha ?? DateTime.Today;
        var fechaSiguiente = fechaSeleccionada.AddDays(1);

        var asistenciasFiltradas = obtenerAsistencias
            .Where(a => a.Fecha >= fechaSeleccionada && a.Fecha < fechaSiguiente);

        var totalAsistenciasHoy = await asistenciasFiltradas.CountAsync();

        var totalMinutosTrabajados = await asistenciasFiltradas
            .Where(a =>
                a.HorarioId.HasValue &&
                a.PrimerEntrada.HasValue &&
                a.PrimerSalida.HasValue &&
                a.SegundaEntrada.HasValue &&
                a.SegundaSalida.HasValue)
            .Select(a =>
                EF.Functions.DateDiffMinute(a.PrimerEntrada.Value, a.PrimerSalida.Value) +
                EF.Functions.DateDiffMinute(a.SegundaEntrada.Value, a.SegundaSalida.Value))
            .SumAsync();

        var empleadosAusentes = await asistenciasFiltradas
            .CountAsync(a => a.Estado == EstadoAsistencia.AUSENTE);

        var empleadosLLegadasTardes = await asistenciasFiltradas
            .CountAsync(a => a.Estado == EstadoAsistencia.TARDE);

        string horasFormateadas;
        if (totalMinutosTrabajados < 60)
        {
            horasFormateadas = $"{totalMinutosTrabajados} min";
        }
        else
        {
            var horas = totalMinutosTrabajados / 60;
            var minutos = totalMinutosTrabajados % 60;
            horasFormateadas = $"{horas}:{minutos:D2} hs";
        }

        return new
        {
            TotalAsistenciasHoy = totalAsistenciasHoy,
            TotalHorasTrabajadas = totalMinutosTrabajados,
            TotalHorasFormateadas = horasFormateadas,
            EmpleadosAusentes = empleadosAusentes,
            EmpleadosLLegadasTardes = empleadosLLegadasTardes
        };
    }


    /////////////////////////////////////////////////////////////////////////////////////////
    /// METODOS PARA OBTENER DATOS PARA LAS CARD DE ASIGNACION DE HORARIOS////
    /////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("HorariosEstadisticas")]
    public async Task<ActionResult<object>> GetHorariosEstadisticas([FromBody] FiltrarHorario filtro)
    {
        var horariosQuery = _context.Horario
            .Where(h => h.Empleado != null && !h.Empleado.Eliminado)
            .AsQueryable();

        if (filtro.TipoHorario.HasValue)
            horariosQuery = horariosQuery.Where(h => (int)h.TipoHorario == filtro.TipoHorario.Value);

        if (!string.IsNullOrEmpty(filtro.HorarioInicio) && TimeSpan.TryParse(filtro.HorarioInicio, out var horarioInicioTs))
            horariosQuery = horariosQuery.Where(h => h.HorarioInicio >= horarioInicioTs);

        if (!string.IsNullOrEmpty(filtro.HorarioFin) && TimeSpan.TryParse(filtro.HorarioFin, out var horarioFinTs))
            horariosQuery = horariosQuery.Where(h => h.HorarioFin <= horarioFinTs);

        if (!string.IsNullOrEmpty(filtro.EmpleadoTexto))
        {
            var texto = filtro.EmpleadoTexto.ToLower();
            horariosQuery = horariosQuery.Where(h => h.Empleado.NombreCompleto.ToLower().Contains(texto));
        }

        var horarios = await horariosQuery.ToListAsync();
        var totalHorariosAsignados = horarios.Count;

        int totalMinutosSemanales = horarios.Sum(h =>
        {
            // Primer tramo
            int minutosPrimerTramo = (int)(h.HorarioFin - h.HorarioInicio).TotalMinutes;
            if (minutosPrimerTramo < 0) minutosPrimerTramo += 24 * 60;

            // Segundo tramo (solo si es alterno)
            int minutosSegundoTramo = 0;
            if (h.TipoHorario == TipoHorario.ALTERNO)
            {
                minutosSegundoTramo = (int)(h.SegundoHorarioFin - h.SegundoHorarioInicio).TotalMinutes;
                if (minutosSegundoTramo < 0) minutosSegundoTramo += 24 * 60;
            }

            int dias = (h.Lunes ? 1 : 0) + (h.Martes ? 1 : 0) + (h.Miercoles ? 1 : 0) +
                       (h.Jueves ? 1 : 0) + (h.Viernes ? 1 : 0) + (h.Sabado ? 1 : 0) + (h.Domingo ? 1 : 0);

            return (minutosPrimerTramo + minutosSegundoTramo) * dias;
        });

        var trabajanFindesSemana = horarios.Count(h => h.Sabado || h.Domingo);

        string horasFormateadas;
        if (totalMinutosSemanales < 60)
        {
            horasFormateadas = $"{totalMinutosSemanales} min";
        }
        else
        {
            var horas = totalMinutosSemanales / 60;
            var minutos = totalMinutosSemanales % 60;
            horasFormateadas = $"{horas}:{minutos:D2} hs";
        }

        return new
        {
            TotalHorariosAsignados = totalHorariosAsignados,
            TotalHorasSemanales = totalMinutosSemanales,
            TotalHorasFormateadas = horasFormateadas,
            EmpleadosFindes = trabajanFindesSemana
        };
    }



    /////////////////////////////////////////////////////////////////////////////////////////
    /// METODOS PARA OBTENER DATOS PARA LAS CARD DE SEGUIMIENTO DE EVALUACIONES //////////
    /////////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("EvaluacionesEstadisticas")]
    public async Task<ActionResult<object>> GetEvaluacionesEstadisticas()
    {
        var rolActual = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var emailActual = (await _context.Users.FindAsync(userId))?.Email.Trim().ToLower();

        int? sectorIdSupervisor = null;

        if (rolActual == "SUPERVISOR")
        {
            var supervisor = await _context.Empleado
                .Include(e => e.Puesto)
                .FirstOrDefaultAsync(e => e.Email.Trim().ToLower() == emailActual);

            if (supervisor == null)
            {
                return Ok(new
                {
                    totalEvaluaciones = 0,
                    promedioEvaluaciones = 0,
                    totalEmpleadosEvaluados = 0
                });
            }

            sectorIdSupervisor = supervisor.Puesto.SectorId;
        }

        var EvaluacionesQuery = _context.Evaluacion
            .Include(e => e.Empleado)
            .ThenInclude(e => e.Puesto)
            .Where(e => e.Empleado.Eliminado == false)
            .AsQueryable();

        if (sectorIdSupervisor.HasValue)
        {
            EvaluacionesQuery = EvaluacionesQuery
                .Where(e => e.Empleado.Puesto.SectorId == sectorIdSupervisor.Value);
        }

        var listaEvaluaciones = await EvaluacionesQuery.ToListAsync();

        int totalEvaluaciones = listaEvaluaciones.Count;
        double promedioEvaluaciones = listaEvaluaciones.Any()
            ? Math.Round(listaEvaluaciones.Average(e => e.Calificacion), 2)
            : 0;

        int totalEmpleadosEvaluados = listaEvaluaciones
            .Where(e => e.EmpleadoId != null)
            .Select(e => e.EmpleadoId)
            .Distinct()
            .Count();

        return new
        {
            totalEvaluaciones,
            promedioEvaluaciones,
            totalEmpleadosEvaluados
        };
    }




    /////////////////////////////////////////////////////////////////////////////////////////
    /// METODOS PARA OBTENER DATOS PARA LAS CARD DE SOLICITUD DE LICENCIAS //////////
    /////////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("LicenciasEstadisticas")]
    public async Task<ActionResult<object>> GetLicenciasEstadisticas()
    {
        var totalLicencias = await _context.Licencia.Where(l => l.Empleado != null && !l.Empleado.Eliminado).CountAsync();
        var aprobadasLicencias = await _context.Licencia
            .Where(l => l.Estado == EstadoLicencia.APROBADA && l.Empleado != null && !l.Empleado.Eliminado)
            .CountAsync();
        var pendientesLicencias = await _context.Licencia
            .Where(l => l.Estado == EstadoLicencia.PENDIENTE && l.Empleado != null && !l.Empleado.Eliminado)
            .CountAsync();
        var rechazadasLicencias = await _context.Licencia
            .Where(l => l.Estado == EstadoLicencia.RECHAZADA && l.Empleado != null && !l.Empleado.Eliminado)
            .CountAsync();
        var expiradasLicencias = await _context.Licencia
            .Where(l => l.Estado == EstadoLicencia.EXPIRADA && l.Empleado != null && !l.Empleado.Eliminado)
            .CountAsync();

        return new
        {
            totalLicencias,
            aprobadasLicencias,
            pendientesLicencias,
            rechazadasLicencias,
            expiradasLicencias
        };
    }


    /////////////////////////////////////////////////////////////////////////////////////////
    /// METODOS PARA OBTENER DATOS PARA LAS CARD DE GESTOR DE CAPACITACIONES //////////
    /////////////////////////////////////////////////////////////////////////////////////////
    [HttpGet("CursosEstadisticas")]
    public async Task<ActionResult<object>> GetCursosEstadisticas()
    {
        var totalCursos = await _context.Curso.CountAsync();

        var totalParticipantes = await _context.AsistenciaCapacitacion
            .Where(a =>
                a.Asistencia &&
                a.Resultado >= 6 &&
                a.Empleado != null &&
                !a.Empleado.Eliminado)
            .Select(a => a.EmpleadoId)
            .Distinct()
            .CountAsync();

        var totalCertificadosEmitidos = await _context.Certificado
            .Where(c =>
                c.Empleado != null &&
                !c.Empleado.Eliminado &&
                _context.AsistenciaCapacitacion.Any(a =>
                    a.EmpleadoId == c.EmpleadoId &&
                    a.CursoId == c.CursoId &&
                    a.Asistencia &&
                    a.Resultado >= 6))
            .CountAsync();

        var totalCertificadosPendientes = await _context.AsistenciaCapacitacion
            .Where(a =>
                a.Asistencia &&
                a.Resultado >= 6 &&
                a.Empleado != null &&
                !a.Empleado.Eliminado &&
                !_context.Certificado.Any(c =>
                    c.EmpleadoId == a.EmpleadoId &&
                    c.CursoId == a.CursoId))
            .CountAsync();

        return new
        {
            totalCursos,
            participantesCurso = totalParticipantes,
            certificadosEmitidos = totalCertificadosEmitidos,
            certificadosPendientes = totalCertificadosPendientes
        };
    }


    /////////////////////////////////////////////////////////////////////////////////////////
    /// METODOS PARA OBTENER DATOS PARA LAS CARD DE GESTOR DE JUSTIFICACIONES //////////
    /////////////////////////////////////////////////////////////////////////////////////////
    [HttpPost("JustificacionesEstadisticas")]
    public async Task<ActionResult<object>> GetJustificacionesEstadisticas([FromBody] JustificacionFiltrar filtro)
    {
        var obtenerJustificaciones = _context.Justificacion
            .Where(j => j.Empleado != null && !j.Empleado.Eliminado)
            .AsQueryable();

        if (filtro.EstadoJustificacion.HasValue)
        {
            obtenerJustificaciones = obtenerJustificaciones.Where(j => (int)j.Estados == filtro.EstadoJustificacion.Value);
        }

        if (filtro.FechaJustificacion.HasValue)
        {
            var fecha = filtro.FechaJustificacion.Value.Date;
            obtenerJustificaciones = obtenerJustificaciones.Where(j => j.Fecha.Date == fecha);
        }

        if (!string.IsNullOrEmpty(filtro.EmpleadoTexto))
        {
            var texto = filtro.EmpleadoTexto.ToLower();
            obtenerJustificaciones = obtenerJustificaciones.Where(j => j.Empleado.NombreCompleto.ToLower().Contains(texto));
        }

        var totalJustificaciones = await obtenerJustificaciones.CountAsync();
        var justificacionesPendientes = await obtenerJustificaciones.Where(j => j.Estados == EstadoJustificacion.PENDIENTE).CountAsync();
        var justificacionesAprobadas = await obtenerJustificaciones.Where(j => j.Estados == EstadoJustificacion.APROBADA).CountAsync();
        var justificacionesRechazadas = await obtenerJustificaciones.Where(j => j.Estados == EstadoJustificacion.RECHAZADA).CountAsync();

        return new
        {
            totalJustificaciones,
            justificacionesPendientes,
            justificacionesAprobadas,
            justificacionesRechazadas
        };
    }

}

