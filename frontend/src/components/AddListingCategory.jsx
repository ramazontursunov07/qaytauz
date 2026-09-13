import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Sparkles, ChevronRight } from "lucide-react";
import { API_URL } from "../config";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
};

const API_BASE = API_URL;

// Sarlavha bo'yicha kategoriyani taxminlash uchun kalit so'zlar jadvali.
const CATEGORY_KEYWORDS = [
  { keywords: ["ko'zoynak", "kozoynak", "linza"], name: "Ko'zoynaklar" },
  { keywords: ["telefon", "iphone", "samsung", "smartfon"], name: "Smartfonlar" },
  { keywords: ["noutbuk", "laptop", "macbook"], name: "Noutbuklar" },
  { keywords: ["divan", "stol", "shkaf", "krovat"], name: "Mebel" },
  { keywords: ["kitob"], name: "Kitoblar" },
];

function guessCategoryName(title) {
  const lower = title.toLowerCase();
  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.name;
    }
  }
  return null;
}

export default function AddListingCategory() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevState = location.state || {};
  const title = prevState.title || "";

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [suggested, setSuggested] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showOtherCategories, setShowOtherCategories] = useState(false);

  // Bosqichma-bosqich (drill-down) navigatsiya uchun: ichkariga "kirilgan"
  // ota-kategoriyalar shu massivda saqlanadi (breadcrumb).
  const [stack, setStack] = useState([]); // [{id, name}, ...]

  useEffect(() => {
    fetch(`${API_BASE}/api/products/categories/`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(data.results || data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    const guessedName = guessCategoryName(title);
    const match = guessedName
      ? categories.find((c) => c.name.toLowerCase() === guessedName.toLowerCase())
      : null;
    if (match) {
      setSuggested(match);
      setSelected(match.id);
    }
  }, [title, categories]);

  // Joriy darajaning ota-kategoriyasi (eng tepada — null)
  const currentParentId = stack.length ? stack[stack.length - 1].id : null;

  // Faqat joriy darajaga tegishli kategoriyalar (bola-kategoriyalar)
  const visibleCategories = categories.filter(
    (c) => (c.parent ?? null) === currentParentId
  );

  const hasChildren = (catId) => categories.some((c) => c.parent === catId);

  const handleRowClick = (cat) => {
    if (hasChildren(cat.id)) {
      // Ichki kategoriyasi bor — ichkariga "kirib", faqat uning bolalarini ko'rsatamiz
      setStack((prev) => [...prev, { id: cat.id, name: cat.name }]);
    } else {
      // Ichki kategoriyasi yo'q — bu yakuniy (leaf) kategoriya, uni tanlaymiz
      setSelected(cat.id);
    }
  };

  const handleBrowseBack = () => {
    setStack((prev) => prev.slice(0, -1));
  };

  const handleContinue = () => {
    const chosen = categories.find((c) => c.id === selected);
    navigate("/sotish/narx", {
      state: { ...prevState, category: selected || null, categoryName: chosen?.name || "" },
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "white", paddingBottom: 100 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px 8px",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          <ArrowLeft size={22} color="#1A1A1A" />
        </button>
        <button
          onClick={() => navigate("/sotish")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: COLORS.inkSoft,
            fontSize: 15,
          }}
        >
          Saqlash va chiqish
        </button>
      </div>

      <div style={{ padding: "12px 20px 0" }}>
        <h1
          style={{
            fontSize: 21,
            fontWeight: 800,
            margin: "0 0 6px",
            color: "#1A1A1A",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Kategoriyani tanlang
          <Sparkles size={18} color={COLORS.forest} />
        </h1>

        {suggested ? (
          <>
            <p style={{ fontSize: 14, color: COLORS.inkSoft, margin: "10px 0 10px" }}>
              Siz uchun tanlangan
            </p>
            <button
              onClick={() => setSelected(suggested.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "white",
                border: `1px solid ${selected === suggested.id ? COLORS.forest : COLORS.line}`,
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
                marginBottom: 12,
                textAlign: "left",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1A1A1A" }}>
                  {suggested.name}
                </div>
              </div>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: `2px solid ${selected === suggested.id ? COLORS.forest : COLORS.line}`,
                  background: selected === suggested.id ? COLORS.forest : "transparent",
                }}
              />
            </button>
          </>
        ) : (
          <p style={{ fontSize: 14, color: COLORS.inkSoft, margin: "10px 0 10px" }}>
            {loadingCategories
              ? "Kategoriyalar yuklanmoqda..."
              : "Sarlavha bo'yicha kategoriya aniqlanmadi, quyidan tanlang"}
          </p>
        )}

        <button
          onClick={() => {
            setShowOtherCategories((v) => !v);
            setStack([]); // toggle bosilganda har doim eng tepadan boshlaymiz
          }}
          style={{
            width: "100%",
            background: "#F1F1F1",
            border: "none",
            borderRadius: 14,
            padding: "14px 16px",
            fontSize: 14.5,
            fontWeight: 500,
            color: "#1A1A1A",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          Boshqa kategoriya
        </button>

        {showOtherCategories && (
          <div style={{ marginTop: 10 }}>
            {/* Ichkariga kirilgan bo'lsa — orqaga qaytish va joriy bo'lim nomi */}
            {stack.length > 0 && (
              <button
                onClick={handleBrowseBack}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  padding: "6px 2px 12px",
                  cursor: "pointer",
                  color: COLORS.forest,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                <ArrowLeft size={16} />
                {stack[stack.length - 1].name}
              </button>
            )}

            {categories.length === 0 && !loadingCategories && (
              <p style={{ fontSize: 13, color: COLORS.inkSoft }}>
                Hozircha kategoriyalar mavjud emas. Kategoriyasiz ham davom etishingiz mumkin.
              </p>
            )}

            {visibleCategories.map((c) => {
              const childExists = hasChildren(c.id);
              const isSelected = selected === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleRowClick(c)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "white",
                    border: `1px solid ${isSelected ? COLORS.forest : COLORS.line}`,
                    borderRadius: 14,
                    padding: "12px 16px",
                    cursor: "pointer",
                    marginBottom: 8,
                    textAlign: "left",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14.5, color: "#1A1A1A" }}>
                      {c.name}
                    </div>
                  </div>
                  {childExists ? (
                    <ChevronRight size={18} color={COLORS.inkSoft} />
                  ) : (
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: `2px solid ${isSelected ? COLORS.forest : COLORS.line}`,
                        background: isSelected ? COLORS.forest : "transparent",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              );
            })}

            {visibleCategories.length === 0 && categories.length > 0 && (
              <p style={{ fontSize: 13, color: COLORS.inkSoft, textAlign: "center", padding: 12 }}>
                Bu bo'limda kichik kategoriyalar yo'q
              </p>
            )}
          </div>
        )}
      </div>

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
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={handleContinue}
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
          }}
        >
          Davom ettirish
        </button>
      </div>
    </div>
  );
}
