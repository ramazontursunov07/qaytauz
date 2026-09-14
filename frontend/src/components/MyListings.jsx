import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, MoreHorizontal } from "lucide-react";
import BottomNav from "./BottomNav";
import { API_URL } from "../config";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  cream: "#FAF6EE",
};

const API_BASE = API_URL;

const TABS = [
  { key: "faol", label: "Faol" },
  { key: "qoralamalar", label: "Qoralamalar" },
  { key: "kutilmoqda", label: "Harakat kutilmoqda" },
  { key: "arxiv", label: "Arxiv" },
];

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

function ListingCard({ item, onMenuClick, onOpen }) {
  const imageUrl = item.main_image
    ? item.main_image.startsWith("http")
      ? item.main_image
      : `${API_BASE}${item.main_image}`
    : null;

  return (
    <div
      onClick={onOpen}
      style={{
        position: "relative",
        display: "flex",
        gap: 12,
        background: "white",
        borderRadius: 14,
        border: `1px solid ${COLORS.line}`,
        padding: 10,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 10,
          background: "#EDEDED",
          flexShrink: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 22 }}>📦</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14.5,
            color: "#1A1A1A",
            marginBottom: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingRight: 28,
          }}
        >
          {item.title}
        </div>
        <div style={{ fontWeight: 800, fontSize: 14, color: COLORS.forest, marginBottom: 2 }}>
          {Number(item.price).toLocaleString("uz-UZ")} so'm
        </div>
        <div style={{ fontSize: 12, color: COLORS.inkSoft }}>
          {item.region || "Hudud ko'rsatilmagan"}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onMenuClick(item);
        }}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 4,
          display: "flex",
        }}
      >
        <MoreHorizontal size={20} color={COLORS.inkSoft} />
      </button>
    </div>
  );
}

