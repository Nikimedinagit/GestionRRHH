using API_RRHH_TESIS2025.Models.General;
using API_RRHH_TESIS2025.Helpers;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API_RRHH_TESIS2025.Services
{
    public class AsistenciaService : IAsistenciaService
    {
        private readonly Context _db;
        private const double FACE_TOLERANCE = 0.60;
        private static readonly TimeSpan TOLERANCIA = TimeSpan.FromMinutes(15);

        public AsistenciaService(Context db) => _db = db;

        // Registrar rostro: DNI + rostro
        public async Task<(bool ok, object payload)> RegistrarRostroAsync(string dni, float[] faceDescriptor)
        {
            if (string.IsNullOrWhiteSpace(dni) || faceDescriptor == null || faceDescriptor.Length == 0)
                return (false, new { Mensaje = "DNI y rostro son obligatorios." });

            var empleado = await _db.Empleado.FirstOrDefaultAsync(e => e.DNI.ToString() == dni && !e.Eliminado);
            if (empleado == null)
                return (false, new { Mensaje = "Empleado no encontrado o inactivo." });

            // Validar que el rostro no exista en otro empleado
            var empleadosConRostro = await _db.Empleado
                .Where(e => e.FaceDescriptor != null && e.FaceDescriptor.Length > 0 && !e.Eliminado && e.DNI.ToString() != dni)
                .ToListAsync();

            foreach (var e in empleadosConRostro)
            {
                var saved = EmbeddingHelper.BytesToFloats(e.FaceDescriptor);
                var dist = EmbeddingHelper.Euclidean(faceDescriptor, saved);
                if (dist <= FACE_TOLERANCE)
                    return (false, new { Mensaje = "Este rostro ya está registrado con otro DNI." });
            }

            empleado.FaceDescriptor = EmbeddingHelper.FloatsToBytes(faceDescriptor);
            await _db.SaveChangesAsync();

            return (true, new
            {
                Mensaje = "📸 Rostro registrado/actualizado correctamente.",
                Empleado = new { empleado.NombreCompleto, empleado.DNI }
            });
        }

        // Fichar: solo rostro
        public async Task<(bool ok, object payload)> FicharAsync(float[] faceDescriptor)
        {
            if (faceDescriptor == null || faceDescriptor.Length == 0)
                return (false, new { Mensaje = "El rostro es obligatorio." });

            // Buscar empleado por rostro
            var empleadosConRostro = await _db.Empleado
                .Include(e => e.Horario)
                .Where(e => e.FaceDescriptor != null && e.FaceDescriptor.Length > 0 && !e.Eliminado)
                .ToListAsync();

            Empleado? empleado = null;
            double minDist = double.MaxValue;

            foreach (var e in empleadosConRostro)
            {
                var saved = EmbeddingHelper.BytesToFloats(e.FaceDescriptor);
                var dist = EmbeddingHelper.Euclidean(faceDescriptor, saved);
                if (dist < minDist && dist <= FACE_TOLERANCE)
                {
                    minDist = dist;
                    empleado = e;
                }
            }

            if (empleado == null)
                return (false, new { Mensaje = "Rostro no reconocido." });

            // --- Lógica de fichaje idéntica a la versión anterior ---
            var ahoraDt = DateTime.Now;
            var hoy = ahoraDt.Date;
            var hora = ahoraDt.TimeOfDay;

            var horario = await ObtenerHorarioDelDiaAsync(empleado, ahoraDt.DayOfWeek);
            if (horario == null)
                return (false, new { Mensaje = "Hoy no tenés horario asignado." });

            var asistencia = await _db.Asistencia
                .FirstOrDefaultAsync(a => a.EmpleadoId == empleado.Id && a.Fecha == hoy);

            if (asistencia == null)
            {
                asistencia = new Asistencia
                {
                    EmpleadoId = empleado.Id,
                    HorarioId = horario.Id,
                    Fecha = hoy,
                    Estado = EstadoAsistencia.Incompleta
                };
                _db.Asistencia.Add(asistencia);
                await _db.SaveChangesAsync();
            }

            var proxima = ProximaFichadaEsperada(asistencia, horario);
            if (proxima == null)
                return (false, new
                {
                    Mensaje = "Ya registraste todas las fichadas de hoy.",
                    Empleado = new { empleado.NombreCompleto, empleado.DNI }
                });


            var esperado = HoraEsperada(proxima, horario);
            bool fuera = false, tarde = false;

            if (proxima.Contains("Entrada"))
            {
                if (hora < esperado - TOLERANCIA) fuera = true;
                if (hora > esperado + TOLERANCIA) tarde = true;

                if (proxima == "PrimerEntrada") asistencia.PrimerEntrada = hora;
                else if (proxima == "SegundaEntrada") asistencia.SegundaEntrada = hora;
            }
            else
            {
                if (hora < esperado - TOLERANCIA) fuera = true;
                if (proxima == "PrimerSalida") asistencia.PrimerSalida = hora;
                else if (proxima == "SegundaSalida") asistencia.SegundaSalida = hora;
            }

            if (fuera) asistencia.Estado = EstadoAsistencia.FueraDeHorario;
            else if (tarde && (proxima == "PrimerEntrada" || proxima == "SegundaEntrada"))
                asistencia.Estado = EstadoAsistencia.Tarde;
            else
                asistencia.Estado = CompletaSegunTipo(asistencia, horario) ? EstadoAsistencia.Completa : EstadoAsistencia.Incompleta;

            await _db.SaveChangesAsync();

            var msg = proxima switch
            {
                "PrimerEntrada" => $"Primer entrada registrada a las {ahoraDt:HH:mm}" + SufijoEstado(asistencia.Estado),
                "PrimerSalida" => $"Primer salida registrada a las {ahoraDt:HH:mm}",
                "SegundaEntrada" => $"Segunda entrada registrada a las {ahoraDt:HH:mm}" + SufijoEstado(asistencia.Estado),
                "SegundaSalida" => $"Segunda salida registrada a las {ahoraDt:HH:mm}",
                _ => "Marcación registrada"
            };

            return (true, new
            {
                Mensaje = msg,
                Distancia = Math.Round(minDist, 4),
                Empleado = new { empleado.NombreCompleto, empleado.DNI },
                TipoHorario = horario.TipoHorario.ToString(),
                Fichada = proxima,
                Fecha = hoy.ToString("dd/MM/yyyy"),
                Hora = ahoraDt.ToString("HH:mm"),
                Estado = asistencia.Estado.ToString()
            });
        }

        private static string SufijoEstado(EstadoAsistencia e) =>
            e == EstadoAsistencia.Tarde ? " (TARDE)" :
            e == EstadoAsistencia.FueraDeHorario ? " (FUERA DE HORARIO)" : "";

        private static bool CompletaSegunTipo(Asistencia a, Horario h) =>
            h.TipoHorario == TipoHorario.CONTINUO
                ? a.PrimerEntrada.HasValue && a.PrimerSalida.HasValue
                : a.PrimerEntrada.HasValue && a.PrimerSalida.HasValue && a.SegundaEntrada.HasValue && a.SegundaSalida.HasValue;

        private static string? ProximaFichadaEsperada(Asistencia a, Horario h)
        {
            if (!a.PrimerEntrada.HasValue) return "PrimerEntrada";
            if (!a.PrimerSalida.HasValue) return "PrimerSalida";
            if (h.TipoHorario == TipoHorario.ALTERNO)
            {
                if (!a.SegundaEntrada.HasValue) return "SegundaEntrada";
                if (!a.SegundaSalida.HasValue) return "SegundaSalida";
            }
            return null;
        }

        private static TimeSpan HoraEsperada(string fichada, Horario h) => fichada switch
        {
            "PrimerEntrada" => h.HorarioInicio,
            "PrimerSalida" => h.HorarioFin,
            "SegundaEntrada" => h.SegundoHorarioInicio,
            "SegundaSalida" => h.SegundoHorarioFin,
            _ => TimeSpan.Zero
        };

        private async Task<Horario?> ObtenerHorarioDelDiaAsync(Empleado e, DayOfWeek dia)
        {
            var horarios = await _db.Horario.Where(h => h.EmpleadoId == e.Id).ToListAsync();
            return horarios.FirstOrDefault(h => DiaHabilitado(h, dia));
        }

        private static bool DiaHabilitado(Horario h, DayOfWeek d) => d switch
        {
            DayOfWeek.Monday => h.Lunes,
            DayOfWeek.Tuesday => h.Martes,
            DayOfWeek.Wednesday => h.Miercoles,
            DayOfWeek.Thursday => h.Jueves,
            DayOfWeek.Friday => h.Viernes,
            DayOfWeek.Saturday => h.Sabado,
            DayOfWeek.Sunday => h.Domingo,
            _ => false
        };
    }
}
