/** Full-bleed production-system visual for the hero plane. */
export default function HeroVisual() {
  return (
    <svg
      className="hero-visual"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e7f2ed" />
          <stop offset="48%" stopColor="#f3f8f5" />
          <stop offset="100%" stopColor="#cfe3db" />
        </linearGradient>
        <linearGradient id="panelFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#11554c" />
          <stop offset="100%" stopColor="#0b3d38" />
        </linearGradient>
        <linearGradient id="signal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6fcbb9" stopOpacity="0" />
          <stop offset="45%" stopColor="#6fcbb9" />
          <stop offset="100%" stopColor="#6fcbb9" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1440" height="900" fill="url(#heroSky)" />
      <circle cx="1220" cy="210" r="250" fill="#95d4c5" opacity="0.28" />
      <circle cx="980" cy="720" r="190" fill="#0b3d38" opacity="0.06" />

      {/* Keep composition on the right half so copy stays clean */}
      <g stroke="#0b3d38" strokeOpacity="0.14" strokeWidth="1.6" fill="none">
        <path d="M760 560 C860 500, 900 430, 980 390" />
        <path d="M980 390 C1080 340, 1140 300, 1240 270" />
        <path d="M980 390 C1060 470, 1140 520, 1260 560" />
        <path d="M1260 560 C1300 620, 1280 690, 1220 760" />
      </g>

      <g stroke="url(#signal)" strokeWidth="2.6" fill="none" className="hero-signal">
        <path d="M760 560 C860 500, 900 430, 980 390 C1080 340, 1140 300, 1240 270" />
        <path d="M980 390 C1060 470, 1140 520, 1260 560 C1300 620, 1280 690, 1220 760" />
      </g>

      <g className="hero-node">
        <rect x="690" y="520" width="158" height="86" rx="14" fill="#ffffff" stroke="#0b3d38" strokeOpacity="0.16" />
        <text x="712" y="556" fill="#0a1f1c" fontSize="14" fontFamily="Figtree, sans-serif" fontWeight="700">Sources</text>
        <text x="712" y="580" fill="#3f544e" fontSize="13" fontFamily="Figtree, sans-serif">APIs · files · DBs</text>
      </g>

      <g className="hero-node hero-node-main">
        <rect x="900" y="300" width="268" height="168" rx="18" fill="url(#panelFill)" />
        <text x="928" y="340" fill="#6fcbb9" fontSize="12" fontFamily="Figtree, sans-serif" fontWeight="800" letterSpacing="1.6">PIPELINE</text>
        <text x="928" y="374" fill="#f7fcfa" fontSize="24" fontFamily="Bricolage Grotesque, sans-serif" fontWeight="700">Model · test · alert</text>
        <text x="928" y="404" fill="#c5ddd5" fontSize="14" fontFamily="Figtree, sans-serif">Fresh data with quality gates</text>
        <g transform="translate(928 432)">
          <rect width="58" height="8" rx="4" fill="#6fcbb9" opacity="0.95" />
          <rect x="68" width="78" height="8" rx="4" fill="#6fcbb9" opacity="0.45" />
          <rect x="156" width="42" height="8" rx="4" fill="#6fcbb9" opacity="0.25" />
        </g>
      </g>

      <g className="hero-node">
        <rect x="1160" y="190" width="230" height="132" rx="16" fill="#123f39" />
        <text x="1186" y="228" fill="#6fcbb9" fontSize="12" fontFamily="Figtree, sans-serif" fontWeight="800" letterSpacing="1.6">AGENT LOOP</text>
        <text x="1186" y="260" fill="#f7fcfa" fontSize="20" fontFamily="Bricolage Grotesque, sans-serif" fontWeight="700">Plan → act → check</text>
        <text x="1186" y="288" fill="#c5ddd5" fontSize="13" fontFamily="Figtree, sans-serif">Tools · traces · approval</text>
      </g>

      <g className="hero-node">
        <rect x="1188" y="500" width="210" height="96" rx="16" fill="#ffffff" stroke="#0b3d38" strokeOpacity="0.18" />
        <text x="1212" y="540" fill="#0a1f1c" fontSize="14" fontFamily="Figtree, sans-serif" fontWeight="700">Decision layer</text>
        <text x="1212" y="566" fill="#314740" fontSize="13" fontFamily="Figtree, sans-serif">Eval · route · ship</text>
      </g>

      <g className="hero-node">
        <rect x="1100" y="720" width="210" height="86" rx="14" fill="#0b3d38" />
        <text x="1124" y="758" fill="#6fcbb9" fontSize="12" fontFamily="Figtree, sans-serif" fontWeight="800" letterSpacing="1.6">HANDOVER</text>
        <text x="1124" y="782" fill="#f7fcfa" fontSize="17" fontFamily="Bricolage Grotesque, sans-serif" fontWeight="700">Yours to run</text>
      </g>
    </svg>
  );
}
