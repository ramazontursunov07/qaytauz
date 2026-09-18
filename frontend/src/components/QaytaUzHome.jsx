import { useState, useEffect } from "react";
import { Search, LayoutGrid, Heart, SlidersHorizontal } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import LocationPicker from "./LocationPicker";
import { API_BASE, authFetch, isLoggedIn, requireLogin } from "../utils/auth";
import { API_URL } from "../config";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  cream: "#FAF6EE",
};

// Backend nisbiy media manzil qaytaradi (masalan "/media/products/..."),
// shuni to'liq URL'ga aylantiramiz — QaytaUzFavorites.jsx'dagi bilan bir xil mantiq.
function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

// DIQQAT: "Yozgi to'plam" va "Abayalar va sharflar" uchun category ID'lari
// taxminiy qo'yilgan (7, 8) — Django admin orqali haqiqiy ID'larni tekshirib,
// shu yerga qo'ying.
const QUICK_FILTERS = [
  { label: "Yozgi to'plam", icon: "☀️", bg: "#FDECC8", params: { category: 7 } },
  { label: "Berib yuborishadi\n(Bepul)", icon: "🚚", bg: "#D6E8F5", params: { free_delivery: true } },
  { label: "Abayalar va\nsharflar", icon: "🧕", bg: "#F3DCE8", params: { category: 8 } },
  { label: "Narxi 50k\ngacha", icon: "🧸", bg: "#D7E3F6", params: { price_max: 50000 } },
  { label: "Narxi 100k\ngacha", icon: "👜", bg: "#F8D9DE", params: { price_max: 100000 } },
  { label: "Narxi 200k\ngacha", icon: "👟", bg: "#FBE3C6", params: { price_max: 200000 } },
  { label: "Narxi 300k\ngacha", icon: "👕", bg: "#E3D9F0", params: { price_max: 300000 } },
  { label: "Yangi\ne'lonlar", icon: "🆕", bg: "#DCEBDD", params: {} },
];

