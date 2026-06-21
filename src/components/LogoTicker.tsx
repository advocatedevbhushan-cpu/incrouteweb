import React from "react";

export default function LogoTicker() {
  const logos = [
    // Stripe
    {
      name: "Stripe",
      svg: (
        <svg className="h-6 w-[58px]" viewBox="0 0 80 33" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.1 12.3c0-3.2 2.6-5.4 6-5.4 3.4 0 5.8 2 5.8 5.2h-3.2c0-1.5-1-2.4-2.6-2.4-1.6 0-2.6.9-2.6 2.3 0 3 8.3 1.8 8.3 7.8 0 3.3-2.6 5.6-6.1 5.6-3.6 0-6.1-2-6.1-5.4h3.2c0 1.7 1.2 2.6 2.9 2.6 1.7 0 2.8-.8 2.8-2.3.1-3.2-8.3-1.9-8.3-7.9zM22.5 7.4v3.5h3.2v2.7h-3.2v8.3c0 1.2.6 1.7 1.6 1.7.5 0 1-.1 1.4-.3v2.7c-.6.2-1.4.3-2.2.3-2.7 0-4-1.4-4-4.1v-8.6h-2.1v-2.7h2.1V7.4h3.2zM28.4 10.4c0-.5.1-1 .3-1.4V7.4h3.1v2.8c.8-1 2-1.7 3.6-1.7v3.2c-.3-.1-.6-.1-.9-.1-2.1 0-3.6 1.5-3.6 3.9v7.1h-2.5v-12.3zM37.8 2.9c0-1 .8-1.8 1.8-1.8 1 0 1.8.8 1.8 1.8s-.8 1.8-1.8 1.8c-1 0-1.8-.8-1.8-1.8zm.5 4.5h2.5v15.2h-2.5V7.4zM49.2 7.1c1.9 0 3.2.7 4 1.7V7.4h2.5v19.4h-2.5v-3.7c-.8 1.1-2.2 1.7-4 1.7-3.7 0-6.4-2.9-6.4-8.7-.1-5.7 2.6-9 6.4-9zm.8 12.8c2.2 0 3.5-1.7 3.5-4.2s-1.3-4.2-3.5-4.2c-2.3 0-3.5 1.7-3.5 4.2s1.2 4.2 3.5 4.2zM69.8 15.3c-.2-4.1-3-6.6-6.7-6.6-4 0-6.8 3.1-6.8 8.7 0 5.7 2.8 8.8 7 8.8 3.2 0 5.4-1.4 6.3-3.9h-2.8c-.6 1-1.8 1.5-3.5 1.5-2.4 0-4.1-1.4-4.4-3.9h10.9zm-10.7-2c.3-2 1.9-3.2 4-3.2 2 0 3.5 1.2 3.8 3.2h-7.8z" fill="currentColor"/>
        </svg>
      )
    },
    // Razorpay
    {
      name: "Razorpay",
      svg: (
        <svg className="h-5 w-[86px]" viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.6 20.8l-4.5-7.3v7.3H5V3h5.1c3.5 0 5.8 2.2 5.8 5.2 0 2.2-1.2 3.8-3.1 4.5l4.8 8.1h-3zM10.1 6.2H14c1.2 0 2-.7 2-1.7s-.8-1.7-2-1.7h-3.9v3.4zM24.8 11.2c1.9 0 3.2.7 4 1.7V11.5h2.5v9.3h-2.5v-1.7c-.8 1.1-2.2 1.7-4 1.7-3.7 0-6.4-2.9-6.4-8.7s2.7-8.7 6.4-8.7zm.8 6.8c2.2 0 3.5-1.7 3.5-4.2s-1.3-4.2-3.5-4.2-3.5 1.7-3.5 4.2 1.3 4.2 3.5 4.2zM33.4 11.5h8.9v2.2l-6.2 7.1h6.2v2.2h-9.2v-2.2l6.2-7.1h-5.9v-2.2zM49.2 11.2c4.1 0 6.9 3.1 6.9 8.7s-2.8 8.7-6.9 8.7-6.9-3.1-6.9-8.7 2.8-8.7 6.9-8.7zm0 14.7c2.3 0 3.6-2 3.6-6s-1.3-6-3.6-6-3.6 2-3.6 6 1.3 6 3.6 6zM58.3 11.5h2.5v2.8c.8-1 2.2-1.7 3.8-1.7v2.9c-.3-.1-.6-.1-.9-.1-2.1 0-3.6 1.5-3.6 3.9v5.9h-2.8V11.5zM67.9 11.5h2.5v1.7c.8-1.1 2.2-1.7 4-1.7 3.7 0 6.4 2.9 6.4 8.7s-2.7 8.7-6.4 8.7c-1.9 0-3.2-.7-4-1.7v9.7h-2.5V11.5zm6.4 11c2.2 0 3.5-1.7 3.5-4.2s-1.3-4.2-3.5-4.2-3.5 1.7-3.5 4.2 1.3 4.2 3.5 4.2zM87.5 11.2c1.9 0 3.2.7 4 1.7V11.5H94v9.3h-2.5v-1.7c-.8 1.1-2.2 1.7-4 1.7-3.7 0-6.4-2.9-6.4-8.7s2.7-8.7 6.4-8.7zm.8 6.8c2.2 0 3.5-1.7 3.5-4.2s-1.3-4.2-3.5-4.2-3.5 1.7-3.5 4.2 1.3 4.2 3.5 4.2zM96.1 11.5l2.7 6.5 2.7-6.5h2.8l-4.5 10-3.9 8.3h-2.5l4-8.3-4.2-10h2.9z" fill="currentColor"/>
        </svg>
      )
    },
    // Zoho
    {
      name: "Zoho",
      svg: (
        <svg className="h-6 w-[84px]" viewBox="0 0 90 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 20.8h-9v-2.2l6.2-7.1H2v-2.2h8.9v2.2l-6.2 7.1H11v2.2zM21.5 9.3c4.1 0 6.9 3.1 6.9 8.7s-2.8 8.7-6.9 8.7-6.9-3.1-6.9-8.7 2.8-8.7 6.9-8.7zm0 14.7c2.3 0 3.6-2 3.6-6s-1.3-6-3.6-6-3.6 2-3.6 6 1.3 6 3.6 6zM31.2 3v8.3c.8-1.1 2.2-1.7 4-1.7 3.7 0 6.4 2.9 6.4 8.7s-2.7 8.7-6.4 8.7c-1.8 0-3.2-.7-4 1.7v2.2h-2.5V3h2.5zm6.4 19.5c2.2 0 3.5-1.7 3.5-4.2s-1.3-4.2-3.5-4.2-3.5 1.7-3.5 4.2 1.3 4.2 3.5 4.2zM52.3 9.3c4.1 0 6.9 3.1 6.9 8.7s-2.8 8.7-6.9 8.7-6.9-3.1-6.9-8.7 2.8-8.7 6.9-8.7zm0 14.7c2.3 0 3.6-2 3.6-6s-1.3-6-3.6-6-3.6 2-3.6 6 1.3 6 3.6 6z" fill="currentColor"/>
        </svg>
      )
    },
    // Zerodha
    {
      name: "Zerodha",
      svg: (
        <span className="font-mono text-xs tracking-widest uppercase font-black text-brand-text/50 flex items-center gap-1.5 select-none">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-brand-gold shrink-0 inline-block"></span>
          ZERODHA
        </span>
      )
    },
    // MCA (Ministry of Corporate Affairs)
    {
      name: "MCA",
      svg: (
        <span className="font-serif text-[10px] tracking-wider uppercase font-bold text-brand-text/50 flex flex-col leading-none text-left select-none">
          <span>MINISTRY OF</span>
          <span className="text-brand-gold font-light tracking-widest text-[8px] mt-0.5">CORPORATE AFFAIRS</span>
        </span>
      )
    },
    // GSTN (Goods & Services Tax)
    {
      name: "GSTN",
      svg: (
        <span className="font-sans text-xs tracking-widest uppercase font-extrabold text-brand-text/50 flex items-center gap-1.5 select-none">
          <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          GSTN
        </span>
      )
    }
  ];

  // Duplicate the array of logos to create the seamless infinite horizontal scroll
  const doubleLogos = [...logos, ...logos, ...logos];

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      {/* Ticker Title Header */}
      <div className="text-center mb-1">
        <p className="text-[8px] font-mono uppercase tracking-widest text-brand-text-muted/60 font-semibold select-none">
          Direct Integrations & API compliance alignment with
        </p>
      </div>

      <div className="logo-ticker-container">
        <div className="logo-ticker-track">
          {doubleLogos.map((logo, idx) => (
            <div
              key={`${logo.name}-${idx}`}
              className="logo-ticker-item text-brand-text-muted/40 hover:text-brand-gold transition-colors duration-250"
            >
              {logo.svg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
