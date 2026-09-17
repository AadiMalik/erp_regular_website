// Applies an ERP-provided website theme config to the document: picks the
// theme's component/CSS structure via [data-theme] (see src/themes/registry.js
// and src/styles/themes/*.css), then overrides that theme's base color,
// typography and button tokens with the business's customized values.
// Derived shades (e.g. --color-primary-dark/-light, --color-bg-soft) stay
// theme-owned so a business customization never needs a full CSS builder.

export const AVAILABLE_THEMES = ['theme1', 'theme2', 'theme3', 'theme4', 'theme5', 'theme6'];
export const DEFAULT_THEME = 'theme1';

const COLOR_VARS = {
  primary: '--color-primary',
  secondary: '--color-secondary',
  accent: '--color-accent',
  background: '--color-bg',
  surface: '--color-surface',
  text: '--color-text',
  heading: '--color-heading',
  border: '--color-border',
  success: '--color-success',
  warning: '--color-gold',
  error: '--color-danger',
};

export function applyThemeConfig(config) {
  const root = document.documentElement;
  const theme = AVAILABLE_THEMES.includes(config?.theme_preset) ? config.theme_preset : DEFAULT_THEME;
  root.setAttribute('data-theme', theme);

  const colors = config?.colors || {};
  for (const [key, cssVar] of Object.entries(COLOR_VARS)) {
    if (colors[key]) root.style.setProperty(cssVar, colors[key]);
  }

  const typography = config?.typography || {};
  if (typography.font_display) root.style.setProperty('--font-display', typography.font_display);
  if (typography.font_body) root.style.setProperty('--font-body', typography.font_body);
  if (typography.lh_heading) root.style.setProperty('--lh-heading', typography.lh_heading);
  if (typography.lh_body) root.style.setProperty('--lh-body', typography.lh_body);
  root.style.fontSize = typography.font_size_base || '100%';

  const button = config?.button || {};
  if (button.radius) root.style.setProperty('--radius-btn', button.radius);
  if (button.weight) root.style.setProperty('--btn-weight', button.weight);
  if (button.shadow) root.style.setProperty('--shadow-card', button.shadow);

  return theme;
}
