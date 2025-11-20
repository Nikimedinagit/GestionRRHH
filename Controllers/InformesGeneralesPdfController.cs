using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using API_RRHH_TESIS2025.Models.General;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;



namespace API_NET_CORE8_RRHH.Controllers
{
    [Authorize(Roles = "ADMINISTRADOR, RRHH")]
    [Route("api/[controller]")]
    [ApiController]
    public class InformesGeneralesPdfController : ControllerBase
    {
        private readonly Context _context;
        private readonly RoleManager<IdentityRole> _rolManager;

        private readonly UserManager<ApplicationUser> _userManager;

        public InformesGeneralesPdfController(Context context, RoleManager<IdentityRole> rolManager, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _context = context;
            _rolManager = rolManager;
            _userManager = userManager;

        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA GENERAR EL INFORME PDF DE EMPLEADOS SEGUN FILTRO /////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("GenerarInformeEmpleados")]
        public IActionResult FiltrarEmpleados([FromBody] FiltrarEmpleado filtro)
        {
            var obtenerEmpleados = _context.Empleado
                .Include(e => e.Localidad)
                .Include(e => e.Puesto)
                .Where(e => !e.Eliminado)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.NombreCompleto))
            {
                var nombreFiltro = filtro.NombreCompleto.ToLower();
                obtenerEmpleados = obtenerEmpleados.Where(e => e.NombreCompleto.ToLower().Contains(nombreFiltro));
            }

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

            var empleados = obtenerEmpleados.ToList();

            var resumen = new
            {
                Total = empleados.Count,
                Hombres = empleados.Count(e => e.TipoSexo == TipoSexo.MASCULINO),
                Mujeres = empleados.Count(e => e.TipoSexo == TipoSexo.FEMENINO),
                NoBinario = empleados.Count(e => e.TipoSexo == TipoSexo.NO_BINARIO),
                Otros = empleados.Count(e => e.TipoSexo == TipoSexo.OTRO),
                Filtros = filtro,
                FechaGeneracion = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")
            };

            return Ok(new { Empleados = empleados, Resumen = resumen });
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA GENERAR EL INFORME DE ASISTENCIAS SEGUN SUS FILTROS /////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("GenerarInformeAsistencias")]
        public async Task<IActionResult> GenerarInformeAsistencias([FromBody] FiltrarAsistencia filtro)
        {
            var obtenerAsistencias = _context.Asistencia
                .Include(a => a.Empleado)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.NombreCompleto))
                obtenerAsistencias = obtenerAsistencias
                    .Where(a => a.Empleado.NombreCompleto.ToLower()
                    .Contains(filtro.NombreCompleto.ToLower()));

            if (filtro.DNI.HasValue)
                obtenerAsistencias = obtenerAsistencias
                    .Where(a => a.Empleado.DNI.ToString()
                    .StartsWith(filtro.DNI.Value.ToString()));

            if (!string.IsNullOrEmpty(filtro.NroLegajo))
                obtenerAsistencias = obtenerAsistencias
                    .Where(a => a.Empleado.NroLegajo.StartsWith(filtro.NroLegajo));

            if (filtro.EstadoAsistencia.HasValue)
                obtenerAsistencias = obtenerAsistencias
                    .Where(a => (int)a.Estado == filtro.EstadoAsistencia.Value);

            var fechaSeleccionada = filtro.Fecha ?? DateTime.Today;
            var fechaSiguiente = fechaSeleccionada.AddDays(1);
            obtenerAsistencias = obtenerAsistencias
                .Where(a => a.Fecha >= fechaSeleccionada && a.Fecha < fechaSiguiente);

            var asistencias = await obtenerAsistencias
                .Select(a => new
                {
                    a.Id,
                    EmpleadoNombre = a.Empleado.NombreCompleto,
                    Estado = a.Estado.ToString(),

                    PrimerEntrada = a.PrimerEntrada,
                    PrimerSalida = a.PrimerSalida,
                    SegundaEntrada = a.SegundaEntrada,
                    SegundaSalida = a.SegundaSalida
                })
                .ToListAsync();

