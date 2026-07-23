document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("formLogin");
  const formRegistro = document.getElementById("formRegistro");

  const emailLogin = document.getElementById("emailLogin");
  const claveLogin = document.getElementById("claveLogin");
  const errorEmailLogin = document.getElementById("errorEmailLogin");
  const errorClaveLogin = document.getElementById("errorClaveLogin");
  const errorGeneral = document.getElementById("errorLoginGeneral");

  const nombreRegistro = document.getElementById("nombreRegistro");
  const empresaRegistro = document.getElementById("empresaRegistro");
  const emailRegistro = document.getElementById("emailRegistro");
  const claveRegistro = document.getElementById("claveRegistro");
  const errorNombreRegistro = document.getElementById("errorNombreRegistro");
  const errorEmpresaRegistro = document.getElementById("errorEmpresaRegistro");
  const errorEmailRegistro = document.getElementById("errorEmailRegistro");
  const errorClaveRegistro = document.getElementById("errorClaveRegistro");
  const registroExito = document.getElementById("registroExito");
  const contenidoFormularioRegistro = document.getElementById("contenidoFormularioRegistro");
  const tarjetaRegistroExitoso = document.getElementById("tarjetaRegistroExitoso");

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
    contenidoFormularioRegistro.classList.remove("d-none");
    tarjetaRegistroExitoso.classList.add("d-none");
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
        let mensaje = "Correo o contraseña incorrectos.";
        if (res.status === 403) {
          const mensajeServidor = await res.text();
          mensaje = mensajeServidor
            ? mensajeServidor.replace(/^"|"$/g, "")
            : "La cuenta todavía no se encuentra habilitada.";
        }
        errorGeneral.textContent = mensaje;
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
    if (!empresaRegistro.value.trim()) {
      setError(empresaRegistro, errorEmpresaRegistro, "Ingresá el nombre de la empresa.");
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
    const inicio = Date.now();

    try {
      const res = await fetch("http://localhost:5106/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreCompleto: nombreRegistro.value.toUpperCase(),
          empresa: empresaRegistro.value.toUpperCase(),
          email: emailValor,
          password: claveRegistro.value
        }),
      });

      const tiempoRestante = 2000 - (Date.now() - inicio);
      if (tiempoRestante > 0) await delay(tiempoRestante);

      if (res.ok) {
        desactivarSpinnerRegistro();
        formRegistro.reset();
        contenidoFormularioRegistro.classList.add("d-none");
        tarjetaRegistroExitoso.classList.remove("d-none");

      } else {
        desactivarSpinnerRegistro();
        let datosError = null;
        try {
          datosError = await res.json();
        } catch {
          datosError = null;
        }

        let mensaje = res.status === 409
          ? "El correo ya está registrado."
          : "No se pudo crear la cuenta.";

        if (datosError?.message) mensaje = datosError.message;
        else if (datosError?.mensaje) mensaje = datosError.mensaje;
        else if (Array.isArray(datosError) && datosError[0]?.description)
          mensaje = datosError[0].description;

        if (mensaje.toLowerCase().includes("empresa")) {
          setError(empresaRegistro, errorEmpresaRegistro, mensaje);
        } else if (mensaje.toLowerCase().includes("contraseña") ||
                   mensaje.toLowerCase().includes("password")) {
          setError(claveRegistro, errorClaveRegistro, mensaje);
        } else {
          setError(emailRegistro, errorEmailRegistro, mensaje);
        }
      }
    } catch {
      await delay(2000);
      desactivarSpinnerRegistro();
      setError(emailRegistro, errorEmailRegistro, "Error de conexión.");
    }
  });
});
