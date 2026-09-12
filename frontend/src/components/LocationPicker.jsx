import { useState } from "react";
import { X, ChevronRight, ChevronLeft, MapPin, Check } from "lucide-react";

// O'zbekiston Respublikasining rasmiy ma'muriy-hududiy bo'linishi:
// 12 viloyat + 1 respublika (Qoraqalpog'iston) + 1 shahar (Toshkent) = 14 hudud,
// jami 175+ tuman/shahar. Ro'yxat to'liq holatda keltirilgan.
const REGIONS = [
  {
    name: "Toshkent shahri",
    districts: [
      "Bektemir", "Chilonzor", "Mirobod", "Mirzo Ulug'bek", "Olmazor",
      "Sergeli", "Shayxontohur", "Uchtepa", "Yakkasaroy", "Yangihayot",
      "Yashnobod", "Yunusobod",
    ],
  },
  {
    name: "Toshkent viloyati",
    districts: [
      "Nurafshon shahri", "Angren shahri", "Bekobod shahri", "Chirchiq shahri",
      "Olmaliq shahri", "Ohangaron shahri", "Yangiyo'l shahri",
      "Bekobod tumani", "Bo'ka", "Bo'stonliq", "Chinoz", "Ohangaron tumani",
      "Oqqo'rg'on", "Parkent", "Piskent", "Qibray", "Quyichirchiq",
      "Toshkent tumani", "Yangiyo'l tumani", "Yuqorichirchiq", "Zangiota",
      "O'rtachirchiq",
    ],
  },
  {
    name: "Samarqand",
    districts: [
      "Samarqand shahri", "Kattaqo'rg'on shahri",
      "Bulung'ur", "Ishtixon", "Jomboy", "Kattaqo'rg'on tumani", "Narpay",
      "Nurobod", "Oqdaryo", "Paxtachi", "Payariq", "Pastdarg'om",
      "Qo'shrabot", "Samarqand tumani", "Toyloq", "Urgut",
    ],
  },
  {
    name: "Buxoro",
    districts: [
      "Buxoro shahri", "Kogon shahri",
      "Buxoro tumani", "G'ijduvon", "Jondor", "Kogon tumani", "Olot",
      "Peshku", "Qorako'l", "Qorovulbozor", "Romitan", "Shofirkon",
      "Vobkent",
    ],
  },
  {
    name: "Farg'ona",
    districts: [
      "Farg'ona shahri", "Qo'qon shahri", "Marg'ilon shahri", "Quvasoy shahri",
      "Bag'dod", "Beshariq", "Buvayda", "Dang'ara", "Farg'ona tumani",
      "Furqat", "Oltiariq", "O'zbekiston tumani", "Qo'shtepa", "Quva",
      "Rishton", "So'x", "Toshloq", "Uchko'prik", "Yozyovon",
    ],
  },
  {
    name: "Andijon",
    districts: [
      "Andijon shahri", "Xonobod shahri",
      "Andijon tumani", "Asaka", "Baliqchi", "Bo'ston", "Buloqboshi",
      "Izboskan", "Jalaquduq", "Marhamat", "Oltinko'l", "Paxtaobod",
      "Qo'rg'ontepa", "Shahrixon", "Ulug'nor", "Xo'jaobod",
    ],
  },
  {
    name: "Namangan",
    districts: [
      "Namangan shahri",
      "Chortoq", "Chust", "Kosonsoy", "Mingbuloq", "Namangan tumani",
      "Norin", "Pop", "To'raqo'rg'on", "Uchqo'rg'on", "Uychi",
      "Yangiqo'rg'on",
    ],
  },
  {
    name: "Qashqadaryo",
    districts: [
      "Qarshi shahri", "Shahrisabz shahri",
      "Chiroqchi", "Dehqonobod", "G'uzor", "Kasbi", "Kitob", "Koson",
      "Mirishkor", "Muborak", "Nishon", "Qamashi", "Qarshi tumani",
      "Shahrisabz tumani", "Yakkabog'",
    ],
  },
  {
    name: "Surxondaryo",
    districts: [
      "Termiz shahri",
      "Angor", "Bandixon", "Boysun", "Denov", "Jarqo'rg'on", "Muzrabot",
      "Oltinsoy", "Qiziriq", "Qumqo'rg'on", "Sariosiyo", "Sherobod",
      "Sho'rchi", "Termiz tumani", "Uzun",
    ],
  },
  {
    name: "Navoiy",
    districts: [
      "Navoiy shahri", "Zarafshon shahri",
      "Karmana", "Konimex", "Navbahor", "Nurota", "Qiziltepa", "Tomdi",
      "Uchquduq", "Xatirchi",
    ],
  },
  {
    name: "Jizzax",
    districts: [
      "Jizzax shahri",
      "Arnasoy", "Baxmal", "Do'stlik", "Forish", "G'allaorol", "Mirzacho'l",
      "Paxtakor", "Sharof Rashidov", "Yangiobod", "Zafarobod", "Zarbdor",
      "Zomin",
    ],
  },
  {
    name: "Sirdaryo",
    districts: [
      "Guliston shahri", "Yangiyer shahri", "Shirin shahri",
      "Boyovut", "Guliston tumani", "Mirzaobod", "Oqoltin", "Sardoba",
      "Sayxunobod", "Sirdaryo tumani", "Xovos",
    ],
  },
  {
    name: "Xorazm",
    districts: [
      "Urganch shahri", "Xiva shahri",
      "Bog'ot", "Gurlan", "Hazorasp", "Qo'shko'pir", "Shovot",
      "Tuproqqal'a", "Urganch tumani", "Xiva tumani", "Xonqa", "Yangiariq",
      "Yangibozor",
    ],
  },
  {
    name: "Qoraqalpog'iston Respublikasi",
    districts: [
      "Nukus shahri",
      "Amudaryo", "Beruniy", "Bo'zatov", "Chimboy", "Ellikqal'a", "Kegeyli",
      "Mo'ynoq", "Nukus tumani", "Qanliko'l", "Qo'ng'irot", "Qorao'zak",
      "Shumanay", "Taxiatosh", "Taxtako'pir", "To'rtko'l", "Xo'jayli",
    ],
  },
];

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  zIndex: 300,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
};

