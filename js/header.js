/**
 * BDS Unified Site Header
 * Inject once via <script src="js/header.js"></script> in <head>.
 * Set the active section on <body data-bds-page="academics|campus|news|archive">.
 * Works with the existing BDS_I18N / BDS_AUTH stack.
 */
(function () {
  'use strict';

  /* ── CSS ──────────────────────────────────────────────── */
  var CSS = [
    '.bds-header{background:#fff;border-bottom:1px solid #e2d9d9;position:sticky;top:0;z-index:1000;}',
    '.bds-header-inner{max-width:1400px;margin:0 auto;padding:0 40px;height:68px;display:flex;align-items:center;}',
    '.bds-logo{display:flex;flex-direction:column;gap:2px;text-decoration:none;flex-shrink:0;}',
    '.bds-logo-mark{font-family:"Merriweather",Georgia,serif;font-size:1.18rem;font-weight:700;color:#A51C30;line-height:1;letter-spacing:.04em;}',
    '.bds-logo-sub{font-size:.56rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#7c6b6e;line-height:1;}',
    '.bds-nav{display:flex;align-items:stretch;margin-left:32px;}',
    '.bds-nav-link{position:relative;padding:0 16px;height:68px;display:flex;align-items:center;text-decoration:none;',
    '  font-family:"Inter",system-ui,sans-serif;font-size:.84rem;font-weight:500;color:#3a2b2d;',
    '  transition:color .12s,background .12s;white-space:nowrap;}',
    '.bds-nav-link::after{content:"";position:absolute;bottom:-1px;left:16px;right:16px;height:2px;',
    '  background:#A51C30;transform:scaleX(0);transform-origin:left;transition:transform .15s ease;}',
    '.bds-nav-link:hover{color:#A51C30;background:#fdf4f5;}',
    '.bds-nav-link.bds-active{color:#A51C30;font-weight:600;}',
    '.bds-nav-link.bds-active::after{transform:scaleX(1);}',
    '.bds-header-spacer{flex:1;}',
    '.bds-header-actions{display:flex;align-items:center;gap:8px;flex-shrink:0;}',
    '.bds-lang-dropdown{position:relative;}',
    '.bds-lang-toggle{display:flex;align-items:center;gap:4px;padding:6px 10px;',
    '  font-size:.76rem;font-weight:500;font-family:"Inter",sans-serif;',
    '  background:transparent;border:1px solid #e2d9d9;border-radius:5px;color:#3a2b2d;',
    '  cursor:pointer;white-space:nowrap;transition:border-color .12s,color .12s;}',
    '.bds-lang-toggle:hover{border-color:#A51C30;color:#A51C30;}',
    '.bds-lang-arrow{font-size:.6rem;opacity:.5;transition:transform .15s;display:inline-block;}',
    '.bds-lang-dropdown.open .bds-lang-arrow{transform:rotate(180deg);}',
    '.bds-lang-menu{position:absolute;top:calc(100% + 6px);right:0;background:#fff;',
    '  border:1px solid #e2d9d9;border-radius:5px;box-shadow:0 4px 16px rgba(19,16,16,.10);',
    '  display:none;min-width:120px;z-index:1100;}',
    '.bds-lang-dropdown.open .bds-lang-menu{display:block;}',
    '.bds-lang-option{display:block;width:100%;padding:9px 14px;',
    '  font-size:.78rem;font-weight:400;font-family:"Inter",sans-serif;',
    '  background:none;border:none;color:#3a2b2d;cursor:pointer;text-align:left;transition:background .1s;}',
    '.bds-lang-option:hover{background:#fdf4f5;}',
    '.bds-lang-option.bds-lang-active{color:#A51C30;font-weight:600;}',
    '.bds-lang-option+.bds-lang-option{border-top:1px solid #f0e8e9;}',
    '.bds-auth-btn{padding:7px 18px;font-size:.82rem;font-weight:600;font-family:"Inter",sans-serif;',
    '  background:#A51C30;color:#fff;border:1px solid transparent;border-radius:5px;',
    '  cursor:pointer;text-decoration:none;white-space:nowrap;transition:background .12s;',
    '  display:inline-flex;align-items:center;}',
    '.bds-auth-btn:hover{background:#881525;}',
    '.bds-auth-btn.bds-portal{background:transparent;border-color:#e2d9d9;color:#3a2b2d;}',
    '.bds-auth-btn.bds-portal:hover{border-color:#A51C30;color:#A51C30;background:#fdf4f5;}',
    '.bds-hamburger{display:none;flex-direction:column;justify-content:center;align-items:center;',
    '  gap:5px;width:38px;height:38px;background:transparent;border:1px solid #e2d9d9;',
    '  border-radius:5px;cursor:pointer;padding:0;flex-shrink:0;}',
    '.bds-hamburger span{display:block;width:18px;height:1.5px;background:#3a2b2d;border-radius:2px;}',
    '.bds-mobile-menu{display:none;border-top:1px solid #e2d9d9;padding:4px 24px 20px;background:#fff;}',
    '.bds-mobile-menu.open{display:block;}',
    '.bds-mobile-link{display:block;padding:13px 0;font-family:"Inter",sans-serif;font-size:.93rem;',
    '  font-weight:500;color:#3a2b2d;text-decoration:none;border-bottom:1px solid #e2d9d9;transition:color .12s;}',
    '.bds-mobile-link:last-of-type{border-bottom:none;}',
    '.bds-mobile-link:hover,.bds-mobile-link.bds-active{color:#A51C30;}',
    '.bds-mobile-auth{display:block;padding:12px 0;font-family:"Inter",sans-serif;',
    '  font-size:.9rem;font-weight:600;color:#A51C30;text-decoration:none;}',
    '.bds-mobile-langs{display:flex;gap:6px;margin-top:16px;flex-wrap:wrap;}',
    '.bds-mobile-lang{padding:5px 12px;font-size:.73rem;font-weight:500;font-family:"Inter",sans-serif;',
    '  border:1px solid #e2d9d9;border-radius:99px;background:transparent;color:#7c6b6e;cursor:pointer;transition:all .12s;}',
    '.bds-mobile-lang.bds-lang-active{background:#A51C30;color:#fff;border-color:#A51C30;}',
    '@media(max-width:768px){',
    '  .bds-nav{display:none;}',
    '  .bds-lang-dropdown{display:none;}',
    '  .bds-auth-btn{display:none;}',
    '  .bds-hamburger{display:flex;}',
    '  .bds-header-inner{padding:0 20px;}',
    '}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.id = 'bds-header-css';
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* ── State ────────────────────────────────────────────── */
  var LANG_KEY = 'bds_lang';
  var page = (document.body && document.body.dataset.bdsPage) || '';
  var isLoggedIn = false;
  try { isLoggedIn = !!localStorage.getItem('bds_token'); } catch (_) {}
  var currentLang = 'en';
  try { currentLang = localStorage.getItem(LANG_KEY) || 'en'; } catch (_) {}

  var langLabels  = { en: 'EN', ko: '한국어', ja: '日本語', de: 'DE' };
  var langFull    = { en: 'English', ko: '한국어', ja: '日本語', de: 'Deutsch' };

  /* ── Nav items ────────────────────────────────────────── */
  var NAV = [
    { key: 'academics', href: 'academics.html',        label: 'Academics' },
    { key: 'campus',    href: 'ongdalsam.html',         label: 'Campus'    },
    { key: 'news',      href: 'blog.html',              label: 'News'      },
    { key: 'archive',   href: 'library.html',           label: 'Archive'   },
  ];

  function navLinkHTML(item, mobile) {
    var active = item.key === page ? ' bds-active' : '';
    var cls = mobile ? 'bds-mobile-link' : 'bds-nav-link';
    return '<a href="' + item.href + '" class="' + cls + active + '">' + item.label + '</a>';
  }

  function langOptionHTML(l) {
    var active = l === currentLang ? ' bds-lang-active' : '';
    return '<button type="button" class="bds-lang-option' + active + '" data-bds-lang="' + l + '">' + langFull[l] + '</button>';
  }

  function mobileLangHTML(l) {
    var active = l === currentLang ? ' bds-lang-active' : '';
    return '<button type="button" class="bds-mobile-lang' + active + '" data-bds-lang="' + l + '">' + langLabels[l] + '</button>';
  }

  var langs = ['en', 'ko', 'ja', 'de'];
  var authHref  = isLoggedIn ? 'dashboard.html' : 'auth.html';
  var authLabel = isLoggedIn ? 'Portal' : 'Log In';
  var authClass = isLoggedIn ? ' bds-portal' : '';

  /* ── Build HTML ───────────────────────────────────────── */
  var html = [
    '<div class="bds-header-inner">',
    '  <a class="bds-logo" href="index.html">',
    '    <span class="bds-logo-mark">BDS</span>',
    '    <span class="bds-logo-sub">Beyond Dream Scholars</span>',
    '  </a>',
    '  <nav class="bds-nav" aria-label="Site navigation">',
    NAV.map(function (n) { return navLinkHTML(n, false); }).join(''),
    '  </nav>',
    '  <div class="bds-header-spacer"></div>',
    '  <div class="bds-header-actions">',
    '    <div class="bds-lang-dropdown" id="bdsLangDropdown">',
    '      <button type="button" class="bds-lang-toggle" id="bdsLangToggle" aria-haspopup="listbox" aria-expanded="false">',
    '        <span class="bds-lang-current">' + (langLabels[currentLang] || 'EN') + '</span>',
    '        <span class="bds-lang-arrow">&#9660;</span>',
    '      </button>',
    '      <div class="bds-lang-menu" id="bdsLangMenu" role="listbox">',
    langs.map(langOptionHTML).join(''),
    '      </div>',
    '    </div>',
    '    <a href="' + authHref + '" class="bds-auth-btn' + authClass + '" id="bdsAuthBtn">' + authLabel + '</a>',
    '    <button type="button" class="bds-hamburger" id="bdsHamburger" aria-label="Menu" aria-expanded="false">',
    '      <span></span><span></span><span></span>',
    '    </button>',
    '  </div>',
    '</div>',
    '<div class="bds-mobile-menu" id="bdsMobileMenu" role="navigation" aria-label="Mobile navigation">',
    NAV.map(function (n) { return navLinkHTML(n, true); }).join(''),
    '  <a href="' + authHref + '" class="bds-mobile-auth">' + authLabel + '</a>',
    '  <div class="bds-mobile-langs">',
    langs.map(mobileLangHTML).join(''),
    '  </div>',
    '</div>'
  ].join('');

  /* ── Insert header ────────────────────────────────────── */
  function insert() {
    var headerEl = document.querySelector('header[data-bds-nav]');
    if (!headerEl) {
      headerEl = document.createElement('header');
      headerEl.setAttribute('data-bds-nav', '');
      document.body.insertBefore(headerEl, document.body.firstChild);
    }
    headerEl.className = 'bds-header';
    headerEl.innerHTML = html;
    wire();
  }

  /* ── Lang switch ──────────────────────────────────────── */
  function switchLang(lang) {
    if (!lang) return;
    try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
    // Delegate to i18n engine if present (handles data-i18n attrs + event)
    if (window.BDS_I18N && typeof window.BDS_I18N.setLang === 'function') {
      window.BDS_I18N.setLang(lang);
    }
    // Update our own header UI
    var cur = document.querySelector('.bds-lang-current');
    if (cur) cur.textContent = langLabels[lang] || 'EN';
    document.querySelectorAll('[data-bds-lang]').forEach(function (btn) {
      btn.classList.toggle('bds-lang-active', btn.dataset.bdsLang === lang);
    });
    var dd = document.getElementById('bdsLangDropdown');
    if (dd) dd.classList.remove('open');
  }

  /* ── Wire events ──────────────────────────────────────── */
  function wire() {
    // Mobile menu
    var hamburger = document.getElementById('bdsHamburger');
    var mobileMenu = document.getElementById('bdsMobileMenu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function () {
        var open = mobileMenu.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    // Lang dropdown toggle
    var langToggle = document.getElementById('bdsLangToggle');
    var langDd = document.getElementById('bdsLangDropdown');
    if (langToggle && langDd) {
      langToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = langDd.classList.toggle('open');
        langToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }

    // Close lang dropdown on outside click
    document.addEventListener('click', function (e) {
      var dd = document.getElementById('bdsLangDropdown');
      if (dd && !dd.contains(e.target)) {
        dd.classList.remove('open');
        var t = document.getElementById('bdsLangToggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });

    // Lang option clicks (desktop + mobile)
    document.querySelectorAll('[data-bds-lang]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        switchLang(this.dataset.bdsLang);
      });
    });
  }

  /* ── Init ─────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insert);
  } else {
    insert();
  }
})();
