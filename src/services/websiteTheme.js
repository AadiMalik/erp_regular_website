// Website theme settings from the ERP (Website Theme).
// Called once, before the app renders (see main.js).
// Per CLAUDE.md, missing/invalid settings must never break the site,
// so any failure - network error, malformed response - falls back to
// theme1's own defaults, matching src/styles/themes/theme1.css exactly.

import { http } from './http';

export const FALLBACK_THEME_CONFIG = {
  theme_preset: 'theme1',
  header_style: 'theme1',
  footer_style: 'theme1',
  colors: {
    primary: '#1E9E5A',
    secondary: '#0B3D2E',
    accent: '#FF6B35',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#16241C',
    heading: '#16241C',
    border: '#E7ECE9',
    success: '#1E9E5A',
    warning: '#FFB020',
    error: '#E5484D',
  },
  typography: {
    font_display: "'Poppins', 'Segoe UI', sans-serif",
    font_body: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    font_size_base: '100%',
    lh_heading: '1.2',
    lh_body: '1.55',
  },
  button: {
    radius: '999px',
    weight: '600',
    shadow: '0 2px 8px rgba(16, 34, 24, 0.06)',
  },
};

export async function fetchWebsiteThemeConfig() {
  try {
    const { data } = await http.get('/v1/website-theme');
    if (!data?.Success || !data?.Data?.colors) return FALLBACK_THEME_CONFIG;
    return data.Data;
  } catch {
    return FALLBACK_THEME_CONFIG;
  }
}
