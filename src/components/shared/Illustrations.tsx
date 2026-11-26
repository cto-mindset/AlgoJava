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
        fill="var(--text-primary)"
        fillOpacity="0.88"
      />
      {/* Handle */}
      <path
        d="M52 39H56.5C59.8 39 62 41.4 62 44.5C62 47.6 59.8 50 56.5 50H52"
        stroke="var(--text-secondary)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Saucer rings */}
      <ellipse
        cx="38"
        cy="63.5"
        rx="20"
        ry="3.6"
        stroke="var(--text-secondary)"
        strokeWidth="2.4"
      />
      <ellipse
        cx="38"
        cy="67"
        rx="14"
        ry="2.2"
        stroke="var(--text-muted)"
        strokeWidth="2"
      />
    </svg>
  );
}

export function DashboardHeroArtwork() {
  return (
    <svg
      viewBox="0 0 380 210"
      fill="none"
      className="w-full max-w-[350px] h-auto select-none pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroCardGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      {/* Subtle backdrop aura */}
      <ellipse
        cx="198"
        cy="178"
        rx="146"
        ry="20"
        fill="url(#heroCardGlow)"
      />
      <path
        d="M36 164C108 106 232 62 356 68"
        stroke="var(--accent-light)"
        strokeOpacity="0.22"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />

      {/* Primary IDE Editor Window */}
      <rect
        x="72"
        y="24"
        width="244"
        height="148"
        rx="14"
        fill="var(--bg-editor)"
        stroke="var(--accent-border)"
        strokeOpacity="0.65"
        strokeWidth="1.5"
      />
      {/* Editor Window Header */}
      <path
        d="M72 38C72 30.268 78.268 24 86 24H302C309.732 24 316 30.268 316 38V50H72V38Z"
        fill="var(--bg-surface-elevated)"
      />
      <line
        x1="72"
        y1="50"
        x2="316"
        y2="50"
        stroke="var(--border-subtle)"
      />
      <circle cx="90" cy="37" r="3.5" fill="#fb7185" fillOpacity="0.85" />
      <circle cx="102" cy="37" r="3.5" fill="#fbbf24" fillOpacity="0.85" />
      <circle cx="114" cy="37" r="3.5" fill="#34d399" fillOpacity="0.85" />
      <rect
        x="154"
        y="31"
        width="80"
        height="12"
        rx="4"
        fill="var(--bg-input)"
        stroke="var(--border-subtle)"
      />
      <text
        x="194"
        y="40"
        textAnchor="middle"
        fill="var(--text-secondary)"
        fontSize="7.5"
        fontWeight="600"
        fontFamily="var(--font-mono)"
      >
        Solution.java
      </text>

      {/* Gutter */}
      <rect
        x="73"
        y="51"
        width="28"
        height="120"
        rx="0"
        fill="var(--bg-editor-gutter)"
      />
      <text
        x="87"
        y="71"
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize="8.5"
        fontFamily="var(--font-mono)"
      >
        1
      </text>
      <text
        x="87"
        y="89"
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize="8.5"
        fontFamily="var(--font-mono)"
      >
        2
      </text>
      <text
        x="87"
        y="107"
        textAnchor="middle"
        fill="var(--accent-light)"
        fontSize="8.5"
        fontWeight="700"
        fontFamily="var(--font-mono)"
      >
        3
      </text>
      <text
        x="87"
        y="125"
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize="8.5"
        fontFamily="var(--font-mono)"
      >
        4
      </text>
      <text
        x="87"
        y="143"
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize="8.5"
        fontFamily="var(--font-mono)"
      >
        5
      </text>

      {/* Active line highlight */}
      <rect
        x="101"
        y="96"
        width="214"
        height="16"
        fill="var(--accent-soft)"
      />

      {/* Stylized Java Syntax Lines */}
      <rect x="114" y="65" width="38" height="6" rx="3" fill="var(--code-keyword)" opacity="0.88" />
      <rect x="158" y="65" width="52" height="6" rx="3" fill="var(--code-type)" opacity="0.85" />

      <rect x="128" y="83" width="32" height="6" rx="3" fill="var(--code-keyword)" opacity="0.88" />
      <rect x="166" y="83" width="22" height="6" rx="3" fill="var(--code-fn)" opacity="0.88" />
      <rect x="194" y="83" width="64" height="6" rx="3" fill="var(--code-text)" opacity="0.55" />

      <rect x="142" y="101" width="36" height="6" rx="3" fill="var(--code-keyword)" opacity="0.95" />
      <rect x="184" y="101" width="76" height="6" rx="3" fill="var(--code-string)" opacity="0.85" />

      <rect x="128" y="119" width="16" height="6" rx="3" fill="var(--code-text)" opacity="0.5" />
      <rect x="114" y="137" width="16" height="6" rx="3" fill="var(--code-text)" opacity="0.5" />

      {/* Floating Test Pass Pill (bottom-right) */}
      <rect
        x="230"
        y="142"
        width="124"
        height="34"
        rx="10"
        fill="var(--bg-surface-elevated)"
        stroke="var(--status-success-border)"
        strokeWidth="1.2"
      />
      <circle cx="249" cy="159" r="7" fill="var(--status-success-soft)" />
      <path
        d="M245.5 159L248 161.5L252.5 156.5"
        stroke="var(--status-success)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="263"
        y="162"
        fill="var(--text-primary)"
        fontSize="9.5"
        fontWeight="600"
        fontFamily="var(--font-sans)"
      >
        Tests Passed
      </text>

      {/* Floating Code Chip (left) */}
      <rect
        x="18"
        y="94"
        width="74"
        height="46"
        rx="10"
        fill="var(--bg-surface-elevated)"
        stroke="var(--accent-border)"
        strokeWidth="1.2"
      />
      <text
        x="55"
        y="122"
        textAnchor="middle"
        fill="var(--accent-light)"
        fontSize="16"
        fontWeight="700"
        fontFamily="var(--font-mono)"
      >
        &lt;/&gt;
      </text>
    </svg>
  );
}

