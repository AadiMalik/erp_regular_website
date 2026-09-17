// Facebook JS SDK - vanilla <script> integration, no SDK package (see
// CLAUDE.md "no unnecessary dependencies"). Returns the access_token the
// backend verifies (App\Http\Controllers\Api\Auth\AuthController::loginWithFacebook).
import { loadScript } from '@/utils/loadScript';

const FB_SRC = 'https://connect.facebook.net/en_US/sdk.js';
let initializedFor = null;

async function ensureInit(appId) {
  await loadScript(FB_SRC);
  if (!window.FB) return;
  if (initializedFor === appId) return;
  window.FB.init({ appId, cookie: true, xfbml: false, version: 'v19.0' });
  initializedFor = appId;
}

export async function loginWithFacebook(appId) {
  await ensureInit(appId);
  if (!window.FB) throw new Error('Facebook SDK failed to load.');

  return new Promise((resolve, reject) => {
    window.FB.login((response) => {
      const token = response?.authResponse?.accessToken;
      if (token) {
        resolve(token);
      } else {
        reject(new Error('Facebook login was cancelled.'));
      }
    }, { scope: 'email,public_profile' });
  });
}
