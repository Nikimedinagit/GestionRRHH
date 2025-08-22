document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("formLogin");
  const formRegistro = document.getElementById("formRegistro");
  const mensaje = document.getElementById("mensajeDeslizable");

  window.mostrarRegistro = () => {
    formLogin.classList.add("d-none");
    formRegistro.classList.remove("d-none");
  };

  window.mostrarLogin = () => {
    formRegistro.classList.add("d-none");
    formLogin.classList.remove("d-none");
  };

  function mostrarMensaje(texto, tipo = "success") {
    mensaje.textContent = texto;
    mensaje.style.backgroundColor = tipo === "success" ? "#28a745" : "#dc3545";
    mensaje.style.top = "10px";
    mensaje.style.opacity = "1";
    setTimeout(() => {
      mensaje.style.top = "-50px";
      mensaje.style.opacity = "0";
    }, 3500);
  }

  function validarContrasenia(password) {
    const tieneMayuscula = /[A-Z]/.test(password);
    const tieneNumero = /[0-9]/.test(password);
    return password.length >= 8 && tieneMayuscula && tieneNumero;
  }

  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("emailLogin").value.trim();
    const password = document.getElementById("claveLogin").value.trim();
    const loginBtn = document.getElementById("btnIniciarSesion");

    if (!email || !password) {
      mostrarMensaje("Por favor completá todos los campos.", "error");
      return;
    }

    if (!email.includes("@")) {
      mostrarMensaje("El correo debe contener '@'", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      mostrarMensaje(
        "Correo inválido. Usá un formato como usuario@gmail.com",
        "error"
      );
      return;
    }

    try {
      loginBtn.disabled = true;
      loginBtn.innerHTML = `<span class="spinner-border spinner-border-sm mr-2"></span> Iniciando...`;

      const res = await fetch("http://localhost:5106/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("usuarioNombre", data.nombreCompleto);
        localStorage.setItem("usuarioGmail", data.email);
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("rol", data.rol);

        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      } else {
        mostrarMensaje("Correo o contraseña incorrectos.", "error");
        loginBtn.disabled = false;
        loginBtn.innerHTML = "Iniciar Sesión";
      }
    } catch {
      mostrarMensaje("Error al conectar con el servidor.", "error");
      loginBtn.disabled = false;
      loginBtn.innerHTML = "Iniciar Sesión";
    }
  });

  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreRegistro").value.trim();
    const email = document.getElementById("emailRegistro").value.trim();
    const password = document.getElementById("claveRegistro").value.trim();
    const registroBtn = document.getElementById("btnRegistrar");

    if (!nombre || !email || !password) {
      mostrarMensaje("Todos los campos son obligatorios.", "error");
      return;
    }

    if (!email.endsWith("@gmail.com")) {
      mostrarMensaje("El correo debe terminar en @gmail.com", "error");
      return;
    }

    if (!validarContrasenia(password)) {
      mostrarMensaje(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.",
        "error"
      );
      return;
    }

    try {
      registroBtn.disabled = true;
      registroBtn.innerHTML = `<span class="spinner-border spinner-border-sm mr-2"></span> Registrando...`;

      const res = await fetch("http://localhost:5106/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreCompleto: nombre, email, password }),
      });

      if (res.ok) {
        mostrarMensaje("Registro exitoso. ¡Bienvenido!", "success");
        formRegistro.reset();
        setTimeout(() => mostrarLogin(), 3500);
      } else if (res.status === 409) {
        mostrarMensaje("El correo ya está registrado.", "error");
      } else {
        mostrarMensaje("No se pudo registrar. Intentalo más tarde.", "error");
      }
    } catch {
      mostrarMensaje("Error al conectar con el servidor.", "error");
    } finally {
      registroBtn.disabled = false;
      registroBtn.innerHTML = "Registrarme";
    }
  });
});

function cerrarSesion() {
  localStorage.clear();
  window.location.href = "login.html";
}
