export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="cvg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" /><stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#cvg)" />
      <path d="M10.5 21.5a4.5 4.5 0 0 1-.6-8.96A6.5 6.5 0 0 1 22.4 11.8 4.9 4.9 0 0 1 22 21.5H10.5Z" fill="#fff" fillOpacity=".96" />
      <rect x="13.6" y="15.4" width="4.8" height="4.2" rx="1" fill="#1D4ED8" />
      <path d="M14.6 15.4v-1.1a1.4 1.4 0 0 1 2.8 0v1.1" stroke="#1D4ED8" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export default function Logo({ size = 28, text = true }: { size?: number; text?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      {text && <span className="font-semibold tracking-tight text-ink-1" style={{ fontSize: size * 0.62 }}>CloudVault</span>}
    </span>
  )
}