export default function QaytaUzHome() {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem("qaytauz_location");
    return saved
      ? JSON.parse(saved)
      : { label: "Toshkent", region: "Toshkent viloyati", district: null };
  });

  useEffect(() => {
    localStorage.setItem("qaytauz_location", JSON.stringify(location));
  }, [location]);

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  // "Filtrlar" sahifasidan (ProductFilters.jsx) qaytariladigan qo'shimcha
  // filtrlar: category, region, condition, price_min, price_max, free_delivery, ordering
  const [pageFilters, setPageFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  // product.id -> shu mahsulotga tegishli favorite yozuvining backend'dagi id'si.
  // Faqat login qilingan foydalanuvchi uchun to'ldiriladi.
  const [favoriteMap, setFavoriteMap] = useState({});
  const navigate = useNavigate();
  const routerLocation = useLocation();

  // Boshqa sahifadan (masalan mahsulot sahifasidagi "Yana ko'ring") kategoriya
  // tanlab kelingan bo'lsa, uni faollashtiramiz.
  useEffect(() => {
    if (routerLocation.state?.categoryId) {
      setActiveCategory(routerLocation.state.categoryId);
      setActiveFilter(null);
    }
    // "Filtrlar" sahifasidan "Ko'rsatish" bosilib qaytilgan bo'lsa
    if (routerLocation.state?.pageFilters) {
      setPageFilters(routerLocation.state.pageFilters);
      setActiveFilter(null);
    }
  }, [routerLocation.state]);

  useEffect(() => {
    fetch(`${API_URL}/api/products/categories/`)
      .then((res) => {
        if (!res.ok) throw new Error("Kategoriyalarni yuklab bo'lmadi");
        return res.json();
      })
      .then((data) => {
        setCategories(data.results || data);
      })
      .catch((err) => setError(err.message));
  }, []);

  // Qidiruv maydoniga yozilgan matnni 400ms kechikish bilan qo'llaymiz —
  // har bir harf uchun alohida so'rov yubormaslik uchun.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Kategoriya, tezkor filtr yoki qidiruv o'zgarsa — birinchi sahifadan
  // qaytadan boshlaymiz.
  useEffect(() => {
    setPage(1);
  }, [activeCategory, activeFilter, debouncedSearch, pageFilters]);

  useEffect(() => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    const params = new URLSearchParams();
    if (activeCategory) params.append("category", activeCategory);
    if (activeFilter) {
      Object.entries(activeFilter.params).forEach(([key, value]) => {
        params.append(key, value);
      });
    }
    // "Filtrlar" sahifasidan kelgan qiymatlar — mavjud bo'lsa qo'shiladi
    // (o'zaro bir xil kalit uchun oxirgi qo'shilgan qiymat ustun bo'ladi).
    Object.entries(pageFilters).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        params.set(key, value);
      }
    });
    if (debouncedSearch) params.append("search", debouncedSearch);
    params.append("page", String(page));

    fetch(`${API_BASE}/api/products/?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        const results = data.results || data;
        setProducts((prev) => (page === 1 ? results : [...prev, ...results]));
        setHasMore(!!data.next);
        setTotalCount(data.count ?? results.length);
        setLoading(false);
        setLoadingMore(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        setLoadingMore(false);
      });
  }, [activeCategory, activeFilter, debouncedSearch, pageFilters, page]);

  // Login qilingan bo'lsa, sevimlilar ro'yxatini yuklab, yurak ikonkasini
  // to'g'ri (bosilgan/bosilmagan) holatda ko'rsatish uchun xarita tuzamiz.
  useEffect(() => {
    if (!isLoggedIn()) {
      setFavoriteMap({});
      return;
    }
    authFetch(`${API_BASE}/api/favorites/`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = data.results || data || [];
        const map = {};
        list.forEach((f) => {
          map[f.product] = f.id;
        });
        setFavoriteMap(map);
      })
      .catch(() => {});
  }, []);

  const handleCategoryClick = (id) => {
    setActiveCategory(id);
    setActiveFilter(null);
  };

  const handleFilterClick = (filter) => {
    const isActive = activeFilter?.label === filter.label;
    setActiveFilter(isActive ? null : filter);
    setActiveCategory(null);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) setPage((p) => p + 1);
  };

  // Sevimlilarga qo'shish/o'chirish — aynan shu amal bosilgandagina
  // login talab qilinadi, sahifani ko'rish uchun emas.
  const handleToggleFavorite = (e, productId) => {
    e.stopPropagation();
    if (!requireLogin(navigate, "/")) return;

    const existingFavoriteId = favoriteMap[productId];
    if (existingFavoriteId) {
      authFetch(`${API_BASE}/api/favorites/delete/${existingFavoriteId}/`, { method: "DELETE" }).then((res) => {
        if (res.ok) {
          setFavoriteMap((prev) => {
            const next = { ...prev };
            delete next[productId];
            return next;
          });
        }
      });
    } else {
      authFetch(`${API_BASE}/api/favorites/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productId }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.id) {
            setFavoriteMap((prev) => ({ ...prev, [productId]: data.id }));
          }
        });
    }
  };

  return (
    <div style={{ background: COLORS.cream, minHeight: "100vh", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: 16 }}>
        <div
          style={{
            background: COLORS.forest,
            borderRadius: 20,
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: "white" }}>
              Qayta<span style={{ color: "#E8A87C" }}>Uz</span>
            </div>

            <LocationPicker selectedLabel={location.label} onSelect={setLocation} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                background: "white",
                borderRadius: 24,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flex: 1,
                minWidth: 0,
              }}
            >
              <Search size={18} color={COLORS.inkSoft} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setDebouncedSearch(searchQuery.trim());
                }}
                placeholder="Nima qidiryapsiz?"
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: 15,
                  flex: 1,
                  minWidth: 0,
                  background: "transparent",
                  color: "#08060d",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearch("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: COLORS.inkSoft,
                    fontSize: 18,
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>

            <button
              onClick={() => navigate("/filtrlar", { state: { pageFilters } })}
              style={{
                position: "relative",
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: "white",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <SlidersHorizontal size={18} color={COLORS.inkSoft} />
              {Object.keys(pageFilters).length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#B4126E",
                  }}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          padding: "0 16px 16px",
        }}
      >
        <button
          onClick={() => handleCategoryClick(null)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: activeCategory === null && !activeFilter ? COLORS.forest : "white",
            color: activeCategory === null && !activeFilter ? "white" : "#1A1A1A",
            border: `1px solid ${activeCategory === null && !activeFilter ? COLORS.forest : COLORS.line}`,
            borderRadius: 20,
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: "nowrap",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <LayoutGrid size={15} />
          Barchasi
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            style={{
              background: activeCategory === cat.id ? COLORS.forest : "white",
              color: activeCategory === cat.id ? "white" : "#1A1A1A",
              border: `1px solid ${activeCategory === cat.id ? COLORS.forest : COLORS.line}`,
              borderRadius: 20,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Quick filter tiles */}
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          padding: "0 16px 20px",
        }}
      >
        {QUICK_FILTERS.map((filter) => {
          const active = activeFilter?.label === filter.label;
          return (
            <button
              key={filter.label}
              onClick={() => handleFilterClick(filter)}
              style={{
                position: "relative",
                width: 128,
                height: 96,
                flexShrink: 0,
                background: filter.bg,
                border: active ? `2px solid ${COLORS.forest}` : "2px solid transparent",
                borderRadius: 16,
                padding: "12px",
                cursor: "pointer",
                textAlign: "left",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13.5,
                  color: "#1A1A1A",
                  lineHeight: 1.25,
                  whiteSpace: "pre-line",
                }}
              >
                {filter.label}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 10,
                  fontSize: 34,
                }}
              >
                {filter.icon}
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent listings */}
      <div style={{ padding: "0 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#1A1A1A" }}>
            {debouncedSearch ? `"${debouncedSearch}" bo'yicha natijalar` : "So'nggi e'lonlar"}
          </h2>
          {!debouncedSearch && (
            <span style={{ color: COLORS.forest, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Barchasi ›
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: COLORS.inkSoft, padding: 40 }}>
            Yuklanmoqda...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "#C0392B", padding: 40 }}>
            Xatolik: {error}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", color: COLORS.inkSoft, padding: 40 }}>
            {debouncedSearch ? "Hech narsa topilmadi" : "Hozircha e'lonlar yo'q"}
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 250px))",
                gap: 12,
              }}
            >
              {products.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/mahsulot/${product.id}`)}
                style={{
                  background: "white",
                  borderRadius: 16,
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <div style={{ background: "#EDEDED", aspectRatio: "1/1", position: "relative" }}>
                  {resolveImageUrl(product.main_image) && (
                    <img
                      src={resolveImageUrl(product.main_image)}
                      alt={product.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <button
                    onClick={(e) => handleToggleFavorite(e, product.id)}
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      background: "rgba(255,255,255,0.9)",
                      border: "none",
                      borderRadius: 9999,
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Heart
                      size={16}
                      color={favoriteMap[product.id] ? "#C1652F" : COLORS.inkSoft}
                      fill={favoriteMap[product.id] ? "#C1652F" : "none"}
                    />
                  </button>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                    {product.price?.toLocaleString()} so'm
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: COLORS.inkSoft,
                      marginBottom: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {product.title}
                  </div>
                  {product.region && (
                    <div
                      style={{
                        fontSize: 11.5,
                        color: COLORS.inkSoft,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.region}
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>

            <div style={{ textAlign: "center", padding: "20px 0 8px" }}>
              {hasMore ? (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    background: "white",
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 9999,
                    padding: "12px 28px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.forest,
                    cursor: loadingMore ? "not-allowed" : "pointer",
                  }}
                >
                  {loadingMore ? "Yuklanmoqda..." : "Yana yuklash"}
                </button>
              ) : (
                totalCount > 0 && (
                  <div style={{ fontSize: 13, color: COLORS.inkSoft }}>
                    Barcha {totalCount} ta e'lon ko'rsatildi
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
