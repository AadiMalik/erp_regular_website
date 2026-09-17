// Loads an external <script> once and caches the in-flight/settled promise
// per src, so Google/Facebook/reCAPTCHA SDKs (all loaded on-demand, never as
// npm deps - see CLAUDE.md "no unnecessary dependencies") aren't re-injected
// on every mount (Login/Signup views, route re-entry, etc.).
const cache = new Map();

export function loadScript(src) {
  if (cache.has(src)) return cache.get(src);

  const promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });

  cache.set(src, promise);
  return promise;
}