export function ProgressHeroArtwork() {
  return (
    <svg
      viewBox="0 0 240 120"
      fill="none"
      className="w-48 h-auto select-none pointer-events-none"
      aria-hidden="true"
    >
      <ellipse cx="128" cy="102" rx="88" ry="12" fill="var(--accent-primary)" opacity="0.16" />

      {/* Metric Card */}
      <rect
        x="26"
        y="22"
        width="104"
        height="68"
        rx="11"
        fill="var(--bg-editor)"
        stroke="var(--accent-border)"
        strokeOpacity="0.65"
        strokeWidth="1.4"
      />
      <rect x="42" y="62" width="12" height="16" rx="3" fill="var(--accent-soft)" stroke="var(--accent-border)" />
      <rect x="60" y="50" width="12" height="28" rx="3" fill="var(--accent-primary)" opacity="0.7" />
      <rect x="78" y="38" width="12" height="40" rx="3" fill="var(--accent-light)" />
      <rect x="96" y="44" width="12" height="34" rx="3" fill="var(--status-success)" opacity="0.85" />

      {/* Trophy */}
      <rect
        x="148"
        y="76"
        width="56"
        height="9"
        rx="3"
        fill="var(--bg-surface-elevated)"
        stroke="var(--border-default)"
      />
      <path
        d="M160 28H192V47C192 56.5 184.5 64 176 64C167.5 64 160 56.5 160 47V28Z"
        fill="#f59e0b"
      />
      <path
        d="M160 34H154C151.5 34 150 36 150 39C150 42.5 152.5 45 156 45H160"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M192 34H198C200.5 34 202 36 202 39C202 42.5 199.5 45 196 45H192"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="172" y="64" width="8" height="10" fill="#d97706" />
      <rect x="163" y="72" width="26" height="4" rx="2" fill="#b45309" />
    </svg>
  );
}
