import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Network } from '@capacitor/network';
import { SplashScreen } from '@capacitor/splash-screen';
import { shouldRefresh, isExternal } from './lifecycle.mjs';

const config = __GO_RELEASE__;
if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add('go-native');
  const fetchOriginal = window.fetch.bind(window);
  let failed = false;
  window.fetch = async (input, options = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    const request = { ...options };
    if (url.origin === config.productionApi && (options.method || input.method || 'GET').toUpperCase() === 'GET') {
      request.cache = 'no-store';
      request.headers = new Headers(options.headers || (input instanceof Request ? input.headers : undefined));
      request.headers.set('Cache-Control', 'no-cache');
    }
    try {
      const response = await fetchOriginal(input, request);
      if (url.origin === config.productionApi && !response.ok) failed = true;
      return response;
    } catch (error) {
      if (url.origin === config.productionApi) { failed = true; window.dispatchEvent(new Event('go-native-connection-failed')); }
      throw error;
    }
  };
  const boot = async () => {
    let connected = navigator.onLine, inactiveAt = 0, refreshing = null;
    const notice = document.createElement('div');
    notice.className = 'go-native-notice'; notice.hidden = true; notice.setAttribute('role', 'status');
    const message = document.createElement('span'), retry = document.createElement('button');
    retry.type = 'button'; retry.textContent = 'TRY AGAIN'; notice.append(message, retry); document.body.append(notice);
    const announce = text => { message.textContent = text; notice.hidden = false; };
    const busy = () => {
      const field = document.activeElement;
      return !!(field?.matches('input,textarea,select,[contenteditable=true]') || [...document.querySelectorAll('video,audio')].some(m => !m.paused) || document.querySelector('.screen.active-screen iframe[data-boss-video]') || document.querySelector('#go-challenge-overlay.open,#go-auth-overlay.open'));
    };
    const refresh = async (manual = false) => {
      if (refreshing) return refreshing;
      if (!connected) { announce('You are offline. Connect to load the latest content.'); return; }
      if (busy()) { announce('Finish watching or editing, then refresh when you are ready.'); return; }
      retry.disabled = true;
      refreshing = (async () => {
        failed = false;
        try {
          await window.BossGoNative.refresh();
          if (failed) announce('Some content could not refresh. Your session is still saved.');
          else { notice.hidden = true; if (manual) window.dispatchEvent(new Event('go-native-content-refreshed')); }
        } catch { announce('Content could not refresh. Check your connection and try again.'); }
        finally { retry.disabled = false; refreshing = null; }
      })();
      return refreshing;
    };
    const refreshButton = document.createElement('button');
    refreshButton.type = 'button'; refreshButton.className = 'go-native-refresh'; refreshButton.textContent = '\u21bb';
    refreshButton.setAttribute('aria-label', 'Refresh published content'); refreshButton.onclick = () => refresh(true);
    document.body.append(refreshButton); retry.onclick = () => refresh(true);
    window.addEventListener('go-native-connection-failed', () => { failed = true; announce('Some content is unavailable. Check your connection and try again.'); });
    await Network.addListener('networkStatusChange', status => {
      connected = status.connected;
      if (!connected) announce('You are offline. Published content needs a connection.');
      else if (failed) announce('Connection restored. Tap TRY AGAIN to refresh content.');
      else notice.hidden = true;
    });
    connected = (await Network.getStatus()).connected;
    if (!connected || failed) announce('Connect to load the latest published content.');
    await App.addListener('appStateChange', state => {
      window.dispatchEvent(new CustomEvent('go-community-app-state',{detail:{active:state.isActive}}));
      if (!state.isActive) { inactiveAt = Date.now(); return; }
      if (shouldRefresh({ inactiveAt, now: Date.now(), minimumAge: config.resumeRefreshAfterMs, busy: busy(), connected })) refresh();
      inactiveAt = 0;
    });
    if (Capacitor.getPlatform() === 'android') await App.addListener('backButton', async () => {
      if (document.fullscreenElement) { await document.exitFullscreen(); return; }
      if (!window.BossGoNative.back()) await App.minimizeApp();
    });
    document.addEventListener('click', event => {
      const anchor = event.target.closest?.('a[href]');
      if (!anchor || anchor.hasAttribute('download')) return;
      if (isExternal(anchor.href, location.href)) { event.preventDefault(); Browser.open({ url: anchor.href }); }
    }, true);
    const open = window.open.bind(window);
    window.open = (url, ...rest) => {
      if (url && /^https?:/i.test(String(url))) { Browser.open({ url: new URL(url, location.href).href }); return null; }
      return open(url, ...rest);
    };
    // Retain the existing embed. Provide a provider-hosted escape route for native
    // WebViews where YouTube may reject the custom-scheme referrer (error 153).
    const players = new Map();
    const inspectPlayers = () => {
      for (const [frame, button] of players) if (!frame.isConnected) { button.remove(); players.delete(frame); }
      for (const frame of document.querySelectorAll('iframe')) {
        if (players.has(frame)) continue;
        let url; try { url = new URL(frame.src); } catch { continue; }
        if (!['www.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname)) continue;
        const id = url.pathname.match(/^\/embed\/([\w-]{11})/)?.[1]; if (!id) continue;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        const button = document.createElement('button'); button.className = 'go-native-youtube'; button.type = 'button';
        button.textContent = 'Open on YouTube'; button.onclick = () => Browser.open({ url: `https://www.youtube.com/watch?v=${id}` });
        frame.parentElement.insertAdjacentElement('afterend', button); players.set(frame, button);
      }
    };
    new MutationObserver(inspectPlayers).observe(document.body, { childList: true, subtree: true }); inspectPlayers();
    await SystemBars.setStyle({ style: SystemBarsStyle.Dark }).catch(() => {});
    await SplashScreen.hide();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => boot().catch(console.error), { once: true });
  else boot().catch(console.error);
}
