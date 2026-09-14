import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Plus, Search, Phone, Send, MessageCircle, AlarmClock, Truck } from "lucide-react";
import { API_BASE, authFetch } from "../utils/auth";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  pink: "#B4126E",
  ink: "#1F2A1E",
  chipBg: "#F1F1F1",
  chipActive: "#1A1A1A",
  page: "#F5F5F5",http://localhost:8000
};

const MAX_IMAGES = 10;

const CONDITIONS = [
  { value: "Yangi", label: "Yangi" },
  { value: "Ishlatilgan", label: "Ishlatilgan" },
];

const AUDIENCES = [
  { value: "ayollar", label: "Ayollar uchun" },
  { value: "erkaklar", label: "Erkaklar uchun" },
  { value: "uniseks", label: "Uniseks" },
];

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "12px 18px",
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        fontSize: 14.5,
        fontWeight: 600,
        background: active ? COLORS.chipActive : COLORS.chipBg,
        color: active ? "white" : "#1A1A1A",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: value ? COLORS.forest : "#CFCFCF",
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
          left: value ? 20 : 2,
          transition: "left 0.15s",
        }}
      />
    </button>
  );
}

const textInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: COLORS.chipBg,
  border: "none",
  borderRadius: 14,
  padding: "14px 16px",
  fontSize: 15,
  outline: "none",
  color: "#1A1A1A",
  fontFamily: "inherit",
};