            double totalHorasTrabajadas = asistencias.Sum(a =>
            {
                double h1 = (a.PrimerEntrada != null && a.PrimerSalida != null)
                    ? (a.PrimerSalida.Value - a.PrimerEntrada.Value).TotalHours
                    : 0;

                double h2 = (a.SegundaEntrada != null && a.SegundaSalida != null)
                    ? (a.SegundaSalida.Value - a.SegundaEntrada.Value).TotalHours
                    : 0;

                return h1 + h2;
            });

            var resumen = new
            {
                Total = asistencias.Count,
                Ausentes = asistencias.Count(a => a.Estado == "AUSENTE"),
                LlegadasTarde = asistencias.Count(a => a.Estado == "TARDE"),
                TotalHorasTrabajadas = totalHorasTrabajadas,
                FechaGeneracion = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss"),
                Filtros = filtro
            };

            return Ok(new { Asistencias = asistencias, Resumen = resumen });
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA GENERAR INFORME DE HORARIOS SEGUN SU FILTRO //////////////////////////////////////////////////////
        /// ////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("GenerarInformeHorarios")]
        public async Task<IActionResult> GenerarInformeHorarios([FromBody] FiltrarHorario filtro)
        {
            var obtenerHorarios = _context.Horario
                .Include(h => h.Empleado)
                .ThenInclude(e => e.Puesto)
                .Where(h => h.Empleado != null && !h.Empleado.Eliminado)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filtro.EmpleadoTexto))
            {
                var texto = filtro.EmpleadoTexto.ToLower();
                obtenerHorarios = obtenerHorarios.Where(h => h.Empleado.NombreCompleto.ToLower().Contains(texto));
            }

            if (filtro.TipoHorario.HasValue)
                obtenerHorarios = obtenerHorarios.Where(h => (int)h.TipoHorario == filtro.TipoHorario.Value);

            if (!string.IsNullOrEmpty(filtro.HorarioInicio) && TimeSpan.TryParse(filtro.HorarioInicio, out var horarioInicioTs))
                obtenerHorarios = obtenerHorarios.Where(h => h.HorarioInicio >= horarioInicioTs);

            if (!string.IsNullOrEmpty(filtro.HorarioFin) && TimeSpan.TryParse(filtro.HorarioFin, out var horarioFinTs))
                obtenerHorarios = obtenerHorarios.Where(h => h.HorarioFin <= horarioFinTs);

            var listaHorariosRaw = await obtenerHorarios
                .OrderBy(h => h.Empleado.NombreCompleto)
                .ThenBy(h => h.HorarioInicio)
                .Select(h => new
                {
                    NombreCompleto = h.Empleado.NombreCompleto,
                    Puesto = h.Empleado.Puesto != null ? h.Empleado.Puesto.Descripcion : "Sin puesto",
                    TipoHorario = h.TipoHorario.ToString(),
                    Lunes = h.Lunes,
                    Martes = h.Martes,
                    Miercoles = h.Miercoles,
                    Jueves = h.Jueves,
                    Viernes = h.Viernes,
                    Sabado = h.Sabado,
                    Domingo = h.Domingo,
                    HorarioInicioTs = h.HorarioInicio,
                    HorarioFinTs = h.HorarioFin,
                    SegundoHorarioInicioTs = h.SegundoHorarioInicio,
                    SegundoHorarioFinTs = h.SegundoHorarioFin
                })
                .ToListAsync();

            string FormatHora(TimeSpan ts) => ts == TimeSpan.Zero ? "-" : ts.ToString(@"hh\:mm");

            var listaHorarios = listaHorariosRaw
                .Select(h => new
                {
                    NombreCompleto = h.NombreCompleto,
                    Puesto = h.Puesto,
                    TipoHorario = h.TipoHorario,
                    Lunes = h.Lunes,
                    Martes = h.Martes,
                    Miercoles = h.Miercoles,
                    Jueves = h.Jueves,
                    Viernes = h.Viernes,
                    Sabado = h.Sabado,
                    Domingo = h.Domingo,
                    HorarioInicio = FormatHora(h.HorarioInicioTs),
                    HorarioFin = FormatHora(h.HorarioFinTs),
                    SegundoHorarioInicio = FormatHora(h.SegundoHorarioInicioTs),
                    SegundoHorarioFin = FormatHora(h.SegundoHorarioFinTs)
                })
                .ToList();

            var totalHorasSemanales = listaHorariosRaw.Sum(h =>
            {
                double primerRango = 0;
                double segundoRango = 0;

                if (h.HorarioFinTs > h.HorarioInicioTs)
                    primerRango = (h.HorarioFinTs - h.HorarioInicioTs).TotalMinutes;

                if (h.SegundoHorarioFinTs > h.SegundoHorarioInicioTs)
                    segundoRango = (h.SegundoHorarioFinTs - h.SegundoHorarioInicioTs).TotalMinutes;

                int dias = (h.Lunes ? 1 : 0) + (h.Martes ? 1 : 0) + (h.Miercoles ? 1 : 0) +
                           (h.Jueves ? 1 : 0) + (h.Viernes ? 1 : 0) + (h.Sabado ? 1 : 0) + (h.Domingo ? 1 : 0);

                return (primerRango + segundoRango) * dias;
            });

            var resumen = new
            {
                TotalHorariosAsignados = listaHorarios.Count,
                TotalHorasSemanales = totalHorasSemanales,
                TotalHorasFormateadas = $"{(int)(totalHorasSemanales / 60)}:{((int)totalHorasSemanales % 60):D2} hs",
                EmpleadosFindes = listaHorarios.Count(h => h.Sabado || h.Domingo),
                Filtros = filtro,
                FechaGeneracion = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")
            };

            return Ok(new { Horarios = listaHorarios, Resumen = resumen });
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA GENERAR EL INFORME DE JUSTIFICACIONES SEGUN SUS FILTROS /////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("GenerarInformeJustificaciones")]
        public async Task<IActionResult> GenerarInformeJustificaciones([FromBody] JustificacionFiltrar filtro)
        {
            var query = _context.Justificacion
                .Include(j => j.Empleado)
                .Where(j => j.Empleado != null && !j.Empleado.Eliminado)
                .AsQueryable();

            if (filtro.EstadoJustificacion.HasValue)
                query = query.Where(j => (int)j.Estados == filtro.EstadoJustificacion.Value);

            if (filtro.FechaJustificacion.HasValue)
                query = query.Where(j => j.Fecha.Date == filtro.FechaJustificacion.Value.Date);

            if (!string.IsNullOrEmpty(filtro.EmpleadoTexto))
            {
                var texto = filtro.EmpleadoTexto.ToLower();
                query = query.Where(j => j.Empleado.NombreCompleto.ToLower().Contains(texto));
            }

            var lista = await query
                .OrderBy(j => j.Fecha)
                .Select(j => new
                {
                    EmpleadoString = j.Empleado.NombreCompleto,
                    FechaString = j.Fecha.ToString("dd/MM/yyyy"),
                    EstadoString = j.Estados.ToString(),
                    Motivo = j.Motivo
                })
                .ToListAsync();

            var resumen = new
            {
                total = lista.Count,
                aprobadas = lista.Count(j => j.EstadoString == "APROBADA"),
                pendientes = lista.Count(j => j.EstadoString == "PENDIENTE"),
                rechazadas = lista.Count(j => j.EstadoString == "RECHAZADA")
            };

            return Ok(new { Justificaciones = lista, Resumen = resumen });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA GENERAR EL INFORME DE LICENCIAS SEGUN SUS FILTROS /////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("GenerarInformeLicencias")]
        public IActionResult LicenciaFiltrar([FromBody] LicenciaFiltrar filtro)
        {
            var obtenerLicencias = _context.Licencia
                .Include(l => l.Empleado)
                .Include(l => l.TipoDeLicencia)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.EmpleadoTexto))
            {
                var texto = filtro.EmpleadoTexto.ToLower();
                obtenerLicencias = obtenerLicencias.Where(l => l.Empleado.NombreCompleto.ToLower().Contains(texto));
            }

            if (filtro.TipoDeLicenciaId.HasValue)
                obtenerLicencias = obtenerLicencias.Where(l => l.TipoDeLicenciaId == filtro.TipoDeLicenciaId);

            if (filtro.Estado.HasValue)
                obtenerLicencias = obtenerLicencias.Where(l => (int)l.Estado == filtro.Estado);

            if (filtro.FechaInicio.HasValue && filtro.FechaFin.HasValue)
            {
                var fi = filtro.FechaInicio.Value.Date;
                var ff = filtro.FechaFin.Value.Date;
                obtenerLicencias = obtenerLicencias.Where(l => l.FechaInicio >= fi && l.FechaFin <= ff);
            }

            var licencias = obtenerLicencias
                .Select(l => new
                {
                    id = l.Id,
                    empleadoNombre = l.Empleado.NombreCompleto,
                    tipoDeLicenciaNombre = l.TipoDeLicencia.Nombre,
                    fechaInicio = l.FechaInicio.ToString("dd/MM/yyyy"),
                    fechaFin = l.FechaFin.ToString("dd/MM/yyyy"),
                    estado = l.Estado.ToString()
                })
                .ToList();

            var resumen = new
            {
                total = licencias.Count,
                pendientes = licencias.Count(l => l.estado == "PENDIENTE"),
                aprobadas = licencias.Count(l => l.estado == "APROBADA"),
                rechazadas = licencias.Count(l => l.estado == "RECHAZADA"),
                expiradas = licencias.Count(l => l.estado == "EXPIRADA"),
                filtros = filtro,
                fechaGeneracion = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")
            };

            return Ok(new { licencias, resumen });
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA GENERAR EL INFORME DE LICENCIAS APROBADAS SEGUN SUS FILTROS /////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("GenerarInformeLicenciasAprobadas")]
        public async Task<IActionResult> GenerarInformeLicenciasAprobadas([FromBody] FiltrarAprobacionDeLicencia filtro)
        {
            var obtenerLicenciasAprobadas = _context.AprobacionDeLicencia
                .Include(a => a.Licencia)
                .ThenInclude(l => l.TipoDeLicencia)
                .AsQueryable();

            if (filtro.FechaAprobacion.HasValue)
            {
                var fechaInicio = filtro.FechaAprobacion.Value.Date;
                var fechaFin = fechaInicio.AddDays(1);
                obtenerLicenciasAprobadas = obtenerLicenciasAprobadas
                    .Where(a => a.FechDeAprobacion >= fechaInicio && a.FechDeAprobacion < fechaFin);
            }

            if (filtro.TipoDeLicenciaId.HasValue)
            {
                obtenerLicenciasAprobadas = obtenerLicenciasAprobadas
                    .Where(a => a.Licencia.TipoDeLicenciaId == filtro.TipoDeLicenciaId.Value);
            }

            var vista = await obtenerLicenciasAprobadas
                .Select(a => new
                {
                    a.Id,
                    LicenciaString = a.Licencia.TipoDeLicencia.Nombre,
                    a.LicenciaId,
                    a.FechDeAprobacion,
                    a.Estado,
                    a.UsuarioAprobador
                })
                .ToListAsync();

            var licenciasAprobadas = vista.Select(a => new VistaAprobacionDeLicencia
            {
                Id = a.Id,
                LicenciaString = a.LicenciaString,
                LicenciaId = a.LicenciaId,
                FechaDeAprobacion = a.FechDeAprobacion.ToString("dd/MM/yyyy"),
                EstadoString = a.Estado.ToString(),
                Estado = a.Estado,
                NombreUsuarioAprobador = _context.Users.FirstOrDefault(u => u.Id == a.UsuarioAprobador)?.NombreCompleto,
                EmailUsuarioAprobador = _context.Users.FirstOrDefault(u => u.Id == a.UsuarioAprobador)?.Email
            }).ToList();

            var resumen = new
            {
                totalAprobadas = licenciasAprobadas.Count,
                filtros = filtro,
                fechaGeneracion = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")
            };

            return Ok(new { LicenciasAprobadas = licenciasAprobadas, Resumen = resumen });
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA GENERAR EL INFORME DE CURSOS SEGUN SUS FILTROS /////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("GenerarInformeCursos")]
        public async Task<IActionResult> GenerarInformeCursos([FromBody] FiltroCurso filtro)
        {
            var obtenerCursos = _context.Curso
                .Include(c => c.AsistenciaCapacitacion)
                    .ThenInclude(a => a.Empleado)
                .Include(c => c.Certificado)
                    .ThenInclude(cert => cert.Empleado)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.NombreCurso))
                obtenerCursos = obtenerCursos.Where(c => EF.Functions.Like(c.Nombre, $"%{filtro.NombreCurso.Trim()}%"));

            if (filtro.Modalidad.HasValue && filtro.Modalidad.Value != 0)
                obtenerCursos = obtenerCursos.Where(c => (int)c.Modalidad == filtro.Modalidad.Value);

            if (filtro.Fecha.HasValue)
                obtenerCursos = obtenerCursos.Where(c => c.FechaInicio.Date == filtro.Fecha.Value.Date);

            var cursos = await obtenerCursos
                .Select(c => new
                {
                    id = c.Id,
                    NombreCurso = c.Nombre,
                    Descripcion = c.Descripcion,
                    FechaInicio = c.FechaInicio,
                    FechaFinalizacion = c.FechaFinalizacion,
                    Modalidad = c.Modalidad,
                    ModalidadStr = c.Modalidad.ToString(),
                    Finalizado = c.Finalizado,
                    Empleados = c.AsistenciaCapacitacion
                        .Select(a => new
                        {
                            NombreEmpleado = a.Empleado.NombreCompleto ?? "-",
                            Asistio = a.Asistencia,
                            Resultado = a.Resultado,
                            Certificado = c.Certificado
                                .Where(cert => cert.EmpleadoId == a.EmpleadoId)
                                .Select(cert => new
                                {
                                    url = cert.DocumentoNombre,
                                    archivo = cert.DocumentoAdjunto != null ? cert.DocumentoNombre : "-"
                                })
                                .FirstOrDefault()
                        }).ToList()
                })
                .ToListAsync();

            var resumen = new
            {
                total = cursos.Count,
                presencial = cursos.Count(c => c.Modalidad == Modalidades.PRESENCIAL),
                online = cursos.Count(c => c.Modalidad == Modalidades.VIRTUAL),
                mixto = cursos.Count(c => c.Modalidad == Modalidades.MIXTO),
                filtros = filtro,
                fechaGeneracion = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")
            };

            return Ok(new { cursos, resumen });
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// METODO PARA GENERAR EL INFORME DE CURSOS SEGUN SUS FILTROS /////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        [HttpPost("GenerarInformeEvaluaciones")]
        public async Task<IActionResult> GenerarInformeEvaluaciones([FromBody] EvaluacionFiltro filtro)
        {

            var obtenerEvaluaciones = _context.Evaluacion
                .Include(e => e.CriterioDeEvaluacion)
                .Include(e => e.Empleado)
                .AsQueryable();



            if (!string.IsNullOrEmpty(filtro.NombreEmpleado))
                obtenerEvaluaciones = obtenerEvaluaciones
                    .Where(e => e.Empleado.NombreCompleto.ToLower().Contains(filtro.NombreEmpleado.ToLower()));

            if (filtro.Fecha.HasValue)
            {
                var fecha = filtro.Fecha.Value.Date;
                var fechaSiguiente = fecha.AddDays(1);
                obtenerEvaluaciones = obtenerEvaluaciones
                    .Where(e => e.Fecha >= fecha && e.Fecha < fechaSiguiente);
            }
            if (filtro.Calificacion.HasValue)
            {
                obtenerEvaluaciones = filtro.Calificacion.Value switch
                {
                    1 => obtenerEvaluaciones.Where(e => e.Calificacion < 5),
                    2 => obtenerEvaluaciones.Where(e => e.Calificacion >= 5 && e.Calificacion < 7),
                    3 => obtenerEvaluaciones.Where(e => e.Calificacion >= 7 && e.Calificacion < 9),
                    4 => obtenerEvaluaciones.Where(e => e.Calificacion >= 9),
                    _ => obtenerEvaluaciones
                };
            }


            var evaluacion = await obtenerEvaluaciones
                .Select(e => new
                {
                    id = e.Id,
                    Fecha = e.Fecha,
                    Calificacion = e.Calificacion,
                    Empleado = e.Empleado.NombreCompleto,
                    Criterios = e.CriterioDeEvaluacion.Select(c => new
                    {
                        CriterioId = c.Id,
                        CriterioNombre = c.TipoDeCriterio.Nombre,
                        CriterioDescripcion = c.Descripcion
                    })
                })
                .ToListAsync();

            var evaluacionCalificacion = new Dictionary<string, int>
    {
        { "Excelente", evaluacion.Count(e => e.Calificacion >= 9) },
        { "Buena", evaluacion.Count(e => e.Calificacion >= 7 && e.Calificacion < 9) },
        { "Muy Buena", evaluacion.Count(e => e.Calificacion >= 5 && e.Calificacion < 7) },
        { "Mala", evaluacion.Count(e => e.Calificacion < 5) }
    };

            var resumen = new
            {
                total = evaluacion.Count,
                evaluacionCalificacion,
                filtros = filtro,
                fechaGeneracion = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")
            };

            return Ok(new { evaluacion, resumen });
        }


        [HttpPost("GenerarInformeActivacionEmpleados")]
        public async Task<IActionResult> GenerarInformeActivacionEmpleados([FromBody] FiltrarActivacionEmpleado filtro)
        {
            var obtenerActivaciones = _context.ActivacionEmpleado
                .Include(a => a.Empleado)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.Nombre))
            {
                obtenerActivaciones = obtenerActivaciones.Where(a =>
                    a.Empleado.NombreCompleto.ToLower().Contains(filtro.Nombre.Trim().ToLower()));
            }
            if (!string.IsNullOrWhiteSpace(filtro.Email))
            {
                obtenerActivaciones = obtenerActivaciones.Where(a =>
                    a.Empleado.Email.ToLower().Contains(filtro.Email.Trim().ToLower()));
            }
            if (filtro.DNI.HasValue)
            {
                string dniFiltro = filtro.DNI.Value.ToString();
                obtenerActivaciones = obtenerActivaciones.Where(a =>
                    a.Empleado.DNI.ToString().StartsWith(dniFiltro));
            }

            if (filtro.Activo.HasValue)
            {
                bool activo = filtro.Activo.Value == 1;
                obtenerActivaciones = obtenerActivaciones.Where(a => a.Activo == activo);
            }

            var activaciones = await obtenerActivaciones
                .OrderBy(a => !a.Activo)
                .ThenBy(a => a.Empleado.NombreCompleto)
                .ToListAsync();

            var listaFinal = new List<VistaActivacionEmpleado>();

            foreach (var a in activaciones)
            {
                var usuario = await _userManager.FindByEmailAsync(a.Empleado.Email);
                string rol = "SIN ROL";

                if (usuario != null)
                {
                    var roles = await _userManager.GetRolesAsync(usuario);
                    rol = roles.FirstOrDefault() ?? "SIN ROL";
                }

                listaFinal.Add(new VistaActivacionEmpleado
                {
                    Id = a.Id,
                    EmpleadoNombreString = a.Empleado.NombreCompleto,
                    EmpleadoEmailString = a.Empleado.Email,
                    EmpleadoDNIString = a.Empleado.DNI.ToString(),
                    FechaActivacionString = a.FechaActivacion?.ToString("dd/MM/yyyy") ?? "",
                    Activo = a.Activo ,
                    EmpleadoId = a.EmpleadoId,
                    Rol = rol
                });
            }

            var resumen = new
            {
                total = listaFinal.Count,
                activos = listaFinal.Count(a => a.Activo),
                inactivos = listaFinal.Count(a => !a.Activo),
                filtros = filtro,
                fechaGeneracion = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")
            };
            return Ok(new { activaciones = listaFinal, resumen });
        }





    }
}
