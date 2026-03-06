/**
 * @sb/generators - Code-Generatoren für Smooth Builder
 * 
 * VERSION: 5.1.0 - KORRIGIERT
 * - ALLE Section-Typen implementiert
 * - Hero mit Bild-Support
 * - Header mit Logo-Support
 * - Verbesserte CSS-Struktur
 */

import { escapeHtml, clamp } from '@sb/utils';
import type { AppState, HTMLGeneratorOptions, BrandSettings, SectionSpacing } from '@sb/types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function fontStackById(id: string): string {
  const stacks: Record<string, string> = {
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    inter: '"Inter", system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  };
  return stacks[id] || 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
}

function radiusPx(radius: string): string {
  if (radius === 'pill') return '999px';
  if (radius === 'sharp') return '6px';
  return '14px';
}

function spacingStyle(spacing: Record<string, SectionSpacing>, id: string): string {
  const sp = spacing[id];
  const pt = clamp(sp?.pt ?? 64, 0, 999);
  const pb = clamp(sp?.pb ?? 64, 0, 999);
  return `style="padding-top:${pt}px;padding-bottom:${pb}px"`;
}

function renderImage(src: string | null | undefined, alt: string, className: string): string {
  if (!src) return '';
  const isDataUrl = src.startsWith('data:');
  const escapedSrc = isDataUrl ? src : escapeHtml(src);
  return `<img src="${escapedSrc}" alt="${escapeHtml(alt)}" class="${className}" loading="lazy">`;
}

// ============================================================================
// CSS GENERATOR
// ============================================================================

export function generateTokensCSS(state: AppState): string {
  const { brand } = state;
  const { colors } = brand;
  
  return `:root{
  --sb-primary:${colors.primary};
  --sb-accent:${colors.accent};
  --sb-bg:${colors.background};
  --sb-surface:${colors.surface};
  --sb-text:${colors.text};
  --sb-text-muted:${colors.textLight};
  --sb-border:${colors.border};
  --sb-radius:${radiusPx(brand.radius)};
  --sb-font:${fontStackById(brand.font)};
  --sb-container:1200px;
  --sb-gutter:24px;
  --sb-shadow:0 10px 30px rgba(2,6,23,0.08);
  --sb-shadow-sm:0 6px 18px rgba(2,6,23,0.06);
  --sb-btn-h:44px;
  --sb-btn-pad:18px;
  --sb-trans:160ms ease;
}
`;
}