const modalSheetStyle = {
  background: "white",
  width: "100%",
  maxWidth: 480,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  maxHeight: "75vh",
  display: "flex",
  flexDirection: "column",
};

const rowButtonStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 16px",
  border: "none",
  background: "none",
  fontSize: 15,
  color: "#1A1A1A",
  cursor: "pointer",
  textAlign: "left",
};

const highlightRowStyle = {
  ...rowButtonStyle,
  fontWeight: 700,
  color: "#2F6B4F",
};

function DefaultTrigger({ selectedLabel, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 4, color: "white", fontSize: 14, cursor: "pointer" }}
    >
      <MapPin size={16} />
      {selectedLabel}
    </div>
  );
}

export default function LocationPicker({ selectedLabel, onSelect, trigger }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("regions"); // "regions" | "districts"
  const [activeRegion, setActiveRegion] = useState(null);

  const handleClose = () => {
    setOpen(false);
    setStep("regions");
    setActiveRegion(null);
  };

  const handleBack = () => {
    setStep("regions");
    setActiveRegion(null);
  };

  const handleSelectAll = () => {
    onSelect({ label: "Barcha viloyatlar", region: null, district: null });
    handleClose();
  };

  const handleRegionClick = (region) => {
    setActiveRegion(region);
    setStep("districts");
  };

  const handleWholeRegion = () => {
    onSelect({ label: activeRegion.name, region: activeRegion.name, district: null });
    handleClose();
  };

  const handleDistrictClick = (district) => {
    onSelect({ label: `${activeRegion.name}, ${district}`, region: activeRegion.name, district });
    handleClose();
  };

  const openPicker = () => setOpen(true);

  return (
    <>
      {trigger ? (
        trigger({ selectedLabel, onClick: openPicker })
      ) : (
        <DefaultTrigger selectedLabel={selectedLabel} onClick={openPicker} />
      )}

      {open && (
        <div onClick={handleClose} style={modalOverlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalSheetStyle}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 16px 12px",
                borderBottom: "1px solid #E1DACB",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {step === "districts" && (
                  <button
                    onClick={handleBack}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}
                  >
                    <ChevronLeft size={22} />
                  </button>
                )}
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {step === "regions" ? "Viloyatni tanlang" : activeRegion.name}
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", padding: "8px 0" }}>
              {step === "regions" ? (
                <>
                  <button onClick={handleSelectAll} style={highlightRowStyle}>
                    Barcha viloyatlar
                    <Check size={18} />
                  </button>
                  <div style={{ borderTop: "1px solid #E1DACB" }} />
                  {REGIONS.map((region) => (
                    <button
                      key={region.name}
                      onClick={() => handleRegionClick(region)}
                      style={rowButtonStyle}
                    >
                      {region.name}
                      <ChevronRight size={18} color="#5B6459" />
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <button onClick={handleWholeRegion} style={highlightRowStyle}>
                    Butun {activeRegion.name}
                    <Check size={18} />
                  </button>
                  <div style={{ borderTop: "1px solid #E1DACB" }} />
                  {activeRegion.districts.map((district) => (
                    <button
                      key={district}
                      onClick={() => handleDistrictClick(district)}
                      style={rowButtonStyle}
                    >
                      {district}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
