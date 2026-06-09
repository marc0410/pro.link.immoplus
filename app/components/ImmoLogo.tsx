import Image from "next/image";

/* ─── IMMO+ App Logo Components ─────────────────────────────── */

/**
 * Full square logo — uses the real brand JPG.
 * rounded=true → coins arrondis (pour icônes, avatars, etc.)
 */
export function ImmoLogoSquare({
  size = 120,
  rounded = false,
}: {
  size?: number;
  rounded?: boolean;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: rounded ? size * 0.22 : 0,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <Image
        src="/hui.jpg"
        alt="IMMO+ App"
        width={size}
        height={size}
        style={{ objectFit: "cover", width: "100%", height: "100%" }}
        priority
      />
    </div>
  );
}

/**
 * Compact nav logo — image arrondie + wordmark «IMMO+ Pro».
 */
export function ImmoLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Logo image arrondi */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Image
          src="/hui.jpg"
          alt="IMMO+"
          width={32}
          height={32}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
          priority
        />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className="text-[13px] font-bold tracking-tight text-[#111111]">
          IMMO<span style={{ color: "#2537DE" }}>+</span>
        </span>
        <span
          className="text-[9px] font-semibold tracking-widest uppercase"
          style={{ color: "#2537DE" }}
        >
          Pro
        </span>
      </div>
    </div>
  );
}
