import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import BottomNav from "./BottomNav";
import { API_BASE, authFetch, isLoggedIn } from "../utils/auth";

const COLORS = {
  paper: "#F7F4EE",
  ink: "#1F2A1E",
  inkSoft: "#5B6459",
  forest: "#2F6B4F",
  forestDark: "#234F3B",
  clay: "#C1652F",
  line: "#E1DACB",
};

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap');
  .qz-shell{ max-width: 1000px; margin: 0 auto; width: 100%; box-sizing: border-box; }
`;

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function CardImage({ src, alt }) {
  const resolved = resolveImageUrl(src);
  if (!resolved) {
    return <div style={{ width: "100%", height: 130, background: "#EDEDED" }} />;
  }
  return (
    <img
      src={resolved}
      alt={alt}
      style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

export default function QaytaUzFavorites() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("elonlar");
  // Backend /api/favorites/ har bir yozuvni {id, product, product_detail, created_at}
  // ko'rinishida qaytaradi — kartochka uchun kerakli narx/nomi/rasm aynan
  // `product_detail` ichida bo'ladi, shuning uchun shu maydondan o'qiymiz.
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = () => {
    if (!isLoggedIn()) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    authFetch(`${API_BASE}/api/favorites/`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setFavorites(data.results || data || []);
      })
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sevimlilardan o'chirish — bosilgan zahoti ro'yxatdan olib tashlaymiz,
  // so'rov muvaffaqiyatsiz bo'lsa ortga qaytaramiz.
  const handleRemoveFavorite = (e, favoriteId) => {
    e.stopPropagation();
    const prev = favorites;
    setFavorites((list) => list.filter((f) => f.id !== favoriteId));
    authFetch(`${API_BASE}/api/favorites/delete/${favoriteId}/`, { method: "DELETE" }).then((res) => {
      if (!res.ok) setFavorites(prev);
    });
  };

  return (
    <div
      className="qz-shell"
      style={{
        background: "white",
        minHeight: "100vh",
        fontFamily: "Manrope, sans-serif",
        color: COLORS.ink,
        paddingBottom: 88,
        boxSizing: "border-box",
      }}
    >
      <style>{GLOBAL_STYLES}</style>

      <div style={{ padding: "20px 16px 0", textAlign: "center", position: "relative" }}>
        <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, margin: 0, color: COLORS.ink }}>
          Sevimlilar
        </h1>
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.line}`, marginTop: 20 }}>
        <button
          onClick={() => setTab("elonlar")}
          style={{
            flex: 1,
            padding: "12px 0",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "Manrope, sans-serif",
            color: tab === "elonlar" ? COLORS.ink : COLORS.inkSoft,
            borderBottom: tab === "elonlar" ? `2px solid ${COLORS.ink}` : "2px solid transparent",
          }}
        >
          E'lonlar
        </button>
        <button
          onClick={() => setTab("profillar")}
          style={{
            flex: 1,
            padding: "12px 0",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "Manrope, sans-serif",
            color: tab === "profillar" ? COLORS.ink : COLORS.inkSoft,
            borderBottom: tab === "profillar" ? `2px solid ${COLORS.ink}` : "2px solid transparent",
          }}
        >
          Profillar
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", color: COLORS.inkSoft, padding: 40, fontSize: 14 }}>
          Yuklanmoqda...
        </div>
      )}

      {!loading && tab === "elonlar" && favorites.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 32px" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#EFEAE0",
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heart size={30} color={COLORS.inkSoft} />
          </div>
          <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
            Sevimlilar hozircha bo'sh
          </div>
          <div style={{ fontSize: 13.5, color: COLORS.inkSoft, lineHeight: 1.6, marginBottom: 24 }}>
            Hech narsani o'tkazib yubormaslik uchun e'lonlarni sevimlilaringizga saqlang
          </div>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: COLORS.forest,
              color: "white",
              border: "none",
              borderRadius: 9999,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "Manrope, sans-serif",
              cursor: "pointer",
            }}
          >
            <Search size={16} />
            E'lonlarni qidirish
          </button>
        </div>
      )}

      {!loading && tab === "elonlar" && favorites.length > 0 && (
        <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {favorites.map((item) => {
            const product = item.product_detail || {};
            return (
              <div
                key={item.id}
                onClick={() => navigate(`/mahsulot/${product.id}`)}
                style={{ background: "white", borderRadius: 16, overflow: "hidden", border: `1px solid ${COLORS.line}`, cursor: "pointer" }}
              >
                <div style={{ position: "relative" }}>
                  <CardImage src={product.main_image} alt={product.title} />
                  <button
                    onClick={(e) => handleRemoveFavorite(e, item.id)}
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      background: "rgba(255,255,255,0.9)",
                      border: "none",
                      borderRadius: 9999,
                      width: 30,
                      height: 30,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Heart size={15} color={COLORS.clay} fill={COLORS.clay} />
                  </button>
                </div>
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, color: COLORS.forestDark, marginBottom: 2 }}>
                    {product.price != null ? Number(product.price).toLocaleString("ru-RU") : "—"} so'm
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, lineHeight: 1.3 }}>{product.title}</div>
                  <div style={{ fontSize: 11.5, color: COLORS.inkSoft }}>{product.region}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && tab === "profillar" && (
        <div style={{ textAlign: "center", padding: "48px 32px", color: COLORS.inkSoft, fontSize: 14 }}>
          Sevimli profillar hozircha yo'q.
        </div>
      )}

      <BottomNav />
    </div>
  );
}
