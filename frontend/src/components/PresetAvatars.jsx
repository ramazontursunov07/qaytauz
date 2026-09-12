// --- Umumiy "bust" asosi: yelka/kiyim + bo'yin + yuz ---
function Bust({ skin, cloth, children }) {
  return (
    <>
      <path d="M12 62c0-8 3-13 8-16h24c5 3 8 8 8 16" fill={cloth} />
      <rect x="26" y="33" width="12" height="12" fill={skin} />
      <circle cx="32" cy="25" r="13.5" fill={skin} />
      {children}
    </>
  );
}

function FaceDefault({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Bust skin="#AEB6AF" cloth="#C7CFC8" />
    </svg>
  );
}

function FacePinkBob({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Bust skin="#F2C6A0" cloth="#E8536F">
        <path
          d="M17 26c0-9 6.7-16 15-16s15 7 15 16c0 3-.5 6-1.5 8-1-6-3-9-13.5-9s-12.5 3-13.5 9c-1-2-1.5-5-1.5-8z"
          fill="#C23B6B"
        />
      </Bust>
    </svg>
  );
}

function FaceGreenCollarMan({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Bust skin="#E8B98A" cloth="#2F6B4F">
        <path
          d="M19 20c1-7 6-11 13-11s12 4 13 11c-3-2-8-3-13-3s-10 1-13 3z"
          fill="#8B4A2E"
        />
      </Bust>
    </svg>
  );
}

function FaceTubeteikaMan({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Bust skin="#E8B98A" cloth="#1F2A1E">
        <path d="M18 19a14 14 0 0 1 28 0v-3c0-6.5-6.3-10-14-10s-14 3.5-14 10z" fill="#181818" />
        <circle cx="26" cy="12" r="1.6" fill="white" />
        <circle cx="32" cy="10" r="1.6" fill="white" />
        <circle cx="38" cy="12" r="1.6" fill="white" />
        <path d="M25 34c2 2 5 2 7 0 2 2 5 2 7 0-1 3-4 4-7 4s-6-1-7-4z" fill="#2E2118" />
      </Bust>
    </svg>
  );
}

function FaceHijabWoman({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M10 62c0-17 9.8-29 22-29s22 12 22 29" fill="#C1668E" />
      <circle cx="32" cy="26" r="13.5" fill="#F2C6A0" />
      <path d="M16 26a16 16 0 0 1 32 0c0-11-7-19-16-19s-16 8-16 19z" fill="#C1668E" />
    </svg>
  );
}

function FaceScarfManGreen({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Bust skin="#E8B98A" cloth="#4E8B5C">
        <path d="M17 24a15 15 0 0 1 30 0c0-10-6.7-18-15-18s-15 8-15 18z" fill="#3B6E48" />
        <circle cx="47" cy="32" r="3" fill="#3B6E48" />
        <path d="M25 34c2 2 5 2 7 0 2 2 5 2 7 0-1 3-4 4-7 4s-6-1-7-4z" fill="#2E2118" />
      </Bust>
    </svg>
  );
}

function FacePurpleLongHair({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Bust skin="#F2C6A0" cloth="#6E4FA0">
        <path
          d="M14 44c-1-4-1-8 0-12 1-11 8-17 18-17s17 6 18 17c1 4 1 8 0 12-1-3-2-14-4-16-3 6-9 8-14 8s-11-2-14-8c-2 2-3 13-4 16z"
          fill="#5B2E7A"
        />
      </Bust>
    </svg>
  );
}

function FaceBlueShortHairMan({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Bust skin="#E8B98A" cloth="#4472C4">
        <path
          d="M18 18c1-7 6.4-11 14-11s13 4 14 11c-3-2.5-8-4-14-4s-11 1.5-14 4z"
          fill="#2E2118"
        />
      </Bust>
    </svg>
  );
}

function FaceOrangeScarfWoman({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Bust skin="#F2C6A0" cloth="#D98A3D">
        <path d="M16 25a16 16 0 0 1 32 0c0-11-7.2-19-16-19s-16 8-16 19z" fill="#E0923D" />
        <circle cx="24" cy="16" r="1.4" fill="white" />
        <circle cx="32" cy="13" r="1.4" fill="white" />
        <circle cx="40" cy="16" r="1.4" fill="white" />
      </Bust>
    </svg>
  );
}

function FaceBaldMustacheMan({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Bust skin="#E8B98A" cloth="#6B4F9E">
        <path d="M25 34c2 2 5 2 7 0 2 2 5 2 7 0-1 3-4 4-7 4s-6-1-7-4z" fill="#2E2118" />
      </Bust>
    </svg>
  );
}

function FaceRedBraidsWoman({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Bust skin="#F2C6A0" cloth="#B4372F">
        <path d="M17 22a15 15 0 0 1 30 0c-3-2-7-3-15-3s-12 1-15 3z" fill="#7A2A22" />
        <rect x="14" y="22" width="5" height="20" rx="2.5" fill="#7A2A22" />
        <rect x="45" y="22" width="5" height="20" rx="2.5" fill="#7A2A22" />
      </Bust>
    </svg>
  );
}

export function BigFace({ Face, size }) {
  return <Face size={size} />;
}

export const PRESET_AVATARS = [
  { id: "a1", bg: "#EDEDED", Face: FaceDefault },
  { id: "a2", bg: "#FBE1E8", Face: FacePinkBob },
  { id: "a3", bg: "#D9F0DA", Face: FaceGreenCollarMan },
  { id: "a4", bg: "#F6D9C6", Face: FaceTubeteikaMan },
  { id: "a5", bg: "#F2E1EC", Face: FaceHijabWoman },
  { id: "a6", bg: "#D9EAD9", Face: FaceScarfManGreen },
  { id: "a7", bg: "#E9DDF6", Face: FacePurpleLongHair },
  { id: "a8", bg: "#DCE8F7", Face: FaceBlueShortHairMan },
  { id: "a9", bg: "#FBE9D6", Face: FaceOrangeScarfWoman },
  { id: "a10", bg: "#E5DCF2", Face: FaceBaldMustacheMan },
  { id: "a11", bg: "#F9DCD9", Face: FaceRedBraidsWoman },
];

// Preset ID orqali avatarni topish uchun qulay funksiya
export function getPresetAvatar(id) {
  return PRESET_AVATARS.find((a) => a.id === id) || null;
}
