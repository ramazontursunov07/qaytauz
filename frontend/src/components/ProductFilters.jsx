import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, X, Navigation } from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  pink: "#B4126E",
  ink: "#1A1A1A",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  chipBg: "#F1F1F1",
};

const CONDITIONS = [
  { value: "", label: "Hamma" },
  { value: "Yangi", label: "Yangi" },
  { value: "Ishlatilgan", label: "Ishlatilgan" },
];

const SORT_OPTIONS = [
  { value: "", label: "Tavsiya etilgan" },
  { value: "-created_at", label: "Sana bo'yicha" },
  { value: "price", label: "Avvaliga arzonroq" },
  { value: "-price", label: "Avvaliga qimmatroq" },
];

function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px",
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        fontSize: 13.5,
        fontWeight: 600,
        background: active ? COLORS.ink : COLORS.chipBg,
        color: active ? "white" : COLORS.ink,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export default function ProductFilters() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const prevFilters = routerLocation.state?.pageFilters || {};

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(prevFilters.category || "");
  const [region, setRegion] = useState(prevFilters.region || "");
  const [condition, setCondition] = useState(prevFilters.condition || "");
  const [priceMin, setPriceMin] = useState(prevFilters.price_min || "");
  const [priceMax, setPriceMax] = useState(prevFilters.price_max || "");
  const [freeDelivery, setFreeDelivery] = useState(prevFilters.free_delivery === "true" || prevFilters.free_delivery === true);
  const [ordering, setOrdering] = useState(prevFilters.ordering || "");

  useEffect(() => {
    fetch("http://localhost:8000/api/products/categories/")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(data.results || data))
      .catch(() => {});
  }, []);

  const handleReset = () => {
    setCategoryId("");
    setRegion("");
    setCondition("");
    setPriceMin("");
    setPriceMax("");
    setFreeDelivery(false);
    setOrdering("");
  };

  const handleShow = () => {
    const pageFilters = {};
    if (categoryId) pageFilters.category = categoryId;
    if (region.trim()) pageFilters.region = region.trim();
    if (condition) pageFilters.condition = condition;
    if (priceMin) pageFilters.price_min = priceMin;
    if (priceMax) pageFilters.price_max = priceMax;
    if (freeDelivery) pageFilters.free_delivery = true;
    if (ordering) pageFilters.ordering = ordering;

    navigate("/", { state: { pageFilters } });
  };

  return (
    <div style={{ minHeight: "100vh", background: "white", paddingBottom: 100 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px",
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ArrowLeft size={22} color={COLORS.ink} />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: COLORS.ink }}>Filtrlar</h1>
        <button
          onClick={handleReset}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#2A7DE1" }}
        >
          Tozalash
        </button>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* Kategoriya */}
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: COLORS.ink }}>Kategoriya</div>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: COLORS.chipBg,
            border: "none",
            borderRadius: 14,
            padding: "14px 16px",
            fontSize: 14.5,
            color: COLORS.ink,
            marginBottom: 24,
            appearance: "auto",
          }}
        >
          <option value="">Barcha kategoriyalar</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Qayerdan qidirish */}
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: COLORS.ink }}>Qayerdan qidirish?</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: COLORS.chipBg,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 24,
          }}
        >
          <Navigation size={17} color={COLORS.inkSoft} />
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Masalan: Toshkent"
            style={{ border: "none", outline: "none", background: "transparent", fontSize: 14.5, width: "100%", color: COLORS.ink }}
          />
          {region && (
            <button onClick={() => setRegion("")} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <X size={16} color={COLORS.inkSoft} />
            </button>
          )}
        </div>

        {/* Holat */}
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: COLORS.ink }}>Holat</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {CONDITIONS.map((c) => (
            <Pill key={c.value} active={condition === c.value} onClick={() => setCondition(c.value)}>
              {c.label}
            </Pill>
          ))}
        </div>

        {/* Narx oralig'i */}
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: COLORS.ink }}>Narx, so'm</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <input
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="...dan"
            style={{
              flex: 1,
              boxSizing: "border-box",
              background: COLORS.chipBg,
              border: "none",
              borderRadius: 14,
              padding: "14px 16px",
              fontSize: 14.5,
              color: COLORS.ink,
            }}
          />
          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="...gacha"
            style={{
              flex: 1,
              boxSizing: "border-box",
              background: COLORS.chipBg,
              border: "none",
              borderRadius: 14,
              padding: "14px 16px",
              fontSize: 14.5,
              color: COLORS.ink,
            }}
          />
        </div>

        {/* Yetkazib berish */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: COLORS.chipBg,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: COLORS.ink }}>Yetkazib berish mavjud</div>
            <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>Sotuvchi tovarni kuryer orqali yuborishga tayyor</div>
          </div>
          <button
            onClick={() => setFreeDelivery((v) => !v)}
            style={{
              width: 40,
              height: 22,
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: freeDelivery ? COLORS.forest : "#CFCFCF",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "white",
                position: "absolute",
                top: 2,
                left: freeDelivery ? 20 : 2,
                transition: "left 0.15s",
              }}
            />
          </button>
        </div>

        {/* Saralash */}
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: COLORS.ink }}>Saralash</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SORT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 4px",
                cursor: "pointer",
                fontSize: 14.5,
                color: COLORS.ink,
              }}
            >
              {opt.label}
              <input
                type="radio"
                name="ordering"
                checked={ordering === opt.value}
                onChange={() => setOrdering(opt.value)}
                style={{ width: 18, height: 18, accentColor: COLORS.ink }}
              />
            </label>
          ))}
        </div>
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
          borderTop: `1px solid ${COLORS.line}`,
        }}
      >
        <button
          onClick={handleShow}
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
          }}
        >
          Ko'rsatish
        </button>
      </div>
    </div>
  );
}
