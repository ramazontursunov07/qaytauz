import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Share2, User, ChevronRight, Star, Heart, MoreHorizontal } from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  cream: "#FAF6EE",
  pink: "#B4126E",
  ink: "#1F2A1E",
};

const API_BASE = "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

function formatListingDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${hh}:${mm}`;
}

export default function SellerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tab, setTab] = useState("faol");
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  const [subscribed, setSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [subscribing, setSubscribing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/users/public/${id}/`, { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error("Foydalanuvchi topilmadi");
        return res.json();
      })
      .then((data) => {
        setSeller(data);
        setSubscribed(!!data.is_subscribed);
        setSubscribersCount(data.subscribers_count || 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setListingsLoading(true);
    const statusParam = tab === "faol" ? "Faol" : "Arxiv";
    fetch(`${API_BASE}/api/products/?owner=${id}&status=${statusParam}`)
      .then((res) => (res.ok ? res.json() : { results: [] }))
      .then((data) => setListings(data.results || data || []))
      .catch(() => setListings([]))
      .finally(() => setListingsLoading(false));
  }, [id, tab]);

  const handleToggleSubscribe = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/kirish", { state: { from: `/sotuvchi/${id}` } });
      return;
    }
    setSubscribing(true);

    // Diqqat: haqiqiy "obunachilar" hisoblagichi apps.users.Subscription
    // modelidan olinadi (PublicUserSerializer shu yerdan o'qiydi), shuning
    // uchun aynan shu modelni yangilaydigan /api/users/subscribe/<id>/
    // endpoint'i ishlatiladi — apps.favorites.FollowedSeller emas.
    const method = subscribed ? "DELETE" : "POST";

    fetch(`${API_BASE}/api/users/subscribe/${id}/`, {
      method,
      headers: authHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Amalni bajarib bo'lmadi");
        return res.json();
      })
      .then((data) => {
        setSubscribed(!!data.subscribed);
        setSubscribersCount(data.subscribers_count ?? subscribersCount);
      })
      .catch((err) => setError(err.message))
      .finally(() => setSubscribing(false));
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: seller?.username, url: shareUrl });
      } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Havola nusxalandi");
      } catch (e) {
        alert(shareUrl);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inkSoft }}>
        Yuklanmoqda...
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <div style={{ color: "#C0392B" }}>{error || "Xatolik yuz berdi"}</div>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: COLORS.forest, cursor: "pointer" }}>
          Orqaga qaytish
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "white", paddingBottom: 40 }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 8px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={22} color={COLORS.ink} />
        </button>
        <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <MoreHorizontal size={22} color={COLORS.ink} />
        </button>
      </div>

      <div style={{ padding: "8px 20px 0" }}>
        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#EDEDED",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {seller.avatar ? (
              <img src={resolveImageUrl(seller.avatar)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={30} color={COLORS.inkSoft} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink }}>{seller.username}</div>
            <div style={{ fontSize: 13.5, color: COLORS.inkSoft }}>Ro'yxatdan o'tgan {seller.joined_date}</div>
          </div>
        </div>

        {/* Stat boxes */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "14px 10px" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink }}>{seller.listings_count}</div>
            <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>E'lonlar</div>
          </div>
          <div style={{ flex: 1, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "14px 10px" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink }}>{subscribersCount}</div>
            <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>Obunachilar</div>
          </div>
          <button
            onClick={() => navigate(`/sotuvchi/${id}/baholash`)}
            style={{
              flex: 1,
              border: `1px solid ${COLORS.line}`,
              borderRadius: 14,
              padding: "14px 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink, display: "flex", alignItems: "center", gap: 4 }}>
                {seller.rating > 0 && <Star size={14} color="#E0A500" fill="#E0A500" />}
                {seller.rating > 0 ? seller.rating.toFixed(1) : "0.0"}
              </div>
              <div style={{ fontSize: 12.5, color: COLORS.pink, fontWeight: 700 }}>
                Baholash
              </div>
            </div>
          </button>
        </div>

        {/* Obuna bo'lish + share */}
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <button
            onClick={handleToggleSubscribe}
            disabled={subscribing}
            style={{
              flex: 1,
              background: subscribed ? "#F1F1F1" : COLORS.pink,
              border: "none",
              borderRadius: 28,
              padding: "14px 0",
              fontSize: 15,
              fontWeight: 700,
              color: subscribed ? COLORS.ink : "white",
              cursor: subscribing ? "not-allowed" : "pointer",
              opacity: subscribing ? 0.7 : 1,
            }}
          >
            {subscribing ? "..." : subscribed ? "Obuna bo'lindi" : "Obuna bo'lish"}
          </button>
          <button
            onClick={handleShare}
            style={{
              width: 52,
              background: "#F1F1F1",
              border: "none",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Share2 size={18} color={COLORS.ink} />
          </button>
        </div>

        {error && (
          <div style={{ color: "#C0392B", fontSize: 13, marginBottom: 16 }}>{error}</div>
        )}

        {/* Faol / Arxiv tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.line}` }}>
          <button
            onClick={() => setTab("faol")}
            style={{
              flex: 1,
              padding: "12px 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 700,
              color: tab === "faol" ? COLORS.ink : COLORS.inkSoft,
              borderBottom: tab === "faol" ? `2px solid ${COLORS.ink}` : "2px solid transparent",
            }}
          >
            Faol {seller.listings_count > 0 ? `(${seller.listings_count})` : ""}
          </button>
          <button
            onClick={() => setTab("arxiv")}
            style={{
              flex: 1,
              padding: "12px 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 700,
              color: tab === "arxiv" ? COLORS.ink : COLORS.inkSoft,
              borderBottom: tab === "arxiv" ? `2px solid ${COLORS.ink}` : "2px solid transparent",
            }}
          >
            Arxiv {seller.archived_count > 0 ? `(${seller.archived_count})` : ""}
          </button>
        </div>

        {/* Listings grid */}
        <div style={{ paddingTop: 16 }}>
          {listingsLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.inkSoft }}>Yuklanmoqda...</div>
          ) : listings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.inkSoft }}>
              {tab === "faol" ? "Foydalanuvchida faol e'lonlar yo'q" : "Foydalanuvchida arxivlangan e'lonlar yo'q"}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {listings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/mahsulot/${item.id}`)}
                  style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", border: `1px solid ${COLORS.line}` }}
                >
                  <div style={{ background: "#EDEDED", aspectRatio: "1/1", position: "relative" }}>
                    {item.main_image && (
                      <img
                        src={resolveImageUrl(item.main_image)}
                        alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    {item.extra_info?.priceNegotiable && (
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          background: COLORS.forest,
                          color: "white",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 999,
                        }}
                      >
                        Narx kelishiladi
                      </div>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        background: "rgba(255,255,255,0.9)",
                        borderRadius: 9999,
                        width: 30,
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Heart size={15} color={COLORS.inkSoft} />
                    </div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: COLORS.ink }}>
                      {Number(item.price).toLocaleString()} so'm
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: COLORS.ink,
                        marginBottom: 4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: COLORS.inkSoft }}>{item.region}</div>
                    <div style={{ fontSize: 11.5, color: COLORS.inkSoft }}>{formatListingDate(item.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* "..." bosilganda chiqadigan pastki varaq */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              background: "white",
              borderRadius: "20px 20px 0 0",
              padding: "8px 12px calc(env(safe-area-inset-bottom, 0px) + 16px)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: COLORS.line,
                borderRadius: 999,
                margin: "6px auto 14px",
              }}
            />

            <button
              onClick={() => {
                setMenuOpen(false);
                navigate(`/sotuvchi/${id}/baholash`);
              }}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "14px 12px",
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.ink,
                cursor: "pointer",
                borderBottom: `1px solid ${COLORS.line}`,
                textAlign: "center",
              }}
            >
              Sharh qoldirish
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                handleShare();
              }}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "14px 12px",
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.ink,
                cursor: "pointer",
                borderBottom: `1px solid ${COLORS.line}`,
                textAlign: "center",
              }}
            >
              Profilni ulashish
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                handleToggleSubscribe();
              }}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "14px 12px",
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.ink,
                cursor: "pointer",
              }}
            >
              {subscribed ? "Obunani bekor qilish" : "Obuna bo'lish"}
            </button>

            <div style={{ height: 8 }} />

            <button
              onClick={() => setMenuOpen(false)}
              style={{
                width: "100%",
                textAlign: "center",
                background: "#F1F1F1",
                borderRadius: 14,
                border: "none",
                padding: "14px 12px",
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.ink,
                cursor: "pointer",
              }}
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