export function generateComponentsCSS(): string {
  return `/* Smooth Builder 5.1 - Base Styles */
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--sb-font);color:var(--sb-text);background:var(--sb-bg);line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
a:hover{text-decoration:underline}
img{max-width:100%;height:auto;display:block}
:focus-visible{outline:3px solid color-mix(in srgb,var(--sb-primary) 50%,transparent);outline-offset:2px;border-radius:4px}

/* Layout */
.sb-container{max-width:var(--sb-container);margin:0 auto;padding:0 var(--sb-gutter)}
.sb-site{min-height:100vh}
.sb-section{position:relative}
.sb-sectionHead{margin-bottom:24px}
.sb-h2{font-size:clamp(24px,2.2vw,36px);font-weight:800;letter-spacing:-0.02em;line-height:1.2}
.sb-h3{font-size:clamp(18px,1.6vw,24px);font-weight:700;letter-spacing:-0.01em}
.sb-p{margin:0;line-height:1.7}
.sb-muted{color:var(--sb-text-muted)}
.sb-lead{font-size:1.125rem;color:var(--sb-text-muted);max-width:65ch}

/* Buttons */
.sb-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:var(--sb-btn-h);padding:0 var(--sb-btn-pad);border-radius:var(--sb-radius);border:1px solid transparent;font-weight:600;font-size:15px;transition:transform var(--sb-trans),background var(--sb-trans),box-shadow var(--sb-trans);cursor:pointer;white-space:nowrap}
.sb-btn:hover{transform:translateY(-1px);text-decoration:none}
.sb-btn:active{transform:translateY(0)}
.sb-btn--primary{background:var(--sb-primary);color:white;box-shadow:var(--sb-shadow-sm)}
.sb-btn--primary:hover{box-shadow:var(--sb-shadow)}
.sb-btn--ghost{background:transparent;border-color:var(--sb-border);color:var(--sb-text)}
.sb-btn--ghost:hover{background:var(--sb-surface)}

/* Cards */
.sb-card{border:1px solid var(--sb-border);border-radius:var(--sb-radius);background:white;padding:24px;transition:box-shadow var(--sb-trans),transform var(--sb-trans)}
.sb-card:hover{box-shadow:var(--sb-shadow-sm);transform:translateY(-2px)}
.sb-card__icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--sb-primary) 10%,white);color:var(--sb-primary);margin-bottom:16px;font-size:24px}
.sb-card__title{font-weight:700;font-size:1.1rem;margin-bottom:8px}
.sb-card__text{color:var(--sb-text-muted);font-size:0.95rem;line-height:1.6}

/* Header */
.sb-header{background:rgba(255,255,255,0.92);backdrop-filter:saturate(180%) blur(12px);border-bottom:1px solid var(--sb-border)}
.sb-header.is-sticky{position:sticky;top:0;z-index:100}
.sb-header__inner{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:72px}
.sb-header__brand{display:flex;align-items:center;gap:12px;font-weight:800;font-size:1.1rem;letter-spacing:-0.02em}
.sb-header__logo{height:36px;width:auto}
.sb-header__logoMark{width:32px;height:32px;background:var(--sb-primary);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:900}
.sb-header__nav{display:none;gap:24px}
.sb-header__link{font-weight:500;font-size:15px;color:var(--sb-text-muted);transition:color var(--sb-trans)}
.sb-header__link:hover{color:var(--sb-text);text-decoration:none}
.sb-header__actions{display:flex;align-items:center;gap:12px}
.sb-header__cta{display:none}
.sb-header__burger{width:44px;height:44px;border-radius:var(--sb-radius);border:1px solid var(--sb-border);background:white;cursor:pointer;display:flex;align-items:center;justify-content:center}
.sb-header__burger svg{width:20px;height:20px}
.sb-header__mobile{display:none;border-top:1px solid var(--sb-border);background:white}
.sb-header__mobile.is-open{display:block}
.sb-header__mobileInner{padding:16px var(--sb-gutter);display:flex;flex-direction:column;gap:12px}
@media(min-width:860px){.sb-header__nav{display:flex}.sb-header__cta{display:inline-flex}.sb-header__burger{display:none}}

/* Hero */
.sb-hero{position:relative}
.sb-hero__inner{display:grid;gap:32px;align-items:center}
.sb-hero__copy{display:flex;flex-direction:column;gap:16px}
.sb-hero__title{font-size:clamp(32px,4vw,64px);font-weight:800;letter-spacing:-0.03em;line-height:1.08}
.sb-hero__text{font-size:1.125rem;color:var(--sb-text-muted);max-width:55ch;line-height:1.7}
.sb-hero__actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px}
.sb-hero__media{border-radius:var(--sb-radius);overflow:hidden;border:1px solid var(--sb-border);background:var(--sb-surface)}
.sb-hero__img{width:100%;height:auto;object-fit:cover}
.sb-hero--split .sb-hero__inner{grid-template-columns:1.1fr 0.9fr}
.sb-hero--split-reverse .sb-hero__inner{grid-template-columns:0.9fr 1.1fr}
.sb-hero--split-reverse .sb-hero__copy{order:2}
.sb-hero--fullscreen{min-height:80vh;display:flex;align-items:center}
.sb-hero--centered .sb-hero__inner{text-align:center;justify-items:center}
.sb-hero--centered .sb-hero__text{margin:0 auto}
.sb-hero--centered .sb-hero__actions{justify-content:center}
@media(max-width:900px){.sb-hero--split .sb-hero__inner,.sb-hero--split-reverse .sb-hero__inner{grid-template-columns:1fr}.sb-hero--split-reverse .sb-hero__copy{order:0}}

/* Trustbar */
.sb-trust{background:var(--sb-surface)}
.sb-trust__items{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.sb-trust__item{border:1px solid var(--sb-border);border-radius:var(--sb-radius);padding:16px;background:white;text-align:center}
.sb-trust__icon{font-size:28px;margin-bottom:8px}
.sb-trust__label{font-size:13px;color:var(--sb-text-muted)}
.sb-trust__stat{font-weight:900;font-size:24px;color:var(--sb-primary)}
.sb-trust--stats .sb-trust__items{grid-template-columns:repeat(4,1fr)}
@media(min-width:860px){.sb-trust__items{grid-template-columns:repeat(4,1fr)}}
@media(max-width:600px){.sb-trust--stats .sb-trust__items{grid-template-columns:repeat(2,1fr)}}

/* Services & Benefits */
.sb-services__grid,.sb-benefits__grid{display:grid;grid-template-columns:repeat(var(--sb-cols,3),1fr);gap:20px}
@media(max-width:900px){.sb-services__grid,.sb-benefits__grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.sb-services__grid,.sb-benefits__grid{grid-template-columns:1fr}}

/* Team */
.sb-team__grid{display:grid;grid-template-columns:repeat(var(--sb-cols,3),1fr);gap:20px}
.sb-team__member{text-align:center}
.sb-team__avatar{width:80px;height:80px;border-radius:50%;margin:0 auto 16px;overflow:hidden;background:color-mix(in srgb,var(--sb-primary) 10%,white);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;color:var(--sb-primary)}
.sb-team__avatar img{width:100%;height:100%;object-fit:cover}
.sb-team__name{font-weight:700;margin-bottom:4px}
.sb-team__role{font-size:14px;color:var(--sb-text-muted);margin-bottom:8px}
.sb-team__bio{font-size:14px;color:var(--sb-text-muted)}
@media(max-width:900px){.sb-team__grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.sb-team__grid{grid-template-columns:1fr}}

/* Testimonials */
.sb-testimonials__grid{display:grid;grid-template-columns:repeat(var(--sb-cols,3),1fr);gap:20px}
.sb-testimonial{background:white;border:1px solid var(--sb-border);border-radius:var(--sb-radius);padding:24px}
.sb-testimonial__quote{font-size:1.05rem;line-height:1.7;margin-bottom:16px;font-style:italic}
.sb-testimonial__quote::before{content:'"';font-size:2rem;color:var(--sb-primary);line-height:0;vertical-align:-0.4em;margin-right:4px}
.sb-testimonial__author{display:flex;align-items:center;gap:12px}
.sb-testimonial__avatar{width:44px;height:44px;border-radius:50%;background:var(--sb-surface);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--sb-primary);overflow:hidden}
.sb-testimonial__avatar img{width:100%;height:100%;object-fit:cover}
.sb-testimonial__name{font-weight:600}
.sb-testimonial__role{font-size:13px;color:var(--sb-text-muted)}
@media(max-width:900px){.sb-testimonials__grid{grid-template-columns:1fr}}

/* FAQ */
.sb-faq__list{display:flex;flex-direction:column;gap:12px;max-width:800px}
.sb-faq__item{border:1px solid var(--sb-border);border-radius:var(--sb-radius);background:white;overflow:hidden}
.sb-faq__q{padding:18px 20px;cursor:pointer;font-weight:600;display:flex;justify-content:space-between;align-items:center;list-style:none}
.sb-faq__q::-webkit-details-marker{display:none}
.sb-faq__q::after{content:'+';font-size:1.5rem;color:var(--sb-text-muted);transition:transform var(--sb-trans)}
details[open] .sb-faq__q::after{transform:rotate(45deg)}
.sb-faq__a{padding:0 20px 18px;color:var(--sb-text-muted);line-height:1.7}

/* CTA */
.sb-cta{background:color-mix(in srgb,var(--sb-primary) 6%,white)}
.sb-cta__center{display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center;max-width:700px;margin:0 auto}
.sb-cta__actions{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.sb-cta--banner{background:var(--sb-primary);color:white}
.sb-cta--banner .sb-h2{color:white}
.sb-cta--banner .sb-muted{color:rgba(255,255,255,0.8)}
.sb-cta--banner .sb-btn--primary{background:white;color:var(--sb-primary)}

/* Footer */
.sb-footer{border-top:1px solid var(--sb-border);background:var(--sb-surface)}
.sb-footer__inner{padding:32px 0}
.sb-footer__top{display:flex;flex-wrap:wrap;justify-content:space-between;gap:32px;margin-bottom:24px}
.sb-footer__brand{font-weight:800;font-size:1.1rem;margin-bottom:8px}
.sb-footer__contact{font-size:14px;color:var(--sb-text-muted);line-height:1.8}
.sb-footer__links{display:flex;gap:24px;flex-wrap:wrap}
.sb-footer__link{font-size:14px;color:var(--sb-text-muted)}
.sb-footer__link:hover{color:var(--sb-text)}
.sb-footer__bottom{padding-top:24px;border-top:1px solid var(--sb-border);display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;font-size:13px;color:var(--sb-text-muted)}
.sb-footer__legal{display:flex;gap:16px}
@media(max-width:600px){.sb-footer__top{flex-direction:column}}

/* Cookie Banner */
.sb-cookie{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center}
.sb-cookie__backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.5)}
.sb-cookie__card{position:relative;width:min(500px,calc(100% - 32px));background:white;border-radius:var(--sb-radius);box-shadow:var(--sb-shadow);overflow:hidden}
.sb-cookie__head{padding:20px 24px 0;display:flex;align-items:center;gap:12px}
.sb-cookie__icon{font-size:24px}
.sb-cookie__title{font-weight:700;font-size:1.1rem}
.sb-cookie__body{padding:16px 24px}
.sb-cookie__text{font-size:14px;color:var(--sb-text-muted);line-height:1.6}
.sb-cookie__actions{padding:0 24px 20px;display:flex;gap:12px;justify-content:flex-end}

/* Gallery */
.sb-gallery__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.sb-gallery__item{border-radius:var(--sb-radius);overflow:hidden;aspect-ratio:4/3;background:var(--sb-surface)}
.sb-gallery__item img{width:100%;height:100%;object-fit:cover}
@media(max-width:600px){.sb-gallery__grid{grid-template-columns:repeat(2,1fr)}}

/* Process */
.sb-process__list{display:flex;flex-direction:column;gap:24px;max-width:700px}
.sb-process__step{display:flex;gap:20px}
.sb-process__number{width:40px;height:40px;border-radius:50%;background:var(--sb-primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0}
.sb-process__content{flex:1}
.sb-process__title{font-weight:700;margin-bottom:4px}
.sb-process__text{color:var(--sb-text-muted);font-size:15px}

/* Utilities */
.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`;
}

