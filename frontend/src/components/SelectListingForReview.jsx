import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { API_URL } from "../config";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  cream: "#FAF6EE",
  ink: "#1F2A1E",
};

const API_BASE = API_URL;

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function SelectListingForReview() {
  const { id } = useParams(); // sotuvchi (seller) id
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Faqat shu sotuvchining O'ZIGA TEGISHLI e'lonlari (Faol + Arxiv) —
    // boshqa hech kimning e'loni bu ro'yxatga chiqmaydi.
    Promise.all([
      fetch(`${API_BASE}/api/products/?owner=${id}`).then((res) => (res.ok ? res.json() : { results: [] })),
      fetch(`${API_BASE}/api/products/?owner=${id}&status=Arxiv`).then((res) => (res.ok ? res.json() : { results: [] })),
    ])
      .then(([activeData, archivedData]) => {
        const active = activeData.results || activeData || [];
        const archived = archivedData.results || archivedData || [];
        const merged = [...active, ...archived].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setListings(merged);
      })
      .catch(() => setError("E'lonlarni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 16px 8px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={22} color={COLORS.ink} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink }}>E'lonni tanlang</div>
      </div>

      <div style={{ padding: "8px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: COLORS.inkSoft }}>Yuklanmoqda...</div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: 40, color: "#C0392B" }}>{error}</div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: COLORS.inkSoft }}>
            Bu foydalanuvchining e'lonlari topilmadi
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {listings.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/sotuvchi/${id}/baholash/${item.id}`)}
                style={{
                  display: "flex",
                  gap: 12,
                  background: COLORS.cream,
                  borderRadius: 16,
                  padding: 12,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    background: "#EDEDED",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {item.main_image && (
                    <img
                      src={resolveImageUrl(item.main_image)}
                      alt={item.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: COLORS.ink, marginBottom: 2 }}>
                    {Number(item.price).toLocaleString("uz-UZ")} so'm
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: COLORS.ink,
                      marginBottom: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.status === "Faol" ? item.title : `Yopiq · ${item.title}`}
                  </div>
                  <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>{item.region}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
