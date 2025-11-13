using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

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
        IQueryable<Empleado> obtenerEmpleados = _context.Empleado.Where(e => !e.Eliminado);

        if (!string.IsNullOrEmpty(filtro.NombreCompleto))
            obtenerEmpleados = obtenerEmpleados.Where(e => e.NombreCompleto.ToLower().Contains(filtro.NombreCompleto.ToLower()));

        if (filtro.DNI.HasValue)
            obtenerEmpleados = obtenerEmpleados.Where(e => e.DNI.ToString().StartsWith(filtro.DNI.Value.ToString()));

        if (!string.IsNullOrEmpty(filtro.NroLegajo))
            obtenerEmpleados = obtenerEmpleados.Where(e => e.NroLegajo.StartsWith(filtro.NroLegajo));

        if (filtro.EstadoCiviles.HasValue)
            obtenerEmpleados = obtenerEmpleados.Where(e => (int)e.EstadoCiviles == filtro.EstadoCiviles);

        if (filtro.TipoSexo.HasValue)
            obtenerEmpleados = obtenerEmpleados.Where(e => (int)e.TipoSexo == filtro.TipoSexo);

        if (filtro.LocalidadId.HasValue)
            obtenerEmpleados = obtenerEmpleados.Where(e => e.LocalidadId == filtro.LocalidadId.Value);

        if (filtro.PuestoId.HasValue)
            obtenerEmpleados = obtenerEmpleados.Where(e => e.PuestoId == filtro.PuestoId.Value);

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
    [HttpGet("AsistenciasEstadisticas")]
    public async Task<ActionResult<object>> GetAsistenciasEstadisticas()
    {
        var totalAsistenciasHoy = await _context.Asistencia.CountAsync(a => a.Fecha == DateTime.Today);

        var totalMinutosTrabajados = await _context.Asistencia
            .Where(a =>
                a.HorarioId.HasValue &&
                a.Fecha == DateTime.Today &&
                a.PrimerEntrada.HasValue &&
                a.PrimerSalida.HasValue &&
                a.SegundaEntrada.HasValue &&
                a.SegundaSalida.HasValue)
            .Select(a =>
                EF.Functions.DateDiffMinute(a.PrimerEntrada.Value, a.PrimerSalida.Value) +
                EF.Functions.DateDiffMinute(a.SegundaEntrada.Value, a.SegundaSalida.Value))
            .SumAsync();

        var empleadosAusentes = await _context.Asistencia.CountAsync(a => a.Estado == EstadoAsistencia.AUSENTE && a.Fecha == DateTime.Today);
        var empleadosLLegadasTardes = await _context.Asistencia.CountAsync(a => a.Estado == EstadoAsistencia.TARDE && a.Fecha == DateTime.Today);

        string horasFormateadas;
        if (totalMinutosTrabajados < 60)
        {
            horasFormateadas = $"{totalMinutosTrabajados} min";
        }
        else
        {
            var horas = totalMinutosTrabajados / 60;
            var minutos = totalMinutosTrabajados % 60;
            horasFormateadas = $"{horas}:{minutos.ToString("D2")} hs";
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
    [HttpGet("HorariosEstadisticas")]
    public async Task<ActionResult<object>> GetHorariosEstadisticas()
    {
        var totalHorariosAsignados = await _context.Horario.Where(h => h.Empleado.Eliminado == false).CountAsync();

        var totalMinutosSemanales = await _context.Horario
            .Where(h =>
                h.Empleado != null &&
                !h.Empleado.Eliminado &&
                (h.Lunes || h.Martes || h.Miercoles || h.Jueves || h.Viernes || h.Sabado || h.Domingo)
            )
            .Select(h =>
                (
                    EF.Functions.DateDiffMinute(h.HorarioInicio, h.HorarioFin) +
                    EF.Functions.DateDiffMinute(h.SegundoHorarioInicio, h.SegundoHorarioFin)
                ) *
                (
                    (h.Lunes ? 1 : 0) +
                    (h.Martes ? 1 : 0) +
                    (h.Miercoles ? 1 : 0) +
                    (h.Jueves ? 1 : 0) +
                    (h.Viernes ? 1 : 0) +
                    (h.Sabado ? 1 : 0) +
                    (h.Domingo ? 1 : 0)
                )
            )
            .SumAsync();

        var trabajanFindesSemana = await _context.Horario
            .Where(h => h.Empleado.Eliminado == false && h.Sabado || h.Domingo)
            .CountAsync();

        string horasFormateadas;
        if (totalMinutosSemanales < 60)
        {
            horasFormateadas = $"{totalMinutosSemanales} min";
        }
        else
        {
            var horas = totalMinutosSemanales / 60;
            var minutos = totalMinutosSemanales % 60;
            horasFormateadas = $"{horas}:{minutos.ToString("D2")} hs";
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
        var totalEvaluaciones = await _context.Evaluacion.Where(e => e.Empleado.Eliminado == false).CountAsync();
        var promedioEvaluaciones = await _context.Evaluacion
            .Where(e => e.Empleado.Eliminado == false)
            .Select(e => e.Calificacion)
            .AverageAsync();

        var totalEmpleadosEvaluados = await _context.Evaluacion
            .Where(e => e.EmpleadoId != null && e.Empleado.Eliminado == false)
            .Select(e => e.EmpleadoId)
            .Distinct()
            .CountAsync();

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
    [HttpGet("JustificacionesEstadisticas")]
    public async Task<ActionResult<object>> GetJustificacionesEstadisticas()
    {
        var totalJustificaciones = await _context.Justificacion.Where(j => j.Empleado != null && !j.Empleado.Eliminado).CountAsync();
        var justificacionesPendientes = await _context.Justificacion.Where(j => j.Estados == EstadoJustificacion.PENDIENTE && j.Empleado != null && !j.Empleado.Eliminado).CountAsync();
        var justificacionesAprobadas = await _context.Justificacion.Where(j => j.Estados == EstadoJustificacion.APROBADA && j.Empleado != null && !j.Empleado.Eliminado).CountAsync();
        var justificacionesRechazadas = await _context.Justificacion.Where(j => j.Estados == EstadoJustificacion.RECHAZADA && j.Empleado != null && !j.Empleado.Eliminado).CountAsync();
        return new
        {
            totalJustificaciones,
            justificacionesPendientes,
            justificacionesAprobadas,
            justificacionesRechazadas
        };

    }
}

