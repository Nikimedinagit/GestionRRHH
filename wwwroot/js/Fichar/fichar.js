const video = document.getElementById("video");
const mensaje = document.getElementById("mensaje");
const estadoDiv = document.getElementById("estadoAsistencia");
const btnReintentar = document.getElementById("btnReintentar");
let faceDescriptor;
let canvas;

// Iniciar cámara
async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
    document.getElementById("video-container").style.display = "inline-block";
  } catch (err) {
    mensaje.textContent = "❌ Error accediendo a la cámara: " + err.message;
  }
}

// Capturar rostro y dibujar canvas
async function captureFace() {
  const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor()
    .withAgeAndGender();

  if (!detection) throw new Error("❌ No se detectó rostro. Asegúrese de estar frente a la cámara.");

  // Convertir descriptor a float32 para enviar a C#
  faceDescriptor = Array.from(new Float32Array(detection.descriptor));

  if (!canvas) {
    canvas = faceapi.createCanvasFromMedia(video);
    document.getElementById("video-container").append(canvas);
  }

  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  faceapi.matchDimensions(canvas, displaySize);
  const resized = faceapi.resizeResults(detection, displaySize);

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  faceapi.draw.drawDetections(canvas, resized);
  faceapi.draw.drawFaceLandmarks(canvas, resized);

  const { age, gender } = detection;
  const box = detection.detection.box;
  const drawBox = new faceapi.draw.DrawBox(box, { label: `${Math.round(age)} años, ${gender}` });
  drawBox.draw(canvas);
}

// Mostrar estado de fichadas
function mostrarEstado(asistencia) {
  if(!asistencia) return estadoDiv.innerHTML = '';
  const tipoHorario = asistencia.TipoHorario === 1 ? "Continuo" : "Alterno";
  estadoDiv.innerHTML = `
    <div><strong>Horario:</strong> ${tipoHorario}</div>
    <div>Primer Entrada: <span class="${asistencia.PrimerEntrada ? 'entrada':'pendiente'}">${asistencia.PrimerEntrada || 'Pendiente'}</span></div>
    <div>Primer Salida: <span class="${asistencia.PrimerSalida ? 'entrada':'pendiente'}">${asistencia.PrimerSalida || 'Pendiente'}</span></div>
    <div>Segunda Entrada: <span class="${asistencia.SegundaEntrada ? 'entrada':'pendiente'}">${asistencia.SegundaEntrada || 'Pendiente'}</span></div>
    <div>Segunda Salida: <span class="${asistencia.SegundaSalida ? 'entrada':'pendiente'}">${asistencia.SegundaSalida || 'Pendiente'}</span></div>
  `;
}

// Enviar datos al backend
async function enviarFichaje(dni) {
  try {
    const res = await fetch("https://localhost:7006/api/Asistencias/Fichar", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Dni: dni, FaceDescriptor: faceDescriptor })
    });

    const data = await res.json();
    mensaje.textContent = data.Mensaje || JSON.stringify(data);
    mostrarEstado(data.Asistencia);
    btnReintentar.style.display = "inline-block";
  } catch(err) {
    mensaje.textContent = err.message;
    btnReintentar.style.display = "inline-block";
  }
}

// Botón iniciar
document.getElementById("btnIniciar").addEventListener("click", async () => {
  const dni = document.getElementById("dniInput").value.trim();
  if (!dni) return alert("Ingrese su DNI");

  mensaje.textContent = "⌛ Cargando modelos y cámara...";

  await faceapi.nets.tinyFaceDetector.loadFromUri('models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('models');
  await faceapi.nets.ageGenderNet.loadFromUri('models');

  await startVideo();
  mensaje.textContent = "😊 Mire la cámara para fichar";

  setTimeout(async () => {
    try {
      await captureFace();
      await enviarFichaje(dni);
    } catch(err) {
      mensaje.textContent = err.message;
      btnReintentar.style.display = "inline-block";
    }
  }, 2000);
});

// Botón reintentar
btnReintentar.addEventListener("click", async () => {
  mensaje.textContent = "😊 Reintentando captura facial...";
  if (canvas) canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);
  const dni = document.getElementById("dniInput").value.trim();
  try {
    await captureFace();
    await enviarFichaje(dni);
  } catch(err) {
    mensaje.textContent = err.message;
  }
});