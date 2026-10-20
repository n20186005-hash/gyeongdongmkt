(() => {
  const key = 'gyeongdongmkt_cookie_preferences', deniedKey = 'gyeongdongmkt_analytics_denied', gaId = 'G-HXM22WWPKP';
  const messages = {
    on: '이 브라우저에서 분석을 허용했습니다.', off: '이 브라우저에서 분석을 거부했습니다.',
    session: '분석이 이 탭에서 꺼졌으며 페이지 이동과 새로고침에도 유지됩니다. 영구 선택을 저장하지 못해 이전 허용이 남아 있을 수 있습니다. 브라우저 설정에서 사이트 데이터를 삭제해 저장된 허용을 제거하세요.',
    page: '분석이 이 페이지에서 꺼졌습니다. 저장소를 사용할 수 없으므로 이동하거나 새로고침하기 전에 브라우저 설정에서 사이트 데이터를 삭제하세요.'
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
      return;
    }
    if (window.__gyeongdongmktLoaded) return;
    window.__gyeongdongmktLoaded = true; window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', gaId, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement('script'); script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId; document.head.appendChild(script);
  }
  function save(value) {
    value = value === true; let sessionDenied = false, saved = false;
    if (!value) sessionDenied = denySession();
    try {
      localStorage.setItem(key, JSON.stringify({ analytics: value }));
      if (value) { sessionStorage.removeItem(deniedKey); window.__gyeongdongmktDenied = false; }
      saved = true;
    } catch { sessionDenied = denySession() || sessionDenied; }
    apply();
    const result = { saved, analytics: read().analytics, message: saved ? (value ? messages.on : messages.off) : (sessionDenied ? messages.session : messages.page) };
    document.querySelectorAll('[data-consent-status]').forEach(node => { node.textContent = result.message; });
    const checkbox = document.getElementById('analytics'); if (checkbox) checkbox.checked = result.analytics;
    const banner = document.getElementById('cookie-banner'); if (saved) banner?.classList.add('hidden');
    return result;
  }
  window.GyeongdongmktConsent = { read, save };
  apply();
  const checkbox = document.getElementById('analytics'); if (checkbox) checkbox.checked = read().analytics;
  if (!read().decided) document.getElementById('cookie-banner')?.classList.remove('hidden');
  document.querySelectorAll('[data-cookie-accept]').forEach(node => node.addEventListener('click', () => save(true)));
  document.querySelectorAll('[data-cookie-reject]').forEach(node => node.addEventListener('click', () => save(false)));
  document.getElementById('cookie-settings')?.addEventListener('submit', event => { event.preventDefault(); save(checkbox?.checked === true); });
  window.addEventListener('storage', apply);
})();
