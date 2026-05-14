/**
 * BDS Auth Client — 브라우저에서 사용하는 인증 유틸
 * 세션 토큰은 localStorage('bds_token')에 저장
 */
(function (global) {
  'use strict';

  const TOKEN_KEY = 'bds_token';
  const USER_KEY  = 'bds_user';

  function save(token, user) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (_) {}
  }

  function clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (_) {}
  }

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function isAdmin() {
    const u = getUser();
    return u && u.role === 'admin';
  }

  /** 보호된 페이지 상단에 호출. 비로그인 시 auth.html로 리다이렉트 */
  function requireLogin(redirectTo) {
    if (!isLoggedIn()) {
      const target = redirectTo || 'auth.html';
      const back = encodeURIComponent(location.href);
      location.replace(`${target}?next=${back}`);
      return false;
    }
    return true;
  }

  /** 관리자 전용 페이지 상단에 호출 */
  function requireAdmin(redirectTo) {
    if (!isLoggedIn()) {
      requireLogin(redirectTo);
      return false;
    }
    if (!isAdmin()) {
      location.replace('index.html');
      return false;
    }
    return true;
  }

  /**
   * 서버에 세션 유효성 확인 (선택적 — 더 강한 검증)
   * 만료 또는 서버 삭제 시 자동 로그아웃
   */
  async function verify() {
    const token = getToken();
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const user = await res.json();
        save(token, user); // 최신 정보 갱신
        return user;
      } else {
        clear();
        return null;
      }
    } catch (_) {
      return null; // 네트워크 오류 → 캐시된 사용자 반환
    }
  }

  async function signup(name, email, password) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '회원가입 실패');
    save(data.token, data.user);
    return data.user;
  }

  async function login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '로그인 실패');
    save(data.token, data.user);
    return data.user;
  }

  async function logout() {
    const token = getToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (_) {}
    }
    clear();
  }

  async function updateProfile(name, currentPassword, newPassword) {
    const token = getToken();
    const body = { name };
    if (newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword; }
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '프로필 업데이트 실패');
    // 로컬 사용자 캐시 이름 갱신
    const u = getUser();
    if (u) save(token, { ...u, name });
    return data;
  }

  async function authFetch(url, options = {}) {
    const token = getToken();
    const headers = { ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (options.body && typeof options.body === 'object') {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }
    return fetch(url, { ...options, headers });
  }

  global.BDS_AUTH = {
    getToken, getUser, isLoggedIn, isAdmin,
    requireLogin, requireAdmin,
    verify, signup, login, logout,
    updateProfile, authFetch,
  };

})(window);
