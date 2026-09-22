import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Share2, MoreHorizontal, Eye, MapPin, ChevronRight, User, Heart, Phone, X,
} from "lucide-react";
import { API_BASE, authFetch } from "../utils/auth";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  cream: "#FAF6EE",
  pink: "#B4126E",
  ink: "#1F2A1E",
};

const sheetButtonStyle = {
  width: "100%",
  background: "none",
  border: "none",
  borderBottom: `1px solid ${COLORS.line}`,
  padding: "16px 12px",
  fontSize: 16,
  fontWeight: 600,
  color: "#1A1A1A",
  cursor: "pointer",
  textAlign: "center",
};

const REMOVE_REASONS = [
  { key: "sold_here", label: "QaytaUz'da sotdim" },
  { key: "sold_elsewhere", label: "Boshqa joyda sotdim" },
  { key: "other", label: "Boshqa sabab" },
];

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function formatJoinDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
}

// Backend'da e'lon muddati (expiry) maydoni yo'q, shuning uchun odatiy
// e'lon amal qilish muddati — 30 kun — created_at'dan hisoblanadi.
function daysLeft(createdAt) {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  return Math.max(0, 30 - diffDays);
}

const STATUS_LABELS = {
  Faol: "Faol",
  Sotildi: "Sotildi",
  "Ko‘rib chiqilmoqda": "Ko'rib chiqilmoqda",
  Bloklangan: "Bloklangan",
};

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [seller, setSeller] = useState(null);
  const [sellerActiveCount, setSellerActiveCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeReason, setRemoveReason] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/kirish");
      return;
    }

    Promise.all([
      authFetch(`${API_BASE}/api/products/${id}/`).then((res) => {
        if (!res.ok) throw new Error("E'lon topilmadi");
        return res.json();
      }),
      authFetch(`${API_BASE}/api/users/profile/`).then((res) => (res.ok ? res.json() : null)),
      authFetch(`${API_BASE}/api/products/my/`).then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([productData, profileData, myProductsData]) => {
        setProduct(productData);
        setSeller(profileData);
        const myProducts = Array.isArray(myProductsData) ? myProductsData : myProductsData?.results || [];
        setSellerActiveCount(myProducts.filter((p) => p.status === "Faol").length);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const closeMenu = () => {
    setMenuOpen(false);
    setActionError("");
  };

  const handlePromote = () => {
    navigate("/sotish/reklama");
    closeMenu();
  };

  const handleEdit = () => {
    navigate(`/sotish/elon/${id}/tahrirlash`);
    closeMenu();
  };

  const handleMarkAsSold = () => {
    const token = localStorage.getItem("access_token");
    setActionError("");
    fetch(`${API_BASE}/api/products/${id}/mark-sold/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Holatni o'zgartirib bo'lmadi");
        return res.json();
      })
      .then((updated) => {
        setProduct((prev) => ({ ...prev, ...updated }));
        closeMenu();
      })
      .catch((err) => setActionError(err.message));
  };

  const openRemoveModal = () => {
    setRemoveReason(null);
    setActionError("");
    setRemoveModalOpen(true);
    closeMenu();
  };

  const closeRemoveModal = () => {
    setRemoveModalOpen(false);
    setRemoveReason(null);
  };

  const confirmRemoveFromSale = () => {
    if (!removeReason) return;
    const token = localStorage.getItem("access_token");
    setRemoving(true);
    setActionError("");
    fetch(`${API_BASE}/api/products/${id}/manage/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok && res.status !== 204) throw new Error("E'lonni o'chirib bo'lmadi");
        navigate("/sotish");
      })
      .catch((err) => {
        setActionError(err.message);
        setRemoving(false);
      });
  };

  const handleOpenMap = () => {
    if (!product?.region) return;
    const query = encodeURIComponent(product.region);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inkSoft }}>
        Yuklanmoqda...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: "100vh", background: "white", padding: 20, textAlign: "center", color: "#C0392B" }}>
        Xatolik: {error || "E'lon topilmadi"}
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const remainingDays = daysLeft(product.created_at);
  const statusLabel = STATUS_LABELS[product.status] || product.status;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream, paddingBottom: 40 }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "white",
        }}
      >
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ArrowLeft size={22} color={COLORS.ink} />
        </button>
        <div style={{ display: "flex", gap: 16 }}>
          <button
            onClick={async () => {
              const shareUrl = window.location.href;
              if (navigator.share) {
                try {
                  await navigator.share({ title: product.title, url: shareUrl });
                } catch {
                  /* foydalanuvchi bekor qilgan */
                }
              } else {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  alert("Havola nusxalandi");
                } catch {
                  alert(shareUrl);
                }
              }
            }}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <Share2 size={20} color={COLORS.ink} />
          </button>
          <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <MoreHorizontal size={22} color={COLORS.ink} />
          </button>
        </div>
      </div>

      {/* Status badge */}
      <div style={{ padding: "12px 16px 0" }}>
        <span
          style={{
            display: "inline-block",
            background: product.status === "Faol" ? "#E3F0E5" : "#F1F1F1",
            color: product.status === "Faol" ? COLORS.forest : COLORS.inkSoft,
            fontSize: 13,
            fontWeight: 700,
            padding: "6px 14px",
            borderRadius: 999,
          }}
        >
          {statusLabel}
          {product.status === "Faol" && remainingDays !== null ? ` · ${remainingDays} kun qoldi` : ""}
        </span>
      </div>

      {/* Image */}
      <div style={{ padding: 16 }}>
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            margin: "0 auto",
            aspectRatio: "4/3",
            background: "#EDEDED",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {images.length > 0 && resolveImageUrl(images[activeImage]?.image) && (
            <img
              key={images[activeImage].id}
              src={resolveImageUrl(images[activeImage].image)}
              alt={product.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          )}
        </div>
        {images.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto" }}>
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(idx)}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  overflow: "hidden",
                  border: idx === activeImage ? `2px solid ${COLORS.forest}` : `2px solid transparent`,
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

      {/* Statistika: ko'rishlar, sevimlilar, qo'ng'iroqlar */}
      <div style={{ padding: "0 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: COLORS.inkSoft, fontSize: 13.5 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Eye size={16} />
            {product.views_count ?? 0}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Heart size={16} />
            {product.favorites_count ?? 0}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Phone size={16} />
            {product.calls_count ?? 0}
          </span>
        </div>
        <button
          onClick={() => setInfoOpen(true)}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#2AA9E0", fontSize: 13, fontWeight: 600 }}
        >
          Bu nima degani?
        </button>
      </div>

      {/* Price + title */}
      <div style={{ padding: "0 16px 20px" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#1A1A1A", marginBottom: 4 }}>
          {Number(product.price).toLocaleString("uz-UZ")} so'm
        </div>
        <div style={{ fontSize: 16, color: "#1A1A1A" }}>{product.title}</div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 16px 24px" }}>
        <button
          onClick={handlePromote}
          style={{
            background: COLORS.pink,
            color: "white",
            border: "none",
            borderRadius: 14,
            padding: "15px 0",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Reklama sotib olish
        </button>
        <button
          onClick={handleEdit}
          style={{
            background: "#F1F1F1",
            color: "#1A1A1A",
            border: "none",
            borderRadius: 14,
            padding: "15px 0",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tahrirlash
        </button>
        <button
          onClick={openRemoveModal}
          style={{
            background: "#F1F1F1",
            color: "#1A1A1A",
            border: "none",
            borderRadius: 14,
            padding: "15px 0",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Sotuvdan olib tashlash
        </button>
        {actionError && (
          <div style={{ color: "#C0392B", fontSize: 13, textAlign: "center" }}>{actionError}</div>
        )}
      </div>

      {/* E'lon tafsilotlari */}
      <div style={{ background: "white", borderRadius: 16, margin: "0 16px 16px", padding: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, color: "#1A1A1A" }}>
          E'lon tafsilotlari
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14.5 }}>
          <div>
            <span style={{ color: COLORS.inkSoft }}>Toifa: </span>
            <span style={{ color: "#1A1A1A" }}>{product.category_name || "—"}</span>
          </div>
          <div>
            <span style={{ color: COLORS.inkSoft }}>Holat: </span>
            <span style={{ color: "#1A1A1A" }}>{product.condition}</span>
          </div>
          {(product.attribute_values || []).map((attr) => (
            <div key={attr.id}>
              <span style={{ color: COLORS.inkSoft }}>{attr.attribute_name}: </span>
              <span style={{ color: "#1A1A1A" }}>{attr.value}</span>
            </div>
          ))}
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

      {/* Bitim joyi */}
      <div style={{ background: "white", borderRadius: 16, margin: "0 16px 16px", padding: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, color: "#1A1A1A" }}>
          Bitim joyi
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
          <div>
            <div style={{ fontSize: 14.5, color: "#1A1A1A" }}>{product.region || "Ko'rsatilmagan"}</div>
            {product.region && (
              <button
                onClick={handleOpenMap}
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
                Xaritani ochish <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Seller card */}
      {seller && (
        <div style={{ background: "white", borderRadius: 16, margin: "0 16px 16px", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#EDEDED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {seller.avatar ? (
                <img src={seller.avatar} alt={seller.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <User size={24} color={COLORS.inkSoft} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div
                onClick={() => navigate("/profil/korinish")}
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 16, fontWeight: 700, color: "#1A1A1A", cursor: "pointer" }}
              >
                {seller.username}
                <ChevronRight size={16} color={COLORS.inkSoft} />
              </div>
              <div style={{ fontSize: 13, color: COLORS.inkSoft }}>
                {sellerActiveCount ?? 0} ta faol e'lon
              </div>
              <div style={{ fontSize: 13, color: COLORS.inkSoft }}>
                Ro'yxatdan o'tgan {formatJoinDate(seller.date_joined)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mening e'lonim qanday ko'rinadi */}
      <div style={{ padding: "0 16px" }}>
        <button
          onClick={() => navigate(`/mahsulot/${id}`)}
          style={{
            width: "100%",
            background: "#FCE4EF",
            color: COLORS.pink,
            border: "none",
            borderRadius: 14,
            padding: "16px 0",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Mening e'lonim qanday ko'rinadi
        </button>
      </div>

      {/* "..." menyusi */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              background: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: "8px 12px calc(env(safe-area-inset-bottom, 0px) + 16px)",
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: 40, height: 4, background: COLORS.line, borderRadius: 999, margin: "6px auto 10px" }} />
            <button onClick={handlePromote} style={sheetButtonStyle}>Reklama sotib olish</button>
            <button onClick={handleEdit} style={sheetButtonStyle}>Tahrirlash</button>
            <button onClick={() => { navigate("/sotish/statistika"); closeMenu(); }} style={sheetButtonStyle}>E'lon statistikasi</button>
            <button onClick={handleMarkAsSold} style={{ ...sheetButtonStyle, color: COLORS.forest }}>QaytaUz orqali sotdim</button>
            <button onClick={openRemoveModal} style={{ ...sheetButtonStyle, color: COLORS.forest }}>Sotuvdan olib tashlash</button>
            <button onClick={closeMenu} style={{ ...sheetButtonStyle, fontWeight: 700, color: COLORS.inkSoft, marginTop: 4 }}>
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {/* "Bu nima degani?" modal */}
      {infoOpen && (
        <div
          onClick={() => setInfoOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: COLORS.cream,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: "18px 20px calc(env(safe-area-inset-bottom, 0px) + 22px)",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            <div style={{ width: 40, height: 4, background: COLORS.line, borderRadius: 999, margin: "0 auto 18px" }} />

            <button
              onClick={() => setInfoOpen(false)}
              style={{
                position: "absolute",
                top: 14,
                right: 16,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "white",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: COLORS.inkSoft,
              }}
            >
              ×
            </button>

            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 18, color: "#1A1A1A" }}>
              Statistika nimani anglatadi
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: Eye, title: "Ko'rishlar", text: "E'loningizni nechta marta ochib ko'rishgan." },
                { icon: Heart, title: "Sevimlilar", text: "E'loningizni nechta foydalanuvchi sevimlilarga qo'shgan." },
                { icon: Phone, title: "Qo'ng'iroqlar", text: "Telefon raqamingiz nechta marta ko'rilgan yoki bosilgan." },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    background: "white",
                    borderRadius: 14,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: COLORS.cream,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={17} color={COLORS.forest} />
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.5, color: "#1A1A1A" }}>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{title}</div>
                    <div style={{ color: COLORS.inkSoft }}>{text}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setInfoOpen(false)}
              style={{
                width: "100%",
                marginTop: 18,
                background: COLORS.forest,
                color: "white",
                border: "none",
                borderRadius: 14,
                padding: "15px 0",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}

      {/* "Sababini ko'rsating" modal — sotuvdan olib tashlashdan oldin */}
      {removeModalOpen && (
        <div
          onClick={closeRemoveModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: "20px 20px calc(env(safe-area-inset-bottom, 0px) + 20px)",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1A1A1A" }}>
                Sababini ko'rsating
              </div>
              <button
                onClick={closeRemoveModal}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              >
                <X size={22} color={COLORS.inkSoft} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {REMOVE_REASONS.map((reason, i) => (
                <button
                  key={reason.key}
                  onClick={() => setRemoveReason(reason.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    background: "none",
                    border: "none",
                    borderBottom: i < REMOVE_REASONS.length - 1 ? `1px solid ${COLORS.line}` : "none",
                    padding: "16px 4px",
                    fontSize: 15.5,
                    fontWeight: 500,
                    color: "#1A1A1A",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {reason.label}
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: `2px solid ${removeReason === reason.key ? COLORS.forest : COLORS.line}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {removeReason === reason.key && (
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.forest }} />
                    )}
                  </span>
                </button>
              ))}
            </div>

            {actionError && (
              <div style={{ color: "#C0392B", fontSize: 13, textAlign: "center", marginTop: 12 }}>{actionError}</div>
            )}

            <button
              onClick={confirmRemoveFromSale}
              disabled={!removeReason || removing}
              style={{
                width: "100%",
                marginTop: 20,
                background: removeReason ? COLORS.forest : "#DADADA",
                color: "white",
                border: "none",
                borderRadius: 14,
                padding: "15px 0",
                fontSize: 15,
                fontWeight: 700,
                cursor: removeReason ? "pointer" : "not-allowed",
              }}
            >
              {removing ? "..." : "E'lonni yopish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