// Har bir bo'lim ustidagi karta: sarlavha, joriy qiymat va (bo'lsa) "O'zgartirish" tugmasi.
function SummaryCard({ title, onEdit, children }) {
  return (
    <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A" }}>{title}</div>
        {onEdit && (
          <button
            onClick={onEdit}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#2AA9E0", fontSize: 14.5, fontWeight: 600, padding: 0 }}
          >
            O'zgartirish
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// Pastdan chiqadigan tahrirlash varag'i (bottom sheet) — har bir bo'lim shu orqali tahrirlanadi.
function EditSheet({ title, onClose, onSave, children, saveDisabled }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 300,
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
          maxHeight: "88vh",
          overflowY: "auto",
          background: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ width: 40, height: 4, background: COLORS.line, borderRadius: 999, margin: "10px auto 6px", flexShrink: 0 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 16px 14px" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1A1A1A" }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={20} color={COLORS.ink} />
          </button>
        </div>
        <div style={{ padding: "0 16px", flex: 1 }}>{children}</div>
        <div style={{ padding: 16 }}>
          <button
            onClick={onSave}
            disabled={saveDisabled}
            style={{
              width: "100%",
              background: saveDisabled ? "#B7CFC0" : COLORS.forest,
              color: "white",
              border: "none",
              borderRadius: 14,
              padding: "15px 0",
              fontSize: 15.5,
              fontWeight: 700,
              cursor: saveDisabled ? "not-allowed" : "pointer",
            }}
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [activeSection, setActiveSection] = useState(null);
  const [draft, setDraft] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const galleryInputRef = useRef(null);

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
    ])
      .then(([productData, profileData]) => {
        const extra = productData.extra_info || {};
        setProduct(productData);
        setPhoneNumber(profileData?.phone_number || "");
        setForm({
          title: productData.title || "",
          description: productData.description || "",
          price: productData.price != null ? String(Number(productData.price)) : "",
          currency: extra.currency || "som",
          priceNegotiable: !!extra.priceNegotiable,
          condition: productData.condition || "Ishlatilgan",
          audience: extra.audience || null,
          attributeValues: (productData.attribute_values || []).map((a) => ({
            attribute_type: a.attribute_type,
            attribute_name: a.attribute_name,
            value: a.value,
          })),
          region: productData.region || "",
          landmark: extra.landmark || "",
          courierReady: !!extra.courierReady,
          contactName: extra.contactName || profileData?.username || "",
          phoneCall: !!extra.phoneCall,
          telegramChat: extra.telegramChat !== undefined ? !!extra.telegramChat : true,
          existingImages: productData.images || [],
          newImages: [],
          removedImageIds: [],
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openSection = (section) => {
    setDraft(JSON.parse(JSON.stringify(form)));
    setActiveSection(section);
  };
  const closeSection = () => {
    setActiveSection(null);
    setDraft(null);
  };
  const saveSection = () => {
    setForm(draft);
    setActiveSection(null);
    setDraft(null);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const totalNow = draft.existingImages.length + draft.newImages.length;
    const remainingSlots = MAX_IMAGES - totalNow;
    const accepted = files.slice(0, remainingSlots).map((file) => ({ file, url: URL.createObjectURL(file) }));
    setDraft((d) => ({ ...d, newImages: [...d.newImages, ...accepted] }));
    e.target.value = "";
  };

  const removeExistingImage = (imgId) => {
    setDraft((d) => ({
      ...d,
      existingImages: d.existingImages.filter((img) => img.id !== imgId),
      removedImageIds: [...d.removedImageIds, imgId],
    }));
  };

  const removeNewImage = (index) => {
    setDraft((d) => ({ ...d, newImages: d.newImages.filter((_, i) => i !== index) }));
  };

  const updateAttributeValue = (index, value) => {
    setDraft((d) => {
      const attributeValues = [...d.attributeValues];
      attributeValues[index] = { ...attributeValues[index], value };
      return { ...d, attributeValues };
    });
  };

  const handlePublish = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/kirish");
        return;
      }

      const finalPrice = form.priceNegotiable && !form.price ? 0 : Number(form.price || 0);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", String(finalPrice));
      formData.append("condition", form.condition);
      formData.append("region", form.region);
      // "Kuryer orqali yuborishga tayyor" tugmasi — haqiqiy `free_delivery`
      // maydoniga ham yozilishi kerak (avval faqat extra_info ichida
      // saqlanib, filtrga umuman ta'sir qilmas edi).
      formData.append("free_delivery", String(!!form.courierReady));
      formData.append(
        "extra_info",
        JSON.stringify({
          ...(product?.extra_info || {}),
          currency: form.currency,
          priceNegotiable: form.priceNegotiable,
          audience: form.audience,
          categoryName: product?.category_name || null,
          landmark: form.landmark,
          courierReady: form.courierReady,
          contactName: form.contactName,
          phoneCall: form.phoneCall,
          telegramChat: form.telegramChat,
        })
      );
      formData.append(
        "attribute_values",
        JSON.stringify(form.attributeValues.map((a) => ({ attribute_type: a.attribute_type, value: a.value })))
      );
      if (form.removedImageIds.length > 0) {
        formData.append("remove_image_ids", JSON.stringify(form.removedImageIds));
      }
      form.newImages.forEach((img) => {
        if (img.file) formData.append("images", img.file);
      });

      const res = await authFetch(`${API_BASE}/api/products/${id}/manage/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const firstKey = data ? Object.keys(data)[0] : null;
        const msg = firstKey ? (Array.isArray(data[firstKey]) ? data[firstKey][0] : String(data[firstKey])) : null;
        throw new Error(msg || "E'lonni saqlashda xatolik yuz berdi");
      }

      navigate(`/sotish/elon/${id}`);
    } catch (err) {
      setSubmitError(err.message || "E'lonni saqlashda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inkSoft }}>
        Yuklanmoqda...
      </div>
    );
  }

  if (error || !product || !form) {
    return (
      <div style={{ minHeight: "100vh", background: "white", padding: 20, textAlign: "center", color: "#C0392B" }}>
        Xatolik: {error || "E'lon topilmadi"}
      </div>
    );
  }

  const mainImageUrl = form.existingImages[0]
    ? resolveImageUrl(form.existingImages[0].image)
    : form.newImages[0]
    ? form.newImages[0].url
    : null;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.page, paddingBottom: 110 }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          background: "white",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ width: 22 }} />
        <div style={{ fontSize: 17, fontWeight: 700, color: "#1A1A1A" }}>Tahrirlash</div>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <X size={22} color={COLORS.ink} />
        </button>
      </div>

      <div style={{ padding: 16 }}>
        {/* Kategoriya — tahrirlanmaydi */}
        <SummaryCard title="Kategoriya">
          <div style={{ fontSize: 14.5, color: "#1A1A1A" }}>{product.category_name || "—"}</div>
        </SummaryCard>

        {/* Foto */}
        <SummaryCard title="Foto" onEdit={() => openSection("photo")}>
          {mainImageUrl ? (
            <img
              src={mainImageUrl}
              alt={form.title}
              style={{ width: 100, height: 100, borderRadius: 12, objectFit: "cover" }}
            />
          ) : (
            <div style={{ fontSize: 14.5, color: COLORS.inkSoft }}>Rasm yo'q</div>
          )}
        </SummaryCard>

        {/* Nomi */}
        <SummaryCard title="Nomi" onEdit={() => openSection("title")}>
          <div style={{ fontSize: 14.5, color: "#1A1A1A" }}>{form.title || "—"}</div>
        </SummaryCard>

        {/* Narx va shartlar */}
        <SummaryCard title="Narx va shartlar" onEdit={() => openSection("price")}>
          <div style={{ fontSize: 14.5, color: "#1A1A1A" }}>
            Narx: {form.priceNegotiable && !Number(form.price)
              ? "Kelishiladi"
              : `${Number(form.price || 0).toLocaleString("ru-RU")} ${form.currency === "som" ? "so'm" : "y.e."}`}
          </div>
        </SummaryCard>

        {/* Xususiyatlari */}
        <SummaryCard title="Xususiyatlari" onEdit={() => openSection("attributes")}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 14.5, color: "#1A1A1A" }}>
              <span style={{ color: COLORS.inkSoft }}>Holat: </span>
              {form.condition}
            </div>
            {form.attributeValues.map((a, i) => (
              <div key={i} style={{ fontSize: 14.5, color: "#1A1A1A" }}>
                <span style={{ color: COLORS.inkSoft }}>{a.attribute_name}: </span>
                {a.value}
              </div>
            ))}
          </div>
        </SummaryCard>

        {/* Tavsif */}
        <SummaryCard title="Tavsif" onEdit={() => openSection("description")}>
          <div style={{ fontSize: 14.5, color: "#1A1A1A", whiteSpace: "pre-wrap" }}>{form.description || "—"}</div>
        </SummaryCard>

        {/* Bitim joyi */}
        <SummaryCard title="Bitim joyi" onEdit={() => openSection("location")}>
          <div style={{ fontSize: 14.5, color: "#1A1A1A", marginBottom: 4 }}>{form.region || "—"}</div>
          <div style={{ fontSize: 13.5, color: COLORS.inkSoft, marginBottom: 12 }}>
            Mo'ljal: {form.landmark || "—"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: COLORS.chipBg,
              borderRadius: 14,
              padding: "10px 14px",
            }}
          >
            <Truck size={20} color={COLORS.forest} />
            <div style={{ flex: 1, fontSize: 14, color: "#1A1A1A" }}>Kuryer orqali yuborishga tayyor</div>
            <div
              style={{
                width: 36,
                height: 20,
                borderRadius: 999,
                background: form.courierReady ? COLORS.forest : "#CFCFCF",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "white",
                  position: "absolute",
                  top: 2,
                  left: form.courierReady ? 18 : 2,
                }}
              />
            </div>
          </div>
        </SummaryCard>

        {/* Aloqa usullari */}
        <SummaryCard title="Aloqa usullari" onEdit={() => openSection("contact")}>
          <div style={{ fontSize: 14.5, color: "#1A1A1A", marginBottom: 2 }}>
            <span style={{ color: COLORS.inkSoft }}>Ism: </span>
            {form.contactName || "—"}
          </div>
          <div style={{ fontSize: 14.5, color: "#1A1A1A", marginBottom: 12 }}>
            <span style={{ color: COLORS.inkSoft }}>Telefon: </span>
            {phoneNumber || "—"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, background: COLORS.chipBg, borderRadius: 14, padding: "10px 14px", marginBottom: 8 }}>
            <MessageCircle size={18} color="#2FAE5C" />
            <div style={{ flex: 1, fontSize: 14, color: "#1A1A1A" }}>Chat QaytaUz</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2FAE5C" }}>Yoqilgan</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: COLORS.chipBg, borderRadius: 14, padding: "10px 14px", marginBottom: 8 }}>
            <Phone size={18} color={COLORS.pink} />
            <div style={{ flex: 1, fontSize: 14, color: "#1A1A1A" }}>Telefon orqali qo'ng'iroq</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: form.phoneCall ? COLORS.forest : COLORS.inkSoft }}>
              {form.phoneCall ? "Yoqilgan" : "O'chirilgan"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: COLORS.chipBg, borderRadius: 14, padding: "10px 14px" }}>
            <Send size={16} color="#29A9E0" />
            <div style={{ flex: 1, fontSize: 14, color: "#1A1A1A" }}>Telegramda suhbat</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: form.telegramChat ? COLORS.forest : COLORS.inkSoft }}>
              {form.telegramChat ? "Yoqilgan" : "O'chirilgan"}
            </span>
          </div>
        </SummaryCard>

        {submitError && (
          <div style={{ color: "#C0392B", fontSize: 13.5, textAlign: "center", marginTop: 4 }}>{submitError}</div>
        )}
      </div>

      {/* Nashr qilish */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          padding: 16,
          background: COLORS.page,
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={handlePublish}
          disabled={submitting}
          style={{
            width: "100%",
            background: COLORS.pink,
            color: "white",
            border: "none",
            borderRadius: 14,
            padding: "16px 0",
            fontSize: 16,
            fontWeight: 700,
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Yuborilmoqda..." : "Nashr qilish"}
        </button>
      </div>

      {/* --- Tahrirlash varaqlari (bottom sheets) --- */}

      {activeSection === "photo" && draft && (
        <EditSheet title="Foto" onClose={closeSection} onSave={saveSection}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, paddingBottom: 16 }}>
            {draft.existingImages.map((img) => (
              <div key={img.id} style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 12, overflow: "hidden" }}>
                <img src={resolveImageUrl(img.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  onClick={() => removeExistingImage(img.id)}
                  style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <X size={13} color="white" />
                </button>
              </div>
            ))}
            {draft.newImages.map((img, i) => (
              <div key={`new-${i}`} style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 12, overflow: "hidden" }}>
                <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  onClick={() => removeNewImage(i)}
                  style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <X size={13} color="white" />
                </button>
              </div>
            ))}
            {draft.existingImages.length + draft.newImages.length < MAX_IMAGES && (
              <button
                onClick={() => galleryInputRef.current?.click()}
                style={{ aspectRatio: "1 / 1", borderRadius: 12, background: COLORS.chipBg, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Plus size={26} color="#1A1A1A" />
              </button>
            )}
          </div>
          <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: "none" }} />
        </EditSheet>
      )}

      {activeSection === "title" && draft && (
        <EditSheet title="Nomi" onClose={closeSection} onSave={saveSection} saveDisabled={!draft.title.trim()}>
          <input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="E'lon nomi"
            style={{ ...textInputStyle, marginBottom: 16 }}
          />
        </EditSheet>
      )}

      {activeSection === "price" && draft && (
        <EditSheet title="Narx va shartlar" onClose={closeSection} onSave={saveSection}>
          <div style={{ display: "flex", background: COLORS.chipBg, borderRadius: 14, padding: 4, marginBottom: 12 }}>
            <button
              onClick={() => setDraft((d) => ({ ...d, currency: "som" }))}
              style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 14.5, fontWeight: 700, background: draft.currency === "som" ? "white" : "transparent", color: "#1A1A1A" }}
            >
              So'm
            </button>
            <button
              onClick={() => setDraft((d) => ({ ...d, currency: "ye" }))}
              style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 14.5, fontWeight: 700, background: draft.currency === "ye" ? "white" : "transparent", color: "#1A1A1A" }}
            >
              y.e.
            </button>
          </div>

          <input
            type="text"
            inputMode="numeric"
            value={draft.price}
            onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value.replace(/\D/g, "") }))}
            disabled={draft.priceNegotiable}
            placeholder="0"
            style={{
              ...textInputStyle,
              marginBottom: 16,
              background: draft.priceNegotiable ? "#E7E7E7" : COLORS.chipBg,
              color: draft.priceNegotiable ? COLORS.inkSoft : "#1A1A1A",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.chipBg, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AlarmClock size={20} color={COLORS.forest} />
              <span style={{ fontSize: 14.5, color: "#1A1A1A" }}>Narxi kelishiladi</span>
            </div>
            <Toggle value={draft.priceNegotiable} onChange={(v) => setDraft((d) => ({ ...d, priceNegotiable: v }))} />
          </div>
        </EditSheet>
      )}

      {activeSection === "attributes" && draft && (
        <EditSheet title="Xususiyatlari" onClose={closeSection} onSave={saveSection}>
          <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 10, color: "#1A1A1A" }}>Holat</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
            {CONDITIONS.map((c) => (
              <Pill key={c.value} active={draft.condition === c.value} onClick={() => setDraft((d) => ({ ...d, condition: c.value }))}>
                {c.label}
              </Pill>
            ))}
          </div>

          <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 10, color: "#1A1A1A" }}>Kim uchun</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
            {AUDIENCES.map((a) => (
              <Pill key={a.value} active={draft.audience === a.value} onClick={() => setDraft((d) => ({ ...d, audience: a.value }))}>
                {a.label}
              </Pill>
            ))}
          </div>

          {draft.attributeValues.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {draft.attributeValues.map((a, i) => (
                <div key={i}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#1A1A1A" }}>{a.attribute_name}</div>
                  <input value={a.value} onChange={(e) => updateAttributeValue(i, e.target.value)} style={textInputStyle} />
                </div>
              ))}
            </div>
          )}
        </EditSheet>
      )}

      {activeSection === "description" && draft && (
        <EditSheet title="Tavsif" onClose={closeSection} onSave={saveSection}>
          <textarea
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder="E'lon haqida batafsil yozing"
            rows={8}
            style={{ ...textInputStyle, resize: "vertical", marginBottom: 16, lineHeight: 1.5 }}
          />
        </EditSheet>
      )}

      {activeSection === "location" && draft && (
        <EditSheet title="Bitim joyi" onClose={closeSection} onSave={saveSection} saveDisabled={!draft.region.trim()}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.chipBg, borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
            <Search size={18} color={COLORS.inkSoft} />
            <input
              value={draft.region}
              onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))}
              placeholder="O'zbekiston, shahar nomi"
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 15, width: "100%", color: "#1A1A1A" }}
            />
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#1A1A1A" }}>Belgilangan joy</div>
          <input
            value={draft.landmark}
            onChange={(e) => setDraft((d) => ({ ...d, landmark: e.target.value }))}
            placeholder="Masalan, Chorsu bozori"
            style={{ ...textInputStyle, marginBottom: 20 }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.chipBg, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Truck size={20} color={COLORS.forest} />
              <span style={{ fontSize: 14.5, color: "#1A1A1A" }}>Kuryer orqali yuborishga tayyor</span>
            </div>
            <Toggle value={draft.courierReady} onChange={(v) => setDraft((d) => ({ ...d, courierReady: v }))} />
          </div>
        </EditSheet>
      )}

      {activeSection === "contact" && draft && (
        <EditSheet
          title="Aloqa usullari"
          onClose={closeSection}
          onSave={saveSection}
          saveDisabled={!draft.contactName.trim() || (!draft.phoneCall && !draft.telegramChat)}
        >
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#1A1A1A" }}>Ism</div>
          <input
            value={draft.contactName}
            onChange={(e) => setDraft((d) => ({ ...d, contactName: e.target.value }))}
            placeholder="Ism"
            style={{ ...textInputStyle, marginBottom: 20 }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 14, background: COLORS.chipBg, borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2FAE5C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MessageCircle size={18} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "#1A1A1A" }}>Chat QaytaUz</div>
              <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>Sukut bo'yicha yoqilgan</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, background: COLORS.chipBg, borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.pink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Phone size={18} color="white" />
            </div>
            <div style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: "#1A1A1A" }}>Telefon orqali qo'ng'iroq qilish</div>
            <Toggle value={draft.phoneCall} onChange={(v) => setDraft((d) => ({ ...d, phoneCall: v }))} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, background: COLORS.chipBg, borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#29A9E0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Send size={16} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "#1A1A1A" }}>Telegramda suhbat</div>
              <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>raqam bo'yicha {phoneNumber}</div>
            </div>
            <Toggle value={draft.telegramChat} onChange={(v) => setDraft((d) => ({ ...d, telegramChat: v }))} />
          </div>

          {!draft.phoneCall && !draft.telegramChat && (
            <div style={{ fontSize: 13, color: "#C0392B", marginBottom: 8 }}>
              Kamida bitta bog'lanish usulini yoqing
            </div>
          )}
        </EditSheet>
      )}
    </div>
  );
}
