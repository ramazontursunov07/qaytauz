// Django backend manzili. Kerak bo'lsa shu yerni o'zgartiring.
export const API_BASE = "http://127.0.0.1:8000/api";

// Login endpoint. Agar loyihangizda boshqa manzil bo'lsa (masalan /api/token/),
// shu qatorni o'zgartiring.
const TOKEN_ENDPOINT = "/v1/auth/token/";

const TOKEN_KEY = "qaytauz_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function loginAdmin(username, password) {
  const res = await fetch(`${API_BASE}${TOKEN_ENDPOINT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new Error("Login yoki parol noto'g'ri");
  }
  const data = await res.json();
  // simplejwt odatda { access, refresh } qaytaradi
  const token = data.access || data.token || data.key;
  if (!token) {
    throw new Error("Serverdan token qaytmadi, javobni tekshiring: " + JSON.stringify(data));
  }
  setToken(token);
  return token;
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error("Sessiya tugadi, qayta kiring");
  }

  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(
      data ? JSON.stringify(data) : `So'rov xato bilan tugadi: ${res.status}`
    );
  }
  return data;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: (path) => request(path, { method: "DELETE" }),
};