export default function MyListings() {
  const [activeTab, setActiveTab] = useState("faol");
  const [showSellModal, setShowSellModal] = useState(false);
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // "..." menyusi qaysi e'lon uchun ochilganini saqlaydi (null — yopiq)
  const [menuItem, setMenuItem] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/api/products/my/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("E'lonlarni yuklab bo'lmadi");
        return res.json();
      })
      .then((data) => {
        setListings(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const closeMenu = () => {
    setMenuItem(null);
    setActionError("");
  };

  const handleEdit = () => {
    if (!menuItem) return;
    navigate(`/sotish/elon/${menuItem.id}/tahrirlash`);
    closeMenu();
  };

  const handlePromote = () => {
    navigate("/sotish/reklama");
    closeMenu();
  };

  const handleStats = () => {
    navigate("/sotish/statistika");
    closeMenu();
  };

  const handleMarkAsSold = () => {
    if (!menuItem) return;
    const token = localStorage.getItem("access_token");
    setActionError("");
    fetch(`${API_BASE}/api/products/${menuItem.id}/manage/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "Sotildi" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Holatni o'zgartirib bo'lmadi");
        return res.json();
      })
      .then((updated) => {
        setListings((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
        closeMenu();
      })
      .catch((err) => setActionError(err.message));
  };

  const handleRemoveFromSale = () => {
    if (!menuItem) return;
    const token = localStorage.getItem("access_token");
    setActionError("");
    fetch(`${API_BASE}/api/products/${menuItem.id}/manage/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok && res.status !== 204) throw new Error("E'lonni o'chirib bo'lmadi");
        setListings((prev) => prev.filter((l) => l.id !== menuItem.id));
        closeMenu();
      })
      .catch((err) => setActionError(err.message));
  };

  return (
    <div style={{ background: COLORS.cream, minHeight: "100vh", paddingBottom: 100 }}>
      <h1
        style={{
          textAlign: "center",
          fontSize: 20,
          fontWeight: 700,
          padding: "20px 16px 16px",
          margin: 0,
          color: "#1A1A1A",
        }}
      >
        Mening e'lonlarim
      </h1>

      <div style={{ display: "flex", gap: 12, padding: "0 16px 20px" }}>
        <button
          onClick={() => setShowSellModal(true)}
          style={{
            flex: 1,
            background: "#FBE4EC",
            borderRadius: 16,
            padding: 16,
            border: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3, color: "#1A1A1A" }}>
            Savdolar QaytaUz'da
          </div>
        </button>

        <button
          onClick={() => navigate("/sotish/maslahatlar")}
          style={{
            flex: 1,
            background: "#E3F0E5",
            borderRadius: 16,
            padding: 16,
            border: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>💡</div>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
            Sotuvchi uchun maslahatlar
          </div>
        </button>
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.line}`, padding: "0 16px", overflowX: "auto" }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                padding: "12px 4px",
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                color: active ? "#1A1A1A" : COLORS.inkSoft,
                borderBottom: active ? `2px solid #1A1A1A` : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          background: "white",
          minHeight: 400,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          padding: activeTab === "faol" && listings.length > 0 ? "16px" : "60px 40px",
        }}
      >
        {activeTab !== "faol" ? (
          // Eslatma: backend hozircha "qoralama" / "harakat kutilmoqda" / "arxiv"
          // holatini alohida qaytarmaydi, shuning uchun bu tablar hozircha bo'sh ko'rinadi.
          <p style={{ color: COLORS.inkSoft, fontSize: 15, lineHeight: 1.5, margin: 0, textAlign: "center" }}>
            Bu yerda hozircha e'lon yo'q
          </p>
        ) : loading ? (
          <p style={{ color: COLORS.inkSoft, fontSize: 15, textAlign: "center", margin: 0 }}>
            Yuklanmoqda...
          </p>
        ) : error ? (
          <p style={{ color: "#C0392B", fontSize: 14, textAlign: "center", margin: 0 }}>
            Xatolik: {error}
          </p>
        ) : listings.length === 0 ? (
          <p
            style={{
              color: COLORS.inkSoft,
              fontSize: 15,
              lineHeight: 1.5,
              margin: 0,
              textAlign: "center",
            }}
          >
            Bu yerda hozircha e'lon yo'q
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                onMenuClick={setMenuItem}
                onOpen={() => navigate(`/sotish/elon/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating "E'lon berish" button */}
      <div
        style={{
          position: "fixed",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          padding: "0 16px",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={() => navigate("/sotish/yangi")}
          style={{
            width: "100%",
            background: COLORS.forest,
            color: "white",
            border: "none",
            borderRadius: 28,
            padding: "16px 0",
            fontSize: 16,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <Plus size={20} />
          E'lon berish
        </button>
      </div>

      {/* Modal — faqat "Savdolar QaytaUz'da" bosilganda chiqadi */}
      {showSellModal && (
        <div
          onClick={() => setShowSellModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 100,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              width: "100%",
              maxWidth: 480,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px 0" }}>
              <button
                onClick={() => setShowSellModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={22} />
              </button>
            </div>

            <div
              style={{
                background: "#DCEEF7",
                padding: "16px 24px 24px",
                display: "flex",
                justifyContent: "center",
                gap: 4,
                fontSize: 56,
              }}
            >
              <span>🧺</span>
              <span>👗</span>
              <span>🎧</span>
            </div>

            <div style={{ padding: "24px 24px 32px" }}>
              <div style={{ fontWeight: 700, fontSize: 19, marginBottom: 10, color: "#1A1A1A" }}>
                Sotish - tuyulganidan ham osonroq
              </div>
              <div style={{ fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.5, marginBottom: 24 }}>
                E'lon joylashtiring: bu oson va bepul. Xaridorlar uni darhol ko'ra boshlaydilar.
              </div>
              <button
                onClick={() => navigate("/sotish/yangi")}
                style={{
                  width: "100%",
                  background: COLORS.forest,
                  color: "white",
                  border: "none",
                  borderRadius: 28,
                  padding: "16px 0",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  marginBottom: 12,
                }}
              >
                E'lon berish
              </button>
              <button
                onClick={() => setShowSellModal(false)}
                style={{
                  width: "100%",
                  background: "#F2F2F2",
                  color: "#1A1A1A",
                  border: "none",
                  borderRadius: 28,
                  padding: "16px 0",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Keyinroq eslatish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "..." bosilganda chiqadigan e'lon boshqaruv menyusi */}
      {menuItem && (
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
            <div
              style={{
                width: 40,
                height: 4,
                background: COLORS.line,
                borderRadius: 999,
                margin: "6px auto 10px",
              }}
            />

            {actionError && (
              <div style={{ color: "#C0392B", fontSize: 13, textAlign: "center", padding: "4px 12px 8px" }}>
                {actionError}
              </div>
            )}

            <button onClick={handlePromote} style={sheetButtonStyle}>
              Reklama sotib olish
            </button>
            <button onClick={handleEdit} style={sheetButtonStyle}>
              Tahrirlash
            </button>
            <button onClick={handleStats} style={sheetButtonStyle}>
              E'lon statistikasi
            </button>
            <button onClick={handleMarkAsSold} style={{ ...sheetButtonStyle, color: COLORS.forest }}>
              QaytaUz orqali sotdim
            </button>
            <button onClick={handleRemoveFromSale} style={{ ...sheetButtonStyle, color: COLORS.forest }}>
              Sotuvdan olib tashlash
            </button>
            <button
              onClick={closeMenu}
              style={{ ...sheetButtonStyle, fontWeight: 700, color: COLORS.inkSoft, marginTop: 4 }}
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
