import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, PenLine, Tag, MessageCircle, MapPin } from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  forestSoft: "#E3F0E5",
  inkSoft: "#5B6459",
  ink: "#1A1A1A",
  line: "#E1DACB",
};

const STEPS = [
  {
    icon: Camera,
    title: "Sifatli rasm oling",
    text: "Buyumni yaxshi yorug'likda, turli burchaklardan suratga oling. Aniq rasm xaridorning ishonchini oshiradi.",
  },
  {
    icon: PenLine,
    title: "Aniq va halol tavsif yozing",
    text: "Buyumning holati, nuqsonlari (agar bo'lsa), o'lchami va boshqa muhim tafsilotlarni yashirmasdan yozing.",
  },
  {
    icon: Tag,
    title: "Adolatli narx qo'ying",
    text: "Shunga o'xshash e'lonlarni ko'rib chiqing va bozor narxiga mos narx belgilang. Bu tezroq sotilishga yordam beradi.",
  },
  {
    icon: MessageCircle,
    title: "Xabarlarga tez javob bering",
    text: "Xaridorlar tez javob beradigan sotuvchilarga ko'proq ishonishadi va xarid qilish ehtimoli oshadi.",
  },
  {
    icon: MapPin,
    title: "Xavfsiz joyda uchrashing",
    text: "Ochiq va odam ko'p joyda uchrashing, iloji bo'lsa kunduzi. To'lovni buyumni tekshirgandan keyin qabul qiling.",
  },
];

const CATEGORIES = [
  "Elektronika (telefon, noutbuk, planshet)",
  "Kiyim-kechak va poyabzal",
  "Mebel va uy jihozlari",
  "Bolalar buyumlari va o'yinchoqlar",
  "Kitoblar va o'quv qurollari",
  "Sport va dam olish anjomlari",
  "Avtomobil ehtiyot qismlari",
  "Go'zallik va parvarish vositalari",
  "Uy hayvonlari uchun buyumlar",
  "Hunarmandchilik va qo'lda yasalgan buyumlar",
];

export default function SellingGuide() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "white", paddingBottom: 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 20px 12px",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          <ArrowLeft size={22} color={COLORS.ink} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: COLORS.ink }}>
          Sotish va daromad olish
        </h1>
      </div>

      <div style={{ padding: "8px 20px 0" }}>
        <p style={{ fontSize: 14.5, color: COLORS.inkSoft, lineHeight: 1.6, margin: "4px 0 24px" }}>
          Ishlatilmayotgan buyumlaringizni sotib, qo'shimcha daromad topishingiz mumkin.
          Quyidagi maslahatlarga amal qilsangiz, e'loningiz tezroq va yaxshiroq narxda sotiladi.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={i} style={{ display: "flex", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: COLORS.forestSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={22} color={COLORS.forest} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.ink, marginBottom: 4 }}>
                  {title}
                </div>
                <div style={{ fontSize: 13.5, color: COLORS.inkSoft, lineHeight: 1.5 }}>
                  {text}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: `1px solid ${COLORS.line}`,
            paddingTop: 20,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 800, color: COLORS.ink, margin: "0 0 6px" }}>
            Nimalarni sotish mumkin?
          </h2>
          <p style={{ fontSize: 13.5, color: COLORS.inkSoft, margin: "0 0 14px" }}>
            QaytaUz'da ishlatilgan yoki yangi holatdagi deyarli har qanday buyumni sotishingiz mumkin, masalan:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CATEGORIES.map((c) => (
              <div
                key={c}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#F7F4EE",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 14,
                  color: COLORS.ink,
                }}
              >
                <span style={{ color: COLORS.forest, fontWeight: 800 }}>✓</span>
                {c}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 14, lineHeight: 1.5 }}>
            Taqiqlangan yoki xavfli buyumlarni (qurol, dori-darmon, kontrafakt mahsulotlar va h.k.)
            joylashtirish mumkin emas.
          </p>
        </div>
      </div>
    </div>
  );
}
