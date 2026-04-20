/**
 * BDS i18n engine.
 *
 * Depends on window.BDS_LANGS (loaded from js/langs.js) — shape:
 *   { en: { "key": "value", ... }, ko: {...}, ja: {...} }
 *
 * Markup contract:
 *   <el data-i18n="key">               text content replaced
 *   <el data-i18n-html="key">          innerHTML replaced (use only for trusted authored content)
 *   <el data-i18n-attr="attr:key;...">  one or more attributes replaced
 *
 * Elements without any data-i18n* attribute are left untouched — this is how brand
 * terms (BDS, Beyond Dream Scholars, Dream Beyond Dream) and nav labels stay fixed.
 *
 * Public API: window.BDS_I18N = { t, setLang, getLang }, window.t alias.
 * Event: window dispatches 'bds:langchange' with { detail: { lang } } on change.
 */
(function () {
  'use strict';

  var SUPPORTED = ['en', 'ko', 'ja', 'de'];
  var DEFAULT_LANG = 'en';
  var STORAGE_KEY = 'bds_lang';
  var current = DEFAULT_LANG;

  function detect() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) { /* localStorage blocked */ }
    var nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    if (nav.indexOf('ko') === 0) return 'ko';
    if (nav.indexOf('ja') === 0) return 'ja';
    if (nav.indexOf('de') === 0) return 'de';
    return DEFAULT_LANG;
  }

  function dict(lang) {
    return (window.BDS_LANGS && window.BDS_LANGS[lang]) || {};
  }

  function t(key, fallback) {
    var d = dict(current);
    if (d[key] != null) return d[key];
    var en = dict('en');
    if (en[key] != null) return en[key];
    return fallback != null ? fallback : key;
  }

  function apply(root) {
    root = root || document;

    var textEls = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < textEls.length; i++) {
      var el = textEls[i];
      var key = el.getAttribute('data-i18n');
      var val = t(key, null);
      if (val != null) el.textContent = val;
    }

    var htmlEls = root.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlEls.length; j++) {
      var hEl = htmlEls[j];
      var hKey = hEl.getAttribute('data-i18n-html');
      var hVal = t(hKey, null);
      if (hVal != null) hEl.innerHTML = hVal;
    }

    var attrEls = root.querySelectorAll('[data-i18n-attr]');
    for (var k = 0; k < attrEls.length; k++) {
      var aEl = attrEls[k];
      var spec = aEl.getAttribute('data-i18n-attr') || '';
      var pairs = spec.split(';');
      for (var p = 0; p < pairs.length; p++) {
        var pair = pairs[p].trim();
        if (!pair) continue;
        var colon = pair.indexOf(':');
        if (colon < 0) continue;
        var attr = pair.slice(0, colon).trim();
        var aKey = pair.slice(colon + 1).trim();
        if (!attr || !aKey) continue;
        var aVal = t(aKey, null);
        if (aVal != null) aEl.setAttribute(attr, aVal);
      }
    }

    if (document.documentElement) {
      document.documentElement.setAttribute('lang', current);
    }
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    current = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    apply();
    renderDropdownState();
    try {
      window.dispatchEvent(new CustomEvent('bds:langchange', { detail: { lang: lang } }));
    } catch (e) {
      var ev = document.createEvent('CustomEvent');
      ev.initCustomEvent('bds:langchange', false, false, { lang: lang });
      window.dispatchEvent(ev);
    }
  }

  function getLang() { return current; }

  function renderDropdownState() {
    var dropdowns = document.querySelectorAll('.lang-dropdown');
    for (var i = 0; i < dropdowns.length; i++) {
      var dd = dropdowns[i];
      var label = dd.querySelector('.lang-dropdown-current');
      if (label) label.textContent = current.toUpperCase();
      var opts = dd.querySelectorAll('.lang-dropdown-option');
      for (var j = 0; j < opts.length; j++) {
        opts[j].classList.toggle('active', opts[j].getAttribute('data-lang') === current);
        opts[j].setAttribute('aria-selected', opts[j].getAttribute('data-lang') === current ? 'true' : 'false');
      }
    }
  }

  function wireDropdowns() {
    var dropdowns = document.querySelectorAll('.lang-dropdown');
    for (var i = 0; i < dropdowns.length; i++) {
      (function (dd) {
        var toggle = dd.querySelector('.lang-dropdown-toggle');
        if (toggle) {
          toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            var wasOpen = dd.classList.contains('open');
            var all = document.querySelectorAll('.lang-dropdown.open');
            for (var a = 0; a < all.length; a++) all[a].classList.remove('open');
            if (!wasOpen) dd.classList.add('open');
          });
        }
        var opts = dd.querySelectorAll('.lang-dropdown-option');
        for (var k = 0; k < opts.length; k++) {
          opts[k].addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var lang = this.getAttribute('data-lang');
            if (lang) setLang(lang);
            dd.classList.remove('open');
          });
        }
      })(dropdowns[i]);
    }
    document.addEventListener('click', function () {
      var open = document.querySelectorAll('.lang-dropdown.open');
      for (var o = 0; o < open.length; o++) open[o].classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var open = document.querySelectorAll('.lang-dropdown.open');
        for (var o = 0; o < open.length; o++) open[o].classList.remove('open');
      }
    });
  }

  function init() {
    current = detect();
    apply();
    wireDropdowns();
    renderDropdownState();
  }

  window.BDS_I18N = { t: t, setLang: setLang, getLang: getLang, apply: apply };
  window.t = t;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
