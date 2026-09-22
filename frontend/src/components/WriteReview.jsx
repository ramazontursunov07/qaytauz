import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { API_URL } from "../config";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  cream: "#FAF6EE",
  pink: "#B4126E",
  ink: "#1F2A1E",
};

const API_BASE = API_URL;

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function WriteReview() {
  const { id, productId } = useParams(); // id — sotuvchi, productId — tanlangan e'lon
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/kirish");
      return;
    }
    if (rating < 1) {
      setError("Iltimos, baho (yulduzcha) tanlang");
      return;
    }

    setSending(true);
    setError("");
    fetch(`${API_BASE}/api/users/reviews/create/`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        seller: Number(id),
        product: Number(productId),
        rating,
        comment: comment.trim(),
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            const firstKey = Object.keys(data || {})[0];
            const msg = firstKey ? (Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]) : null;
            throw new Error(msg || "Yuborishda xatolik yuz berdi");
          });
        }
        setSent(true);
      })
      .catch((err) => setError(err.message))
      .finally(() => setSending(false));
  };

  if (sent) {
    return (
      <div style={{ minHeight: "100vh", background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>
          Rahmat! Bahoyingiz saqlandi
        </div>
        <div style={{ fontSize: 14.5, color: COLORS.inkSoft, marginBottom: 24 }}>
          Sizning sharhingiz sotuvchi profiliga qo'shildi.
        </div>
        <button
          onClick={() => navigate(`/sotuvchi/${id}`)}
          style={{
            background: COLORS.forest,
            color: "white",
            border: "none",
            borderRadius: 28,
            padding: "14px 28px",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Profilga qaytish
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 16px 8px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={22} color={COLORS.ink} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink }}>Baholash</div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink, marginBottom: 14, textAlign: "center" }}>
          Sotuvchiga qanday baho berasiz?
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              <Star
                size={34}
                color="#E0A500"
                fill={n <= (hoverRating || rating) ? "#E0A500" : "none"}
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Sharh qoldiring (ixtiyoriy)..."
          rows={5}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: COLORS.cream,
            border: "none",
            borderRadius: 14,
            padding: "14px 16px",
            fontSize: 15,
            outline: "none",
            resize: "vertical",
            marginBottom: 16,
            color: "#08060d"
          }}
        />

        {error && (
          <div style={{ color: "#C0392B", fontSize: 13, marginBottom: 14, textAlign: "center" }}>{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={sending}
          style={{
            width: "100%",
            background: COLORS.pink,
            color: "white",
            border: "none",
            borderRadius: 28,
            padding: "16px 0",
            fontSize: 16,
            fontWeight: 700,
            cursor: sending ? "not-allowed" : "pointer",
            opacity: sending ? 0.7 : 1,
          }}
        >
          {sending ? "Yuborilmoqda..." : "Yuborish"}
        </button>
      </div>
    </div>
  );
}
