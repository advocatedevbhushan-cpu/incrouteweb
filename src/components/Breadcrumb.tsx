import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { ROUTE_LABELS } from "../lib/routes";

/**
 * Breadcrumb — auto-generated from current URL path.
 * Renders visible breadcrumb + JSON-LD BreadcrumbList schema.
 */
export default function Breadcrumb() {
  const location = useLocation();
  const path = location.pathname;

  // Don't show on homepage
  if (path === "/") return null;

  // Build breadcrumb items from path segments
  const segments = path.split("/").filter(Boolean);
  const items: { label: string; href: string }[] = [{ label: "Home", href: "/" }];

  let accumulated = "/";
  for (const seg of segments) {
    accumulated += seg + "/";
    const label = ROUTE_LABELS[accumulated] || seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    items.push({ label, href: accumulated });
  }

  // JSON-LD schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.label,
      item: `https://incroute.com${item.href}`,
    })),
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Visible breadcrumb — visually hidden but kept for SEO schema */}
      <nav aria-label="Breadcrumb" className="sr-only">
        <ol className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest flex-wrap">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={idx} className="flex items-center gap-1.5">
                {idx === 0 && <Home className="w-3 h-3 text-brand-gold" />}
                {isLast ? (
                  <span className="text-brand-text font-semibold" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <>
                    <Link
                      to={item.href}
                      className="text-brand-text-muted hover:text-brand-gold transition-colors"
                    >
                      {item.label}
                    </Link>
                    <ChevronRight className="w-3 h-3 text-brand-border" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
