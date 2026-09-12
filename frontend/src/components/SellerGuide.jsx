import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  ink: "#1A1A1A",
  inkSoft: "#5B6459",
};

const GUIDES = {
  sotish: {
    title: "Osongina sotish va daromad olish",
    steps: [
      "Mahsulotingizni tabiiy yorug'likda, iloji bo'lsa kunduzi, deraza yonida suratga oling — sun'iy yorug'lik rangni buzib ko'rsatishi mumkin.",
      "Kamida 4-5 ta rasm yuklang: oldi, orqasi, yon tomonlari va agar nuqson bo'lsa, aynan o'sha joyning yaqindan surati.",
      "Rasmga tushirishdan oldin mahsulotni tozalab, tartibga keltiring — chang bosgan yoki tartibsiz fon xaridorni chalg'itadi.",
      "Sarlavhaga faqat mahsulot nomi va asosiy xususiyatini yozing, masalan: \"iPhone 12, 128GB, ko'k\" — ortiqcha so'z yozmang.",
      "Tavsifda mahsulotning holatini halol tasvirlab bering: qachon sotib olingan, nega sotayapsiz, qanday nuqsonlari bor (agar bo'lsa).",
      "O'lcham, rang, model, ishlab chiqarilgan yil kabi texnik ma'lumotlarni to'liq kiriting — bu savollar sonini kamaytiradi.",
      "Narxni belgilashdan oldin, xuddi shunday mahsulotlarning boshqa e'lonlardagi narxini solishtirib chiqing.",
      "Juda past narx qo'ysangiz, xaridor \"nimadir noto'g'ri\" deb shubhalanishi mumkin, juda yuqori qo'ysangiz — umuman qiziqish bildirilmaydi.",
      "Agar kelishishga tayyor bo'lsangiz, buni tavsifda yoki e'londa aniq ko'rsating — bu ko'proq xaridor jalb qiladi.",
      "Kategoriya va subkategoriyani to'g'ri tanlang — noto'g'ri joylashtirilgan e'lon qidiruvda kam ko'rinadi.",
      "E'lon joylagandan keyin, birinchi bir necha soat ichida kelgan xabarlarga imkon qadar tezroq javob bering.",
      "Xaridor bilan muloqotda xushmuomala va aniq bo'ling — savollarga to'liq javob berish ishonchni oshiradi.",
      "Agar bir nechta kishi qiziqsa, birinchi bo'lib javob bergan va jiddiy niyatli xaridor bilan davom eting.",
      "Uchrashuv vaqtini va joyini oldindan aniq kelishib oling, kechikish yoki noaniqlikdan saqlaning.",
      "Savdo yakunlangach, e'lonni albatta \"Sotildi\" deb belgilang — bu boshqa xaridorlarning bekorga xabar yozishining oldini oladi.",
      "Agar mahsulot uzoq vaqt sotilmasa, narxni biroz pasaytirish yoki rasm/tavsifni yangilashni o'ylab ko'ring — bu e'lonni qayta \"jonlantiradi\".",
    ],
  },
  xavfsizlik: {
    title: "Sotuvchining xavfsizligi",
    steps: [
      "Hech qachon pulni oldindan, mahsulotni ko'rsatmasdan yoki topshirmasdan qabul qilmang.",
      "Uchrashuvni doim ochiq, odam ko'p bo'lgan joyda (savdo markazi, bozor, metro yonida) tashkil qiling — uyingizga notanish odamni taklif qilmang.",
      "Iloji bo'lsa, uchrashuvga yolg'iz bormang — do'st yoki oila a'zosi bilan boring, ayniqsa qimmatbaho buyum sotayotgan bo'lsangiz.",
      "Xaridor bilan uchrashuvdan oldin, telefon orqali gaplashib, uning haqiqiy niyatini his qilishga harakat qiling.",
      "Agar xaridor \"kuryer orqali yuboring\" yoki \"karta raqamingizni yuboring\" desa va bu sizga shubhali tuyulsa, ehtiyot bo'ling — bu ko'pincha firibgarlik belgisi.",
      "Haddan tashqari yuqori narx taklif qilingan yoki \"pulni oldin o'tkazib qo'yaman\" degan takliflarga ishonmang — bu klassik firibgarlik usuli.",
      "Agar to'lov karta orqali bo'lsa, pul haqiqatan tushganini bank ilovasi orqali tekshirib, keyingina mahsulotni bering.",
      "Shubhali skrinshot yoki \"to'lov cheki\"ga ishonmang — bunday narsalarni Photoshop orqali osongina soxtalashtirish mumkin.",
      "Shaxsiy ma'lumotlaringizni (pasport seriyasi, karta CVV kodi) hech kimga, hech qanday bahona bilan bermang.",
      "Agar suhbat davomida xaridor juda shoshilinch va bosim o'tkazayotgan bo'lsa (\"hozir yoki hech qachon\" kabi), bu — shubha uyg'otishi kerak bo'lgan holat.",
      "Qimmatbaho mahsulotlar uchun, agar imkoni bo'lsa, bank filiali yonida uchrashishni taklif qiling — bu yerda kameralar va xavfsizlik bor.",
      "Firibgarlikka duch kelsangiz yoki shubhali xatti-harakatni sezsangiz, albatta platformadagi \"Shikoyat qilish\" funksiyasidan foydalaning.",
      "O'z profilingizga haqiqiy telefon raqam va ma'lumot kiriting — bu xaridorlarga nisbatan ham sizning ishonchliligingizni oshiradi.",
      "Agar mahsulotni pochta orqali yubormoqchi bo'lsangiz, faqat rasmiy, kuzatuv raqami beriladigan xizmatlardan foydalaning.",
    ],
  },
};

export default function SellerGuide() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const guide = GUIDES[topic];

  if (!guide) {
    return (
      <div style={{ padding: 24, fontFamily: "Manrope, sans-serif" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none" }}>
          <ArrowLeft size={22} />
        </button>
        <p style={{ color: COLORS.inkSoft, marginTop: 20 }}>Qo'llanma topilmadi.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "white", paddingBottom: 40, fontFamily: "Manrope, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px 12px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          <ArrowLeft size={22} color={COLORS.ink} />
        </button>
        <h1 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: COLORS.ink }}>{guide.title}</h1>
      </div>

      <div style={{ padding: "8px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        {guide.steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              background: "#F7F9F7",
              borderRadius: 14,
              padding: 16,
            }}
          >
            <div
              style={{
                minWidth: 28,
                height: 28,
                borderRadius: "50%",
                background: COLORS.forest,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <p style={{ margin: 0, color: COLORS.ink, fontSize: 15, lineHeight: 1.6 }}>{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
