/**
 * Decorative wave, node and network marks. Hidden from assistive tech.
 */
export function CoastalMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 640 420"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M-20 280 C 80 220, 140 340, 240 290 S 420 180, 520 250 S 680 360, 700 240"
        stroke="#4A6290"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <path
        d="M-10 310 C 90 250, 180 360, 280 310 S 430 220, 560 280"
        stroke="#FDC469"
        strokeWidth="0.8"
        opacity="0.85"
      />
      <path
        d="M40 90 C 160 40, 220 140, 320 100 S 480 20, 620 80"
        stroke="#FE7272"
        strokeWidth="0.7"
        opacity="0.45"
      />
      <circle cx="188" cy="248" r="3" fill="#FDC469" />
      <circle cx="318" cy="112" r="2.5" fill="#FDC469" />
      <circle cx="452" cy="236" r="2.2" fill="#F7F0E3" />
      <path
        d="M188 248 L 318 112 L 452 236"
        stroke="#FDC469"
        strokeWidth="0.5"
        opacity="0.55"
      />
      <circle cx="240" cy="70" r="46" stroke="#4A6290" strokeWidth="0.6" opacity="0.35" />
      <path d="M214 70 H266 M240 44 V96" stroke="#4A6290" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}
