document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("formLogin");
  const formRegistro = document.getElementById("formRegistro");

  const emailLogin = document.getElementById("emailLogin");
  const claveLogin = document.getElementById("claveLogin");
  const errorEmailLogin = document.getElementById("errorEmailLogin");
  const errorClaveLogin = document.getElementById("errorClaveLogin");
  const errorGeneral = document.getElementById("errorLoginGeneral");

  const nombreRegistro = document.getElementById("nombreRegistro");
  const emailRegistro = document.getElementById("emailRegistro");
  const claveRegistro = document.getElementById("claveRegistro");
  const errorNombreRegistro = document.getElementById("errorNombreRegistro");
  const errorEmailRegistro = document.getElementById("errorEmailRegistro");
  const errorClaveRegistro = document.getElementById("errorClaveRegistro");
  const registroExito = document.getElementById("registroExito");

  const recordarCheck = document.getElementById("recordarme");

  const btnLogin = document.getElementById("btnIniciarSesion");
  const textoBtnLogin = document.getElementById("textoBtnLogin");
  const spinnerLogin = document.getElementById("spinnerLogin");

  const btnRegistro = document.getElementById("btnRegistrar");
  const textoBtnRegistro = document.getElementById("textoBtnRegistro");
  const spinnerRegistro = document.getElementById("spinnerRegistro");

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  function activarSpinnerLogin() {
    spinnerLogin.classList.remove("d-none");
    textoBtnLogin.textContent = "Ingresando...";
    btnLogin.disabled = true;
  }

  function desactivarSpinnerLogin() {
    spinnerLogin.classList.add("d-none");
    textoBtnLogin.textContent = "Iniciar Sesión";
    btnLogin.disabled = false;
  }

  function activarSpinnerRegistro() {
    spinnerRegistro.classList.remove("d-none");
    textoBtnRegistro.textContent = "Creando Cuenta...";
    btnRegistro.disabled = true;
  }

  function desactivarSpinnerRegistro() {
    spinnerRegistro.classList.add("d-none");
    textoBtnRegistro.textContent = "Registrarse";
    btnRegistro.disabled = false;
  }

  // ================= RECORDAR EMAIL =================
  const emailGuardado = localStorage.getItem("emailRecordado");
  if (emailGuardado) {
    emailLogin.value = emailGuardado;
    recordarCheck.checked = true;
  }

  emailLogin.addEventListener("input", () => {
    if (emailLogin.value.trim() === "") {
      recordarCheck.checked = false;
      localStorage.removeItem("emailRecordado");
    }
  });

  // ================= CAMBIO ENTRE FORMULARIOS =================
  window.mostrarRegistro = () => {
    formLogin.classList.add("d-none");
    formRegistro.classList.remove("d-none");
    limpiarErrores();
    limpiarMensajesGenerales();
  };

  window.mostrarLogin = () => {
    formRegistro.classList.add("d-none");
    formLogin.classList.remove("d-none");
    limpiarErrores();
    limpiarMensajesGenerales();
  };

  function setError(input, errorDiv, mensaje) {
    input.classList.add("is-invalid");
    errorDiv.textContent = mensaje;
  }

  function limpiarErrores() {
    document.querySelectorAll(".form-control").forEach(i => i.classList.remove("is-invalid"));
    document.querySelectorAll(".invalid-feedback").forEach(e => e.textContent = "");
  }

  function limpiarMensajesGenerales() {
    errorGeneral.classList.add("d-none");
    errorGeneral.textContent = "";
    registroExito.classList.add("d-none");
    registroExito.textContent = "";
  }

  function validarContrasenia(password) {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  }

  // ================= LOGIN =================
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarErrores();
    limpiarMensajesGenerales();

    let valido = true;
    const emailValor = emailLogin.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValor) {
      setError(emailLogin, errorEmailLogin, "Ingresá tu correo.");
      valido = false;
    } else if (!emailRegex.test(emailValor)) {
      setError(emailLogin, errorEmailLogin, "Ingresá un correo válido.");
      valido = false;
    }

    if (!claveLogin.value.trim()) {
      setError(claveLogin, errorClaveLogin, "Ingresá tu contraseña.");
      valido = false;
    }

    if (!valido) return;

    activarSpinnerLogin();

    if (recordarCheck.checked) {
      localStorage.setItem("emailRecordado", emailValor);
    } else {
      localStorage.removeItem("emailRecordado");
    }

    activarSpinnerLogin();
    const inicio = Date.now();

    if (recordarCheck.checked) {
      localStorage.setItem("emailRecordado", emailValor);
    } else {
      localStorage.removeItem("emailRecordado");
    }

    try {
      const res = await fetch("http://localhost:5106/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValor, password: claveLogin.value }),
      });

      const tiempoRestante = 2000 - (Date.now() - inicio);
      if (tiempoRestante > 0) await delay(tiempoRestante);

      if (res.ok) {
        const data = await res.json();

        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("email", data.email);
        localStorage.setItem("usuarioNombre", data.nombreCompleto);
        localStorage.setItem("usuarioGmail", data.email);
        localStorage.setItem("rol", data.rol);

        window.location.href = "index.html";
      } else {
        desactivarSpinnerLogin();
        errorGeneral.textContent = "Correo o contraseña incorrectos.";
        errorGeneral.classList.remove("d-none");
      }
    } catch {
      await delay(2000);
      desactivarSpinnerLogin();
      errorGeneral.textContent = "No se pudo conectar con el servidor.";
      errorGeneral.classList.remove("d-none");
    }

  });

  // ================= REGISTRO =================
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarErrores();
    limpiarMensajesGenerales();

    let valido = true;
    const emailValor = emailRegistro.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombreRegistro.value.trim()) {
      setError(nombreRegistro, errorNombreRegistro, "Ingresá tu nombre.");
      valido = false;
    }

    if (!emailValor) {
      setError(emailRegistro, errorEmailRegistro, "Ingresá tu correo.");
      valido = false;
    } else if (!emailRegex.test(emailValor)) {
      setError(emailRegistro, errorEmailRegistro, "Ingresá un correo válido.");
      valido = false;
    }

    if (!validarContrasenia(claveRegistro.value)) {
      setError(claveRegistro, errorClaveRegistro, "Mínimo 8 caracteres, una mayúscula y un número.");
      valido = false;
    }

    if (!valido) return;

    activarSpinnerRegistro();

    activarSpinnerRegistro();
    const inicio = Date.now();

    try {
      const res = await fetch("http://localhost:5106/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreCompleto: nombreRegistro.value.toUpperCase(),
          email: emailValor,
          password: claveRegistro.value
        }),
      });

      const tiempoRestante = 2000 - (Date.now() - inicio);
      if (tiempoRestante > 0) await delay(tiempoRestante);

      if (res.ok) {
        registroExito.textContent = "Cuenta creada correctamente. Ahora podés iniciar sesión.";
        registroExito.classList.remove("d-none");
        formRegistro.reset();

        setTimeout(() => {
          desactivarSpinnerRegistro();
          mostrarLogin();
        }, 2000);

      } else {
        desactivarSpinnerRegistro();
        setError(emailRegistro, errorEmailRegistro, "El correo ya está registrado.");
      }
    } catch {
      await delay(2000);
      desactivarSpinnerRegistro();
      setError(emailRegistro, errorEmailRegistro, "Error de conexión.");
    }
  });
});
