export const BrandLogo = ({ compact = false }: { compact?: boolean }) => (
  <div className={compact ? 'brand brand--compact' : 'brand'}>
    <svg className="brand__mark" viewBox="0 0 48 48" aria-hidden="true">
      <defs><linearGradient id="jafora-gradient" x1="5" y1="3" x2="43" y2="46"><stop offset="0%" stopColor="#1677FF"/><stop offset="100%" stopColor="#19C6C2"/></linearGradient></defs>
      <path d="M23 3h5L15 37q1 9-4 9t-5-4q-1-5 4-5z" fill="url(#jafora-gradient)"/>
      <polygon points="23,3 28,3 41,35 36,35" fill="url(#jafora-gradient)"/>
      <rect x="12" y="21" width="26" height="5" rx="1.5" fill="url(#jafora-gradient)"/>
      <rect x="12" y="30" width="20" height="5" rx="1.5" fill="url(#jafora-gradient)"/>
    </svg>
    {!compact && <div><strong className="brand__name">JAFORA</strong><span className="brand__erp">ERP</span></div>}
  </div>
);
