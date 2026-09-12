export interface IPersonaAppearance {
  skinTone: string;
  skinShadow: string;
  hairColor: string;
  hairStyle: "short-styled" | "wavy-shoulder" | "modern-fade";
  clothingColor: string;
  clothingAccent: string;
  hasGlasses: boolean;
  glassesColor?: string;
  initials: string;
  accentGradient: string;
}

export const PERSONA_STYLES: Record<string, IPersonaAppearance> = {
  alex: {
    skinTone: "#F3D2B8",
    skinShadow: "#DEB597",
    hairColor: "#1E293B",
    hairStyle: "short-styled",
    clothingColor: "#1E3A8A",
    clothingAccent: "#3B82F6",
    hasGlasses: true,
    glassesColor: "#0F172A",
    initials: "AC",
    accentGradient: "from-blue-600/20 to-indigo-600/10",
  },
  sarah: {
    skinTone: "#FBD8BF",
    skinShadow: "#E5BD9E",
    hairColor: "#78350F",
    hairStyle: "wavy-shoulder",
    clothingColor: "#4C1D95",
    clothingAccent: "#8B5CF6",
    hasGlasses: false,
    initials: "SJ",
    accentGradient: "from-purple-600/20 to-pink-600/10",
  },
  jordan: {
    skinTone: "#D4A373",
    skinShadow: "#B88655",
    hairColor: "#262626",
    hairStyle: "modern-fade",
    clothingColor: "#065F46",
    clothingAccent: "#10B981",
    hasGlasses: false,
    initials: "JT",
    accentGradient: "from-emerald-600/20 to-teal-600/10",
  },
  default: {
    skinTone: "#F3D2B8",
    skinShadow: "#DEB597",
    hairColor: "#1E293B",
    hairStyle: "short-styled",
    clothingColor: "#1E293B",
    clothingAccent: "#64748B",
    hasGlasses: false,
    initials: "VI",
    accentGradient: "from-blue-600/20 to-slate-800/10",
  },
};

