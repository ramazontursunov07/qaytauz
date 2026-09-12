// Butun ilova bo'ylab autentifikatsiya bilan bog'liq umumiy funksiyalar.
// Maqsad: access_token muddati tugaganda (odatda 1 soatdan keyin) foydalanuvchini
// darhol /kirish sahifasiga otib yubormaslik, balki refresh_token yordamida
// jimgina yangi access_token olib, so'rovni davom ettirish.

export const API_BASE = "http://localhost:8000";

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function isLoggedIn() {
  return !!getAccessToken();
}

// access_token eskirganda refresh_token orqali yangisini olishga harakat qiladi.
// Muvaffaqiyatli bo'lsa yangi access_token'ni qaytaradi, aks holda null.
let refreshPromise = null;
export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  // Bir vaqtning o'zida bir nechta so'rov 401 qaytarsa ham,
  // faqat bitta refresh so'rovi yuborilishini ta'minlaymiz.
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/api/v1/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.access) {
          setTokens({ access: data.access, refresh: data.refresh });
          return data.access;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Oddiy fetch() o'rniga ishlatiladi: token bo'lsa avtomatik qo'shadi,
// 401 kelsa bir marta refresh qilib, so'rovni qayta yuboradi.
// Refresh ham muvaffaqiyatsiz bo'lsa, tokenlarni tozalab, asl 401 javobini qaytaradi
// (chaqiruvchi kod shu holatda foydalanuvchini /kirish'ga yo'naltirishi kerak).
export async function authFetch(url, options = {}) {
  const token = getAccessToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && getRefreshToken()) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      const retryHeaders = { ...(options.headers || {}), Authorization: `Bearer ${newAccess}` };
      res = await fetch(url, { ...options, headers: retryHeaders });
    } else {
      clearTokens();
    }
  } else if (res.status === 401) {
    clearTokens();
  }

  return res;
}

// Login talab qilinadigan amal (sevimlilarga qo'shish, e'lon berish va h.k.)
// bosilganda ishlatiladi: agar login qilingan bo'lsa true qaytaradi,
// aks holda foydalanuvchini /kirish'ga (keyin qaytib kelishi uchun "from" bilan) yo'naltiradi.
export function requireLogin(navigate, redirectPath) {
  if (isLoggedIn()) return true;
  navigate("/kirish", { state: { from: redirectPath } });
  return false;
}
