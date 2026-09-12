import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Heart, Share2, User, ChevronDown, MapPin, Phone, Send, Flag,
} from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  cream: "#FAF6EE",
  pink: "#B4126E",
  ink: "#1F2A1E",
};

const API_BASE = "http://localhost:8000";

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function formatDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}.${mm}.${yy}`;
}

function formatDateTime(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${min}, ${formatDate(isoDate)}`;
}

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ProductPublicView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [sellerListings, setSellerListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [compactHeader, setCompactHeader] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const REPORT_REASONS = [
    "Tavsifdagi xato",
    "Firibgar",
    "Reklama QaytaUz qoidalarini buzadi",
    "Mahsulot sotilgan",
    "Boshqa",
  ];
  const [reportOpen, setReportOpen] = useState(false);
  const [reportStep, setReportStep] = useState("select"); // "select" | "other" | "sent"
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportStatus, setReportStatus] = useState(""); // "" | "sending" | "sent" | "error"

  // "Sotuvchidan so'rang" tezkor xabar bloki
  const QUICK_REPLIES = [
    "Sotib olmoqchiman",
    "Hali sotmoqdasizmi?",
    "Savdo o'rinlimi?",
    "O'lchami qanaqa?",
    "Qanday holatda?",
  ];
  const [quickMessageText, setQuickMessageText] = useState(QUICK_REPLIES[0]);
  const [quickMessageSending, setQuickMessageSending] = useState(false);
  const [quickMessageError, setQuickMessageError] = useState("");
  const [quickMessageSent, setQuickMessageSent] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`${API_BASE}/api/products/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("E'lon topilmadi");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setActiveImage(0);
        // O'xshash e'lonlar — bir xil kategoriyadagi boshqa faol e'lonlar
        if (data.category) {
          fetch(`${API_BASE}/api/products/?category=${data.category}`)
            .then((res) => (res.ok ? res.json() : []))
            .then((list) => {
              const arr = Array.isArray(list) ? list : list.results || [];
              setSimilar(arr.filter((p) => p.id !== data.id).slice(0, 6));
            })
            .catch(() => {});
        }
        // Sotuvchining ochiq profili (haqiqiy statistikasi bilan)
        if (data.owner) {
          fetch(`${API_BASE}/api/users/public/${data.owner}/`)
            .then((res) => (res.ok ? res.json() : null))
            .then((pub) => setSellerProfile(pub))
            .catch(() => {});
          // Sotuvchining boshqa faol e'lonlari
          fetch(`${API_BASE}/api/products/?owner=${data.owner}`)
            .then((res) => (res.ok ? res.json() : []))
            .then((list) => {
              const arr = Array.isArray(list) ? list : list.results || [];
              setSellerListings(arr.filter((p) => p.id !== data.id).slice(0, 6));
            })
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    fetch(`${API_BASE}/api/products/categories/`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : data.results || []))
      .catch(() => {});

    // Sevimlilar ro'yxatidan shu mahsulot bor-yo'qligini tekshirish (kirgan bo'lsa)
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch(`${API_BASE}/api/favorites/`, { headers: authHeaders() })
        .then((res) => (res.ok ? res.json() : []))
        .then((list) => {
          const arr = Array.isArray(list) ? list : list.results || [];
          const match = arr.find((f) => f.product_detail?.id === Number(id) || f.product === Number(id));
          if (match) {
            setIsFavorited(true);
            setFavoriteId(match.id);
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const onScroll = () => setCompactHeader(window.scrollY > 260);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleFavorite = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/kirish");
      return;
    }
    if (isFavorited && favoriteId) {
      fetch(`${API_BASE}/api/favorites/delete/${favoriteId}/`, {
        method: "DELETE",
        headers: authHeaders(),
      })
        .then((res) => {
          if (res.ok || res.status === 204) {
            setIsFavorited(false);
            setFavoriteId(null);
          }
        })
        .catch(() => {});
    } else {
      fetch(`${API_BASE}/api/favorites/`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ product: product.id }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setIsFavorited(true);
            setFavoriteId(data.id);
          }
        })
        .catch(() => {});
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, url: shareUrl });
      } catch {
        /* bekor qilindi */
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Havola nusxalandi");
      } catch {
        alert(shareUrl);
      }
    }
  };

  const handleOpenMap = () => {
    if (!product?.region) return;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(product.region)}`,
      "_blank"
    );
  };

  const handleStartChat = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/kirish");
      return;
    }
    setChatLoading(true);
    setChatError("");
    fetch(`${API_BASE}/api/users/profile/`, { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : null))
      .then((me) => {
        if (!me) throw new Error("Profil ma'lumotini olib bo'lmadi");
        return fetch(`${API_BASE}/api/chats/chat-create/`, {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            product: product.id,
            participants: [me.id, product.owner],
          }),
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error("Chatni boshlab bo'lmadi");
        return res.json();
      })
      .then((chat) => navigate(`/xabarlar/${chat.id}`))
      .catch((err) => setChatError(err.message))
      .finally(() => setChatLoading(false));
  };

  // "Sotuvchidan so'rang" bloki: chatni (agar hali yo'q bo'lsa) yaratadi va
  // tanlangan/yozilgan matnni birinchi xabar sifatida darhol yuboradi.
  const handleSendQuickMessage = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/kirish");
      return;
    }
    const text = quickMessageText.trim();
    if (!text) return;

    setQuickMessageSending(true);
    setQuickMessageError("");
    fetch(`${API_BASE}/api/users/profile/`, { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : null))
      .then((me) => {
        if (!me) throw new Error("Profil ma'lumotini olib bo'lmadi");
        return fetch(`${API_BASE}/api/chats/chat-create/`, {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            product: product.id,
            participants: [me.id, product.owner],
          }),
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error("Chatni boshlab bo'lmadi");
        return res.json();
      })
      .then((chat) =>
        fetch(`${API_BASE}/api/chats/message-create/`, {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ chat: chat.id, text }),
        }).then((res) => {
          if (!res.ok) throw new Error("Xabarni yuborib bo'lmadi");
          return chat;
        })
      )
      .then((chat) => {
        setQuickMessageSent(true);
        navigate(`/xabarlar/${chat.id}`);
      })
      .catch((err) => setQuickMessageError(err.message))
      .finally(() => setQuickMessageSending(false));
  };

  const handleSubmitReport = (reasonText) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/kirish");
      return;
    }
    const finalReason = (reasonText || "").trim();
    if (!finalReason) return;
    setReportStatus("sending");
    fetch(`${API_BASE}/api/users/reports/create/`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ product: product.id, reason: finalReason }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setReportStatus("sent");
        setReportStep("sent");
        setReportReason("");
      })
      .catch(() => setReportStatus("error"));
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inkSoft }}>
        Yuklanmoqda...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: "100vh", padding: 20, textAlign: "center", color: "#C0392B" }}>
        Xatolik: {error || "E'lon topilmadi"}
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const mainImageUrl = resolveImageUrl(images[activeImage]?.image) || resolveImageUrl(images[0]?.image);

  const extra = product.extra_info || {};
  const sellerPhone = sellerProfile?.phone_number || "";
  const canCall = !!extra.phoneCall && !!sellerPhone;
  const canTelegram = !!extra.telegramChat && !!sellerPhone;

  const category = categories.find((c) => c.id === product.category);
  const parentCategory = category ? categories.find((c) => c.id === category.parent) : null;
  const categoryBreadcrumb = [parentCategory?.name, category?.name].filter(Boolean).join(" · ");

  const audience = product.extra_info?.audience;

  // "Yana ko'ring" uchun joriy kategoriyaning opa-singil (sibling) kategoriyalari
  const siblingCategories = category
    ? categories.filter((c) => c.parent === category.parent && c.id !== category.id).slice(0, 4)
    : [];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream, paddingBottom: 90 }}>
      {/* Top bar: oddiy yoki compact (scroll qilinganda) */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "white",
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        {!compactHeader ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
            }}
          >
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <ArrowLeft size={22} color={COLORS.ink} />
            </button>
            <div style={{ display: "flex", gap: 18 }}>
              <button onClick={toggleFavorite} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Heart size={22} color={isFavorited ? COLORS.pink : COLORS.ink} fill={isFavorited ? COLORS.pink : "none"} />
              </button>
              <button onClick={handleShare} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Share2 size={20} color={COLORS.ink} />
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
            }}
          >
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
              <ArrowLeft size={20} color={COLORS.ink} />
            </button>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "#EDEDED",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {mainImageUrl && (
                <img src={mainImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1A1A1A" }}>
                {Number(product.price).toLocaleString("uz-UZ")} so'm
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: COLORS.inkSoft,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {product.title}
              </div>
            </div>
            <button onClick={toggleFavorite} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
              <Heart size={20} color={isFavorited ? COLORS.pink : COLORS.ink} fill={isFavorited ? COLORS.pink : "none"} />
            </button>
            <button onClick={handleShare} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
              <Share2 size={18} color={COLORS.ink} />
            </button>
          </div>
        )}
      </div>

      {/* Rasm */}
      <div style={{ background: "white", padding: 16 }}>
        <div
          style={{
            width: "100%",
            maxWidth: 320,
            margin: "0 auto",
            aspectRatio: "4/3",
            background: "#EDEDED",
            borderRadius: 16,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {mainImageUrl && (
            <img src={mainImageUrl} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          )}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                aria-label="Oldingi rasm"
                style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "35%", background: "none", border: "none", cursor: "pointer" }}
              />
              <button
                onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                aria-label="Keyingi rasm"
                style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "35%", background: "none", border: "none", cursor: "pointer" }}
              />
              <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    style={{
                      width: idx === activeImage ? 16 : 6,
                      height: 6,
                      borderRadius: 999,
                      background: idx === activeImage ? "white" : "rgba(255,255,255,0.55)",
                      transition: "width 0.15s",
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto", maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(idx)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: idx === activeImage ? `2px solid ${COLORS.forest}` : "2px solid transparent",
                  padding: 0,
                  cursor: "pointer",
                  flexShrink: 0,
                  background: "#EDEDED",
                }}
              >
                <img src={resolveImageUrl(img.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Narx + sarlavha */}
      <div style={{ background: "white", padding: "16px 20px" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#1A1A1A", marginBottom: 4 }}>
          {Number(product.price).toLocaleString("uz-UZ")} so'm
        </div>
        <div style={{ fontSize: 15, color: COLORS.inkSoft }}>{product.title}</div>
      </div>

      {/* E'lon tafsilotlari */}
      <div style={{ background: "white", margin: "10px 0 0", padding: "20px" }}>
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, color: "#1A1A1A" }}>
          E'lon tafsilotlari
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14.5 }}>
          <div>
            <span style={{ color: COLORS.inkSoft }}>Toifa: </span>
            <span style={{ color: "#1A1A1A" }}>{categoryBreadcrumb || "—"}</span>
          </div>
          <div>
            <span style={{ color: COLORS.inkSoft }}>Holat: </span>
            <span style={{ color: "#1A1A1A" }}>{product.condition}</span>
          </div>
          {audience && (
            <div>
              <span style={{ color: COLORS.inkSoft }}>Holat bahosi: </span>
              <span style={{ color: "#1A1A1A" }}>{audience}</span>
            </div>
          )}
        </div>
        {product.description && (
          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: `1px dashed ${COLORS.line}`,
              fontSize: 14.5,
              color: "#1A1A1A",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {product.description}
          </div>
        )}
      </div>

      {/* Sotuvchi */}
      <div
        onClick={() => navigate(`/sotuvchi/${product.owner}`)}
        style={{
          width: "100%",
          background: "white",
          margin: "10px 0 0",
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 16, fontWeight: 700, color: "#1A1A1A" }}>
            {product.owner_username}
          </div>
          <div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 2 }}>
            {sellerProfile ? `${sellerProfile.listings_count} ta faol e'lon` : "\u00A0"}
          </div>
          {sellerProfile?.joined_date && (
            <div style={{ fontSize: 13, color: COLORS.inkSoft }}>
              Ro'yxatdan o'tgan {sellerProfile.joined_date}
            </div>
          )}
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#EDEDED",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {sellerProfile?.avatar ? (
            <img src={sellerProfile.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <User size={22} color={COLORS.inkSoft} />
          )}
        </div>
      </div>

      {/* Sotuvchidan so'rang */}
      <div style={{ background: "white", margin: "10px 0 0", padding: "20px" }}>
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, color: "#1A1A1A" }}>
          Sotuvchidan so'rang
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <input
            value={quickMessageText}
            onChange={(e) => {
              setQuickMessageText(e.target.value);
              setQuickMessageSent(false);
            }}
            placeholder="Xabar yozing..."
            style={{
              flex: 1,
              background: "#F1F1F1",
              border: "none",
              borderRadius: 14,
              padding: "14px 16px",
              fontSize: 14.5,
              outline: "none",
              color: "#1A1A1A",
            }}
          />
          <button
            onClick={handleSendQuickMessage}
            disabled={quickMessageSending || !quickMessageText.trim()}
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: COLORS.pink,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: quickMessageSending || !quickMessageText.trim() ? "not-allowed" : "pointer",
              opacity: quickMessageSending || !quickMessageText.trim() ? 0.6 : 1,
              flexShrink: 0,
            }}
          >
            <Send size={18} color="white" />
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: quickMessageError || quickMessageSent ? 10 : 0 }}>
          {QUICK_REPLIES.map((reply) => {
            const active = quickMessageText === reply;
            return (
              <button
                key={reply}
                onClick={() => {
                  setQuickMessageText(reply);
                  setQuickMessageSent(false);
                }}
                style={{
                  background: active ? COLORS.ink : "#F1F1F1",
                  color: active ? "white" : "#1A1A1A",
                  border: "none",
                  borderRadius: 999,
                  padding: "10px 16px",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {reply}
              </button>
            );
          })}
        </div>

        {quickMessageError && (
          <div style={{ color: "#C0392B", fontSize: 13 }}>{quickMessageError}</div>
        )}
        {quickMessageSent && !quickMessageError && (
          <div style={{ color: COLORS.forest, fontSize: 13, fontWeight: 600 }}>
            Xabar yuborildi — Xabarlar bo'limidan davom ettirishingiz mumkin.
          </div>
        )}
      </div>

      {/* Bitim joyi */}
      <div style={{ background: "white", margin: "10px 0 0", padding: "20px" }}>
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, color: "#1A1A1A" }}>
          Bitim joyi
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: COLORS.cream,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MapPin size={18} color={COLORS.inkSoft} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, color: "#1A1A1A", marginBottom: 4 }}>
              {product.region || "Ko'rsatilmagan"}
            </div>
            {product.region && (
              <button
                onClick={() => {
                  setMapOpen((v) => !v);
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: "#2AA9E0",
                  fontSize: 13.5,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                Xaritani ochish
                <ChevronDown size={14} style={{ transform: mapOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
              </button>
            )}
            {mapOpen && (
              <button
                onClick={handleOpenMap}
                style={{
                  marginTop: 10,
                  width: "100%",
                  background: COLORS.cream,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 13.5,
                  color: COLORS.forest,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                Google Xaritada ochish ↗
              </button>
            )}
          </div>
        </div>
      </div>

      {/* O'xshash */}
      {similar.length > 0 && (
        <div style={{ background: "white", margin: "10px 0 0", padding: "20px 0 20px 20px" }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, color: "#1A1A1A", paddingRight: 20 }}>
            O'xshash
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingRight: 20 }}>
            {similar.map((item) => {
              const imgUrl = resolveImageUrl(item.main_image);
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/mahsulot/${item.id}`)}
                  style={{ width: 150, flexShrink: 0, cursor: "pointer" }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1/1",
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "#EDEDED",
                    }}
                  >
                    {imgUrl && (
                      <img src={imgUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Heart size={14} color={COLORS.ink} />
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#1A1A1A", marginTop: 8 }}>
                    {Number(item.price).toLocaleString("uz-UZ")} so'm
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#1A1A1A",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>
                    {item.region || "—"}
                  </div>
                  <div style={{ fontSize: 11.5, color: COLORS.inkSoft }}>
                    {formatDate(item.created_at)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sotuvchining boshqa e'lonlari */}
      {sellerListings.length > 0 && (
        <div style={{ background: "white", margin: "10px 0 0", padding: "20px 0 20px 20px" }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, color: "#1A1A1A", paddingRight: 20 }}>
            Sotuvchining e'lonlari
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingRight: 20 }}>
            {sellerListings.map((item) => {
              const imgUrl = resolveImageUrl(item.main_image);
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/mahsulot/${item.id}`)}
                  style={{ width: 150, flexShrink: 0, cursor: "pointer" }}
                >
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1/1",
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "#EDEDED",
                    }}
                  >
                    {imgUrl && (
                      <img src={imgUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#1A1A1A", marginTop: 8 }}>
                    {Number(item.price).toLocaleString("uz-UZ")} so'm
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#1A1A1A",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>
                    {item.region || "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Yana ko'ring */}
      {siblingCategories.length > 0 && (
        <div style={{ background: "white", margin: "10px 0 0", padding: "20px" }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, color: "#1A1A1A" }}>
            Yana ko'ring
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {siblingCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate("/", { state: { categoryId: c.id } })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: COLORS.cream,
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 14px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "white",
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: "#1A1A1A",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: COLORS.inkSoft }}>
                    {parentCategory?.name || "Kategoriya"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Meta ma'lumot */}
      <div style={{ background: "white", margin: "10px 0 0", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14.5 }}>
          <span style={{ color: COLORS.inkSoft }}>Raqam</span>
          <span style={{ color: "#1A1A1A" }}>{product.id}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14.5 }}>
          <span style={{ color: COLORS.inkSoft }}>Nashr vaqti</span>
          <span style={{ color: "#1A1A1A" }}>{formatDateTime(product.created_at)}</span>
        </div>

        <button
          onClick={() => {
            const token = localStorage.getItem("access_token");
            if (!token) {
              navigate("/kirish");
              return;
            }
            setReportOpen(true);
            setReportStep("select");
            setSelectedReportReason("");
            setReportReason("");
            setReportStatus("");
          }}
          style={{
            width: "100%",
            marginTop: 10,
            background: COLORS.cream,
            border: "none",
            borderRadius: 12,
            padding: "12px 0",
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.inkSoft,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Flag size={16} />
          Shikoyat qilish
        </button>
      </div>

      {/* Shikoyat sahifasi — to'liq ekranli */}
      {reportOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "white",
            zIndex: 300,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", padding: "16px 16px 8px" }}>
            <button
              onClick={() => {
                if (reportStep === "other") {
                  setReportStep("select");
                } else {
                  setReportOpen(false);
                }
              }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              <ArrowLeft size={22} color={COLORS.ink} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px" }}>
            {reportStep === "sent" ? (
              <div style={{ paddingTop: 40, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#1A1A1A", marginBottom: 10 }}>
                  Shikoyatingiz qabul qilindi
                </div>
                <div style={{ fontSize: 14.5, color: COLORS.inkSoft }}>
                  Ko'rib chiqib, kerakli chora ko'ramiz. Rahmat!
                </div>
              </div>
            ) : reportStep === "other" ? (
              <>
                <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: "#1A1A1A" }}>
                  Sababni yozing
                </div>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Nima uchun shikoyat qilyapsiz?"
                  rows={5}
                  autoFocus
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
                  }}
                />
              </>
            ) : (
              <>
                <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: "#1A1A1A" }}>
                  Shikoyat
                </div>
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReportReason(reason)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "none",
                      border: "none",
                      borderBottom: `1px solid ${COLORS.line}`,
                      padding: "18px 0",
                      fontSize: 16,
                      color: "#1A1A1A",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {reason}
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: `2px solid ${selectedReportReason === reason ? COLORS.pink : COLORS.line}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {selectedReportReason === reason && (
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.pink }} />
                      )}
                    </span>
                  </button>
                ))}
              </>
            )}

            {reportStatus === "error" && (
              <div style={{ color: "#C0392B", fontSize: 13, marginTop: 12 }}>
                Yuborishda xatolik yuz berdi, qayta urinib ko'ring.
              </div>
            )}
          </div>

          {reportStep !== "sent" && (
            <div style={{ padding: 16 }}>
              <button
                onClick={() => {
                  if (reportStep === "select") {
                    if (selectedReportReason === "Boshqa") {
                      setReportStep("other");
                      return;
                    }
                    setReportReason(selectedReportReason);
                    handleSubmitReport(selectedReportReason);
                  } else {
                    handleSubmitReport(reportReason);
                  }
                }}
                disabled={
                  reportStatus === "sending" ||
                  (reportStep === "select" ? !selectedReportReason : !reportReason.trim())
                }
                style={{
                  width: "100%",
                  background: COLORS.pink,
                  color: "white",
                  border: "none",
                  borderRadius: 28,
                  padding: "16px 0",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity:
                    reportStatus === "sending" ||
                    (reportStep === "select" ? !selectedReportReason : !reportReason.trim())
                      ? 0.6
                      : 1,
                }}
              >
                {reportStatus === "sending" ? "Yuborilmoqda..." : "Davom ettirish"}
              </button>
            </div>
          )}
        </div>
      )}

      {chatError && (
        <div style={{ color: "#C0392B", fontSize: 13, textAlign: "center", padding: "10px 20px 0" }}>
          {chatError}
        </div>
      )}

      {/* Pastki aloqa tugmalari */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          padding: 16,
          background: "white",
          borderTop: `1px solid ${COLORS.line}`,
          boxSizing: "border-box",
          display: "flex",
          gap: 10,
        }}
      >
        <button
          onClick={handleStartChat}
          disabled={chatLoading}
          style={{
            flex: 1,
            background: COLORS.pink,
            color: "white",
            border: "none",
            borderRadius: 14,
            padding: "15px 0",
            fontSize: 16,
            fontWeight: 700,
            cursor: chatLoading ? "not-allowed" : "pointer",
          }}
        >
          {chatLoading ? "Boshlanmoqda..." : "Chatga yozish"}
        </button>
        {canCall && (
          <a
            href={`tel:${sellerPhone}`}
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: "#2FAE5C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Phone size={20} color="white" />
          </a>
        )}
        {canTelegram && (
          <a
            href={`https://t.me/+${sellerPhone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: "#29A9E0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Send size={18} color="white" />
          </a>
        )}
      </div>
    </div>
  );
}
