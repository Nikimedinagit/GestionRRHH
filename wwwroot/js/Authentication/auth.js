const AUTH_API_URL = "http://localhost:5106/api/auth/";
const API_BASE_URL = "http://localhost:5106/api/";

// const AUTH_API_URL = "http://192.168.100.173:2002/api/auth/";
// const API_BASE_URL = "http://192.168.100.173:2002/api/";

// const AUTH_API_URL = "http://192.168.120.50:2000/api/auth/";
// const API_BASE_URL = "http://192.168.120.50:2000/api/";



// Función para obtener el token de acceso
function getToken() {
  return localStorage.getItem("token");
}

// Función para obtener el email
function getEmail() {
  return localStorage.getItem("email");
}

// Función para guardar los tokens
function saveTokens(token, refreshToken) {
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
}

// Función para obtener el refreshToken
function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

// Función para renovar el token
function refreshToken() {
  const email = getEmail();
  const refreshToken = getRefreshToken();

  return fetch(AUTH_API_URL + "refresh-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, refreshToken }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al renovar el token");
      return res.json();
    })
    .then((data) => {
      saveTokens(data.token, data.refreshToken);
      return data.token;
    });
}


function authFetch(url, options = {}, retry = true) {
  options.headers = options.headers || {};
  options.headers["Authorization"] = "Bearer " + getToken();

  // Solo poner Content-Type si NO es FormData
  if (!(options.body instanceof FormData)) {
    options.headers["Content-Type"] = "application/json";
  }

  return fetch(API_BASE_URL + url, options).then((response) => {
    if (response.status === 401 && retry) {
      // Token expirado, intentamos renovarlo
      return refreshToken()
        .then((newToken) => {
          options.headers["Authorization"] = "Bearer " + newToken;
          return fetch(API_BASE_URL + url, options);
        })
        .catch((err) => {
          console.error("No se pudo renovar el token:", err);
          window.location.href = "login.html";
          return response; // devolvemos el 401 original
        });
    }
    return response;
  });
}



function cerrarSesion() {
  localStorage.clear();
  window.location.href = "login.html";
}
