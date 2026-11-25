import { cn } from "@/lib/utils/cn";

export function JavaCupEmblem({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className={cn("w-12 h-12", className)}
      aria-hidden="true"
    >
      {/* Steam wisps */}
      <path
        d="M36 30C31 24 41 19 36 12"
        stroke="#ef4444"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M44 27C41 21 49 17 44 10"
        stroke="#f97316"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Cup body */}
      <path
        d="M23 36H52V47C52 55 45.5 60 37.5 60C29.5 60 23 55 23 47V36Z"
        fill="#e2e8f0"
        fillOpacity="0.92"
      />
      {/* Handle */}
      <path
        d="M52 39H56.5C59.8 39 62 41.4 62 44.5C62 47.6 59.8 50 56.5 50H52"
        stroke="#cbd5e1"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Saucer rings */}
      <ellipse
        cx="38"
        cy="63.5"
        rx="20"
        ry="3.6"
        stroke="#94a3b8"
        strokeWidth="2.5"
      />
      <ellipse
        cx="38"
        cy="67"
        rx="14"
        ry="2.2"
        stroke="#64748b"
        strokeWidth="2"
      />
    </svg>
  );
}

export function DashboardHeroArtwork() {
  return (
    <svg
      viewBox="0 0 360 200"
      fill="none"
      className="w-full max-w-[330px] h-auto select-none pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="laptopScreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16162e" />
          <stop offset="100%" stopColor="#0d0d1d" />
        </linearGradient>
      </defs>

      {/* Ambient curved ring */}
      <ellipse
        cx="195"
        cy="165"
        rx="145"
        ry="24"
        fill="url(#heroGlow)"
        opacity="0.45"
      />
      <path
        d="M45 148C105 92 220 55 340 62"
        stroke="#8b5cf6"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />

      {/* Floating code snippet card */}
      <rect
        x="18"
        y="74"
        width="64"
        height="46"
        rx="8"
        fill="#191933"
        stroke="#6366f1"
        strokeOpacity="0.35"
      />
      <rect x="27" y="85" width="32" height="4" rx="2" fill="#818cf8" opacity="0.7" />
      <rect x="27" y="94" width="44" height="4" rx="2" fill="#94a3b8" opacity="0.4" />
      <rect x="27" y="103" width="26" height="4" rx="2" fill="#94a3b8" opacity="0.4" />

      {/* Laptop screen */}
      <rect
        x="96"
        y="34"
        width="136"
        height="96"
        rx="10"
        fill="url(#laptopScreen)"
        stroke="#8b5cf6"
        strokeOpacity="0.55"
        strokeWidth="2"
      />
      <text
        x="164"
        y="90"
        textAnchor="middle"
        fill="#a78bfa"
        fontSize="28"
        fontWeight="700"
        fontFamily="monospace"
      >
        &lt;/&gt;
      </text>
      {/* Laptop base */}
      <path
        d="M84 134H244L258 149H70L84 134Z"
        fill="#334155"
        stroke="#64748b"
        strokeOpacity="0.5"
      />
      <rect x="148" y="142" width="32" height="3" rx="1.5" fill="#94a3b8" opacity="0.5" />

      {/* Java Mascot figure */}
      <g transform="translate(248, 42)">
        {/* Body */}
        <path
          d="M38 14L60 72C63 82 58 98 38 98C18 98 13 82 16 72L38 14Z"
          fill="#f8fafc"
        />
        {/* Dark cone top */}
        <path d="M38 10L54 52L22 52L38 10Z" fill="#111827" />
        {/* Red nose */}
        <circle cx="38" cy="46" r="9" fill="#ef4444" />
        {/* Arms */}
        <path
          d="M17 65C8 65 4 58 7 50"
          stroke="#1e293b"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M59 65C68 65 72 58 69 50"
          stroke="#1e293b"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function ProgressHeroArtwork() {
  return (
    <svg
      viewBox="0 0 240 130"
      fill="none"
      className="w-48 h-auto select-none pointer-events-none"
      aria-hidden="true"
    >
      <ellipse cx="135" cy="112" rx="85" ry="12" fill="#7c3aed" opacity="0.22" />
      <rect
        x="42"
        y="32"
        width="82"
        height="58"
        rx="10"
        fill="#16162d"
        stroke="#8b5cf6"
        strokeOpacity="0.45"
      />
      <text
        x="83"
        y="68"
        textAnchor="middle"
        fill="#a78bfa"
        fontSize="20"
        fontWeight="700"
        fontFamily="monospace"
      >
        &lt;/&gt;
      </text>
      {/* Books stack */}
      <rect x="132" y="92" width="62" height="11" rx="3" fill="#4f46e5" />
      <rect x="136" y="80" width="54" height="11" rx="3" fill="#3b82f6" />
      {/* Trophy */}
      <path
        d="M148 30H178V48C178 58 171 65 163 65C155 65 148 58 148 48V30Z"
        fill="#f59e0b"
      />
      <rect x="159" y="65" width="8" height="11" fill="#d97706" />
      <rect x="150" y="75" width="26" height="5" rx="2" fill="#b45309" />
    </svg>
  );
}
