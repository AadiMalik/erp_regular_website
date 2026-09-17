// Applies ERP-provided global website settings to the document head:
// default SEO title/description and favicon. Per-page views may still
// override document.title for their own content.
//
// Tab icon priority:
// 1) Business-uploaded favicon from ERP website settings
// 2) Bundled Dukanaz default under /favicon/

export const DEFAULT_FAVICON = '/favicon/favicon-32.png';

export function applyWebsiteSettings(settings) {
  if (!settings) return;

  if (settings.seo?.title) {
    document.title = settings.seo.title;
  }

  if (settings.seo?.description) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', settings.seo.description);
  }

  const faviconHref = settings.favicon || DEFAULT_FAVICON;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'icon');
    document.head.appendChild(link);
  }
  link.setAttribute('type', 'image/png');
  link.setAttribute('href', faviconHref);
}