export function generateStylesCSS(state: AppState): string {
  return `/* Smooth Builder 5.1 Export */\n${generateTokensCSS(state)}${generateComponentsCSS()}`;
}

// ============================================================================
// HTML SECTION GENERATORS - ALLE IMPLEMENTIERT
// ============================================================================

function generateSectionHTML(
  section: { id: string; type: string; variant: string },
  state: AppState
): string {
  const { layout, content, settings, brand } = state;
  const c = content[section.id] || {};
  const variant = section.variant || 'default';
  
  const cls = `sb-section sb-${section.type} sb-${section.type}--${variant}`;
  const sp = spacingStyle(layout.spacing, section.id);
  
  const wrap = (inner: string) =>
    `<section class="${cls}" data-section-id="${section.id}" ${sp}>${inner}</section>`;

  switch (section.type) {
    // ========== HEADER ==========
    case 'header': {
      const companyName = escapeHtml(c.brandName as string || settings.siteName);
      const nav = (c.nav as Array<{ label: string; href: string }>) || [];
      const ctaLabel = escapeHtml(c.ctaLabel as string || 'Kontakt');
      const ctaHref = escapeHtml(c.ctaHref as string || '#kontakt');
      const sticky = settings.features.stickyHeader ? ' is-sticky' : '';
      
      // KORRIGIERT: Logo wird jetzt verwendet
      const logoHtml = brand.logo
        ? `<img src="${brand.logo}" alt="${companyName}" class="sb-header__logo">`
        : `<span class="sb-header__logoMark">${companyName.charAt(0)}</span>`;
      
      return `<header class="sb-header${sticky}" role="banner">
  <div class="sb-container sb-header__inner">
    <a class="sb-header__brand" href="#">${logoHtml}<span>${companyName}</span></a>
    <nav class="sb-header__nav" aria-label="Hauptnavigation">
      ${nav.map(n => `<a class="sb-header__link" href="${escapeHtml(n.href)}">${escapeHtml(n.label)}</a>`).join('')}
    </nav>
    <div class="sb-header__actions">
      <a class="sb-btn sb-btn--primary sb-header__cta" href="${ctaHref}">${ctaLabel}</a>
      <button type="button" class="sb-header__burger" aria-label="Menü öffnen" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
  </div>
  <div class="sb-header__mobile" id="mobile-nav">
    <div class="sb-container sb-header__mobileInner">
      ${nav.map(n => `<a class="sb-header__link" href="${escapeHtml(n.href)}">${escapeHtml(n.label)}</a>`).join('')}
      <a class="sb-btn sb-btn--primary" href="${ctaHref}">${ctaLabel}</a>
    </div>
  </div>
</header>`;
    }

    // ========== HERO ==========
    case 'hero': {
      const headline = escapeHtml(c.headline as string || 'Willkommen');
      const subline = escapeHtml(c.subline as string || '');
      const ctaLabel = escapeHtml(c.ctaLabel as string || 'Mehr erfahren');
      const ctaHref = escapeHtml(c.ctaHref as string || '#');
      const image = c.image as string | null;
      
      // KORRIGIERT: Bild wird jetzt gerendert
      const mediaHtml = image ? `
        <div class="sb-hero__media">
          ${renderImage(image, headline, 'sb-hero__img')}
        </div>` : '';
      
      return wrap(`<div class="sb-container sb-hero__inner">
  <div class="sb-hero__copy">
    <h1 class="sb-hero__title">${headline}</h1>
    ${subline ? `<p class="sb-hero__text">${subline}</p>` : ''}
    <div class="sb-hero__actions">
      <a class="sb-btn sb-btn--primary" href="${ctaHref}">${ctaLabel}</a>
      <a class="sb-btn sb-btn--ghost" href="#leistungen">Mehr erfahren</a>
    </div>
  </div>
  ${mediaHtml}
</div>`);
    }

    // ========== TRUSTBAR ==========
    case 'trustbar': {
      const items = (c.items as Array<{ label: string; value?: string; icon?: string }>) || [];
      const isStats = variant === 'stats';
      
      return wrap(`<div class="sb-container">
  <div class="sb-trust__items">
    ${items.map(item => `
      <div class="sb-trust__item">
        ${item.icon ? `<div class="sb-trust__icon">${escapeHtml(item.icon)}</div>` : ''}
        ${isStats && item.value ? `<div class="sb-trust__stat">${escapeHtml(item.value)}</div>` : ''}
        <div class="sb-trust__label">${escapeHtml(item.label)}</div>
      </div>
    `).join('')}
  </div>
</div>`);
    }

    // ========== SERVICES ==========
    case 'services': {
      const headline = escapeHtml(c.headline as string || 'Leistungen');
      const items = (c.items as Array<{ title: string; text: string; icon?: string }>) || [];
      const cols = variant.match(/grid-(\d)/)?.[1] || '3';
      
      return wrap(`<div class="sb-container">
  <div class="sb-sectionHead"><h2 class="sb-h2">${headline}</h2></div>
  <div class="sb-services__grid" style="--sb-cols:${cols}">
    ${items.map(item => `
      <div class="sb-card">
        <div class="sb-card__icon">${escapeHtml(item.icon || '●')}</div>
        <div class="sb-card__title">${escapeHtml(item.title)}</div>
        <div class="sb-card__text">${escapeHtml(item.text)}</div>
      </div>
    `).join('')}
  </div>
</div>`);
    }

    // ========== BENEFITS ==========
    case 'benefits': {
      const headline = escapeHtml(c.headline as string || 'Ihre Vorteile');
      const items = (c.items as Array<{ title: string; text: string; icon?: string }>) || [];
      const cols = variant.match(/grid-(\d)/)?.[1] || '3';
      
      return wrap(`<div class="sb-container">
  <div class="sb-sectionHead"><h2 class="sb-h2">${headline}</h2></div>
  <div class="sb-benefits__grid" style="--sb-cols:${cols}">
    ${items.map(item => `
      <div class="sb-card">
        <div class="sb-card__icon">${escapeHtml(item.icon || '✓')}</div>
        <div class="sb-card__title">${escapeHtml(item.title)}</div>
        <div class="sb-card__text">${escapeHtml(item.text)}</div>
      </div>
    `).join('')}
  </div>
</div>`);
    }

    // ========== TEAM ==========
    case 'team': {
      const headline = escapeHtml(c.headline as string || 'Unser Team');
      const members = (c.members as Array<{ name: string; role: string; bio?: string; image?: string }>) || [];
      
      return wrap(`<div class="sb-container">
  <div class="sb-sectionHead"><h2 class="sb-h2">${headline}</h2></div>
  <div class="sb-team__grid" style="--sb-cols:${Math.min(members.length, 4)}">
    ${members.map(m => {
      const initials = m.name.split(' ').map(n => n[0]).join('').slice(0, 2);
      const avatarContent = m.image 
        ? renderImage(m.image, m.name, '')
        : initials;
      return `
      <div class="sb-team__member">
        <div class="sb-team__avatar">${avatarContent}</div>
        <div class="sb-team__name">${escapeHtml(m.name)}</div>
        <div class="sb-team__role">${escapeHtml(m.role)}</div>
        ${m.bio ? `<div class="sb-team__bio">${escapeHtml(m.bio)}</div>` : ''}
      </div>`;
    }).join('')}
  </div>
</div>`);
    }

    // ========== TESTIMONIALS ==========
    case 'testimonials': {
      const headline = escapeHtml(c.headline as string || 'Kundenstimmen');
      const items = (c.items as Array<{ quote: string; name: string; role?: string; image?: string }>) || [];
      
      return wrap(`<div class="sb-container">
  <div class="sb-sectionHead"><h2 class="sb-h2">${headline}</h2></div>
  <div class="sb-testimonials__grid" style="--sb-cols:${Math.min(items.length, 3)}">
    ${items.map(t => {
      const initial = t.name.charAt(0);
      const avatarContent = t.image 
        ? renderImage(t.image, t.name, '')
        : initial;
      return `
      <div class="sb-testimonial">
        <div class="sb-testimonial__quote">${escapeHtml(t.quote)}</div>
        <div class="sb-testimonial__author">
          <div class="sb-testimonial__avatar">${avatarContent}</div>
          <div>
            <div class="sb-testimonial__name">${escapeHtml(t.name)}</div>
            ${t.role ? `<div class="sb-testimonial__role">${escapeHtml(t.role)}</div>` : ''}
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>
</div>`);
    }

    // ========== FAQ ==========
    case 'faq': {
      const headline = escapeHtml(c.headline as string || 'Häufige Fragen');
      const items = (c.items as Array<{ q: string; a: string }>) || [];
      
      return wrap(`<div class="sb-container">
  <div class="sb-sectionHead"><h2 class="sb-h2">${headline}</h2></div>
  <div class="sb-faq__list">
    ${items.map((item, i) => `
      <details class="sb-faq__item"${i === 0 ? ' open' : ''}>
        <summary class="sb-faq__q">${escapeHtml(item.q)}</summary>
        <div class="sb-faq__a">${escapeHtml(item.a)}</div>
      </details>
    `).join('')}
  </div>
</div>`);
    }

    // ========== CTA ==========
    case 'cta': {
      const headline = escapeHtml(c.headline as string || 'Bereit loszulegen?');
      const text = escapeHtml(c.text as string || '');
      const ctaLabel = escapeHtml(c.ctaLabel as string || 'Kontakt');
      const ctaHref = escapeHtml(c.ctaHref as string || '#');
      
      return wrap(`<div class="sb-container">
  <div class="sb-cta__center">
    <h2 class="sb-h2">${headline}</h2>
    ${text ? `<p class="sb-lead sb-muted">${text}</p>` : ''}
    <div class="sb-cta__actions">
      <a class="sb-btn sb-btn--primary" href="${ctaHref}">${ctaLabel}</a>
    </div>
  </div>
</div>`);
    }

    // ========== FOOTER ==========
    case 'footer': {
      const companyName = escapeHtml(c.companyName as string || settings.siteName);
      const address = escapeHtml(c.address as string || '').replace(/\n/g, '<br>');
      const email = escapeHtml(c.email as string || '');
      const phone = escapeHtml(c.phone as string || '');
      const legal = (c.legal as Array<{ label: string; href: string }>) || [];
      const year = new Date().getFullYear();
      
      return `<footer class="sb-footer" role="contentinfo">
  <div class="sb-container sb-footer__inner">
    <div class="sb-footer__top">
      <div>
        <div class="sb-footer__brand">${companyName}</div>
        <div class="sb-footer__contact">
          ${address ? `<div>${address}</div>` : ''}
          ${email ? `<div><a href="mailto:${email}">${email}</a></div>` : ''}
          ${phone ? `<div><a href="tel:${phone.replace(/\s/g, '')}">${phone}</a></div>` : ''}
        </div>
      </div>
      <div class="sb-footer__links">
        ${legal.map(l => `<a class="sb-footer__link" href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>`).join('')}
      </div>
    </div>
    <div class="sb-footer__bottom">
      <div>© ${year} ${companyName}</div>
      <div class="sb-footer__legal">
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutz</a>
      </div>
    </div>
  </div>
</footer>`;
    }

    // ========== COOKIE ==========
    case 'cookie': {
      const title = escapeHtml(c.title as string || 'Cookies');
      const text = escapeHtml(c.text as string || 'Wir verwenden Cookies.');
      
      return `<div class="sb-cookie" id="sb-cookie-banner" role="dialog" aria-labelledby="cookie-title" hidden>
  <div class="sb-cookie__backdrop"></div>
  <div class="sb-cookie__card">
    <div class="sb-cookie__head">
      <span class="sb-cookie__icon">🍪</span>
      <span class="sb-cookie__title" id="cookie-title">${title}</span>
    </div>
    <div class="sb-cookie__body">
      <p class="sb-cookie__text">${text}</p>
    </div>
    <div class="sb-cookie__actions">
      <button class="sb-btn sb-btn--ghost" data-cookie="reject">Ablehnen</button>
      <button class="sb-btn sb-btn--primary" data-cookie="accept">Akzeptieren</button>
    </div>
  </div>
</div>`;
    }

    // ========== GALLERY ==========
    case 'gallery': {
      const headline = escapeHtml(c.headline as string || 'Galerie');
      const items = (c.items as Array<{ image: string; alt?: string }>) || [];
      
      return wrap(`<div class="sb-container">
  <div class="sb-sectionHead"><h2 class="sb-h2">${headline}</h2></div>
  <div class="sb-gallery__grid">
    ${items.map((item, i) => `
      <div class="sb-gallery__item">
        ${renderImage(item.image, item.alt || `Bild ${i + 1}`, '')}
      </div>
    `).join('')}
  </div>
</div>`);
    }

    // ========== PROCESS ==========
    case 'process': {
      const headline = escapeHtml(c.headline as string || 'So funktioniert es');
      const steps = (c.steps as Array<{ title: string; text: string }>) || [];
      
      return wrap(`<div class="sb-container">
  <div class="sb-sectionHead"><h2 class="sb-h2">${headline}</h2></div>
  <div class="sb-process__list">
    ${steps.map((step, i) => `
      <div class="sb-process__step">
        <div class="sb-process__number">${i + 1}</div>
        <div class="sb-process__content">
          <div class="sb-process__title">${escapeHtml(step.title)}</div>
          <div class="sb-process__text">${escapeHtml(step.text)}</div>
        </div>
      </div>
    `).join('')}
  </div>
</div>`);
    }

    // ========== CUSTOM / FALLBACK ==========
    default:
      return wrap(`<div class="sb-container">
  <p class="sb-muted">[${escapeHtml(section.type)}]</p>
</div>`);
  }
}

// ============================================================================
// BODY & DOCUMENT GENERATORS
// ============================================================================

export function generateBodyContent(state: AppState): string {
  const { layout } = state;
  const byId = new Map(layout.sections.map(s => [s.id, s]));
  
  const sectionsHtml = layout.order
    .map(id => byId.get(id))
    .filter(s => s && s.enabled)
    .map(s => generateSectionHTML(s!, state))
    .join('\n');
  
  return `<div class="sb-site">${sectionsHtml}</div>`;
}

export function generateHTML(state: AppState, options: HTMLGeneratorOptions = { mode: 'production' }): string {
  const { settings, brand } = state;
  
  const lang = settings.language || 'de';
  const title = escapeHtml(settings.siteName);
  const desc = escapeHtml(settings.siteDescription);
  const primary = brand.colors.primary;
  
  const headCss = options.mode === 'preview'
    ? `<style>${options.inlineCss || ''}</style>`
    : `<link rel="stylesheet" href="${escapeHtml(options.cssHref || 'styles.css')}">`;
  
  const headJs = options.mode === 'preview'
    ? `<script>${options.inlineJs || ''}</script>`
    : `<script src="${escapeHtml(options.jsSrc || 'main.js')}" defer></script>`;
  
  const favicon = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${settings.favicon || '🏠'}</text></svg>`
  )}`;
  
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="${escapeHtml(primary)}">
  ${desc ? `<meta name="description" content="${desc}">` : ''}
  <title>${title}</title>
  <link rel="icon" href="${favicon}">
  ${headCss}
  ${headJs}
</head>
<body>
${generateBodyContent(state)}
</body>
</html>`;
}

// ============================================================================
// JAVASCRIPT GENERATOR
// ============================================================================

export function generateMainJS(state: AppState): string {
  const { features, consent } = state.settings;
  
  return `// Smooth Builder 5.1
(function(){
  // Mobile Navigation
  var burger=document.querySelector('.sb-header__burger');
  var mobile=document.getElementById('mobile-nav');
  if(burger&&mobile){
    burger.addEventListener('click',function(){
      var open=mobile.classList.toggle('is-open');
      burger.setAttribute('aria-expanded',open);
    });
  }
  
  ${features.smoothScroll ? `// Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var href=this.getAttribute('href');
      if(href==='#')return;
      var target=document.querySelector(href);
      if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth'});}
    });
  });` : ''}
  
  ${consent.enabled ? `// Cookie Banner
  var KEY='sb_consent_v1';
  var banner=document.getElementById('sb-cookie-banner');
  if(banner){
    var saved=null;try{saved=JSON.parse(localStorage.getItem(KEY));}catch(e){}
    if(!saved||!saved.decided){banner.hidden=false;}
    banner.addEventListener('click',function(e){
      var action=e.target.dataset.cookie;
      if(!action)return;
      localStorage.setItem(KEY,JSON.stringify({decided:true,accepted:action==='accept',ts:Date.now()}));
      banner.hidden=true;
    });
  }` : ''}
})();`;
}

