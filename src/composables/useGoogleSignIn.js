// Google Identity Services (GIS) - vanilla <script> integration, no SDK
// package (see CLAUDE.md "no unnecessary dependencies"). Renders the
// official Google button and hands back the id_token from its credential
// callback, which the backend verifies (App\Http\Controllers\Api\Auth\AuthController::loginWithGoogle).
import { loadScript } from '@/utils/loadScript';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

export async function renderGoogleButton(el, clientId, onCredential) {
  if (!el || !clientId) return;
  await loadScript(GIS_SRC);
  if (!window.google?.accounts?.id) return;

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => onCredential(response.credential),
  });
  // Google's own widget only - GIS has no "open the consent popup from any
  // button" API for the id_token flow, so this renders at its max width
  // (400) and the caller CSS-transform-scales it to fill a same-styled
  // custom button placed underneath (see SocialLoginButtons.vue) - the real,
  // clickable Google button, just visually replaced.
  window.google.accounts.id.renderButton(el, {
    theme: 'outline',
    size: 'large',
    width: 400,
  });
}