export const AvatarFace = ({
  name,
  appearance,
  isBlinking,
  effectiveSpeaking,
  mouthWidth,
  mouthHeight,
}: Readonly<{
  name: string;
  appearance: IPersonaAppearance;
  isBlinking: boolean;
  effectiveSpeaking: boolean;
  mouthWidth: number;
  mouthHeight: number;
}>) => (
  <div
    className={`relative z-10 flex h-56 w-48 items-center justify-center transition-transform duration-300 ease-out ${
      effectiveSpeaking ? "-translate-y-0.5 scale-[1.02]" : "scale-100"
    }`}
  >
    <svg
      className="size-full overflow-visible drop-shadow-2xl"
      fill="none"
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{name}</title>
      {/* Subtle shadow beneath interviewer */}
      <ellipse
        cx="100"
        cy="235"
        fill="#000000"
        fillOpacity="0.4"
        rx="75"
        ry="8"
      />

      {/* Shoulders & Clothing / Suit */}
      <path
        d="M 30 240 C 32 195 60 170 100 170 C 140 170 168 195 170 240 Z"
        fill={appearance.clothingColor}
      />

      {/* Inner Collar / Shirt */}
      <path
        d="M 82 170 L 100 205 L 118 170 Z"
        fill={appearance.clothingAccent}
        opacity="0.9"
      />
      <path d="M 88 170 L 100 195 L 112 170 Z" fill="#FFFFFF" />

      {/* Neck */}
      <rect
        fill={appearance.skinShadow}
        height="45"
        rx="12"
        width="24"
        x="88"
        y="130"
      />
      <path
        d="M 88 145 C 94 152 106 152 112 145 L 112 170 L 88 170 Z"
        fill={appearance.skinShadow}
        opacity="0.5"
      />

      {/* Head / Face */}
      <ellipse cx="100" cy="105" fill={appearance.skinTone} rx="42" ry="50" />

      {/* Cheeks subtle warmth */}
      <ellipse
        cx="75"
        cy="115"
        fill="#E11D48"
        fillOpacity="0.08"
        rx="8"
        ry="4"
      />
      <ellipse
        cx="125"
        cy="115"
        fill="#E11D48"
        fillOpacity="0.08"
        rx="8"
        ry="4"
      />

      {/* Hair Behind / Base */}
      {appearance.hairStyle === "wavy-shoulder" ? (
        <path
          d="M 52 100 C 48 135 55 175 70 185 C 65 160 62 130 65 105 Z"
          fill={appearance.hairColor}
        />
      ) : null}

      {/* Hair Crown */}
      {appearance.hairStyle === "short-styled" && (
        <path
          d="M 56 95 C 55 60 75 48 100 48 C 125 48 145 60 144 95 C 135 68 115 62 100 62 C 82 62 65 70 56 95 Z"
          fill={appearance.hairColor}
        />
      )}
      {appearance.hairStyle === "wavy-shoulder" && (
        <>
          <path
            d="M 54 95 C 52 55 76 46 100 46 C 124 46 148 55 146 95 C 136 65 116 58 100 58 C 80 58 64 68 54 95 Z"
            fill={appearance.hairColor}
          />
          <path
            d="M 148 100 C 152 135 145 175 130 185 C 135 160 138 130 135 105 Z"
            fill={appearance.hairColor}
          />
        </>
      )}
      {appearance.hairStyle === "modern-fade" && (
        <path
          d="M 58 92 C 57 58 78 50 100 50 C 122 50 142 58 142 92 C 136 66 118 60 100 60 C 80 60 64 68 58 92 Z"
          fill={appearance.hairColor}
        />
      )}

      {/* Eyebrows (composed, calm) */}
      <path
        d="M 72 88 Q 83 85 92 88"
        stroke={appearance.hairColor}
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        d="M 108 88 Q 117 85 128 88"
        stroke={appearance.hairColor}
        strokeLinecap="round"
        strokeWidth="2.5"
      />

      {/* Eyes (with natural procedural blink) */}
      {isBlinking ? (
        <>
          <path
            d="M 74 102 Q 83 105 90 102"
            stroke="#1E293B"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <path
            d="M 110 102 Q 117 105 126 102"
            stroke="#1E293B"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          {/* Left Eye */}
          <ellipse cx="82" cy="101" fill="#FFFFFF" rx="6" ry="5.5" />
          <circle cx="82.5" cy="101" fill="#0F172A" r="3.2" />
          <circle cx="84" cy="99.5" fill="#FFFFFF" r="1.2" />

          {/* Right Eye */}
          <ellipse cx="118" cy="101" fill="#FFFFFF" rx="6" ry="5.5" />
          <circle cx="117.5" cy="101" fill="#0F172A" r="3.2" />
          <circle cx="119" cy="99.5" fill="#FFFFFF" r="1.2" />
        </>
      )}

      {/* Glasses (if enabled for persona like Alex) */}
      {appearance.hasGlasses ? (
        <>
          <rect
            fill="none"
            height="18"
            rx="6"
            stroke={appearance.glassesColor}
            strokeWidth="2"
            width="24"
            x="70"
            y="92"
          />
          <rect
            fill="none"
            height="18"
            rx="6"
            stroke={appearance.glassesColor}
            strokeWidth="2"
            width="24"
            x="106"
            y="92"
          />
          <path
            d="M 94 100 L 106 100"
            stroke={appearance.glassesColor}
            strokeWidth="2"
          />
          <path
            d="M 70 98 L 60 96"
            stroke={appearance.glassesColor}
            strokeWidth="1.5"
          />
          <path
            d="M 130 98 L 140 96"
            stroke={appearance.glassesColor}
            strokeWidth="1.5"
          />
        </>
      ) : null}

      {/* Nose */}
      <path
        d="M 99 106 Q 100 116 97 119 Q 101 120 103 118"
        fill="none"
        stroke={appearance.skinShadow}
        strokeLinecap="round"
        strokeWidth="1.8"
      />

      {/* Mouth - Reactive Speech Lip Movement */}
      {effectiveSpeaking ? (
        <rect
          className="transition-all duration-75"
          fill="#881337"
          height={mouthHeight}
          rx={mouthHeight / 2}
          stroke="#9F1239"
          strokeWidth="1"
          width={mouthWidth}
          x={100 - mouthWidth / 2}
          y={130 - mouthHeight / 2}
        />
      ) : (
        /* Calm composed resting smile line */
        <path
          d="M 92 130 Q 100 133 108 130"
          fill="none"
          stroke="#9F1239"
          strokeLinecap="round"
          strokeWidth="2"
        />
      )}
    </svg>
  </div>
);