// ============================================================================
// LEGAL PAGES
// ============================================================================

export function generatePrivacyPage(state: AppState): string {
  const { settings } = state;
  return `<!DOCTYPE html>
<html lang="${settings.language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Datenschutz - ${escapeHtml(settings.siteName)}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="sb-container" style="padding:64px 24px;max-width:800px">
    <h1>Datenschutzerklärung</h1>
    <p><strong>Stand:</strong> ${new Date().toLocaleDateString('de-CH')}</p>
    
    <h2>1. Verantwortliche Stelle</h2>
    <p>${escapeHtml(settings.siteName)}</p>
    
    <h2>2. Erhobene Daten</h2>
    <p>Wir erheben personenbezogene Daten nur im erforderlichen Umfang.</p>
    
    <h2>3. Cookies</h2>
    <p>${settings.consent.enabled ? 'Diese Website verwendet Cookies. Beim ersten Besuch werden Sie um Ihre Einwilligung gebeten.' : 'Diese Website verwendet keine Tracking-Cookies.'}</p>
    
    <h2>4. Ihre Rechte</h2>
    <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung.</p>
    
    <p style="margin-top:48px"><a href="/">← Zurück zur Startseite</a></p>
  </main>
</body>
</html>`;
}

export function generateImpressum(state: AppState): string {
  const { settings } = state;
  return `<!DOCTYPE html>
<html lang="${settings.language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Impressum - ${escapeHtml(settings.siteName)}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="sb-container" style="padding:64px 24px;max-width:800px">
    <h1>Impressum</h1>
    
    <h2>Angaben gemäss Schweizer Recht</h2>
    <p>${escapeHtml(settings.siteName)}</p>
    
    <h2>Kontakt</h2>
    <p>Siehe Angaben auf der Startseite.</p>
    
    <h2>Haftungsausschluss</h2>
    <p>Der Autor übernimmt keine Gewähr für die Richtigkeit der Informationen.</p>
    
    <p style="margin-top:48px"><a href="/">← Zurück zur Startseite</a></p>
  </main>
</body>
</html>`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const generators = {
  css: { tokens: generateTokensCSS, components: generateComponentsCSS, full: generateStylesCSS },
  html: { document: generateHTML, body: generateBodyContent },
  js: { main: generateMainJS },
  legal: { privacy: generatePrivacyPage, impressum: generateImpressum }
};
