
const btnFichar = document.getElementById('btnFichar');
const btnRegistrar = document.getElementById('btnRegistrar');
const dniInput = document.getElementById('dniInput');
const video = document.getElementById('video');
const mensajeCamara = document.getElementById('mensajeCamara');
const mensajeBackend = document.getElementById('mensajeBackend');

let faceDescriptor, canvas, stream;

function showMensajeCamara(msg, tiempo=3000) {
  mensajeCamara.textContent = msg;
  mensajeCamara.style.display = 'block';
  setTimeout(() => { mensajeCamara.style.display = 'none'; }, tiempo);
}

function showMensajeBackend(data, tipo='success', tiempo=5000) {
  const nombre = data.nombre || data.NombreCompleto || data.Empleado?.NombreCompleto || '';
  const dni = data.dni || data.Dni || data.Empleado?.DNI || '';

  // Mensaje crítico de DNI vacío
  if(tipo === 'error' && data.mensaje === 'Ingrese DNI válido') {
    mensajeBackend.innerHTML = `<span>${data.mensaje}</span>`;
  } else {
    mensajeBackend.innerHTML = `
      ${nombre ? `<span>${nombre}</span>` : ''}
      ${dni ? `<span>DNI: ${dni}</span>` : ''}
      <span>${data.mensaje || data.Mensaje || ''}</span>
    `;
  }

  mensajeBackend.className = `mensaje-backend-card ${tipo}`;
  mensajeBackend.style.display = 'flex';
  setTimeout(() => { mensajeBackend.style.display = 'none'; }, tiempo);
}

// Spinner eliminado
function showSpinner(show=true) { }

async function startVideo() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.style.display = 'block';
  } catch (e) {
    showMensajeBackend({mensaje: e.message}, 'error');
  }
}

async function stopVideo() {
  if (stream) stream.getTracks().forEach(track => track.stop());
  video.style.display = 'none';
  if (canvas) { canvas.remove(); canvas = null; }
}

async function captureFace() {
  const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                                  .withFaceLandmarks()
                                  .withFaceDescriptor();
  if (!detection) { 
    showMensajeBackend({mensaje:"No se detectó rostro"}, "error"); 
    throw new Error("No se detectó rostro"); 
  }
  faceDescriptor = Array.from(new Float32Array(detection.descriptor));

  if (!canvas) {
    canvas = faceapi.createCanvasFromMedia(video);
    video.parentNode.append(canvas);
  }
  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  faceapi.matchDimensions(canvas, displaySize);
  const resized = faceapi.resizeResults(detection, displaySize);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  faceapi.draw.drawDetections(canvas, resized);
  faceapi.draw.drawFaceLandmarks(canvas, resized);
}

async function callBackend(endpoint, dni) {
  try {
    // Capturamos la foto del video como base64
    let fotoBase64 = null;
    if (endpoint === 'Fichar') {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      tempCanvas.getContext('2d').drawImage(video, 0, 0);
      fotoBase64 = tempCanvas.toDataURL('image/png').split(',')[1]; // solo el contenido Base64
    }

    const payload = endpoint === 'Fichar'
      ? { FaceDescriptor: faceDescriptor, FotoBase64: fotoBase64 }
      : { Dni: dni, FaceDescriptor: faceDescriptor };

    const res = await fetch(`https://localhost:7006/api/Asistencias/${endpoint}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    await stopVideo();
    dniInput.value = '';

    showMensajeBackend({
      nombre: data.empleado?.NombreCompleto || data.empleado?.nombreCompleto,
      dni: data.empleado?.Dni || data.empleado?.dni,
      mensaje: data.Mensaje || data.mensaje
    }, res.ok ? 'success' : 'error');

  } catch(e) {
    showMensajeBackend({mensaje: e.message}, 'error');
    await stopVideo();
  }
}


async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}

async function handleFaceAction(endpoint) {
  const dni = dniInput.value.trim();
  if (endpoint === 'RegistrarRostro' && !dni) { 
    showMensajeBackend({mensaje:'Ingrese DNI válido'}, 'error'); 
    return; 
  }

  await loadModels();
  await startVideo();

  showMensajeCamara(endpoint === 'Fichar' ? 'Mire la cámara para fichar' : 'Mire la cámara para registrar rostro', 3000);

  setTimeout(async () => {
    try {
      await captureFace();
      await callBackend(endpoint, dni);
    } catch(e) { console.error(e); await stopVideo(); }
  }, 1500);
}

btnFichar.addEventListener('click', () => handleFaceAction('Fichar'));
btnRegistrar.addEventListener('click', () => handleFaceAction('RegistrarRostro'));
