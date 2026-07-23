var urlAvatarPerfilActual = null;
var avatarPredefinidoSeleccionado = "";

function MostrarAvataresPredefinidos() {
  const contenedor = document.getElementById("avataresPredefinidos");
  contenedor.innerHTML = Array.from({ length: 16 }, (_, indice) => {
    const ruta = `img/avatars/av-${indice + 1}.png`;
    return `<button type="button" class="avatar-opcion-perfil border rounded bg-white p-1"
      data-avatar="${ruta}" onclick="SeleccionarAvatarPredefinido('${ruta}', this)"
      style="aspect-ratio:1;transition:.2s;">
      <img src="${ruta}" alt="Avatar ${indice + 1}" class="w-100 h-100 rounded object-fit-cover" />
    </button>`;
  }).join("");
}

function SeleccionarAvatarPredefinido(ruta, boton) {
  avatarPredefinidoSeleccionado = ruta;
  document.getElementById("avatarPerfil").src = ruta;
  document.querySelectorAll(".avatar-opcion-perfil").forEach((opcion) => {
    opcion.style.borderColor = "#dee2e6";
    opcion.style.boxShadow = "none";
  });
  boton.style.borderColor = "#3697E1";
  boton.style.boxShadow = "0 0 0 2px rgba(54,151,225,.2)";
  LimpiarErroresPerfil();
}

function LimpiarErroresPerfil() {
  document.querySelectorAll("#formContrasenaPerfil .is-invalid")
    .forEach((elemento) => elemento.classList.remove("is-invalid"));
  document.querySelectorAll("#formContrasenaPerfil .invalid-feedback, #errorAvatarPerfil")
    .forEach((error) => { error.textContent = ""; error.style.display = "none"; });
}

function MostrarErrorPerfil(inputId, errorId, mensaje) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add("is-invalid");
  error.textContent = mensaje;
  error.style.display = "block";
}

function MostrarGuardandoPerfil(texto) {
  document.getElementById("textoGuardandoPerfil").textContent = texto;
  document.getElementById("overlayGuardandoPerfil").classList.remove("d-none");
}

function OcultarGuardandoPerfil() {
  document.getElementById("overlayGuardandoPerfil").classList.add("d-none");
}

async function CargarPerfil(mostrarSpinner = true) {
  if (mostrarSpinner) mostrarPantallaCarga();
  try {
    const respuesta = await authFetch("Perfil");
    if (!respuesta.ok) throw new Error();
    const perfil = await respuesta.json();
    document.getElementById("nombrePerfil").textContent = perfil.nombreCompleto || "";
    document.getElementById("emailPerfil").textContent = (perfil.email || "").toLowerCase();
    document.getElementById("rolPerfil").textContent = getRol()?.toUpperCase() || "";

    if (perfil.tieneAvatar) await CargarAvatarPerfil();
  } catch {
    MostrarErrorCatch();
  } finally {
    if (mostrarSpinner) setTimeout(() => ocultarPantallaCarga(), 900);
  }
}

async function CargarAvatarPerfil() {
  const respuesta = await authFetch("Perfil/Avatar");
  if (!respuesta.ok) return;
  if (urlAvatarPerfilActual) URL.revokeObjectURL(urlAvatarPerfilActual);
  urlAvatarPerfilActual = URL.createObjectURL(await respuesta.blob());
  document.getElementById("avatarPerfil").src = urlAvatarPerfilActual;
  document.querySelectorAll(".user-avtar").forEach((imagen) => imagen.src = urlAvatarPerfilActual);
}

async function GuardarAvatar() {
  LimpiarErroresPerfil();
  if (!avatarPredefinidoSeleccionado)
    return MostrarErrorPerfil("", "errorAvatarPerfil", "Seleccione uno de los avatares.");

  const respuestaAvatar = await fetch(avatarPredefinidoSeleccionado);
  const contenidoAvatar = await respuestaAvatar.blob();
  const archivo = new File(
    [contenidoAvatar],
    avatarPredefinidoSeleccionado.split("/").pop(),
    { type: "image/png" }
  );

  const datos = new FormData();
  datos.append("avatar", archivo);
  MostrarGuardandoPerfil("Guardando avatar...");
  try {
    const respuesta = await authFetch("Perfil/Avatar", { method: "PUT", body: datos });
    const resultado = await respuesta.json();
    if (!respuesta.ok)
      return MostrarErrorPerfil("", "errorAvatarPerfil", resultado.mensaje || "No se pudo guardar.");
    avatarPredefinidoSeleccionado = "";
    await CargarAvatarPerfil();
    ToastPerfil("¡Avatar Modificado!");
  } catch {
    MostrarErrorCatch();
  } finally {
    OcultarGuardandoPerfil();
  }
}

function LimpiarFormularioContrasena() {
  document.getElementById("formContrasenaPerfil").reset();
  LimpiarErroresPerfil();
}

async function CambiarClave() {
  LimpiarErroresPerfil();
  const actual = document.getElementById("claveActual").value;
  const nueva = document.getElementById("claveNueva").value;
  const confirmar = document.getElementById("confirmarClaveNueva").value;

  if (!actual)
    return MostrarErrorPerfil("claveActual", "errorClaveActual", "Ingrese la contraseña actual.");
  if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(nueva))
    return MostrarErrorPerfil("claveNueva", "errorClaveNueva", "Ingrese 8 caracteres, una mayúscula y un número.");
  if (nueva !== confirmar)
    return MostrarErrorPerfil("confirmarClaveNueva", "errorConfirmarClave", "Las contraseñas no coinciden.");

  MostrarGuardandoPerfil("Guardando contraseña...");
  try {
    const respuesta = await authFetch("Perfil/Contrasena", {
      method: "PUT",
      body: JSON.stringify({ actual, nueva })
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok)
      return MostrarErrorPerfil("claveActual", "errorClaveActual", resultado.mensaje || "La contraseña actual no es correcta.");
    LimpiarFormularioContrasena();
    ToastPerfil("¡Contraseña Modificada!");
  } catch {
    MostrarErrorCatch();
  } finally {
    OcultarGuardandoPerfil();
  }
}

function ToastPerfil(titulo) {
  Swal.fire({
    title: titulo,
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
    background: "#f4fff7",
    color: "#1c3d26",
    icon: "success",
    iconColor: "#28a746d8",
    customClass: {
      popup: "swal2-toast-success",
      title: "swal2-toast-success-title",
      icon: "swal2-toast-success-icon"
    }
  });
}

MostrarAvataresPredefinidos();
CargarPerfil();
