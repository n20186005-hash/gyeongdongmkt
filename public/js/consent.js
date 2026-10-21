(() => {
  const key = 'gyeongdongmkt_cookie_preferences', deniedKey = 'gyeongdongmkt_analytics_denied', gaId = 'G-HXM22WWPKP';
  const messages = {
    on: '이 브라우저에서 Google Analytics를 허용했습니다.', off: '이 브라우저에서 Google Analytics를 거부했습니다.',
    tab: '이 탭에서는 Google Analytics가 꺼져 있습니다.',
    session: 'Google Analytics가 이 탭에서 꺼졌으며 페이지 이동과 새로고침에도 유지됩니다. 영구 선택을 저장하지 못해 다른 탭에는 이전 허용이 남아 있을 수 있습니다. 브라우저 설정에서 사이트 데이터를 삭제해 저장된 허용을 제거하세요.',
    page: '이 페이지에서는 Google Analytics가 꺼져 있습니다. 저장된 선택을 확인할 수 없으므로 이동하거나 새로고침하기 전에 브라우저 설정에서 사이트 데이터를 삭제하세요.'
  };
  function read() {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || 'null');
      const denied = window.__gyeongdongmktDenied || sessionStorage.getItem(deniedKey) === '1';
      return { analytics: !denied && raw?.analytics === true, decided: denied || typeof raw?.analytics === 'boolean' };
    } catch { return { analytics: false, decided: false }; }
  }
  function denySession() {
    window.__gyeongdongmktDenied = true; window['ga-disable-' + gaId] = true;
    try { sessionStorage.setItem(deniedKey, '1'); return true; } catch { return false; }
  }
  function apply() {
    const allowed = read().analytics; window['ga-disable-' + gaId] = !allowed;
    if (!allowed) {
      if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
      for (const part of document.cookie.split(';')) {
        const name = part.split('=')[0].trim();
        if (/^_ga(?:_|$)/.test(name)) for (const domain of ['', '; domain=' + location.hostname, '; domain=.gyeongdongmkt.com']) document.cookie = name + '=; Max-Age=0; path=/' + domain;
      }
      return false;
    }
    if (window.__gyeongdongmktLoaded) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      return true;
    }
    window.__gyeongdongmktLoaded = true; window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'denied' });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date()); window.gtag('config', gaId, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement('script'); script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId; document.head.appendChild(script);
    return true;
  }
  function save(value) {
    value = value === true; let sessionDenied = false, saved = false;
    if (!value) sessionDenied = denySession();
    try {
      if (value) {
        // Verify required readable storage and tab-veto removal before
        // publishing an allowance that other tabs could consume.
        sessionStorage.removeItem(deniedKey);
        if (sessionStorage.getItem(deniedKey) === '1') throw new Error('Tab refusal remains');
        localStorage.getItem(key);
      }
      localStorage.setItem(key, JSON.stringify({ analytics: value }));
      if (value) window.__gyeongdongmktDenied = false;
      saved = true;
    } catch { sessionDenied = denySession() || sessionDenied; }
    const analytics = apply();
    const result = { saved, analytics, message: saved ? (analytics ? messages.on : value ? messages.page : messages.off) : (sessionDenied ? messages.session : messages.page) };
    document.querySelectorAll('[data-consent-status]').forEach(node => { node.textContent = result.message; });
    const checkbox = document.getElementById('analytics'); if (checkbox) checkbox.checked = result.analytics;
    const banner = document.getElementById('cookie-banner'); if (saved) banner?.classList.add('hidden');
    return result;
  }
  window.GyeongdongmktConsent = { read, save };
  apply();
  const checkbox = document.getElementById('analytics'); if (checkbox) checkbox.checked = read().analytics;
  checkbox?.addEventListener('change', () => document.querySelectorAll('[data-consent-status]').forEach(node => { node.textContent = ''; }));
  if (!read().decided) document.getElementById('cookie-banner')?.classList.remove('hidden');
  document.querySelectorAll('[data-cookie-accept]').forEach(node => node.addEventListener('click', () => save(true)));
  document.querySelectorAll('[data-cookie-reject]').forEach(node => node.addEventListener('click', () => save(false)));
  document.getElementById('cookie-settings')?.addEventListener('submit', event => { event.preventDefault(); save(checkbox?.checked === true); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    let grant = false; try { grant = JSON.parse(event.newValue || 'null')?.analytics === true; } catch {}
    if (!grant) denySession();
    const analytics = apply();
    if (checkbox) checkbox.checked = analytics;
    document.querySelectorAll('[data-consent-status]').forEach(node => { node.textContent = analytics ? messages.on : messages.tab; });
  });
})();
