using GestionRRHH.Models.Dto;
using GestionRRHH.Models.General;
using GestionRRHH.Helpers;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace GestionRRHH.Services
{
    public class AsistenciaService : IAsistenciaService
    {
        private readonly Context _db;
        private const double FACE_TOLERANCE = 0.60;
        private static readonly TimeSpan TOLERANCIA = TimeSpan.FromMinutes(15);

        public AsistenciaService(Context db) => _db = db;

        // ========================
        // Registrar rostro
        // ========================
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
                    return (false, new { Mensaje = "Este rostro ya está registrado con otro Empleado." });
            }

            empleado.FaceDescriptor = EmbeddingHelper.FloatsToBytes(faceDescriptor);
            await _db.SaveChangesAsync();

            return (true, new
            {
                Mensaje = "📸 Rostro registrado/actualizado correctamente.",
                Empleado = new { empleado.NombreCompleto, empleado.DNI }
            });
        }

        // ========================
        // Fichar
        // ========================
        public async Task<(bool ok, object payload)> FicharAsync(FicharDto dto)
        {
            if (dto == null || dto.FaceDescriptor == null || dto.FaceDescriptor.Length == 0)
                return (false, new { Mensaje = "El rostro es obligatorio." });

            var faceDescriptor = dto.FaceDescriptor;
            var fotoBase64 = dto.FotoBase64;

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

            var ahoraDt = DateTime.Now;
            var hoy = ahoraDt.Date;

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
                    Estado = EstadoAsistencia.INCOMPLETA
                };
                _db.Asistencia.Add(asistencia);
                await _db.SaveChangesAsync();
            }

            if (!string.IsNullOrEmpty(fotoBase64))
            {
                byte[] fotoBytes = Convert.FromBase64String(fotoBase64);
                asistencia.FotoRuta = await GuardarFotoAsync(fotoBytes, empleado.Id);
            }

            await _db.SaveChangesAsync();

            var proxima = ProximaFichadaEsperada(asistencia, horario);
            if (proxima == null)
                return (false, new { Mensaje = "Ya registraste todas las fichadas de hoy.", Empleado = new { empleado.NombreCompleto, empleado.DNI } });

            var esperado = HoraEsperada(proxima, horario);
            bool fuera = false, tarde = false;

            if (proxima.Contains("Entrada"))
            {
                if (ahoraDt.TimeOfDay < esperado - TOLERANCIA) fuera = true;
                if (ahoraDt.TimeOfDay > esperado + TOLERANCIA) tarde = true;

                if (proxima == "PrimerEntrada") asistencia.PrimerEntrada = ahoraDt.TimeOfDay;
                else if (proxima == "SegundaEntrada") asistencia.SegundaEntrada = ahoraDt.TimeOfDay;
            }
            else
            {
                if (ahoraDt.TimeOfDay < esperado - TOLERANCIA) fuera = true;
                if (proxima == "PrimerSalida") asistencia.PrimerSalida = ahoraDt.TimeOfDay;
                else if (proxima == "SegundaSalida") asistencia.SegundaSalida = ahoraDt.TimeOfDay;
            }

            if (fuera) asistencia.Estado = EstadoAsistencia.FUERADEHORARIO;
            else if (tarde && (proxima == "PrimerEntrada" || proxima == "SegundaEntrada"))
                asistencia.Estado = EstadoAsistencia.TARDE;
            else
                asistencia.Estado = CompletaSegunTipo(asistencia, horario) ? EstadoAsistencia.COMPLETA : EstadoAsistencia.INCOMPLETA;

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

        // ========================
        // Registrar ausentes automáticamente
        // ========================
        public async Task RegistrarAusentesAutomaticamenteAsync()
        {
            var hoy = DateTime.Today;

            var empleados = await _db.Empleado
                .Where(e => !e.Eliminado)
                .ToListAsync();

            foreach (var empleado in empleados)
            {
                var existe = await _db.Asistencia
                    .FirstOrDefaultAsync(a => a.EmpleadoId == empleado.Id && a.Fecha == hoy);

                if (existe == null)
                {
                    _db.Asistencia.Add(new Asistencia
                    {
                        EmpleadoId = empleado.Id,
                        Fecha = hoy,
                        Estado = EstadoAsistencia.AUSENTE,
                        FotoRuta = "/img/avatarAusente.png"
                    });
                }
            }

            await _db.SaveChangesAsync();
        }

        
        // ========================
        // Métodos auxiliares privados
        // ========================
        private static string SufijoEstado(EstadoAsistencia e) =>
            e == EstadoAsistencia.TARDE ? " (TARDE)" :
            e == EstadoAsistencia.FUERADEHORARIO ? " (FUERA DE HORARIO)" : "";

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



        private async Task<string> GuardarFotoAsync(byte[] fotoBytes, int empleadoId)
        {
            var fecha = DateTime.Now;
            var carpeta = Path.Combine("wwwroot", "fichadas", fecha.ToString("yyyy-MM-dd"));
            if (!Directory.Exists(carpeta)) Directory.CreateDirectory(carpeta);

            var nombreArchivo = $"empleado{empleadoId}_{fecha:HHmmss}.png";
            var rutaCompleta = Path.Combine(carpeta, nombreArchivo);

            await File.WriteAllBytesAsync(rutaCompleta, fotoBytes);

            return $"/fichadas/{fecha:yyyy-MM-dd}/{nombreArchivo}";
        }
    }
}
